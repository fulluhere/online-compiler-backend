import "dotenv/config";
import { Worker } from "bullmq";
import { connectDB } from "./config/db.js";
import { redisConnection } from "./config/redis.js";
import Submission from "./models/Submission.js";
import { judgeSubmission } from "./services/judge.js";

const CONCURRENCY = 5;

const start = async () => {
  await connectDB();

  const worker = new Worker(
    "submission-queue",
    async (job) => {
      const { submissionId } = job.data;
      const submission = await Submission.findById(submissionId);

      if (!submission) {
        throw new Error(`Submission ${submissionId} not found`);
      }

      submission.startedAt = new Date();
      await submission.save();

      const result = await judgeSubmission({
        language: submission.language,
        code: submission.code,
        testCases: submission.testCases,
      });

      submission.verdict = result.verdict;
      submission.runtime = result.runtime;
      submission.output = result.output;
      submission.errorMessage = result.errorMessage;
      submission.testCasesPassed = result.testCasesPassed;
      submission.completedAt = new Date();
      await submission.save();

      return result.verdict;
    },
    { connection: redisConnection, concurrency: CONCURRENCY }
  );

  worker.on("completed", (job, verdict) => {
    console.log(`Job ${job.id} → ${verdict}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log("Worker started, waiting for jobs...");
};

start();