
// C:\Users\gicsc\docode\online-compiler\src\controllers\submissionController.js
import Submission from "../models/Submission.js";
import problemModel from "../models/problem.model.js";
import { addSubmissionJob } from "../queues/submissionQueue.js";
import { runOnce } from "../services/judge.js";

const SUPPORTED_LANGUAGES = ["cpp", "python", "java", "javascript"];

/**
 * POST /api/submissions
 * Full judge flow: queues the job, worker picks it up async. HLD Section 4.2.
 */
export const createSubmission = async (req, res) => {
  const { language, code, problemId } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "code is required" });
  }
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ success: false, error: `language must be one of ${SUPPORTED_LANGUAGES.join(", ")}` });
  }
  if (!problemId) {
    return res.status(400).json({ success: false, error: "problemId is required" });
  }

  const problem = await problemModel.findById(problemId);
  if (!problem) {
    return res.status(404).json({ success: false, error: "Problem not found" });
  }
  if (!problem.testCases || problem.testCases.length === 0) {
    return res.status(400).json({ success: false, error: "No test cases found for this problem" });
  }

  const submission = await Submission.create({
    userID: req.user?.id,
    language,
    code,
    testCases: problem.testCases,
    problemID: problemId,
    testCasesTotal: problem.testCases.length,
  });

  await addSubmissionJob(submission._id.toString());

  res.status(201).json({ success: true, submissionId: submission._id });
};

export const getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({ success: false, error: "submission not found" });
  }

  res.status(200).json({ success: true, submission });
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userID: req.user.id })
      .select("problemID language verdict runtime createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const runCode = async (req, res) => {
  const { language, code, input = "" } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "code is required" });
  }
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ success: false, error: `language must be one of ${SUPPORTED_LANGUAGES.join(", ")}` });
  }

  try {
    const result = await runOnce({ language, code, input });

    res.status(200).json({
      success: true,
      output: result.output,
      errorMessage: result.errorMessage,
      verdict: result.verdict || "RAN",
      runtime: result.runtime,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};