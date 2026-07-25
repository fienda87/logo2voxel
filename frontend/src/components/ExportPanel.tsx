import { useState } from "react"
import * as THREE from "three"
import { useVoxelStore } from "../store/voxelStore"
import { buildVoxelGeometry } from "../utils/buildVoxelGeometry"
import { toast } from "../utils/toast"

export function ExportPanel() {
  const [exporting, setExporting] = useState<string | null>(null)
  const voxelData = useVoxelStore((s) => s.voxelData)
  const selectedResolution = useVoxelStore((s) => s.selectedResolution)
  const heightMultiplier = useVoxelStore((s) => s.heightMultiplier)
  const colorMode = useVoxelStore((s) => s.colorMode)
  const customColor = useVoxelStore((s) => s.customColor)

  const flatArray = voxelData ? voxelData[String(selectedResolution)] : null
  const hasData = !!flatArray && flatArray.length > 0

  const getScene = () => {
    if (!flatArray) return null
    const geo = buildVoxelGeometry(
      flatArray, selectedResolution,
      0, false, heightMultiplier,
      colorMode, customColor, useVoxelStore.getState().gradientTop, useVoxelStore.getState().gradientBottom
    )
    if (!geo) return null

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: colorMode !== "solid",
      flatShading: true,
      roughness: 0.5,
      metalness: 0.1,
    })
    if (colorMode === "solid") {
      mat.color = new THREE.Color(customColor)
    }
    const mesh = new THREE.Mesh(geo, mat)
    const scene = new THREE.Scene()
    scene.add(mesh)
    return scene
  }

  const exportGLB = async () => {
    setExporting("glb")
    try {
      const mod = await import("three/examples/jsm/exporters/GLTFExporter.js")
      const { GLTFExporter } = mod
      const scene = getScene()
      if (!scene) return

      const exporter = new GLTFExporter()
      exporter.parse(
        scene,
        (glb: unknown) => {
          const blob = glb instanceof ArrayBuffer
            ? new Blob([glb], { type: "application/octet-stream" })
            : new Blob([JSON.stringify(glb)], { type: "application/json" })
          downloadBlob(blob, "logo-voxel.glb")
          toast("GLB exported!", "success")
        },
        (err: unknown) => {
          console.error(err)
          toast("Export failed", "error")
        },
        { binary: true }
      )
    } catch { toast("Export failed", "error") }
    finally { setExporting(null) }
  }

  const exportOBJ = async () => {
    setExporting("obj")
    try {
      const mod = await import("three/examples/jsm/exporters/OBJExporter.js")
      const { OBJExporter } = mod
      const scene = getScene()
      if (!scene) return

      const exporter = new OBJExporter()
      const result = exporter.parse(scene)
      downloadBlob(new Blob([result], { type: "text/plain" }), "logo-voxel.obj")
      toast("OBJ exported!", "success")
    } catch { toast("Export failed", "error") }
    finally { setExporting(null) }
  }

  const exportJSON = () => {
    setExporting("json")
    if (!flatArray) { setExporting(null); return }

    const voxels: { x: number; y: number; z: number; r: number; g: number; b: number }[] = []
    for (let i = 0; i < flatArray.length; i += 6) {
      voxels.push({
        x: flatArray[i], y: flatArray[i + 1], z: flatArray[i + 2],
        r: flatArray[i + 3], g: flatArray[i + 4], b: flatArray[i + 5],
      })
    }
    const json = JSON.stringify({ voxels, resolution: selectedResolution, heightMultiplier, colorMode }, null, 2)
    downloadBlob(new Blob([json], { type: "application/json" }), "logo-voxel.json")
    toast("JSON exported!", "success")
    setExporting(null)
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">Export</p>
      <div className="flex gap-1.5">
        <button onClick={exportGLB} disabled={!hasData || exporting !== null}
          className="flex-1 text-xs py-2 rounded-lg bg-accent-violet text-white font-medium hover:bg-accent-violet/80 disabled:opacity-40 transition-all duration-150 ease-out-quart active:scale-[0.97]">
          {exporting === "glb" ? "..." : "GLB"}
        </button>
        <button onClick={exportOBJ} disabled={!hasData || exporting !== null}
          className="flex-1 text-xs py-2 rounded-lg bg-dark-surface border border-dark-border text-gray-300 hover:border-gray-500 disabled:opacity-40 transition-all duration-150 ease-out-quart active:scale-[0.97]">
          {exporting === "obj" ? "..." : "OBJ"}
        </button>
        <button onClick={exportJSON} disabled={!hasData || exporting !== null}
          className="flex-1 text-xs py-2 rounded-lg bg-dark-surface border border-dark-border text-gray-300 hover:border-gray-500 disabled:opacity-40 transition-all duration-150 ease-out-quart active:scale-[0.97]">
          {exporting === "json" ? "..." : "JSON"}
        </button>
      </div>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
