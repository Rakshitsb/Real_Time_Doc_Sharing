import asyncHandler from "../utils/asyncHandler.js";
import sendSuccess from "../utils/sendResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { loginUser, registerUser } from "../services/auth.service.js";

const handleSignUp = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  sendSuccess(res, result, HTTP_STATUS.CREATED);
});

const handleSignIn = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  sendSuccess(res, result, HTTP_STATUS.OK);
});

export { handleSignIn, handleSignUp };
