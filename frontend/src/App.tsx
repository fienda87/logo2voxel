import { SidebarPanel } from "./components/SidebarPanel"
import { VoxelViewer } from "./components/VoxelViewer"
import { ToastContainer } from "./components/ToastContainer"

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0a0a0c] text-white font-sans">
      <aside className="w-[340px] shrink-0 h-full flex flex-col bg-[#121214] border-r border-zinc-800/80">
        <SidebarPanel />
      </aside>
      <main className="flex-1 h-full relative">
        <VoxelViewer />
      </main>
      <ToastContainer />
    </div>
  )
}
