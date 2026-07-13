// online-compiler/src/utils/runCommand.js
import { spawn } from "child_process";

const RESOURCE_LIMITS = ["--network=none", "--memory=256m", "--cpus=0.5"];
const CONTAINER_WORKDIR = "/box";

export const runCommand = ({ cmd, args = [], cwd, input = "", timeoutMs = 5000, image }) => {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const dockerArgs = [
      "run",
      "--rm",
      ...RESOURCE_LIMITS,
      "-v", `${cwd}:${CONTAINER_WORKDIR}`,
      "-w", CONTAINER_WORKDIR,
      "-i",
      image,
      cmd,
      ...args,
    ];

    const child = spawn("docker", dockerArgs);

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

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

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
};