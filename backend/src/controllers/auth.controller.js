import User from "../models/user.Model.js";
import {ApiError } from "../utils/ApiError.js";
import {ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshTokens = async(userId) =>{
     try {
          const user =await User.findById(userId)
          const accessToken =user.generateAccessToken()
          const refreshToken =user.generateRefreshToken()

          user.refreshToken =refreshToken
          await user.save({validateBeforeSave  :false})

          return {accessToken,refreshToken}


     } catch (error) {
          throw new ApiError(500,"Something went wrong while generating Access and refresh toKen")
     }
}



const registerUser = asyncHandler (async (req,res) => {

    const {name,email,password,phone } =req.body

    if(!name || !email || !password){
        throw new ApiError(400,"Name, email and password are required")
    }

    if(!email.includes("@")){
        throw new ApiError(400,"Invalid email address")
    }

    const existingUser =await User.findOne({email})

    if(existingUser){
        throw new ApiError(409,"User with this email already exists")
    }

    const user =await User.create({
        name:name.toLowerCase(),
        email,
        password,
        phone
    })

    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
    )

   if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }

    return res
    .status(201)
    .json({message:"User registered successfully",user:createdUser})

})



const loginUser =asyncHandler(async (req,res) => {


    const {email, password} =req.body;

    if(!email  ){
        throw new ApiError(400, "Email  are required");
    }

    const user = await User.findOne({ email }).select("+password")  
    
    if(!user){
        throw new ApiError(404,"User does not exist")   
    }


    const isPasswordvalid =await user.comparePassword(password)


    if(!isPasswordvalid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await 
    generateAccessTokenAndRefreshTokens(user._id)


    const loggedInUser =await User.findById(user._id)
    .select("-password -refreshToken")

     const options ={
          httpOnly :true,
          secure:true
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(200,
               {
                    user:loggedInUser ,accessToken,
                    refreshToken
               },
               "user Logged In Succesfully"

          )
     )

}) 



const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});



const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, address },
        { new: true, runValidators: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});


export {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
}