const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const utli = require('util')
const asyncsign = utli.promisify(jwt.sign)
const _ = require('lodash')
const userRoles = require('../utils/userRoles')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'must be valid email address']
    },
    mobile: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
        default: userRoles.USER
    }
}, {
    toJSON: {
        transform: (doc, retuDoc) => _.omit(retuDoc, ['__v', 'password'])
    }

})

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const saltRound = 10 // number 
        const hashedpassword = await bcrypt.hash(this.password, saltRound)
        this.password = hashedpassword
    }
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateToken = function () {
    const token = asyncsign({
        id: this.id,
        email: this.email,
        role: this.role
    }, process.env.SECRET_KEY, { expiresIn: "1d" })
    return token
}

module.exports = mongoose.model('User', userSchema)