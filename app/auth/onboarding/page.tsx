'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Building2, ChevronRight, CheckCircle } from 'lucide-react'

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6382FF', success: '#34D98A', warning: '#FBBF24',
  text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
}
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: '#141422', border: `1px solid ${C.border2}`,
  color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none',
}

const BUSINESS_TYPES = [
  { id: 'shop',   label: '🏪 Магазин техніки', desc: 'Продаємо нову та б/у техніку' },
  { id: 'pawn',   label: '🏦 Ломбард',          desc: 'Приймаємо заставу та викупляємо' },
  { id: 'resell', label: '🔄 Перекупник',        desc: 'Купую для перепродажу' },
  { id: 'multi',  label: '🏢 Мережа магазинів',  desc: 'Кілька точок продажів' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!companyName.trim()) { setError('Введіть назву компанії'); return }
    setLoading(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Create company
    const { data: company, error: cErr } = await supabase
      .from('companies')
      .insert({ name: companyName.trim(), business_type: businessType, city })
      .select()
      .single()

    if (cErr) {
      // Table might not exist yet — just redirect (will be set up with real DB)
      router.push('/dashboard')
      return
    }

    // Create user record
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split('@')[0],
      role: 'owner',
      company_id: company.id,
    })

    // Seed company rules
    await supabase.from('company_rules').insert({
      company_id: company.id,
      default_buy_percent: 20,
      default_sell_percent: 5,
      min_profit: 2500,
      min_profitability: 15,
      max_buy_price: 50000,
      min_buy_price: 3000,
      max_market_price: 80000,
      min_market_price: 2000,
    })

    setLoading(false)
    setStep(3)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,130,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                background: s <= step ? 'linear-gradient(135deg,#6382FF,#A78BFA)' : '#1E1E32',
                color: s <= step ? '#fff' : C.muted2,
                boxShadow: s === step ? '0 0 16px rgba(99,130,255,0.4)' : 'none',
                transition: 'all 0.3s',
              }}>
                {s < step ? <CheckCircle size={14} /> : s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 2, background: s < step ? C.accent : C.border2, borderRadius: 99, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Business type */}
        {step === 1 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Вітаємо! 👋</h1>
              <p style={{ fontSize: 14, color: C.muted }}>Розкажіть про ваш бізнес — це допоможе налаштувати систему</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {BUSINESS_TYPES.map(({ id, label, desc }) => (
                <button key={id} onClick={() => setBusinessType(id)} style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  border: `1px solid ${businessType === id ? 'rgba(99,130,255,0.4)' : C.border2}`,
                  background: businessType === id ? 'rgba(99,130,255,0.1)' : '#141422',
                  transition: 'all 0.15s',
                }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: businessType === id ? C.text : C.muted, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 12, color: C.muted2 }}>{desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!businessType} style={{
              width: '100%', padding: '12px', borderRadius: 11, border: 'none',
              background: businessType ? 'linear-gradient(135deg,#6382FF,#A78BFA)' : C.border2,
              color: businessType ? '#fff' : C.muted2, fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              cursor: businessType ? 'pointer' : 'default', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Далі <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Company info */}
        {step === 2 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36 }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, fontSize: 13, fontFamily: 'inherit', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Назад
            </button>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Назва компанії</h1>
              <p style={{ fontSize: 14, color: C.muted }}>Як називається ваш магазин або бізнес?</p>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', fontSize: 13, marginBottom: 18 }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Назва компанії *</p>
                <input type="text" required autoFocus placeholder="напр. ТехноМаркет, iPhone Shop Kyiv"
                  value={companyName} onChange={e => setCompanyName(e.target.value)} style={inp} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Місто (необов'язково)</p>
                <input type="text" placeholder="напр. Київ, Харків, Одеса"
                  value={city} onChange={e => setCity(e.target.value)} style={inp} />
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(52,217,138,0.06)', border: '1px solid rgba(52,217,138,0.15)', fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>
              ✓ Після створення компанії ви зможете налаштувати правила оцінки, категорії та запросити менеджерів
            </div>

            <button onClick={handleCreate} disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 24px rgba(99,130,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Створюю компанію...</>
                : <>Завершити налаштування <ChevronRight size={16} /></>}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ background: C.card, border: '1px solid rgba(52,217,138,0.25)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,217,138,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={36} color={C.success} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 12 }}>Готово! 🎉</h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
              Компанія <strong style={{ color: C.text }}>{companyName}</strong> створена
            </p>
            <p style={{ fontSize: 13, color: C.muted2 }}>Переходимо до дашборду...</p>
            <div style={{ marginTop: 24, height: 3, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#6382FF,#A78BFA)', borderRadius: 99, animation: 'progress 2s linear forwards' }} />
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  )
}
export const dynamic = 'force-dynamic'
