import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const port = 4392;
const root = process.cwd();
const logFile = path.join(root, 'storage', 'mail.log');
fs.rmSync(logFile, { force: true });

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ['build.mjs'], { cwd: root, stdio: 'inherit' });
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('build failed'))));
});

const server = spawn(process.execPath, ['server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', MAIL_DRIVER: 'log' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitFor(`http://127.0.0.1:${port}/`);
  const paths = ['/', '/about', '/programs', '/programs/two-month-school', '/programs/readiness-assessment', '/resources', '/contact', '/privacy', '/terms', '/disclaimer', '/cancellation', '/sitemap.xml', '/robots.txt'];
  for (const item of paths) {
    const response = await fetch(`http://127.0.0.1:${port}${item}`);
    if (!response.ok) throw new Error(`${item} returned ${response.status}`);
    const html = await response.text();
    if (html.includes('ecs.sampathkumar@gmail.com') || html.includes('79810') || html.includes('Holistic Living')) {
      throw new Error(`${item} contains Holistic Living details`);
    }
    if (item === '/' && !html.includes('Dr. Ram Prasad')) throw new Error('home is missing the mentor');
    if (item === '/' && !html.includes('tel:+918897868747')) throw new Error('home is missing the school phone link');
  }
  const missing = await fetch(`http://127.0.0.1:${port}/no-such-page`);
  if (missing.status !== 404) throw new Error('missing page was not a 404');

  const bad = await post({ fullName: 'A', email: 'nope', phone: '123', enquiry: 'general', message: 'hi', consent: 'yes', startedAt: String(Date.now() - 4000) });
  if (bad.status !== 422) throw new Error(`invalid form returned ${bad.status}`);

  const good = await post({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '9876543210',
    enquiry: 'two-month',
    message: 'I want to ask about the two-month school.',
    consent: 'yes',
    startedAt: String(Date.now() - 4000),
  });
  if (!good.body.ok) throw new Error(`valid form failed ${good.status}`);
  const logged = fs.readFileSync(logFile, 'utf8');
  if (!logged.includes('ada@example.com') || !logged.includes('10xwealthcreators@gmail.com')) {
    throw new Error('mail log did not use the Business Startup School inbox');
  }
  console.log('Business Startup School smoke test passed');
} finally {
  server.kill();
}

async function post(fields) {
  const response = await fetch(`http://127.0.0.1:${port}/api/contact`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
  return { status: response.status, body: await response.json() };
}

async function waitFor(url) {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error('Server did not start');
}
