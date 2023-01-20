import mongoose from "mongoose"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: { type: String },
      number: { type: Number }
    },
    cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }]
  },
  {
    timestamps: true
  }
)

export default model("User", usersSchema)
