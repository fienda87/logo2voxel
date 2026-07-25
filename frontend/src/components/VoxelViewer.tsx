import { useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"
import type { OrbitControls as OrbitControlsType } from "three-stdlib"
import * as THREE from "three"
import { VoxelMesh } from "./VoxelMesh"
import { useVoxelStore } from "../store/voxelStore"
import { Camera, Grid3x3, RotateCcw } from "lucide-react"
import type { LightPreset } from "../utils/types"

const LIGHT_PRESETS: Record<LightPreset, { ambient: number; key: [number, number, number]; keyIntensity: number; keyColor: string; rim: [number, number, number]; rimIntensity: number; rimColor: string; fillIntensity: number; envIntensity: number }> = {
  studio: {
    ambient: 0.6,
    key: [10, 15, 10], keyIntensity: 1.5, keyColor: "#ffffff",
    rim: [-8, 12, -8], rimIntensity: 0.6, rimColor: "#38bdf8",
    fillIntensity: 0.3,
    envIntensity: 0.8,
  },
  warm: {
    ambient: 0.5,
    key: [12, 10, 8], keyIntensity: 1.3, keyColor: "#ffd08a",
    rim: [-10, 8, -6], rimIntensity: 0.5, rimColor: "#ff6b35",
    fillIntensity: 0.25,
    envIntensity: 0.6,
  },
  cyberpunk: {
    ambient: 0.3,
    key: [8, 12, 15], keyIntensity: 1.6, keyColor: "#00d4ff",
    rim: [-12, 8, -10], rimIntensity: 0.8, rimColor: "#ff00aa",
    fillIntensity: 0.2,
    envIntensity: 1.0,
  },
}

function SceneLights({ preset }: { preset: LightPreset }) {
  const p = LIGHT_PRESETS[preset]

  return (
    <>
      <ambientLight intensity={p.ambient} />
      <directionalLight position={new THREE.Vector3(...p.key)} intensity={p.keyIntensity} color={p.keyColor} castShadow shadow-mapSize={1024} />
      <directionalLight position={new THREE.Vector3(...p.rim)} intensity={p.rimIntensity} color={p.rimColor} />
      <directionalLight position={[0, 4, 0]} intensity={p.fillIntensity} color="#ffffff" />
    </>
  )
}

function SceneControls({ controlsRef }: { controlsRef: React.MutableRefObject<OrbitControlsType | null> }) {
  const showGrid = useVoxelStore((s) => s.showGrid)
  const lightPreset = useVoxelStore((s) => s.lightPreset)

  return (
    <>
      <SceneLights preset={lightPreset} />

      <Environment preset="studio" environmentIntensity={LIGHT_PRESETS[lightPreset].envIntensity} />

      {showGrid && (
        <Grid
          position={[0, -0.5, 0]}
          args={[30, 30]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={50}
          infiniteGrid
        />
      )}

      <VoxelMesh />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={2}
        maxDistance={500}
      />
    </>
  )
}

export function VoxelViewer() {
  const controlsRef = useRef<OrbitControlsType>(null)
  const screenshotRef = useRef<HTMLCanvasElement>(null)
  const voxelData = useVoxelStore((s) => s.voxelData)
  const selectedResolution = useVoxelStore((s) => s.selectedResolution)
  const toggleGrid = useVoxelStore((s) => s.toggleGrid)
  const flatArray = voxelData ? voxelData[String(selectedResolution)] : null

  const voxelCount = flatArray ? Math.floor(flatArray.length / 6) : 0

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(8, 6, 8)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "voxel-screenshot.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <>
      <Canvas
        ref={screenshotRef}
        camera={{ position: [8, 6, 8], fov: 45, far: 2000 }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)" }}
      >
        <SceneControls controlsRef={controlsRef} />
      </Canvas>

      <div className="absolute top-3 right-3 flex gap-1.5">
        <OverlayButton icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetCamera} tooltip="Reset Camera" />
        <OverlayButton icon={<Grid3x3 className="w-3.5 h-3.5" />} onClick={toggleGrid} tooltip="Toggle Grid" />
        <OverlayButton icon={<Camera className="w-3.5 h-3.5" />} onClick={handleScreenshot} tooltip="Screenshot" />
      </div>

      {voxelCount > 0 && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-dark-surface/80 border border-dark-border backdrop-blur-sm">
          <p className="text-[10px] font-mono text-gray-400">
            Voxels: <span className="text-gray-200">{voxelCount.toLocaleString()}</span>
          </p>
        </div>
      )}
    </>
  )
}

function OverlayButton({ icon, onClick, tooltip }: { icon: React.ReactNode; onClick: () => void; tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-1.5 rounded-lg bg-dark-surface/80 border border-dark-border text-gray-400 hover:text-white hover:bg-dark-surface transition-all duration-150 ease-out-quart active:scale-[0.95] backdrop-blur-sm"
    >
      {icon}
    </button>
  )
}
