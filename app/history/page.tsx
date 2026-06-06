'use client'
import { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { getAllEstimations, deleteEstimation } from '@/lib/store'
import { formatMoney, STATUS_LABELS, DEAL_STATUS_LABELS } from '@/lib/engine'
import { useLang } from '@/lib/i18n'
import { printInvoice } from '@/lib/print'
import type { Estimation } from '@/lib/types'

const C = { card:'#0E0E16', border:'#1E1E30', border2:'#282840', text:'#EDEDF0', muted:'#8080AA', muted2:'#4A4A70', accent:'#6382FF', success:'#34D98A', warning:'#FBBF24', danger:'#F87171' }
const fieldSt: React.CSSProperties = { padding:'9px 12px', borderRadius:9, fontSize:12.5, fontWeight:500, color:C.text, background:'#141422', border:`1px solid ${C.border2}`, fontFamily:'inherit', outline:'none' }
const th: React.CSSProperties = { textAlign:'left', fontSize:10, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.7px', paddingBottom:12, paddingLeft:10, paddingRight:10, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }
const td: React.CSSProperties = { padding:'12px 10px', borderBottom:'1px solid rgba(255,255,255,0.03)', fontSize:12.5, color:C.muted, whiteSpace:'nowrap', verticalAlign:'middle' }

export default function HistoryPage() {
  const { t } = useLang()
  const [data, setData] = useState<Estimation[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  useEffect(() => { setData(getAllEstimations()) }, [])

  const cats = [...new Set(data.map(e => e.category_name))]
  const filtered = data.filter(e => {
    const q = search.toLowerCase()
    const brand = (e as any).brand_name || ''
    const model = (e as any).model_name || ''
    return (!q || brand.toLowerCase().includes(q) || model.toLowerCase().includes(q) || e.category_name.toLowerCase().includes(q))
      && (!filterCat || e.category_name === filterCat)
      && (!filterStatus || e.status === filterStatus)
  })

  function exportCSV() {
    const rows = filtered.map(e => [new Date(e.created_at).toLocaleDateString('uk-UA'), e.category_name, (e as any).brand_name||'', (e as any).model_name||'', e.market_price, e.buy_price||'', e.profit||'', e.profitability?e.profitability+'%':'', STATUS_LABELS[e.status]||'', DEAL_STATUS_LABELS[e.deal_status]||''].join(','))
    const csv = [[t.col_date,t.col_cat,'Бренд','Модель',t.col_market,t.col_buy,t.col_profit,t.col_pct,t.col_status,'Угода'].join(','), ...rows].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'})); a.download='tradevalue-history.csv'; a.click()
  }

  return (
    <div className='page-wrap' style={{ padding:'28px 32px', maxWidth:1200 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:-1, color:C.text }}>Історія оцінок</h1>
          <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{filtered.length} записів</p>
        </div>
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, border:`1px solid ${C.border2}`, background:C.card, color:C.muted, fontFamily:'inherit', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <Download size={14}/> CSV
        </button>
      </div>
      <Card style={{ padding:18, marginBottom:14 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <Search size={13} color={C.muted2} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
            <input style={{ ...fieldSt, paddingLeft:32, width:'100%' }} placeholder="Пошук..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select style={fieldSt} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">Всі категорії</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={fieldSt} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Всі статуси</option>
            <option value="good">Варто купити</option>
            <option value="caution">Обережно</option>
            <option value="not_evaluated">Не оцінюється</option>
          </select>
        </div>
      </Card>
      <Card style={{ padding:24 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.muted2 }}>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Немає збережених оцінок</p>
            <p style={{ fontSize:13 }}>Зробіть оцінку та натисніть «Зберегти»</p>
          </div>
        ) : (
          <div className='table-wrap' style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {[t.col_date,t.col_cat,t.col_device,t.col_type,t.col_market,t.col_buy,t.col_profit,t.col_pct,t.col_status,''].map(h => <th key={h} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ ...td, color:C.muted2 }}>{new Date(e.created_at).toLocaleDateString('uk-UA')}</td>
                    <td style={td}>{e.category_name}</td>
                    <td style={{ ...td, fontWeight:700, color:C.text }}>{(e as any).brand_name||''} {(e as any).model_name||'—'}</td>
                    <td style={td}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6, background:e.eval_type==='tradein'?'rgba(52,217,138,0.1)':'rgba(99,130,255,0.1)', color:e.eval_type==='tradein'?C.success:C.accent }}>{e.eval_type==='tradein'?'Трейд-Ін':'Викуп'}</span></td>
                    <td style={td}>{formatMoney(e.market_price)}</td>
                    <td style={{ ...td, fontWeight:600, color:C.text }}>{e.buy_price>0?formatMoney(e.buy_price):'—'}</td>
                    <td style={{ ...td, fontWeight:700, color:e.profit>0?C.success:C.muted2 }}>{e.profit>0?formatMoney(e.profit):'—'}</td>
                    <td style={{ ...td, fontWeight:800, color:e.profitability>20?C.success:e.profitability>0?C.warning:C.muted2 }}>{e.profitability>0?`${e.profitability}%`:'—'}</td>
                    <td style={td}><span style={{ padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600, background:e.status==='good'?'rgba(52,217,138,0.1)':e.status==='caution'?'rgba(251,191,36,0.1)':'rgba(248,113,113,0.1)', color:e.status==='good'?C.success:e.status==='caution'?C.warning:C.danger }}>{STATUS_LABELS[e.status]}</span></td>
                    <td style={td}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>printInvoice(e as any,'Андрій Коваль','Techno Shop')} style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:11 }}>🖨</button>
                        <button onClick={()=>{ deleteEstimation(e.id); setData(getAllEstimations()) }} style={{ padding:'4px 10px', borderRadius:7, border:'1px solid rgba(248,113,113,0.2)', background:'transparent', color:C.danger, cursor:'pointer', fontSize:11 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
