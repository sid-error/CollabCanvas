const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use environment variables for flexibility (Brevo, Outlook, Gmail)
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''; // Strip spaces

  console.log(`Attempting to send email via SMTP (${smtpHost}:${smtpPort}) from: ${smtpUser} to: ${options.email}`);
  
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // true for 465, false for other ports
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    tls: {
      ciphers: 'SSLv3',
    },
    // Force IPv4 to avoid IPv6 timeouts on some cloud providers
    logger: true,
    debug: true,
    socket: {
      family: 4
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // This ensures that whichever URL is provided (verification or reset) is used
  const targetUrl = options.verificationUrl || options.resetUrl;

  const mailOptions = {
    from: `"Collaborative Canvas" <${smtpUser}>`,
    to: options.email,
    subject: options.subject,
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
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw so the controller knows it failed
  }
};

module.exports = sendEmail;