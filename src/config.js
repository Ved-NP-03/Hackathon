const mongoose = require("mongoose");
require('dotenv').config();

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  console.error("Database URL not found. Please check your .env file.");
  process.exit(1);
}

mongoose.connect(DB_URI)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => console.error("❗ Database connection failed:", err.message));

const connect = mongoose.connect(DB_URI);

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