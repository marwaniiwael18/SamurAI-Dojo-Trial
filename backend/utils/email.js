const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async (options) => {
  try {
    // Skip email sending in development if SMTP not configured
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
      logger.info(`Email would be sent to ${options.email} with subject: ${options.subject}`);
      logger.info(`Message: ${options.message}`);
      return { messageId: 'dev-mode-skip' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `SamurAI Dojo <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SamurAI Dojo</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p style="color: #333; line-height: 1.6;">${options.message}</p>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>&copy; 2024 SamurAI Dojo. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    // In development, don't fail registration if email fails
    if (process.env.NODE_ENV === 'development') {
      logger.info('Email sending failed in development mode, continuing...');
      return { messageId: 'dev-mode-failed' };
    }
    throw new Error('Failed to send email');
  }
};

const sendWelcomeEmail = async (user, verificationToken) => {
  const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const message = `
    Welcome to SamurAI Dojo, ${user.firstName}!
    
    We're excited to have you join our intelligent security platform. To get started, please verify your email address by clicking the link below:
    
    ${verifyURL}
    
    This link will expire in 24 hours.
    
    Once verified, you'll be able to:
    • Complete your security profile
    • Access AI-powered recommendations
    • Create and manage workspaces
    • Collaborate with your team
    
    If you have any questions, our support team is here to help.
    
    Welcome aboard!
    The SamurAI Team
  `;

  return sendEmail({
    email: user.email,
    subject: 'Welcome to SamurAI Dojo - Verify Your Email',
    message
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const message = `
    Hi ${user.firstName},
    
    You requested a password reset for your SamurAI Dojo account.
    
    Click the link below to reset your password:
    
    ${resetURL}
    
    This link will expire in 10 minutes for security reasons.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The SamurAI Team
  `;

  return sendEmail({
    email: user.email,
    subject: 'SamurAI Dojo - Password Reset Request',
    message
  });
};

const sendWorkspaceInviteEmail = async (invitedUser, workspace, invitedBy, inviteToken) => {
  const inviteURL = `${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`;
  
  const message = `
    Hi there!
    
    ${invitedBy.firstName} ${invitedBy.lastName} has invited you to join the "${workspace.name}" workspace on SamurAI Dojo.
    
    SamurAI Dojo is an intelligent security platform that provides AI-powered recommendations tailored to your organization's needs.
    
    Click the link below to accept the invitation:
    
    ${inviteURL}
    
    This invitation will expire in 7 days.
    
    Welcome to the team!
    The SamurAI Team
  `;

  return sendEmail({
    email: invitedUser.email,
    subject: `Invitation to join ${workspace.name} on SamurAI Dojo`,
    message
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendWorkspaceInviteEmail
};
