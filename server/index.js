const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ocrRoutes = require('./routes/ocr');
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicine');
const orderRoutes = require('./routes/orders');
const prescriptionRoutes = require('./routes/prescription');

// Routes
app.use('/api/ocr', ocrRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => {
    res.send('PharmaAssist API is running');
});

// ─── Test Email Endpoint (remove in production) ───────────────────────────────
app.get('/api/test-email', async (req, res) => {
    const nodemailer = require('nodemailer');
    const pass = (process.env.EMAIL_USER || '').replace(/\s/g, '');
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: emailPass },
    });

    try {
        await transporter.verify();
        await transporter.sendMail({
            from: `"PharmaAssist" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '✅ PharmaAssist Email Test',
            text: 'Email notifications are working correctly!',
        });
        res.json({ success: true, message: `Test email sent to ${process.env.EMAIL_USER}` });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.responseCode,
            hint: err.responseCode === 535
                ? 'Bad credentials — regenerate your Gmail App Password at myaccount.google.com/apppasswords'
                : 'Check EMAIL_USER and EMAIL_PASS in .env'
        });
    }
});

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma-assist';
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected');

        // ─── Daily Medicine Reminder Cron (runs every day at 7:00 AM) ────────────
        const { sendDailyReminderEmail } = require('./utils/emailService');
        const User = require('./models/User');
        const Medicine = require('./models/Medicine');

        cron.schedule('0 7 * * *', async () => {
            console.log('[Cron] Running daily medicine reminder job...');
            try {
                // Get all patients
                const patients = await User.find({ role: 'Patient' }).select('name email _id');
                for (const patient of patients) {
                    const medicines = await Medicine.find({ userId: patient._id });
                    if (medicines.length > 0) {
                        sendDailyReminderEmail(patient.email, patient.name, medicines)
                            .catch(err => console.error(`[Cron] Email failed for ${patient.email}:`, err));
                    }
                }
                console.log(`[Cron] Daily reminders dispatched to ${patients.length} patient(s).`);
            } catch (err) {
                console.error('[Cron] Daily reminder job failed:', err);
            }
        }, {
            timezone: 'Asia/Kolkata' // IST — change to your timezone
        });

        console.log('[Cron] Daily reminder job scheduled for 7:00 AM IST');
    })
    .catch(err => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
