#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const pkgPath = resolve(__dirname, '..', 'package.json');
  const pkgRaw = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  if (!pkg.name || !pkg.version) {
    throw new Error('package.json missing name or version');
  }
  console.log(`Repo sanity check OK for ${pkg.name}@${pkg.version}`);
} catch (error) {
  console.error('Repo sanity check failed:', error.message);
  process.exitCode = 1;
}
