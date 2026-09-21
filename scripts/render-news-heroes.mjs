import { readdir, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import sharp from 'sharp';

const inputDir = resolve(process.argv[2] ?? '');
const width = Number(process.argv[3] ?? 1536);
const height = Number(process.argv[4] ?? 1024);

if (!process.argv[2]) {
	throw new Error('Usage: node scripts/render-news-heroes.mjs <svg-dir> [width] [height]');
}

const names = (await readdir(inputDir)).filter((name) => extname(name) === '.svg').sort();
const rendered = [];

for (const name of names) {
	const source = resolve(inputDir, name);
	const target = resolve(inputDir, `${basename(name, '.svg')}.jpg`);
	const buffer = await sharp(source, { density: 144 })
		.resize(width, height, { fit: 'contain', background: '#F5F3EE' })
		.flatten({ background: '#F5F3EE' })
		.jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
		.toBuffer();
	await writeFile(target, buffer);
	rendered.push({ source: name, target: basename(target), bytes: buffer.length });
}

console.log(JSON.stringify({ inputDir, width, height, rendered }, null, 2));
