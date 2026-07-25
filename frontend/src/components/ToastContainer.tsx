import { useEffect, useState, useRef } from "react"
import { subscribe } from "../utils/toast"
import type { Toast } from "../utils/toast"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const COLORS = {
  success: "border-accent-emerald text-accent-emerald",
  error: "border-accent-red text-accent-red",
  info: "border-accent-cyan text-accent-cyan",
}

type ToastItem = { toast: Toast; state: "entering" | "entered" | "exiting" }

export function ToastContainer() {
  const [items, setItems] = useState<Map<number, ToastItem>>(new Map())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return subscribe((incoming) => {
      setItems((prev) => {
        const next = new Map(prev)

        for (const t of incoming) {
          if (next.has(t.id)) {
            const existing = next.get(t.id)!
            if (existing.state === "exiting") {
              next.set(t.id, { toast: t, state: "entered" })
            }
          } else {
            next.set(t.id, { toast: t, state: "entering" })
          }
        }

        for (const [id, item] of next) {
          if (item.state !== "exiting" && !incoming.find((t) => t.id === id)) {
            next.set(id, { ...item, state: "exiting" })
          }
        }

        return next
      })
    })
  }, [])

  useEffect(() => {
    const entering = [...items.values()].filter((v) => v.state === "entering")
    if (entering.length === 0) return
    rafRef.current = requestAnimationFrame(() => {
      setItems((prev) => {
        const next = new Map(prev)
        for (const { toast } of entering) {
          const item = next.get(toast.id)
          if (item && item.state === "entering") {
            next.set(toast.id, { ...item, state: "entered" })
          }
        }
        return next
      })
    })
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [items])

  useEffect(() => {
    const exiting = [...items.values()].filter((v) => v.state === "exiting")
    if (exiting.length === 0) return
    timerRef.current = setTimeout(() => {
      setItems((prev) => {
        const next = new Map(prev)
        for (const { toast } of exiting) {
          const item = next.get(toast.id)
          if (item && item.state === "exiting") {
            next.delete(toast.id)
          }
        }
        return next
      })
    }, 180)
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current) }
  }, [items])

  if (items.size === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-xs">
      {[...items.values()].map(({ toast: t, state }) => {
        const Icon = ICONS[t.type]
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg border bg-dark-surface/95 backdrop-blur-sm shadow-lg ${COLORS[t.type]} ${
              state === "entering" ? "toast-enter" :
              state === "entered" ? "toast-enter-active" :
              "toast-exit-active"
            }`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-200 flex-1">{t.message}</p>
            <button onClick={() => {}} className="text-gray-500 hover:text-white transition-colors duration-150">
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
