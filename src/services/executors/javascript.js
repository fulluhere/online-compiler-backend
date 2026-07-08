import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

// Per HLD Section 5.1: JavaScript time limit = 5s
export const executeJavascript = async (jobDir, filepath, input) => {
  const runResult = await runCommand({
    cmd: "node",
    args: [filepath],
    cwd: jobDir,
    input,
    timeoutMs: 5000,
  });

  return classifyRunResult(runResult);
};