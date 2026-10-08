/** Keep the original student records and form evidence encrypted in public Git. */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const privateDirectory = join(root, 'kepuasan pengguna', 'hasil');
const archivePath = join(privateDirectory, 'paket_impor_kepuasan_privat.zip');
const keyPath = join(privateDirectory, 'kunci-paket-kepuasan.txt');
const outputDirectory = join(root, 'backend', 'storage', 'satisfaction_archive');
const partBytes = 8_000_000;
const digest = (value) => createHash('sha256').update(value).digest('hex');

if (!existsSync(archivePath)) throw new Error(`Private import bundle is missing: ${archivePath}`);
mkdirSync(privateDirectory, { recursive: true });
mkdirSync(outputDirectory, { recursive: true });

if (!existsSync(keyPath)) writeFileSync(keyPath, `${randomBytes(32).toString('hex')}\n`, { mode: 0o600, flag: 'wx' });
const keyHex = readFileSync(keyPath, 'utf8').trim();
if (!/^[a-f0-9]{64}$/i.test(keyHex)) throw new Error('The local encryption key must contain 64 hexadecimal characters');
const key = Buffer.from(keyHex, 'hex');
const plaintext = readFileSync(archivePath);
const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
const parts = [];
for (let offset = 0, index = 0; offset < ciphertext.length; offset += partBytes, index++) {
  const bytes = ciphertext.subarray(offset, offset + partBytes);
  const name = `part-${String(index).padStart(2, '0')}.bin`;
  writeFileSync(join(outputDirectory, name), bytes);
  parts.push({ name, size: bytes.length, sha256: digest(bytes) });
}
const manifest = {
  version: 1,
  algorithm: 'aes-256-gcm',
  nonce: iv.toString('hex'),
  tag: tag.toString('hex'),
  plaintextSha256: digest(plaintext),
  plaintextSize: plaintext.length,
  parts,
};
writeFileSync(join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// Local round trip catches accidentally malformed bundles before Git sees them.
const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
const restored = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
if (digest(restored) !== manifest.plaintextSha256) throw new Error('Encrypted package round trip failed');
console.log(`Encrypted ${plaintext.length} private bytes in ${parts.length} tracked parts. Local key: ${keyPath}`);
