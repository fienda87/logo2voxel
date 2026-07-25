export type Resolution = 16 | 32 | 48 | 64
export type ColorMode = "rgb" | "grayscale" | "solid" | "gradient"
export type MaterialStyle = "matte" | "glossy" | "wireframe"
export type LightPreset = "studio" | "warm" | "cyberpunk"
export type TextVoxelMode = "logo" | "text" | "both"

export interface VoxelData {
  vertices: number[]
  colors: number[]
  indices: number[]
}

export interface ApiResponse {
  status: string
  voxels: Record<string, number[]>
  metadata: {
    original_size: { width: number; height: number }
    has_alpha: boolean
    dominant_colors: string[]
    processing_time_ms: number
  }
  recommended_settings: {
    resolution: Resolution
    height_multiplier: number
    color_mode: ColorMode
    is_complex_logo: boolean
  }
}

export interface SampleItem {
  id: string
  name: string
  imageUrl: string
  voxels: Record<string, number[]>
}
