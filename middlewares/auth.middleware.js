const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const appError = require('../utils/appError')
const httpStatusText = require('../utils/httpStatusText')

const authMiddleware = async (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization

    if (!auth)
        return next(appError.create('token is required', 401, httpStatusText.FAIL))

    const token = auth.split(' ')[1]
    try {
        const currentUser = jwt.verify(token, process.env.SECRET_KEY)
        req.currentUser = currentUser
        next()
    } catch (err) {
        return next(appError.create('invlaid token', 401, httpStatusText.FAIL))
    }
}

module.exports = authMiddleware