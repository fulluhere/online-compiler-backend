import path from "path";
import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

const PYTHON_IMAGE = "docode-python";

// Per HLD Section 5.1: Python time limit = 5s
export const executePython = async (jobDir, filepath, input) => {
  const sourceFile = path.basename(filepath); // "main.py"

  const runResult = await runCommand({
    cmd: "python3",
    args: [sourceFile],
    cwd: jobDir,
    input,
    timeoutMs: 5000,
    image: PYTHON_IMAGE,
  });

  return classifyRunResult(runResult);
};