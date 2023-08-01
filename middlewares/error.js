const errorHandler =(err,req,res,next)=>{
  console.log(err.stack) //contains stack trace of error; shows where error is occuring in code

  res 
  .status(err.statusCode || 500) //get status code from error or generic error status code
  .setHeader('content-type','application/json')
  .json({message: err.message || 'server error'}) //get message from error or generic one
}

module.exports = errorHandler