'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronLeft, Send, Package, Cpu } from 'lucide-react'
import type { Category, EstimationResult } from '@/lib/types'
import { calculate } from '@/lib/engine'

interface Config {
  company: { id: string; name: string; widget_title: string; widget_color: string }
  categories: Category[]
  rules: any
}

const MESSENGERS = [
  { id: 'viber',    label: 'Viber',    emoji: '💬' },
  { id: 'telegram', label: 'Telegram', emoji: '✈️' },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '📱' },
  { id: 'call',     label: 'Дзвінок',  emoji: '📞' },
]

// step: 1=device 2=completeness 3=result 4=contacts 5=success
export default function WidgetPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [config, setConfig] = useState<Config | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState(1)
  const [cat, setCat] = useState<Category | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [price, setPrice] = useState('')
  const [completeness, setCompleteness] = useState<string[]>([])
  const [result, setResult] = useState<EstimationResult | null>(null)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [messenger, setMessenger] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState(false)

  // Refs to always have fresh values in callbacks (iframe safe)
  const catRef = useRef(cat)
  const priceRef = useRef(price)
  const fieldsRef = useRef(fields)
  const completenessRef = useRef(completeness)
  useEffect(() => { catRef.current = cat }, [cat])
  useEffect(() => { priceRef.current = price }, [price])
  useEffect(() => { fieldsRef.current = fields }, [fields])
  useEffect(() => { completenessRef.current = completeness }, [completeness])

  useEffect(() => {
    fetch(`/api/widget/config?company_id=${companyId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setLoadError(d.error); else setConfig(d); setLoading(false) })
      .catch(() => { setLoadError('Помилка завантаження'); setLoading(false) })
  }, [companyId])

  const accent = config?.company.widget_color || '#6382FF'
  const C = {
    bg: '#07070C', card: '#0E0E18', card2: '#141422',
    border: '#1E1E32', border2: '#282840',
    text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
    success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  }

  function doCalculate() {
    const _cat = catRef.current
    const _price = priceRef.current
    const _fields = fieldsRef.current
    const _completeness = completenessRef.current
    if (!_cat) { console.error('Widget: no category selected'); return null }
    if (!_price) { console.error('Widget: no price entered'); return null }
    // Remove internal __custom__ marker keys before passing to engine
    const cleanFields: Record<string,string> = {}
    const HIDDEN_FIELDS = ['lf_water','lf_bios'] // also filtered server-side
    Object.entries(_fields).forEach(([k, v]) => {
      if (k.endsWith('__custom')) return  // skip helper keys
      if (v === '__custom__') return       // skip placeholder value
      if (HIDDEN_FIELDS.includes(k)) return // skip widget-hidden fields
      cleanFields[k] = v
    })
    return calculate({
      category: _cat,
      field_values: cleanFields,
      completeness_present: _completeness,
      market_price: parseFloat(_price),
      eval_type: 'buyout',
      tradein_bonus_percent: 0,
    })
  }

  function getBrand() {
    const f = cat?.fields.find(f => f.name === 'Бренд' || f.name === 'Виробник')
    return f ? (fields[f.id] || '') : ''
  }
  function getModel() {
    const f = cat?.fields.find(f => f.name === 'Модель' || f.name === 'Модель GPU' || f.name === 'Назва товару')
    return f ? (fields[f.id] || '') : ''
  }

  async function handleSubmit() {
    if (!clientPhone.trim()) { setPhoneError(true); return }
    setPhoneError(false)
    setSubmitting(true)
    try {
      await fetch('/api/widget/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          category_name: cat?.name || '',
          brand_name: getBrand(),
          model_name: getModel(),
          market_price: parseFloat(price) || 0,
          buy_price: result?.buy_price || 0,
          sell_price: result?.sell_price || 0,
          profit: result?.profit || 0,
          profitability: result?.profitability || 0,
          status: result?.status || 'not_evaluated',
          field_values: fields,
          completeness_values: completeness,
          explanation: result?.explanation || [],
          client_name: clientName,
          client_phone: clientPhone,
          messenger: messenger.join(', '),
        }),
      })
    } catch {}
    setSubmitting(false)
    setStep(5)
  }

  function reset() {
    setStep(1); setCat(null); setFields({}); setPrice('')
    setCompleteness([]); setResult(null)
    setClientName(''); setClientPhone(''); setMessenger([]); setPhoneError(false)
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: C.card2, border: `1px solid ${C.border2}`,
    color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase',
    letterSpacing: '0.7px', display: 'block', marginBottom: 6,
  }
  const btnPrimary = (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    background: disabled ? C.border2 : `linear-gradient(135deg,${accent},${accent}cc)`,
    color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : `0 0 24px ${accent}33`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  })
  const btnBack: React.CSSProperties = {
    padding: '12px 18px', borderRadius: 11, border: `1px solid ${C.border2}`,
    background: 'transparent', color: C.muted, fontFamily: 'inherit',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  }

  function renderField(field: any) {
    const v = fields[field.id] || ''
    if (field.type === 'select') {
      const isCustom = v === '__custom__' || (v && !field.options?.find((o: any) => o.name === v) && v !== '')
      const customKey = field.id + '__custom'
      return (
        <div key={field.id}>
          <label style={lbl}>{field.name}{field.is_required && ' *'}</label>
          <div style={{ position: 'relative' }}>
            <select
              value={isCustom ? '__custom__' : v}
              onChange={e => {
                if (e.target.value === '__custom__') {
                  setFields(p => ({ ...p, [field.id]: '__custom__' }))
                } else {
                  setFields(p => { const n = { ...p }; delete n[customKey]; n[field.id] = e.target.value; return n })
                }
              }}
              style={{ ...inp, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
              <option value="">Оберіть...</option>
              {field.options?.map((o: any) => (
                <option key={o.id} value={o.name} disabled={o.block_estimation}>
                  {o.name}{o.block_estimation ? ' ✗' : ''}
                </option>
              ))}
              <option value="__custom__">✏️ Ввести вручну...</option>
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted2, pointerEvents: 'none' }} />
          </div>
          {isCustom && (
            <input
              autoFocus
              type="text"
              value={fields[customKey] || ''}
              onChange={e => setFields(p => ({ ...p, [customKey]: e.target.value, [field.id]: e.target.value || '__custom__' }))}
              placeholder={`Введіть ${field.name.toLowerCase()}...`}
              style={{ ...inp, marginTop: 8, border: `1px solid ${accent}66` }}
            />
          )}
        </div>
      )
    }
    if (field.type === 'checkbox') return (
      <div key={field.id} onClick={() => setFields(p => ({ ...p, [field.id]: p[field.id] === 'true' ? '' : 'true' }))}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${v === 'true' ? accent : C.border2}`, background: v === 'true' ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {v === 'true' && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
        </div>
        <span style={{ fontSize: 14, color: C.text }}>{field.name}</span>
      </div>
    )
    return (
      <div key={field.id}>
        <label style={lbl}>{field.name}{field.is_required && ' *'}</label>
        <input type={field.type === 'number' ? 'number' : 'text'} value={v}
          onChange={e => setFields(p => ({ ...p, [field.id]: e.target.value }))}
          placeholder={field.type === 'number' ? '0' : 'Введіть...'} style={inp} />
      </div>
    )
  }

  function StepBar() {
    return (
      <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: step >= s ? accent : 'rgba(255,255,255,0.08)', transition: 'background .3s' }} />
        ))}
      </div>
    )
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
        <p style={{ fontSize: 15, color: C.danger, marginBottom: 8, fontWeight: 700 }}>Віджет недоступний</p>
        <p style={{ fontSize: 13, color: C.muted }}>{loadError.includes('Business') ? 'Для цієї компанії віджет не підключено' : loadError}</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        select option:disabled { color: #555; }
        .widget-wrap { min-height: 100vh; background: ${C.bg}; font-family: Inter,system-ui,sans-serif; padding: 20px 16px 40px; }
        .widget-inner { max-width: 480px; margin: 0 auto; animation: fadeIn .25s ease; }
        .widget-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 24px; }
        @media (max-width: 400px) {
          .widget-card { padding: 18px 16px; border-radius: 16px; }
        }
        @media (min-width: 768px) {
          .widget-wrap { padding: 40px 24px; }
          .widget-card { padding: 32px; }
        }
        .cat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 480px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .msg-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      `}</style>

      <div className="widget-wrap">
        <div className="widget-inner">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>TV</div>
              <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{config?.company.name}</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: -0.5, margin: '0 0 6px' }}>{config?.company.widget_title}</h1>
            {step < 4 && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Дізнайтесь скільки коштує ваш пристрій</p>}
          </div>

          <div className="widget-card">
            {step < 5 && <StepBar />}

            {/* ── STEP 1: Device ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={15} color={accent} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Характеристики</span>
                </div>

                {/* Category grid */}
                <div>
                  <label style={lbl}>Категорія *</label>
                  <div className="cat-grid">
                    {config?.categories.map((c: Category) => (
                      <button key={c.id} onClick={() => { setCat(c); setFields({}); setCompleteness([]) }}
                        style={{ padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${cat?.id === c.id ? accent : C.border2}`, background: cat?.id === c.id ? `${accent}18` : C.card2, color: cat?.id === c.id ? C.text : C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 20 }}>{c.icon}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {cat && <>
                  {cat.fields.filter(f => !['lf_water','lf_bios'].includes(f.id) && f.name !== 'Сліди залиття' && f.name !== 'Пароль BIOS').map(f => renderField(f))}

                  <div>
                    <label style={lbl}>Ринкова ціна (₴) *</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="Ціна аналога на OLX / Rozetka" style={inp} />
                    <p style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>Потрібно для розрахунку ціни викупу</p>
                  </div>
                </>}

                <button style={btnPrimary(!cat)} onClick={() => {
                  if (!cat) return
                  const missing = cat.fields.filter(f => !['lf_water','lf_bios'].includes(f.id) && f.name !== 'Сліди залиття' && f.name !== 'Пароль BIOS' && f.is_required && !fields[f.id])
                  if (missing.length) { alert(`Заповніть обов'язкові поля:\n${missing.map(f => f.name).join('\n')}`); return }
                  if (!price || parseFloat(price) <= 0) { alert('Вкажіть ринкову ціну'); return }
                  setStep(2)
                }}>
                  Далі — Комплектація →
                </button>
              </div>
            )}

            {/* ── STEP 2: Completeness ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={15} color={accent} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Комплектація</span>
                </div>
                <p style={{ fontSize: 13, color: C.muted, marginTop: -8 }}>Відзначте все що є — впливає на ціну</p>

                {cat?.completeness.filter(i => i.is_active).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.completeness.filter(i => i.is_active).map(item => {
                      const on = completeness.includes(item.id)
                      const addBonus  = (item.impact_type === 'add_amount' || item.impact_type === 'add_percent') && on
                      const subPenalty = (item.impact_type === 'sub_amount' || item.impact_type === 'sub_percent') && !on
                      const impactLabel = item.impact_type === 'add_amount' ? `+₴${item.impact_value}`
                        : item.impact_type === 'sub_amount' ? `-₴${item.impact_value}`
                        : item.impact_type === 'add_percent' ? `+${item.impact_value}%`
                        : item.impact_type === 'sub_percent' ? `-${item.impact_value}%` : ''
                      return (
                        <div key={item.id} onClick={() => setCompleteness(p => p.includes(item.id) ? p.filter(x => x !== item.id) : [...p, item.id])}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${on ? accent : C.border2}`, background: on ? `${accent}10` : C.card2, cursor: 'pointer', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? accent : C.border2}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {on && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.name}</span>
                            {item.block_estimation && <span style={{ fontSize: 10, color: C.danger, fontWeight: 700, padding: '1px 5px', background: 'rgba(248,113,113,0.1)', borderRadius: 4 }}>обов'язково</span>}
                          </div>
                          {impactLabel && (
                            <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, color: addBonus ? C.success : subPenalty ? C.danger : C.muted2 }}>
                              {impactLabel}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: C.muted2, textAlign: 'center', padding: '20px 0' }}>Для цієї категорії комплектація не вказується</p>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={btnBack}><ChevronLeft size={14} /> Назад</button>
                  <button
                    type="button"
                    disabled={false}
                    style={{ ...btnPrimary(false), flex: 1, pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const r = doCalculate()
                      if (!r) { alert('Помилка розрахунку. Поверніться назад і перевірте що вибрана категорія та вказана ринкова ціна.'); return }
                      setResult(r)
                      setStep(3)
                    }}>
                    Розрахувати ціну →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Result ── */}
            {step === 3 && result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeIn .2s' }}>
                {result.status === 'not_evaluated' ? (
                  <>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <XCircle size={48} color={C.danger} style={{ marginBottom: 12 }} />
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: C.danger, marginBottom: 8 }}>На жаль, не купуємо</h2>
                      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{result.blocked_reason || 'Цей пристрій не підходить за правилами компанії.'}</p>
                    </div>
                    <button onClick={() => setStep(1)} style={{ ...btnBack, justifyContent: 'center', width: '100%' }}>
                      ← Оцінити інший пристрій
                    </button>
                  </>
                ) : (
                  <>
                    {/* Status icon */}
                    <div style={{ textAlign: 'center' }}>
                      {result.status === 'good'
                        ? <CheckCircle size={44} color={C.success} style={{ marginBottom: 8 }} />
                        : <AlertTriangle size={44} color={C.warning} style={{ marginBottom: 8 }} />}
                      <p style={{ fontSize: 13, color: C.muted }}>
                        {result.status === 'good' ? 'Чудово! Готові купити ваш пристрій' : 'Можливо придбаємо — уточніть у менеджера'}
                      </p>
                    </div>

                    {/* Price block */}
                    <div style={{ background: `linear-gradient(135deg,${accent}1A,${accent}08)`, border: `1px solid ${accent}33`, borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
                      <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Орієнтовна ціна викупу</p>
                      <p style={{ fontSize: 48, fontWeight: 900, color: accent, letterSpacing: -3, lineHeight: 1, margin: '0 0 8px' }}>
                        ₴{result.buy_price.toLocaleString('uk-UA')}
                      </p>
                      <p style={{ fontSize: 12, color: C.muted2 }}>{getBrand()} {getModel()} · {cat?.name}</p>
                    </div>

                    {/* Explanation */}
                    {result.explanation.length > 0 && (
                      <div style={{ background: C.card2, borderRadius: 12, padding: '14px 16px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Як розраховано</p>
                        {result.explanation.map((line, i) => (
                          <p key={i} style={{ fontSize: 12, color: line.startsWith('⚠') ? C.warning : C.muted, marginBottom: i < result.explanation.length - 1 ? 5 : 0, lineHeight: 1.5 }}>{line}</p>
                        ))}
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: C.muted2, textAlign: 'center' }}>
                      * Остаточна ціна після фізичного огляду менеджером
                    </p>

                    {/* CTA */}
                    <button onClick={() => setStep(4)} style={{
                      ...btnPrimary(),
                      padding: '16px', fontSize: 16,
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      boxShadow: '0 0 32px rgba(34,197,94,0.3)',
                    }}>
                      <Send size={17} /> Здати за ₴{result.buy_price.toLocaleString('uk-UA')}
                    </button>

                    <button onClick={() => setStep(1)} style={{ ...btnBack, justifyContent: 'center', width: '100%' }}>
                      ← Оцінити інший пристрій
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── STEP 4: Contacts ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn .2s' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: `${accent}18`, border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Send size={20} color={accent} />
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 900, color: C.text, marginBottom: 6 }}>Залиште контакти</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Менеджер зв'яжеться для підтвердження ціни і зустрічі</p>
                </div>

                {/* Price reminder */}
                <div style={{ background: `${accent}10`, border: `1px solid ${accent}22`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{cat?.name} · {getBrand()} {getModel()}</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: accent }}>₴{result?.buy_price.toLocaleString('uk-UA')}</span>
                </div>

                <div>
                  <label style={lbl}>Ваше ім'я</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Іван Іваненко" style={inp} />
                </div>

                <div>
                  <label style={{ ...lbl, color: phoneError ? C.danger : C.muted2 }}>Номер телефону *</label>
                  <input type="tel" value={clientPhone}
                    onChange={e => { setClientPhone(e.target.value); setPhoneError(false) }}
                    placeholder="+380 XX XXX XX XX"
                    style={{ ...inp, border: `1px solid ${phoneError ? C.danger : C.border2}` }} />
                  {phoneError && <p style={{ fontSize: 11, color: C.danger, marginTop: 4 }}>Вкажіть номер телефону</p>}
                </div>

                <div>
                  <label style={lbl}>Як зручно зв'язатись?</label>
                  <div className="msg-grid">
                    {MESSENGERS.map(m => {
                      const on = messenger.includes(m.id)
                      return (
                        <button key={m.id} onClick={() => setMessenger(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])}
                          style={{ padding: '11px 8px', borderRadius: 10, border: `1.5px solid ${on ? accent : C.border2}`, background: on ? `${accent}15` : C.card2, color: on ? C.text : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <span>{m.emoji}</span> {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(3)} style={btnBack}><ChevronLeft size={14} /> Назад</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    style={{ ...btnPrimary(submitting), flex: 1 }}>
                    {submitting ? 'Відправляємо...' : <><Send size={15} /> Відправити заявку</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: Success ── */}
            {step === 5 && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn .3s' }}>
                <div>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px auto 16px', boxShadow: '0 0 40px rgba(34,197,94,0.12)' }}>
                    <CheckCircle size={34} color={C.success} />
                  </div>
                  <h2 style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 8 }}>Заявку прийнято! 🎉</h2>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                    Менеджер зв'яжеться з вами{messenger.length > 0 ? ` через ${messenger.join(' / ')}` : ''} найближчим часом
                  </p>
                </div>

                <div style={{ background: C.card2, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}`, textAlign: 'left' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Ваша заявка</p>
                  {[
                    ['Пристрій', `${cat?.name} · ${getBrand()} ${getModel()}`],
                    ['Телефон', clientPhone],
                    messenger.length ? ['Месенджер', messenger.join(', ')] : null,
                  ].filter(Boolean).map(([k, v]: any) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, gap: 10 }}>
                      <span style={{ color: C.muted }}>{k}</span>
                      <span style={{ color: C.text, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 10, borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
                    <span style={{ color: C.muted, fontWeight: 600 }}>Ціна викупу</span>
                    <span style={{ fontWeight: 900, color: C.success, fontSize: 18 }}>₴{result?.buy_price.toLocaleString('uk-UA')}</span>
                  </div>
                </div>

                <button onClick={reset} style={{ ...btnBack, justifyContent: 'center', width: '100%' }}>
                  Оцінити ще один пристрій
                </button>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: C.muted2, marginTop: 18 }}>
            Powered by{' '}
            <a href="https://tradevp.com" target="_blank" rel="noopener noreferrer"
              style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>TradeValue Pro</a>
          </p>
        </div>
      </div>
    </>
  )
}

export const dynamic = 'force-dynamic'
