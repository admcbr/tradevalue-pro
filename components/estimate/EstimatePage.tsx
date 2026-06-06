'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, Info, Save, Printer, Sparkles, X } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { getAllCategories, saveCategory, addOptionToField, addFieldToCategory, addCompletenessItem, saveEstimation, genId } from '@/lib/store'
import { calculate, formatMoney, STATUS_LABELS } from '@/lib/engine'
import { printInvoice } from '@/lib/print'
import LiquidityCard from '@/components/forms/LiquidityCard'
import type { Category, CategoryField, FieldOption, CompletenessItem, EstimationResult, EstimationValue, EvalType } from '@/lib/types'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#09090E', card: '#0E0E16', card2: '#141422', card3: '#1A1A2E',
  border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}
const field: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: C.text, fontFamily: 'inherit', background: C.card2, border: `1px solid ${C.border2}`, outline: 'none' }
const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6, display: 'block' }

// ─── Main component ───────────────────────────────────────────────────────────
export default function EstimatePage() {
  const { t, lang } = useLang()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCat, setActiveCat] = useState<Category | null>(null)
  const [evalType, setEvalType] = useState<EvalType>('buyout')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [completeness, setCompleteness] = useState<string[]>([])   // present item ids
  const [marketPrice, setMarketPrice] = useState('')
  const [comment, setComment] = useState('')
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState('')

  // Modals
  const [addCatModal, setAddCatModal] = useState(false)
  const [addOptionModal, setAddOptionModal] = useState<{ field: CategoryField } | null>(null)
  const [addFieldModal, setAddFieldModal] = useState(false)
  const [addComplModal, setAddComplModal] = useState(false)

  function refresh() { setCategories(getAllCategories()) }
  useEffect(() => { refresh() }, [])

  function selectCat(cat: Category) {
    setActiveCat(cat); setFieldValues({}); setCompleteness([]); setMarketPrice(''); setResult(null); setSavedId(''); setComment('')
  }

  function setFV(fieldId: string, val: string) {
    setFieldValues(prev => ({ ...prev, [fieldId]: val }))
    setResult(null); setSavedId('')
  }

  function toggleComplItem(id: string) {
    setCompleteness(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setResult(null); setSavedId('')
  }

  function handleCalculate() {
    if (!activeCat) return
    const price = parseFloat(marketPrice)
    if (isNaN(price) || price <= 0) { alert('Вкажіть ринкову ціну'); return }
    setLoading(true); setResult(null); setSavedId('')
    setTimeout(() => {
      const res = calculate({ category: activeCat, field_values: fieldValues, completeness_present: completeness, market_price: price, eval_type: evalType, tradein_bonus_percent: 5 })
      setResult(res); setLoading(false)
    }, 400)
  }

  function handleSave() {
    if (!result || !activeCat) return
    const values: EstimationValue[] = activeCat.fields.map(f => ({
      field_id: f.id, field_name: f.name,
      option_id: f.options.find(o => o.name === fieldValues[f.id])?.id,
      value: fieldValues[f.id] || '',
    })).filter(v => v.value)

    const brand = activeCat.fields.find(f => f.name === 'Бренд' || f.name === 'Виробник')
    const model = activeCat.fields.find(f => f.name === 'Модель' || f.name === 'Модель GPU' || f.name === 'Назва товару')

    const est = {
      id: genId(), company_id: '1', category_id: activeCat.id, category_name: activeCat.name,
      user_id: '1', user_name: 'Андрій Коваль', eval_type: evalType,
      market_price: parseFloat(marketPrice), buy_price: result.buy_price,
      sell_price: result.sell_price, profit: result.profit, profitability: result.profitability,
      status: result.status, deal_status: 'estimated' as const,
      explanation: result.explanation, blocked_reason: result.blocked_reason,
      values, completeness_values: completeness, comment,
      brand_name: brand ? fieldValues[brand.id] : '',
      model_name: model ? fieldValues[model.id] : '',
      created_at: new Date().toISOString(),
    }
    saveEstimation(est as any)
    setSavedId(est.id)
  }

  function handlePrint() {
    if (!result || !activeCat) return
    const brand = activeCat.fields.find(f => f.name === 'Бренд' || f.name === 'Виробник')
    const model = activeCat.fields.find(f => f.name === 'Модель' || f.name === 'Модель GPU')
    const fakeEst = {
      id: savedId || genId(), created_at: new Date().toISOString(),
      company_id: '1', category_id: activeCat.id, category_name: activeCat.name,
      user_id: '1', user_name: 'Андрій Коваль', eval_type: evalType,
      market_price: parseFloat(marketPrice), buy_price: result.buy_price,
      sell_price: result.sell_price, profit: result.profit, profitability: result.profitability,
      status: result.status, deal_status: 'estimated',
      explanation: result.explanation, values: [], completeness_values: completeness, comment,
      brand: brand ? fieldValues[brand.id] : '',
      model: model ? fieldValues[model.id] : '',
      condition: fieldValues[activeCat.fields.find(f => f.name === 'Стан')?.id || ''] || '',
      ram: '', storage: '', cpu: '', gpu: '',
    } as any
    printInvoice(fakeEst, 'Андрій Коваль', 'Techno Shop')
  }

  const brandVal = activeCat ? (fieldValues[activeCat.fields.find(f => f.name === 'Бренд' || f.name === 'Виробник')?.id || ''] || '') : ''
  const modelVal = activeCat ? (fieldValues[activeCat.fields.find(f => f.name === 'Модель' || f.name === 'Модель GPU')?.id || ''] || '') : ''

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Category tabs ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Категорія товару</p>
        <div className="cat-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => selectCat(cat)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10,
              border: `1px solid ${activeCat?.id === cat.id ? C.accent + '55' : C.border2}`,
              background: activeCat?.id === cat.id ? 'rgba(99,130,255,0.12)' : C.card2,
              color: activeCat?.id === cat.id ? C.text : C.muted,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
          <button onClick={() => setAddCatModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10,
            border: `1px dashed ${C.border2}`, background: 'transparent',
            color: C.muted2, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={14} /> Додати категорію
          </button>
        </div>
      </div>

      {!activeCat ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted2 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👆</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: C.muted }}>Оберіть категорію вище</p>
          <p style={{ fontSize: 13 }}>Кожна категорія має свої характеристики та правила оцінки</p>
        </div>
      ) : (
        <div className="rg-form">

          {/* ── LEFT: Form ───────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Eval type */}
            <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, gap: 4 }}>
              {[
                { val: 'buyout' as EvalType,  label: t.buyout,    sub: 'Стандартна ціна' },
                { val: 'tradein' as EvalType, label: t.tradein, sub: '+5% для клієнта' },
              ].map(tab => (
                <button key={tab.val} onClick={() => { setEvalType(tab.val); setResult(null) }} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: evalType === tab.val ? C.card2 : 'transparent', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 13, color: evalType === tab.val ? C.text : C.muted,
                  borderTop: `2px solid ${evalType === tab.val ? C.accent : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  {tab.label}
                  <span style={{ display: 'block', fontSize: 10, fontWeight: 500, color: evalType === tab.val ? C.muted : C.muted2, marginTop: 2 }}>{tab.sub}</span>
                </button>
              ))}
            </div>

            {/* Dynamic fields */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{activeCat.icon} {activeCat.name}</p>
                  <p style={{ fontSize: 11, color: C.muted2, marginTop: 2 }}>Характеристики пристрою</p>
                </div>
                <button onClick={() => setAddFieldModal(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted2,
                  fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={12} /> Поле
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {activeCat.fields.map(f => (
                  <div key={f.id} style={{ gridColumn: f.type === 'text' && f.name.toLowerCase().includes('модель') ? '1/-1' : undefined }}>
                    <FieldInput
                      field={f}
                      value={fieldValues[f.id] || ''}
                      onChange={v => setFV(f.id, v)}
                      onAddOption={() => setAddOptionModal({ field: f })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ринкова ціна */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div>
                <span style={label}>Ринкова ціна (₴) *</span>
                <input type="number" style={{ ...field, fontSize: 20, fontWeight: 700, padding: '12px 16px' }}
                  placeholder="наприклад 28000"
                  value={marketPrice} onChange={e => { setMarketPrice(e.target.value); setResult(null); setSavedId('') }} />
                <p style={{ fontSize: 11, color: C.muted2, marginTop: 6 }}>
                  Ліміти: {formatMoney(activeCat.rules.min_market_price)} — {formatMoney(activeCat.rules.max_market_price)}
                </p>
              </div>
            </div>

            {/* Completeness */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Комплектація</p>
                  <p style={{ fontSize: 11, color: C.muted2, marginTop: 2 }}>Відмітьте що є в наявності</p>
                </div>
                <button onClick={() => setAddComplModal(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted2,
                  fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={12} /> Пункт
                </button>
              </div>
              {activeCat.completeness.filter(c => c.is_active).length === 0 ? (
                <p style={{ fontSize: 12, color: C.muted2, fontStyle: 'italic' }}>Натисніть «+ Пункт» щоб додати елементи комплектності</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {activeCat.completeness.filter(c => c.is_active).map(item => {
                    const on = completeness.includes(item.id)
                    const isBonus = item.impact_type === 'add_amount' || item.impact_type === 'add_percent'
                    const impactLabel = item.impact_type === 'none' ? '' : item.block_estimation ? ' ⛔' : isBonus ? ` +${item.impact_value}₴` : ` −${item.impact_value}₴`
                    return (
                      <button key={item.id} onClick={() => toggleComplItem(item.id)} style={{
                        padding: '10px 10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        border: `1px solid ${on ? (isBonus ? 'rgba(52,217,138,0.3)' : 'rgba(99,130,255,0.3)') : C.border2}`,
                        background: on ? (isBonus ? 'rgba(52,217,138,0.08)' : 'rgba(99,130,255,0.08)') : C.card2,
                        transition: 'all 0.15s',
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: on ? C.text : C.muted, marginBottom: 2 }}>{item.name}</p>
                        {impactLabel && <p style={{ fontSize: 10, color: isBonus ? C.success : C.accent }}>{on ? 'Є' : 'Немає'}{impactLabel}</p>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Comment + submit */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <span style={label}>Коментар</span>
              <textarea style={{ ...field, resize: 'none', lineHeight: 1.6, marginBottom: 20 }}
                rows={2} placeholder="Нотатки, опис дефектів..."
                value={comment} onChange={e => setComment(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCalculate} disabled={loading} style={{
                  flex: 1, padding: '13px 24px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #6382FF, #A78BFA)', color: '#fff',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1,
                  boxShadow: '0 0 24px rgba(99,130,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Розраховую...</>
                    : <><Sparkles size={14} />Оцінити</>}
                </button>
                <button onClick={() => { setFieldValues({}); setCompleteness([]); setMarketPrice(''); setResult(null); setSavedId(''); setComment('') }}
                  style={{ padding: '13px 18px', borderRadius: 11, border: `1px solid ${C.border2}`, background: C.card2, color: C.muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Скинути
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Result ─────────────────────────────────────────────────── */}
          <div className="sticky-result" style={{ position: 'sticky', top: 24 }}>
            {!result ? (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: 'center', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>⚡</div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Заповніть форму</p>
                <p style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6 }}>Вкажіть характеристики та натисніть «Оцінити»</p>
              </div>
            ) : result.status === 'not_evaluated' ? (
              <BlockedResult reason={result.blocked_reason!} catName={activeCat.name} />
            ) : (
              <GoodResult
                result={result} evalType={evalType}
                marketPrice={parseFloat(marketPrice)}
                brandVal={brandVal} modelVal={modelVal}
                catName={activeCat.name}
                savedId={savedId}
                onSave={handleSave} onPrint={handlePrint}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      {addCatModal && <AddCategoryModal onClose={() => setAddCatModal(false)} onSaved={() => { refresh(); setAddCatModal(false) }} />}
      {addOptionModal && <AddOptionModal field={addOptionModal.field} categoryId={activeCat!.id} onClose={() => setAddOptionModal(null)} onSaved={() => { refresh(); setActiveCat(getAllCategories().find(c => c.id === activeCat!.id) || activeCat); setAddOptionModal(null) }} />}
      {addFieldModal && <AddFieldModal categoryId={activeCat!.id} onClose={() => setAddFieldModal(false)} onSaved={() => { refresh(); setActiveCat(getAllCategories().find(c => c.id === activeCat!.id) || activeCat); setAddFieldModal(false) }} />}
      {addComplModal && <AddComplModal categoryId={activeCat!.id} onClose={() => setAddComplModal(false)} onSaved={() => { refresh(); setActiveCat(getAllCategories().find(c => c.id === activeCat!.id) || activeCat); setAddComplModal(false) }} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Field input ──────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange, onAddOption }: {
  field: CategoryField; value: string
  onChange: (v: string) => void; onAddOption: () => void
}) {
  const isRequired = field.is_required

  if (field.type === 'text') return (
    <div>
      <span style={label}>{field.name}{isRequired && <span style={{ color: '#F87171' }}> *</span>}</span>
      <input style={field_} placeholder={`Введіть ${field.name.toLowerCase()}`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )

  if (field.type === 'number') return (
    <div>
      <span style={label}>{field.name}{isRequired && <span style={{ color: '#F87171' }}> *</span>}</span>
      <div style={{ position: 'relative' }}>
        <input type="number" style={field_} placeholder="0" value={value} onChange={e => onChange(e.target.value)} />
        {value && field.name.toLowerCase().includes('батарей') && (
          <BatteryIndicator val={parseFloat(value)} />
        )}
      </div>
    </div>
  )

  if (field.type === 'checkbox') return (
    <div>
      <span style={label}>{field.name}{isRequired && <span style={{ color: '#F87171' }}> *</span>}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Ні', 'Так'].map(opt => {
          const opt_data = field.options.find(o => o.name === opt)
          const isBlock = opt_data?.block_estimation
          return (
            <button key={opt} onClick={() => onChange(opt)} style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
              border: `1px solid ${value === opt ? (isBlock ? 'rgba(248,113,113,0.4)' : 'rgba(99,130,255,0.3)') : C.border2}`,
              background: value === opt ? (isBlock ? 'rgba(248,113,113,0.1)' : 'rgba(99,130,255,0.1)') : C.card2,
              color: value === opt ? (isBlock ? '#F87171' : C.text) : C.muted,
            }}>{opt === 'Так' ? '✓ Так' : '✕ Ні'}</button>
          )
        })}
      </div>
    </div>
  )

  // select
  return (
    <div>
      <span style={label}>{field.name}{isRequired && <span style={{ color: '#F87171' }}> *</span>}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <select style={{ ...field_, flex: 1, color: value ? C.text : C.muted, cursor: 'pointer' }}
          value={value} onChange={e => onChange(e.target.value)}>
          <option value="">Оберіть...</option>
          {field.options.map(o => (
            <option key={o.id} value={o.name} style={{ background: C.card2 }}>
              {o.name}{o.block_estimation ? ' ⛔' : o.impact_type !== 'none' ? ` (${impactSign(o.impact_type)}${o.impact_value}${o.impact_type.includes('percent') ? '%' : '₴'})` : ''}
            </option>
          ))}
        </select>
        <button onClick={onAddOption} title="Додати новий параметр" style={{
          width: 38, flexShrink: 0, borderRadius: 9, border: `1px solid ${C.border2}`,
          background: C.card2, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

const field_ = { ...C, width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: C.text, fontFamily: 'inherit', background: C.card2, border: `1px solid ${C.border2}`, outline: 'none' } as React.CSSProperties

function impactSign(t: string) { return t.startsWith('add') ? '+' : '−' }

function BatteryIndicator({ val }: { val: number }) {
  const color = val >= 80 ? '#34D98A' : val >= 65 ? '#FBBF24' : '#F87171'
  const text = val >= 80 ? '✓ Добре' : val >= 65 ? '⚠ Задовільно' : val >= 50 ? '✗ −500 ₴' : '✗ −1500 ₴'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, borderRadius: 2, background: C.border2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${Math.min(val, 100)}%`, background: color, borderRadius: 2 }} />
      </div>
      <p style={{ fontSize: 10, color, fontWeight: 600 }}>{text}</p>
    </div>
  )
}

// ─── Result cards ─────────────────────────────────────────────────────────────
function BlockedResult({ reason, catName }: { reason: string; catName: string }) {
  return (
    <div style={{ borderRadius: 16, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <XCircle size={20} color="#F87171" />
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#EDEDF0' }}>Не підлягає оцінці</p>
          <p style={{ fontSize: 11, color: 'rgba(248,113,113,0.7)', marginTop: 2 }}>{catName}</p>
        </div>
        <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>Відмова</span>
      </div>
      <p style={{ fontSize: 13, color: '#8080AA', lineHeight: 1.7 }}>{reason}</p>
    </div>
  )
}

function GoodResult({ result, evalType, marketPrice, brandVal, modelVal, catName, savedId, onSave, onPrint }: {
  result: EstimationResult; evalType: EvalType; marketPrice: number
  brandVal: string; modelVal: string; catName: string; savedId: string
  onSave: () => void; onPrint: () => void
}) {
  const [showLiquidity, setShowLiquidity] = useState(false)
  const isGood = result.status === 'good'
  return (
    <div style={{
      borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
      border: `1px solid ${isGood ? 'rgba(99,130,255,0.2)' : 'rgba(251,191,36,0.2)'}`,
      background: isGood ? 'linear-gradient(135deg,rgba(99,130,255,0.06),rgba(52,217,138,0.03))' : 'linear-gradient(135deg,rgba(251,191,36,0.06),transparent)',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: isGood ? 'rgba(99,130,255,0.08)' : 'rgba(251,191,36,0.08)', filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isGood ? <CheckCircle size={18} color="#34D98A" /> : <AlertTriangle size={18} color="#FBBF24" />}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#EDEDF0' }}>{brandVal || catName} {modelVal}</p>
              <p style={{ fontSize: 11, color: '#8080AA', marginTop: 2 }}>{evalType === 'tradein' ? '🔄 Трейд-Ін' : '💰 Викуп'}</p>
            </div>
          </div>
          <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: isGood ? 'rgba(52,217,138,0.1)' : 'rgba(251,191,36,0.1)', color: isGood ? '#34D98A' : '#FBBF24', border: `1px solid ${isGood ? 'rgba(52,217,138,0.2)' : 'rgba(251,191,36,0.2)'}` }}>
            {STATUS_LABELS[result.status]}
          </span>
        </div>

        {/* Prices grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { l: 'Ринкова ціна', v: formatMoney(marketPrice), c: undefined },
            { l: evalType === 'tradein' ? 'Трейд-Ін' : 'Ціна викупу', v: formatMoney(result.buy_price), c: '#6382FF' },
            { l: 'Ціна продажу', v: formatMoney(result.sell_price), c: '#34D98A' },
            { l: 'Прибуток', v: formatMoney(result.profit), c: '#FBBF24' },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: '#4A4A70', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>{l}</p>
              <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: c || '#EDEDF0' }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#8080AA' }}>Рентабельність</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: isGood ? '#34D98A' : '#FBBF24' }}>{result.profitability}%</span>
        </div>

        {/* Explanation */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Info size={11} color="#4A4A70" />
            <p style={{ fontSize: 9.5, fontWeight: 800, color: '#4A4A70', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Пояснення розрахунку</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {result.explanation.map((exp, i) => {
              const isWarn = exp.startsWith('⚠')
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: isWarn ? '#FBBF24' : '#6382FF', marginTop: 6, flexShrink: 0 }} />
                  <p style={{ fontSize: 11.5, color: '#8080AA', lineHeight: 1.5 }}>{isWarn ? exp.slice(2) : exp}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Liquidity toggle */}
        <button onClick={() => setShowLiquidity(!showLiquidity)} style={{
          width: '100%', padding: '8px', borderRadius: 9, border: `1px solid ${C.border2}`,
          background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          ⚡ {showLiquidity ? 'Сховати' : 'AI аналіз ліквідності'}
        </button>
        {showLiquidity && brandVal && <LiquidityCard brand={brandVal} model={modelVal} category={catName} marketPrice={marketPrice} condition="" />}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onSave} style={{
            padding: '11px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: savedId ? 'rgba(52,217,138,0.15)' : 'linear-gradient(135deg, #6382FF, #A78BFA)',
            color: savedId ? '#34D98A' : '#fff', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: savedId ? 'none' : '0 0 16px rgba(99,130,255,0.3)',
          }}>
            <Save size={13} /> {savedId ? '✓ Збережено' : 'Зберегти'}
          </button>
          <button onClick={onPrint} style={{
            padding: '11px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            background: C.card2, border: `1px solid ${C.border2}`, color: C.muted, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Printer size={13} /> Накладна
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────
const ICONS = ['💻','📱','🎮','🖥','📟','🕹','📦','🖥️','⚙️','🖨','📺','⌚','🎧','📷','🔋','🖱','📡']
const IMPACT_OPTIONS = [
  { val: 'none',           label: 'Без впливу на ціну' },
  { val: 'add_amount',     label: '+ Сума (₴)' },
  { val: 'sub_amount',     label: '− Сума (₴)' },
  { val: 'add_percent',    label: '+ Відсоток (%)' },
  { val: 'sub_percent',    label: '− Відсоток (%)' },
  { val: 'block',          label: '⛔ Не оцінювати' },
]

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AddCategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  function save() {
    if (!name.trim()) return
    const { createCategory } = require('@/lib/store')
    createCategory(name.trim(), icon)
    onSaved()
  }
  return (
    <Modal title="Нова категорія" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><span style={label}>Назва</span><input style={field} placeholder="напр. Принтери" value={name} onChange={e => setName(e.target.value)} /></div>
        <div>
          <span style={label}>Іконка</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${icon === ic ? C.accent : C.border2}`, background: icon === ic ? 'rgba(99,130,255,0.15)' : C.card2, fontSize: 18, cursor: 'pointer' }}>{ic}</button>
            ))}
          </div>
        </div>
        <button onClick={save} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Створити категорію</button>
      </div>
    </Modal>
  )
}

function AddOptionModal({ field: f, categoryId, onClose, onSaved }: { field: CategoryField; categoryId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [impactType, setImpactType] = useState<string>('none')
  const [impactVal, setImpactVal] = useState('')
  function save() {
    if (!name.trim()) return
    const opt: FieldOption = {
      id: genId(), field_id: f.id, name: name.trim(),
      impact_type: impactType === 'block' ? 'none' : impactType as any,
      impact_value: parseFloat(impactVal) || 0,
      block_estimation: impactType === 'block',
      sort_order: f.options.length,
    }
    addOptionToField(categoryId, f.id, opt)
    onSaved()
  }
  return (
    <Modal title={`Додати до «${f.name}»`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><span style={label}>Назва параметру</span><input style={field} placeholder="напр. Ryzen 7 7735HS" value={name} onChange={e => setName(e.target.value)} /></div>
        <div>
          <span style={label}>Вплив на ціну</span>
          <select style={{ ...field, color: C.text }} value={impactType} onChange={e => setImpactType(e.target.value)}>
            {IMPACT_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </div>
        {impactType !== 'none' && impactType !== 'block' && (
          <div><span style={label}>Розмір ({impactType.includes('percent') ? '%' : '₴'})</span><input type="number" style={field} placeholder="напр. 500" value={impactVal} onChange={e => setImpactVal(e.target.value)} /></div>
        )}
        <button onClick={save} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Додати параметр</button>
      </div>
    </Modal>
  )
}

function AddFieldModal({ categoryId, onClose, onSaved }: { categoryId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<string>('select')
  const [required, setRequired] = useState(false)
  const [affectsPrice, setAffectsPrice] = useState(false)
  function save() {
    if (!name.trim()) return
    const f: CategoryField = {
      id: 'f_' + genId(), category_id: categoryId, name: name.trim(),
      type: type as any, is_required: required, affects_price: affectsPrice,
      show_in_stats: true, sort_order: 99, options: [],
    }
    addFieldToCategory(categoryId, f)
    onSaved()
  }
  return (
    <Modal title="Додати поле характеристики" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><span style={label}>Назва</span><input style={field} placeholder="напр. Стан батареї" value={name} onChange={e => setName(e.target.value)} /></div>
        <div>
          <span style={label}>Тип поля</span>
          <select style={{ ...field, color: C.text }} value={type} onChange={e => setType(e.target.value)}>
            <option value="select">Список (Select)</option>
            <option value="text">Текст</option>
            <option value="number">Число</option>
            <option value="checkbox">Так / Ні</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.muted }}>
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} style={{ accentColor: C.accent }} /> Обов'язкове
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.muted }}>
            <input type="checkbox" checked={affectsPrice} onChange={e => setAffectsPrice(e.target.checked)} style={{ accentColor: C.accent }} /> Впливає на ціну
          </label>
        </div>
        <button onClick={save} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Додати поле</button>
      </div>
    </Modal>
  )
}

function AddComplModal({ categoryId, onClose, onSaved }: { categoryId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [impactType, setImpactType] = useState<string>('sub_amount')
  const [impactVal, setImpactVal] = useState('')
  const [blockOn, setBlockOn] = useState(false)
  function save() {
    if (!name.trim()) return
    const item: CompletenessItem = {
      id: 'ci_' + genId(), category_id: categoryId, name: name.trim(),
      impact_type: impactType as any, impact_value: parseFloat(impactVal) || 0,
      block_estimation: blockOn, is_active: true,
      sort_order: 99,
    }
    addCompletenessItem(categoryId, item)
    onSaved()
  }
  return (
    <Modal title="Додати пункт комплектності" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><span style={label}>Назва</span><input style={field} placeholder="напр. Оригінальний кабель" value={name} onChange={e => setName(e.target.value)} /></div>
        <div>
          <span style={label}>Вплив (якщо відсутній)</span>
          <select style={{ ...field, color: C.text }} value={impactType} onChange={e => setImpactType(e.target.value)}>
            <option value="sub_amount">− Сума (₴) при відсутності</option>
            <option value="add_amount">+ Сума (₴) при наявності</option>
            <option value="none">Без впливу</option>
          </select>
        </div>
        {impactType !== 'none' && (
          <div><span style={label}>Сума (₴)</span><input type="number" style={field} placeholder="напр. 500" value={impactVal} onChange={e => setImpactVal(e.target.value)} /></div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.muted }}>
          <input type="checkbox" checked={blockOn} onChange={e => setBlockOn(e.target.checked)} style={{ accentColor: C.accent }} />
          Блокувати оцінку якщо відсутній
        </label>
        <button onClick={save} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Додати</button>
      </div>
    </Modal>
  )
}
