import { enquiryOptions, type EnquiryValue } from '../data/site';

export interface Enquiry {
  fullName: string;
  email: string;
  phone: string;
  enquiry: EnquiryValue;
  enquiryLabel: string;
  message: string;
  consent: true;
}

export type FieldErrors = Partial<Record<'fullName' | 'email' | 'phone' | 'enquiry' | 'message' | 'consent' | 'form', string>>;

const enquiryValues = new Set<string>(enquiryOptions.map((item) => item.value));

export function validateEnquiry(form: FormData): { ok: true; data: Enquiry } | { ok: false; fields: FieldErrors } {
  const fields: FieldErrors = {};

  const trap = String(form.get('hp_token') || '').trim();
  if (trap) {
    fields.form = 'This submission could not be accepted.';
    return { ok: false, fields };
  }

  const started = Number(form.get('startedAt') || 0);
  const elapsed = Date.now() - started;
  if (!Number.isFinite(started) || started <= 0 || elapsed < 2500 || elapsed > 1000 * 60 * 60 * 24) {
    fields.form = 'Please wait a moment and submit the form again.';
    return { ok: false, fields };
  }

  const fullName = clean(form.get('fullName'), 80);
  if (!/^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(fullName)) {
    fields.fullName = 'Enter your full name using letters, spaces, hyphens, or apostrophes.';
  }

  const email = clean(form.get('email'), 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.includes('..')) {
    fields.email = 'Enter a valid email address so we can reply.';
  }

  const phoneRaw = clean(form.get('phone'), 24);
  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    fields.phone = 'Enter a valid phone number. Indian mobile numbers should be 10 digits starting with 6, 7, 8, or 9.';
  }

  const enquiry = clean(form.get('enquiry'), 40);
  if (!enquiryValues.has(enquiry)) {
    fields.enquiry = 'Choose the kind of enquiry.';
  }

  const message = clean(form.get('message'), 4000);
  if (message.length < 10) {
    fields.message = 'Please write at least a short message (10 characters or more).';
  }

  const consent = form.get('consent');
  if (consent !== 'yes') {
    fields.consent = 'Please confirm that we may use these details to reply to you.';
  }

  if (Object.keys(fields).length) return { ok: false, fields };

  const match = enquiryOptions.find((item) => item.value === enquiry)!;
  return {
    ok: true,
    data: {
      fullName,
      email,
      phone: phone!,
      enquiry: match.value,
      enquiryLabel: match.label,
      message,
      consent: true,
    },
  };
}

function clean(value: FormDataEntryValue | null, max: number) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function normalizePhone(input: string) {
  const compact = input.replace(/[\s().-]/g, '');
  if (/^(?:\+91|91|0)?[6-9]\d{9}$/.test(compact)) {
    const digits = compact.replace(/^(?:\+91|91|0)/, '');
    return `+91${digits}`;
  }
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
  return null;
}
