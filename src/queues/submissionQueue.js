import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const submissionQueue = new Queue("submission-queue", {
  connection: redisConnection,
});

export const addSubmissionJob = async (submissionId) => {
  await submissionQueue.add("judge", { submissionId });
};