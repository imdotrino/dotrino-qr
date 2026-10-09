/**
 * Ida y vuelta: lo que dibuja `qrSvg` lo tiene que leer el mismo decodificador que usa
 * `<dotrino-qr-scan>`. Si el dibujo y la lectura dejan de entenderse, el QR del
 * ecosistema se ve bien y no sirve para nada.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import jsQR from 'jsqr'
import { qrSvg } from '../src/svg.js'

// Pasa el SVG a píxeles RGBA, `scale` píxeles por módulo.
function rasterize (svg, scale = 4) {
  const dim = Number(/viewBox="0 0 (\d+) \d+"/.exec(svg)[1])
  const size = dim * scale
  const data = new Uint8ClampedArray(size * size * 4).fill(255)
  for (const m of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1"\/>/g)) {
    const x0 = Number(m[1]) * scale; const y0 = Number(m[2]) * scale
    for (let y = y0; y < y0 + scale; y++) {
      for (let x = x0; x < x0 + scale; x++) {
        const i = (y * size + x) * 4
        data[i] = data[i + 1] = data[i + 2] = 0
      }
    }
  }
  return { data, size }
}

const read = (svg) => {
  const { data, size } = rasterize(svg)
  return jsQR(data, size, size)?.data ?? null
}

test('lo que se dibuja se lee igual', () => {
  const link = 'https://messenger.dotrino.com/#add=K7M2Q9'
  assert.equal(read(qrSvg(link)), link)
})

test('los acentos y la eñe sobreviven', () => {
  const text = 'Añade a María: https://eco.dotrino.com/#código=ñandú'
  assert.equal(read(qrSvg(text)), text)
})

test('todos los niveles de corrección se leen', () => {
  for (const ecc of ['L', 'M', 'Q', 'H']) assert.equal(read(qrSvg('dotrino', { ecc })), 'dotrino', ecc)
})

test('negro sobre blanco y con zona de silencio', () => {
  const svg = qrSvg('dotrino', { margin: 4 })
  assert.match(svg, /fill="#fff"/)
  assert.match(svg, /<g fill="#000">/)
  const xs = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="1"/g)].flatMap((m) => [Number(m[1]), Number(m[2])])
  assert.ok(Math.min(...xs) >= 4, 'ningún módulo invade el margen')
})
