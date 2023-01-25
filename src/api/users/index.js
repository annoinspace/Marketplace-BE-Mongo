import express from "express"
import mongoose from "mongoose"
import createHttpError from "http-errors"
import UsersModel from "./userModel.js"
import CartsModel from "./cartModel.js"
import ProductsModel from "../products/productModel.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    // make sure an email is not aready in use
    const existingUser = await UsersModel.findOne({ email: req.body.email })
    if (existingUser) {
      next(createHttpError(400, "Email already in use"))
    } else {
      const newUser = new UsersModel(req.body)
      const { _id } = await newUser.save()
      res.status(201).send({ _id })
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    )

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// ----------------------------------- embedded cart routes -------------------------------

// usersRouter.post("/:userId/cart", async (req, res, next) => {
//   try {
//     const selectedProduct = await ProductsModel.findById(req.body.productId) // , { _id: 0 } here we could use projection {_id: 0} to remove the _id from the Product. We should do this because in this way Mongo will automagically create a unique _id for every item in the array

//     if (selectedProduct) {
//       const productToInsert = {
//         ...selectedProduct.toObject(),
//         addedToCart: new Date()
//       }
//       console.log("Product TO INSERT: ", productToInsert)

//       let cart = await CartsModel.findById(req.params.userId)
//       if (!cart) {
//         const id = mongoose.Types.ObjectId(req.params.userId)

//         cart = new CartsModel(
//           id,
//           req.params.userId,
//           { $push: { productId: productToInsert } }, // HOW
//           { new: true, runValidators: true }
//         )
//         cart.save()
//       } else {
//         cart = await CartsModel.findByIdAndUpdate(
//           req.params.userId, // WHO
//           { $push: { productId: productToInsert } }, // HOW
//           { new: true, runValidators: true }
//         ) // OPTIONS
//       }

//       const updatedUser = await UsersModel.findByIdAndUpdate(
//         req.params.userId, // WHO
//         { $push: { cart: productToInsert } }, // HOW
//         { new: true, runValidators: true } // OPTIONS
//       )
//       if (updatedUser) {
//         res.send(updatedUser)
//       } else {
//         next(createHttpError(404, `User with id ${req.params.userId} not found!`))
//       }
//     } else {
//       next(createHttpError(404, `Product with id ${req.body.productId} not found!`))
//     }
//   } catch (error) {
//     next(error)
//   }
// })

// usersRouter.post("/:userId/cart", async (req, res, next) => {
//   try {
//     const selectedProduct = await ProductsModel.findById(req.body.productId)
//     if (selectedProduct) {
//       const productToInsert = {
//         ...selectedProduct.toObject(),
//         cartDate: new Date()
//       }
//       console.log("Product TO INSERT: ", productToInsert)

//       const updatedUser = await UsersModel.findById(req.params.userId)
//       if (updatedUser.cart) {
//         updatedUser.cart.cartContent.$push(productToInsert)
//       } else {
//         updatedUser.cart = await new CartsModel({ userId: req.params.userId, cartContent: [productToInsert] }).save()
//       }
//       updatedUser.save()

//       if (updatedUser) {
//         res.send(updatedUser)
//       } else {
//         next(createHttpError(404, `User with id ${req.params.userId} not found!`))
//       }
//     } else {
//       next(createHttpError(404, `Product with id ${req.body.productId} not found!`))
//     }
//   } catch (error) {
//     next(error)
//   }
// })

usersRouter.get("/:userId/cart", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId).populate({
      path: "cartContent",
      select: "name brand price"
    })
    if (user) {
      if (user.cart.length === 0) {
        res.send(` User ${user.name} ${user.surname} with id:${user._id} has no products in cart`)
      } else {
        res.send(user.cart)
      }
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/cart/:productId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      const selectedProduct = user.cart.find(
        (product) => product._id.toString() === req.params.productId // You CANNOT compare a string(req.params.productId) with an ObjectId (product._id) --> you have to either convert _id into string or ProductId into ObjectId
      )
      console.log(user.cart)
      if (selectedProduct) {
        res.send(selectedProduct)
      } else {
        next(createHttpError(404, `product with id ${req.body.productId} not found!`))
      }
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId/cart/:productId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { cart: { _id: req.params.productId } } }, // HOW
      { new: true } // OPTIONS
    )
    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
