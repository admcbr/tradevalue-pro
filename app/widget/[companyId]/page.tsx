'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronLeft, Package, Cpu, Send } from 'lucide-react'

interface WidgetConfig {
  company: { id: string; name: string; widget_title: string; widget_color: string }
  categories: any[]
  rules: any
}

const CONDITIONS = [
  { id: 'Aplus', label: 'A+ — як новий, без слідів використання' },
  { id: 'A',    label: 'A — відмінний стан, мінімальні сліди' },
  { id: 'B',    label: 'B — хороший, незначні подряпини' },
  { id: 'C',    label: 'C — задовільний, помітні пошкодження' },
  { id: 'D',    label: 'D — поганий стан, сильні пошкодження' },
]

const CONDITION_MULT: Record<string, number> = {
  Aplus: 1.0, A: 0.92, B: 0.80, C: 0.65, D: 0.45,
}

const MESSENGERS = [
  { id: 'viber',    label: 'Viber',    emoji: '💬' },
  { id: 'telegram', label: 'Telegram', emoji: '✈️' },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '📱' },
  { id: 'call',     label: 'Тільки дзвінок', emoji: '📞' },
]

export default function WidgetPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  // step: 1=device, 2=completeness, 3=result, 4=contact_form, 5=success
  const [step, setStep] = useState(1)
  const [selectedCat, setSelectedCat] = useState<any>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [marketPrice, setMarketPrice] = useState('')
  const [condition, setCondition] = useState('')
  const [completeness, setCompleteness] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  // Contact form
  const [clientPhone, setClientPhone] = useState('')
  const [clientName, setClientName] = useState('')
  const [messenger, setMessenger] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/widget/config?company_id=${companyId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setLoadError(d.error)
        else setConfig(d)
        setLoading(false)
      })
      .catch(() => { setLoadError('Помилка завантаження'); setLoading(false) })
  }, [companyId])

  const accent = config?.company.widget_color || '#6382FF'

  const C = {
    bg: '#07070C', card: '#0E0E18', card2: '#141422',
    border: '#1E1E32', border2: '#282840',
    text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
    success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: C.card2, border: `1px solid ${C.border2}`,
    color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: C.muted2,
    textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6,
  }

  function calcResult(cat: any) {
    const price = parseFloat(marketPrice)
    if (!price || !condition) return null
    const rules = config?.rules || {}
    const catRules = cat?.rules || {}
    const buyPct = (catRules.buy_percent || rules.default_buy_percent || 20) / 100
    const sellPct = (catRules.sell_percent || rules.default_sell_percent || 5) / 100
    const mult = CONDITION_MULT[condition] || 0.8

    let completenessAdj = 0
    if (cat?.completeness) {
      for (const item of cat.completeness) {
        if (!item.is_active) continue
        const present = completeness.includes(item.id)
        if (item.impact_type === 'sub_amount' && !present) completenessAdj -= item.impact_value
        if (item.impact_type === 'add_amount' && present) completenessAdj += item.impact_value
      }
    }

    let buy = Math.round(price * buyPct * mult + completenessAdj)
    buy = Math.max(0, buy)
    const sell = Math.round(buy * (1 + sellPct))
    const profit = sell - buy
    const profitability = buy > 0 ? Math.round((profit / buy) * 100) : 0

    let status = 'good'
    const minProfit = rules.min_profit || 0
    const minProfitability = rules.min_profitability || 0
    const minBuy = catRules.min_buy_price || rules.min_buy_price || 0
    if (profit < minProfit || profitability < minProfitability) status = 'caution'
    if (buy < minBuy || buy <= 0) status = 'rejected'

    return { buy, sell, profit, profitability, status }
  }

  async function handleContactSubmit() {
    if (!clientPhone.trim()) { alert('Вкажіть номер телефону'); return }
    setSubmitting(true)
    try {
      await fetch('/api/widget/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          category_name: selectedCat?.name || '',
          brand_name: getBrandModel().brand,
          model_name: getBrandModel().model,
          condition,
          market_price: parseFloat(marketPrice) || 0,
          buy_price: result?.buy || 0,
          sell_price: result?.sell || 0,
          profit: result?.profit || 0,
          profitability: result?.profitability || 0,
          status: result?.status || 'not_evaluated',
          field_values: fieldValues,
          completeness_values: completeness,
          client_name: clientName,
          client_phone: clientPhone,
          messenger: messenger.join(', '),
        }),
      })
    } catch {}
    setSubmitting(false)
    setStep(5)
  }

  function getBrandModel() {
    const brandKeys = ['lf_brand', 'pf_brand', 'gf_brand', 'tf_brand', 'cf_brand']
    const modelKeys = ['lf_model', 'pf_model', 'gf_model', 'tf_model', 'cf_model']
    const brand = brandKeys.map(k => fieldValues[k]).find(Boolean) || ''
    const model = modelKeys.map(k => fieldValues[k]).find(Boolean) || ''
    return { brand, model }
  }

  function renderField(field: any) {
    const v = fieldValues[field.id] || ''
    if (field.type === 'select') return (
      <div key={field.id}>
        <label style={lbl}>{field.name}{field.is_required && ' *'}</label>
        <div style={{ position: 'relative' }}>
          <select value={v} onChange={e => setFieldValues(p => ({ ...p, [field.id]: e.target.value }))}
            style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Оберіть...</option>
            {field.options?.map((o: any) => (
              <option key={o.id} value={o.name} disabled={o.block_estimation}>{o.name}{o.block_estimation ? ' (не приймається)' : ''}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted2, pointerEvents: 'none' }} />
        </div>
      </div>
    )
    if (field.type === 'checkbox') return (
      <div key={field.id}
        onClick={() => setFieldValues(p => ({ ...p, [field.id]: p[field.id] === 'true' ? 'false' : 'true' }))}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${v === 'true' ? accent : C.border2}`, background: v === 'true' ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {v === 'true' && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
        </div>
        <span style={{ fontSize: 14, color: C.text }}>{field.name}</span>
      </div>
    )
    return (
      <div key={field.id}>
        <label style={lbl}>{field.name}{field.is_required && ' *'}</label>
        <input type={field.type === 'number' ? 'number' : 'text'} value={v}
          onChange={e => setFieldValues(p => ({ ...p, [field.id]: e.target.value }))}
          placeholder={field.type === 'number' ? '0' : 'Введіть...'} style={inp} />
      </div>
    )
  }

  const STEP_LABELS = ['Пристрій', 'Комплектація', 'Результат', 'Контакти', '']
  function StepBar() {
    const steps = [1, 2, 3, 4]
    return (
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {steps.map(s => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: step >= s ? accent : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
    )
  }

  const btnPrimary: React.CSSProperties = {
    padding: '14px', borderRadius: 11, border: 'none',
    background: `linear-gradient(135deg,${accent},${accent}cc)`,
    color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', boxShadow: `0 0 24px ${accent}33`, width: '100%',
  }
  const btnSecondary: React.CSSProperties = {
    padding: '12px', borderRadius: 11, border: `1px solid ${C.border2}`,
    background: 'transparent', color: C.muted, fontFamily: 'inherit',
    fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (loadError) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <XCircle size={40} color={C.danger} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 16, color: C.danger, marginBottom: 8 }}>Віджет недоступний</p>
        <p style={{ fontSize: 13, color: C.muted }}>{loadError.includes('Business') ? 'Для цієї компанії віджет не підключено' : loadError}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif', padding: '24px 16px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} select option:disabled{color:#666}`}</style>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>TV</div>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{config?.company.name}</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: -0.5, margin: 0 }}>{config?.company.widget_title}</h1>
          {step < 4 && <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Дізнайтесь скільки коштує ваш пристрій</p>}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
          {step < 5 && <StepBar />}

          {/* ── STEP 1: Device ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Cpu size={16} color={accent} />
                <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Характеристики пристрою</span>
              </div>

              {/* Category grid */}
              <div>
                <label style={lbl}>Категорія *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {config?.categories.map((cat: any) => (
                    <button key={cat.id} onClick={() => { setSelectedCat(cat); setFieldValues({}); setCompleteness([]) }}
                      style={{ padding: '12px 10px', borderRadius: 10, border: `1.5px solid ${selectedCat?.id === cat.id ? accent : C.border2}`, background: selectedCat?.id === cat.id ? `${accent}18` : C.card2, color: selectedCat?.id === cat.id ? C.text : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCat && (<>
                {selectedCat.fields?.map((field: any) => renderField(field))}

                <div>
                  <label style={lbl}>Загальний стан *</label>
                  <div style={{ position: 'relative' }}>
                    <select value={condition} onChange={e => setCondition(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Оберіть стан...</option>
                      {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted2, pointerEvents: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Ринкова ціна (₴) *</label>
                  <input type="number" value={marketPrice} onChange={e => setMarketPrice(e.target.value)}
                    placeholder="Ціна такого ж пристрою на OLX/Rozetka" style={inp} />
                  <p style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>Це потрібно для розрахунку ціни викупу</p>
                </div>
              </>)}

              <button onClick={() => {
                if (!selectedCat) { alert('Оберіть категорію'); return }
                const missing = selectedCat.fields?.filter((f: any) => f.is_required && !fieldValues[f.id])
                if (missing?.length) { alert(`Заповніть: ${missing.map((f: any) => f.name).join(', ')}`); return }
                if (!condition) { alert('Оберіть стан пристрою'); return }
                if (!marketPrice || parseFloat(marketPrice) <= 0) { alert('Вкажіть ринкову ціну'); return }
                setStep(2)
              }} disabled={!selectedCat} style={{ ...btnPrimary, background: selectedCat ? `linear-gradient(135deg,${accent},${accent}cc)` : C.border2, boxShadow: selectedCat ? `0 0 24px ${accent}33` : 'none', cursor: selectedCat ? 'pointer' : 'not-allowed' }}>
                Далі — Комплектація →
              </button>
            </div>
          )}

          {/* ── STEP 2: Completeness ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Package size={16} color={accent} />
                <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Що є в комплекті?</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginTop: -8 }}>Відзначте все що є у вас — це впливає на ціну</p>

              {selectedCat?.completeness?.filter((i: any) => i.is_active).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedCat.completeness.filter((i: any) => i.is_active).map((item: any) => {
                    const checked = completeness.includes(item.id)
                    const impact = item.impact_type === 'add_amount'
                      ? `+₴${item.impact_value}` : item.impact_type === 'sub_amount'
                      ? `-₴${item.impact_value}` : ''
                    return (
                      <div key={item.id} onClick={() => setCompleteness(p => p.includes(item.id) ? p.filter(x => x !== item.id) : [...p, item.id])}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${checked ? accent : C.border2}`, background: checked ? `${accent}10` : C.card2, cursor: 'pointer', transition: 'all .15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? accent : C.border2}`, background: checked ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                            {checked && <span style={{ color: '#fff', fontSize: 13 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{item.name}</span>
                        </div>
                        {impact && <span style={{ fontSize: 12, fontWeight: 700, color: item.impact_type === 'add_amount' ? C.success : C.warning }}>{impact}</span>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.muted2, textAlign: 'center', padding: '20px 0' }}>Для цієї категорії комплектація не вказується</p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ ...btnSecondary, flex: '0 0 auto', padding: '12px 20px' }}><ChevronLeft size={14} /> Назад</button>
                <button onClick={() => { setResult(calcResult(selectedCat)); setStep(3) }} style={{ ...btnPrimary, flex: 1 }}>
                  Розрахувати ціну →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Result ── */}
          {step === 3 && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {result.status === 'rejected' ? (<>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <XCircle size={52} color={C.danger} style={{ marginBottom: 12 }} />
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: C.danger, marginBottom: 8 }}>На жаль, не купуємо</h2>
                  <p style={{ fontSize: 14, color: C.muted }}>Цей пристрій не підходить для викупу за нашими критеріями. Спробуйте оцінити інший пристрій.</p>
                </div>
                <button onClick={() => { setStep(1); setSelectedCat(null); setFieldValues({}); setCondition(''); setMarketPrice(''); setCompleteness([]) }}
                  style={btnSecondary}>← Оцінити інший пристрій</button>
              </>) : (<>
                {/* Price card */}
                <div style={{ textAlign: 'center' }}>
                  {result.status === 'good'
                    ? <CheckCircle size={44} color={C.success} style={{ marginBottom: 10 }} />
                    : <AlertTriangle size={44} color={C.warning} style={{ marginBottom: 10 }} />}
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 6 }}>
                    {result.status === 'good' ? 'Чудово! Ми готові купити ваш пристрій' : 'Можливо придбаємо після огляду'}
                  </p>
                </div>

                <div style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}08)`, border: `1px solid ${accent}33`, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500 }}>Орієнтовна ціна викупу</p>
                  <p style={{ fontSize: 52, fontWeight: 900, color: accent, letterSpacing: -3, lineHeight: 1, margin: '0 0 8px' }}>
                    ₴{result.buy.toLocaleString('uk-UA')}
                  </p>
                  <p style={{ fontSize: 13, color: C.muted2 }}>
                    {getBrandModel().brand} {getBrandModel().model} · {selectedCat?.name} · Стан {condition}
                  </p>
                </div>

                {/* Breakdown */}
                <div style={{ background: C.card2, borderRadius: 12, padding: '14px 18px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Що враховано</p>
                  {completeness.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: C.muted }}>Комплектність</span>
                      <span style={{ color: C.text, fontWeight: 600 }}>{completeness.length} з {selectedCat?.completeness?.filter((i: any) => i.is_active).length} пунктів</span>
                    </div>
                  )}
                  {Object.entries(fieldValues).filter(([, v]) => v && v !== 'false').slice(0, 4).map(([k, v]) => {
                    const field = selectedCat?.fields?.find((f: any) => f.id === k)
                    return field ? (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: C.muted }}>{field.name}</span>
                        <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                      </div>
                    ) : null
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                    <span style={{ color: C.muted }}>Ринкова ціна</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>₴{parseFloat(marketPrice).toLocaleString('uk-UA')}</span>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: C.muted2, textAlign: 'center' }}>
                  * Остаточна ціна визначається після фізичного огляду пристрою
                </p>

                {/* CTA — the main button */}
                <button onClick={() => setStep(4)} style={{
                  ...btnPrimary,
                  padding: '16px', fontSize: 16,
                  background: `linear-gradient(135deg, #22c55e, #16a34a)`,
                  boxShadow: '0 0 32px rgba(34,197,94,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <Send size={18} /> Здати пристрій за ₴{result.buy.toLocaleString('uk-UA')}
                </button>

                <button onClick={() => setStep(1)} style={{ ...btnSecondary, justifyContent: 'center' }}>
                  ← Переоцінити інший пристрій
                </button>
              </>)}
            </div>
          )}

          {/* ── STEP 4: Contact form ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${accent}18`, border: `1.5px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Send size={22} color={accent} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 6 }}>Залиште контакти</h2>
                <p style={{ fontSize: 13, color: C.muted }}>Менеджер зв'яжеться з вами для підтвердження ціни та зустрічі</p>
              </div>

              {/* Price reminder */}
              <div style={{ background: `${accent}10`, border: `1px solid ${accent}22`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: C.muted }}>{selectedCat?.name} · {getBrandModel().brand} {getBrandModel().model}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: accent }}>₴{result?.buy.toLocaleString('uk-UA')}</span>
              </div>

              <div>
                <label style={lbl}>Ваше ім'я</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Іван Іваненко" style={inp} />
              </div>

              <div>
                <label style={lbl}>Номер телефону *</label>
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                  placeholder="+380 XX XXX XX XX" style={{ ...inp, border: `1px solid ${clientPhone ? C.border2 : (submitting ? C.danger : C.border2)}` }} />
              </div>

              <div>
                <label style={lbl}>Як зручно зв'язатись?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {MESSENGERS.map(m => {
                    const active = messenger.includes(m.id)
                    return (
                      <button key={m.id} onClick={() => setMessenger(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])}
                        style={{ padding: '11px 10px', borderRadius: 10, border: `1.5px solid ${active ? accent : C.border2}`, background: active ? `${accent}15` : C.card2, color: active ? C.text : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(3)} style={{ ...btnSecondary, flex: '0 0 auto', padding: '13px 20px' }}><ChevronLeft size={14} /> Назад</button>
                <button onClick={handleContactSubmit} disabled={submitting}
                  style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting ? 'Відправляємо...' : <><Send size={16} /> Відправити заявку</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Success ── */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(34,197,94,0.15)' }}>
                  <CheckCircle size={36} color={C.success} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8 }}>Заявку прийнято! 🎉</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 4 }}>
                  Ваша заявка відправлена. Менеджер зв'яжеться з вами{messenger.length > 0 ? ` через ${messenger.join(' / ')}` : ''} найближчим часом.
                </p>
              </div>

              <div style={{ background: C.card2, borderRadius: 16, padding: '20px', border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 12, color: C.muted2, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ваша заявка</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{selectedCat?.name}</span>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{getBrandModel().brand} {getBrandModel().model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Ціна викупу</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: C.success }}>₴{result?.buy.toLocaleString('uk-UA')}</span>
                </div>
              </div>

              <button onClick={() => { setStep(1); setSelectedCat(null); setFieldValues({}); setCondition(''); setMarketPrice(''); setCompleteness([]); setResult(null); setClientName(''); setClientPhone(''); setMessenger([]) }}
                style={{ ...btnSecondary, justifyContent: 'center' }}>
                Оцінити ще один пристрій
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted2, marginTop: 20 }}>
          Powered by <a href="https://tradevp.com" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>TradeValue Pro</a>
        </p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
