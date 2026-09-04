/**
 * qrSvg — dibuja un QR como SVG en el cliente.
 *
 * Sin servicios de terceros a propósito: lo que se codifica suele ser del usuario
 * (un enlace con #fragment, un código de emparejamiento) y mandarlo a una API de
 * imágenes lo pondría en un servidor ajeno, que es justo lo que el ecosistema evita.
 *
 * Negro sobre blanco con zona de silencio, pase lo que pase con el tema de la app:
 * un QR con poco contraste no lo lee ninguna cámara.
 */
import qrcode from 'qrcode-generator'

// La librería trae dos codificadores de texto; el de UTF-8 es el que respeta los
// acentos y la eñe. Sin esto, un enlace con tilde se lee como basura.
try { qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'] } catch (_) {}

/**
 * @param {string} text        lo que se codifica
 * @param {object} [opts]
 * @param {'L'|'M'|'Q'|'H'} [opts.ecc='M']  corrección de errores
 * @param {number} [opts.margin=4]          zona de silencio, en módulos
 * @returns {string} SVG listo para inyectar
 */
export function qrSvg (text, { ecc = 'M', margin = 4 } = {}) {
  const qr = qrcode(0, ecc)
  qr.addData(String(text ?? ''))
  qr.make()
  const n = qr.getModuleCount()
  const dim = n + margin * 2
  let rects = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) rects += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1"/>`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" ` +
    'shape-rendering="crispEdges" role="img" aria-label="QR">' +
    `<rect width="${dim}" height="${dim}" fill="#fff"/><g fill="#000">${rects}</g></svg>`
}

export default qrSvg
