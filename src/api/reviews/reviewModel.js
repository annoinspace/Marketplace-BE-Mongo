import mongoose from "mongoose"

const { Schema } = mongoose
const reviewsSchema = new Schema(
  {
    comment: { type: String, required: true },
    rate: { type: Number, required: true, enum: [1, 2, 3, 4, 5], default: 1 }
  },
  { timestamps: true }
)
export default reviewsSchema
