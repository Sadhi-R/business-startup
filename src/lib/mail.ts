import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import type { Enquiry } from './validate';

export class MailNotConfiguredError extends Error {
  constructor() {
    super('MAIL_NOT_CONFIGURED');
    this.name = 'MailNotConfiguredError';
  }
}

export interface MailPayload extends Enquiry {
  ip: string;
  userAgent: string;
  source: string;
}

export async function sendEnquiry(payload: MailPayload) {
  const submittedAt = new Date().toISOString();
  const subject = `[Holistic Living] ${payload.enquiryLabel} — ${payload.fullName}`;
  const text = plainText(payload, submittedAt);
  const html = htmlEmail(payload, submittedAt);
  const driver = (process.env.MAIL_DRIVER || '').trim().toLowerCase();

  if (driver === 'log') {
    const dir = path.join(process.cwd(), 'storage');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, 'mail.log'),
      `${JSON.stringify({ submittedAt, subject, to: process.env.CONTACT_TO || '', text })}\n`,
      'utf8',
    );
    return;
  }

  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const to = process.env.CONTACT_TO?.trim();
  if (!host || !from || !to) throw new MailNotConfiguredError();

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS || '';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject,
    text,
    html,
  });
}

function plainText(payload: MailPayload, submittedAt: string) {
  return [
    'New enquiry from the Holistic Living website',
    '',
    `Submitted: ${submittedAt}`,
    `Source: ${payload.source}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Enquiry: ${payload.enquiryLabel}`,
    '',
    'Message:',
    payload.message,
    '',
    `IP: ${payload.ip}`,
    `User agent: ${payload.userAgent}`,
  ].join('\n');
}

function htmlEmail(payload: MailPayload, submittedAt: string) {
  const rows = [
    ['Submitted', submittedAt],
    ['Website', payload.source],
    ['Name', payload.fullName],
    ['Email', payload.email],
    ['Phone', payload.phone],
    ['Enquiry', payload.enquiryLabel],
    ['Message', payload.message],
    ['IP address', payload.ip],
    ['Browser', payload.userAgent],
  ];
  const body = rows
    .map(
      ([label, value], index) =>
        `<tr><td style="padding:12px 14px;width:34%;font-weight:700;color:#234237;background:${index % 2 ? '#FBF7F1' : '#F4EFE6'};border-bottom:1px solid #E4D5C1;vertical-align:top;">${esc(label)}</td><td style="padding:12px 14px;color:#1C2822;background:${index % 2 ? '#FBF7F1' : '#ffffff'};border-bottom:1px solid #E4D5C1;line-height:1.5;">${esc(value)}</td></tr>`,
    )
    .join('');

  return `<div style="background:#F4EFE6;padding:24px;font-family:Poppins,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #E4D5C1;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#234237;padding:22px 28px;color:#FBF7F1;">
        <p style="margin:0 0 6px;letter-spacing:.14em;text-transform:uppercase;font-size:12px;">Holistic Living</p>
        <h1 style="margin:0;font-size:24px;font-weight:600;">New website enquiry</h1>
      </td></tr>
      <tr><td style="padding:8px 20px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;">${body}</table>
        <p style="margin:18px 0 0;color:#5C675F;font-size:13px;">Reply directly to this email to reach the visitor. Their address is set as Reply-To.</p>
      </td></tr>
    </table>
  </div>`;
}

function esc(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
