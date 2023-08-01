const User = require('../models/User')
const jwt = require('jsonwebtoken')

const protectedRoute = async(req,res,next)=>{ //going to be used to verify the token
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){ //if we have an authorization value AND that value is a jwt token (always starts with bearer)
    token = req.headers.auhtorization.split(' ')[1] //gets just the token from the headers object
  }
  if(!token){
    throw new Error('Not authorized to access this route') // throw because dont have an err object made to next
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) //verifies the jwt token using your secret; and returns the token

    req.user = await User.findById(decoded.id) //uses id from the token to get user from server; allows any endpoint to have access to the user

    next()
  } catch (err) {
    throw new Error('Error processing the jwt token')
  }

}

module.exports = {
  protectedRoute
}