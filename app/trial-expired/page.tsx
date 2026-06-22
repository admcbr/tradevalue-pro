'use client'

import { useRouter } from 'next/navigation'
import { Clock, Zap, Building2 } from 'lucide-react'

const C = {
  bg: '#07070C', card: '#0E0E18', border: '#1E1E32',
  text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
  accent: '#6382FF',
}

export default function TrialExpiredPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,130,255,0.1)', border: '2px solid rgba(99,130,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(99,130,255,0.15)' }}>
          <Clock size={32} color={C.accent} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: -1, marginBottom: 12 }}>
          Пробний період завершено
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>
          Ваші 3 дні безкоштовного доступу закінчились. Оберіть тариф щоб продовжити роботу — всі ваші дані збережені.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { icon: <Zap size={20} color="#A78BFA" />, name: 'Pro', price: '₴799', desc: 'Для активних магазинів', color: '#A78BFA' },
            { icon: <Building2 size={20} color="#34D98A" />, name: 'Business', price: '₴1999', desc: 'Для мережі магазинів', color: '#34D98A' },
          ].map(plan => (
            <div key={plan.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 16px' }}>
              <div style={{ marginBottom: 10 }}>{plan.icon}</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>{plan.name}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: plan.color, marginBottom: 4 }}>{plan.price}</p>
              <p style={{ fontSize: 12, color: C.muted2 }}>{plan.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/pricing')}
          style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${C.accent},#8B5CF6)`, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 32px rgba(99,130,255,0.3)', marginBottom: 12 }}>
          Обрати тариф →
        </button>

        <button
          onClick={() => router.push('/support')}
          style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Зв'язатись з підтримкою
        </button>
      </div>
    </div>
  )
}
