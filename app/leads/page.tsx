'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckCircle, AlertTriangle, XCircle, Phone, User, Clock, RefreshCw, Settings, Eye, EyeOff, Copy, Check } from 'lucide-react'

const C = {
  bg: '#09090E', card: '#0E0E16', border: '#1E1E30', border2: '#282840',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
  accent: '#6382FF', success: '#34D98A', warning: '#FBBF24', danger: '#F87171',
}

const LEAD_STATUSES = [
  { id: 'new',       label: 'Нова',        color: '#6382FF', bg: 'rgba(99,130,255,0.1)' },
  { id: 'contacted', label: "Зв'язались",  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'bought',    label: 'Куплено',     color: '#34D98A', bg: 'rgba(52,217,138,0.1)' },
  { id: 'declined',  label: 'Відмова',     color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
]

const ACCENT_PRESETS = ['#6382FF','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444','#06B6D4','#84CC16']
const BG_PRESETS     = ['#07070C','#0A0A0A','#0F0F1A','#FFFFFF','#F8F9FA','#1A1A2E','#0D1117','#1C1C1E']

export default function LeadsPage() {
  const [tab, setTab] = useState<'leads'|'settings'>('leads')
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [updatingId, setUpdatingId] = useState('')
  const [copied, setCopied] = useState(false)

  // Widget settings
  const [wTitle, setWTitle]     = useState('')
  const [wColor, setWColor]     = useState('#6382FF')
  const [wBg, setWBg]           = useState('#07070C')
  const [wHidePrice, setWHidePrice] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveOk, setSaveOk]     = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: ur } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (!ur?.company_id) return
    setCompanyId(ur.company_id)

    // Load leads
    const { data } = await supabase
      .from('widget_leads').select('*')
      .eq('company_id', ur.company_id)
      .order('created_at', { ascending: false })
    setLeads(data || [])

    // Load widget settings
    const { data: comp } = await supabase
      .from('companies')
      .select('name, widget_title, widget_color, widget_bg_color, widget_hide_price')
      .eq('id', ur.company_id).maybeSingle()
    if (comp) {
      setWTitle(comp.widget_title || `Оцінка техніки — ${comp.name}`)
      setWColor(comp.widget_color || '#6382FF')
      setWBg(comp.widget_bg_color || '#07070C')
      setWHidePrice(comp.widget_hide_price ?? false)
    }
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/widget/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ widget_title: wTitle, widget_color: wColor, widget_bg_color: wBg }),
    })
    setSaving(false); setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2500)
  }

  async function updateLeadStatus(id: string, status: string) {
    setUpdatingId(id)
    const supabase = createClient()
    await supabase.from('widget_leads').update({ lead_status: status }).eq('id', id)
    setLeads(p => p.map(l => l.id === id ? { ...l, lead_status: status } : l))
    if (selected?.id === id) setSelected((p: any) => ({ ...p, lead_status: status }))
    setUpdatingId('')
  }

  function copyCode() {
    navigator.clipboard.writeText(`<iframe src="https://tradevp.com/widget/${companyId}" width="100%" height="680" frameborder="0" style="border-radius:16px;overflow:hidden;"></iframe>`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.lead_status === filter)
  const newCount = leads.filter(l => l.lead_status === 'new').length

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#141422', border: `1px solid ${C.border2}`, color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.7px', display: 'block', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif', padding: '24px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>Віджет</h1>
              {newCount > 0 && <span style={{ padding: '2px 9px', borderRadius: 99, background: 'rgba(99,130,255,0.15)', color: C.accent, fontSize: 12, fontWeight: 700 }}>{newCount} нових</span>}
            </div>
            <p style={{ fontSize: 13, color: C.muted }}>Заявки та налаштування вбудованого віджету</p>
          </div>
          <button onClick={loadData} style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Оновити
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0E0E16', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[{id:'leads',label:'📋 Заявки'},{id:'settings',label:'⚙️ Налаштування'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: tab === t.id ? C.accent : 'transparent', color: tab === t.id ? '#fff' : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LEADS TAB ── */}
        {tab === 'leads' && (<>
          {/* Embed code */}
          <div style={{ background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Код для вставки на сайт</p>
              <code style={{ fontSize: 11, color: C.muted, background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 5, wordBreak: 'break-all' as const }}>
                {`<iframe src="https://tradevp.com/widget/${companyId}" ...>`}
              </code>
            </div>
            <button onClick={copyCode} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: copied ? '#34D98A' : C.accent, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'background .2s' }}>
              {copied ? <><Check size={13} /> Скопійовано</> : <><Copy size={13} /> Скопіювати</>}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[{id:'all',label:`Всі (${leads.length})`}, ...LEAD_STATUSES.map(s => ({id:s.id,label:`${s.label} (${leads.filter(l=>l.lead_status===s.id).length})`}))].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${filter===t.id ? C.accent : C.border2}`, background: filter===t.id ? 'rgba(99,130,255,0.1)' : 'transparent', color: filter===t.id ? C.accent : C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>Завантаження...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>Заявок поки немає</p>
              <p style={{ fontSize: 13, color: C.muted2 }}>Вставте віджет на сайт щоб отримувати заявки</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(lead => {
                const st = LEAD_STATUSES.find(s => s.id === lead.lead_status) || LEAD_STATUSES[0]
                return (
                  <div key={lead.id} onClick={() => setSelected(lead)}
                    style={{ background: C.card, border: `1px solid ${lead.lead_status==='new' ? 'rgba(99,130,255,0.3)' : C.border}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{lead.brand_name} {lead.model_name || lead.category_name}</span>
                      {lead.buy_price > 0 && <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>₴{lead.buy_price.toLocaleString('uk-UA')}</span>}
                      {lead.client_name && <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><User size={11}/>{lead.client_name}</span>}
                      {lead.client_phone && <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{lead.client_phone}</span>}
                      <span style={{ fontSize: 11, color: C.muted2, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11}/>{new Date(lead.created_at).toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, flexShrink: 0 }}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>)}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>

            {/* Appearance */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 20 }}>🎨 Зовнішній вигляд</p>

              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Заголовок віджету</label>
                <input value={wTitle} onChange={e => setWTitle(e.target.value)} style={inp} placeholder="Оцінка техніки — Назва магазину" />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Акцентний колір (кнопки, поля)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => setWColor(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${wColor===c ? '#fff' : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={wColor} onChange={e => setWColor(e.target.value)} style={{ width: 40, height: 36, borderRadius: 8, border: `1px solid ${C.border2}`, background: 'transparent', cursor: 'pointer', padding: 2 }} />
                  <input value={wColor} onChange={e => setWColor(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="#6382FF" />
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={lbl}>Колір фону</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {BG_PRESETS.map(c => (
                    <button key={c} onClick={() => setWBg(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${wBg===c ? '#fff' : C.border2}`, cursor: 'pointer', flexShrink: 0 }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={wBg} onChange={e => setWBg(e.target.value)} style={{ width: 40, height: 36, borderRadius: 8, border: `1px solid ${C.border2}`, background: 'transparent', cursor: 'pointer', padding: 2 }} />
                  <input value={wBg} onChange={e => setWBg(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="#07070C" />
                </div>
              </div>
            </div>

            {/* Behavior */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 16 }}>⚙️ Поведінка</p>

                {/* Hide price toggle */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Приховати ціну від клієнта</p>
                    <p style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6 }}>Клієнт не бачить ціну — одразу залишає контакт, ціну надсилає менеджер. Захищає від перекупів.</p>
                  </div>
                  <button onClick={() => setWHidePrice(p => !p)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: wHidePrice ? C.accent : C.border2, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 3, left: wHidePrice ? 25 : 3, transition: 'left .2s' }} />
                  </button>
                </div>

                {wHidePrice && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.15)' }}>
                    <p style={{ fontSize: 12, color: C.muted }}>✅ Клієнт побачить: <b style={{ color: C.text }}>"Залиште контакт — менеджер надішле ціну"</b></p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 12 }}>👁 Превʼю</p>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border2}` }}>
                  <div style={{ background: wBg, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 36, borderRadius: 8, background: wColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Кнопка дії</span>
                    </div>
                    <div style={{ height: 18, borderRadius: 4, background: `${wColor}33` }} />
                    <div style={{ height: 14, borderRadius: 4, background: `${wColor}18`, width: '70%' }} />
                    <div style={{ height: 32, borderRadius: 8, border: `1.5px solid ${wColor}55`, background: `${wColor}08` }} />
                  </div>
                </div>
              </div>

              {/* Save */}
              <button onClick={saveSettings} disabled={saving} style={{ padding: '14px', borderRadius: 12, border: 'none', background: saveOk ? '#34D98A' : `linear-gradient(135deg,${C.accent},${C.accent}cc)`, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}>
                {saveOk ? <><Check size={16}/> Збережено!</> : saving ? 'Зберігаємо...' : 'Зберегти налаштування'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, maxWidth: 460, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Деталі заявки</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['Категорія', selected.category_name],
                ['Бренд', selected.brand_name || '—'],
                ['Модель', selected.model_name || '—'],
                ['Стан', selected.condition || '—'],
                ['Ринкова ціна', selected.market_price ? `₴${selected.market_price.toLocaleString('uk-UA')}` : '—'],
                ['Ціна викупу', selected.buy_price ? `₴${selected.buy_price.toLocaleString('uk-UA')}` : '—'],
                ["Ім'я клієнта", selected.client_name || '—'],
                ['Телефон', selected.client_phone || '—'],
                ['Месенджер', selected.messenger || '—'],
                ['Дата', new Date(selected.created_at).toLocaleString('uk-UA')],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 12 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Статус</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {LEAD_STATUSES.map(s => (
                <button key={s.id} onClick={() => updateLeadStatus(selected.id, s.id)} disabled={!!updatingId}
                  style={{ padding: '10px', borderRadius: 9, border: `1px solid ${selected.lead_status===s.id ? s.color : C.border2}`, background: selected.lead_status===s.id ? s.bg : 'transparent', color: selected.lead_status===s.id ? s.color : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
