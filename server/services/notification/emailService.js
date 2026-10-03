/**
 * Email Service — server/services/notification/emailService.js
 *
 * Uses Nodemailer with SMTP configuration from environment variables.
 * SMTP credentials are NEVER hardcoded. They come from process.env only.
 *
 * Email failures are caught and logged — they NEVER propagate to crash
 * the main complaint/assignment workflow.
 */

import nodemailer from 'nodemailer';
import { getEmailTemplate } from './emailTemplates.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true';

  // If SMTP not configured, use a no-op test transport so app doesn't crash
  if (!host || !user || !pass) {
    console.warn('[EmailService] SMTP not configured — emails will be skipped.');
    transporter = nodemailer.createTransport({ jsonTransport: true }); // silent no-op
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Safety: never log auth data
    logger: false,
    debug: false
  });

  return transporter;
};

/**
 * Send an email notification.
 * @param {string} to - Recipient email address
 * @param {string} type - Notification type key (for template selection)
 * @param {object} data - Template data
 */
export const sendEmail = async (to, type, data) => {
  try {
    const transport = getTransporter();
    const template = getEmailTemplate(type, data);
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@uniissuehub.com';

    await transport.sendMail({
      from: `UniIssueHub <${from}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    });
  } catch (err) {
    // Log without exposing credentials
    console.error(`[EmailService] Failed to send "${type}" email to ${to}: ${err.message}`);
    // Do NOT re-throw — caller must not crash because email failed
  }
};
