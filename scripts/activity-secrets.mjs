import { createHash, pbkdf2Sync, randomBytes } from "node:crypto";
import { stdin, stdout } from "node:process";

// Usage: node scripts/activity-secrets.mjs <password on stdin>
// The password never appears in shell history or the generated output.
const chunks = [];
for await (const chunk of stdin) chunks.push(chunk);
const password = Buffer.concat(chunks)
  .toString("utf8")
  .replace(/\r?\n$/, "");
if (password.length < 8)
  throw new Error("Choose a password of at least 8 characters.");
const url64 = (value) => Buffer.from(value).toString("base64url");
const salt = randomBytes(24);
const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
const secret = randomBytes(48);
stdout.write(
  `ACTIVITY_PASSWORD_HASH=${url64(salt)}:${url64(hash)}\nACTIVITY_SESSION_SECRET=${url64(secret)}\n`,
);
