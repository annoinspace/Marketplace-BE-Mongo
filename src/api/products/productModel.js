import mongoose from "mongoose"
import ReviewSchema from "../reviews/reviewModel.js"
const { Schema, model } = mongoose

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    imageUrl: { type: String },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "lifestyle", "beauty", "kitchen", "home", "books", "toys", "pets", "DIY"],
      default: "lifestyle"
    },
    reviews: [ReviewSchema]
  },
  {
    timestamps: true
  }
)

export default model("Product", productsSchema)
