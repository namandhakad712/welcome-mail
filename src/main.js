import nodemailer from 'nodemailer';

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

        // Generate welcome URL (with fallback if $id is not available)
        const welcomeUrl = $id ? `https://felearn.vercel.app/welcome/${$id}` : 'https://felearn.vercel.app/get-started';

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
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Felearn AI</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            min-height: 100vh;
                            padding: 20px;
                            margin: 0;
                            background-image: linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%, #faaca8 100%);
                        }
                        
                        .background-container {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            z-index: -1;
                            overflow: hidden;
                            background-image: linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%, #faaca8 100%);
                        }
                        
                        .background-image {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            min-width: 100%;
                            min-height: 100%;
                            width: auto;
                            height: auto;
                            transform: translate(-50%, -50%) rotate(90deg);
                            object-fit: cover;
                            background-image: linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%, #faaca8 100%);
                        }
                        
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            padding: 0;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .glass-card {
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            -webkit-backdrop-filter: blur(10px);
                            border-radius: 20px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            position: relative;
                            background-image: 
                                linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
                                url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+');
                            background-blend-mode: overlay;
                        }
                        
                        .header {
                            text-align: center;
                            padding: 40px 30px 20px;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            color: #ffffff;
                            margin-bottom: 10px;
                        }
                        
                        .content {
                            padding: 20px 40px 40px;
                            position: relative;
                            z-index: 1;
                        }
                        
                        h1 {
                            color: #ffffff;
                            font-size: 28px;
                            margin-bottom: 20px;
                        }
                        
                        p {
                            color: rgba(255, 255, 255, 0.9);
                            margin-bottom: 20px;
                            font-size: 16px;
                        }
                        
                        .cat-quote {
                            font-style: italic;
                            color: rgba(255, 255, 255, 0.8);
                            margin: 30px 0;
                            padding: 20px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 15px;
                            border-left: 4px solid #4F46E5;
                            font-size: 18px;
                        }
                        
                        .feature-list {
                            display: flex;
                            justify-content: space-between;
                            margin: 30px 0;
                            gap: 20px;
                        }
                        
                        .feature {
                            text-align: center;
                            flex: 1;
                            background: rgba(255, 255, 255, 0.05);
                            padding: 20px;
                            border-radius: 15px;
                            backdrop-filter: blur(5px);
                        }
                        
                        .feature-icon {
                            font-size: 32px;
                            margin-bottom: 10px;
                            display: block;
                        }
                        
                        .feature-title {
                            color: #ffffff;
                            font-weight: bold;
                            margin-top: 10px;
                        }
                        
                        ul {
                            color: rgba(255, 255, 255, 0.9);
                            margin: 20px 0;
                            padding-left: 20px;
                        }
                        
                        li {
                            margin-bottom: 10px;
                        }
                        
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(45deg, #4F46E5, #7C3AED);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: bold;
                            font-size: 18px;
                            margin: 30px 0;
                            text-align: center;
                        }
                        
                        .footer {
                            text-align: center;
                            padding: 30px;
                            background: rgba(0, 0, 0, 0.1);
                            position: relative;
                            z-index: 1;
                        }
                        
                        .footer-logo {
                            margin-bottom: 20px;
                        }
                        
                        .footer-logo img {
                            height: 40px;
                            width: auto;
                        }
                        
                        .footer p {
                            color: rgba(255, 255, 255, 0.7);
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        
                        .footer a {
                            color: rgba(255, 255, 255, 0.9);
                            text-decoration: none;
                        }
                        
                        .footer a:hover {
                            text-decoration: underline;
                        }
                        
                        @media (max-width: 600px) {
                            .container {
                                margin: 20px auto;
                            }
                            
                            .glass-card {
                                border-radius: 15px;
                            }
                            
                            .header, .content {
                                padding: 20px;
                            }
                            
                            .feature-list {
                                flex-direction: column;
                                gap: 15px;
                            }
                            
                            .cta-button {
                                display: block;
                                width: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="background-container">
                        <img src="https://felearn.vercel.app/assets/images/youtube-placeholder-kFh5XbQG.jpg" 
                             class="background-image" 
                             alt="Background" 
                             onerror="this.style.display='none'; this.parentElement.style.backgroundImage='linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%, #faaca8 100%)';">
                    </div>
                    
                    <div class="container">
                        <div class="glass-card">
                            <div class="header">
                                <div class="logo">🐾 Welcome to Felearn AI!</div>
                            </div>
                            <div class="content">
                                <h1>Welcome, ${name || 'there'}!</h1>
                                <p>We're thrilled to have you join our learning community! Get ready to experience education like never before.</p>
                                
                                <div class="cat-quote">
                                    "Learning doesn't have to be boring when cats explain it!" - Professor Purrfect
                                </div>
                                
                                <div class="feature-list">
                                    <div class="feature">
                                        <span class="feature-icon">📚</span>
                                        <div class="feature-title">AI Stories</div>
                                    </div>
                                    <div class="feature">
                                        <span class="feature-icon">🎨</span>
                                        <div class="feature-title">Cute Visuals</div>
                                    </div>
                                    <div class="feature">
                                        <span class="feature-icon">🐱</span>
                                        <div class="feature-title">Cat Illustrations</div>
                                    </div>
                                </div>
                                
                                <p>Here's what you can do next:</p>
                                <ul>
                                    <li>Explore our AI-powered concept explanations</li>
                                    <li>Create your first learning story</li>
                                    <li>Join our community of curious learners</li>
                                </ul>
                                
                                <a href="${welcomeUrl}" class="cta-button">Start Learning</a>
                            </div>
                            <div class="footer">
                                <div class="footer-logo">
                                    <img src="https://felearn.vercel.app/assets/images/felearn-logo-BoldL7TU.png" 
                                         alt="Felearn AI Logo"
                                         onerror="this.style.display='none';">
                                </div>
                                <p>Support: <a href="mailto:felearn@zohomail.in">felearn@zohomail.in</a></p>
                                <p>© 2025 Felearn AI. A new era of learning by AI imagination.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
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
