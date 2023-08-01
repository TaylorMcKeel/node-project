const Category = require('../models/Category');


//for /category endpoint

const getCategories = async(req,res,next) => { //function to get all catergories. is async because dealing with database
  //query parameters
  const filter = {}
  const options = {}
  if(Object.keys(req.query).length){ //checking to see if any queries are present
    const {
      sortByCategory,
      categoryName,
      gender,
      limit
    } = req.query //all information lies in the query parameter
    if(categoryName) filter.categoryName = true //determines if there is a category to filter by and puts it in filter object
    if(gender) filter.gender = true //determines if theres a gender to filter by and puts it in filter object
    if(limit) options.limit = limit //if you want to pagenate what is the limit
    if(sortByCategory) options.sort = { //determines if you want to sort the categories
      categoryName: sortByCategory //will send back 'asc'/'des'; '1'/'-1'; 'ascending'/'descending'
    } //filter only returns the gender, categoryName etc not returning certain genders or categorynames
  }

  try {
    const result = await Category.find({}, filter, options) //returns everything associated with category; json data
    res
    .status(200) //status code saying success
    .setHeader('Content-Type', 'application/json') //lets you know the type of data you are sending
    .json(result) //object to be turned into stringified json data
  } catch (err) {
    next(err) //passess potential error to the errhandler
  }
}

const createCategory = async(req,res,next) => { //function to create a category
  try {
    const result = await Category.create(req.body)
    res
    .status(201) //success for post
    .setHeader('Content-Type', 'application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}



const deleteCategories = async(req,res,next) => { //function to delete a category
  try {
    const result = await Category.deleteMany() // deletes multiples if left blank it deletes everything since not specifying
    res
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .json(result)
    
  } catch (err) {
    next(err)
  }
}

// for '/catergory/:categoryId

const getCategory = async(req, res, next)=>{
  try {
    const result = await Category.findById(req.params.categoryId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

const putCategory = async (req,res,next)=>{
  try {
    const result = await Category.findByIdAndUpdate(req.params.categoryId, req.body, {new: true}) // takes id, updated object, 3rd tells it to send back new document not the old one
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

const deleteCategory = async(req,res,next)=>{
  try {
    const result = await Category.findByIdAndDelete(req.params.categoryId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getCategories,
  createCategory,
  deleteCategories,
  getCategory,
  putCategory,
  deleteCategory
}