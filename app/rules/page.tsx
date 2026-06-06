'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/i18n'
import { Save } from 'lucide-react'
import { Card, SectionLabel } from '@/components/ui'
import { getAllCategories } from '@/lib/store'

const C = {
  card: '#0E0E16', card2: '#141422', border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

const fieldSt: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600,
  color: C.text, background: C.card2, border: `1px solid ${C.border2}`,
  fontFamily: 'inherit', outline: 'none', textAlign: 'right' as const,
}

function RuleRow({ label, desc, value, unit, onChange }: {
  label: string; desc?: string; value: number; unit: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{label}</p>
        {desc && <p style={{ fontSize:11, color:C.muted2, marginTop:2 }}>{desc}</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <input type="number" style={{ ...fieldSt, width:100 }} value={value} onChange={e => onChange(e.target.value)} />
        <span style={{ fontSize:13, color:C.muted2, width:20 }}>{unit}</span>
      </div>
    </div>
  )
}

export default function RulesPage() {
  const { t, lang } = useLang()
  const isUk = lang === 'uk'

  const [rules, setRules] = useState({ default_buy_percent:20, default_sell_percent:5, min_profit:2500, min_profitability:15, max_buy_price:50000, min_buy_price:3000, max_market_price:80000, min_market_price:2000 })
  const [catRules, setCatRules] = useState<Array<{id:string;category:string;buy_percent:number;is_enabled:boolean}>>([])
  const [saved, setSaved] = useState(false)
  const [tradeInType, setTradeInType] = useState<'percent'|'fixed'>('percent')
  const [tradeInPercent, setTradeInPercent] = useState(5)
  const [tradeInFixed, setTradeInFixed] = useState(1500)
  const [tradeInEnabled, setTradeInEnabled] = useState(true)
  const [complRows, setComplRows] = useState([
    { key:'charger',  labelUk:'Без зарядного пристрою', labelRu:'Без зарядного устройства', value:800,  isBonus:false, enabled:true },
    { key:'box',      labelUk:'Без коробки',             labelRu:'Без коробки',               value:300,  isBonus:false, enabled:true },
    { key:'docs',     labelUk:'Без документів',          labelRu:'Без документов',             value:200,  isBonus:false, enabled:true },
    { key:'warranty', labelUk:'Є гарантія',              labelRu:'Есть гарантия',              value:500,  isBonus:true,  enabled:true },
    { key:'bag',      labelUk:'Є сумка',                 labelRu:'Есть сумка',                 value:300,  isBonus:true,  enabled:true },
  ])

  useEffect(() => {
    const cats = getAllCategories()
    setCatRules(cats.map(c => ({
      id: c.id, category: c.name,
      buy_percent: c.rules?.buy_percent ?? 20, is_enabled: true,
    })))
  }, [])

  function updateRule(key: keyof typeof rules, val: string) {
    setRules(r => ({ ...r, [key]: parseFloat(val) || 0 }))
  }

  // Condition rows with both languages
  const condRows = [
    { key:'Aplus', labelUk:'A+ — як новий',   labelRu:'A+ — как новый',      adj:'+5%',   color:C.success },
    { key:'A',     labelUk:'A — відмінний',    labelRu:'A — отличный',        adj:'0%',    color:C.muted },
    { key:'B',     labelUk:'B — добрий',       labelRu:'B — хороший',         adj:'−8%',   color:C.warning },
    { key:'C',     labelUk:'C — задовільний',  labelRu:'C — удовлетворительный', adj:'−18%', color:C.danger },
    { key:'D',     labelUk:'D — поганий',      labelRu:'D — плохой',          adj: isUk ? 'Відмова' : 'Отказ', color:C.danger },
  ]

  // General rule rows with both languages
  const sections = [
    { key:'default_buy_percent',  labelUk:'Купувати нижче ринку на',          labelRu:'Покупать ниже рынка на',         descUk:'Базовий відсоток знижки від ринкової ціни', descRu:'Базовый процент скидки от рыночной цены', unit:'%' },
    { key:'default_sell_percent', labelUk:'Продавати вище ринку на',           labelRu:'Продавать выше рынка на',        descUk:'Надбавка до ринкової ціни при продажу',    descRu:'Надбавка к рыночной цене при продаже',    unit:'%' },
    { key:'min_profit',           labelUk:'Мінімальний прибуток',              labelRu:'Минимальная прибыль',            descUk:'Попередження якщо нижче',                  descRu:'Предупреждение если ниже',                unit:'₴' },
    { key:'min_profitability',    labelUk:'Мінімальна рентабельність',         labelRu:'Минимальная рентабельность',     descUk:'Попередження якщо нижче',                  descRu:'Предупреждение если ниже',                unit:'%' },
    { key:'max_buy_price',        labelUk:'Максимальна сума викупу',           labelRu:'Максимальная сумма выкупа',      descUk:'Попередження якщо перевищено',             descRu:'Предупреждение если превышено',           unit:'₴' },
    { key:'min_buy_price',        labelUk:'Мінімальна сума викупу',            labelRu:'Минимальная сумма выкупа',       descUk:'Попередження якщо менше',                  descRu:'Предупреждение если меньше',              unit:'₴' },
    { key:'max_market_price',     labelUk:'Не оцінювати якщо ринкова вище',   labelRu:'Не оценивать если рыночная выше', descUk:'', descRu:'',                                                                                    unit:'₴' },
    { key:'min_market_price',     labelUk:'Не оцінювати якщо ринкова нижче',  labelRu:'Не оценивать если рыночная ниже', descUk:'', descRu:'',                                                                                    unit:'₴' },
  ]

  const enabledLabel = isUk ? 'Увімкнено' : 'Включено'
  const disabledLabel = isUk ? 'Вимкнено' : 'Отключено'
  const tradeInPctLabel = isUk ? '% від ринкової ціни' : '% от рыночной цены'
  const tradeInFixedLabel = isUk ? 'Фіксована сума' : 'Фиксированная сумма'
  const tradeInSizePctLabel = isUk ? 'Розмір надбавки (%)' : 'Размер надбавки (%)'
  const tradeInSizeFixedLabel = isUk ? 'Фіксована надбавка (₴)' : 'Фиксированная надбавка (₴)'
  const calcExLabel = isUk ? 'Приклад розрахунку' : 'Пример расчёта'
  const marketPriceLabel = isUk ? 'Ринкова ціна: 30 000 ₴' : 'Рыночная цена: 30 000 ₴'
  const buyPriceLabel = isUk ? 'Ціна викупу' : 'Цена выкупа'
  const tradeinLabel = isUk ? 'Трейд-Ін' : 'Трейд-Ин'
  const belowMarketLabel = isUk ? '% нижче ринку' : '% ниже рынка'
  const catRulesSubLabel = isUk ? 'Мають пріоритет над загальними правилами' : 'Имеют приоритет над общими правилами'
  const condImpactLabel = isUk ? 'Вплив стану на ціну' : 'Влияние состояния на цену'
  const complImpactLabel = isUk ? 'Вплив комплектності' : 'Влияние комплектации'
  const complSubLabel = isUk ? 'Вмикайте або вимикайте окремі пункти. Вимкнені — ігноруються при розрахунку.' : 'Включайте или отключайте отдельные пункты. Отключённые — игнорируются при расчёте.'
  const activeRulesLabel = isUk ? 'Активних правил' : 'Активных правил'
  const enabledCountLabel = isUk ? 'Увімкнено' : 'Включено'
  const ofLabel = isUk ? 'з' : 'из'
  const maxDiscountLabel = isUk ? 'Макс. знижка' : 'Макс. скидка'
  const maxBonusLabel = isUk ? 'Макс. бонус' : 'Макс. бонус'
  const saveLabel = isUk ? 'Зберегти всі правила' : 'Сохранить все правила'
  const savedLabel = isUk ? '✓ Збережено!' : '✓ Сохранено!'
  const rulesTitle = isUk ? 'Правила оцінки' : 'Правила оценки'
  const rulesSub = isUk ? 'Налаштування визначають ціни та попередження для менеджерів' : 'Настройки определяют цены и предупреждения для менеджеров'
  const generalRulesLabel = isUk ? 'Загальні правила' : 'Общие правила'
  const tradeinRulesLabel = isUk ? '🔄 Правила Трейд-Ін' : '🔄 Правила Трейд-Ин'
  const tradeinRulesSubLabel = isUk ? 'Клієнт отримує кращу ціну при обміні на новий пристрій' : 'Клиент получает лучшую цену при обмене на новое устройство'
  const tradeinTypeLabel = isUk ? 'Тип надбавки для клієнта' : 'Тип надбавки для клиента'
  const catRulesLabel = isUk ? 'Правила по категоріях' : 'Правила по категориям'
  const enabledToggleLabel = isUk ? 'Увімк.' : 'Вкл.'
  const disabledToggleLabel = isUk ? 'Вимк.' : 'Выкл.'

  return (
    <div style={{ padding:'28px 32px', maxWidth:900 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:-1, color:C.text }}>{rulesTitle}</h1>
        <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{rulesSub}</p>
      </div>

      {/* General rules */}
      <Card style={{ padding:24, marginBottom:16 }}>
        <SectionLabel>{generalRulesLabel}</SectionLabel>
        {sections.map(s => (
          <RuleRow key={s.key}
            label={isUk ? s.labelUk : s.labelRu}
            desc={isUk ? s.descUk : s.descRu}
            unit={s.unit}
            value={(rules as any)[s.key]}
            onChange={v => updateRule(s.key as any, v)}
          />
        ))}
      </Card>

      {/* Trade-In */}
      <Card style={{ padding:24, marginBottom:16, border:'1px solid rgba(99,130,255,0.2)', background:'linear-gradient(135deg,rgba(99,130,255,0.04),transparent)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <SectionLabel style={{ marginBottom:4 }}>{tradeinRulesLabel}</SectionLabel>
            <p style={{ fontSize:12, color:C.muted2 }}>{tradeinRulesSubLabel}</p>
          </div>
          <button onClick={() => setTradeInEnabled(!tradeInEnabled)} style={{
            display:'flex', alignItems:'center', gap:8, padding:'7px 14px', borderRadius:9,
            border:`1px solid ${tradeInEnabled ? 'rgba(52,217,138,0.3)' : C.border2}`,
            background: tradeInEnabled ? 'rgba(52,217,138,0.1)' : C.card2,
            color: tradeInEnabled ? C.success : C.muted,
            fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer',
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: tradeInEnabled ? C.success : C.muted2 }} />
            {tradeInEnabled ? enabledLabel : disabledLabel}
          </button>
        </div>

        <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:10 }}>{tradeinTypeLabel}</p>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {[
            { val:'percent', label: tradeInPctLabel, example:`+${tradeInPercent}%` },
            { val:'fixed',   label: tradeInFixedLabel, example:`+${tradeInFixed.toLocaleString('uk-UA')} ₴` },
          ].map(opt => (
            <button key={opt.val} onClick={() => setTradeInType(opt.val as any)} disabled={!tradeInEnabled} style={{
              flex:1, padding:'14px 16px', borderRadius:12,
              border:`1px solid ${tradeInType===opt.val ? 'rgba(99,130,255,0.35)' : C.border2}`,
              background: tradeInType===opt.val ? 'rgba(99,130,255,0.1)' : C.card2,
              fontFamily:'inherit', cursor: tradeInEnabled ? 'pointer' : 'default',
              opacity: tradeInEnabled ? 1 : 0.4, transition:'all 0.15s', textAlign:'left' as const,
            }}>
              <p style={{ fontSize:13, fontWeight:700, color: tradeInType===opt.val ? C.text : C.muted }}>{opt.label}</p>
              <p style={{ fontSize:18, fontWeight:800, color:C.success, marginTop:4 }}>{opt.example}</p>
            </button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:7 }}>
              {tradeInType === 'percent' ? tradeInSizePctLabel : tradeInSizeFixedLabel}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" style={{ ...fieldSt, width:120, textAlign:'left' as const }}
                disabled={!tradeInEnabled}
                value={tradeInType==='percent' ? tradeInPercent : tradeInFixed}
                onChange={e => tradeInType==='percent'
                  ? setTradeInPercent(parseFloat(e.target.value)||0)
                  : setTradeInFixed(parseFloat(e.target.value)||0)} />
              <span style={{ fontSize:14, color:C.muted, fontWeight:600 }}>{tradeInType==='percent' ? '%' : '₴'}</span>
            </div>
          </div>
          <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{calcExLabel}</p>
            <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{marketPriceLabel}</p>
            <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{buyPriceLabel}: {(30000*(1-20/100)).toLocaleString('uk-UA')} ₴</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.success }}>
              {tradeinLabel}: {tradeInType==='percent'
                ? (30000*(1-(20-tradeInPercent)/100)).toLocaleString('uk-UA')
                : (30000*0.8+tradeInFixed).toLocaleString('uk-UA')} ₴
            </p>
          </div>
        </div>
      </Card>

      {/* Category rules */}
      <Card style={{ padding:24, marginBottom:16 }}>
        <SectionLabel>{catRulesLabel}</SectionLabel>
        <p style={{ fontSize:12, color:C.muted2, marginBottom:16, marginTop:-8 }}>{catRulesSubLabel}</p>
        {catRules.map(cat => (
          <div key={cat.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <input type="checkbox" checked={cat.is_enabled} style={{ accentColor:C.accent }}
                onChange={e => setCatRules(r => r.map(c => c.id===cat.id ? { ...c, is_enabled:e.target.checked } : c))} />
              <span style={{ fontSize:13, fontWeight:600, color: cat.is_enabled ? C.text : C.muted }}>{cat.category}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" style={{ ...fieldSt, width:70 }} value={cat.buy_percent}
                onChange={e => setCatRules(r => r.map(c => c.id===cat.id ? { ...c, buy_percent:parseFloat(e.target.value)||0 } : c))}
                disabled={!cat.is_enabled} />
              <span style={{ fontSize:12, color:C.muted2 }}>{belowMarketLabel}</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Condition */}
      <Card style={{ padding:24, marginBottom:16 }}>
        <SectionLabel>{condImpactLabel}</SectionLabel>
        {condRows.map(r => (
          <div key={r.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{isUk ? r.labelUk : r.labelRu}</span>
            <span style={{ fontSize:13, fontWeight:800, color:r.color, minWidth:80, textAlign:'right' as const }}>{r.adj}</span>
          </div>
        ))}
      </Card>

      {/* Completeness */}
      <Card style={{ padding:24, marginBottom:28 }}>
        <SectionLabel>{complImpactLabel}</SectionLabel>
        <p style={{ fontSize:12, color:C.muted2, marginBottom:16, marginTop:-8 }}>{complSubLabel}</p>
        {complRows.map(r => (
          <div key={r.key} style={{ display:'flex', alignItems:'center', padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', opacity: r.enabled ? 1 : 0.4, transition:'opacity 0.2s' }}>
            <button onClick={() => setComplRows(rows => rows.map(x => x.key===r.key ? { ...x, enabled:!x.enabled } : x))} style={{
              width:38, height:22, borderRadius:99, border:'none', cursor:'pointer', position:'relative', flexShrink:0,
              background: r.enabled ? (r.isBonus ? 'rgba(52,217,138,0.8)' : 'rgba(99,130,255,0.8)') : C.border2,
              marginRight:14, transition:'background 0.2s',
            }}>
              <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: r.enabled ? 19 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
            <span style={{ fontSize:13, fontWeight:600, flex:1, color: r.enabled ? C.text : C.muted }}>{isUk ? r.labelUk : r.labelRu}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, color:C.muted2 }}>{r.isBonus ? '+' : '−'}</span>
              <input type="number" disabled={!r.enabled} value={r.value}
                onChange={e => setComplRows(rows => rows.map(x => x.key===r.key ? { ...x, value:parseInt(e.target.value)||0 } : x))}
                style={{ width:80, padding:'7px 10px', borderRadius:8, textAlign:'right' as const, fontSize:13, fontWeight:700, fontFamily:'inherit', color: r.enabled ? (r.isBonus ? C.success : C.danger) : C.muted2, background:C.card2, border:`1px solid ${C.border2}`, outline:'none' }} />
              <span style={{ fontSize:12, color:C.muted2, width:16 }}>₴</span>
            </div>
            <div style={{ marginLeft:12, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, width:60, textAlign:'center' as const,
              background: r.enabled ? (r.isBonus ? 'rgba(52,217,138,0.1)' : 'rgba(99,130,255,0.1)') : 'rgba(255,255,255,0.04)',
              color: r.enabled ? (r.isBonus ? C.success : C.accent) : C.muted2,
            }}>
              {r.enabled ? enabledToggleLabel : disabledToggleLabel}
            </div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:'rgba(0,0,0,0.2)', border:`1px solid ${C.border2}` }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:8 }}>{activeRulesLabel}</p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:C.muted }}>{enabledCountLabel}: <strong style={{ color:C.text }}>{complRows.filter(r=>r.enabled).length}</strong> {ofLabel} {complRows.length}</span>
            <span style={{ fontSize:12, color:C.muted }}>{maxDiscountLabel}: <strong style={{ color:C.danger }}>−{complRows.filter(r=>r.enabled&&!r.isBonus).reduce((s,r)=>s+r.value,0).toLocaleString('uk-UA')} ₴</strong></span>
            <span style={{ fontSize:12, color:C.muted }}>{maxBonusLabel}: <strong style={{ color:C.success }}>+{complRows.filter(r=>r.enabled&&r.isBonus).reduce((s,r)=>s+r.value,0).toLocaleString('uk-UA')} ₴</strong></span>
          </div>
        </div>
      </Card>

      <button onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2500) }} style={{
        display:'flex', alignItems:'center', gap:10, padding:'12px 28px', borderRadius:12,
        background: saved ? 'rgba(52,217,138,0.15)' : 'linear-gradient(135deg,#6382FF,#A78BFA)',
        border: saved ? '1px solid rgba(52,217,138,0.3)' : 'none',
        color: saved ? C.success : '#fff', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer',
        boxShadow: saved ? 'none' : '0 0 24px rgba(99,130,255,0.3)', transition:'all 0.3s',
      }}>
        {saved ? savedLabel : <><Save size={14}/> {saveLabel}</>}
      </button>
    </div>
  )
}
