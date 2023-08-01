const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RatingSchema = new Schema({ //placed in the item file since it is a subschema for items
  rating:{
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  text:{
    type: String,
    maxLength: [500, 'Can be longer than 500 characters'],
    required: true
  },
  author:{
    type: mongoose.Schema.Types.ObjectId, //references object id of the user creating the rating, this is a MONGODB datatype only
    ref: 'User',  //references the user model; doesnt need to be required because its done automatically (authentication)
  }
},{
  timestamp: true
})

const ItemSchema = new Schema({
  itemName: {
    type: String,
    required: true,
    maxLength: 100
  },
  itemDescription:{
    type: String,
    required: true,
    maxLength: 2000
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'Male','Female']
  },
  price: {
    type: Number,
    requireD: true,
    min: 0
  },
  isClearance:{
    type: Boolean,
    default: false
  },
  colors:{
    type: [String], //i am expecting an array of strings
    required: true
  },
  sizes:{
    type: [String],
    required: true
  },
  image:{
    type: String, //stored as a string that gets read into an image
  },
  ratings:[RatingSchema] //references a collection of ratings through the subschema. Since its a collection its in an array
},{
  timestamp: true
})

// ItemSchema.pre('save', function(next){
//   this.gender = this.gender.toUpperCaese()
//   console.log(this)
//   next()
// }) //before i save/find/findbyid/etc to the database do what this function says, then next to complete save/find/findbyid/etc;use regular function so that you can use "this"


// ItemSchema.post('save', function(next){
//   console.log(this)
//   this.gender = this.gender.toLowerCaese()
// })
module.exports = mongoose.model('Item', ItemSchema)