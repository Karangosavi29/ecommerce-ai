import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type:     String,
            required: [true, "Product name is required"],
            trim:     true,
        },
        description: {
            type:     String,
            required: [true, "Description is required"],
        },
        price: {
            type:     Number,
            required: [true, "Price is required"],
            min:      [0, "Price cannot be negative"],
        },
        stock: {
            type:    Number,
            required:[true, "Stock is required"],
            min:     [0, "Stock cannot be negative"],
            default: 0,
        },
        category: {
            type:     String,
            required: [true, "Category is required"],
            trim:     true,
            lowercase:true,
        },
        imageUrl: {
            type:    String,
            default: "",
        },
        cloudinaryId: {
            type:    String,
            default: "",
        },
        isActive: {
            type:    Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Text index for search
productSchema.index({ name: "text", description: "text", category: "text" });

export default mongoose.model("Product", productSchema);