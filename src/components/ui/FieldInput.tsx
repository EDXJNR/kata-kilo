import { useState, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react'

const fieldClass =
  'w-full rounded-lg border border-line bg-basalt px-3 py-2.5 text-sm text-bone outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-fog text-[10px] font-medium uppercase tracking-widest mb-1.5">
      {children}
    </label>
  )
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />
}

export function PasswordField({
  inputRef,
  autoComplete,
  id,
  required,
  minLength,
  placeholder
}: {
  inputRef?: Ref<HTMLInputElement>
  autoComplete?: string
  id?: string
  required?: boolean
  minLength?: number
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name="password"
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        spellCheck={false}
        className={`${fieldClass} pr-14`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-fog text-[10px] font-mono uppercase tracking-widest hover:text-bone"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-[72px] resize-y ${props.className ?? ''}`} />
}

export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`rounded-lg bg-primary text-basalt text-sm font-semibold px-4 py-2.5 disabled:opacity-60 hover:brightness-110 transition-all ${props.className ?? ''}`}
    >
      {loading ? 'Saving…' : children}
    </button>
  )
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
