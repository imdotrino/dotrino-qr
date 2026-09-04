export declare function qrSvg (text: string, opts?: { ecc?: 'L' | 'M' | 'Q' | 'H', margin?: number }): string

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
