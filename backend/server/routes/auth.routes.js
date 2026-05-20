import express from "express";
import { handleSignIn, handleSignUp } from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";

const authRouter = express.Router();

authRouter.post("/register", validateRequest(signupSchema), handleSignUp);
authRouter.post("/login", validateRequest(loginSchema), handleSignIn);

export default authRouter;
