const User = require('../models/User')
const crypto = require('crypto')

const getUsers = async(req,res,next) =>{

  const filter = {}
  const options = {}
  if(Object.keys(req.params).length){
    const {
      userName,
      gender,
      limit,
      sortByUserName
    } = req.params
    const filter = []

    if(userName) filter.userName = true
    if(gender) filter.gender = true

    if (limit) options.limit = limit
    if(sortByUserName) options.sort = {
      userName: sortByUserName
    }

    for(const query in filter){
      console.log(`Searching by ${query}`)
    }
  }
  try {
    const result = await User.find()
    res
    .status(200)
    .setHeader('Content-Type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
 
}

const postUser = async(req,res,next) => {
  try {
    const result = await User.create(req.body)

    sendTokenResponse(result, 201, res) //addds token to the res object
    // res
    // .status(201)
    // .setHeader('Content-Type','application.json')   was used before authenitication
    // .json(result)
  } catch (err) {
    next(err)
  }
}

const deleteUsers = async(req,res,next) =>{
  try {
    const result = await User.deleteMany()
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}


// for '/catergory/:userId

const getUser =async(req, res, next)=>{
  try {
    const result = await User.findById(req.params.userId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

const putUser = async(req,res,next)=>{
  try {
    const result = await User.findByIdAndUpdate(req.params.userId, req.body, {new:true})
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

const deleteUser = async(req,res,next)=>{
  try {
    const result = await User.findByIdAndDelete(req.params.userId)
    res
    .status(200)
    .setHeader('content-type','application/json')
    .json(result)
  } catch (err) {
    next(err)
  }
}

//endpoint for /login

const login = async (req,res,next)=>{
  const {email, password} = req.body //grabs email and password that user entered to lgoin
  
  if(!email || !password){
    throw new Error('please provide an email and password')
  }

  const user = await User.findOne({email}).select('+password') //finds user based on email and only returns the password

  if(!user){
    throw new Error('user does not exist')
  }

  const isMatch = await user.matchPasswords(password) //compares passwords and returns boolean

  if(!isMatch) throw new Error('invalid credentials')

  sendTokenResponse(user, 200, res) //sends back token
}

//endpoint for /forgotPassword

const forgotPassword = async(req,res,next)=>{
  const user = await User.findOne({ email: req.body.email }) //get users email to send reset link

  if(!user) throw new Error('User does not exist') //if there is not user throw an error

  const resetToken = User.getResetPasswordToken() //create the breset password token

  try {
    await user.save({ validateBeforeSave: false}) //skip any prehooks; skips prehook that hashs our password
    res
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .json({ msg: `Password has been reset with token ${resetToken}`}) //can use node mailer to send reset password email
  } catch (err) { //if something goes wrong with resetting password then need to reset fields sot hat you can start process over again
    user.resetPasswordToken = undefined
    user.resetPasswordExpiration = undefined
    await user.save({validateBeforeSave: false})
    throw new Error('Failed to reset Password')
  }
}

//endpoint for /resetPassword

const resetPassword = async (req,res,next)=>{
  const resetPasswordToken = crypto.createHash('sha256').update(req.query.resetToken).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpiration: { $gt: Date.now()} //look for expiration time that is greater than current time; doesnt let them reset after expiration; $gt = greater than
  })

  if(!user) throw new Error('invalid token from user')

  user.password = req.body.password //changes password
  user.resetPassowrdToken = undefined //since password has been reset remove this data since it is now expired information
  user.resetPasswordExpiration = undefined

  await user.save() //save user info, dont skip prehook so you can hash new password

  sendTokenResponse(user, 200,res) //send to create jwt token

}

// endpoint for /updatePassword

const updatePassword = async(req,res,next)=>{
  const user = User.findById(req.user.id).select('+password') //find the user and only give us the password
  
  const passwordMatches = await user.matchPassword(req.body.password) //checks to confirm old password before updating; returns T or F

  if(!passwordMatches) throw new Error('Password is incorrect')

  user.password = req.body.newPassword //change password
  
  await user.save() //save user

  sendTokenResponse(user, 200, res) //send to create jwt token
}


// for /logout

const logout = async (req,res,next)=>{
  res.cookie('token','none',{ //find the token in the cookie, dont pass a new token, and change xp to 10 seconds after now
    expires: new Date(Date.now( + 10 * 10000)),
    httpOnly: true //prevents cookie from being accessed by anyone other than the server
  })

  res
  .status(200)
  .setHeader('Content-Type', 'application/json')
  .json({ msg: 'Successfully logged out'})
}
//helper function to help create jwt token

const sendTokenResponse = (user, statusCode, res) =>{
  const token = user.getSignedJwtToken()  //creates token using mongoose method on user model

  const options = { //these are options for the user's cookies
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 *60 * 1000) , //expiration time  doesnt automatically consider current time to expiration so need to add current time (JWT does this automatically). then converted to ms
    httpOnly: true, //for security; tags cookie to be httponly; without this a cookie can be parsed with js by anyone; makes sure only server can parse this cookie
  }

  res
  .status(statusCode) //adds status code from the user
  .cookie('token', token, options) //adds a cookie; first arg is name; 2nd value; 3rd options
  .json(token) //sends back the token
}


module.exports ={
  getUsers,
  postUser,
  deleteUsers,
  getUser,
  putUser,
  deleteUser,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout
}

