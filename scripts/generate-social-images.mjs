#!/usr/bin/env node
/** Rebuild sharing PNGs from the existing page hero artwork. No network or CMS reads. */
import { readFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const images = JSON.parse(await readFile(resolve(root, 'src/content/social-images.json'), 'utf8'))

for (const [path, { source }] of Object.entries(images)) {
  const target = resolve(root, `public/social${path}.png`)
  const artwork = await sharp(resolve(root, `public${source}`), { density: 144 })
    .resize(1104, 534, { fit: 'inside' })
    .png()
    .toBuffer()
  await mkdir(dirname(target), { recursive: true })
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#121214' } })
    .composite([{ input: artwork, gravity: 'centre' }])
    .flatten({ background: '#121214' })
    .png({ compressionLevel: 9 })
    .toFile(target)
  console.log(`${source} -> /social${path}.png`)
}
