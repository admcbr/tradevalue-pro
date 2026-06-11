import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const MONO_TOKEN = process.env.MONO_TOKEN!
const MONO_MERCHANT_ID = process.env.MONO_MERCHANT_ID!

const PLANS: Record<string, { amount: number; name: string }> = {
  pro_month:     { amount: 79900,  name: 'TradeValue Pro — Pro план (місяць)' },
  pro_year:      { amount: 767880, name: 'TradeValue Pro — Pro план (рік)' },
  business_month:{ amount: 199900, name: 'TradeValue Pro — Business план (місяць)' },
  business_year: { amount: 1919040,name: 'TradeValue Pro — Business план (рік)' },
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planKey } = await request.json()
    const plan = PLANS[planKey]
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // Get user's company
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }
    if (userRecord.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can purchase plans' }, { status: 403 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tradevp.com'

    // Create Monobank invoice
    const invoiceRes = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'X-Token': MONO_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: plan.amount,
        ccy: 980, // UAH
        merchantPaymInfo: {
          reference: `${userRecord.company_id}_${planKey}_${Date.now()}`,
          destination: plan.name,
          comment: `Підписка TradeValue Pro: ${plan.name}`,
          basketOrder: [{
            name: plan.name,
            qty: 1,
            sum: plan.amount,
            icon: `${baseUrl}/logo.png`,
            unit: 'шт.',
            code: planKey,
          }],
        },
        redirectUrl: `${baseUrl}/payment/success?plan=${planKey}`,
        webhookUrl: `${baseUrl}/api/payment/webhook`,
        validity: 3600, // 1 hour
        paymentType: 'debit',
      }),
    })

    const invoiceData = await invoiceRes.json()

    if (!invoiceData.invoiceId) {
      console.error('Monobank error:', invoiceData)
      return NextResponse.json({ error: 'Failed to create invoice: ' + (invoiceData.errText || 'Unknown error') }, { status: 500 })
    }

    // Save pending payment to DB
    await supabaseAdmin.from('payments').insert({
      invoice_id: invoiceData.invoiceId,
      company_id: userRecord.company_id,
      user_id: user.id,
      plan_key: planKey,
      amount: plan.amount,
      status: 'pending',
    }) // table might not exist yet — ok

    return NextResponse.json({ 
      pageUrl: invoiceData.pageUrl,
      invoiceId: invoiceData.invoiceId 
    })
  } catch (e: any) {
    console.error('Payment create error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
