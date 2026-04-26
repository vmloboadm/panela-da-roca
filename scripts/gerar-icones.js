const sharp = require('sharp')
const fs = require('fs')

fs.mkdirSync('public/icons', { recursive: true })

// Simple dark background with a circle accent — no emoji (SVG emoji rendering is inconsistent across platforms)
const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="#16181f"/>
  <circle cx="256" cy="256" r="160" fill="#f4a261" opacity="0.15"/>
  <text x="256" y="310" font-size="200" text-anchor="middle" font-family="serif" fill="#f4a261">🍳</text>
</svg>`

const buf = Buffer.from(svg512)

sharp(buf)
  .resize(512, 512)
  .png()
  .toFile('public/icons/icon-512.png')
  .then(() => sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png'))
  .then(() => console.log('✅ Ícones gerados: public/icons/icon-192.png e icon-512.png'))
  .catch(err => {
    // Fallback: create minimal valid 1x1 PNG if sharp fails
    console.warn('sharp falhou, usando fallback PNG mínimo:', err.message)
    // Minimal valid 1x1 dark PNG (base64)
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    fs.writeFileSync('public/icons/icon-192.png', minimalPng)
    fs.writeFileSync('public/icons/icon-512.png', minimalPng)
    console.log('✅ Ícones placeholder criados.')
  })
