import { create } from "zustand"
import type { Resolution, ColorMode, MaterialStyle, LightPreset, TextVoxelMode } from "../utils/types"

interface VoxelState {
  uploadedImage: string | null
  isProcessing: boolean
  processingProgress: number
  processingStage: string

  voxelData: Record<string, number[]> | null
  dominantColors: string[]

  selectedResolution: Resolution
  heightMultiplier: number
  colorMode: ColorMode
  customColor: string
  removeBackground: boolean
  showGrid: boolean

  materialStyle: MaterialStyle
  invertHeight: boolean
  voxelGap: number
  showPedestal: boolean
  gradientTop: string
  gradientBottom: string
  lightPreset: LightPreset

  textInput: string
  textVoxelData: number[] | null
  textVoxelMode: TextVoxelMode
  textOffsetX: number
  textOffsetY: number
  textOffsetZ: number

  setUploadedImage: (url: string | null) => void
  setProcessing: (v: boolean) => void
  setProcessingProgress: (v: number) => void
  setProcessingStage: (v: string) => void
  setVoxelData: (data: Record<string, number[]>) => void
  setDominantColors: (colors: string[]) => void
  setSelectedResolution: (res: Resolution) => void
  setHeightMultiplier: (h: number) => void
  setColorMode: (mode: ColorMode) => void
  setCustomColor: (c: string) => void
  toggleRemoveBackground: () => void
  toggleGrid: () => void
  setMaterialStyle: (s: MaterialStyle) => void
  toggleInvertHeight: () => void
  setVoxelGap: (g: number) => void
  togglePedestal: () => void
  setGradientTop: (c: string) => void
  setGradientBottom: (c: string) => void
  setLightPreset: (p: LightPreset) => void
  setTextInput: (t: string) => void
  setTextVoxelData: (d: number[] | null) => void
  setTextVoxelMode: (m: TextVoxelMode) => void
  setTextOffsetX: (v: number) => void
  setTextOffsetY: (v: number) => void
  setTextOffsetZ: (v: number) => void
  resetAll: () => void
}

const initialState = {
  uploadedImage: null as string | null,
  isProcessing: false,
  processingProgress: 0,
  processingStage: "",
  voxelData: null as Record<string, number[]> | null,
  dominantColors: [] as string[],
  selectedResolution: 32 as Resolution,
  heightMultiplier: 1.5,
  colorMode: "rgb" as ColorMode,
  customColor: "#8b5cf6",
  removeBackground: true,
  showGrid: true,
  materialStyle: "matte" as MaterialStyle,
  invertHeight: false,
  voxelGap: 0,
  showPedestal: false,
  gradientTop: "#ef4444",
  gradientBottom: "#8b5cf6",
  lightPreset: "studio" as LightPreset,
  textInput: "",
  textVoxelData: null as number[] | null,
  textVoxelMode: "logo" as TextVoxelMode,
  textOffsetX: 0,
  textOffsetY: 0,
  textOffsetZ: 0,
}

export const useVoxelStore = create<VoxelState>((set) => ({
  ...initialState,

  setUploadedImage: (url) => set({ uploadedImage: url }),
  setProcessing: (v) => set({ isProcessing: v }),
  setProcessingProgress: (v) => set({ processingProgress: v }),
  setProcessingStage: (v) => set({ processingStage: v }),
  setVoxelData: (data) => set({ voxelData: data }),
  setDominantColors: (colors) => set({ dominantColors: colors }),
  setSelectedResolution: (res) => set({ selectedResolution: res }),
  setHeightMultiplier: (h) => set({ heightMultiplier: h }),
  setColorMode: (mode) => set({ colorMode: mode }),
  setCustomColor: (c) => set({ customColor: c }),
  toggleRemoveBackground: () => set((s) => ({ removeBackground: !s.removeBackground })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setMaterialStyle: (s) => set({ materialStyle: s }),
  toggleInvertHeight: () => set((s) => ({ invertHeight: !s.invertHeight })),
  setVoxelGap: (g) => set({ voxelGap: g }),
  togglePedestal: () => set((s) => ({ showPedestal: !s.showPedestal })),
  setGradientTop: (c) => set({ gradientTop: c }),
  setGradientBottom: (c) => set({ gradientBottom: c }),
  setLightPreset: (p) => set({ lightPreset: p }),
  setTextInput: (t) => set({ textInput: t }),
  setTextVoxelData: (d) => set({ textVoxelData: d }),
  setTextVoxelMode: (m) => set({ textVoxelMode: m }),
  setTextOffsetX: (v) => set({ textOffsetX: v }),
  setTextOffsetY: (v) => set({ textOffsetY: v }),
  setTextOffsetZ: (v) => set({ textOffsetZ: v }),
  resetAll: () => set({ ...initialState }),
}))
