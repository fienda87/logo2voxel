import { useEffect, useState } from "react"
import { useVoxelStore } from "../store/voxelStore"
import { fetchSamples } from "../utils/api"

interface SampleData {
  id: string
  name: string
  imageUrl: string
  voxels: Record<string, number[]>
}

export function SampleGallery() {
  const [samples, setSamples] = useState<SampleData[]>([])
  const { setVoxelData, setUploadedImage } = useVoxelStore()

  useEffect(() => {
    fetchSamples().then((list) => {
      setSamples(list as SampleData[])
    }).catch(() => {})
  }, [])

  if (!samples.length) return null

  const handleSample = (s: SampleData) => {
    setUploadedImage(s.imageUrl)
    setVoxelData(s.voxels)
  }

  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Try a sample</p>
      <div className="flex flex-wrap gap-1.5">
        {samples.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSample(s)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-dark-surface border border-dark-border text-gray-400 hover:border-accent-violet/50 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {s.imageUrl && (
              <img src={s.imageUrl} alt="" className="w-4 h-4 object-contain" />
            )}
            {s.name}
          </button>
        ))}
      </div>
    </div>
  )
}
