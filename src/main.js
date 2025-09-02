import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async ({ req, res, log, error }) => {
    try {
        // Ignore favicon requests
        if (req.path === '/favicon.ico') {
            return res.send('', 204); // No Content response
        }

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
            // For HTTP requests without parameters, return a helpful message
            if (!req.payload) {
                return res.json({
                    success: false,
                    error: 'Missing required parameters. Please provide email and name parameters.',
                    example: 'https://your-function-url/?email=test@example.com&name=TestUser'
                }, 400);
            }
            throw new Error('Email is required');
        }

        // Read email template
        const templatePath = path.join(__dirname, 'email.html');
        let template = await fs.readFile(templatePath, 'utf8');

        // Generate welcome URL (with fallback if $id is not available)
        const welcomeUrl = $id ? `https://felearn.vercel.app/welcome/${$id}` : 'https://felearn.vercel.app/get-started';

        // Personalize template
        const personalizedHtml = template
            .replace('{{name}}', name || 'there')
            .replace('{{welcomeUrl}}', welcomeUrl);

        // Read images
        const bgImagePath = path.join(__dirname, 'bg.jpg');
        const logoPath = path.join(__dirname, 'felearn-logo.png');
        
        const bgImageBuffer = await fs.readFile(bgImagePath);
        const logoBuffer = await fs.readFile(logoPath);
        
        // Log image sizes for debugging
        log(`Background image size: ${bgImageBuffer.length} bytes`);
        log(`Logo image size: ${logoBuffer.length} bytes`);

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

        // Send email with embedded images
        await transporter.sendMail({
            from: `"Felearn AI" <${process.env.ZOHO_EMAIL}>`,
            to: email,
            subject: 'Welcome to Felearn AI! 🐾 Learning just got fun!',
            html: personalizedHtml,
            text: `Welcome ${name || 'there'}! We're excited to have you join Felearn AI. Learning doesn't have to be boring when cats explain it! Get started: ${welcomeUrl}`,
            attachments: [
                {
                    filename: 'bg.jpg',
                    content: bgImageBuffer,
                    cid: 'bg-image',
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                },
                {
                    filename: 'felearn-logo.png',
                    content: logoBuffer,
                    cid: 'logo-image',
                    encoding: 'base64',
                    contentType: 'image/png'
                }
            ]
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
