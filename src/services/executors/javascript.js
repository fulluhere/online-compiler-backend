import path from "path";
import { runCommand } from "../../utils/runCommand.js";
import { classifyRunResult } from "../../utils/classifyRunResult.js";

const JAVASCRIPT_IMAGE = "docode-javascript";

// Per HLD Section 5.1: JavaScript time limit = 5s
export const executeJavascript = async (jobDir, filepath, input) => {
  const sourceFile = path.basename(filepath); // "main.js"

  const runResult = await runCommand({
    cmd: "node",
    args: [sourceFile],
    cwd: jobDir,
    input,
    timeoutMs: 5000,
    image: JAVASCRIPT_IMAGE,
  });

  return classifyRunResult(runResult);
};