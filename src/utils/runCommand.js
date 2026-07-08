import { spawn } from "child_process";

/**
 * NOTE: When Docker sandboxing is added, this function is the only place
 * that needs to change — replace `spawn(cmd, args, opts)` with
 * `spawn("docker", ["run", "--rm", "--network=none", "--memory=256m",
 * "--cpus=0.5", ...])`.
 */
export const runCommand = ({ cmd, args = [], cwd, input = "", timeoutMs = 5000 }) => {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(cmd, args, { cwd });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + err.message,
        exitCode: -1,
        timedOut: false,
        runtimeMs: Date.now() - startedAt,
      });
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode,
        timedOut,
        runtimeMs: Date.now() - startedAt,
      });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
};