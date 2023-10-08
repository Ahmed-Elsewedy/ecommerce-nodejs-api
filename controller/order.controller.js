const Order = require('../models/order.model')
const appError = require('../utils/appError')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require('../utils/httpStatusText')
const checkPermission = require('../utils/checkPermission')


getAllOrders = asyncWrapper(async (req, res) => {
    const orders = await Order.find()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { orders } })
})

getOrder = asyncWrapper(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order)
        return next(appError.create('order not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, order.user)

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { order } })
})

getCurrentUserOrder = asyncWrapper(async (req, res, next) => {
    const orders = await Order.find({ user: req.currentUser.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { orders, count: orders.length } })
})

updateOrder = asyncWrapper(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order)
        return next(appError.create('order not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, order.user)

    await Order.updateOne({ _id: req.params.id }, { $set: { ...req.body } })

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { order } })
})

deleteOrder = asyncWrapper(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order)
        return next(appError.create('order not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, order.user)

    await Order.deleteOne({ _id: req.params.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: null })
})


const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue';
    return { client_secret, amount };
}

createOrder = asyncWrapper(async (req, res, next) => {

    const { items: cartItems, tax, shippingFee } = req.body

    if (!cartItems || cartItems.length < 1)
        return next(appError.create('cart is empty', 400, httpStatusText.FAIL))
    if (!tax || !shippingFee)
        return next(appError.create('tax and shipping fee are required', 400, httpStatusText.FAIL))

    let orderItems = []
    let subtotal = 0

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product })
        if (!dbProduct)
            return next(appError.create(`No product with id : ${item.product}`, 404, httpStatusText.FAIL))
        const { name, price, image, _id } = dbProduct
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        }
        // add item to order
        orderItems = [...orderItems, singleOrderItem]
        // calculate subtotal
        subtotal += item.amount * price
    }
    // calculate total
    const total = tax + shippingFee + subtotal
    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId,
    })

    res.status(201).json({ status: httpStatusText.SUCCESS, data: { order } })
})

module.exports = {
    getAllOrders,
    getOrder,
    getCurrentUserOrder,
    updateOrder,
    deleteOrder,
    createOrder
}