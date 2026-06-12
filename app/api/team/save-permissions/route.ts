import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyOwnerOrAdmin } from '@/lib/api-auth'

export async function POST(request: Request) {
  try {
    const caller = await verifyOwnerOrAdmin(request)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { user_id, company_id, permissions } = await request.json()
    if (!user_id || !company_id || !permissions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify caller owns this company
    if (caller.companyId !== company_id) {
      return NextResponse.json({ error: 'Forbidden: cannot modify other companies' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate permissions object - only allow known boolean fields
    const allowedKeys = ['see_dashboard','see_history_own','see_history_all','see_statistics','see_team','can_edit_rules','can_manage_categories']
    const payload: any = { user_id, company_id }
    for (const key of allowedKeys) {
      if (key in permissions) payload[key] = Boolean(permissions[key])
    }

    const { data: existing } = await supabaseAdmin.from('user_permissions').select('id').eq('user_id', user_id).maybeSingle()

    let error
    if (existing) {
      const { error: e } = await supabaseAdmin.from('user_permissions').update(payload).eq('user_id', user_id)
      error = e
    } else {
      const { error: e } = await supabaseAdmin.from('user_permissions').insert(payload)
      error = e
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
