/**
 * <dotrino-qr> — enseña un QR. La mitad "mostrar" del par; la otra es
 * <dotrino-qr-scan>.
 *
 *   <dotrino-qr value="https://messenger.dotrino.com/#add=K7M2Q9" size="200"></dotrino-qr>
 *
 * Atributos/propiedades: value, size (px), ecc ('L'|'M'|'Q'|'H'), caption.
 * El QR se pinta SIEMPRE negro sobre blanco (ver svg.js): la tarjeta se tematiza
 * con las variables --dqr-*, los módulos no.
 */
import { qrSvg } from './svg.js'

const CSS = `
  :host { display: inline-block; }
  .card {
    background: #fff;
    padding: var(--dqr-pad, 10px);
    border-radius: var(--dqr-radius, 10px);
    border: 1px solid var(--dqr-border, rgba(0,0,0,.12));
    line-height: 0;
  }
  .card svg { display: block; width: 100%; height: 100%; }
  .caption {
    margin-top: 8px;
    font-family: var(--dqr-font, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: var(--dqr-caption-size, 20px);
    letter-spacing: 3px;
    text-align: center;
    color: var(--dqr-caption-color, inherit);
    line-height: 1.2;
  }
`

export class DotrinoQr extends HTMLElement {
  static get observedAttributes () { return ['value', 'size', 'ecc', 'caption'] }

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="card"></div><div class="caption" hidden></div>`
  }

  connectedCallback () { this.#render() }
  attributeChangedCallback () { this.#render() }

  get value () { return this.getAttribute('value') || '' }
  set value (v) { if (v == null) this.removeAttribute('value'); else this.setAttribute('value', v) }

  get size () { return Number(this.getAttribute('size')) || 200 }
  set size (v) { this.setAttribute('size', String(v)) }

  get caption () { return this.getAttribute('caption') || '' }
  set caption (v) { if (v == null) this.removeAttribute('caption'); else this.setAttribute('caption', v) }

  #render () {
    const root = this.shadowRoot
    if (!root) return
    const card = root.querySelector('.card')
    const cap = root.querySelector('.caption')
    const value = this.value
    // Sin valor no se dibuja un QR vacío: un QR que no lleva a ninguna parte se
    // escanea igual y deja al usuario mirando un error que no es suyo.
    if (!value) { card.innerHTML = ''; card.hidden = true; cap.hidden = true; return }
    card.hidden = false
    const px = this.size
    card.style.width = px + 'px'
    card.style.height = px + 'px'
    const ecc = (this.getAttribute('ecc') || 'M').toUpperCase()
    try {
      card.innerHTML = qrSvg(value, { ecc: ['L', 'M', 'Q', 'H'].includes(ecc) ? ecc : 'M' })
    } catch (e) {
      // Pasa cuando el texto no cabe ni en la versión 40. Es un fallo del llamador
      // y se dice, no se pinta medio QR.
      card.innerHTML = ''
      console.error('[dotrino-qr] no se pudo generar el QR:', e?.message || e)
    }
    cap.textContent = this.caption
    cap.hidden = !this.caption
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('dotrino-qr')) {
  customElements.define('dotrino-qr', DotrinoQr)
}
