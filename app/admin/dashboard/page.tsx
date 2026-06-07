'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Shield, LogOut, RefreshCw, Search, Download, Edit2, Check, X, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'wertuvenom@gmail.com'

const C = {
  bg: '#07070C', card: '#0E0E18', card2: '#141422', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6366F1', success: '#10B981', danger: '#EF4444', warning: '#F59E0B',
  text: '#F8FAFC', muted: '#94A3B8', muted2: '#475569',
}

const PLANS = ['starter','pro','business']
const PLAN_COLORS: Record<string,string> = { starter:C.muted, pro:C.accent, business:C.warning }
const PLAN_LABELS: Record<string,string> = { starter:'Starter', pro:'Pro 🚀', business:'Business 🏢' }

const th: React.CSSProperties = { padding:'12px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:`1px solid ${C.border}` }
const td: React.CSSProperties = { padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:13, color:C.muted, verticalAlign:'middle' }
const inp: React.CSSProperties = { padding:'7px 10px', borderRadius:7, background:C.card2, border:`1px solid ${C.border2}`, color:C.text, fontFamily:'inherit', fontSize:12, outline:'none', width:'100%' }

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'companies'|'users'>('overview')
  const [companies, setCompanies] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [estimations, setEstimations] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editingCompany, setEditingCompany] = useState<string|null>(null)
  const [editingUser, setEditingUser] = useState<string|null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const ok = sessionStorage.getItem('tv_admin_verified')
    if (!ok) { router.push('/admin'); return }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/admin'); return }
      setVerified(true)
      loadData()
    })
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: comps }, { data: usrs }, { data: ests }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('estimations').select('*').order('created_at', { ascending: false }),
    ])

    const enrichedComps = (comps||[]).map(c => ({
      ...c,
      user_count: (usrs||[]).filter(u => u.company_id === c.id).length,
      est_count: (ests||[]).filter(e => e.company_id === c.id).length,
    }))
    const enrichedUsers = (usrs||[]).map(u => ({
      ...u,
      company_name: (comps||[]).find(c => c.id === u.company_id)?.name || '—',
    }))

    setCompanies(enrichedComps)
    setUsers(enrichedUsers)
    setEstimations(ests||[])
    setLoading(false)
  }

  async function handleRefresh() { setRefreshing(true); await loadData(); setRefreshing(false) }

  async function handleLogout() {
    sessionStorage.removeItem('tv_admin_verified')
    await supabase.auth.signOut()
    router.push('/admin')
  }

  async function updateCompanyPlan(id: string, plan: string) {
    await supabase.from('companies').update({ plan }).eq('id', id)
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, plan } : c))
  }

  async function updateCompanyField(id: string, field: string, value: string) {
    await supabase.from('companies').update({ [field]: value }).eq('id', id)
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  async function updateUserField(id: string, field: string, value: string) {
    await supabase.from('users').update({ [field]: value }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  function downloadCompanyCSV(companyId: string, companyName: string) {
    const ests = estimations.filter(e => e.company_id === companyId)
    if (ests.length === 0) { alert('Немає оцінок для цієї компанії'); return }
    const rows = ests.map(e => [
      new Date(e.created_at).toLocaleDateString('uk-UA'),
      e.category_name, e.brand_name||'', e.model_name||'',
      e.market_price, e.buy_price, e.sell_price, e.profit,
      e.profitability+'%', e.status, e.eval_type, e.comment||''
    ].join(','))
    const csv = [['Дата','Категорія','Бренд','Модель','Ринкова','Викуп','Продаж','Прибуток','Рент.','Статус','Тип','Коментар'].join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv' }))
    a.download = `${companyName}-estimations.csv`
    a.click()
  }

  function downloadAllCSV() {
    if (estimations.length === 0) { alert('Немає даних'); return }
    const rows = estimations.map(e => {
      const comp = companies.find(c => c.id === e.company_id)
      return [
        new Date(e.created_at).toLocaleDateString('uk-UA'),
        comp?.name||'', e.category_name, e.brand_name||'', e.model_name||'',
        e.market_price, e.buy_price, e.profit, e.profitability+'%', e.status
      ].join(',')
    })
    const csv = [['Дата','Компанія','Категорія','Бренд','Модель','Ринкова','Викуп','Прибуток','Рент.','Статус'].join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv' }))
    a.download = 'all-estimations.csv'
    a.click()
  }

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    companies: companies.length,
    users: users.length,
    estimations: estimations.length,
    newToday: companies.filter(c => new Date(c.created_at) >= new Date(new Date().setHours(0,0,0,0))).length,
    byPlan: PLANS.reduce((acc, p) => ({ ...acc, [p]: companies.filter(c => c.plan === p).length }), {} as Record<string,number>),
  }

  if (!verified || loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:`3px solid rgba(99,102,241,0.2)`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:C.muted, fontSize:13 }}>Завантаження...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'0 28px' }}>
        <div style={{ maxWidth:1300, margin:'0 auto', display:'flex', alignItems:'center', height:60, gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:C.text }}>TradeValue Admin</p>
              <p style={{ fontSize:10, color:C.muted2 }}>{ADMIN_EMAIL}</p>
            </div>
          </div>
          <button onClick={downloadAllCSV} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, fontFamily:'inherit', fontSize:12, cursor:'pointer' }}>
            <Download size={13}/> Всі оцінки CSV
          </button>
          <button onClick={handleRefresh} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, fontFamily:'inherit', fontSize:12, cursor:'pointer' }}>
            <RefreshCw size={13} style={{ animation:refreshing?'spin .8s linear infinite':'none' }}/> Оновити
          </button>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)', background:'transparent', color:C.danger, fontFamily:'inherit', fontSize:12, cursor:'pointer' }}>
            <LogOut size={13}/> Вийти
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:'24px 28px' }}>
        {/* Tabs */}
        <div style={{ display:'flex', background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:3, gap:3, width:'fit-content', marginBottom:22 }}>
          {[
            { val:'overview', label:`📊 Огляд` },
            { val:'companies', label:`🏢 Компанії (${companies.length})` },
            { val:'users', label:`👥 Користувачі (${users.length})` },
          ].map(t => (
            <button key={t.val} onClick={() => setTab(t.val as any)} style={{ padding:'7px 18px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, background:tab===t.val?C.card2:'transparent', color:tab===t.val?C.text:C.muted, transition:'all 0.15s' }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Компаній', value:stats.companies, color:C.accent },
                { label:'Користувачів', value:stats.users, color:C.success },
                { label:'Оцінок всього', value:stats.estimations, color:C.warning },
                { label:'Нових сьогодні', value:stats.newToday, color:'#EC4899' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px' }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:8 }}>{label}</p>
                  <p style={{ fontSize:34, fontWeight:900, letterSpacing:-2, color }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:16 }}>По тарифах</p>
                {PLANS.map(plan => {
                  const count = stats.byPlan[plan]||0
                  const pct = stats.companies > 0 ? Math.round(count/stats.companies*100) : 0
                  return (
                    <div key={plan} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:PLAN_COLORS[plan] }}>{PLAN_LABELS[plan]}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height:5, background:C.border2, borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:PLAN_COLORS[plan], borderRadius:99 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted2, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:16 }}>Останні реєстрації</p>
                {companies.slice(0,6).map(c => (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</p>
                      <p style={{ fontSize:11, color:C.muted2 }}>{new Date(c.created_at).toLocaleDateString('uk-UA')} · {c.est_count} оцінок</p>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ padding:'2px 9px', borderRadius:6, fontSize:11, fontWeight:700, background:`${PLAN_COLORS[c.plan]}15`, color:PLAN_COLORS[c.plan] }}>{PLAN_LABELS[c.plan]}</span>
                      <button onClick={() => downloadCompanyCSV(c.id, c.name)} title="Скачати оцінки" style={{ background:'none', border:`1px solid ${C.border2}`, borderRadius:6, cursor:'pointer', color:C.muted, padding:'3px 7px', fontSize:12 }}>↓</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Companies */}
        {tab === 'companies' && (
          <div>
            <div style={{ position:'relative', marginBottom:14 }}>
              <Search size={13} color={C.muted2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
              <input placeholder="Пошук компаній..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ ...inp, paddingLeft:34, fontSize:13 }} />
            </div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  {['Компанія','Місто','Юзери','Оцінок','Тариф','Змінити тариф','Дії'].map(h=><th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredCompanies.map(c => (
                    <tr key={c.id}>
                      <td style={td}>
                        {editingCompany === c.id ? (
                          <div style={{ display:'flex', gap:6 }}>
                            <input defaultValue={c.name} id={`cname-${c.id}`} style={{ ...inp, width:160 }} />
                            <button onClick={async () => { const el = document.getElementById(`cname-${c.id}`) as HTMLInputElement; await updateCompanyField(c.id,'name',el.value); setEditingCompany(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:C.success }}><Check size={14}/></button>
                            <button onClick={() => setEditingCompany(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.danger }}><X size={14}/></button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</p>
                            <button onClick={() => setEditingCompany(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted2 }}><Edit2 size={11}/></button>
                          </div>
                        )}
                        <p style={{ fontSize:10, color:C.muted2 }}>{new Date(c.created_at).toLocaleDateString('uk-UA')}</p>
                      </td>
                      <td style={td}>{c.city||'—'}</td>
                      <td style={{ ...td, fontWeight:600, color:C.text }}>{c.user_count}</td>
                      <td style={{ ...td, fontWeight:600, color:C.text }}>{c.est_count}</td>
                      <td style={td}>
                        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:`${PLAN_COLORS[c.plan]}15`, color:PLAN_COLORS[c.plan] }}>{PLAN_LABELS[c.plan]}</span>
                      </td>
                      <td style={td}>
                        <div style={{ display:'flex', gap:5 }}>
                          {PLANS.filter(p=>p!==c.plan).map(plan=>(
                            <button key={plan} onClick={() => updateCompanyPlan(c.id,plan)} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${PLAN_COLORS[plan]}40`, background:`${PLAN_COLORS[plan]}10`, color:PLAN_COLORS[plan], fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                              {plan}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={td}>
                        <button onClick={() => downloadCompanyCSV(c.id, c.name)} title="Скачати оцінки CSV" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                          <Download size={11}/> CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && <div style={{ padding:40, textAlign:'center', color:C.muted2 }}>Нічого не знайдено</div>}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div style={{ position:'relative', marginBottom:14 }}>
              <Search size={13} color={C.muted2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
              <input placeholder="Пошук користувачів..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ ...inp, paddingLeft:34, fontSize:13 }} />
            </div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  {["Ім'я",'Email','Роль','Компанія','Дата','Дії'].map(h=><th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={td}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                            {(u.name||'?').split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)}
                          </div>
                          {editingUser === u.id ? (
                            <div style={{ display:'flex', gap:6 }}>
                              <input defaultValue={u.name} id={`uname-${u.id}`} style={{ ...inp, width:140 }} />
                              <button onClick={async () => { const el = document.getElementById(`uname-${u.id}`) as HTMLInputElement; await updateUserField(u.id,'name',el.value); setEditingUser(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:C.success }}><Check size={14}/></button>
                              <button onClick={() => setEditingUser(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.danger }}><X size={14}/></button>
                            </div>
                          ) : (
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{u.name}</p>
                              <button onClick={() => setEditingUser(u.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted2 }}><Edit2 size={11}/></button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...td, fontSize:12 }}>{u.email}</td>
                      <td style={td}>
                        <select value={u.role} onChange={async e => { await updateUserField(u.id,'role',e.target.value) }}
                          style={{ ...inp, width:'auto', fontSize:11, padding:'4px 8px', color: u.role==='owner'?C.warning:u.role==='admin'?C.accent:C.muted }}>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td style={{ ...td, fontSize:12 }}>{u.company_name}</td>
                      <td style={{ ...td, fontSize:11, color:C.muted2 }}>{new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
                      <td style={td}>
                        <button onClick={() => downloadCompanyCSV(u.company_id, u.company_name)} title="Скачати оцінки компанії" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                          <Download size={11}/> CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div style={{ padding:40, textAlign:'center', color:C.muted2 }}>Нічого не знайдено</div>}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
