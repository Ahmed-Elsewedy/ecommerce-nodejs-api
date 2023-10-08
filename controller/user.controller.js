const User = require('../models/user.model')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require('../utils/httpStatusText')
const appError = require('../utils/appError')
const checkPermission = require('../utils/checkPermission')



// auth 
register = asyncWrapper(async (req, res, next) => {
    const email = req.body.email
    const oldUser = await User.findOne({ email })
    if (oldUser) {
        const error = appError.create('user already exist', 400, httpStatusText.FAIL)
        return next(error)
    }
    const user = new User(req.body)
    await user.save()
    const token = await user.generateToken()
    res.status(201).json({ status: httpStatusText.SUCCESS, data: { user, token } })
})

login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password)
        return next(appError.create('email and password are required', 400, httpStatusText.FAIL))

    const user = await User.findOne({ email })

    if (!user)
        return next(appError.create('user not exist', 400, httpStatusText.FAIL))

    if (!await user.isPasswordMatched(password))
        return next(appError.create('password not match', 400, httpStatusText.FAIL))

    const token = await user.generateToken()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user, token } })
})

// User functions
getAllUsers = asyncWrapper(async (req, res) => {
    const limit = req.query.limit || 10
    const page = req.query.page || 1
    const skip = limit * (page - 1)
    const users = await User.find().select(['password', '__v']).limit(limit).skip(skip)
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { users } })
})

getUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user)
        return next(appError.create('user not found', 404, httpStatusText.FAIL))

    checkPermission(req.currentUser, user._id)
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user } })
})

updateUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user)
        return next(appError.create('user not found', 404, httpStatusText.FAIL))

    if ('password' in req.body)
        delete req.body.password

    await User.updateOne({ _id: req.params.id }, { $set: { ...req.body } })

    const updatedUser = await User.findById(req.params.id)
    const token = await updatedUser.generateToken()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user: updatedUser, token } })
})

updatePassword = asyncWrapper(async (req, res, next) => {

    const { id, oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword)
        return next(appError.create('both values required', 404, httpStatusText.FAIL))

    const user = await User.findById(id)

    if (!user)
        return next(appError.create('user not found', 404, httpStatusText.FAIL))

    if (!await user.isPasswordMatched(oldPassword))
        return next(appError.create('old password not match', 404, httpStatusText.FAIL))

    user.password = newPassword
    await user.save()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user } })

})

deleteUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        const error = appError.create('user not found', 404, httpStatusText.FAIL)
        return next(error)
    }
    await user.deleteOne({ _id: req.params.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: null })
})

module.exports = {
    getAllUsers,
    register,
    login,
    getUser,
    updateUser,
    updatePassword,
    deleteUser
}