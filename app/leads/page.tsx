'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckCircle, AlertTriangle, XCircle, Phone, User, Clock, RefreshCw } from 'lucide-react'

const C = {
  bg: '#09090E', card: '#0E0E16', border: '#1E1E30', border2: '#282840',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
  accent: '#6382FF', success: '#34D98A', warning: '#FBBF24', danger: '#F87171',
}

const LEAD_STATUSES = [
  { id: 'new',        label: 'Нова',        color: '#6382FF', bg: 'rgba(99,130,255,0.1)' },
  { id: 'contacted',  label: 'Зв\'язались', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'bought',     label: 'Куплено',     color: '#34D98A', bg: 'rgba(52,217,138,0.1)' },
  { id: 'declined',   label: 'Відмова',     color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
]

function statusBadge(status: string) {
  const s = LEAD_STATUSES.find(x => x.id === status) || LEAD_STATUSES[0]
  return (
    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

function resultIcon(status: string) {
  if (status === 'good') return <CheckCircle size={14} color="#34D98A" />
  if (status === 'caution') return <AlertTriangle size={14} color="#FBBF24" />
  return <XCircle size={14} color="#F87171" />
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: ur } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (!ur?.company_id) return
    setCompanyId(ur.company_id)

    const { data } = await supabase
      .from('widget_leads')
      .select('*')
      .eq('company_id', ur.company_id)
      .order('created_at', { ascending: false })

    setLeads(data || [])
    setLoading(false)
  }

  async function updateLeadStatus(id: string, status: string) {
    setUpdatingId(id)
    const supabase = createClient()
    await supabase.from('widget_leads').update({ lead_status: status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l))
    if (selected?.id === id) setSelected((prev: any) => ({ ...prev, lead_status: status }))
    setUpdatingId('')
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.lead_status === filter)
  const newCount = leads.filter(l => l.lead_status === 'new').length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif', padding: '24px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>Заявки з віджету</h1>
              {newCount > 0 && (
                <span style={{ padding: '2px 9px', borderRadius: 99, background: 'rgba(99,130,255,0.15)', color: C.accent, fontSize: 12, fontWeight: 700 }}>
                  {newCount} нових
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: C.muted }}>Запити від покупців через ваш віджет на сайті</p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={loadLeads} style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} /> Оновити
            </button>
          </div>
        </div>

        {/* Widget embed hint */}
        <div style={{ background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>Код для вставки на сайт</p>
            <code style={{ fontSize: 11, color: C.muted, background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 5 }}>
              {`<iframe src="https://tradevp.com/widget/${companyId}" width="100%" height="600" frameborder="0"></iframe>`}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`<iframe src="https://tradevp.com/widget/${companyId}" width="100%" height="600" frameborder="0"></iframe>`)
              alert('Скопійовано!')
            }}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: C.accent, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Скопіювати
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ id: 'all', label: `Всі (${leads.length})` }, ...LEAD_STATUSES.map(s => ({ id: s.id, label: `${s.label} (${leads.filter(l => l.lead_status === s.id).length})` }))].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${filter === tab.id ? C.accent : C.border2}`, background: filter === tab.id ? 'rgba(99,130,255,0.1)' : 'transparent', color: filter === tab.id ? C.accent : C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>Завантаження...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Заявок поки немає</p>
            <p style={{ fontSize: 13, color: C.muted2 }}>Вставте віджет на свій сайт щоб почати отримувати заявки</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(lead => (
              <div key={lead.id}
                onClick={() => setSelected(lead)}
                style={{ background: C.card, border: `1px solid ${lead.lead_status === 'new' ? 'rgba(99,130,255,0.3)' : C.border}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {resultIcon(lead.status)}
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{lead.brand_name} {lead.model_name || lead.category_name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>₴{(lead.buy_price || 0).toLocaleString('uk-UA')}</span>
                  {lead.client_name && <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} />{lead.client_name}</span>}
                  {lead.client_phone && <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{lead.client_phone}</span>}
                  <span style={{ fontSize: 11, color: C.muted2, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{new Date(lead.created_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>{statusBadge(lead.lead_status || 'new')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Деталі заявки</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                ['Категорія', selected.category_name],
                ['Бренд', selected.brand_name || '—'],
                ['Модель', selected.model_name || '—'],
                ['Стан', selected.condition || '—'],
                ['Ринкова ціна', selected.market_price ? `₴${selected.market_price.toLocaleString('uk-UA')}` : '—'],
                ['Ціна викупу', selected.buy_price ? `₴${selected.buy_price.toLocaleString('uk-UA')}` : '—'],
                ['Ім\'я клієнта', selected.client_name || '—'],
                ['Телефон', selected.client_phone || '—'],
                ['Дата', new Date(selected.created_at).toLocaleString('uk-UA')],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Статус заявки</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LEAD_STATUSES.map(s => (
                  <button key={s.id}
                    onClick={() => updateLeadStatus(selected.id, s.id)}
                    disabled={updatingId === selected.id}
                    style={{ padding: '10px', borderRadius: 9, border: `1px solid ${selected.lead_status === s.id ? s.color : C.border2}`, background: selected.lead_status === s.id ? s.bg : 'transparent', color: selected.lead_status === s.id ? s.color : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
