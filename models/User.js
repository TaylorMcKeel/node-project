const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto') //allows us to creat hashs for reset password token; dont need to be npm i it is apart of node.js

const UserSchema = new Schema({
  userName:{
    type: String,
    unique: true,
    required: true,
    maxLength:15
  },
  firstName:{
    type: String,
    required: true
  },
  lastName:{
    type:String,
    required: true
  },
  email:{
    type:String,
    required:true,
    unique: true,
    validate: (email)=> validator.isEmail(email) //uses validator library in order make sure the input is an email.
  },
  password:{
    type:String,
    required:true,
    validate: (password)=>validator.isStrongPassword(password)
  },
  admin:{
    type: Boolean, //type is true or false
    default: false, //want every new user to default as not an admin
  },
  resetPassowrdToken: { //temp token in order to get access to a site to reset password
    type: String
  },
  resetPasswordExpiration: { //how long the reset password link lasts
    type: Date
  }
},{
  timestamps: true
})

UserSchema.methods.getSignedJwtToken = function(){ //custom mongoose method to creat a jwt token. needs tobe function so we can use this
  return jwt.sign({id: this._id}, process.env.JWT_SECRET, { //jwt.sign creates the jwt token
    expiresIn: process.env.JWT_EXPIRE
  } ) //first argument is the payload sent back to the user, 2nd is secret key, 3rd optional expiration
}

//prehook that is attached to save that hases the password

UserSchema.pre('save',async function(next){ //using this so need regular function; hasing and salting are async; triggers when you save a new user
  if(!this.isModified('password')){ //is the password of the user has not been modiifed then they need to proceed to login
    next()
  }

  const salt = await bcrypt.genSalt(10) //creates random strings and characters to add to password
  this.password = await bcrypt.hash(this.password, salt) // hashes password and combines with salt
  next()
})


//method to match password from database to what was entered by the user
UserSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(this.password, enteredPassword) //compares the password from user to database and returns a boolean
}

//method to get resset password token

UserSchema.methods.getResetPasswordToken = function(){
  const resetToken = crypto.randomBytes(20).toString('hex')  //create random bytes of 20 characters, and convert to a string; hex tells us what type of data we are converting it from
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex') //sha256 is the hashing algorithm we used; we are hasing the hex string we created above
  this.resetPasswordExpiration = Date.now() + 10 * 60 * 1000 //our expiration is for the next hour in milliseconds
  return resetToken
}

module.exports = mongoose.model('User', UserSchema)