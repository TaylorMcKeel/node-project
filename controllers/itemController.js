const Item = require('../models/Item')
const path = require('path') //node prebuilt module that reads you the path


const getItems = async (req,res,next) =>{
  const filter = {}
  const options = {}
  if(Object.keys(req.query).length){ //checking to see if there are any query params
    const {
      gender,
      price,
      isClearance,
      colors,
      sizes,
      sortByPrice,
      limit
    } = req.query


    if(gender) filter.gender = true //these add the query if they exist
    if(price) filter.price = true
    if(isClearance) filter.isClearance = true
    if(colors) filter.colors = true
    if(sizes) filter.sizes = true

    if(limit) options.limit = limit
    if(sortByPrice) options.sort = {
      price: sortByPrice
    }

    for(const query of filter){
      console.log(`searching item by ${query}`)
    }
  }

  try {
    const result = await Item.find()
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

const postItem = async(req,res,next) => {
  try {
    const result = await Item.create(req.body)
    res
    .status(201)
    .setHeader('Content-Type','application.json')
    .json(result)
  } catch (err) {
    next(err)
  }
  
}

const deleteItems = async(req,res,next) =>{
  try {
    const result = await Item.deleteMany()
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

// for '/item/:itemId

const getItem =async(req, res, next)=>{
  try {
    const result = await Item.findById(req,params.itemId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next
  }
}

const putItem = async (req,res,next)=>{
  try {
    const result = await Item.findByIdAndUpdate(req,params.itemId, req.body, {new: true})
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
  
}

const deleteItem = async(req,res,next)=>{
  try {
    const result = await Item.findByIdAndDelete(req.params.itemId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (error) {
    next(err)
  }
}

//controllers /:itemId/ratings endpoints

const getItemRatings = async(req,res,next)=>{
  try {
    const result = await Item.findById(req.params.itemId) //gets item from database
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(result.ratings) //sends the rating from the item since its a subschema
  } catch (err) {
    next(err)
  }
}

const postItemRating = async(req,res,next)=>{
  try {
    const result = await Item.findById (req.params.itemId)
    result.ratings.push(req.body) //adds rating to the array of ratings in item
    await result.save() //saves new rating back to the database
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(result.ratings)
  } catch (err) {
    next(err)
  }
}

const deleteItemRatings = async(req,res,next)=>{
  try {
    const result = await Item.findById (req.params.itemId)
    result.ratings = [] //clears all of the ratings
    await result.save() //saves new empty ratings array back to the database
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json({message:`Deleted all ratings for item id of ${req.params.itemId}`}) //can return a message or can return the empty ratings array
  } catch (err) {
    next(err)
  }
}

//endpoint controllers for /:itemId/ratings/:ratingId 

const getItemRating= async(req,res,next)=>{
  try {
    const result = await Item.findById(req.params.itemId) //gets the ratings for that item
    let rating = result.ratings.find(rating => (rating._id).equals(req.params.ratingId)) //looks in the array of ratings and grabs the rating that matches the ratingId; since id is a special type you have to use mongoose method equals to compare
    if(!rating) rating = {msg: `No rating found with id ${req.params.ratingId}`} //if there is no rating send back message
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(rating)

  } catch (err) {
    next(err)
  }
}

const updateItemRating = async(req,res,next)=>{
  try {
    const result = await Item.findById(req.params.itemId)
    let rating = result.ratings.find(rating => (req.params.ratingId).equals(rating._id))

    if(rating){ //if theres a rating to be updates it needs to be replaced in the same palce in the ratings array
      const ratingindexPosition = result.ratings.indexOf(rating) //finds the index of the rating needing to be replaced
      result.ratings.splice(ratingindexPosition,1,req.body) //use splice to cut the item out of the array and replace with new rating
      rating = req.body //send back updated rating
      await result.save() //save the rating array
    }else{
      rating = {msg: `No rating found with id ${req.params.ratingId}`}
    }

    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(rating)
  } catch (err) {
    next(err)
  }
}

const deleteItemRating = async(req,res,next)=>{
  try {
    const result = await Item.findById(req.params.itemId)
    let rating = result.ratings.find(rating => (req.params.ratingId).equals(rating._id))

    if(rating){
      const ratingindexPosition = result.ratings.indexOf(rating)
      result.ratings.splice(ratingindexPosition,1) //remove and not replace the desired rating
      rating = {msg: `Succesfully deleted rating with id ${req.params.ratingId}`}
      await result.save()
    }else{
      rating = {msg: `No rating found with id ${req.params.ratingId}`}
    }

    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(rating)
  } catch (err) {
    next(err)
  }
}

const postItemImage = async(req,res,next)=>{
  try {
    const err = {msg: `Error uploading image`}
    if(!req.files) next(err) //if no image is found then pass the errror along

    const file = req.files.file //we give the name file when using postman or frontend to upload the file

    if(!file.mimetype.startsWith('image')) next(err) //make sure that the file type is an image, if not send the eerror
    if(file.size > process.env.MAX_FILE_SIZE) next(err) //make sure the file is not too big

    file.name = `photo_${req.params.itemId}${path.parse(file.name).ext}` //rename the image based on item id, and the extention of the image (jpg,png,etc)
    const filePath = process.env.FILE_UPLOAD_PATH + file.name //location of where the image will be stored
    file.mv(filePath, async(err)=>{
      await Item.findByIdAndUpdate(req.params.itemId, {image: file.name})

      res
      .status(200)
      .setHeader('Content-Type','application/json')
      .json({ msg: 'Image Uploaded'})
    }) //moves image to the file path created; and then adds the image location to the item

  } catch (err) {
    next(err)
  }
}

module.exports ={
  getItems,
  postItem,
  deleteItems,
  getItem,
  putItem,
  deleteItem,
  getItemRatings,
  postItemRating,
  deleteItemRatings,
  getItemRating,
  updateItemRating,
  deleteItemRating,
  postItemImage
}