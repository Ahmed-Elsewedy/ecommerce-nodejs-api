const express = require('express')
const router = express.Router()

const orderController = require('../controller/order.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const authPermission = require('../middlewares/authPermission.middleware')
const userRoles = require('../utils/userRoles')

router.route('/')
    .get(authMiddleware, authPermission(userRoles.ADMIN, userRoles.MANAGER), orderController.getAllOrders)
    .post(authMiddleware, orderController.createOrder)

router.route('/:id')
    .get(authMiddleware, orderController.getOrder)
    .post(authMiddleware, orderController.updateOrder)

router.get('allOrders', authMiddleware, orderController.getCurrentUserOrder)

module.exports = router