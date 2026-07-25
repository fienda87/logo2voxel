import { useState } from "react"
import { useVoxelStore } from "../store/voxelStore"
import type { Resolution, ColorMode, MaterialStyle } from "../utils/types"
import { ExportPanel } from "./ExportPanel"
import { Sparkles } from "lucide-react"

export function SettingsPanel() {
  const store = useVoxelStore()
  const hasData = !!store.voxelData

  return (
    <div className="p-4 space-y-4 border-t border-dark-border overflow-y-auto">
      {hasData && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent-emerald/5 border border-accent-emerald/20">
          <Sparkles className="w-4 h-4 mt-0.5 text-accent-emerald shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-accent-emerald">Groq AI Insight</p>
            <p className="text-[10px] text-gray-400">
              Logo terdeteksi. Rekomendasi: {store.selectedResolution}, tinggi {store.heightMultiplier.toFixed(1)}x, mode {store.colorMode}.
            </p>
          </div>
        </div>
      )}

      <ResolutionControl />

      <SliderControl label="Height" value={store.heightMultiplier} min={0.5} max={2.5} step={0.1} onChange={store.setHeightMultiplier} suffix="x" />

      <ColorModeSection />

      <ToggleRow label="Invert Height" checked={store.invertHeight} onChange={store.toggleInvertHeight} />

      <SliderControl label="Voxel Gap" value={store.voxelGap} min={0} max={0.2} step={0.01} onChange={store.setVoxelGap} />

      <MaterialControl />

      <ToggleRow label="Pedestal Base" checked={store.showPedestal} onChange={store.togglePedestal} />

      <ToggleRow label="Remove BG" checked={store.removeBackground} onChange={store.toggleRemoveBackground} />

      <ExportPanel />
    </div>
  )
}

function ResolutionControl() {
  const v = useVoxelStore((s) => s.selectedResolution)
  const set = useVoxelStore((s) => s.setSelectedResolution)
  const disabled = useVoxelStore((s) => s.isProcessing)
  const opts: Resolution[] = [16, 32, 48, 64]
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">Resolution</p>
      <div className="flex gap-1">
        {opts.map((r) => (
          <button key={r} disabled={disabled} onClick={() => set(r)}
            className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
              v === r ? "bg-accent-violet/20 border-accent-violet text-accent-violet" : "bg-dark-surface border-dark-border text-gray-400 hover:border-gray-500"
            }`}>{r}</button>
        ))}
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step, onChange, suffix = "" }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-300">{value.toFixed(step < 0.1 ? 2 : 1)}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full bg-dark-border accent-accent-violet cursor-pointer"
      />
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <button onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-accent-violet" : "bg-dark-border"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  )
}

function ColorModeSection() {
  const mode = useVoxelStore((s) => s.colorMode)
  const setMode = useVoxelStore((s) => s.setColorMode)
  const customColor = useVoxelStore((s) => s.customColor)
  const setCustomColor = useVoxelStore((s) => s.setCustomColor)
  const dominantColors = useVoxelStore((s) => s.dominantColors)
  const [showPicker, setShowPicker] = useState(false)

  const modes: { key: ColorMode; label: string }[] = [
    { key: "rgb", label: "RGB" },
    { key: "grayscale", label: "Gray" },
    { key: "solid", label: "Solid" },
    { key: "gradient", label: "Gradient" },
  ]

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">Color Mode</p>
      <div className="flex gap-1 mb-2">
        {modes.map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${
              mode === m.key ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan" : "bg-dark-surface border-dark-border text-gray-400 hover:border-gray-500"
            }`}>{m.label}</button>
        ))}
      </div>

      {mode === "solid" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="w-8 h-8 rounded-lg border border-dark-border"
              style={{ backgroundColor: customColor }}
            />
            <span className="text-xs font-mono text-gray-400">{customColor}</span>
          </div>
          {showPicker && (
            <input type="color" value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer bg-transparent border border-dark-border"
            />
          )}

          {dominantColors.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Palette (AI Detected)</p>
              <div className="flex gap-1.5">
                {dominantColors.map((c, i) => (
                  <button key={i} onClick={() => { setCustomColor(c); setMode("solid") }}
                    className="w-6 h-6 rounded-md border border-dark-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "gradient" && (
        <GradientControl />
      )}
    </div>
  )
}

function GradientControl() {
  const top = useVoxelStore((s) => s.gradientTop)
  const bottom = useVoxelStore((s) => s.gradientBottom)
  const setTop = useVoxelStore((s) => s.setGradientTop)
  const setBottom = useVoxelStore((s) => s.setGradientBottom)

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500">Top</span>
        <input type="color" value={top} onChange={(e) => setTop(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border border-dark-border" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500">Bottom</span>
        <input type="color" value={bottom} onChange={(e) => setBottom(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border border-dark-border" />
      </div>
    </div>
  )
}

function MaterialControl() {
  const v = useVoxelStore((s) => s.materialStyle)
  const set = useVoxelStore((s) => s.setMaterialStyle)
  const opts: { key: MaterialStyle; label: string }[] = [
    { key: "matte", label: "Matte" },
    { key: "glossy", label: "Glossy" },
    { key: "wireframe", label: "Wire" },
  ]
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">Material</p>
      <div className="flex gap-1">
        {opts.map((o) => (
          <button key={o.key} onClick={() => set(o.key)}
            className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${
              v === o.key ? "bg-accent-amber/20 border-accent-amber text-accent-amber" : "bg-dark-surface border-dark-border text-gray-400 hover:border-gray-500"
            }`}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
