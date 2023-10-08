const appError = require('../utils/appError')
const userRoles = require('../utils/userRoles')
const chechPermission = (requestUser, resourceUserId) => {
    if (requestUser.role === userRoles.ADMIN || requestUser.role === userRoles.MANAGER || requestUser.id === resourceUserId.toString()) return;

    return next(appError.create('Not authorized', 401, httpStatusText.FAIL))
}

module.exports = chechPermission;
