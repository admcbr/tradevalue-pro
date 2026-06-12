import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyOwnerOrAdmin } from '@/lib/api-auth'

export async function POST(request: Request) {
  try {
    const caller = await verifyOwnerOrAdmin(request)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, password, role, name } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify target user is in caller's company
    const { data: targetUser } = await supabaseAdmin.from('users').select('company_id, role').eq('id', userId).maybeSingle()
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check company match (site admin can edit anyone)
    const reqToken = request.headers.get('Authorization')?.split(' ')[1] || ''
    const supabaseCheck = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user: callerUser } } = await supabaseCheck.auth.getUser(reqToken)

    if (callerUser?.email !== process.env.ADMIN_EMAIL || '' && targetUser.company_id !== caller.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
