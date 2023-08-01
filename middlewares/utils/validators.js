const adminValidator = (req,res,next)=>{ //not async because not fetching data; used to check is admin before giving access top all users endpoint
  if(req.user.admin){
    next() //if you are an admin you can continue to the next middleware to access users
  } else { // if not an admin send back res object saying they are unauthorized
    res
    .status(401) //client error
    .setHeader('Content-Type', 'application/json')
    .json({msg: 'Unauthorized to access this resource'})
  }
}

module.exports = {
  adminValidator
}