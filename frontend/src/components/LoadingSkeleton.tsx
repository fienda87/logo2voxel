import { useVoxelStore } from "../store/voxelStore"


export function LoadingSkeleton() {
  const progress = useVoxelStore((s) => s.processingProgress)
  const stage = useVoxelStore((s) => s.processingStage)

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 animate-pulse">{stage}</p>
      </div>

      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-dark-surface rounded w-3/4" />
        <div className="h-4 bg-dark-surface rounded w-1/2" />
        <div className="h-4 bg-dark-surface rounded w-2/3" />
      </div>
    </div>
  )
}
