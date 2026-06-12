'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
          <XCircle size={40} color="#EF4444" />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F8FAFC', letterSpacing: -1, marginBottom: 12 }}>
          Оплату скасовано
        </h1>

        <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 8, lineHeight: 1.7 }}>
          Ви скасували оплату. Нічого не списано з вашої картки.
        </p>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 40 }}>
          Ви можете спробувати ще раз у будь-який момент.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/pricing')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            color: '#fff', border: 'none', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 0 24px rgba(99,102,241,0.4)',
          }}>
            Спробувати ще раз
          </button>
          <button onClick={() => router.push('/dashboard')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94A3B8', fontFamily: 'inherit',
            fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}>
            <ArrowLeft size={16} /> До дашборду
          </button>
        </div>
      </div>
    </div>
  )
}
