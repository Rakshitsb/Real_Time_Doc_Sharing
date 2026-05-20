import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const createToken = (user) =>
  jwt.sign({ email: user.email, _id: user._id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "User already exists, you can login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });

  return { message: "Signup successfully", success: true };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  const errorMessage = "Auth failed email or password is wrong";

  if (!user) {
    throw new ApiError(403, errorMessage);
  }

  const isBcryptHash = user.password.startsWith("$2");
  const isPasswordValid = isBcryptHash
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!isPasswordValid) {
    throw new ApiError(403, errorMessage);
  }

  // Existing first-year records may contain plaintext passwords. Upgrade after a successful login.
  if (!isBcryptHash) {
    user.password = await bcrypt.hash(password, 10);
    await user.save();
  }

  return {
    message: "Login Success",
    success: true,
    token: createToken(user),
    email: user.email,
    name: user.name,
  };
};

export { loginUser, registerUser };
