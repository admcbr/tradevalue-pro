'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  pro_month: 'Pro — 1 місяць',
  pro_year: 'Pro — 1 рік',
  business_month: 'Business — 1 місяць',
  business_year: 'Business — 1 рік',
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') || ''
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(timer); router.push('/dashboard'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
          <CheckCircle size={40} color="#10B981" />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F8FAFC', letterSpacing: -1, marginBottom: 12 }}>
          Оплата успішна! 🎉
        </h1>

        <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 8, lineHeight: 1.7 }}>
          Ваш тариф <strong style={{ color: '#F8FAFC' }}>{PLAN_LABELS[plan] || plan}</strong> активовано.
        </p>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 40 }}>
          Дякуємо за довіру до TradeValue Pro!
        </p>

        <div style={{ padding: '20px 28px', borderRadius: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 28 }}>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 6 }}>Перехід до дашборду через</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#6366F1' }}>{seconds}с</p>
        </div>

        <button onClick={() => router.push('/dashboard')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 28px', borderRadius: 12,
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          color: '#fff', border: 'none', fontFamily: 'inherit',
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          boxShadow: '0 0 24px rgba(99,102,241,0.4)',
        }}>
          Перейти в дашборд <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070C' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
export const dynamic = 'force-dynamic'
