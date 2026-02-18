require('dotenv').config();
const nodemailer = require('nodemailer');

// Strip spaces — Gmail App Passwords are 16 chars with optional spaces
const pass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
console.log('Testing with user:', process.env.EMAIL_USER);
console.log('Password length (no spaces):', pass.length, '(should be 16)');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP connection FAILED:', error.message);
        console.error('Full error:', error);
    } else {
        console.log('✅ SMTP connection OK — sending test email...');
        transporter.sendMail({
            from: `"PharmaAssist Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to yourself
            subject: '✅ PharmaAssist Email Test',
            text: 'If you see this, email notifications are working correctly!',
        }, (err, info) => {
            if (err) {
                console.error('❌ Send FAILED:', err.message);
            } else {
                console.log('✅ Email sent! Message ID:', info.messageId);
            }
        });
    }
});
