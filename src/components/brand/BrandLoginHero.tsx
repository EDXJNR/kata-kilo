import { useTheme } from '@/context/ThemeContext'

/** Sign-in wordmark: dark PNG on black UI, light JPG on light UI. */
export default function BrandLoginHero({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <img
      src={isDark ? '/logo-login-dark.png' : '/logo-login.jpg'}
      alt="Kata Kilo — Healthier You. Lighter You."
      className={`w-full max-w-[min(100%,340px)] h-auto object-contain ${isDark ? '' : 'drop-shadow-sm'} ${className}`}
      draggable={false}
    />
  )
}
