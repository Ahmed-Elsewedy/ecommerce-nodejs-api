const Review = require('../models/review.model')
const Product = require('../models/product.model')
const appError = require('../utils/appError')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require('../utils/httpStatusText')
const checkPermission = require('../utils/checkPermission')



getAllReviews = asyncWrapper(async (req, res) => {
    const reviews = await Review.find().populate({
        path: 'product',
        select: 'name company price'
    })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { reviews } })
})

getReview = asyncWrapper(async (req, res, next) => {
    const review = await Review.findById(req.params.id)

    if (!review)
        return next(appError.create('review not found', 404, httpStatusText.FAIL))

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { review } })
})

updateReview = asyncWrapper(async (req, res, next) => {

    const review = await Review.findById(req.params.id)

    if (!review)
        return next(appError.create('review not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, review.user)

    await Review.updateOne({ _id: req.params.id }, { $set: { ...req.body } })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { review } })
})

deleteReview = asyncWrapper(async (req, res, next) => {
    const review = await Review.findById(req.params.id)
    if (!review)
        return next(appError.create('review not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, review.user)
    await Review.deleteOne({ _id: req.params.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: null })
})

createReview = asyncWrapper(async (req, res, next) => {

    if (!product || !rating || !comment)
        return next(appError.create('product, rating and comment are required', 400, httpStatusText.FAIL))

    const isValidProduct = await Product.findById(req.body.product)

    if (!isValidProduct)
        return next(appError.create('product not found', 404, httpStatusText.FAIL))

    const alreadyReviewed = await Review.findOne({ product, user: req.currentUser.id })

    if (alreadyReviewed)
        return next(appError.create('you have already reviewed this product', 400, httpStatusText.FAIL))

    const review = await Review.create(req.body)

    res.status(201).json({ status: httpStatusText.SUCCESS, data: { review } })
})

getSingleProductReviews = asyncWrapper(async (req, res, next) => {
    const reviews = await Review.find({ product: req.params.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { reviews, count: reviews.length } })
})

module.exports = {
    getAllReviews,
    getReview,
    updateReview,
    deleteReview,
    createReview,
    getSingleProductReviews
}