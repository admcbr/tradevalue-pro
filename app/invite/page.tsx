'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6366F1', success: '#10B981', danger: '#EF4444',
  text: '#F8FAFC', muted: '#94A3B8', muted2: '#475569',
}

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: '#141422', border: `1px solid #2A2A44`,
  color: '#F8FAFC', fontFamily: 'inherit', fontSize: 14, outline: 'none',
}

function InvitePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const token = searchParams.get('token')

  const [step, setStep] = useState<'loading'|'register'|'login'|'success'|'error'>('loading')
  const [invitation, setInvitation] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setStep('error'); return }
    loadInvitation()
  }, [token])

  async function loadInvitation() {
    // Load invitation by token
    const { data: inv, error } = await supabase
      .from('invitations')
      .select('*, companies(*)')
      .eq('token', token)
      .eq('accepted', false)
      .maybeSingle()

    if (error || !inv) { setStep('error'); return }

    // Check if expired
    if (new Date(inv.expires_at) < new Date()) { setStep('error'); return }

    setInvitation(inv)
    setCompany(inv.companies)
    setEmail(inv.email)

    // Check if user already exists with this email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', inv.email)
      .maybeSingle()

    setStep(existingUser ? 'login' : 'register')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Пароль мінімум 6 символів'); return }
    setLoading(true); setError('')

    // Register new user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: { data: { name } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user) { setError('Помилка реєстрації'); setLoading(false); return }

    // Link to company
    await supabase.from('users').upsert({
      id: data.user.id,
      email: invitation.email,
      name: name || invitation.email.split('@')[0],
      role: invitation.role,
      company_id: invitation.company_id,
    })

    // Mark invitation as accepted
    await supabase.from('invitations').update({ accepted: true }).eq('token', token)

    setStep('success')
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: invitation.email,
      password,
    })

    if (loginError) { setError('Невірний пароль'); setLoading(false); return }

    // Link existing user to company
    await supabase.from('users').update({
      company_id: invitation.company_id,
      role: invitation.role,
    }).eq('id', data.user!.id)

    // Mark invitation as accepted
    await supabase.from('invitations').update({ accepted: true }).eq('token', token)

    setStep('success')
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  // Loading
  if (step === 'loading') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:`3px solid rgba(99,102,241,0.2)`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:C.muted }}>Перевіряємо запрошення...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Error
  if (step === 'error') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:380, padding:20 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <AlertCircle size={30} color={C.danger} />
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:10 }}>Запрошення недійсне</h1>
        <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:24 }}>
          Посилання застаріло або вже було використано. Зверніться до власника компанії за новим запрошенням.
        </p>
        <Link href="/" style={{ color:C.accent, fontSize:14, fontWeight:600, textDecoration:'none' }}>← На головну</Link>
      </div>
    </div>
  )

  // Success
  if (step === 'success') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <CheckCircle size={36} color={C.success} />
        </div>
        <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:12 }}>Ласкаво просимо! 🎉</h1>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.7 }}>
          Ви успішно приєднались до <strong style={{ color:C.text }}>{company?.name}</strong>.<br />
          Переходимо до дашборду...
        </p>
        <div style={{ marginTop:20, height:3, background:C.border, borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius:99, animation:'progress 2.5s linear forwards' }} />
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes progress{from{width:0}to{width:100%}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440, position:'relative' }}>
        {/* Logo + invite info */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontWeight:800, fontSize:16, color:'#fff', boxShadow:'0 0 24px rgba(99,102,241,0.4)' }}>TV</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:6 }}>
            {step === 'register' ? 'Приєднатись до команди' : 'Увійти в акаунт'}
          </h1>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:99, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', fontSize:13, color:C.success, marginTop:6 }}>
            🏢 Запрошення від <strong>{company?.name}</strong>
          </div>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
          {/* Role badge */}
          <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(99,102,241,0.06)', border:`1px solid rgba(99,102,241,0.15)`, marginBottom:22, fontSize:13, color:C.muted }}>
            📧 {invitation?.email} · Роль: <strong style={{ color:C.text }}>{invitation?.role === 'manager' ? 'Менеджер' : invitation?.role === 'admin' ? 'Адмін' : 'Viewer'}</strong>
          </div>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:C.danger, fontSize:13, marginBottom:16 }}>
              {error}
            </div>
          )}

          {/* Register form */}
          {step === 'register' && (
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>Ваше ім'я</p>
                <input type="text" required placeholder="Іван Іваненко" value={name} onChange={e=>setName(e.target.value)} style={inp} />
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>Email</p>
                <input type="email" value={invitation?.email} disabled style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} />
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>Придумайте пароль</p>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} required placeholder="Мінімум 6 символів" value={password} onChange={e=>setPassword(e.target.value)} style={{ ...inp, paddingRight:44 }} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted2 }}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop:5, height:3, borderRadius:99, background:C.border2, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:99, transition:'width 0.3s', background:password.length<6?C.danger:password.length<10?C.accent:C.success, width:`${Math.min(password.length*10,100)}%` }} />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} style={{ padding:'12px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, boxShadow:'0 0 24px rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading
                  ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .8s linear infinite', display:'inline-block' }} />Реєструюсь...</>
                  : <><UserPlus size={15}/> Зареєструватись і приєднатись</>}
              </button>
            </form>
          )}

          {/* Login form */}
          {step === 'login' && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>Email</p>
                <input type="email" value={invitation?.email} disabled style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} />
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>Ваш пароль</p>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} required placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} style={{ ...inp, paddingRight:44 }} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted2 }}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', fontSize:13, color:C.muted }}>
                ℹ️ Акаунт з цим email вже існує. Введіть ваш пароль або{' '}
                <button type="button" onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.resetPasswordForEmail(invitation.email, {
                    redirectTo: window.location.href,
                  })
                  alert('✓ Лист для скидання пароля надіслано на ' + invitation.email)
                }} style={{ background:'none', border:'none', cursor:'pointer', color:'#6366F1', fontFamily:'inherit', fontSize:13, fontWeight:700, padding:0, textDecoration:'underline' }}>
                  скиньте пароль
                </button>
              </div>
              <button type="submit" disabled={loading} style={{ padding:'12px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, boxShadow:'0 0 24px rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading
                  ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .8s linear infinite', display:'inline-block' }} />Входжу...</>
                  : <>Увійти і приєднатись</>}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#07070C', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', color:'#94A3B8', fontFamily:"'Inter',system-ui,sans-serif" }}>
          <div style={{ width:36, height:36, border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }} />
          <p>Завантаження...</p>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      </div>
    }>
      <InvitePageInner />
    </Suspense>
  )
}
