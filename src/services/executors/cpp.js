import path from "path";
import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

// Per HLD Section 5.1: C++ time limit = 2s
export const executeCpp = async (jobDir, filepath, input) => {
  const binaryPath = path.join(jobDir, "main.out");

  const compileResult = await runCommand({
    cmd: "g++",
    args: ["-O2", filepath, "-o", binaryPath],
    cwd: jobDir,
    timeoutMs: 10000,
  });

  if (compileResult.exitCode !== 0) {
    return {
      verdict: "CE",
      stdout: "",
      stderr: compileResult.stderr,
      runtimeMs: 0,
    };
  }

  const runResult = await runCommand({
    cmd: binaryPath,
    args: [],
    cwd: jobDir,
    input,
    timeoutMs: 2000,
  });

  return classifyRunResult(runResult);
};