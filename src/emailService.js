// emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    
     tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
  });



// Function to generate OTP
const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send verification email with OTP
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0072ff; text-align: center;">Email Verification</h2>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with our service. To complete your registration, please use the following OTP:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.</p>
          <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendVerificationEmail
};