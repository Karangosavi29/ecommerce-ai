import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired", [], "TOKEN_EXPIRED");
    }
    throw new ApiError(401, "Invalid access token", [], "TOKEN_INVALID");
  }

  const user = await userRepository.findByIdSafe(decoded._id);
  if (!user) {
    throw new ApiError(401, "Invalid access token", [], "TOKEN_INVALID");
  }

  req.user = user;
  next();
});

export const adminOnly = asyncHandler(async (req, _res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
  next();
});
