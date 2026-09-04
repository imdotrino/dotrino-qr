# @dotrino/qr

> **Parte del ecosistema [Dotrino](https://dotrino.com).** Dotrino es un ecosistema de aplicaciones centradas en la privacidad de los datos: tu información es tuya, y las decisiones sobre ella también — qué compartes, con quién, cuándo y por qué. Sin anuncios, sin cookies, sin rastreo de datos, sin vender tu identidad a nadie.

El **QR del ecosistema**, en un solo sitio: dos Web Components (Shadow DOM,
bilingües es/en) que cualquier app puede usar tal cual.

- **`<dotrino-qr>`** — muestra un QR.
- **`<dotrino-qr-scan>`** — lo lee, con la cámara o desde una foto.

Todo ocurre **en el dispositivo**: el QR se dibuja en el cliente y los fotogramas
de la cámara se decodifican en la propia página. Nada sale a ninguna red — lo que
va en un QR del ecosistema suele ser del usuario (un enlace con `#fragment`, un
código de emparejamiento), así que mandarlo a una API de imágenes ajena sería
justo lo contrario de lo que promete el ecosistema.

## Instalación

```bash
npm i @dotrino/qr
```

## Uso

```js
import '@dotrino/qr'
```

### Mostrar

```html
<dotrino-qr
  value="https://messenger.dotrino.com/#add=K7M2Q9"
  size="200"
  caption="K7M2Q9"></dotrino-qr>
```

| Atributo / propiedad | Qué hace |
|---|---|
| `value` | lo que se codifica. Sin valor no se dibuja nada. |
| `size` | lado en píxeles (por defecto 200). |
| `ecc` | corrección de errores `L`\|`M`\|`Q`\|`H` (por defecto `M`). |
| `caption` | texto monoespaciado bajo el QR (el código legible, normalmente). |

Los módulos van **siempre negro sobre blanco** con zona de silencio: un QR
tematizado con los colores de la app se vuelve ilegible para media cámara. Lo que
sí se tematiza es la tarjeta (`--dqr-pad`, `--dqr-radius`, `--dqr-border`,
`--dqr-caption-size`, `--dqr-caption-color`).

### Leer

```html
<dotrino-qr-scan lang="es"></dotrino-qr-scan>
```

```js
const scan = document.querySelector('dotrino-qr-scan')
scan.addEventListener('dotrino-qr-scanned', (e) => { console.log(e.detail.text); scan.open = false })
scan.addEventListener('dotrino-qr-cancelled', () => { scan.open = false })
scan.open = true            // pide la cámara y abre el modal
```

| Evento | Cuándo | `detail` |
|---|---|---|
| `dotrino-qr-scanned` | leyó un QR (cámara o foto) | `{ text }` |
| `dotrino-qr-cancelled` | el usuario cerró | — |
| `dotrino-qr-error` | no hubo cámara, o la foto no tenía QR | `{ code: 'camera' \| 'no-qr' }` |

Atributos: `open` (booleano) y `lang` (`es`\|`en`). Variables de tema: `--dqr-bg`,
`--dqr-text`, `--dqr-muted`, `--dqr-border`, `--dqr-accent`, `--dqr-overlay`,
`--dqr-radius`, `--dqr-shadow`, `--dqr-z`.

**La cámara se apaga sola** al acertar, al cerrar y al sacar el elemento del DOM.
Si el navegador no da cámara (permiso denegado, contexto no seguro, un ordenador
sin ella), el modal lo dice y deja el camino de la foto abierto en vez de quedarse
en negro.

### Sin componentes

```js
import { qrSvg } from '@dotrino/qr/svg'          // string SVG, sin tocar el DOM
import { scanImageFile } from '@dotrino/qr'      // File|Blob → texto | null
```

## Por qué existe

Estaba escrito dos veces —la consola de `dotrino-vault` y la app
`dotrino-qrreader`— y el messenger iba a ser la tercera. Un QR mal generado o una
cámara que se queda encendida es el mismo bug repetido en tres sitios, así que
vive aquí (regla del ecosistema: si falta algo, se extiende el paquete
compartido; no se copia dentro de la app).

**Deuda declarada:** `dotrino-vault/web` y `dotrino-qrreader` siguen con su copia
propia; migran a este paquete.

## Dependencias

`qrcode-generator` (dibujar) y `jsqr` (leer). Ambas puras, sin red.

## Licencia

MIT
