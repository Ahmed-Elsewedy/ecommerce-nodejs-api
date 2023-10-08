const express = require("express")
const router = express.Router()
const userController = require('../controller/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const authPermission = require('../middlewares/authPermission.middleware')
const userRoles = require('../utils/userRoles')

router.get('/', authMiddleware, authPermission(userRoles.MANAGER, userRoles.ADMIN), userController.getAllUsers)

router.post('/register', userController.register)
router.post('/login', userController.login)

router.route('/:id')
    .get(authMiddleware, userController.getUser)
    .patch(authMiddleware, userController.updateUser)
    .delete(authMiddleware, userController.deleteUser)

router.patch('/updatePassword', authMiddleware, userController.updatePassword)

module.exports = router