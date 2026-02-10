/**
 * @fileoverview Email utility using Nodemailer for sending verification and password reset emails.
 */

// Import nodemailer library for SMTP transport and email sending
const nodemailer = require('nodemailer');

/**
 * Send an email using either Brevo HTTP API (preferred) or SMTP fallback.
 * Brevo API uses HTTPS (port 443), which works on all hosting platforms
 * including Render, Vercel, Railway, etc. where SMTP ports are often blocked.
 */
const sendEmail = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY;

  // Use Brevo HTTP API if API key is available (recommended for Render/cloud)
  if (brevoApiKey) {
    return sendWithBrevoAPI(options, brevoApiKey);
  }

  // Fallback to SMTP (works locally or on platforms that allow SMTP)
  return sendWithSMTP(options);
};

/**
 * Send via Brevo Transactional Email API (HTTPS - never blocked)
 */
const sendWithBrevoAPI = async (options, apiKey) => {
  const senderEmail = (process.env.EMAIL_USER || 'noreply@collabcanvas.com').trim();
  const targetUrl = options.verificationUrl || options.resetUrl;

  const payload = {
    sender: { name: 'Collaborative Canvas', email: senderEmail },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Action Required</h2>
        <p>Please click the button below:</p>
        <a href="${targetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm</a>
        <p>Or copy this link: ${targetUrl}</p>
      </div>
    `,
  };

  console.log(`Sending email via Brevo API to: ${options.email}`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Brevo API error:', response.status, errorBody);
    throw new Error(`Brevo API error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  console.log('✅ Email sent via Brevo API. MessageId:', result.messageId);
};

/**
 * Fallback: Send via SMTP (nodemailer)
 */
const sendWithSMTP = async (options) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = (process.env.EMAIL_USER || '').trim();
  const smtpPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  // Log the connection attempt details (excluding password) for server logs
  console.log(`Attempting to send email via SMTP (${smtpHost}:${smtpPort}) from: ${smtpUser} to: ${options.email}`);
  
  // Initialize the Nodemailer transporter with detailed connection settings
  const transporter = nodemailer.createTransport({
    // Set SMTP host
    host: smtpHost,
    // Set SMTP port
    port: smtpPort,
    // Use startTLS (secure: false for port 587)
    secure: smtpPort === 465, 
    // Set connection timeout to 10 seconds
    connectionTimeout: 10000, 
    // Set socket inactivity timeout to 10 seconds
    socketTimeout: 10000, 
    // Allow legacy SSL support if needed by the provider
    tls: {
      // Let Node.js negotiate the best cipher automatically
      rejectUnauthorized: false, // Allow self-signed certs in dev
    },
    // Enable internal logging for debugging
    logger: true,
    // Enable debug mode to see full communication logs
    debug: true,
    // Force IPv4 to prevent delays from IPv6 lookup failures
    socket: {
      family: 4
    },
    // Set authentication credentials
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const targetUrl = options.verificationUrl || options.resetUrl;

  // Build the email object with sender, recipient, subject, and HTML body
  const mailOptions = {
    // Specify the display name and sender address
    from: `"Collaborative Canvas" <${smtpUser}>`,
    // Target recipient
    to: options.email,
    // Subject line
    subject: options.subject,
    // Use a basic HTML template for the message body
    html: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Action Required</h2>
        <p>Please click the button below:</p>
        <a href="${targetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm</a>
        <p>Or copy this link: ${targetUrl}</p>
      </div>
    `,
  };

  try {
    // Attempt to send the email using the configured transporter
    const info = await transporter.sendMail(mailOptions);
    // Log the successful message ID returned by the SMTP server
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    // Log full error details if email delivery fails
    console.error("Error sending email:", error);
    throw error; 
  }
};

// Export the sendEmail function for use in controllers (e.g., auth controller)
module.exports = sendEmail;
