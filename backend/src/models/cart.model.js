import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Product",
            required: true,
        },
        name:     String,
        price:    Number,
        imageUrl: String,
        qty: {
            type:     Number,
            required: true,
            min:      [1, "Quantity must be at least 1"],
        },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            unique:   true,
        },
        items: [cartItemSchema],
        totalPrice: {
            type:    Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Recalculate total before every save
cartSchema.pre("save", async function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.qty, 
    0
  );
});

export default mongoose.model("Cart", cartSchema);