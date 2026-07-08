export const classifyRunResult = (runResult) => {
  if (runResult.timedOut) {
    return { verdict: "TLE", stdout: runResult.stdout, stderr: "", runtimeMs: runResult.runtimeMs };
  }
  if (runResult.exitCode !== 0) {
    return {
      verdict: "RE",
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      runtimeMs: runResult.runtimeMs,
    };
  }
  return { verdict: null, stdout: runResult.stdout, stderr: "", runtimeMs: runResult.runtimeMs };
};