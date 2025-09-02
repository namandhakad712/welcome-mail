import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

export default async ({ req, res, log, error }) => {
    try {
        // Get user data from either event payload or HTTP request
        let userData;
        
        if (req.payload) {
            // Triggered by event (users.create)
            userData = req.payload;
        } else {
            // Triggered by HTTP request
            userData = {
                $id: req.query.$id || req.body.$id || '',
                name: req.query.name || req.body.name || '',
                email: req.query.email || req.body.email || ''
            };
        }

        const { $id, name, email } = userData;

        // Validate required fields
        if (!email) {
            throw new Error('Email is required');
        }

        // Read email template
        const templatePath = path.join(process.cwd(), 'src', 'email.html');
        let template = await fs.readFile(templatePath, 'utf8');

        // Generate welcome URL (with fallback if $id is not available)
        const welcomeUrl = $id ? `https://felearn.com/welcome/${$id}` : 'https://felearn.com/get-started';

        // Personalize template
        const personalizedHtml = template
            .replace('{{name}}', name || 'there')
            .replace('{{welcomeUrl}}', welcomeUrl);

        // Create email transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_EMAIL,
                pass: process.env.ZOHO_PASSWORD
            }
        });

        // Send email
        await transporter.sendMail({
            from: `"Felearn" <${process.env.ZOHO_EMAIL}>`,
            to: email,
            subject: 'Welcome to Felearn! 🎉',
            html: personalizedHtml,
            text: `Welcome ${name || 'there'}! We're excited to have you join Felearn. Get started: ${welcomeUrl}`
        });

        log(`Welcome email sent to ${email}`);
        return res.json({ success: true });
        
    } catch (err) {
        error('Email sending failed: ' + err.message);
        return res.json({ 
            success: false, 
            error: err.message 
        }, 500);
    }
};
