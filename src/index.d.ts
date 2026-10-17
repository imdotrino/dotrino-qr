export declare function qrSvg (text: string, opts?: { ecc?: 'L' | 'M' | 'Q' | 'H', margin?: number }): string
export declare function qrMatrix (text: string, opts?: { ecc?: 'L' | 'M' | 'Q' | 'H' }): boolean[][]

export declare class DotrinoQr extends HTMLElement {
  value: string
  size: number
  caption: string
}

export declare class DotrinoQrScan extends HTMLElement {
  open: boolean
  lang: 'es' | 'en'
}

export declare function scanImageFile (file: Blob): Promise<string | null>
/** Decodifica el QR del fotograma actual de un video, una imagen o un canvas. */
export declare function scanFrame (source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, canvas?: HTMLCanvasElement): string | null
