import type { ApiResponse, SampleItem } from "./types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function postImage(
  file: File,
  removeBg: boolean = true,
  heightMultiplier: number = 1.5,
  onProgress?: (stage: string, progress: number) => void
): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("remove_bg", String(removeBg))
  formData.append("height_multiplier", String(heightMultiplier))

  onProgress?.("Analyzing geometry with Groq AI...", 33)
  const response = await fetch(`${API_URL}/api/convert`, {
    method: "POST",
    body: formData,
  })

  onProgress?.("Generating 3D voxel grid...", 80)

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(err.detail || err.message || "Failed to convert logo")
  }

  onProgress?.("Finalizing...", 100)
  return response.json()
}

export async function fetchSamples(): Promise<SampleItem[]> {
  const res = await fetch(`${API_URL}/api/samples`, { mode: "cors" })
  if (!res.ok) return []
  const data = await res.json()
  return data.samples || []
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`)
    return res.ok
  } catch {
    return false
  }
}
