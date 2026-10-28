# Deploy Business Startup School on Hostinger

This site needs its own Node.js process and its own domain or subdomain. Do not deploy it in the same application folder as Holistic Living. The contact form sends email from the server. A static upload cannot send that mail.

Use Hostinger web hosting with a Node.js app in hPanel, or a Hostinger VPS. A plan that only offers PHP will not run this form.

## 1. Domain and DNS

Set `PUBLIC_SITE_URL` to this site’s origin, including `https://`, with no path and no trailing slash.

At the registrar, use Hostinger’s nameservers, or point the A record for the domain or subdomain to the IP Hostinger shows. Wait until the name resolves before testing.

## 2. HTTPS

In hPanel, install the free SSL certificate for this hostname after DNS points at Hostinger. Force HTTPS if the panel offers it. Open the site and confirm the lock before anyone uses the form.

## 3. Upload

Upload this folder, not the Holistic Living folder. Do not upload `.env` or `storage`.

On the server, in this folder:

```
node build.mjs
```

There are no npm packages to install.

## 4. Node.js app

Create a separate Node.js application from the Holistic Living app.

- Node.js 20 or 22
- Application root: this folder
- Startup file: `server.mjs`
- The local default port is 4322. On Hostinger, the panel sets `PORT`, and the server uses that value.

Environment variables, entered in hPanel:

- `PUBLIC_SITE_URL` = `https://your-business-startup-domain`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `CONTACT_TO` = `10xwealthcreators@gmail.com`
- Leave `MAIL_DRIVER` empty

Run `node build.mjs` again after `PUBLIC_SITE_URL` is set, then restart the app. The sitemap must list this domain, not Holistic Living’s domain and not localhost.

## 5. Email

For `10xwealthcreators@gmail.com`, create a Google app password (2-step verification has to be on) and use:

- Host `smtp.gmail.com`
- Port `465`
- `SMTP_SECURE=true`
- `SMTP_USER` = `10xwealthcreators@gmail.com`
- `SMTP_FROM` = `Business Startup School <10xwealthcreators@gmail.com>`

Or create a Hostinger mailbox and use the SMTP settings hPanel shows for it. The From address must be allowed by that login. Keep the inbox that should receive enquiries in `CONTACT_TO`.

## 6. Check the live site

- Open home, about, programmes, both programme pages, resources, contact, and each policy.
- Confirm the call number is +91 88978 68747, WhatsApp is +91 80960 80360, and the email is 10xwealthcreators@gmail.com.
- Confirm you do not see +91 79810 88978 or ecs.sampathkumar@gmail.com. Those belong to Holistic Living.
- Submit an invalid form and a real test enquiry.
- Confirm the message arrives at `10xwealthcreators@gmail.com` and that Reply reaches the address you typed.

Until that message arrives, email delivery is not confirmed.

## 7. Later updates

Upload the changed files, run `node build.mjs` if pages changed, and restart this Node.js app only.

## 8. When something fails

**Canonical URLs show localhost or the other site.**  
`PUBLIC_SITE_URL` was missing or copied from Holistic Living. Set this domain and rebuild.

**The form says mail is not configured.**  
A required SMTP variable is empty, or `MAIL_DRIVER=log` is still set. `log` does not send mail.

**Gmail refuses the password.**  
Use an app password, port 465, and `SMTP_SECURE=true`. The From address must match the authenticated mailbox.

**Every page is 404.**  
`node build.mjs` did not run in this application root, or the startup file is not `server.mjs`.

**The domain or certificate fails.**  
Check DNS, then request SSL again after the name points at Hostinger.

**Both websites show the same phone number.**  
They are separate apps. Compare `src/config.mjs` in each folder and the environment variables on each Node.js app.
