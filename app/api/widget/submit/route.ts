import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company_id, category_name, brand_name, model_name, condition,
            market_price, buy_price, sell_price, profit, profitability,
            status, field_values, completeness_values, explanation,
            client_name, client_phone, messenger } = body

    if (!company_id || !category_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify company exists + plan
    const { data: company } = await supabase
      .from('companies')
      .select('id, plan, plan_expires_at')
      .eq('id', company_id)
      .maybeSingle()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404, headers: CORS })

    const now = new Date()
    let plan = company.plan || 'starter'
    if (plan !== 'starter' && company.plan_expires_at && now > new Date(company.plan_expires_at)) {
      plan = 'starter'
    }
    if (plan !== 'business') {
      return NextResponse.json({ error: 'Widget not available on this plan' }, { status: 403, headers: CORS })
    }

    // Save as lead
    const { data: lead, error } = await supabase
      .from('widget_leads')
      .insert({
        company_id,
        category_name,
        brand_name: brand_name || '',
        model_name: model_name || '',
        condition: condition || '',
        market_price: market_price || 0,
        buy_price: buy_price || 0,
        sell_price: sell_price || 0,
        profit: profit || 0,
        profitability: profitability || 0,
        status: status || 'not_evaluated',
        field_values: field_values || {},
        completeness_values: completeness_values || [],
        explanation: explanation || [],
        client_name: client_name || '',
        client_phone: client_phone || '',
        messenger: messenger || '',
        lead_status: 'new',
      })
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })

    return NextResponse.json({ success: true, id: lead?.id }, { headers: CORS })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
