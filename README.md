# Business Startup School

The website for Business Startup School, the two-month entrepreneurial programme with Dr. Ram Prasad, Engineers Business Mentor.

The site is a small Node.js application with no npm dependencies. Node.js 20 or newer builds the pages and serves them, including the contact form.

## What the site includes

- Home, about, programmes, the two-month school, the readiness assessment, an orientation page, and contact
- Privacy policy, terms, disclaimer, and cancellation and refund policy
- A contact form with client and server validation, a honeypot, a short wait before submit, and a limit of 10 submissions an hour for each IP address
- Server-side email to `10xwealthcreators@gmail.com`, with the visitor’s address as Reply-To
- Poppins, self-hosted
- A sitemap, robots.txt, canonical URLs, and Open Graph tags

The readiness step is described as free because the announcements say so. No price for the two-month school was in the source files, so none is shown. There are no testimonials or result statistics, because none were in the files. Promotional posters are labelled as artwork.

## Contact details on this site

- Phone: +91 88978 68747
- WhatsApp: +91 80960 80360
- Email: 10xwealthcreators@gmail.com

## Local setup

1. Install Node.js 20 or newer.
2. Copy the environment file:

```
copy .env.example .env
```

3. For a local test that does not send real email, set `MAIL_DRIVER=log` in `.env`.
4. Build and start:

```
node build.mjs
node server.mjs
```

Open http://localhost:4322

`node scripts/smoke.mjs` builds the site, checks every page, rejects an invalid form, and accepts a valid one. The logged enquiry is written to `storage/mail.log`, which is not committed. The test also fails if a Holistic Living phone number or email appears.

## Email

Real delivery is not switched on until SMTP settings are present and a test message arrives.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Live origin, such as `https://example.com`, with no path |
| `SMTP_HOST` | For Gmail, `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` for port 465 |
| `SMTP_USER` | The mailbox allowed to send |
| `SMTP_PASS` | An app password or provider secret. Never commit this. |
| `SMTP_FROM` | A verified From address, for example `Business Startup School <10xwealthcreators@gmail.com>` |
| `CONTACT_TO` | `10xwealthcreators@gmail.com` |
| `MAIL_DRIVER` | Leave empty in production. Use `log` only on a private machine. |

The From address must be one the provider lets that account send as. The visitor’s email is Reply-To, not From.

A local SMTP conversation was tested in the Holistic Living project against a fake server, and this site uses the same mail code. A message was not sent to `10xwealthcreators@gmail.com`, because no mailbox password was available. Do not describe the form as delivering mail until a live test arrives.

If SMTP is not configured, the form says so and does not pretend the enquiry was sent.

## Production build

Set `PUBLIC_SITE_URL` to this site’s domain, then run `node build.mjs`. Deployment steps are in [HOSTINGER.md](HOSTINGER.md).

## Still needed

- The live domain name
- An SMTP app password or other sending credential for `10xwealthcreators@gmail.com`
- Official social profile URLs. None were in the project files. Add them in `src/config.mjs` under `socials`, as `{ label, href }`, then rebuild
- Whether Dhruva Foundation has a formal role. Announcements show the name. The site does not describe ownership or accreditation
- The registered organisation name, address, and tax details, if they should appear on the legal pages
- The two-month fee, if there is one, and the written refund window
- The programme guidelines mentioned on the registration form. They are not in the project files
- Any real participant stories, only with permission to publish them
