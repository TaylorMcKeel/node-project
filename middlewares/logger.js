const logger = (req,res,next) =>{
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`) //will tell you method (get, post etc), the protocol (http) and the local host making the request. creating the url
  next();
}

module.exports = logger;