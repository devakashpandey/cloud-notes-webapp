// ============================================
// OLD: Nodemailer + Mailtrap SMTP (commented out)
// ============================================
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
//     port: Number(process.env.SMTP_PORT) || 2525,
//     secure: Number(process.env.SMTP_PORT) === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "",
//     },
// });

// ============================================
// OLD: Nodemailer + Gmail SMTP (commented out)
// Render blocks SMTP ports (587/465) — Connection timeout error
// ============================================
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: Number(process.env.SMTP_PORT) || 587,
//     secure: Number(process.env.SMTP_PORT) === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "",
//     },
//     tls: { rejectUnauthorized: false },
// });

// ============================================
// NEW: Brevo HTTP API — Email Service
// (Render blocks SMTP ports, so using HTTPS API instead)
// ============================================

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Generic send email function via Brevo HTTP API
export const sendEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.SMTP_FROM_EMAIL || "developerakky@gmail.com";
    const fromName = process.env.SMTP_FROM_NAME || "CloudNotes";

    if (!apiKey) {
        console.error("❌ BREVO_API_KEY is not set in environment variables!");
        throw new Error("Email service not configured");
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: fromName, email: fromEmail },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Brevo API error (${response.status}):`, JSON.stringify(data));
            throw new Error(data.message || "Email could not be sent");
        }

        console.log(`✅ Email sent successfully to ${to}, messageId: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error("❌ Error sending email:", error.message || error);
        throw new Error("Email could not be sent");
    }
};

// Email Verification Template
export const sendVerificationEmail = async (email, username, verificationToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome, ${username}! 👋</h2>
        <p style="color: #555; font-size: 16px;">Thank you for registering. Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #777; font-size: 14px;">Or copy-paste this link in your browser:</p>
        <p style="color: #4F46E5; word-break: break-all; font-size: 13px;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">This link will expire in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>
    `;

    return sendEmail({
        to: email,
        subject: "Verify your email address",
        html,
    });
};

// Password Reset Email Template
export const sendPasswordResetEmail = async (email, username, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request 🔒</h2>
        <p style="color: #555; font-size: 16px;">Hello ${username}, we received a request to reset your account password.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #777; font-size: 14px;">Or copy-paste this link in your browser:</p>
        <p style="color: #EF4444; word-break: break-all; font-size: 13px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">⚠️ This link is valid for <strong>15 minutes only</strong>. If you did not request this, please secure your account.</p>
    </div>
    `;

    return sendEmail({
        to: email,
        subject: "Password Reset Request",
        html,
    });
};

// Welcome Email Template
export const sendWelcomeEmail = async (email, username) => {
    const dashboardUrl = `${process.env.CLIENT_URL}/`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f97316; margin: 0; font-size: 28px;">CloudNotes 📝</h1>
        </div>
        
        <h2 style="color: #1e293b; font-size: 22px;">Welcome aboard, ${username}! 🎉</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Your email has been successfully verified, and your CloudNotes workspace is ready to use!
        </p>

        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #9a3412; font-size: 14px; margin: 0; font-weight: 600;">
                ✨ What you can do with CloudNotes:
            </p>
            <ul style="color: #7c2d12; font-size: 13px; margin: 8px 0 0 0; padding-left: 20px;">
                <li>Create and organize rich notes with cover images</li>
                <li>Access your notes anywhere securely with JWT encryption</li>
                <li>Customize your workspace with Dark/Light theme</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">
                Go to My Notes Dashboard
            </a>
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            Need help? Reply directly to this email or visit our support page.
        </p>
    </div>
    `;

    return sendEmail({
        to: email,
        subject: `Welcome to CloudNotes, ${username}! 🎉`,
        html,
    });
};
