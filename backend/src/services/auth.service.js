import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { hashToken } from "../utils/hashToken.js";

const generateAndStoreTokens = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(500, "Something went wrong while generating tokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await userRepository.setRefreshTokenHash(userId, hashToken(refreshToken));

    return { accessToken, refreshToken };
};

const register = async ({ name, email, password, phone }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ApiError(409, "User with this email already exists");

    const user = await userRepository.create({ name, email, password, phone }); // name kept as-typed, no forced lowercase
    return userRepository.findByIdSafe(user._id);
};

const login = async (email, password) => {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw new ApiError(404, "User does not exist");

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new ApiError(401, "Invalid user credentials");

    const { accessToken, refreshToken } = await generateAndStoreTokens(user._id);
    const safeUser = await userRepository.findByIdSafe(user._id);

    return { user: safeUser, accessToken, refreshToken };
};

const logout = async (userId) => {
    await userRepository.clearRefreshToken(userId);
};

const refreshAccessToken = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findByIdWithRefreshHash(decoded._id);
    if (!user || !user.refreshTokenHash) throw new ApiError(401, "Invalid refresh token");

    if (hashToken(incomingRefreshToken) !== user.refreshTokenHash) {
        throw new ApiError(401, "Refresh token expired or already used");
    }

    return generateAndStoreTokens(user._id); 
};

const getMe = async (userId) => userRepository.findByIdSafe(userId);

const updateProfile = async (userId, { name, phone, address }) =>
    userRepository.updateProfile(userId, { name, phone, address });

export default { register, login, logout, refreshAccessToken, getMe, updateProfile };