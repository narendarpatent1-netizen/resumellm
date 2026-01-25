import { Router } from "express";
import requireAuth from '../middleware/jwt.middleware';
import upload from "../middleware/upload";
import interviewController from "../controllers/interview.controller";
import { historySchema, QuestionSchema, answerSchema } from "../validation/interview.validation";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/upload", [upload.single("resume"), requireAuth], interviewController.uploadFile);
router.get('/history', [requireAuth, validate(historySchema)], interviewController.history);
router.post("/question", [requireAuth, validate(QuestionSchema)], interviewController.question);
router.post("/answer", [requireAuth, validate(answerSchema)], interviewController.answer);
router.post("/fetchResult", requireAuth, interviewController.fetchResult);
export default router;
