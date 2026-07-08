import Submission from "../models/Submission.js";
import { addSubmissionJob } from "../queues/submissionQueue.js";
import { runOnce } from "../services/judge.js";

const SUPPORTED_LANGUAGES = ["cpp", "python", "java", "javascript"];

/**
 * POST /api/submissions
 * Full judge flow: queues the job, worker picks it up async. HLD Section 4.2.
 */
export const createSubmission = async (req, res) => {
  const { language, code, testCases = [], problemID } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "code is required" });
  }
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ success: false, error: `language must be one of ${SUPPORTED_LANGUAGES.join(", ")}` });
  }

  const submission = await Submission.create({
    language,
    code,
    testCases,
    problemID: problemID || undefined,
    testCasesTotal: testCases.length,
  });

  await addSubmissionJob(submission._id.toString());

  res.status(201).json({ success: true, submissionId: submission._id });
};

/**
 * GET /api/submissions/:id
 * Poll for verdict. HLD Section 4.1.
 */
export const getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({ success: false, error: "submission not found" });
  }

  res.status(200).json({ success: true, submission });
};

/**
 * POST /api/run
 * Quick run with custom input, no DB persistence, synchronous response.
 * HLD Section 4.1 — separate from full judging.
 */
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
      verdict: result.verdict || "RAN", // CE / TLE / RE, or "RAN" if it executed fine
      runtime: result.runtime,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};