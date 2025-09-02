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

        // Try to read email template from file
        let template;
        try {
            const templatePath = path.join(__dirname, 'email.html');
            template = await fs.readFile(templatePath, 'utf8');
            log('Template file read successfully');
        } catch (fileError) {
            error(`Failed to read template file: ${fileError.message}. Using embedded template.`);
            // Fallback to embedded template
            template = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { font-size: 28px; font-weight: bold; color: #4F46E5; }
        .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
        .cta-button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
        }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; }
        .cat-quote { font-style: italic; color: #6b7280; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🐾 Welcome to Felearn AI!</div>
        </div>
        <div class="content">
            <h1>Welcome, ${name || 'there'}!</h1>
            <p>We're thrilled to have you join our learning community! Get ready to experience education like never before.</p>
            <div class="cat-quote">"Learning doesn't have to be boring when cats explain it!" - Professor Whiskers</div>
            <p>Here's what you can do next:</p>
            <ul>
                <li>Explore our AI-powered concept explanations</li>
                <li>Create your first learning story</li>
                <li>Join our community of curious learners</li>
            </ul>
            <a href="https://felearn.vercel.app/get-started" class="cta-button">Start Learning</a>
        </div>
        <div class="footer">
            <p>Need help? Reply to this email or contact support@felearn.vercel.app</p>
            <p>© 2025 Felearn AI. Where learning meets storytelling.</p>
        </div>
    </div>
</body>
</html>
            `;
        }

        // Generate welcome URL (with fallback if $id is not available)
        const welcomeUrl = $id ? `https://felearn.vercel.app/welcome/${$id}` : 'https://felearn.vercel.app/get-started';

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
            from: `"Felearn AI" <${process.env.ZOHO_EMAIL}>`,
            to: email,
            subject: 'Welcome to Felearn AI! 🐾 Learning just got fun!',
            html: personalizedHtml,
            text: `Welcome ${name || 'there'}! We're excited to have you join Felearn AI. Learning doesn't have to be boring when cats explain it! Get started: ${welcomeUrl}`
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
