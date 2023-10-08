require('dotenv').config()
require('./config/db.js')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const userRouter = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')
const orderRouter = require('./routes/order.routes')
const reviewRouter = require('./routes/review.routes')

const httpStatusText = require('./utils/httpStatusText')

app.use(express.json())

app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)
app.use('/api/reviews', reviewRouter)



app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({ status: error.statusText || httpStatusText.ERROR, message: error.message, code: error.statusCode || 500, data: null });
})



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 