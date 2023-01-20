import express from "express"
import ProductsModel from "./productModel.js"

import createHttpError from "http-errors"

const productsRouter = express.Router()

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body)
    const { _id } = await newProduct.save()
    res.status(201).send({ _id, message: `${req.body.name} added` })
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find()
    // .populate({ path: "author", select: "firstName lastName" })
    if (products.length === 0) {
      res.send("No products found, please add some products.")
    } else {
      res.send(products)
    }
  } catch (error) {
    console.log("error getting products")
    next(error)
  }
})

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId)
    //   .populate({ path: "author", select: "firstName lastName" })

    if (product) {
      res.send(product)
    } else {
      next(NotFound(`Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedproduct = await ProductsModel.findByIdAndUpdate(req.params.productId, req.body, {
      new: true,
      runValidators: true
    })
    if (updatedproduct) {
      res.send(updatedproduct)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.productId)
    if (deletedProduct) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// ------------------------------ embedding the reviews ----------------------------

productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId)
    if (product) {
      if (product.reviews.length === 0) {
        res.send("No reviews found for this product.")
      } else {
        res.send(product.reviews)
      }
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId)
    if (product) {
      const selectedReview = product.reviews.find((review) => review._id.toString() === req.params.reviewId)

      if (selectedReview) {
        res.send(selectedReview)
      } else {
        next(createHttpError(404, `Review with id ${req.params.reviewId} not found!`))
      }
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const review = req.body // Get the review from the req.body

    if (review) {
      const reviewToInsert = review
      const updatedproduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId, // WHO
        { $push: { reviews: reviewToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedproduct) {
        res.send(updatedproduct)
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } else {
      // 4. In case of either book not found or product not found --> 404
      next(createHttpError(404, `Review not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const review = req.body // Get the review edit from the req.body

    if (review) {
      // Find the review by id and update it with the new review data
      const updatedproduct = await ProductsModel.findOneAndUpdate(
        { "reviews._id": req.params.reviewId },
        { $set: { "reviews.$": review } },
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedproduct) {
        res.send(updatedproduct)
      } else {
        next(createHttpError(404, `Review with id ${req.params.reviewId} not found!`))
      }
    } else {
      next(createHttpError(404, `Review not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const updatedproduct = await ProductsModel.findByIdAndUpdate(
      req.params.productId, // WHO
      { $pull: { reviews: { _id: req.params.reviewId } } }, // HOW
      { new: true } // OPTIONS
    )
    if (updatedproduct) {
      res.send(updatedproduct)
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default productsRouter
