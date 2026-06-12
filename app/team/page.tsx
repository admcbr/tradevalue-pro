'use client'
import { createClient } from '@/lib/supabase'

import { useState, useEffect } from 'react'
import {
  UserPlus, Trash2, Crown, User, Shield, Eye,
  Settings, ChevronDown, ChevronUp, MapPin,
  TrendingUp, ShoppingBag, DollarSign, BarChart2, X, Check
} from 'lucide-react'
import { Card, SectionLabel, Badge } from '@/components/ui'
import { getAllEstimations } from '@/lib/store'
import { useLang } from '@/lib/i18n'
import { formatMoney } from '@/lib/engine'
import type { Estimation } from '@/lib/types'

const C = {
  bg: '#09090E', card: '#0E0E16', card2: '#141422', card3: '#1A1A2E',
  border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

const f: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14,
  fontWeight: 500, color: C.text, fontFamily: 'inherit',
  background: C.card2, border: `1px solid ${C.border2}`, outline: 'none',
}
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: C.muted2,
  textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7, display: 'block',
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'owner' | 'admin' | 'manager' | 'viewer'

interface Permissions {
  see_dashboard: boolean
  see_history_own: boolean
  see_history_all: boolean
  see_statistics: boolean
  see_team: boolean
  can_edit_rules: boolean
  can_manage_categories: boolean
}

interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: Role
  initials: string
  gradient: string
  permissions: Permissions
}

const DEFAULT_PERMS: Record<Role, Permissions> = {
  owner:   { see_dashboard: true,  see_history_own: true,  see_history_all: true,  see_statistics: true,  see_team: true,  can_edit_rules: true,  can_manage_categories: true  },
  admin:   { see_dashboard: true,  see_history_own: true,  see_history_all: true,  see_statistics: true,  see_team: true,  can_edit_rules: true,  can_manage_categories: true  },
  manager: { see_dashboard: true,  see_history_own: true,  see_history_all: false, see_statistics: false, see_team: false, can_edit_rules: false, can_manage_categories: false },
  viewer:  { see_dashboard: false, see_history_own: true,  see_history_all: false, see_statistics: false, see_team: false, can_edit_rules: false, can_manage_categories: false },
}

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner', admin: 'Admin', manager: 'Manager', viewer: 'Viewer',
}
const ROLE_COLORS: Record<Role, { bg: string; color: string; border: string }> = {
  owner:   { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24', border: 'rgba(251,191,36,0.25)'  },
  admin:   { bg: 'rgba(99,130,255,0.1)',  color: '#6382FF', border: 'rgba(99,130,255,0.25)'  },
  manager: { bg: 'rgba(161,161,170,0.1)', color: '#A1A1AA', border: 'rgba(161,161,170,0.2)'  },
  viewer:  { bg: 'rgba(52,217,138,0.1)',  color: '#34D98A', border: 'rgba(52,217,138,0.2)'   },
}

const GRADIENTS = [
  'linear-gradient(135deg,#6382FF,#A78BFA)',
  'linear-gradient(135deg,#34D98A,#0EA85A)',
  'linear-gradient(135deg,#F5A623,#E8832A)',
  'linear-gradient(135deg,#F87171,#DC2626)',
  'linear-gradient(135deg,#38BDF8,#0284C7)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
]

const PERM_LABELS_DATA = [
  { key: 'see_dashboard' as keyof Permissions,        labelUk: 'Дашборд',                    labelRu: 'Дашборд',                    descUk: 'Бачить загальну статистику',            descRu: 'Видит общую статистику' },
  { key: 'see_history_own' as keyof Permissions,      labelUk: 'Свої оцінки в історії',      labelRu: 'Свои оценки в истории',      descUk: 'Бачить власні оцінки',                  descRu: 'Видит собственные оценки' },
  { key: 'see_history_all' as keyof Permissions,      labelUk: 'Всі оцінки в історії',       labelRu: 'Все оценки в истории',       descUk: 'Бачить оцінки всіх менеджерів',         descRu: 'Видит оценки всех менеджеров' },
  { key: 'see_statistics' as keyof Permissions,       labelUk: 'Статистика команди',         labelRu: 'Статистика команды',         descUk: 'Бачить звіти по всіх працівниках',      descRu: 'Видит отчёты по всем сотрудникам' },
  { key: 'see_team' as keyof Permissions,             labelUk: 'Розділ «Команда»',           labelRu: 'Раздел «Команда»',           descUk: 'Має доступ до керування командою',      descRu: 'Имеет доступ к управлению командой' },
  { key: 'can_edit_rules' as keyof Permissions,       labelUk: 'Редагування правил',         labelRu: 'Редактирование правил',      descUk: 'Може змінювати правила оцінки',         descRu: 'Может изменять правила оценки' },
  { key: 'can_manage_categories' as keyof Permissions,labelUk: 'Керування категоріями',      labelRu: 'Управление категориями',     descUk: 'Може додавати/редагувати категорії',    descRu: 'Может добавлять/редактировать категории' },
]

const INITIAL_TEAM: Member[] = []

// ─── Component ────────────────────────────────────────────────────────────────
async function getAuthToken(): Promise<string> {
  const { createClient } = await import('@/lib/supabase')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

export default function TeamPage() {
  const { t, lang } = useLang()
  const isUk = lang === 'uk'
  const [team, setTeam] = useState<Member[]>(INITIAL_TEAM)
  const [companyId, setCompanyId] = useState<string>('')
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('users').select('company_id').eq('id', user.id).single()
        if (data?.company_id) setCompanyId(data.company_id)
      }
    })
  }, [])

  async function handleInvite() {
    if (!iEmail || !companyId) return
    if (!iPassword || iPassword.length < 6) {
      alert(isUk ? 'Пароль має бути мінімум 6 символів' : 'Пароль должен быть минимум 6 символов')
      return
    }
    setInviteLoading(true)

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: iName,
          email: iEmail,
          password: iPassword,
          role: iRole,
          companyId,
          phone: iPhone,
          address: iAddress,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        alert((isUk ? 'Помилка: ' : 'Ошибка: ') + data.error)
        setInviteLoading(false)
        return
      }

      // Add to local team list
      const initials = iName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??'
      const grad = GRADIENTS[team.length % GRADIENTS.length]
      const member: Member = {
        id: data.userId, name: iName, email: iEmail,
        phone: iPhone, address: iAddress, role: iRole,
        initials, gradient: grad,
        permissions: DEFAULT_PERMS[iRole as keyof typeof DEFAULT_PERMS] || DEFAULT_PERMS.manager,
      }
      setTeam(prev => [...prev, member])
      setShowInvite(false)
      setIName(''); setIEmail(''); setIPhone(''); setIAddress(''); setIRole('manager'); setIPassword('')
      alert(isUk
        ? `✓ Менеджер ${iName} створений!\n\nДані для входу:\nEmail: ${iEmail}\nПароль: ${iPassword}\n\nПередайте ці дані менеджеру.`
        : `✓ Менеджер ${iName} создан!\n\nДанные для входа:\nEmail: ${iEmail}\nПароль: ${iPassword}\n\nПередайте эти данные менеджеру.`
      )
    } catch (e) {
      alert(isUk ? 'Помилка зʼєднання' : 'Ошибка соединения')
    }
    setInviteLoading(false)
  }


  const [activeTab, setActiveTab] = useState<'members' | 'stats'>('members')
  const [showInvite, setShowInvite] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Invite form
  const [iName, setIName] = useState('')
  const [iEmail, setIEmail] = useState('')
  const [iPhone, setIPhone] = useState('')
  const [iAddress, setIAddress] = useState('')
  const [iRole, setIRole] = useState<Role>('manager')
  const [estimations, setEstimations] = useState<any[]>([])
  const [iPassword, setIPassword] = useState('')
  const [memberPasswords, setMemberPasswords] = useState<Record<string,string>>({})
  const [savingMember, setSavingMember] = useState<string|null>(null)
  const [permSavedId, setPermSavedId] = useState<string|null>(null)
  const [showIPassword, setShowIPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: userRecord } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      if (userRecord?.company_id) {
        setCompanyId(userRecord.company_id)
        // Load members AND their saved permissions together
        const [{ data: members }, { data: permsData }] = await Promise.all([
          supabase.from('users').select('*').eq('company_id', userRecord.company_id).order('created_at'),
          supabase.from('user_permissions').select('*').eq('company_id', userRecord.company_id),
        ])

        if (members && members.length > 0) {
          const mapped = members.map((m: any, i: number) => {
            // Find saved permissions for this member
            const saved = permsData?.find((p: any) => p.user_id === m.id)
            const defaultPerms = DEFAULT_PERMS[m.role as keyof typeof DEFAULT_PERMS] || DEFAULT_PERMS.manager
            const permissions: Permissions = saved ? {
              see_dashboard:        saved.see_dashboard        ?? defaultPerms.see_dashboard,
              see_history_own:      saved.see_history_own      ?? defaultPerms.see_history_own,
              see_history_all:      saved.see_history_all      ?? defaultPerms.see_history_all,
              see_statistics:       saved.see_statistics       ?? defaultPerms.see_statistics,
              see_team:             saved.see_team             ?? defaultPerms.see_team,
              can_edit_rules:       saved.can_edit_rules       ?? defaultPerms.can_edit_rules,
              can_manage_categories:saved.can_manage_categories ?? defaultPerms.can_manage_categories,
            } : defaultPerms
            return {
              id: m.id,
              name: m.name || m.email,
              email: m.email,
              phone: m.phone || '',
              address: m.address || '',
              role: m.role || 'manager',
              initials: (m.name || m.email).split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2),
              gradient: GRADIENTS[i % GRADIENTS.length],
              permissions,
            }
          })
          setTeam(mapped)
        }
      }
    })
  }, [])

  // Per-member stats
  function memberStats(name: string) {
    const mine = estimations.filter(e => e.user_name === name)
    const bought = mine.filter(e => e.status !== 'not_evaluated' && e.buy_price > 0)
    const totalBuySum = bought.reduce((s, e) => s + e.buy_price, 0)
    const totalProfit = bought.reduce((s, e) => s + e.profit, 0)
    const avgProfit = bought.length > 0 ? Math.round(totalProfit / bought.length) : 0
    const avgPct = bought.length > 0 ? Math.round(bought.reduce((s, e) => s + e.profitability, 0) / bought.length) : 0
    const rejected = mine.filter(e => e.status === 'not_evaluated').length
    const conversionRate = mine.length > 0 ? Math.round((bought.length / mine.length) * 100) : 0
    return { total: mine.length, bought: bought.length, totalBuySum, totalProfit, avgProfit, avgPct, rejected, conversionRate }
  }


  async function updatePerm(id: string, key: keyof Permissions, val: boolean) {
    const member = team.find(m => m.id === id)
    if (!member) return
    const newPerms = { ...member.permissions, [key]: val }
    setTeam(t => t.map(m => m.id === id ? { ...m, permissions: newPerms } : m))

    // Use server API with service role to bypass RLS
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: ur } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (!ur?.company_id) return

    const token = await getAuthToken()
    const res = await fetch('/api/team/save-permissions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: id,
        company_id: ur.company_id,
        permissions: newPerms,
      }),
    })
    const data = await res.json()

    if (!data.success) {
      console.error('Permission save error:', data.error)
      alert('Помилка збереження: ' + data.error)
    } else {
      setPermSavedId(id)
      setTimeout(() => setPermSavedId(null), 2000)
    }
  }

  function updateRole(id: string, role: Role) {
    setTeam(t => t.map(m => m.id === id ? { ...m, role, permissions: { ...DEFAULT_PERMS[role] } } : m))
  }

  const th: React.CSSProperties = {
    textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted2,
    textTransform: 'uppercase', letterSpacing: '0.6px', paddingBottom: 12,
    paddingLeft: 12, paddingRight: 12, borderBottom: `1px solid ${C.border}`,
  }
  const td: React.CSSProperties = { padding: '13px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' }

  return (
    <div className='page-wrap' style={{ padding: '28px 32px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: C.text }}>{t.team_title}</h1>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Techno Shop · {team.length} учасників</p>
        </div>
        <button onClick={() => setShowInvite(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
          border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(99,130,255,0.3)',
        }}>
          <UserPlus size={15} /> Додати
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, gap: 4, width: 'fit-content', marginBottom: 20 }}>
        {[
          { val: 'members', label: t.members_tab },
          { val: 'stats',   label: t.stats_tab },
        ].map(tab => (
          <button key={tab.val} onClick={() => setActiveTab(tab.val as any)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            background: activeTab === tab.val ? C.card2 : 'transparent',
            color: activeTab === tab.val ? C.text : C.muted,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── Invite form ─────────────────────────────────────────────────────── */}
      {showInvite && (
        <Card style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(99,130,255,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Новий учасник</SectionLabel>
            <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2 }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><span style={lbl}>Повне ім'я *</span><input style={f} placeholder={t.full_name_ph} value={iName} onChange={e => setIName(e.target.value)} /></div>
            <div><span style={lbl}>Email *</span><input style={f} type="email" placeholder="petro@shop.ua" value={iEmail} onChange={e => setIEmail(e.target.value)} /></div>
            <div><span style={lbl}>Телефон</span><input style={f} placeholder="+380 67 000 00 00" value={iPhone} onChange={e => setIPhone(e.target.value)} /></div>
            <div>
              <span style={lbl}>Роль</span>
              <select style={{ ...f, color: C.text, cursor: 'pointer' }} value={iRole} onChange={e => setIRole(e.target.value as Role)}>
                <option value="admin">Admin — повний доступ</option>
                <option value="manager">Manager — оцінює техніку</option>
                <option value="viewer">Viewer — тільки перегляд</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}><span style={lbl}>Адреса / Відділення</span><input style={f} placeholder="м. Київ, вул. Хрещатик 1" value={iAddress} onChange={e => setIAddress(e.target.value)} /></div>
            <div style={{ gridColumn: '1/-1' }}>
              <span style={{ ...lbl, color: '#F87171' }}>Пароль для входу * (мін. 6 символів)</span>
              <div style={{ position: 'relative' }}>
                <input style={{ ...f, paddingRight: 44 }} type={showIPassword ? 'text' : 'password'}
                  placeholder="Придумайте пароль для менеджера"
                  value={iPassword} onChange={e => setIPassword(e.target.value)} />
                <button type="button" onClick={() => setShowIPassword(!showIPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 0 }}>
                  {showIPassword ? '🙈' : '👁'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: C.muted2, marginTop: 5 }}>
                {isUk ? 'Після створення — передайте email і пароль менеджеру особисто' : 'После создания — передайте email и пароль менеджеру лично'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleInvite} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Додати учасника
            </button>
            <button onClick={() => setShowInvite(false)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer' }}>
              Скасувати
            </button>
          </div>
        </Card>
      )}

      {/* ── MEMBERS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {team.map(member => {
            const isExpanded = expandedId === member.id
            const rc = ROLE_COLORS[member.role]
            const stats = memberStats(member.name)
            return (
              <div key={member.id} style={{ background: C.card, border: `1px solid ${isExpanded ? C.border2 : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : member.id)}>
                  {/* Avatar */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: member.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {member.initials}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{member.name}</p>
                      <span style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{member.email}</span>
                      {member.phone && <span style={{ fontSize: 13, color: C.muted2 }}>{member.phone}</span>}
                      {member.address && <span style={{ fontSize: 13, color: C.muted2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{member.address}</span>}
                    </div>
                  </div>
                  {/* Mini stats */}
                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1 }}>{stats.total}</p>
                      <p style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>оцінок</p>
                    </div>
                    {stats.bought > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.success, lineHeight: 1 }}>{stats.bought}</p>
                        <p style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>куплено</p>
                      </div>
                    )}
                  </div>
                  {/* Expand */}
                  <div style={{ color: C.muted2, flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded settings */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px 20px 24px' }}>
                    <div className='rg-2' style={{ gap: 24 }}>

                      {/* Left: edit info + role */}
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 14 }}>Дані учасника</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div><span style={{ ...lbl, fontSize: 11 }}>Ім'я</span>
                            <input style={{ ...f, fontSize: 13 }} defaultValue={member.name} onBlur={e => setTeam(t => t.map(m => m.id === member.id ? { ...m, name: e.target.value } : m))} />
                          </div>
                          <div><span style={{ ...lbl, fontSize: 11 }}>Email</span>
                            <input style={{ ...f, fontSize: 13 }} defaultValue={member.email} onBlur={e => setTeam(t => t.map(m => m.id === member.id ? { ...m, email: e.target.value } : m))} />
                          </div>
                          <div><span style={{ ...lbl, fontSize: 11 }}>Телефон</span>
                            <input style={{ ...f, fontSize: 13 }} defaultValue={member.phone} placeholder="+380 ..." onBlur={e => setTeam(t => t.map(m => m.id === member.id ? { ...m, phone: e.target.value } : m))} />
                          </div>
                          <div><span style={{ ...lbl, fontSize: 11 }}>Адреса / Відділення</span>
                            <input style={{ ...f, fontSize: 13 }} defaultValue={member.address} placeholder="вул., місто..." onBlur={e => setTeam(t => t.map(m => m.id === member.id ? { ...m, address: e.target.value } : m))} />
                          </div>
                          {member.role !== 'owner' && (
                            <div>
                              <span style={{ ...lbl, fontSize: 11 }}>Роль</span>
                              <select style={{ ...f, fontSize: 13, color: C.text, cursor: 'pointer' }} value={member.role}
                                onChange={async e => {
                                  const newRole = e.target.value as Role
                                  updateRole(member.id, newRole)
                                  // Save role to Supabase via API
                                  const token2 = await getAuthToken()
                                  await fetch('/api/admin/update-user', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token2}`,
                                    },
                                    body: JSON.stringify({ userId: member.id, role: newRole }),
                                  })
                                }}>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            </div>
                          )}

                          {/* Password change */}
                          <div>
                            <span style={{ ...lbl, fontSize: 11 }}>{isUk ? 'Змінити ключ входу' : 'Изменить ключ входа'}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                autoComplete="new-password"
                                data-lpignore="true"
                                data-form-type="other"
                                placeholder={isUk ? 'Новий ключ (мін. 6 символів)' : 'Новый ключ (мин. 6 символов)'}
                                value={memberPasswords[member.id] || ''}
                                onChange={e => setMemberPasswords(p => ({ ...p, [member.id]: e.target.value }))}
                                style={{ ...f, fontSize: 13, flex: 1 }}
                              />
                              <button
                                onClick={async () => {
                                  const pwd = memberPasswords[member.id]
                                  if (!pwd || pwd.length < 6) {
                                    alert(isUk ? 'Мінімум 6 символів' : 'Минимум 6 символов')
                                    return
                                  }
                                  setSavingMember(member.id)
                                  const token = await getAuthToken()
                                  const res = await fetch('/api/admin/update-user', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ userId: member.id, password: pwd }),
                                  })
                                  const data = await res.json()
                                  setSavingMember(null)
                                  if (data.success) {
                                    setMemberPasswords(p => ({ ...p, [member.id]: '' }))
                                    alert(isUk ? '✓ Пароль змінено' : '✓ Пароль изменён')
                                  } else {
                                    alert(isUk ? 'Помилка: ' + data.error : 'Ошибка: ' + data.error)
                                  }
                                }}
                                style={{
                                  padding: '8px 14px', borderRadius: 9, border: 'none',
                                  background: savingMember === member.id ? C.border2 : 'linear-gradient(135deg,#6382FF,#A78BFA)',
                                  color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
                                  cursor: savingMember === member.id ? 'not-allowed' : 'pointer', flexShrink: 0,
                                }}
                              >
                                {savingMember === member.id ? '...' : (isUk ? 'Зберегти' : 'Сохранить')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: permissions */}
                      <div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Доступ до розділів</p>
                          {permSavedId === member.id && (
                            <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>✓ Збережено</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {PERM_LABELS_DATA.map(({ key, labelUk, labelRu, descUk, descRu }) => { const label = lang==='uk'?labelUk:labelRu; const desc = lang==='uk'?descUk:descRu;
                            const val = member.permissions[key]
                            const disabled = member.role === 'owner'
                            return (
                              <div key={key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '9px 12px', borderRadius: 8,
                                background: val ? 'rgba(52,217,138,0.05)' : 'rgba(255,255,255,0.02)',
                                opacity: disabled ? 0.5 : 1,
                              }}>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</p>
                                  <p style={{ fontSize: 11, color: C.muted2 }}>{desc}</p>
                                </div>
                                <button
                                  disabled={disabled}
                                  onClick={() => updatePerm(member.id, key, !val)}
                                  style={{
                                    width: 42, height: 24, borderRadius: 99, border: 'none',
                                    background: val ? C.success : C.border2,
                                    cursor: disabled ? 'default' : 'pointer',
                                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                  }}>
                                  <div style={{
                                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                    position: 'absolute', top: 3, left: val ? 21 : 3,
                                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  }} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {member.role !== 'owner' && (
                      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setTeam(t => t.filter(m => m.id !== member.id)); setExpandedId(null) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: C.danger, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          <Trash2 size={13} /> Видалити учасника
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── STATS TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {team.map(member => {
            const s = memberStats(member.name)
            const rc = ROLE_COLORS[member.role]
            return (
              <div key={member.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {/* Member header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: member.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {member.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{member.name}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                      <span style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{ROLE_LABELS[member.role]}</span>
                      {member.address && <span style={{ fontSize: 12, color: C.muted2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{member.address}</span>}
                    </div>
                  </div>
                </div>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
                  {[
                    { icon: <BarChart2 size={16} />, label: t.total_estimates2, value: String(s.total), color: C.text },
                    { icon: <ShoppingBag size={16} />, label: t.bought_label, value: String(s.bought), color: C.accent },
                    { icon: <DollarSign size={16} />, label: t.buy_sum, value: s.totalBuySum > 0 ? formatMoney(s.totalBuySum) : '—', color: C.success },
                    { icon: <TrendingUp size={16} />, label: t.pot_profit, value: s.totalProfit > 0 ? formatMoney(s.totalProfit) : '—', color: C.warning },
                  ].map(({ icon, label, value, color }, i) => (
                    <div key={label} style={{ padding: '16px 20px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: C.muted2 }}>{icon}<p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p></div>
                      <p style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Second row KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
                  {[
                    { label: t.conversion, value: s.total > 0 ? `${s.conversionRate}%` : '—', color: s.conversionRate >= 60 ? C.success : s.conversionRate >= 30 ? C.warning : C.danger, desc: t.conversion_desc },
                    { label: 'Серед. прибуток', value: s.avgProfit > 0 ? formatMoney(s.avgProfit) : '—', color: C.text, desc: t.avg_profit_desc },
                    { label: 'Серед. рент.',  value: s.avgPct > 0 ? `${s.avgPct}%` : '—', color: s.avgPct >= 20 ? C.success : s.avgPct >= 10 ? C.warning : C.danger, desc: t.avg_pct_desc },
                    { label: t.rejections2,        value: String(s.rejected), color: s.rejected === 0 ? C.success : C.danger, desc: t.rejections2_desc },
                  ].map(({ label, value, color, desc }, i) => (
                    <div key={label} style={{ padding: '14px 20px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: -0.5, marginBottom: 2 }}>{value}</p>
                      <p style={{ fontSize: 11, color: C.muted2 }}>{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Recent estimations by this member */}
                {s.total === 0 ? (
                  <div style={{ padding: '20px 24px', textAlign: 'center', color: C.muted2 }}>
                    <p style={{ fontSize: 13 }}>Ще немає оцінок від цього менеджера</p>
                  </div>
                ) : (
                  <div style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>Останні оцінки</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {estimations.filter(e => e.user_name === member.name).slice(0, 5).map(e => (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{(e as any).brand_name || ''} {(e as any).model_name || e.category_name}</p>
                            <p style={{ fontSize: 11, color: C.muted2 }}>{e.category_name} · {new Date(e.created_at).toLocaleDateString('uk-UA')}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: e.status === 'not_evaluated' ? C.danger : C.success }}>
                                {e.status === 'not_evaluated' ? 'Відмова' : formatMoney(e.buy_price)}
                              </p>
                              {e.profit > 0 && <p style={{ fontSize: 11, color: C.muted2 }}>+{formatMoney(e.profit)}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
