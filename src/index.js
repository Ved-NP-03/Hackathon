require('dotenv').config();
const express = require('express');
const path = require("path");
const bcrypt = require("bcryptjs");
const collection = require("./config");
const { name } = require('ejs');
const { generateOTP, sendVerificationEmail } = require("./emailService");
const session = require('express-session');
const MongoStore = require('connect-mongo');





const app = express();

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;




//convert data into json form
app.use(express.json());

app.use(express.urlencoded({extended:false}));

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  }));

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
app.post("/signup", async(req, res) => {
    try {
        const data = {
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        // Check if user already exists by username or email
        const existingUser = await collection.findOne({ 
            $or: [
                { name: data.name },
                { email: data.email }
            ]
        });

        if(existingUser) {
            return res.send("User Already Exists");
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
        
        // Create user with OTP
        const newUser = await collection.create({
            ...data,
            otp,
            otpExpires
        });
        
        // Send verification email
        const emailSent = await sendVerificationEmail(data.email, otp);
        
        if (emailSent) {
            // Store email in session for verification page
            req.session.userEmail = data.email;
            res.redirect("/verify-email");
        } else {
            // If email fails, still create the user but inform them about the issue
            res.send("Account created but verification email could not be sent. Please contact support.");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup");
    }
});

// Email verification page
app.get("/verify-email", (req, res) => {
    if (!req.session.userEmail) {
        return res.redirect("/signup");
    }
    res.render("verify-email", { email: req.session.userEmail });
});

// Verify OTP route
app.post("/verify-otp", async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.userEmail;
        
        if (!email) {
            return res.redirect("/signup");
        }
        
        // Find user by email and valid OTP
        const user = await collection.findOne({
            email,
            otp,
            otpExpires: { $gt: new Date() } // Check if OTP is not expired
        });
        
        if (!user) {
            return res.render("verify-email", { 
                email, 
                error: "Invalid or expired OTP. Please try again." 
            });
        }
        
        // Mark user as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        // Clear session email
        req.session.userEmail = undefined;
        
        res.redirect("/verification-success");
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).send("An error occurred during verification");
    }
});

// Resend OTP route
app.post("/resend-otp", async (req, res) => {
    try {
        const email = req.session.userEmail;
        
        if (!email) {
            return res.redirect("/signup");
        }
        
        // Find user
        const user = await collection.findOne({ email });
        
        if (!user) {
            return res.redirect("/signup");
        }
        
        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        // Update user with new OTP
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
        // Send verification email
        await sendVerificationEmail(email, otp);
        
        res.render("verify-email", { 
            email, 
            message: "A new OTP has been sent to your email" 
        });
    } catch (error) {
        console.error("Error during OTP resend:", error);
        res.status(500).send("An error occurred while resending OTP");
    }
});

// Verification success page
app.get("/verification-success", (req, res) => {
    res.render("verification-success");
});

// Update login route to check for email verification
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
        
        if (!check) {
            return res.send("User not found");
        }

        // Check if user is verified (skip for Google OAuth users)
        if (!check.googleId && !check.isVerified) {
            // Store email in session for verification page
            req.session.userEmail = check.email;
            return res.redirect("/verify-email");
        }

        // Compare the hash password from database
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            // Set user in session
            req.session.user = {
                id: check._id,
                name: check.name,
                email: check.email
            };
            res.render("home");
        } else {
            res.send("Wrong Password");
        }
    } catch (error) {
        console.error(error);
        res.send("Wrong Details");
    }
});



//Login user


const port = 5000;
app.listen(port,()=> {
    console.log(`Server running on port: ${port}`);
})
