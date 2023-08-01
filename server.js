const bodyParser =  require('body-parser');
const express = require('express');
const dotenv = require('dotenv');
const category = require('./routes/category') //importing the router
const item = require('./routes/item')
const user = require('./routes/user')
const logger = require('./middlewares/logger')
const errorHandler = require('./middlewares/error')
const connectDB = require('./config/db')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const cors = require('cors')

dotenv.config({ path: './config/config.env' }); //gives us access to variables in config file

connectDB() //connects us to the database; needs to happen before you invoke express

const app = express(); //invokes express so you can use methods; app is main root

app.use(fileupload()) //initializes express-fileupload to be used in middlewares

app.use(cookieParser()) //initialize cookie parser for authentication with jwt

app.use(mongoSanitize()) //protects against SQL and noSQL injection attacks

app.use(xss()) //assists with cross site scripting

app.use(hpp()) //

app.use(helmet()) //adds security headers

app.use(bodyParser.json()) //allows us to convert json data into a readble object

app.use(errorHandler) //error handler for all routes. Order does not matter in relation to other middleware

const limiter = rateLimit({ //adds rate limiting; takes two parameters; window time in ms, max api hit in that time frame
  windowMs: 10 * 60 * 1000, //10 min
  max: 100 //100 api calls in that 10 min interval
})

app.use(limiter) //uses the created limiter

app.use(cors({ //gives access to server from different site endpoints; whitelist everyone
  origin: '*', //anyone can have access can also be an array of websites
}))

app.use(logger) //middleware that will be used for all routes

app.use('/category', category) //hooks route to server and finishes endpoint from router

app.use('/item', item)

app.use('/user', user)

const PORT = process.env.PORT || 5001 //grabs port variable from config.env; if undefined fallback to 5001

const server = app.listen(PORT, ()=>{
  console.log(`Server is listening on PORT: ${PORT}`)
})//make server go live by connecting to the port

//handling unhandled objection; errors that do not go through our middleware; fails before reaching catch statyements
process.on('unhandledRejection',(err,promise)=>{//unhandledRejection is first  argument, then a callbal with what to do with error
  console.log(  `Error: ${err.message}`) //console logs error message
  server.close(()=> process.exit(1)) //automatically closes out the server and sends exit code 1; will tell us its an unhandled objection 
})