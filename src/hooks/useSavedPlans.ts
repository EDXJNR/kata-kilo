import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SavedPlan } from '@/types/field-log'

let cache: SavedPlan[] | null = null
let cachePromise: Promise<SavedPlan[]> | null = null

export function invalidateSavedPlansCache() {
  cache = null
  cachePromise = null
}

async function loadSavedPlans(): Promise<SavedPlan[]> {
  if (cache) return cache
  if (!cachePromise) {
    cachePromise = api.plans.list().then((r) => {
      cache = r.plans
      return r.plans
    })
  }
  return cachePromise
}

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>(cache ?? [])
  const [loading, setLoading] = useState(!cache)

  const reload = useCallback(async () => {
    invalidateSavedPlansCache()
    setLoading(true)
    try {
      const next = await loadSavedPlans()
      setPlans(next)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { plans, loading, reload }
}

export function getCachedSavedPlans() {
  return cache ?? []
}
