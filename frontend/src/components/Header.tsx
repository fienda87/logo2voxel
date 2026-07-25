import { Box, Cpu } from "lucide-react"

export function Header() {
  return (
    <header className="h-12 px-4 flex items-center justify-between bg-dark-surface/80 border-b border-dark-border shrink-0">
      <div className="flex items-center gap-2">
        <Box className="w-5 h-5 text-accent-violet" />
        <span className="font-semibold text-sm tracking-tight">Logo2Voxel 3D</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <Cpu className="w-3 h-3 text-accent-emerald" />
        <span>Powered by <span className="text-accent-emerald">Groq</span> &amp; <span className="text-accent-cyan">R3F</span></span>
      </div>
    </header>
  )
}
