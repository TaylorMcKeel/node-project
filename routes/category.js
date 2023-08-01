const express = require('express');
const router = express.Router(); //used to build new routes
const {
  getCategories,
  createCategory,
  putCategory,
  deleteCategories,
  getCategory,
  deleteCategory
} = require('../controllers/categoryController') //imports all controllers

const {protectedRoute} = require('../middlewares/auth')

router.route('/') //on put / here because will read the rest in server.js; route endpoint
  .get(getCategories) //uses controllers to handle each type of method
  .post(protectedRoute, createCategory)
  .delete(protectedRoute, deleteCategories)

router.route('/:categoryId') //creates endpoint for the individual category with its id
  .get(getCategory)
  .put(protectedRoute, putCategory)
  .delete(protectedRoute, deleteCategory)


  module.exports = router;