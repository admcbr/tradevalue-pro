'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171',
  text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
}
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: '#141422', border: `1px solid ${C.border2}`,
  color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none',
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'check_email'>('form')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Пароль має бути мінімум 6 символів'); return }
    setLoading(true); setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding`,
      },
    })

    if (error) { setError(error.message); setLoading(false); return }

    if (data.session) {
      // Auto-confirmed (dev mode)
      router.push('/auth/onboarding')
    } else {
      setStep('check_email')
    }
    setLoading(false)
  }

  if (step === 'check_email') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,217,138,0.1)', border: '1px solid rgba(52,217,138,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={36} color={C.success} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 12 }}>Перевірте пошту!</h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
          Ми надіслали листа на <strong style={{ color: C.text }}>{email}</strong>
        </p>
        <p style={{ fontSize: 13, color: C.muted2, lineHeight: 1.7, marginBottom: 28 }}>
          Натисніть посилання в листі щоб підтвердити акаунт і налаштувати компанію.
        </p>
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.15)', fontSize: 13, color: C.muted, marginBottom: 24 }}>
          💡 Не бачите листа? Перевірте папку «Спам»
        </div>
        <Link href="/auth/login" style={{ color: C.accent, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          ← Повернутись до входу
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,130,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6382FF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff', boxShadow: '0 0 24px rgba(99,130,255,0.4)' }}>TV</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>TradeValue Pro</p>
              <p style={{ fontSize: 11, color: C.muted2 }}>Система оцінки б/у техніки</p>
            </div>
          </Link>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: -0.5 }}>Створити акаунт</h1>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Безкоштовно · 5 оцінок · Без картки</p>

          {/* Benefits */}
          <div style={{ display: 'flex', gap: 12, margin: '16px 0 24px', flexWrap: 'wrap' }}>
            {['✓ 5 оцінок безкоштовно', '✓ Власні правила', '✓ Накладні'].map(b => (
              <span key={b} style={{ fontSize: 11, fontWeight: 600, color: C.success, background: 'rgba(52,217,138,0.08)', border: '1px solid rgba(52,217,138,0.15)', padding: '4px 10px', borderRadius: 7 }}>{b}</span>
            ))}
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: C.danger, fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Повне ім'я</p>
              <input type="text" required placeholder="Олексій Коваль" value={name}
                onChange={e => setName(e.target.value)} style={inp} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Email</p>
              <input type="email" required placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} style={inp} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Пароль</p>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} required placeholder="Мінімум 6 символів"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inp, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted2 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 6, height: 3, borderRadius: 99, background: C.border2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.3s', background: password.length < 6 ? C.danger : password.length < 10 ? C.accent : C.success, width: `${Math.min(password.length * 10, 100)}%` }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '12px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 24px rgba(99,130,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Створюю акаунт...</>
                : <><UserPlus size={15} />Створити акаунт безкоштовно</>}
            </button>

            <p style={{ fontSize: 11, color: C.muted2, textAlign: 'center', lineHeight: 1.6 }}>
              Реєструючись, ви погоджуєтесь з умовами використання. Дані захищені та не передаються третім особам.
            </p>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 13, color: C.muted }}>
              Вже маєте акаунт?{' '}
              <Link href="/auth/login" style={{ color: C.accent, fontWeight: 700, textDecoration: 'none' }}>Увійти →</Link>
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted2, marginTop: 20 }}>
          <Link href="/" style={{ color: C.muted2, textDecoration: 'none' }}>← Повернутись на головну</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
export const dynamic = 'force-dynamic'
