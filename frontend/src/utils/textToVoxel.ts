const TEXT_THICKNESS = 2
const TEXT_RESOLUTION = 48

export function generateTextImage(text: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const res = TEXT_RESOLUTION
  canvas.width = res * text.length
  canvas.height = res
  const ctx = canvas.getContext("2d")!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const fontSize = res * 0.7
  ctx.font = `bold ${fontSize}px "Arial Black", Impact, system-ui, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  return canvas
}

export function voxelizeText(canvas: HTMLCanvasElement): number[] {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext("2d")!
  const imageData = ctx.getImageData(0, 0, w, h)
  const pixels = imageData.data

  const flat: number[] = []

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const idx = (py * w + px) * 4
      const alpha = pixels[idx + 3]
      if (alpha < 50) continue

      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]

      for (let layer = 0; layer < TEXT_THICKNESS; layer++) {
        flat.push(px, layer, py, r, g, b)
      }
    }
  }

  return flat
}
