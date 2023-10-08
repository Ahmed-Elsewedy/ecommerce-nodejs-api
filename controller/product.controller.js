const Product = require('../models/product.model')
const appError = require('../utils/appError')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require('../utils/httpStatusText')


getAllProducts = asyncWrapper(async (req, res) => {
    const products = await Product.find()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { products } })
})

getProduct = asyncWrapper(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product)
        return next(appError.create('product not found', 404, httpStatusText.FAIL))

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { product } })
})

createProduct = asyncWrapper(async (req, res, next) => {
    req.body.user = req.currentUser.id
    const product = new Product(req.body)
    await product.save()
    res.status(201).json({ status: httpStatusText.SUCCESS, data: { product } })
})

updateProduct = asyncWrapper(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product)
        return next(appError.create('product not found', 404, httpStatusText.FAIL))

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { product } })

})

deleteProduct = asyncWrapper(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product)
        return next(appError.create('product not found', 404, httpStatusText.FAIL))

    await Product.findByIdAndRemove(req.params.id)

    res.status(201).json({ status: httpStatusText.SUCCESS, data: null })
})

uploadImage = asyncWrapper(async (req, res, next) => {

    if (!req.files)
        return next(appError.create('No files found', 404, httpStatusText.FAIL))

    const productImage = req.files.image

    if (!productImage.mimetype.startWith('image'))
        return next(appError.create('Invalid file type', 404, httpStatusText.FAIL))

    const size = 1024 * 1024
    if (productImage.size > size)
        return next(appError.create('File size is too large', 404, httpStatusText.FAIL))

    const imageName = Date.now() + productImage.split('.').pop()

    const imagePath = path.join(__dirname, `../public/images/${imageName}`)
    await productImage.mv(imagePath)
    res.status(200).json({ image: `/images/${imageName}` })
})

module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}