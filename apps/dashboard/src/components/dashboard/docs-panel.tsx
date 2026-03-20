import { useEffect, useRef, useState } from "react"

interface DocsPanelProps {
  open: boolean
  siteUrl: string
}

const MIN_WIDTH = 280
const MAX_WIDTH = 720
const DEFAULT_WIDTH = 380
const STORAGE_KEY = "sf-docs-width"

export function DocsPanel({ open, siteUrl }: DocsPanelProps) {
  const [width, setWidth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const n = parseInt(stored, 10)
        if (!isNaN(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n
      }
    } catch {}
    return DEFAULT_WIDTH
  })

  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return
      // dragging the left edge: moving mouse left increases width
      const delta = startX.current - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
      setWidth(newWidth)
    }

    function onMouseUp() {
      if (!isResizing.current) return
      isResizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      try {
        localStorage.setItem(STORAGE_KEY, String(startWidth.current))
      } catch {}
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  // Persist width after resize ends via a separate effect watching `width`
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(width))
    } catch {}
  }, [width])

  function onHandleMouseDown(e: React.MouseEvent) {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  return (
    <div
      style={{ width: open ? width : 0 }}
      className={
        open
          ? "relative flex shrink-0 flex-col border-l-2 border-zinc-900 bg-white overflow-hidden transition-none"
          : "hidden"
      }
    >
      {/* Drag handle on left edge */}
      <div
        onMouseDown={onHandleMouseDown}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/30 z-10 transition-colors"
        title="Drag to resize"
      />

      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">Documentation</span>
        <span className="text-[10px] text-zinc-400">stackfox.dev</span>
      </div>

      {/* iframe */}
      <iframe
        src={siteUrl}
        title="StackFox Documentation"
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  )
}
