import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const submissionsRoot = path.join(__dirname, "..", "..", "submissions");

// Java MUST be Main.java to match "public class Main" — sidesteps the
// UUID-as-classname problem entirely, since every job gets its own folder.
const ENTRY_FILENAME = {
  cpp: "main.cpp",
  python: "main.py",
  javascript: "main.js",
  java: "Main.java",
};

export const createJobWorkspace = async (language, code) => {
  const jobId = uuid();
  const jobDir = path.join(submissionsRoot, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  const filename = ENTRY_FILENAME[language];
  if (!filename) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const codeToWrite =
    language === "java" ? sanitizeJavaClassName(code) : code;

  const filepath = path.join(jobDir, filename);
  await fs.writeFile(filepath, codeToWrite);

  return { jobId, jobDir, filepath };
};

const sanitizeJavaClassName = (code) => {
  return code.replace(/public\s+class\s+\w+/, "public class Main");
};

export const cleanupJobWorkspace = async (jobDir) => {
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Cleanup failed for", jobDir, err.message);
  }
};