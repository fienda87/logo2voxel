import * as THREE from "three"

const BOX_VERTS = new Float32Array([
  -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1,
  -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
  -1, -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1,
   1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
  -1, -1, -1, -1, -1,  1,  1, -1,  1,  1, -1, -1,
  -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
])

const BOX_INDICES = [
   0,  1,  2,  2,  3,  0,
   4,  5,  6,  6,  7,  4,
   8,  9, 10, 10, 11,  8,
  12, 13, 14, 14, 15, 12,
  16, 17, 18, 18, 19, 16,
  20, 21, 22, 22, 23, 20,
]

export function buildVoxelGeometry(
  flatArray: number[],
  resolution: number,
  gap: number = 0,
  _invertHeight: boolean = false,
  heightMultiplier: number = 1,
  _colorMode: string = "rgb",
  _customColor: string = "#8b5cf6",
  _gradientTop: string = "#ef4444",
  _gradientBottom: string = "#8b5cf6",
) {
  const stride = 6
  const count = Math.floor(flatArray.length / stride)
  if (count === 0) return null

  const totalVerts = count * BOX_VERTS.length
  const totalIdx = count * BOX_INDICES.length

  const positions = new Float32Array(totalVerts)
  const colors = new Float32Array(totalVerts)
  const indices = new Uint32Array(totalIdx)

  const center = resolution / 2
  const cubeScale = Math.max(0.1, 1 - gap)
  const halfXZ = 0.5 * cubeScale
  const halfY = 0.5

  let maxHeight = 0
  for (let i = 0; i < count; i++) {
    const h = flatArray[i * stride + 1]
    if (h > maxHeight) maxHeight = h
  }

  const hexToRgb = (hex: string) => {
    const v = parseInt(hex.replace("#", ""), 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }

  const cTop = hexToRgb(_gradientTop)
  const cBot = hexToRgb(_gradientBottom)
  const cSolid = hexToRgb(_customColor)

  for (let i = 0; i < count; i++) {
    const off = i * stride
    let x = flatArray[off] - center
    let y = flatArray[off + 1]
    const z = flatArray[off + 2] - center

    y *= heightMultiplier

    const rSrc = flatArray[off + 3]
    const gSrc = flatArray[off + 4]
    const bSrc = flatArray[off + 5]

    let r = rSrc, g = gSrc, b = bSrc

    if (_colorMode === "solid") {
      r = cSolid[0]; g = cSolid[1]; b = cSolid[2]
    } else if (_colorMode === "grayscale") {
      const gray = 0.299 * rSrc + 0.587 * gSrc + 0.114 * bSrc
      r = gray; g = gray; b = gray
    } else if (_colorMode === "gradient") {
      const t = maxHeight > 0 ? y / (maxHeight * heightMultiplier) : 0
      r = cBot[0] + (cTop[0] - cBot[0]) * t
      g = cBot[1] + (cTop[1] - cBot[1]) * t
      b = cBot[2] + (cTop[2] - cBot[2]) * t
    }

    const rf = r / 255, gf = g / 255, bf = b / 255

    const vBase = i * BOX_VERTS.length
    for (let v = 0; v < BOX_VERTS.length; v += 3) {
      const idx = vBase + v
      positions[idx] = x + BOX_VERTS[v] * halfXZ
      positions[idx + 1] = y + BOX_VERTS[v + 1] * halfY
      positions[idx + 2] = z + BOX_VERTS[v + 2] * halfXZ
      colors[idx] = rf
      colors[idx + 1] = gf
      colors[idx + 2] = bf
    }

    const iBase = i * BOX_INDICES.length
    const vCount = BOX_VERTS.length / 3
    for (let ii = 0; ii < BOX_INDICES.length; ii++) {
      indices[iBase + ii] = BOX_INDICES[ii] + i * vCount
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()

  return geo
}

export function buildPedestalGeometry(width: number, depth: number, height: number = 0.3) {
  const w = width / 2
  const d = depth / 2

  const verts = new Float32Array([
    -w, 0, -d,  w, 0, -d,  w, height, -d, -w, height, -d,
    -w, 0,  d,  w, 0,  d,  w, height,  d, -w, height,  d,
    -w, 0, -d, -w, height, -d, -w, height,  d, -w, 0,  d,
     w, 0, -d,  w, height, -d,  w, height,  d,  w, 0,  d,
    -w, 0, -d, -w, 0,  d,  w, 0,  d,  w, 0, -d,
    -w, height, -d, -w, height,  d,  w, height,  d,  w, height, -d,
  ])

  const indices = [
    0, 1, 2, 2, 3, 0,
    4, 5, 6, 6, 7, 4,
    8, 9, 10, 10, 11, 8,
    12, 13, 14, 14, 15, 12,
    16, 17, 18, 18, 19, 16,
    20, 21, 22, 22, 23, 20,
  ]

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3))
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  geo.computeVertexNormals()
  return geo
}
