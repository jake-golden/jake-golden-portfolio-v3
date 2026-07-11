#!/usr/bin/env node
/*
  Thumbnail generator for photography gallery
  - Creates AVIF, WebP, and optimized JPEG variants at multiple widths
  - Keeps originals; write variants into a per-image folder to avoid reprocessing variants

  Usage:
    node scripts/thumbs.mjs                       # process all JPEGs under assets/photography
    node scripts/thumbs.mjs --files DSC_0001.jpg,DSC_0002.jpg   # process a subset by filenames

  Requirements:
    npm install
*/

import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'assets', 'photography');

// Target widths for variants (landscape/portrait share these; browser picks smallest adequate)
const WIDTHS = [800, 1200, 1600];

// Quality settings
const QUALITY = {
  jpeg: 82,
  webp: 82,
  avif: 50,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { files: null };
  for (const a of args) {
    if (a.startsWith('--files=')) {
      out.files = a.replace('--files=', '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (a === '--files') {
      // support space-separated
      const idx = args.indexOf(a);
      const next = args[idx + 1] || '';
      out.files = next.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return out;
}

async function listJpegs() {
  const entries = await fs.readdir(INPUT_DIR, { withFileTypes: true });
  return entries
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((f) => /\.(jpe?g)$/i.test(f))
    // Ignore previously generated variants like name.800w.jpg
    .filter((f) => !/\.\d{2,4}w\.(jpe?g)$/i.test(f))
    // Ignore files that look like thumbnail container names (rare if files existed previously)
    .filter((f) => !/-thumb\.[^.]+$/i.test(f));
}

function splitName(filename) {
  const m = filename.match(/^(.*)\.(jpe?g)$/i);
  if (!m) return { base: filename, ext: 'jpg' };
  return { base: m[1], ext: m[2].toLowerCase() };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function generateForFile(filename) {
  const inPath = path.join(INPUT_DIR, filename);
  const { base, ext } = splitName(filename);

  // Output directory per image, e.g., image-thumb.jpg
  const outDirName = `${base}-thumb.${ext}`;
  const outDir = path.join(INPUT_DIR, outDirName);
  await ensureDir(outDir);

  const img = sharp(inPath);
  const meta = await img.metadata();
  const origW = meta.width || 0;

  for (const w of WIDTHS) {
    if (origW && w > origW) continue; // skip upsizing beyond original width
    const pipeline = sharp(inPath).resize({ width: w, withoutEnlargement: true });

    // AVIF
    const avifOut = path.join(outDir, `${w}w.avif`);
    await pipeline.clone().avif({ quality: QUALITY.avif }).toFile(avifOut);

    // WebP
    const webpOut = path.join(outDir, `${w}w.webp`);
    await pipeline.clone().webp({ quality: QUALITY.webp }).toFile(webpOut);

    // Optimized JPEG
    const jpgOut = path.join(outDir, `${w}w.jpg`);
    await pipeline.clone().jpeg({ quality: QUALITY.jpeg, mozjpeg: true }).toFile(jpgOut);

    console.log(`✔ ${filename} -> ${outDirName}/${w}w.(avif|webp|jpg)`);
  }
}

async function main() {
  await ensureDir(INPUT_DIR);
  const { files } = parseArgs();
  const all = await listJpegs();
  const targets = files ? all.filter(f => files.includes(f)) : all;
  if (!targets.length) {
    console.log('No matching JPEG files found to process.');
    process.exit(0);
  }
  for (const f of targets) {
    try {
      await generateForFile(f);
    } catch (err) {
      console.error(`Error processing ${f}:`, err.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
