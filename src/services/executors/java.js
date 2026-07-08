import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

// Per HLD Section 5.1: Java time limit = 5s
// filepath is guaranteed to be Main.java (see fileManager.js sanitizeJavaClassName)
export const executeJava = async (jobDir, filepath, input) => {
  const compileResult = await runCommand({
    cmd: "javac",
    args: [filepath],
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
    cmd: "java",
    args: ["-cp", jobDir, "Main"],
    cwd: jobDir,
    input,
    timeoutMs: 5000,
  });

  return classifyRunResult(runResult);
};