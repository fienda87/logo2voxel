import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useVoxelStore } from "../store/voxelStore"
import type { Resolution, ColorMode, MaterialStyle, LightPreset, TextVoxelMode } from "../utils/types"
import { postImage } from "../utils/api"
import { toast } from "../utils/toast"
import { fetchSamples } from "../utils/api"
import { Sparkles, Upload, Box, Type } from "lucide-react"
import { generateTextImage, voxelizeText } from "../utils/textToVoxel"
import { ExportPanel } from "./ExportPanel"

export function SidebarPanel() {
  const store = useVoxelStore()

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    store.setUploadedImage(URL.createObjectURL(file))
    store.setProcessing(true)
    store.setProcessingProgress(0)
    try {
      const res = await postImage(file, store.removeBackground, store.heightMultiplier, (stage, progress) => {
        store.setProcessingStage(stage)
        store.setProcessingProgress(progress)
      })
      store.setVoxelData(res.voxels)
      store.setDominantColors(res.metadata.dominant_colors || [])
      toast("Logo converted to 3D voxels", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Conversion failed", "error")
    } finally {
      store.setProcessing(false)
      store.setProcessingStage("")
    }
  }, [store.removeBackground])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: store.isProcessing,
  })

  const textInputVal = useVoxelStore((s) => s.textInput)
  const textModeVal = useVoxelStore((s) => s.textVoxelMode)
  useEffect(() => {
    const t = textInputVal.trim()
    if (!t) return
    const canvas = generateTextImage(t)
    const voxels = voxelizeText(canvas)
    store.setTextVoxelData(voxels)
    if (textModeVal === "logo") store.setTextVoxelMode("both")
  }, [textInputVal])

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 h-11 border-b border-zinc-800/80">
        <Box className="w-4.5 h-4.5 text-accent-violet" />
        <span className="text-sm font-semibold tracking-tight">Logo2Voxel</span>
        <span className="ml-auto text-[9px] text-accent-violet/70 font-medium tracking-wider uppercase border border-accent-violet/20 rounded-full px-2 py-0.5 bg-accent-violet/[0.04]">
          Groq AI
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-4">

        {/* Upload Zone */}
        <div {...getRootProps()} className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-150 ease-out-quart active:scale-[0.99] text-center ${
          isDragActive ? "border-accent-violet bg-accent-violet/8" : "border-zinc-700/60 hover:border-zinc-500/50"
        }`}>
          <input {...getInputProps()} />
          <Upload className="w-5 h-5 text-zinc-500" />
          <p className="text-[11px] text-zinc-500 leading-snug">
            {isDragActive ? "Drop logo here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-[9px] text-zinc-600">PNG / JPG up to 10MB</p>
        </div>

        {/* Sample Chips + Uploaded Image */}
        <div className="flex items-center gap-2 flex-wrap">
          <SampleGallery />
          {store.uploadedImage && (
            <img src={store.uploadedImage} alt="" className="w-7 h-7 object-contain rounded border border-zinc-800" />
          )}
        </div>

        {/* Groq AI Banner */}
        {store.voxelData && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent-emerald/[0.04] border border-accent-emerald/15 ai-banner-enter">
            <Sparkles className="w-3.5 h-3.5 mt-px text-accent-emerald shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-accent-emerald">AI Recommendation</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">
                Resolution {store.selectedResolution} &middot; Height {store.heightMultiplier.toFixed(1)}x &middot; {store.colorMode}
              </p>
            </div>
          </div>
        )}

        {/* ===== GEOMETRY CONTROLS ===== */}
        <SectionLabel>Geometry</SectionLabel>

        <SegmentedControl
          label="Resolution"
          value={String(store.selectedResolution)}
          onChange={(v) => store.setSelectedResolution(Number(v) as Resolution)}
          options={[
            { value: "16", label: "16" },
            { value: "32", label: "32" },
            { value: "48", label: "48" },
            { value: "64", label: "64" },
          ]}
          accent="violet"
        />

        <SliderControl
          label="Height"
          value={store.heightMultiplier}
          min={0.5}
          max={2.5}
          step={0.1}
          onChange={store.setHeightMultiplier}
          display={`${store.heightMultiplier.toFixed(1)}x`}
        />

        <SliderControl
          label="Voxel Gap"
          value={store.voxelGap}
          min={0}
          max={0.2}
          step={0.01}
          onChange={store.setVoxelGap}
          display={store.voxelGap > 0 ? `${store.voxelGap.toFixed(2)}` : "None"}
        />

        <ToggleRow label="Invert Heightmap" checked={store.invertHeight} onChange={store.toggleInvertHeight} />

        {/* ===== COLOR & STYLE ===== */}
        <SectionLabel>Color &amp; Style</SectionLabel>

        <SegmentedControl
          label="Color Mode"
          value={store.colorMode}
          onChange={(v) => store.setColorMode(v as ColorMode)}
          options={[
            { value: "rgb", label: "RGB" },
            { value: "grayscale", label: "Gray" },
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Grad" },
          ]}
          accent="cyan"
        />

        {store.colorMode === "solid" && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={store.customColor}
                onChange={(e) => store.setCustomColor(e.target.value)}
                className="w-7 h-7 rounded-md border border-zinc-700/60 cursor-pointer bg-transparent shrink-0"
              />
              <span className="text-[10px] font-mono text-zinc-400">{store.customColor}</span>
            </div>

            {store.dominantColors.length > 0 && (
              <div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">AI Palette</p>
                <div className="flex gap-1.5">
                  {store.dominantColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => { store.setCustomColor(c); store.setColorMode("solid") }}
                      className="w-[18px] h-[18px] rounded-sm border border-zinc-700/40 hover:scale-125 transition-transform duration-150 ease-out-quart active:scale-75"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {store.colorMode === "gradient" && (
          <div className="flex gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Top</span>
              <input
                type="color"
                value={store.gradientTop}
                onChange={(e) => store.setGradientTop(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border border-zinc-700/60"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Bot</span>
              <input
                type="color"
                value={store.gradientBottom}
                onChange={(e) => store.setGradientBottom(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border border-zinc-700/60"
              />
            </div>
          </div>
        )}

        <SegmentedControl
          label="Material"
          value={store.materialStyle}
          onChange={(v) => store.setMaterialStyle(v as MaterialStyle)}
          options={[
            { value: "matte", label: "Matte" },
            { value: "glossy", label: "Glossy" },
            { value: "wireframe", label: "Wire" },
          ]}
          accent="amber"
        />

        {/* ===== TEXT VOXEL ===== */}
        <SectionLabel>Text Voxel</SectionLabel>

        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            value={store.textInput}
            onChange={(e) => store.setTextInput(e.target.value.slice(0, 20))}
            placeholder="Type text..."
            className="flex-1 bg-zinc-800/40 border border-zinc-700/40 rounded-md px-2 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent-violet/50 transition-colors duration-150"
          />
        </div>

        <SegmentedControl
          label="Mode"
          value={store.textVoxelMode}
          onChange={(v) => store.setTextVoxelMode(v as TextVoxelMode)}
          options={[
            { value: "logo", label: "Logo" },
            { value: "text", label: "Text" },
            { value: "both", label: "Both" },
          ]}
          accent="violet"
        />

        <div className="space-y-1">
          <SliderControl
            label="Offset X"
            value={store.textOffsetX}
            min={-20}
            max={20}
            step={0.5}
            onChange={store.setTextOffsetX}
            display={store.textOffsetX.toFixed(1)}
          />
          <SliderControl
            label="Offset Y"
            value={store.textOffsetY}
            min={-20}
            max={20}
            step={0.5}
            onChange={store.setTextOffsetY}
            display={store.textOffsetY.toFixed(1)}
          />
          <SliderControl
            label="Offset Z"
            value={store.textOffsetZ}
            min={-20}
            max={20}
            step={0.5}
            onChange={store.setTextOffsetZ}
            display={store.textOffsetZ.toFixed(1)}
          />
        </div>

        {/* ===== SCENE SETTINGS ===== */}
        <SectionLabel>Scene</SectionLabel>

        <SegmentedControl
          label="Lighting"
          value={store.lightPreset}
          onChange={(v) => store.setLightPreset(v as LightPreset)}
          options={[
            { value: "studio", label: "Studio" },
            { value: "warm", label: "Warm" },
            { value: "cyberpunk", label: "Neon" },
          ]}
          accent="violet"
        />

        <ToggleRow label="Pedestal Base" checked={store.showPedestal} onChange={store.togglePedestal} />
        <ToggleRow label="Remove Background" checked={store.removeBackground} onChange={store.toggleRemoveBackground} />
      </div>

      {/* Export Footer (pinned) */}
      <div className="shrink-0 px-3 py-3 border-t border-zinc-800/80">
        <ExportPanel />
      </div>
    </div>
  )
}

/* ─── Helped Components ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">{children}</p>
  )
}

function SliderControl({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
        <span className="text-[10px] font-mono text-zinc-300 tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-8 h-4 rounded-full transition-colors duration-200 ease-out-quart active:scale-[0.95] ${checked ? "bg-accent-violet" : "bg-zinc-700/60"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-out-quart ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  )
}

function SegmentedControl({ label, value, onChange, options, accent }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; accent: "violet" | "cyan" | "amber"
}) {
  const activeMap = {
    violet: "bg-accent-violet/15 border-accent-violet/50 text-accent-violet",
    cyan: "bg-accent-cyan/15 border-accent-cyan/50 text-accent-cyan",
    amber: "bg-accent-amber/15 border-accent-amber/50 text-accent-amber",
  }
  const inactive = "bg-transparent border-zinc-700/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500/50"

  return (
    <div>
      <p className="text-[10px] text-zinc-400 font-medium mb-1.5">{label}</p>
      <div className="flex gap-[3px]">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors duration-150 ease-out-quart active:scale-[0.97] font-medium ${
              value === o.value ? activeMap[accent] : inactive
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SampleGallery() {
  const store = useVoxelStore()
  const [samples, setSamples] = useState<{ id: string; name: string; imageUrl: string; voxels: Record<string, number[]> }[]>([])

  useEffect(() => {
    fetchSamples().then((list) => setSamples(list as any)).catch(() => {})
  }, [])

  if (!samples.length) return null

  return (
    <>
      {samples.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            store.setUploadedImage(s.imageUrl)
            store.setVoxelData(s.voxels)
          }}
          className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-800/40 border border-zinc-700/40 text-zinc-400 hover:border-accent-violet/40 hover:text-zinc-200 transition-colors duration-150 ease-out-quart active:scale-[0.97]"
        >
          {s.name}
        </button>
      ))}
    </>
  )
}
