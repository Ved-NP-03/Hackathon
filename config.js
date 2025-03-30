const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/login-tut");

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