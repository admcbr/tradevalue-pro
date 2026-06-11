'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Shield, Lock, ArrowRight } from 'lucide-react'

const ADMIN_EMAIL = 'wertuvenom@gmail.com'
// SECRET_WORD is verified server-side via /api/admin/verify-secret

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6366F1', success: '#10B981', danger: '#EF4444',
  text: '#F8FAFC', muted: '#94A3B8', muted2: '#475569',
}

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  background: '#141422', border: `1px solid #2A2A44`,
  color: '#F8FAFC', fontFamily: 'inherit', fontSize: 15, outline: 'none',
}

export default function AdminPage() {
  const supabase = createClient()
  const [step, setStep] = useState<'secret' | 'password' | 'denied'>('secret')
  const [secretInput, setSecretInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  async function handleSecretSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (attempts >= 3) {
      setStep('denied')
      return
    }

    setLoading(true)
    // Verify secret server-side — never exposed in client code
    const res = await fetch('/api/admin/verify-secret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretInput.trim() }),
    })

    setLoading(false)

    if (!res.ok) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        setStep('denied')
      } else {
        setError(`Невірне слово. Залишилось спроб: ${3 - newAttempts}`)
        setSecretInput('')
      }
      return
    }

    setStep('password')
    setError('')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: passwordInput.trim(),
    })

    if (error || !data.session) {
      setError('Невірний пароль.')
      setPasswordInput('')
      setLoading(false)
      return
    }

    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut()
      setStep('denied')
      setLoading(false)
      return
    }

    sessionStorage.setItem('tv_admin_verified', '1')
    window.location.href = '/admin/dashboard'
  }

  // Denied
  if (step === 'denied') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <Lock size={32} color={C.danger} />
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:12 }}>Доступ заборонено</h1>
        <p style={{ fontSize:14, color:C.muted }}>Забагато невдалих спроб.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:400, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 0 32px rgba(99,102,241,0.4)' }}>
            <Shield size={26} color="#fff" />
          </div>
          <p style={{ fontSize:20, fontWeight:800, color:C.text }}>TradeValue Admin</p>
          <p style={{ fontSize:12, color:C.muted2, marginTop:4 }}>
            {step === 'secret' ? 'Крок 1 з 2 · Секретне слово' : 'Крок 2 з 2 · Пароль від акаунту'}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          <div style={{ flex:1, height:3, borderRadius:99, background: step === 'secret' ? 'linear-gradient(90deg,#6366F1,#8B5CF6)' : 'linear-gradient(90deg,#10B981,#059669)' }} />
          <div style={{ flex:1, height:3, borderRadius:99, background: step === 'password' ? 'linear-gradient(90deg,#6366F1,#8B5CF6)' : 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:C.danger, fontSize:13, marginBottom:18 }}>
              {error}
            </div>
          )}

          {/* Step 1: Secret word */}
          {step === 'secret' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:6 }}>Секретне слово</h2>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24, lineHeight:1.6 }}>
                Введіть секретне слово адміністратора
              </p>
              <form onSubmit={handleSecretSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <input type="password" required autoFocus
                  placeholder="Секретне слово..."
                  value={secretInput}
                  onChange={e => setSecretInput(e.target.value)}
                  style={inp} />
                <button type="submit" style={{
                  padding:'12px', borderRadius:11, border:'none',
                  background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff',
                  fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer',
                  boxShadow:'0 0 24px rgba(99,102,241,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  Далі <ArrowRight size={15} />
                </button>
              </form>
            </>
          )}

          {/* Step 2: Password */}
          {step === 'password' && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Shield size={18} color={C.success} />
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.text }}>Секретне слово ✓</p>
                  <p style={{ fontSize:12, color:C.muted2 }}>Тепер введіть пароль</p>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:7 }}>Пароль від акаунту</p>
                  <input type="password" required autoFocus
                    placeholder="Ваш пароль..."
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    style={inp} />
                </div>
                <button type="submit" disabled={loading} style={{
                  padding:'12px', borderRadius:11, border:'none',
                  background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff',
                  fontFamily:'inherit', fontWeight:700, fontSize:14,
                  cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1,
                  boxShadow:'0 0 24px rgba(99,102,241,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading
                    ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .8s linear infinite', display:'inline-block' }} />Перевіряю...</>
                    : <><Shield size={15}/> Увійти в адмінку</>}
                </button>
                <button type="button" onClick={() => { setStep('secret'); setError(''); setPasswordInput('') }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.muted2, fontFamily:'inherit', fontSize:13, padding:0 }}>
                  ← Назад
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:C.muted2, marginTop:16 }}>
          🔒 Захищений розділ · Тільки для власника
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
