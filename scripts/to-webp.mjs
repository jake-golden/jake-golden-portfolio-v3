#!/usr/bin/env node
/*
  Converts PNG/JPG/JPEG assets to WebP, in place.
  - Output goes next to the input, same basename, extension changed to .webp
  - Recursively scans a directory (default: assets/) unless specific files are given

  Usage:
    npm run to-webp                                    # convert every png/jpg/jpeg under assets/
    npm run to-webp -- assets/engineering/foo.png       # convert one file
    npm run to-webp -- assets/engineering               # convert everything under a folder
    npm run to-webp -- --quality=90 assets/photography  # override quality (default 82)

  Requirements:
    npm install
*/

import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DIR = path.join(ROOT, 'assets');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { quality: 82, targets: [] };
  for (const a of args) {
    if (a.startsWith('--quality=')) {
      out.quality = Number(a.replace('--quality=', ''));
    } else {
      out.targets.push(a);
    }
  }
  if (out.targets.length === 0) out.targets.push(DEFAULT_DIR);
  return out;
}

async function collectFiles(target) {
  const abs = path.isAbsolute(target) ? target : path.resolve(process.cwd(), target);
  const stat = await fs.stat(abs);

  if (stat.isFile()) {
    return EXTENSIONS.has(path.extname(abs).toLowerCase()) ? [abs] : [];
  }

  const results = [];
  const entries = await fs.readdir(abs, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectFiles(entryPath));
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(entryPath);
    }
  }
  return results;
}

async function convert(file, quality) {
  const outPath = file.slice(0, -path.extname(file).length) + '.webp';
  await sharp(file).webp({ quality }).toFile(outPath);
  console.log(`✓ ${path.relative(ROOT, file)} → ${path.relative(ROOT, outPath)}`);
}

async function main() {
  const { quality, targets } = parseArgs();

  const files = (await Promise.all(targets.map(collectFiles))).flat();
  if (files.length === 0) {
    console.log('No PNG/JPG/JPEG files found.');
    return;
  }

  for (const file of files) {
    await convert(file, quality);
  }
  console.log(`\nDone. Converted ${files.length} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
