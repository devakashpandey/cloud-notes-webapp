import nodemailer from "nodemailer";

// 1. Transporter create karein
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
//     port: Number(process.env.SMTP_PORT) || 2525,
//     secure: Number(process.env.SMTP_PORT) === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "",
//     },
// });

// 


// 1. Transporter create karein (Brevo / SMTP compatible)
const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "";

console.log(`📧 [SMTP Config] Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser}, Pass length: ${smtpPass.length}`);

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // Port 587 ke liye false hota hai (STARTTLS)
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,  // 10 seconds to connect
    greetingTimeout: 10000,    // 10 seconds for greeting
    socketTimeout: 10000,      // 10 seconds for socket
});

// Startup pe SMTP connection test
transporter.verify()
    .then(() => console.log("✅ [SMTP] Connection verified successfully - ready to send emails"))
    .catch((err) => console.error("❌ [SMTP] Connection verification FAILED:", err.message));


// 2. Generic send email function
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const fromEmail = process.env.SMTP_FROM_EMAIL || "developerakky@gmail.com";
        const fromName = process.env.SMTP_FROM_NAME || "CloudNotes";
        
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}, messageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

// 3. Email Verification Template
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

// 4. Password Reset Email Template
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

// 5. Welcome Email Template
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
