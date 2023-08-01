const express = require('express');
const router = express.Router()

const {
  getUsers,
  postUser,
  deleteUsers,
  getUser,
  putUser,
  deleteUser,
  login,
  forgotPassword,
  updatePassword,
  logout,
  resetPassword,
  
} = require('../controllers/userController')

const {adminValidator} = require('../middlewares/utils/validators')
const {protectedRoute} = require('../middlewares/auth')

router.route('/')
  .get(adminValidator, protectedRoute, getUsers) 
  .post(protectedRoute, postUser)
  .delete(protectedRoute, deleteUsers)

router.route('login')
  .post(login)

router.route('/forgotPassword')
  .post(forgotPassword)

router.route('/resetPassword')
  .put(resetPassword)

router.route('/updatePassword')
  .put(protectedRoute, updatePassword)

router.route('/logout')
  .get(protectedRoute, logout)

router.route('/:userId')
  .get(protectedRoute,getUser)
  .put(protectedRoute, putUser)
  .delete(protectedRoute, deleteUser)



module.exports = router;