import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

// Per HLD Section 5.1: Python time limit = 5s
export const executePython = async (jobDir, filepath, input) => {
  const runResult = await runCommand({
    cmd: "python3",
    args: [filepath],
    cwd: jobDir,
    input,
    timeoutMs: 5000,
  });

  return classifyRunResult(runResult);
};