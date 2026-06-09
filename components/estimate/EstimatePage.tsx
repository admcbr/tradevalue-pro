'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, Info, Save, Printer, Sparkles, X, Eye } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase'
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
  const [showClientModal, setShowClientModal] = useState(false)

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

  async function handleCalculate() {
    if (!activeCat) return
    const price = parseFloat(marketPrice)
    if (isNaN(price) || price <= 0) {
      alert(lang === 'uk' ? 'Вкажіть ринкову ціну' : 'Укажите рыночную цену')
      return
    }

    // Validate required fields BEFORE saving
    const missingRequired = activeCat.fields.filter((f: any) =>
      f.is_required && (!fieldValues[f.id] || fieldValues[f.id].trim() === '')
    )
    if (missingRequired.length > 0) {
      const names = missingRequired.map((f: any) => f.name).join(', ')
      alert(lang === 'uk'
        ? `Заповніть обов'язкові поля: ${names}`
        : `Заполните обязательные поля: ${names}`)
      return
    }

    setLoading(true); setResult(null); setSavedId('')

    // Calculate result
    const res = calculate({ category: activeCat, field_values: fieldValues, completeness_present: completeness, market_price: price, eval_type: evalType, tradein_bonus_percent: 5 })
    setResult(res)

    // Only save if calculation was successful (not blocked by missing fields)
    // not_evaluated = blocked by rule (too expensive etc) — still save
    // But if result has no buy_price and is not_evaluated due to missing data — don't save
    if (!res || res.buy_price === undefined) {
      setLoading(false)
      return
    }

    // Auto-save to Supabase
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userRecord } = await supabase.from('users').select('id, name, company_id').eq('id', user.id).single()
        if (userRecord?.company_id) {
          const brand = activeCat.fields.find((f: any) => f.name === 'Бренд' || f.name === 'Виробник')
          const model = activeCat.fields.find((f: any) => f.name === 'Модель' || f.name === 'Модель GPU' || f.name === 'Назва товару')
          const { data: saved, error } = await supabase.from('estimations').insert({
            company_id: userRecord.company_id,
            user_id: user.id,
            category_id: activeCat.id,
            category_name: activeCat.name,
            brand_name: brand ? fieldValues[brand.id] : '',
            model_name: model ? fieldValues[model.id] : '',
            eval_type: evalType,
            market_price: price,
            buy_price: res.buy_price,
            sell_price: res.sell_price,
            profit: res.profit,
            profitability: res.profitability,
            status: res.status,
            deal_status: 'estimated',
            explanation: res.explanation,
            field_values: fieldValues,
            completeness_values: completeness,
            comment,
          }).select().single()

          if (error?.message?.includes('Plan limit')) {
            setResult(null)
            setLoading(false)
            alert(lang === 'uk'
              ? '❌ Ліміт оцінок вичерпано на цей місяць. Перейдіть на вищий тариф у розділі «Тарифи».'
              : '❌ Лимит оценок исчерпан на этот месяц. Перейдите на более высокий тариф в разделе «Тарифы».')
            return
          }
          if (saved) setSavedId(saved.id)
        }
      }
    } catch(e) {
      // Supabase not configured — continue without saving
    }

    setLoading(false)
  }

  // handleSave removed — auto-save on Calculate now

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
                onPrint={handlePrint}
                showClientModal={showClientModal}
                setShowClientModal={setShowClientModal}
                lang={lang}
                activeCat={activeCat}
                fieldValues={fieldValues}
                completeness={completeness}
                comment={comment}
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

function GoodResult({ result, evalType, marketPrice, brandVal, modelVal, catName, savedId, onPrint, showClientModal, setShowClientModal, lang, activeCat, fieldValues, completeness, comment }: {
  result: EstimationResult; evalType: EvalType; marketPrice: number
  brandVal: string; modelVal: string; catName: string; savedId: string
  onPrint: () => void
  showClientModal: boolean; setShowClientModal: (v: boolean) => void
  lang: string; activeCat: any; fieldValues: Record<string,string>; completeness: string[]; comment: string
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

        {/* Client Modal */}
        {showClientModal && (
          <ClientModal
            result={result}
            marketPrice={marketPrice}
            brandVal={brandVal}
            modelVal={modelVal}
            catName={catName}
            evalType={evalType}
            lang={lang}
            activeCat={activeCat}
            fieldValues={fieldValues}
            completeness={completeness}
            onClose={() => setShowClientModal(false)}
            comment={comment}
          />
        )}

        {/* Show Client button */}
        <button onClick={() => setShowClientModal(true)} style={{
          width:'100%', padding:'11px', borderRadius:10, marginBottom:10,
          border:'1px solid rgba(99,130,255,0.3)', background:'rgba(99,130,255,0.08)',
          color:C.accent, fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'all 0.15s',
        }}>
          <Eye size={15}/> {lang === 'ru' ? 'Показать клиенту' : 'Показати клієнту'}
        </button>

        {/* Auto-saved indicator */}
        {savedId && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:9, background:'rgba(52,217,138,0.08)', border:'1px solid rgba(52,217,138,0.2)', fontSize:12, fontWeight:600, color:'#34D98A' }}>
            ✓ {lang === 'uk' ? 'Збережено в історію' : 'Сохранено в историю'}
          </div>
        )}
        {savedId && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'rgba(52,217,138,0.08)', border:'1px solid rgba(52,217,138,0.2)', marginBottom:10 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#34D98A', boxShadow:'0 0 6px #34D98A' }} />
            <p style={{ fontSize:13, fontWeight:600, color:'#34D98A' }}>{lang==='uk' ? '✓ Збережено в історію автоматично' : '✓ Сохранено в историю автоматически'}</p>
          </div>
        )}

        {/* Actions — only Print */}
        <button onClick={onPrint} style={{
          width:'100%', padding:'11px 16px', borderRadius:10, cursor:'pointer', fontFamily:'inherit',
          background: C.card2, border:`1px solid ${C.border2}`, color:C.muted, fontWeight:600, fontSize:13,
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
        }}>
          <Printer size={13} /> {lang==='uk' ? 'Роздрукувати накладну' : 'Распечатать накладную'}
        </button>
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


// ─── Client Modal ──────────────────────────────────────────────────────────────
function ClientModal({ result, marketPrice, brandVal, modelVal, catName, evalType, lang, activeCat, fieldValues, completeness, onClose, comment }: {
  result: EstimationResult; marketPrice: number; brandVal: string; modelVal: string
  catName: string; evalType: string; lang: string; activeCat: any
  fieldValues: Record<string,string>; completeness: string[]; onClose: () => void; comment: string
}) {
  const isUk = lang === 'uk'

  // Load client view settings
  const settings = (() => {
    try {
      const s = localStorage.getItem('tv_client_view')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })() || {
    show_device_name: true, show_market_price: true, show_buy_price: true,
    show_explanation: true, show_condition: true, show_completeness: true,
    show_sell_price: false, show_profit: false, show_profitability: false,
    buy_price_label_uk: 'Наша пропозиція', buy_price_label_ru: 'Наше предложение',
  }

  const buyLabel = isUk ? (settings.buy_price_label_uk || 'Наша пропозиція') : (settings.buy_price_label_ru || 'Наше предложение')
  const condField = activeCat?.fields?.find((f: any) => f.name === 'Стан')
  const condVal = condField ? fieldValues[condField.id] : ''
  const complItems = activeCat?.completeness?.filter((ci: any) => completeness.includes(ci.id)) || []

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background:'#0E0E18', border:'1px solid #2A2A44', borderRadius:22, width:'100%', maxWidth:480, overflow:'hidden', boxShadow:'0 0 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(16,185,129,0.08))', padding:'24px 28px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', boxShadow:'0 0 8px #10B981' }} />
                <p style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px' }}>
                  {isUk ? 'Оцінка пристрою' : 'Оценка устройства'}
                </p>
              </div>
              {settings.show_device_name && (
                <p style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', letterSpacing:-0.5 }}>{brandVal} {modelVal}</p>
              )}
              <p style={{ fontSize:13, color:'#475569', marginTop:2 }}>{catName} · {new Date().toLocaleDateString(isUk?'uk-UA':'ru-RU')}</p>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', width:32, height:32, borderRadius:9, cursor:'pointer', color:'#94A3B8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding:'20px 28px 28px', display:'flex', flexDirection:'column', gap:12 }}>

          {/* Condition */}
          {settings.show_condition && condVal && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 }}>{isUk?'Стан':'Состояние'}</p>
              <p style={{ fontSize:15, fontWeight:600, color:'#F8FAFC' }}>{condVal}</p>
            </div>
          )}

          {/* Completeness */}
          {settings.show_completeness && complItems.length > 0 && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{isUk?'Комплектація':'Комплектация'}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {complItems.map((ci: any) => (
                  <span key={ci.id} style={{ padding:'4px 10px', borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', fontSize:12, color:'#10B981', fontWeight:600 }}>✓ {ci.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Price cards */}
          <div style={{ display:'grid', gridTemplateColumns: (settings.show_market_price && settings.show_buy_price) ? '1fr 1fr' : '1fr', gap:10 }}>
            {settings.show_market_price && (
              <div style={{ padding:'16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{isUk?'Ринкова вартість':'Рыночная стоимость'}</p>
                <p style={{ fontSize:26, fontWeight:900, letterSpacing:-1, color:'#94A3B8' }}>{marketPrice.toLocaleString('uk-UA')} ₴</p>
              </div>
            )}
            {settings.show_buy_price && (
              <div style={{ padding:'16px', borderRadius:14, background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))', border:'1px solid rgba(99,102,241,0.3)', textAlign:'center' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#818CF8', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{buyLabel}</p>
                <p style={{ fontSize:26, fontWeight:900, letterSpacing:-1, color:'#F8FAFC' }}>{result.buy_price.toLocaleString('uk-UA')} ₴</p>
              </div>
            )}
          </div>

          {/* Optional: sell price, profit, profitability */}
          {(settings.show_sell_price || settings.show_profit || settings.show_profitability) && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8 }}>
              {settings.show_sell_price && (
                <div style={{ padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:4 }}>{isUk?'Ціна продажу':'Цена продажи'}</p>
                  <p style={{ fontSize:18, fontWeight:800, color:'#10B981' }}>{result.sell_price.toLocaleString('uk-UA')} ₴</p>
                </div>
              )}
              {settings.show_profit && (
                <div style={{ padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:4 }}>{isUk?'Прибуток':'Прибыль'}</p>
                  <p style={{ fontSize:18, fontWeight:800, color:'#F59E0B' }}>{result.profit.toLocaleString('uk-UA')} ₴</p>
                </div>
              )}
              {settings.show_profitability && (
                <div style={{ padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:4 }}>{isUk?'Рентабельність':'Рентабельность'}</p>
                  <p style={{ fontSize:18, fontWeight:800, color:'#F59E0B' }}>{result.profitability}%</p>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {/* Comment for client */}
          {comment && (
            <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>
                {isUk?'Коментар':'Комментарий'}
              </p>
              <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.7 }}>{comment}</p>
            </div>
          )}

          {/* Explanation — without base rule line */}
          {settings.show_explanation && result.explanation.length > 0 && (
            <div style={{ padding:'16px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:10 }}>
                {isUk?'Як ми розрахували':'Как мы рассчитали'}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {result.explanation
                  .filter(e => !e.startsWith('⚠'))
                  .filter(e => !e.toLowerCase().includes('базов') && !e.toLowerCase().includes('базов'))
                  .filter(e => !e.toLowerCase().includes('базове правило') && !e.toLowerCase().includes('купуємо на') && !e.toLowerCase().includes('покупать ниже'))
                  .map((exp, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'#6366F1', marginTop:5, flexShrink:0 }} />
                    <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6 }}>{exp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} style={{ padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:4, boxShadow:'0 0 24px rgba(99,102,241,0.3)' }}>
            {isUk ? 'Закрити' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  )
}
