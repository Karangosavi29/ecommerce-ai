import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import authService from "../services/auth.service.js";
import { getCookieOptions } from "../utils/cookieOptions.js";

const registerUser = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    return res.status(201).json(new ApiResponse(201, { user }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    const options = getCookieOptions();

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user }, "User logged in successfully")); // tokens no longer duplicated in body
});

const logoutUser = asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);
    const options = getCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshAccessToken(incomingRefreshToken);
    const options = getCookieOptions();

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, null, "Access token refreshed successfully"));
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, getMe, updateProfile };