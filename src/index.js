require('dotenv').config();
const express = require('express');
const path = require("path");
const bcrypt = require("bcryptjs");
const collection = require("./config");
const { name } = require('ejs');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const app = express();

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await collection.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await collection.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Create a new user
        const newUser = await collection.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            // Generate a random password for Google users
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
        });
        
        return done(null, newUser);
    } catch (err) {
        return done(err, null);
    }
}));

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}



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

// Google Auth routes
app.get("/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback", 
    passport.authenticate("google", { 
        failureRedirect: "/" 
    }),
    (req, res) => {
        // Successful authentication, redirect home
        res.redirect("/home");
    }
);

// Protected route
app.get("/home", isLoggedIn, (req, res) => {
    res.render("home", { user: req.user });
});

// Logout route
app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
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
//register user
app.post("/signup", async(req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    // Check if user already exists by username or email
    const existingUser = await collection.findOne({ 
        $or: [
            { name: data.name },
            { email: data.email }
        ]
    });

    if(existingUser) {
        res.send("User Already Exists");
    } else {
        // Hash password by bcrypt 
        const saltRounds = 10; // 10 is no of salt round
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword; // replaces hash password (security)

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.redirect("/"); // Redirect to login
    }
});



//Login user
app.post("/login", async (req, res) => {
    try {
        // Check if user exists by username or email
        const loginField = req.body.login;
        const check = await collection.findOne({
            $or: [
                { name: loginField },
                { email: loginField }
            ]
        });
        
        if(!check) {
            return res.send("User not found");
        }

        // Compare the hash password from database
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Wrong Password"); // Fixed res.send (was req.send)
        }

    } catch(error) {
        console.error(error);
        res.send("Wrong Details");
    }
});

const port = 5000;
app.listen(port,()=> {
    console.log(`Server running on port: ${port}`);
})