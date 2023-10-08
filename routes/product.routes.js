const express = require('express')
const router = express.Router()

const productController = require('../controller/product.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const authPermission = require('../middlewares/authPermission.middleware')
const userRoles = require('../utils/userRoles')

router.route('/')
    .get(productController.getAllProducts)
    .post(authMiddleware, authPermission(userRoles.ADMIN, userRoles.MANAGER), productController.createProduct)

router.route('/:id')
    .get(productController.getProduct)
    .patch(authMiddleware, authPermission(userRoles.ADMIN, userRoles.MANAGER), productController.updateProduct)
    .delete(authMiddleware, authPermission(userRoles.ADMIN, userRoles.MANAGER), productController.deleteProduct)

router.post('/uploadImage', authMiddleware, authPermission(userRoles.ADMIN, userRoles.MANAGER), productController.uploadImage)

module.exports = router