/**
 * Minimal PNG generator — pure Node.js, no deps.
 * Creates solid-color blocks to satisfy PWA manifest requirements.
 */
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[n] = c
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crcBuf = Buffer.concat([typeBytes, data])
  const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf))
  return Buffer.concat([len, typeBytes, data, crcVal])
}

function makePNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw pixel data: each row has filter byte (0) + RGB pixels
  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      // Simple gradient: top-left dark, bottom-right blue
      const t = (x + y) / (2 * size)
      const pr = Math.round(r * (1 - t) + 59 * t)   // 59 = 0x3B
      const pg = Math.round(g * (1 - t) + 159 * t)  // 159 = 0x9F
      const pb = Math.round(b * (1 - t) + 209 * t)  // 209 = 0xD1
      raw[base + 1 + x * 3] = pr
      raw[base + 1 + x * 3 + 1] = pg
      raw[base + 1 + x * 3 + 2] = pb
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 })

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = path.join(__dirname, '..', 'public')
fs.mkdirSync(outDir, { recursive: true })

// Dark navy: #1E3A5F = 30, 58, 95
for (const [size, name] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png']]) {
  fs.writeFileSync(path.join(outDir, name), makePNG(size, 30, 58, 95))
  console.log(`Created ${name}`)
}
console.log('Icons generated.')
