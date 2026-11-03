import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${wide ? 'sm:max-w-xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-line bg-basalt2 shadow-2xl shadow-primary/10 animate-page-in`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-basalt2/95 backdrop-blur px-5 py-4">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-bone">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center text-fog hover:text-bone hover:bg-basalt transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
