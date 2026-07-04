'use client'
import { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import { Card } from '@/components/ui'
import { createClient } from '@/lib/supabase'
import { getAllEstimations, deleteEstimation } from '@/lib/store'
import { formatMoney, STATUS_LABELS, DEAL_STATUS_LABELS } from '@/lib/engine'
import { printInvoice } from '@/lib/print'
import { useLang } from '@/lib/i18n'

const C = { card:'#0E0E16', border:'#1E1E30', border2:'#282840', text:'#EDEDF0', muted:'#8080AA', muted2:'#4A4A70', accent:'#6382FF', success:'#34D98A', warning:'#FBBF24', danger:'#F87171' }
const fieldSt: React.CSSProperties = { padding:'9px 12px', borderRadius:9, fontSize:12.5, fontWeight:500, color:C.text, background:'#141422', border:`1px solid ${C.border2}`, fontFamily:'inherit', outline:'none' }
const th: React.CSSProperties = { textAlign:'left', fontSize:10, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', paddingBottom:12, paddingLeft:10, paddingRight:10, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' as const }
const td: React.CSSProperties = { padding:'12px 10px', borderBottom:'1px solid rgba(255,255,255,0.03)', fontSize:12.5, color:C.muted, whiteSpace:'nowrap' as const, verticalAlign:'middle' }

export default function HistoryPage() {
  const { t, lang } = useLang()
  const isUk = lang === 'uk'
  const [data, setData] = useState<any[]>([])
  const [aiModal, setAiModal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Load from Supabase
      const { data: userRecord } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle()
      if (userRecord?.company_id) {
        const { data: estimations } = await supabase
          .from('estimations')
          .select('*')
          .eq('company_id', userRecord.company_id)
          .order('created_at', { ascending: false })
        if (estimations) { setData(estimations); localStorage.removeItem('tv_estimations'); setLoading(false); return }
      }
    }

    // Fallback to localStorage
    setData(getAllEstimations())
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('estimations').delete().eq('id', id)
    deleteEstimation(id)
    setData(prev => prev.filter(e => e.id !== id))
  }

  const cats = [...new Set(data.map(e => e.category_name))]
  const filtered = data.filter(e => {
    const q = search.toLowerCase()
    return (!q || (e.brand_name||'').toLowerCase().includes(q) || (e.model_name||'').toLowerCase().includes(q) || e.category_name.toLowerCase().includes(q))
      && (!filterCat || e.category_name === filterCat)
      && (!filterStatus || e.status === filterStatus)
  })

  function exportCSV() {
    const rows = filtered.map(e => [
      new Date(e.created_at).toLocaleDateString('uk-UA'), e.category_name,
      e.brand_name||'', e.model_name||'', e.market_price,
      e.buy_price||'', e.profit||'', e.profitability?e.profitability+'%':'',
      STATUS_LABELS[e.status]||'',
    ].join(','))
    const csv = [['Дата','Категорія','Бренд','Модель','Ринкова','Викуп','Прибуток','Рент.','Статус'].join(','), ...rows].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'})); a.download='tradevalue-history.csv'; a.click()
  }

  return (
    <>
    <div style={{ padding:'28px 32px', maxWidth:1200 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-1, color:C.text }}>{t.history_title}</h1>
          <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{filtered.length} {t.records}</p>
        </div>
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, border:`1px solid ${C.border2}`, background:C.card, color:C.muted, fontFamily:'inherit', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <Download size={14}/> {t.export_csv}
        </button>
      </div>

      <Card style={{ padding:16, marginBottom:14 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <Search size={13} color={C.muted2} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
            <input style={{ ...fieldSt, paddingLeft:32, width:'100%' }} placeholder={t.search_ph} value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select style={fieldSt} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">{t.all_cats}</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={fieldSt} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">{t.all_statuses}</option>
            <option value="good">{isUk?'Варто купити':'Стоит купить'}</option>
            <option value="caution">{isUk?'Обережно':'Осторожно'}</option>
            <option value="not_evaluated">{isUk?'Не оцінюється':'Не оценивается'}</option>
          </select>
        </div>
      </Card>

      <Card style={{ padding:24 }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted2 }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(99,130,255,0.2)', borderTopColor:C.accent, borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }} />
            <p>{isUk?'Завантаження...':'Загрузка...'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.muted2 }}>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>{t.no_saved}</p>
            <p style={{ fontSize:13 }}>{t.no_saved_sub}</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {[t.col_date,t.col_cat,t.col_device,t.col_type,t.col_market,t.col_buy,t.col_profit,t.col_pct,t.col_status,''].map(h => <th key={h} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ ...td, color:C.muted2 }}>{new Date(e.created_at).toLocaleDateString('uk-UA')}</td>
                    <td style={td}>{e.category_name}</td>
                    <td style={{ ...td, fontWeight:700, color:C.text }}>{e.brand_name||''} {e.model_name||'—'}</td>
                    <td style={td}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6, background:e.eval_type==='tradein'?'rgba(52,217,138,0.1)':'rgba(99,130,255,0.1)', color:e.eval_type==='tradein'?C.success:C.accent }}>{e.eval_type==='tradein'?(isUk?'Трейд-Ін':'Трейд-Ин'):(isUk?'Викуп':'Выкуп')}</span></td>
                    <td style={td}>{formatMoney(e.market_price)}</td>
                    <td style={{ ...td, fontWeight:600, color:C.text }}>{e.buy_price>0?formatMoney(e.buy_price):'—'}</td>
                    <td style={{ ...td, fontWeight:700, color:e.profit>0?C.success:C.muted2 }}>{e.profit>0?formatMoney(e.profit):'—'}</td>
                    <td style={{ ...td, fontWeight:800, color:e.profitability>20?C.success:e.profitability>0?C.warning:C.muted2 }}>{e.profitability>0?`${e.profitability}%`:'—'}</td>
                    <td style={td}><span style={{ padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600, background:e.status==='good'?'rgba(52,217,138,0.1)':e.status==='caution'?'rgba(251,191,36,0.1)':'rgba(248,113,113,0.1)', color:e.status==='good'?C.success:e.status==='caution'?C.warning:C.danger }}>{STATUS_LABELS[e.status]}</span></td>
                    <td style={td}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>printInvoice(e as any,'','Techno Shop')} style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:11 }}>🖨</button>
                        {e.ai_analysis && (
                          <button onClick={()=>setAiModal(e.ai_analysis)} style={{ padding:'4px 10px', borderRadius:7, border:'1px solid rgba(99,130,255,0.3)', background:'rgba(99,130,255,0.08)', color:'#6382FF', cursor:'pointer', fontSize:11, fontWeight:700 }}>✨ AI</button>
                        )}
                        <button onClick={()=>handleDelete(e.id)} style={{ padding:'4px 10px', borderRadius:7, border:'1px solid rgba(248,113,113,0.2)', background:'transparent', color:C.danger, cursor:'pointer', fontSize:11 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>

      {/* AI Analysis Modal */}
      {aiModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={()=>setAiModal(null)}>
          <div style={{ background:'#0E0E16', border:'1px solid #1E1E30', borderRadius:20, padding:28, maxWidth:520, width:'100%', maxHeight:'85vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>✨</span>
                <span style={{ fontSize:15, fontWeight:800, color:'#EDEDF0' }}>AI Аналіз</span>
                {aiModal.device && <span style={{ fontSize:12, color:'#8080AA' }}>— {aiModal.device}</span>}
              </div>
              <button onClick={()=>setAiModal(null)} style={{ background:'none', border:'none', color:'#4A4A70', fontSize:22, cursor:'pointer' }}>×</button>
            </div>

            {aiModal.recommendation && (() => {
              const rec = aiModal.recommendation
              const recColor = rec==='buy'?'#34D98A':rec==='caution'?'#FBBF24':'#F87171'
              const recBg = rec==='buy'?'rgba(52,217,138,0.08)':rec==='caution'?'rgba(251,191,36,0.08)':'rgba(248,113,113,0.08)'
              const recBorder = rec==='buy'?'rgba(52,217,138,0.25)':rec==='caution'?'rgba(251,191,36,0.25)':'rgba(248,113,113,0.25)'
              const recIcon = rec==='buy'?'✅':rec==='caution'?'⚠️':'❌'
              return (
                <div style={{ background:recBg, border:`1px solid ${recBorder}`, borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:900, color:recColor, marginBottom:4 }}>{recIcon} {aiModal.recommendation_text}</p>
                  {aiModal.margin_estimate && <p style={{ fontSize:12, color:'#8080AA' }}>📈 {aiModal.margin_estimate}</p>}
                </div>
              )
            })()}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
              {[
                { label:'🆕 Новий', value:aiModal.new_price, color:'#6382FF' },
                { label:'♻️ Вживаний', value:aiModal.used_price, color:'#34D98A' },
                { label:'💰 Перепродаж', value:aiModal.avg_resale_price, color:'#FBBF24' },
              ].map(({label,value,color})=>(
                <div key={label} style={{ background:'#141422', borderRadius:10, padding:'12px 8px', textAlign:'center' as const }}>
                  <p style={{ fontSize:10, color:'#4A4A70', marginBottom:4 }}>{label}</p>
                  {value ? <p style={{ fontSize:15, fontWeight:900, color }}>{(value/1000).toFixed(1)}к ₴</p> : <p style={{ fontSize:12, color:'#4A4A70' }}>—</p>}
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column' as const, gap:8 }}>
              {[
                aiModal.popularity&&{ icon:'🔥', label:'Популярність', value:`${aiModal.popularity}${aiModal.popularity_reason?` — ${aiModal.popularity_reason}`:''}` },
                aiModal.days_to_sell&&{ icon:'⏱️', label:'Термін продажу', value:aiModal.days_to_sell },
                aiModal.price_range_used&&{ icon:'📊', label:'Діапазон вживаних', value:aiModal.price_range_used },
                aiModal.market_trend&&{ icon:'📉', label:'Тренд', value:aiModal.market_trend },
                aiModal.risks&&{ icon:'⚠️', label:'Що перевірити', value:aiModal.risks },
                aiModal.tip&&{ icon:'💡', label:'Порада', value:aiModal.tip },
              ].filter(Boolean).map((row:any,i:number)=>(
                <div key={i} style={{ display:'flex', gap:10, fontSize:12, lineHeight:1.6 }}>
                  <span>{row.icon}</span>
                  <span style={{ color:'#4A4A70', minWidth:110, flexShrink:0 }}>{row.label}:</span>
                  <span style={{ color:'#EDEDF0' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {((aiModal.sources_new?.length>0)||(aiModal.sources_used?.length>0)) && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #1E1E30', fontSize:11, color:'#4A4A70', lineHeight:1.7 }}>
                {[...(aiModal.sources_new||[]),...(aiModal.sources_used||[])].map((s:string,i:number)=>(
                  <p key={i}>🔗 {s}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
