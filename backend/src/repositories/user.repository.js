import User from "../models/user.model.js";

const findByEmail = (email) => User.findOne({ email });

const findByEmailWithPassword = (email) => User.findOne({ email }).select("+password");

const findById = (id) => User.findById(id);

const findByIdSafe = (id) => User.findById(id).select("-password -refreshTokenHash");

const findByIdWithRefreshHash = (id) => User.findById(id).select("+refreshTokenHash");

const create = (data) => User.create(data);

const setRefreshTokenHash = (id, refreshTokenHash) =>
    User.findByIdAndUpdate(id, { $set: { refreshTokenHash } }, { new: true });

const clearRefreshToken = (id) =>
    User.findByIdAndUpdate(id, { $unset: { refreshTokenHash: 1 } }, { new: true });

const updateProfile = (id, data) =>
    User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).select("-password -refreshTokenHash");


export default {
    findByEmail,
    findByEmailWithPassword,
    findById,
    findByIdSafe,
    findByIdWithRefreshHash,
    create,
    setRefreshTokenHash,
    clearRefreshToken,
    updateProfile,
};