/**
 * @dotrino/qr — el QR del ecosistema Dotrino, en un solo sitio.
 *
 *   import '@dotrino/qr'
 *   <dotrino-qr value="..."></dotrino-qr>
 *   <dotrino-qr-scan open></dotrino-qr-scan>
 *
 * Se genera y se lee EN EL DISPOSITIVO: lo que va en un QR suele ser del usuario
 * (un enlace con #fragment, un código de emparejamiento), así que no toca ninguna
 * API de imágenes ajena ni sube un fotograma a ninguna parte.
 */
export { qrSvg } from './svg.js'
export { DotrinoQr } from './show.js'
export { DotrinoQrScan, scanImageFile } from './scan.js'
