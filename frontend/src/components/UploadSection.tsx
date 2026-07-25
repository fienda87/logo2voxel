import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { useVoxelStore } from "../store/voxelStore"
import { postImage } from "../utils/api"
import { toast } from "../utils/toast"
import { SampleGallery } from "./SampleGallery"
import { LoadingSkeleton } from "./LoadingSkeleton"

export function UploadSection() {
  const {
    uploadedImage, setUploadedImage,
    isProcessing, setProcessing,
    setProcessingProgress, setProcessingStage,
    setVoxelData, setDominantColors, removeBackground,
  } = useVoxelStore()

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setUploadedImage(url)
    setProcessing(true)
    setProcessingProgress(0)

    try {
      const res = await postImage(file, removeBackground, 1.5, (stage, progress) => {
        setProcessingStage(stage)
        setProcessingProgress(progress)
      })
      setVoxelData(res.voxels)
      setDominantColors(res.metadata.dominant_colors || [])
      toast("Logo converted to 3D voxels!", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to convert logo", "error")
    } finally {
      setProcessing(false)
      setProcessingStage("")
    }
  }, [removeBackground, setUploadedImage, setProcessing, setProcessingProgress, setProcessingStage, setVoxelData])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isProcessing,
  })

  if (isProcessing) {
    return <LoadingSkeleton />
  }

  return (
    <div className="p-4 space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center ${
          isDragActive
            ? "border-accent-violet bg-accent-violet/10"
            : "border-dark-border hover:border-accent-violet/50 hover:bg-dark-surface/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-500" />
        <p className="text-sm text-gray-400">
          {isDragActive ? "Drop logo here" : "Drag & drop logo (PNG/JPG up to 10MB)"}
        </p>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-gray-300 hover:bg-dark-border transition-colors">
          Browse File
        </button>
      </div>

      {uploadedImage && (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-dark-surface/50 border border-dark-border">
          <img src={uploadedImage} alt="logo" className="w-10 h-10 object-contain rounded" />
          <span className="text-xs text-gray-400 truncate">Uploaded</span>
        </div>
      )}

      <SampleGallery />
    </div>
  )
}
