const { body } = require("express-validator")

const validationSchema = () => {
    return [
        body('email')
            .notEmpty()
            .withMessage("email is required")
            .isLength({ min: 2 })
            .withMessage("title at least is 2 digits"),
        body('price')
            .notEmpty()
            .withMessage("price is required")

    ]
}

module.exports = {
    validationSchema
}