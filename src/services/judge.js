import { createJobWorkspace, cleanupJobWorkspace } from "../utils/fileManager.js";
import { executeCpp } from "./executors/cpp.js";
import { executePython } from "./executors/python.js";
import { executeJavascript } from "./executors/javascript.js";
import { executeJava } from "./executors/java.js";

const EXECUTORS = {
  cpp: executeCpp,
  python: executePython,
  javascript: executeJavascript,
  java: executeJava,
};

/** Normalizes output for comparison: trims trailing whitespace/newlines per line. */
const normalize = (str = "") =>
  str
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

/**
 * Runs code once with a given stdin input, no comparison against expected
 * output. Used for the plain "run" feature (HLD /api/run), not judging.
 */
export const runOnce = async ({ language, code, input = "" }) => {
  const executor = EXECUTORS[language];
  if (!executor) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const { jobDir, filepath } = await createJobWorkspace(language, code);

  try {
    const result = await executor(jobDir, filepath, input);
    return {
      verdict: result.verdict, // null | "CE" | "TLE" | "RE"
      runtime: result.runtimeMs,
      output: result.stdout,
      errorMessage: result.stderr || "",
    };
  } finally {
    await cleanupJobWorkspace(jobDir);
  }
};

/**
 * Runs one submission against zero or more test cases.
 * If testCases is empty, this behaves like a plain "run" (HLD /api/run) —
 * verdict stays null and stdout/stderr are returned directly.
 *
 * Returns: { verdict, runtime, output, errorMessage, testCasesPassed, testCasesTotal }
 */
export const judgeSubmission = async ({ language, code, testCases = [] }) => {
  const executor = EXECUTORS[language];
  if (!executor) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const { jobDir, filepath } = await createJobWorkspace(language, code);

  try {
    // No test cases: just compile + run once with no input (plain "run" mode)
    if (testCases.length === 0) {
      const result = await executor(jobDir, filepath, "");
      return {
        verdict: result.verdict || "AC", // no expected output to compare against
        runtime: result.runtimeMs,
        output: result.stdout,
        errorMessage: result.stderr || "",
        testCasesPassed: result.verdict ? 0 : 1,
        testCasesTotal: 1,
      };
    }

    let maxRuntime = 0;
    let passed = 0;

    for (const testCase of testCases) {
      const result = await executor(jobDir, filepath, testCase.input);
      maxRuntime = Math.max(maxRuntime, result.runtimeMs);

      // CE/TLE/RE short-circuit immediately — no point running remaining test cases
      if (result.verdict) {
        return {
          verdict: result.verdict,
          runtime: maxRuntime,
          output: result.stdout,
          errorMessage: result.stderr,
          testCasesPassed: passed,
          testCasesTotal: testCases.length,
        };
      }

      // Program ran fine — now compare output (WA check)
      if (normalize(result.stdout) !== normalize(testCase.expectedOutput)) {
        return {
          verdict: "WA",
          runtime: maxRuntime,
          output: result.stdout,
          errorMessage: "",
          testCasesPassed: passed,
          testCasesTotal: testCases.length,
        };
      }

      passed += 1;
    }

    // All test cases passed
    return {
      verdict: "AC",
      runtime: maxRuntime,
      output: "",
      errorMessage: "",
      testCasesPassed: passed,
      testCasesTotal: testCases.length,
    };
  } finally {
    await cleanupJobWorkspace(jobDir);
  }
};