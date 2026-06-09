'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FilePlus, Clock, Settings2, Ban, Users, LogOut, Layers, Menu, X, CreditCard, HeadphonesIcon } from 'lucide-react'
import { useLang, type Lang } from '@/lib/i18n'

const C = { sidebar:'#0E0E16', border:'#1E1E30', accent:'#6382FF', text:'#EDEDF0', muted:'#7070A0', muted2:'#3D3D60' }

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize:9.5, fontWeight:700, color:'#3D3D60', textTransform:'uppercase', letterSpacing:'0.9px', padding:'6px 10px', ...style }}>{children}</div>
}

function NavItem({ item, active, onClick }: { item:{ label:string; href:string; icon:React.ComponentType<{ size?:number; strokeWidth?:number }> }; active:boolean; onClick?:()=>void }) {
  const Icon = item.icon
  return (
    <Link href={item.href} onClick={onClick} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, marginBottom:1, textDecoration:'none', fontSize:13, fontWeight:active?600:500, color:active?'#EDEDF0':'#7070A0', background:active?'rgba(99,130,255,0.12)':'transparent', border:active?'1px solid rgba(99,130,255,0.2)':'1px solid transparent', transition:'all 0.12s' }}>
      <span style={{ color:active?'#6382FF':'#4A4A70', flexShrink:0 }}><Icon size={15} strokeWidth={1.8} /></span>
      {item.label}
      {active && <div style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:'#6382FF' }} />}
    </Link>
  )
}

function SidebarContent({ navItems, lang, setLang, t, onClose, userName='АК', userRole='', handleSignOut=()=>{} }: { navItems:any[]; lang:Lang; setLang:(l:Lang)=>void; t:any; onClose?:()=>void; userName?:string; userRole?:string; handleSignOut?:()=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:C.sidebar, borderRight:`1px solid ${C.border}` }}>
      <div style={{ padding:'20px 18px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6382FF,#A78BFA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', boxShadow:'0 0 16px rgba(99,130,255,0.3)' }}>TV</div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.text }}>TradeValue</p>
            <p style={{ fontSize:10, color:C.muted2, fontWeight:500 }}>Pro · Techno Shop</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted }}><X size={18} /></button>}
      </div>
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        <SectionLabel>{lang==='uk'?'Головне':'Главное'}</SectionLabel>
        {navItems.filter(i=>i.section==='main').map(item=><NavItem key={item.href} item={item} active={false} onClick={onClose} />)}
        <SectionLabel style={{ marginTop:16 }}>{lang==='uk'?'Налаштування':'Настройки'}</SectionLabel>
        {navItems.filter(i=>i.section==='settings').map(item=><NavItem key={item.href} item={item} active={false} onClick={onClose} />)}
      </nav>
      <div style={{ padding:'10px 12px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', background:'#141422', borderRadius:8, padding:3, gap:3 }}>
          {(['uk','ru'] as Lang[]).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{ flex:1, padding:'5px 0', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, background:lang===l?C.accent:'transparent', color:lang===l?'#fff':C.muted, transition:'all 0.15s' }}>
              {l==='uk'?'🇺🇦 УКР':'🇷🇺 РУС'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6382FF,#A78BFA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>АК</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userName}</p>
            <p style={{ fontSize:10, color:C.muted2 }}>{userRole || t.owner}</p>
          </div>
          <button onClick={handleSignOut} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted2 }}><LogOut size={13} /></button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isUk = lang === 'uk'
  const [userName, setUserName] = useState('...')
  const [userInitials, setUserInitials] = useState('..')
  const [userRole, setUserRole] = useState('')
  const [userRoleKey, setUserRoleKey] = useState('manager')

  const [userPerms, setUserPerms] = useState<Record<string,boolean>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('name, role, company_id')
          .eq('id', user.id)
          .single()

        const name = userRecord?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        const role = userRecord?.role || 'manager'

        setUserName(name)
        setUserInitials(name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2))

        const roleLabels: Record<string, string> = {
          owner: 'Власник', admin: 'Адмін', manager: 'Менеджер', viewer: 'Перегляд',
        }
        setUserRole(roleLabels[role] || role)
        setUserRoleKey(role)

        // Load custom permissions for this user
        if (userRecord?.company_id) {
          const { data: perms } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', user.id)
            .single()
          if (perms) setUserPerms(perms)
        }
      }
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const isOwnerOrAdmin = userRoleKey === 'owner' || userRoleKey === 'admin'
  const isManager = userRoleKey === 'manager'
  const isViewer = userRoleKey === 'viewer'

  // Check if user has permission (role-based OR custom permission)
  function hasAccess(roles: string[], permKey?: string): boolean {
    if (!userRoleKey) return true // loading
    if (roles.includes(userRoleKey)) return true
    // Check custom permission
    if (permKey && userPerms[permKey] === true) return true
    return false
  }

  const allNavItems = [
    { label:t.dashboard,    href:'/dashboard',  icon:LayoutDashboard, section:'main',     show: hasAccess(['owner','admin','manager','viewer'], 'see_dashboard') },
    { label:t.new_estimate, href:'/estimate',   icon:FilePlus,        section:'main',     show: hasAccess(['owner','admin','manager']) },
    { label:t.history,      href:'/history',    icon:Clock,           section:'main',     show: hasAccess(['owner','admin','manager','viewer'], 'see_history_own') },
    { label:t.categories,   href:'/categories', icon:Layers,          section:'settings', show: hasAccess(['owner','admin'], 'can_manage_categories') },
    { label:t.rules,        href:'/rules',      icon:Settings2,       section:'settings', show: hasAccess(['owner','admin'], 'can_edit_rules') },
    { label:t.blocked,      href:'/blocked',    icon:Ban,             section:'settings', show: hasAccess(['owner','admin']) },
    { label:t.team,         href:'/team',       icon:Users,           section:'settings', show: hasAccess(['owner','admin'], 'see_team') },
    { label:isUk?'Тарифи':'Тарифы',       href:'/pricing',  icon:CreditCard,      section:'settings', show: hasAccess(['owner']) },
    { label:isUk?'Підтримка':'Поддержка', href:'/support',  icon:HeadphonesIcon,  section:'settings', show: hasAccess(['owner','admin','manager','viewer']) },
  ]

  const navItems = allNavItems.filter(item => item.show)

  // Fix: apply active state properly
  const navWithActive = navItems.map(i=>({ ...i, active: pathname === i.href }))

  return (
    <>
      {/* Desktop */}
      <div style={{ width:220, flexShrink:0, height:'100vh', position:'sticky', top:0 }} className="tv-desktop-sidebar">
        <SidebarContentActive navItems={navWithActive} lang={lang} setLang={setLang} t={t} userName={userName} userRole={userRole} handleSignOut={handleSignOut} />
      </div>

      {/* Mobile hamburger */}
      <button onClick={()=>setMobileOpen(true)} className="tv-mobile-btn" style={{ display:'none', position:'fixed', top:12, left:12, zIndex:200, width:40, height:40, borderRadius:10, background:C.sidebar, border:`1px solid ${C.border}`, alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.4)' }}>
        <Menu size={18} color={C.text} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex' }}>
          <div onClick={()=>setMobileOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)' }} />
          <div style={{ position:'relative', width:240, height:'100%' }}>
            <SidebarContentActive navItems={navWithActive} lang={lang} setLang={setLang} t={t} onClose={()=>setMobileOpen(false)} userName={userName} userRole={userRole} handleSignOut={handleSignOut} />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .tv-desktop-sidebar { display: none !important; }
          .tv-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function SidebarContentActive({ navItems, lang, setLang, t, onClose, userName, userRole, handleSignOut }: { navItems:any[]; lang:Lang; setLang:(l:Lang)=>void; t:any; onClose?:()=>void; userName:string; userRole:string; handleSignOut:()=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:C.sidebar, borderRight:`1px solid ${C.border}` }}>
      <div style={{ padding:'20px 18px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6382FF,#A78BFA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', boxShadow:'0 0 16px rgba(99,130,255,0.3)' }}>TV</div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.text }}>TradeValue</p>
            <p style={{ fontSize:10, color:C.muted2, fontWeight:500 }}>Pro · Techno Shop</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted }}><X size={18} /></button>}
      </div>
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        <SectionLabel>{lang==='uk'?'Головне':'Главное'}</SectionLabel>
        {navItems.filter(i=>i.section==='main').map(item=><NavItem key={item.href} item={item} active={item.active} onClick={onClose} />)}
        <SectionLabel style={{ marginTop:16 }}>{lang==='uk'?'Налаштування':'Настройки'}</SectionLabel>
        {navItems.filter(i=>i.section==='settings').map(item=><NavItem key={item.href} item={item} active={item.active} onClick={onClose} />)}
      </nav>
      <div style={{ padding:'10px 12px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', background:'#141422', borderRadius:8, padding:3, gap:3 }}>
          {(['uk','ru'] as Lang[]).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{ flex:1, padding:'5px 0', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, background:lang===l?C.accent:'transparent', color:lang===l?'#fff':C.muted, transition:'all 0.15s' }}>
              {l==='uk'?'🇺🇦 УКР':'🇷🇺 РУС'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6382FF,#A78BFA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>АК</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userName}</p>
            <p style={{ fontSize:10, color:C.muted2 }}>{userRole || t.owner}</p>
          </div>
          <button onClick={handleSignOut} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted2 }}><LogOut size={13} /></button>
        </div>
      </div>
    </div>
  )
}
