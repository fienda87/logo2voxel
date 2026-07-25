type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

let toastId = 0
let listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export function toast(message: string, type: ToastType = "info", duration: number = 3000) {
  const id = ++toastId
  toasts = [...toasts, { id, message, type }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, duration)
}

export function subscribe(fn: (toasts: Toast[]) => void) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

export type { Toast, ToastType }
