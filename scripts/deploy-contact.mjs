import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

// Load ignored credentials directly; never place their values in shell text or logs.
const env = parseEnv(await readFile(new URL('../neon/.env', import.meta.url), 'utf8'));
for (const name of ['RESEND_API_KEY', 'CONTACT_FROM']) {
  if (!env[name]) throw new Error(`Add ${name} to neon/.env first.`);
}
const child = spawn('neon', ['functions', 'deploy', 'contact', '--project-id', 'square-feather-93429753',
  '--branch', 'production', '--src', 'neon/functions/contact/index.ts',
  '--env', `RESEND_API_KEY=${env.RESEND_API_KEY}`, '--env', `CONTACT_FROM=${env.CONTACT_FROM}`],
  { stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', data => { output += data; });
child.stderr.on('data', data => { output += data; });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', code => {
  console.log(output.split(env.RESEND_API_KEY).join('[redacted]'));
  process.exitCode = code ?? 1;
});
