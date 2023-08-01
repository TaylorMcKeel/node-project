const mongoose = require('mongoose')
const Schema = mongoose.Schema //pulling the schema method from mongoose to use to make the schema for our model


const CategorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    maxLength: 25
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'Male','Female']
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Category', CategorySchema) //creates the model; takes model name (capitalized) and the schema to create the model with