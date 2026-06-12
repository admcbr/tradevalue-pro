'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

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

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message === 'Invalid login credentials' ? 'Невірний email або пароль' : error.message); setLoading(false); return }

    // Check if user has company setup — use metadata first (fast, no DB call)
    if (data.user) {
      const meta = data.user.user_metadata
      if (meta?.company_id) {
        // Metadata has company_id — go directly, no extra DB call
        router.push('/dashboard')
        return
      }

      // Fallback: check DB (for older accounts without metadata)
      const { data: userRecord } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', data.user.id)
        .maybeSingle()

      router.push(userRecord?.company_id ? '/dashboard' : '/auth/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,130,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: -0.5 }}>Вхід в акаунт</h1>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Введіть email та пароль щоб продовжити</p>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: C.danger, fontSize: 13, marginBottom: 18 }}>
              {error === 'Invalid login credentials' ? 'Невірний email або пароль' : error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Email</p>
              <input type="email" required placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} style={inp} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Пароль</p>
                <Link href="/auth/reset" style={{ fontSize: 11, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>Забули пароль?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inp, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted2 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '12px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 24px rgba(99,130,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} /> Входжу...</>
                : <><LogIn size={15} /> Увійти</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 13, color: C.muted }}>
              Немає акаунту?{' '}
              <Link href="/auth/register" style={{ color: C.accent, fontWeight: 700, textDecoration: 'none' }}>Зареєструватись безкоштовно →</Link>
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
