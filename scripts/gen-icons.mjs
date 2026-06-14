// Generates simple PNG icons using pure Node.js (no external deps)
// Produces a blue rounded-square with "CK" text
import { writeFileSync, mkdirSync } from 'fs'
import { createCanvas } from 'canvas'

function generate(size, outPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#1E3A5F')
  grad.addColorStop(1, '#3B9FD1')
  ctx.fillStyle = grad
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Text
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${size * 0.38}px Arial`
  ctx.fillText("CK", size / 2, size / 2)

  writeFileSync(outPath, canvas.toBuffer('image/png'))
  console.log(`Generated ${outPath}`)
}

mkdirSync('public', { recursive: true })
generate(192, 'public/icon-192.png')
generate(512, 'public/icon-512.png')
generate(180, 'public/apple-touch-icon.png')
generate(32, 'public/favicon.ico')
