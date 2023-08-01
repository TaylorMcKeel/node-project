const mongoose = require('mongoose')

const connectDB= async()=>{
  const conn = await mongoose.connect(process.env.MONGO_URL) //connecting to the database using the url provided by mongoDB
  console.log(`MongoDB connected: ${conn.connection.host}`) //conn is an object sent back when you use connect. This shows where it is hosted (mongodb), exact location of database url
}

module.exports = connectDB