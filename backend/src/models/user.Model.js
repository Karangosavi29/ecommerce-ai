import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"Password is required"],
            minlength:[6,"password must be at least 6 characters"],
            select:false, // Exclude password from query results by default
        },
        role:{
            type:String,
            enum:["customer","admin"],
            default:"customer",
        },
        phone:{
            type:String,
            trim:true,
        },
        address:{
            street:String,
            city:String,
            state:String,
            pincode:String,
        },
        refreshToken: {
            type: String 
        } 
    },{timestamps:true}
)


userSchema.pre("save", async function () {
    if (!this.isModified("password"))return ;
    this.password =await bcrypt.hash(this.password,12);
    
})



userSchema.methods.comparePassword =async function (candidatePassword) {
    return  bcrypt.compare(candidatePassword,this.password)
}



userSchema.methods.generateAccessToken =function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY || "1d",
        }
    )
}


userSchema.methods.generateRefreshToken =function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    )
}


export default mongoose.model("User", userSchema);
