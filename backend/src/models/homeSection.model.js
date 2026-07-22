import mongoose, { Schema } from "mongoose";

const homeSectionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["flashSale", "featured", "bestSellers"],
    },
    title: {
      type: String,
      required: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export const HomeSection = mongoose.model("HomeSection", homeSectionSchema);