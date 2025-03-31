const mongoose = require("mongoose");
require('dotenv').config();

const dbURL = process.env.DB_URL;

if (!dbURL) {
  console.error("Database URL not found. Please check your .env file.");
  process.exit(1);
}

mongoose.connect(dbURL)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => console.error("❗ Database connection failed:", err.message));

const connect = mongoose.connect(dbURL);

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