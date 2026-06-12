'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown } from 'lucide-react'

interface Config {
  company: { id: string; name: string; widget_title: string; widget_color: string }
  categories: any[]
  rules: any
}

const CONDITIONS = [
  { id: 'Aplus', label: 'A+ — як новий, без слідів використання' },
  { id: 'A',    label: 'A — відмінний, мінімальні сліди' },
  { id: 'B',    label: 'B — хороший, є незначні подряпини' },
  { id: 'C',    label: 'C — задовільний, є помітні пошкодження' },
  { id: 'D',    label: 'D — поганий, сильні пошкодження' },
]

const CONDITION_MULT: Record<string, number> = {
  Aplus: 1.0, A: 0.92, B: 0.80, C: 0.65, D: 0.45,
}

export default function WidgetPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<'form' | 'contact' | 'result'>('form')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [condition, setCondition] = useState('')
  const [marketPrice, setMarketPrice] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/widget/config?company_id=${companyId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setConfig(d)
        setLoading(false)
      })
      .catch(() => { setError('Помилка завантаження'); setLoading(false) })
  }, [companyId])

  const accent = config?.company.widget_color || '#6382FF'

  const C = {
    bg: '#07070C', card: '#0E0E18', border: '#1E1E32',
    text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: '#141422', border: `1px solid #282840`,
    color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  }

  function calcResult() {
    const price = parseFloat(marketPrice)
    if (!price || !condition) return null
    const rules = config?.rules || {}
    const buyPercent = (rules.default_buy_percent || 20) / 100
    const sellPercent = (rules.default_sell_percent || 5) / 100
    const mult = CONDITION_MULT[condition] || 0.8
    const buy = Math.round(price * buyPercent * mult)
    const sell = Math.round(buy * (1 + sellPercent))
    const profit = sell - buy
    const profitability = buy > 0 ? Math.round((profit / buy) * 100) : 0
    const minProfit = rules.min_profit || 0
    const minProfitability = rules.min_profitability || 0
    let status = 'good'
    if (profit < minProfit || profitability < minProfitability) status = 'caution'
    if (buy < (rules.min_buy_price || 0)) status = 'rejected'
    return { buy, sell, profit, profitability, status }
  }

  async function handleSubmit() {
    if (!category || !condition || !marketPrice) return
    setSubmitting(true)
    const calc = calcResult()
    await fetch('/api/widget/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        category_name: category,
        brand_name: brand,
        model_name: model,
        condition,
        market_price: parseFloat(marketPrice),
        buy_price: calc?.buy || 0,
        sell_price: calc?.sell || 0,
        profit: calc?.profit || 0,
        profitability: calc?.profitability || 0,
        status: calc?.status || 'not_evaluated',
        client_name: clientName,
        client_phone: clientPhone,
      }),
    })
    setResult(calc)
    setStep('result')
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', color: C.muted }}>
        <XCircle size={40} color="#F87171" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 16, color: '#F87171' }}>Віджет недоступний</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>{error === 'Widget requires Pro or Business plan' ? 'Для цієї компанії віджет не підключено' : error}</p>
      </div>
    </div>
  )

  const sel: React.CSSProperties = { ...inp, appearance: 'none', cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif', padding: '24px 16px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>TV</div>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{config?.company.name}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: -0.5, margin: 0 }}>
            {config?.company.widget_title}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Отримайте орієнтовну ціну викупу за 1 хвилину</p>
        </div>

        {step === 'form' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {['Пристрій', 'Контакти', 'Результат'].map((s, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i === 0 ? accent : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Category */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Категорія *</label>
                <div style={{ position: 'relative' }}>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={sel}>
                    <option value="">Оберіть категорію...</option>
                    {(config?.categories || []).map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted2, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Бренд</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Apple, Samsung, Lenovo..." style={inp} />
              </div>

              {/* Model */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Модель</label>
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="iPhone 13, Galaxy S22..." style={inp} />
              </div>

              {/* Condition */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Стан *</label>
                <div style={{ position: 'relative' }}>
                  <select value={condition} onChange={e => setCondition(e.target.value)} style={sel}>
                    <option value="">Оберіть стан...</option>
                    {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted2, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Market price */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Ринкова ціна (₴) *</label>
                <input type="number" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} placeholder="Наприклад: 15000" style={inp} />
                <p style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>Вкажіть ціну такого ж пристрою на OLX/Rozetka</p>
              </div>

              <button
                onClick={() => {
                  if (!category || !condition || !marketPrice) {
                    alert("Заповніть обов'язкові поля: Категорія, Стан, Ринкова ціна")
                    return
                  }
                  setStep('contact')
                }}
                style={{
                  padding: '13px', borderRadius: 11, border: 'none',
                  background: `linear-gradient(135deg,${accent},${accent}cc)`,
                  color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', boxShadow: `0 0 24px ${accent}44`,
                }}>
                Далі →
              </button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {['Пристрій', 'Контакти', 'Результат'].map((s, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= 1 ? accent : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Ваші контакти</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Менеджер зв'яжеться з вами для уточнення деталей</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Ваше ім'я</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Іван Іваненко" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 }}>Телефон</label>
                <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+380 XX XXX XX XX" style={inp} type="tel" />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('form')} style={{ flex: 1, padding: '12px', borderRadius: 11, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  ← Назад
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ flex: 2, padding: '12px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,${accent},${accent}cc)`, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Надсилаємо...' : 'Дізнатись ціну 💰'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: C.muted2, textAlign: 'center' }}>
                Контакти не обов'язкові — можна пропустити
              </p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {['Пристрій', 'Контакти', 'Результат'].map((s, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: accent }} />
              ))}
            </div>

            {result.status === 'rejected' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <XCircle size={48} color="#F87171" style={{ marginBottom: 12 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F87171', marginBottom: 8 }}>Не можемо купити</h2>
                <p style={{ fontSize: 14, color: C.muted }}>На жаль, цей пристрій не підходить для викупу за нашими критеріями.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  {result.status === 'good'
                    ? <CheckCircle size={48} color="#34D98A" style={{ marginBottom: 12 }} />
                    : <AlertTriangle size={48} color="#FBBF24" style={{ marginBottom: 12 }} />
                  }
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                    {result.status === 'good' ? 'Готові купити!' : 'Можливо купимо'}
                  </h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Орієнтовна ціна викупу</p>
                </div>

                <div style={{ background: '#141422', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 20, border: `1px solid ${accent}33` }}>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Ми пропонуємо</p>
                  <p style={{ fontSize: 42, fontWeight: 900, color: accent, letterSpacing: -2 }}>
                    ₴{result.buy.toLocaleString('uk-UA')}
                  </p>
                  <p style={{ fontSize: 12, color: C.muted2, marginTop: 4 }}>
                    {brand} {model} · Стан {condition}
                  </p>
                </div>

                <p style={{ fontSize: 12, color: C.muted2, textAlign: 'center', marginBottom: 20 }}>
                  * Остаточна ціна визначається після огляду пристрою менеджером
                </p>
              </>
            )}

            <button
              onClick={() => { setStep('form'); setCategory(''); setBrand(''); setModel(''); setCondition(''); setMarketPrice(''); setClientName(''); setClientPhone(''); setResult(null) }}
              style={{ width: '100%', padding: '12px', borderRadius: 11, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Оцінити ще один пристрій
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted2, marginTop: 20 }}>
          Powered by <a href="https://tradevp.com" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>TradeValue Pro</a>
        </p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
