import { Router } from "express";
import { createSubmission, getSubmission, runCode } from "../controllers/submissionController.js";

const router = Router();

// HLD Section 4.1
router.post("/run", runCode);
router.post("/submissions", createSubmission);
router.get("/submissions/:id", getSubmission);

export default router;