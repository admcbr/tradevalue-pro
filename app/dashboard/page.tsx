'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Package, Percent, XCircle } from 'lucide-react'
import { Card, SectionLabel, StatCard } from '@/components/ui'
import { getAllEstimations } from '@/lib/store'
import { createClient } from '@/lib/supabase'
import { formatMoney, STATUS_LABELS } from '@/lib/engine'
import { useLang } from '@/lib/i18n'
import type { Estimation } from '@/lib/types'

const C = { text:'#EDEDF0', muted:'#8080AA', muted2:'#4A4A70', accent:'#6382FF', success:'#34D98A', danger:'#F87171', warning:'#FBBF24', card:'#0E0E16', border:'#1E1E30' }

export default function DashboardPage() {
  const { t } = useLang()
  const [estimations, setEstimations] = useState<Estimation[]>([])
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userRecord } = await supabase.from('users').select('company_id, name').eq('id', user.id).maybeSingle()
        if (userRecord?.company_id) {
          const { data: est } = await supabase
            .from('estimations').select('*')
            .eq('company_id', userRecord.company_id)
            .order('created_at', { ascending: false })
          if (est) { setEstimations(est as any); localStorage.removeItem('tv_estimations'); return }
        }
      }
      setEstimations(getAllEstimations())
    }
    load()
  }, [])

  const valid = estimations.filter(e => e.status !== 'not_evaluated')
  const rejected = estimations.filter(e => e.status === 'not_evaluated')
  const totalProfit = valid.reduce((s, e) => s + e.profit, 0)
  const avgPct = valid.length > 0 ? Math.round(valid.reduce((s,e) => s + e.profitability, 0) / valid.length) : 0

  const byCat: Record<string,number> = {}
  estimations.forEach(e => { byCat[e.category_name] = (byCat[e.category_name]||0)+1 })
  const sortedCats = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,6)
  const maxCat = Math.max(1, ...sortedCats.map(([,v])=>v))

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:C.success, boxShadow:`0 0 8px ${C.success}` }} />
          <p style={{ fontSize:10, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'1px' }}>Techno Shop</p>
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-1, color:C.text }}>{t.dashboard_title}</h1>
      </div>

      <div className="tv-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        <StatCard label={t.total_estimates} value={String(estimations.length)} icon={<Package size={18}/>} />
        <StatCard label={t.potential_profit} value={formatMoney(totalProfit)} valueColor={C.success} icon={<TrendingUp size={18}/>} />
        <StatCard label={t.avg_profitability} value={`${avgPct}%`} valueColor={C.accent} icon={<Percent size={18}/>} />
        <StatCard label={t.rejections} value={String(rejected.length)} valueColor={C.danger} icon={<XCircle size={18}/>} />
      </div>

      <div className="tv-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Card style={{ padding:22 }}>
          <SectionLabel>{t.by_categories}</SectionLabel>
          {sortedCats.length === 0 ? (
            <p style={{ fontSize:13, color:C.muted2 }}>—</p>
          ) : sortedCats.map(([cat,count]) => (
            <div key={cat} style={{ marginBottom:11 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.muted }}>{cat}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{count}</span>
              </div>
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:99, height:5, overflow:'hidden' }}>
                <div style={{ background:'linear-gradient(90deg,#6382FF,#A78BFA)', height:'100%', borderRadius:99, width:`${(count/maxCat)*100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:22 }}>
          <SectionLabel>{t.latest_estimates}</SectionLabel>
          {estimations.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:C.muted2 }}>
              <p style={{ fontSize:14 }}>{t.no_estimates_yet}</p>
              <p style={{ fontSize:12, marginTop:4 }}>{t.make_first_estimate}</p>
            </div>
          ) : estimations.slice(0,6).map(e => (
            <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ minWidth:0, flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{(e as any).brand_name||''} {(e as any).model_name||e.category_name}</p>
                <p style={{ fontSize:11, color:C.muted2 }}>{new Date(e.created_at).toLocaleDateString('uk-UA')}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                <p style={{ fontSize:13, fontWeight:700, color:e.status==='not_evaluated'?C.danger:C.success }}>
                  {e.status==='not_evaluated'?STATUS_LABELS[e.status]:formatMoney(e.buy_price)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
