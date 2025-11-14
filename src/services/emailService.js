const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure dotenv is loaded in this module

// Validate SMTP credentials
const validateSMTPCredentials = () => {
  console.log('Validating SMTP credentials...');
  console.log('SMTP_USER:', process.env.SMTP_USER ? `EXISTS (${process.env.SMTP_USER})` : 'MISSING');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'EXISTS' : 'MISSING');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP credentials validation failed!');
    console.error('All env vars:', Object.keys(process.env).filter(k => k.includes('SMTP')));
    throw new Error('SMTP credentials are missing. Please set SMTP_USER and SMTP_PASS in your .env file.');
  }
  console.log('SMTP credentials validated successfully');
};

// Create transporter with validation
let transporter;

const getTransporter = () => {
  if (!transporter) {
    validateSMTPCredentials();
    
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
    };
    
    console.log('SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      pass: smtpConfig.auth.pass ? '***' : 'MISSING',
    });
    
    transporter = nodemailer.createTransport(smtpConfig);
    
    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Server is ready to send emails');
      }
    });
  }
  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`Attempting to send OTP email to: ${email}`);
    const mailTransporter = getTransporter();
    const mailOptions = {
      from: `"BideshStudy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Email Verification OTP - BideshStudy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hello,
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for registering with BideshStudy. To complete your registration and verify your email address, please use the following One-Time Password (OTP):
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="background: #ffffff; border-radius: 12px; padding: 25px 40px; display: inline-block;">
                              <h2 style="color: #000000; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: 700; font-family: 'Courier New', monospace;">
                                ${otp}
                              </h2>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 20px 0; text-align: center;">
                        <strong style="color: #e74c3c;">⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
                      </p>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 12px; margin: 0 0 10px 0;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                      <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} BideshStudy. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: email,
      response: info.response,
    });
    return true;
  } catch (error) {
    console.error('Email sending error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack,
    });
    if (error.message.includes('SMTP credentials')) {
      throw error;
    }
    return false;
  }
};

const sendPasswordResetOTPEmail = async (email, otp) => {
  try {
    console.log(`Attempting to send password reset OTP email to: ${email}`);
    const mailTransporter = getTransporter();
    const mailOptions = {
      from: `"BideshStudy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔒 Password Reset OTP - BideshStudy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hello,
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        We received a request to reset your password for your BideshStudy account. To proceed with the password reset, please use the following One-Time Password (OTP):
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="background: #ffffff; border-radius: 12px; padding: 25px 40px; display: inline-block;">
                              <h2 style="color: #000000; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: 700; font-family: 'Courier New', monospace;">
                                ${otp}
                              </h2>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 20px 0; text-align: center;">
                        <strong style="color: #e74c3c;">⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
                      </p>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 12px; margin: 0 0 10px 0;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                      <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} BideshStudy. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', {
      messageId: info.messageId,
      to: email,
      response: info.response,
    });
    return true;
  } catch (error) {
    console.error('Password reset email sending error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack,
    });
    if (error.message.includes('SMTP credentials')) {
      throw error;
    }
    return false;
  }
};

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };

