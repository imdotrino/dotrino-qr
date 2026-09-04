/**
 * <dotrino-qr-scan> — lee un QR con la cámara, o desde una foto si no hay cámara
 * (o el navegador no la da). La mitad "leer" del par; la otra es <dotrino-qr>.
 *
 *   const el = document.querySelector('dotrino-qr-scan')
 *   el.lang = 'es'
 *   el.open = true
 *   el.addEventListener('dotrino-qr-scanned', (e) => console.log(e.detail.text))
 *   el.addEventListener('dotrino-qr-cancelled', () => { el.open = false })
 *
 * Todo pasa en el dispositivo: los fotogramas se decodifican aquí y no sale nada
 * a ninguna red. La cámara se apaga al cerrar, al acertar y al salir del DOM —
 * una cámara encendida que nadie mira es un fallo, no un detalle.
 *
 * Eventos: 'dotrino-qr-scanned' { text }, 'dotrino-qr-cancelled',
 *          'dotrino-qr-error' { code: 'camera' | 'no-qr' }.
 */
import jsQR from 'jsqr'

const I18N = {
  es: {
    heading: 'Escanear un QR',
    hint: 'Apunta la cámara al código.',
    photo: '🖼 Usar una foto',
    cancel: 'Cancelar',
    camErr: 'No se pudo abrir la cámara. Puedes usar una foto del código.',
    noQr: 'En esa imagen no hay ningún QR.'
  },
  en: {
    heading: 'Scan a QR',
    hint: 'Point the camera at the code.',
    photo: '🖼 Use a photo',
    cancel: 'Cancel',
    camErr: 'The camera could not be opened. You can use a photo of the code instead.',
    noQr: 'There is no QR in that image.'
  }
}

const CSS = `
  :host { font-family: var(--dqr-font-ui, system-ui, -apple-system, Segoe UI, Roboto, sans-serif); }
  .overlay {
    position: fixed; inset: 0; z-index: var(--dqr-z, 1000);
    background: var(--dqr-overlay, rgba(0,0,0,.7));
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: var(--dqr-bg, #fff); color: var(--dqr-text, #1b1b1b);
    border-radius: var(--dqr-radius, 14px);
    box-shadow: var(--dqr-shadow, 0 18px 48px rgba(0,0,0,.35));
    width: min(420px, 100%); overflow: hidden;
  }
  h2 { margin: 0; padding: 14px 16px; font-size: 16px; border-bottom: 1px solid var(--dqr-border, rgba(0,0,0,.12)); }
  .stage { position: relative; background: #000; aspect-ratio: 1 / 1; }
  video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .frame {
    position: absolute; inset: 12%;
    border: 3px solid var(--dqr-accent, #c0392b); border-radius: 12px;
    box-shadow: 0 0 0 100vmax rgba(0,0,0,.25);
    pointer-events: none;
  }
  .body { padding: 12px 16px 16px; }
  .hint { margin: 0 0 10px; font-size: 13px; color: var(--dqr-muted, #6b6b6b); }
  .err { margin: 0 0 10px; font-size: 13px; color: var(--dqr-accent, #c0392b); }
  .row { display: flex; gap: 8px; justify-content: space-between; }
  button, .file {
    font: inherit; font-size: 14px; cursor: pointer;
    padding: 9px 14px; border-radius: 9px;
    border: 1px solid var(--dqr-border, rgba(0,0,0,.12));
    background: var(--dqr-btn-bg, transparent); color: inherit;
  }
  button:hover, .file:hover { border-color: var(--dqr-accent, #c0392b); }
  input[type=file] { display: none; }
`

/** Decodifica un QR de un archivo de imagen. Devuelve el texto o null. */
export function scanImageFile (file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = img.naturalHeight
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, c.width, c.height)
        resolve(jsQR(d.data, d.width, d.height)?.data || null)
      } catch (_) { resolve(null) }
      URL.revokeObjectURL(url)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export class DotrinoQrScan extends HTMLElement {
  static get observedAttributes () { return ['open', 'lang'] }

  #stream = null
  #raf = null

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }

  get open () { return this.hasAttribute('open') }
  set open (v) { if (v) this.setAttribute('open', ''); else this.removeAttribute('open') }

  get lang () { return this.getAttribute('lang') === 'en' ? 'en' : 'es' }
  set lang (v) { this.setAttribute('lang', v === 'en' ? 'en' : 'es') }

  attributeChangedCallback (name) {
    this.#render()
    if (name === 'open') { if (this.open) this.#start(); else this.#stop() }
  }

  connectedCallback () { this.#render(); if (this.open) this.#start() }
  disconnectedCallback () { this.#stop() }

  #render () {
    const t = I18N[this.lang]
    const root = this.shadowRoot
    if (!this.open) { root.innerHTML = ''; return }
    // Se reconstruye solo al abrir: mientras está cerrado no hay <video> vivo.
    if (root.querySelector('.overlay')) {
      root.querySelector('h2').textContent = t.heading
      root.querySelector('.hint').textContent = t.hint
      root.querySelector('.file').textContent = t.photo
      root.querySelector('.cancel').textContent = t.cancel
      return
    }
    root.innerHTML = `
      <style>${CSS}</style>
      <div class="overlay" part="overlay">
        <div class="modal" part="modal">
          <h2>${t.heading}</h2>
          <div class="stage"><video playsinline muted autoplay></video><div class="frame"></div></div>
          <div class="body">
            <p class="hint">${t.hint}</p>
            <p class="err" hidden></p>
            <div class="row">
              <label class="file">${t.photo}<input type="file" accept="image/*"></label>
              <button class="cancel" type="button">${t.cancel}</button>
            </div>
          </div>
        </div>
      </div>`
    root.querySelector('.cancel').addEventListener('click', () => {
      this.#stop()
      this.dispatchEvent(new CustomEvent('dotrino-qr-cancelled', { bubbles: true, composed: true }))
    })
    root.querySelector('input[type=file]').addEventListener('change', async (ev) => {
      const f = ev.target.files?.[0]
      ev.target.value = ''
      if (!f) return
      const text = await scanImageFile(f)
      if (text) this.#hit(text)
      else this.#fail('no-qr', I18N[this.lang].noQr)
    })
  }

  #error (msg) {
    const el = this.shadowRoot?.querySelector('.err')
    if (!el) return
    el.textContent = msg || ''
    el.hidden = !msg
  }

  #fail (code, msg) {
    this.#error(msg)
    this.dispatchEvent(new CustomEvent('dotrino-qr-error', { detail: { code }, bubbles: true, composed: true }))
  }

  #hit (text) {
    this.#stop()
    this.dispatchEvent(new CustomEvent('dotrino-qr-scanned', { detail: { text }, bubbles: true, composed: true }))
  }

  async #start () {
    const video = this.shadowRoot?.querySelector('video')
    if (!video || this.#stream) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const tick = () => {
      if (!this.#stream) return
      if (video.readyState >= 2 && video.videoWidth) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const d = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const r = jsQR(d.data, d.width, d.height)
          if (r?.data) return this.#hit(r.data)
        } catch (_) {}
      }
      this.#raf = requestAnimationFrame(tick)
    }
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      // Cerrar mientras se pedía permiso deja un stream huérfano: se apaga aquí.
      if (!this.open) { this.#stop(); return }
      video.srcObject = this.#stream
      await video.play().catch(() => {})
      this.#raf = requestAnimationFrame(tick)
    } catch (e) {
      this.#stream = null
      console.warn('[dotrino-qr-scan] camera unavailable:', e?.name || e)
      this.#fail('camera', I18N[this.lang].camErr)
    }
  }

  #stop () {
    if (this.#raf) { cancelAnimationFrame(this.#raf); this.#raf = null }
    if (this.#stream) { this.#stream.getTracks().forEach((tr) => tr.stop()); this.#stream = null }
    const video = this.shadowRoot?.querySelector('video')
    if (video) video.srcObject = null
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('dotrino-qr-scan')) {
  customElements.define('dotrino-qr-scan', DotrinoQrScan)
}
