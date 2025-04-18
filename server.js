const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const stripe = require('stripe')('your_stripe_secret_key'); // Replace with your Stripe secret key
const app = express();

// Middleware
app.use(express.static('.'));
app.use(express.json());
app.use(cors());

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-app-password'     // Replace with your app password
    }
});

// Store bookings in memory (in production, use a database)
let bookings = [];

// API Routes
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = {
            id: Date.now().toString(),
            ...req.body,
            status: 'pending',
            paymentStatus: 'pending'
        };
        
        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(booking.price.replace('₹', '')) * 100, // Convert to paise
            currency: 'inr',
            metadata: {
                bookingId: booking.id
            }
        });

        booking.paymentIntentId = paymentIntent.id;
        bookings.push(booking);

        // Send confirmation email to admin
        const adminMail = {
            from: 'your-email@gmail.com',
            to: 'admin@thefriendlycouch.com', // Replace with admin email
            subject: 'New Booking Request',
            html: `
                <h2>New Booking Request</h2>
                <p><strong>Client:</strong> ${booking.name}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Type:</strong> ${booking.type}</p>
                <p><strong>Price:</strong> ${booking.price}</p>
                <p>Please log in to the admin panel to confirm or reject this booking.</p>
            `
        };

        await transporter.sendMail(adminMail);

        res.json({
            booking,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

app.post('/api/bookings/:id/confirm', async (req, res) => {
    try {
        const booking = bookings.find(b => b.id === req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = 'confirmed';

        // Send confirmation email to client
        const clientMail = {
            from: 'your-email@gmail.com',
            to: booking.email,
            subject: 'Booking Confirmed - The Friendly Couch',
            html: `
                <h2>Your Booking is Confirmed!</h2>
                <p>Dear ${booking.name},</p>
                <p>We're pleased to confirm your therapy session with The Friendly Couch.</p>
                <p><strong>Details:</strong></p>
                <ul>
                    <li>Date: ${booking.date}</li>
                    <li>Time: ${booking.time}</li>
                    <li>Type: ${booking.type}</li>
                    <li>Price: ${booking.price}</li>
                </ul>
                <p>What to expect:</p>
                <ul>
                    <li>The session will be conducted via secure video call</li>
                    <li>Session duration: 45-50 minutes</li>
                    <li>You'll receive the video call link 15 minutes before the session</li>
                </ul>
                <p>If you need to reschedule or have any questions, please contact us at:</p>
                <p>WhatsApp: +91 9205025183</p>
                <p>Instagram: @thefriendlycouch</p>
                <p>We look forward to helping you on your therapy journey!</p>
                <p>Best regards,<br>The Friendly Couch Team</p>
            `
        };

        await transporter.sendMail(clientMail);

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Confirmation error:', error);
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});

app.post('/api/bookings/:id/reject', async (req, res) => {
    try {
        const booking = bookings.find(b => b.id === req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = 'rejected';

        // Send rejection email to client
        const clientMail = {
            from: 'your-email@gmail.com',
            to: booking.email,
            subject: 'Booking Update - The Friendly Couch',
            html: `
                <h2>Booking Update</h2>
                <p>Dear ${booking.name},</p>
                <p>We regret to inform you that we are unable to accommodate your booking request for the following slot:</p>
                <ul>
                    <li>Date: ${booking.date}</li>
                    <li>Time: ${booking.time}</li>
                </ul>
                <p>This could be due to one of the following reasons:</p>
                <ul>
                    <li>The therapist is unavailable during the requested time</li>
                    <li>The time slot has already been booked by another client</li>
                    <li>Technical issues with our scheduling system</li>
                </ul>
                <p>We encourage you to book another slot that works for you. You can do this easily through our website.</p>
                <p>If you need assistance in finding a suitable time, please contact us at:</p>
                <p>WhatsApp: +91 9205025183</p>
                <p>Instagram: @thefriendlycouch</p>
                <p>We apologize for any inconvenience caused.</p>
                <p>Best regards,<br>The Friendly Couch Team</p>
            `
        };

        await transporter.sendMail(clientMail);

        // If payment was made, process refund
        if (booking.paymentStatus === 'paid') {
            const refund = await stripe.refunds.create({
                payment_intent: booking.paymentIntentId
            });
            booking.refundId = refund.id;
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Rejection error:', error);
        res.status(500).json({ error: 'Failed to reject booking' });
    }
});

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
