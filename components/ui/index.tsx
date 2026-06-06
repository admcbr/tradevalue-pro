'use client'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, forwardRef } from 'react'

const C = {
  bg: '#09090E', card: '#0E0E16', card2: '#141422', card3: '#1A1A2E',
  border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', accentDark: '#4F6AE6',
  success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

// ── Badge ──────────────────────────────────────────────────────────────
const badgeMap = {
  green:  { bg: 'rgba(52,217,138,0.1)',  color: '#34D98A', border: 'rgba(52,217,138,0.2)' },
  red:    { bg: 'rgba(248,113,113,0.1)', color: '#F87171', border: 'rgba(248,113,113,0.2)' },
  amber:  { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24', border: 'rgba(251,191,36,0.2)' },
  blue:   { bg: 'rgba(99,130,255,0.1)',  color: '#6382FF', border: 'rgba(99,130,255,0.2)' },
  purple: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.2)' },
  gray:   { bg: 'rgba(255,255,255,0.05)', color: '#8080AA', border: 'rgba(255,255,255,0.08)' },
}

export function Badge({ variant = 'gray', children, style }: {
  variant?: keyof typeof badgeMap; children: React.ReactNode; style?: React.CSSProperties
}) {
  const s = badgeMap[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      ...style,
    }}>{children}</span>
  )
}

// ── Button ─────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle'; size?: 'sm' | 'md' | 'lg'
}

const btnVariants = {
  primary: {
    background: 'linear-gradient(135deg, #6382FF, #A78BFA)',
    color: '#fff', border: 'none',
    boxShadow: '0 0 24px rgba(99,130,255,0.35), 0 2px 8px rgba(0,0,0,0.3)',
  },
  ghost: {
    background: '#141422', color: '#8080AA',
    border: '1px solid #282840', boxShadow: 'none',
  },
  danger: {
    background: 'rgba(248,113,113,0.08)', color: '#F87171',
    border: '1px solid rgba(248,113,113,0.2)', boxShadow: 'none',
  },
  subtle: {
    background: 'rgba(255,255,255,0.04)', color: '#8080AA',
    border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'none',
  },
}
const btnSizes = {
  sm: { padding: '7px 14px', fontSize: 12, borderRadius: 8 },
  md: { padding: '9px 18px', fontSize: 13, borderRadius: 10 },
  lg: { padding: '11px 24px', fontSize: 14, borderRadius: 11 },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', style, children, ...props }, ref) => (
    <button ref={ref} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.2s', outline: 'none',
      opacity: props.disabled ? 0.4 : 1,
      ...btnVariants[variant], ...btnSizes[size], ...style,
    }} {...props}>{children}</button>
  )
)
Button.displayName = 'Button'

// ── Input / Select shared style ─────────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  fontSize: 13, fontWeight: 500, color: C.text, fontFamily: 'inherit',
  background: C.card2, border: `1px solid ${C.border2}`,
  outline: 'none', transition: 'border-color 0.2s',
}

// ── Input ──────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label htmlFor={inputId} style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</label>}
        <input ref={ref} id={inputId}
          style={{ ...fieldStyle, ...style }}
          onFocus={e => { e.target.style.borderColor = 'rgba(99,130,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,130,255,0.08)' }}
          onBlur={e => { e.target.style.borderColor = C.border2; e.target.style.boxShadow = 'none' }}
          {...props}
        />
        {error && <p style={{ fontSize: 11, color: C.danger }}>{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ── Select ─────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function Select({ label, error, options, placeholder, style, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label htmlFor={selectId} style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</label>}
      <select id={selectId}
        style={{ ...fieldStyle, color: props.value ? C.text : C.muted, cursor: 'pointer', ...style }}
        onFocus={e => { e.target.style.borderColor = 'rgba(99,130,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,130,255,0.08)' }}
        onBlur={e => { e.target.style.borderColor = C.border2; e.target.style.boxShadow = 'none' }}
        {...props}
      >
        {placeholder && <option value="" style={{ background: C.card2, color: C.muted }}>{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value} style={{ background: C.card2, color: C.text }}>{o.label}</option>)}
      </select>
      {error && <p style={{ fontSize: 11, color: C.danger }}>{error}</p>}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────
export function Card({ children, style, glow }: {
  children: React.ReactNode; style?: React.CSSProperties; glow?: boolean
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      boxShadow: glow ? '0 0 40px rgba(99,130,255,0.06), 0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.3)',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {glow && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,130,255,0.025) 0%, transparent 60%)', pointerEvents: 'none' }} />}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}

// ── SectionLabel ────────────────────────────────────────────────────────
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 800, color: C.muted2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, ...style }}>
      {children}
    </p>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────
export function StatCard({ label, value, delta, deltaPositive, valueColor, icon }: {
  label: string; value: string; delta?: string; deltaPositive?: boolean; valueColor?: string; icon?: React.ReactNode
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
          {icon && <span style={{ opacity: 0.25 }}>{icon}</span>}
        </div>
        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, marginBottom: 8, color: valueColor || C.text }}>{value}</p>
        {delta && <p style={{ fontSize: 11, fontWeight: 600, color: deltaPositive !== false ? C.success : C.danger }}>{delta}</p>}
      </div>
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: React.CSSProperties }) {
  return <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1E1E30 20%, #1E1E30 80%, transparent)', ...style }} />
}

// ── RemovableTag ───────────────────────────────────────────────────────
export function RemovableTag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)',
      borderRadius: 7, padding: '4px 10px', fontSize: 12, fontWeight: 500, color: '#F87171',
      margin: '3px',
    }}>
      {children}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: 0, fontFamily: 'inherit' }}>×</button>
    </span>
  )
}
