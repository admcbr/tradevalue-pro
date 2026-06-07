'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Shield, Mail, ArrowRight, Lock } from 'lucide-react'

// ── Only this email can access admin ──────────────────────────────────────────
const ADMIN_EMAIL = 'wertuvenom@gmail.com'

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6366F1', success: '#10B981', danger: '#EF4444',
  text: '#F8FAFC', muted: '#94A3B8', muted2: '#475569',
}

export default function AdminPage() {
  const supabase = createClient()
  const [step, setStep] = useState<'check' | 'otp' | 'denied'>('check')
  const [inputEmail, setInputEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Check if admin email
    if (inputEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setStep('denied')
      return
    }

    setLoading(true)
    // Send OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: {
        shouldCreateUser: false, // only existing users
      },
    })

    if (error) {
      setError('Помилка відправки коду. Спробуйте ще раз.')
      setLoading(false)
      return
    }

    setSent(true)
    setStep('otp')
    setLoading(false)
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email: ADMIN_EMAIL,
      token: otp.trim(),
      type: 'email',
    })

    if (error || !data.session) {
      setError('Невірний або прострочений код. Спробуйте ще раз.')
      setLoading(false)
      return
    }

    // Success — store admin session flag and redirect
    sessionStorage.setItem('tv_admin_verified', '1')
    window.location.href = '/admin/dashboard'
  }

  // ── Denied ────────────────────────────────────────────────────────────────
  if (step === 'denied') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Lock size={32} color={C.danger} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>Доступ заборонено</h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>У вас немає прав для входу в цей розділ.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(99,102,241,0.4)' }}>
            <Shield size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>TradeValue Admin</h1>
          <p style={{ fontSize: 13, color: C.muted2 }}>Захищений доступ · Тільки для адміністратора</p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36 }}>

          {/* Step 1: Email */}
          {step === 'check' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Введіть email</h2>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  Введіть адміністраторський email. Якщо він підтверджений — надішлемо одноразовий код.
                </p>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.danger, fontSize: 13, marginBottom: 18 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Email</p>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color={C.muted2} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" required autoFocus
                      placeholder="admin@example.com"
                      value={inputEmail}
                      onChange={e => setInputEmail(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 10, background: '#141422', border: `1px solid ${C.border2}`, color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '12px', borderRadius: 11, border: 'none',
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Надсилаю...</>
                    : <>Надіслати код <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Mail size={22} color={C.success} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Перевірте пошту</h2>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  Ми надіслали <strong style={{ color: C.text }}>6-значний код</strong> на<br />
                  <strong style={{ color: C.text }}>{ADMIN_EMAIL}</strong>
                </p>
                <p style={{ fontSize: 12, color: C.muted2, marginTop: 8 }}>Код дійсний 10 хвилин</p>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.danger, fontSize: 13, marginBottom: 18 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Код підтвердження</p>
                  <input
                    type="text" required autoFocus maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 10,
                      background: '#141422', border: `1px solid ${C.border2}`,
                      color: C.text, fontFamily: 'monospace', fontSize: 28,
                      fontWeight: 800, outline: 'none', textAlign: 'center',
                      letterSpacing: 8,
                    }}
                  />
                </div>

                <button type="submit" disabled={loading || otp.length < 6} style={{
                  padding: '12px', borderRadius: 11, border: 'none',
                  background: otp.length === 6 ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : C.border2,
                  color: otp.length === 6 ? '#fff' : C.muted2,
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                  cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: otp.length === 6 ? '0 0 24px rgba(99,102,241,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Перевіряю...</>
                    : <>Увійти в адмінку <Shield size={15} /></>}
                </button>

                <button type="button" onClick={() => { setStep('check'); setOtp(''); setError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
                  ← Ввести інший email
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted2, marginTop: 20 }}>
          🔒 Захищений розділ · Тільки для власника
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
