import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, password, role, name } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    if (password && password.length >= 6) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const updates: any = {}
    if (role) updates.role = role
    if (name) updates.name = name
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from('users').update(updates).eq('id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
