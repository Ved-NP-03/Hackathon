const mongoose = require("mongoose");
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Database URL not found. Please check your .env file.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => console.error("❗ Database connection failed:", err.message));

const connect = mongoose.connect(MONGODB_URI);

//checking
connect.then(() => {
    console.log("Database Connected");
})
.catch(() => {
    console.log("Database cannot be connected");
});

//create schema
const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
});

//collection of data
const collection = new mongoose.model("users",LoginSchema);

module.exports = collection;