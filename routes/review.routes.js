const express = require("express")
const router = express.Router()
const reviewController = require('../controller/review.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authMiddleware, reviewController.createReview)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authMiddleware, reviewController.updateReview)
    .delete(authMiddleware, reviewController.deleteReview)

router.get('/product', reviewController.getSingleProductReviews)

module.exports = router