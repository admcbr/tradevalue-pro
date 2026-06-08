import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, companyId, phone, address } = await request.json()

    if (!email || !password || !companyId) {
      return NextResponse.json({ error: 'email, password, companyId required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create user in auth.users with password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm email
      user_metadata: { name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create/update record in public.users with company_id
    const { error: userError } = await supabaseAdmin.from('users').upsert({
      id: authUser.user.id,
      email,
      name: name || email.split('@')[0],
      role: role || 'manager',
      company_id: companyId,
      phone: phone || '',
      address: address || '',
    })

    if (userError) {
      // Rollback - delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authUser.user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
