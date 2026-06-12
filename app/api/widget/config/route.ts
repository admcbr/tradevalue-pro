import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400, headers: CORS })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, plan, plan_expires_at, widget_title, widget_color')
    .eq('id', companyId)
    .maybeSingle()

  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404, headers: CORS })

  // Widget only for pro/business
  const now = new Date()
  let plan = company.plan || 'starter'
  if (plan !== 'starter' && company.plan_expires_at && now > new Date(company.plan_expires_at)) {
    plan = 'starter'
  }
  if (plan === 'starter') {
    return NextResponse.json({ error: 'Widget requires Pro or Business plan' }, { status: 403, headers: CORS })
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at')

  const { data: rules } = await supabase
    .from('company_rules')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle()

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      widget_title: company.widget_title || `Оцінка техніки — ${company.name}`,
      widget_color: company.widget_color || '#6382FF',
    },
    categories: categories || [],
    rules: rules || {},
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
