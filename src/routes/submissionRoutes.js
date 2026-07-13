import { Router } from "express";
import { createSubmission, getSubmission, getMySubmissions, runCode } from "../controllers/submissionController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";



const router = Router();

router.post("/run", verifyToken, runCode);
router.post("/submissions", verifyToken, createSubmission);
router.get("/submissions", verifyToken, getMySubmissions);
router.get("/submissions/:id", verifyToken, getSubmission);

export default router;