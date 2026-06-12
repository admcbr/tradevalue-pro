import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const MONO_TOKEN = process.env.MONO_TOKEN!

const PLAN_MAPPING: Record<string, { plan: string; months: number }> = {
  pro_month:      { plan: 'pro',      months: 1  },
  pro_year:       { plan: 'pro',      months: 12 },
  business_month: { plan: 'business', months: 1  },
  business_year:  { plan: 'business', months: 12 },
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    // Verify webhook signature from Monobank — REQUIRED
    const signHeader = request.headers.get('X-Sign')
    if (!signHeader) {
      console.error('Missing X-Sign header — rejecting webhook')
      return NextResponse.json({ error: 'Missing signature' }, { status: 403 })
    }

    // Get public key from Monobank
    const pubKeyRes = await fetch('https://api.monobank.ua/api/merchant/pubkey', {
      headers: { 'X-Token': MONO_TOKEN }
    })
    const { key } = await pubKeyRes.json()

    if (!key) {
      console.error('Could not fetch Monobank public key')
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 403 })
    }

    const verify = crypto.createVerify('SHA256')
    verify.update(body)
    const isValid = verify.verify(
      { key: Buffer.from(key, 'base64'), format: 'der', type: 'spki' },
      Buffer.from(signHeader, 'base64')
    )
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const { invoiceId, status, reference } = data

    if (status !== 'success') {
      console.log(`Payment ${invoiceId} status: ${status}`)
      return NextResponse.json({ ok: true })
    }

    // Parse reference: companyId_planKey_timestamp
    const parts = reference?.split('_') || []
    if (parts.length < 2) {
      return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
    }

    const companyId = parts[0]
    const planKey = parts[1]
    const planInfo = PLAN_MAPPING[planKey]

    if (!planInfo) {
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Calculate subscription end date
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + planInfo.months)

    // Activate plan for company
    await supabaseAdmin
      .from('companies')
      .update({
        plan: planInfo.plan,
        plan_expires_at: expiresAt.toISOString(),
        estimations_this_month: 0, // reset counter
      })
      .eq('id', companyId)

    // Update payment record
    await supabaseAdmin
      .from('payments')
      .update({ status: 'success', paid_at: now.toISOString() })
      .eq('invoice_id', invoiceId)
      

    console.log(`✅ Plan ${planInfo.plan} activated for company ${companyId}`)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Webhook error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
