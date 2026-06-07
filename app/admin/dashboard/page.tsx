'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Users, Building2, BarChart2, TrendingUp,
  Shield, LogOut, RefreshCw, Crown, Zap,
  CheckCircle, Search, ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'wertuvenom@gmail.com'

const C = {
  bg: '#07070C', card: '#0E0E18', card2: '#141422', border: '#1E1E32', border2: '#2A2A44',
  accent: '#6366F1', success: '#10B981', danger: '#EF4444', warning: '#F59E0B',
  text: '#F8FAFC', muted: '#94A3B8', muted2: '#475569',
}

const PLANS = ['starter', 'pro', 'business']
const PLAN_COLORS: Record<string, string> = {
  starter: C.muted, pro: C.accent, business: C.warning,
}
const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter', pro: 'Pro 🚀', business: 'Business 🏢',
}

interface Company {
  id: string
  name: string
  business_type: string
  city: string
  plan: string
  created_at: string
  estimations_this_month: number
  user_count?: number
  total_estimations?: number
}

interface User {
  id: string
  email: string
  name: string
  role: string
  company_id: string
  created_at: string
  company_name?: string
}

interface Stats {
  total_companies: number
  total_users: number
  total_estimations: number
  new_today: number
  new_week: number
  new_month: number
  by_plan: Record<string, number>
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users'>('overview')
  const [search, setSearch] = useState('')
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Check admin session
    const adminVerified = sessionStorage.getItem('tv_admin_verified')
    if (!adminVerified) { router.push('/admin'); return }

    // Check current user is admin
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        sessionStorage.removeItem('tv_admin_verified')
        router.push('/admin')
        return
      }
      setVerified(true)
      loadData()
    })
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Load companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      // Load users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      // Load estimations count
      const { data: estData } = await supabase
        .from('estimations')
        .select('id, company_id, created_at')

      const now = new Date()
      const today = new Date(now.setHours(0,0,0,0))
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // Enrich companies with user counts and estimation counts
      const enriched = (companiesData || []).map(c => ({
        ...c,
        user_count: (usersData || []).filter(u => u.company_id === c.id).length,
        total_estimations: (estData || []).filter(e => e.company_id === c.id).length,
      }))

      // Enrich users with company names
      const enrichedUsers = (usersData || []).map(u => ({
        ...u,
        company_name: (companiesData || []).find(c => c.id === u.company_id)?.name || '—',
      }))

      // Stats
      const byPlan: Record<string, number> = {}
      ;(companiesData || []).forEach(c => {
        byPlan[c.plan] = (byPlan[c.plan] || 0) + 1
      })

      setCompanies(enriched)
      setUsers(enrichedUsers)
      setStats({
        total_companies: (companiesData || []).length,
        total_users: (usersData || []).length,
        total_estimations: (estData || []).length,
        new_today: (companiesData || []).filter(c => new Date(c.created_at) >= today).length,
        new_week: (companiesData || []).filter(c => new Date(c.created_at) >= weekAgo).length,
        new_month: (companiesData || []).filter(c => new Date(c.created_at) >= monthAgo).length,
        by_plan: byPlan,
      })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function changePlan(companyId: string, newPlan: string) {
    setUpdatingPlan(companyId)
    const { error } = await supabase
      .from('companies')
      .update({ plan: newPlan })
      .eq('id', companyId)

    if (!error) {
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, plan: newPlan } : c))
    }
    setUpdatingPlan(null)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  async function handleLogout() {
    sessionStorage.removeItem('tv_admin_verified')
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (!verified || loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: C.muted, fontSize: 14 }}>Завантаження...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>

      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text }}>TradeValue Admin</p>
              <p style={{ fontSize: 11, color: C.muted2 }}>{ADMIN_EMAIL}</p>
            </div>
          </div>

          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin .8s linear infinite' : 'none' }} />
            Оновити
          </button>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: C.danger, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>
            <LogOut size={13} /> Вийти
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, gap: 4, width: 'fit-content', marginBottom: 28 }}>
          {[
            { val: 'overview', label: '📊 Огляд', icon: BarChart2 },
            { val: 'companies', label: `🏢 Компанії (${companies.length})`, icon: Building2 },
            { val: 'users', label: `👥 Користувачі (${users.length})`, icon: Users },
          ].map(tab => (
            <button key={tab.val} onClick={() => setActiveTab(tab.val as any)} style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              background: activeTab === tab.val ? C.card2 : 'transparent',
              color: activeTab === tab.val ? C.text : C.muted,
              transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }} className="tv-stats-grid">
              {[
                { label: 'Компаній', value: stats.total_companies, icon: <Building2 size={20} color={C.accent} />, color: C.accent },
                { label: 'Користувачів', value: stats.total_users, icon: <Users size={20} color={C.success} />, color: C.success },
                { label: 'Оцінок всього', value: stats.total_estimations, icon: <BarChart2 size={20} color={C.warning} />, color: C.warning },
                { label: 'Нових за місяць', value: stats.new_month, icon: <TrendingUp size={20} color="#EC4899" />, color: '#EC4899' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</p>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                  </div>
                  <p style={{ fontSize: 36, fontWeight: 900, letterSpacing: -2, color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Registration dynamics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="tv-grid-2">
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 18 }}>Реєстрації</p>
                {[
                  { label: 'Сьогодні', value: stats.new_today, color: C.success },
                  { label: 'За тиждень', value: stats.new_week, color: C.accent },
                  { label: 'За місяць', value: stats.new_month, color: C.warning },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 14, color: C.muted }}>{label}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 18 }}>По тарифах</p>
                {PLANS.map(plan => {
                  const count = stats.by_plan[plan] || 0
                  const total = stats.total_companies || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={plan} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: PLAN_COLORS[plan] }}>{PLAN_LABELS[plan]}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: PLAN_COLORS[plan], borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent companies */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 18 }}>Останні реєстрації</p>
              {companies.slice(0, 8).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: C.muted2 }}>{c.city || '—'} · {new Date(c.created_at).toLocaleDateString('uk-UA')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: C.muted2 }}>{c.total_estimations} оцінок</span>
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${PLAN_COLORS[c.plan]}15`, color: PLAN_COLORS[c.plan] }}>{PLAN_LABELS[c.plan]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPANIES ─────────────────────────────────────────────────────── */}
        {activeTab === 'companies' && (
          <div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} color={C.muted2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Пошук по назві або місту..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 11, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Компанія', 'Місто', 'Тип', 'Дата', 'Юзери', 'Оцінок', 'Тариф', 'Змінити тариф'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: C.muted2 }}>{c.id.slice(0, 8)}...</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{c.city || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{c.business_type || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{new Date(c.created_at).toLocaleDateString('uk-UA')}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: C.text }}>{c.user_count}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: C.text }}>{c.total_estimations}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: `${PLAN_COLORS[c.plan]}15`, color: PLAN_COLORS[c.plan] }}>
                          {PLAN_LABELS[c.plan]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {PLANS.filter(p => p !== c.plan).map(plan => (
                            <button key={plan}
                              onClick={() => changePlan(c.id, plan)}
                              disabled={updatingPlan === c.id}
                              style={{
                                padding: '5px 10px', borderRadius: 7, border: `1px solid ${PLAN_COLORS[plan]}40`,
                                background: `${PLAN_COLORS[plan]}10`, color: PLAN_COLORS[plan],
                                fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                opacity: updatingPlan === c.id ? 0.5 : 1,
                              }}>
                              {updatingPlan === c.id ? '...' : plan}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: C.muted2 }}>Нічого не знайдено</div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ─────────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} color={C.muted2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Пошук по імені або email..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 11, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Ім'я", 'Email', 'Роль', 'Компанія', 'Дата реєстрації'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                            {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{u.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: u.role === 'owner' ? 'rgba(245,158,11,0.1)' : u.role === 'admin' ? 'rgba(99,102,241,0.1)' : 'rgba(148,163,184,0.1)',
                          color: u.role === 'owner' ? C.warning : u.role === 'admin' ? C.accent : C.muted,
                        }}>
                          {u.role === 'owner' ? '👑 Owner' : u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : 'Viewer'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{u.company_name}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: C.muted2 }}>Нічого не знайдено</div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
