require('dotenv').config();
const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const { name } = require('ejs');



const app = express();

require('dotenv').config();
const dbURL = process.env.DB_URL;


//convert data into json form
app.use(express.json());

app.use(express.urlencoded({extended:false}));

//use EJS as view engine
app.set('view engine', 'ejs');


app.use(express.static("public"));

app.get("/",(req,res) =>{
    res.render("login");
});

app.get("/signup",(req,res) =>{
    res.render("signup");
});

app.get("/contact" ,(req,res) => {
    res.render("contact");
});

app.get("/engineer" ,(req,res) => {
    res.render("engineer");
});
app.get("/architech" ,(req,res) => {
    res.render("architech");
});
app.get("/medicin" ,(req,res) => {
    res.render("medicin");
});
app.get("/lawservice" ,(req,res) => {
    res.render("lawservice");
});
app.get("/hotelmang" ,(req,res) => {
    res.render("hotelmang");
});
app.get("/marketing" ,(req,res) => {
    res.render("marketing");
});
app.get("/army" ,(req,res) => {
    res.render("army");
});
app.get("/photo" ,(req,res) => {
    res.render("photo");
});
app.get("/nutrion" ,(req,res) => {
    res.render("nutrion");
});
app.get("/journalist" ,(req,res) => {
    res.render("journalist");
});



//register user
app.post("/signup", async(req,res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

//check if user already exist
    const existingUser = await collection.findOne({name: data.name});

    if(existingUser){
        res.send("User Already Exists");
    }else
    {
        //hash password by bcrypt 
        const saltRounds = 10; // 10 is no of salt round
        const hashedPassword = await bcrypt.hash(data.password,saltRounds);
        data.password = hashedPassword; // replaces hash password (security)

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
    
});
//Login user
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check){
            res.send("User name not found");
        }

        //compare the hash password from database
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch){
            res.render("home");
        }else{
            req.send("Wrong Password");
        }

    }catch{
        res.send("Wrong Details");
    }
});

const port = 5000;
app.listen(port,()=> {
    console.log(`Server running on port: ${port}`);
})