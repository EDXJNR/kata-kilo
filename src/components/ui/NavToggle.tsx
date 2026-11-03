/** Cursor-style sidebar toggle — icon only */
export default function NavToggle({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="flex items-center justify-center w-7 h-7 rounded-md text-fog hover:text-bone hover:bg-basalt2/80 transition-colors shrink-0"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        {collapsed ? (
          /* panel expand */
          <>
            <rect x="2" y="3" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6h6M10 9h6M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          /* panel collapse */
          <>
            <rect x="2" y="3" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6h6M10 9h6M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </>
        )}
      </svg>
    </button>
  )
}
