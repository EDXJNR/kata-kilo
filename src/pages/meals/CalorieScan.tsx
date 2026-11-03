import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

type ScanResult = {
  mealName: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  note?: string
}

type ScanMode = 'photo' | 'barcode'

const CAL_TARGET = 2800

export default function CalorieScanPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: nutrition } = useAsyncData(() => api.nutrition.list())
  const [mode, setMode] = useState<ScanMode>('photo')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loggedCal = Math.round(nutrition?.totals.calories ?? 0)
  const remaining = Math.max(0, CAL_TARGET - loggedCal)

  async function onFile(file: File) {
    if (mode === 'barcode') {
      setError('Barcode lookup is coming soon — use photo scan for now.')
      return
    }
    setError(null)
    setResult(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    setLoading(true)
    try {
      const base64 = await fileToBase64(file)
      const res = await api.meals.scanPlate({ imageBase64: base64, mimeType: file.type })
      setResult(res.analysis)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  function openPicker() {
    inputRef.current?.click()
  }

  function resetScan() {
    setPreview(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function logMeal() {
    if (!result) return
    setSaving(true)
    setError(null)
    try {
      await api.nutrition.create({
        meal: result.mealName,
        calories: result.calories,
        protein_g: result.proteinG,
        carbs_g: result.carbsG,
        fat_g: result.fatG
      })
      navigate('/meals')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save meal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Calorie scan" subtitle="Estimate calories and macros from a meal photo." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 pb-8 gap-4 max-w-lg mx-auto font-body-hud bg-hud-surface min-h-full">
        <div className="flex items-center justify-between pt-2 lg:pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold">Today&apos;s budget</span>
            <p className="font-display text-sm font-bold text-hud-on">
              {remaining.toLocaleString()} kcal remaining
            </p>
          </div>
          <span className="text-xs font-display bg-hud-container-low text-hud-on-variant px-2.5 py-1 rounded-full">
            {loggedCal.toLocaleString()} / {CAL_TARGET.toLocaleString()} eaten
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-hud-container-low border border-hud-outline-variant/40">
          <ModeTab active={mode === 'photo'} onClick={() => setMode('photo')} icon="photo_camera" label="Photo scan" />
          <ModeTab active={mode === 'barcode'} onClick={() => setMode('barcode')} icon="qr_code_scanner" label="Barcode" />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onFile(f)
          }}
        />

        <section className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/5] max-h-[420px] shadow-md border border-hud-outline-variant/30">
          {preview ? (
            <img src={preview} alt="Meal preview" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950" />
          )}

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/30 rounded-xl" />
            <span className="absolute top-10 left-10 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
            <span className="absolute top-10 right-10 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
            <span className="absolute bottom-10 left-10 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
            <span className="absolute bottom-10 right-10 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />
          </div>

          <div className="absolute inset-x-0 top-0 p-3 flex justify-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              {mode === 'photo' ? 'Center plate in frame' : 'Align barcode in frame'}
            </span>
          </div>

          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
              <MaterialIcon name="progress_activity" className="text-[40px] text-emerald-300 animate-spin mb-3" />
              <span className="text-sm font-display font-semibold text-white">Analyzing meal…</span>
            </div>
          ) : null}

          {!preview && !loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <MaterialIcon name={mode === 'photo' ? 'restaurant' : 'qr_code_2'} className="text-[48px] text-white/40 mb-3" />
              <p className="text-sm text-white/80 max-w-[240px]">
                {mode === 'photo'
                  ? 'Good lighting helps — include the full plate for better macro estimates.'
                  : 'Scan packaged foods. Photo scan works for home-cooked meals.'}
              </p>
            </div>
          ) : null}
        </section>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hud-primary text-white font-display font-bold shadow-sm active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            <MaterialIcon name="photo_camera" className="text-[22px]" />
            {preview ? 'Retake or choose photo' : mode === 'photo' ? 'Open camera or gallery' : 'Scan barcode (beta)'}
          </button>
          {preview && !loading ? (
            <button
              type="button"
              onClick={resetScan}
              className="w-full py-2.5 rounded-xl border border-hud-outline-variant/60 text-hud-on-variant text-sm font-medium hover:bg-hud-container-low transition-colors"
            >
              Clear
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {result ? (
          <section className="bg-hud-container-lowest rounded-xl shadow-sm border border-hud-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-hud-outline-variant/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Scan result</span>
                  <h2 className="font-display text-lg font-bold text-hud-on leading-tight">{result.mealName}</h2>
                </div>
                <span className="font-display text-2xl font-bold text-hud-primary tabular-nums leading-none">
                  {result.calories}
                  <span className="text-xs text-hud-on-variant font-semibold ml-0.5">kcal</span>
                </span>
              </div>
              {result.note ? <p className="text-xs text-hud-on-variant mt-2 leading-relaxed">{result.note}</p> : null}
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              <MacroTile label="Protein" grams={result.proteinG} barClass="bg-emerald-600" />
              <MacroTile label="Carbs" grams={result.carbsG} barClass="bg-sky-500" />
              <MacroTile label="Fat" grams={result.fatG} barClass="bg-amber-500" />
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void logMeal()}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-hud-on text-white dark:text-hud-surface font-display font-bold flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
              >
                <MaterialIcon name="check_circle" className="text-[20px] text-emerald-300" filled />
                {saving ? 'Saving…' : 'Log to today\'s diary'}
              </button>
              <Link
                to="/meals"
                className="w-full py-2.5 text-center text-sm text-hud-primary font-semibold hover:underline"
              >
                Back to Eat without saving
              </Link>
            </div>
          </section>
        ) : null}

        <p className="text-[11px] text-hud-on-variant leading-relaxed px-1">
          AI estimates are best-effort — verify labels for medical or strict diets. When no vision API key is set, the
          worker returns a smart placeholder.
        </p>
      </div>
    </>
  )
}

function ModeTab({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-semibold transition-colors ${
        active ? 'bg-hud-container-lowest text-hud-primary shadow-sm' : 'text-hud-on-variant hover:text-hud-on'
      }`}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
      {label}
    </button>
  )
}

function MacroTile({ label, grams, barClass }: { label: string; grams: number; barClass: string }) {
  const pct = Math.min(100, (grams / 80) * 100)
  return (
    <div className="rounded-xl bg-hud-container-low p-2.5 border border-hud-outline-variant/30">
      <span className="text-[10px] uppercase tracking-wider text-hud-on-variant font-semibold">{label}</span>
      <p className="font-display text-lg font-bold text-hud-on tabular-nums mt-0.5">
        {Math.round(grams)}
        <span className="text-xs text-hud-on-variant font-medium">g</span>
      </p>
      <div className="w-full h-1.5 bg-hud-container-highest rounded-full mt-2 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result ?? '')
      const base64 = s.includes(',') ? s.split(',')[1] : s
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
