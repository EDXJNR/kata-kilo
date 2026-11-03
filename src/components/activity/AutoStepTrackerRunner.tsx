import { createContext, useContext, type ReactNode } from 'react'
import { useAutoStepTracker } from '@/hooks/useAutoStepTracker'

type Ctx = ReturnType<typeof useAutoStepTracker>

const AutoStepContext = createContext<Ctx | null>(null)

export function AutoStepProvider({ children }: { children: ReactNode }) {
  const tracker = useAutoStepTracker()
  return <AutoStepContext.Provider value={tracker}>{children}</AutoStepContext.Provider>
}

export function useAutoSteps() {
  const ctx = useContext(AutoStepContext)
  if (!ctx) throw new Error('useAutoSteps requires AutoStepProvider')
  return ctx
}
