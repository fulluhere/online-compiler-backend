import path from "path";
import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

const CPP_IMAGE = "docode-cpp";

// Per HLD Section 5.1: C++ time limit = 2s
export const executeCpp = async (jobDir, filepath, input) => {
  const sourceFile = path.basename(filepath); // e.g. "main.cpp" — relative to /box in container
  const binaryFile = "main.out";               // relative to /box too

  const compileResult = await runCommand({
    cmd: "g++",
    args: ["-O2", sourceFile, "-o", binaryFile],
    cwd: jobDir,
    timeoutMs: 10000,
    image: CPP_IMAGE,
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
    cmd: `./${binaryFile}`, // relative execution inside /box
    args: [],
    cwd: jobDir,
    input,
    timeoutMs: 2000,
    image: CPP_IMAGE,
  });

  return classifyRunResult(runResult);
};