import { Router } from "express";
import userController from "../controllers/user.controller";
import { loginSchema } from "../validation/user.validation";
import { validate } from "../middleware/validate";

const router = Router();
// const upload = multer({ dest: "uploads/" });

router.post("/login", validate(loginSchema), userController.login);

router.post('/refresh', userController.refreshToken);

router.post("/register", userController.register);

export default router;
