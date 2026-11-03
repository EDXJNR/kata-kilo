import { useEffect, useState } from 'react'

export default function OfflineStatusBar() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    function on() {
      setOnline(true)
    }
    function off() {
      setOnline(false)
    }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="bg-amber-600/90 text-bone text-center text-xs py-1.5 px-3 font-medium"
    >
      You&apos;re offline — Train &amp; saved pages work; data syncs when you reconnect.
    </div>
  )
}
