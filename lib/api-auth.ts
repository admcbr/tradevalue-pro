import { createClient } from '@supabase/supabase-js'

// Admin email from environment — never hardcode in source
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

// Verify request comes from authenticated owner/admin using Authorization header
export async function verifyOwnerOrAdmin(request: Request): Promise<{ userId: string; role: string; companyId: string } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Verify JWT token
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  // Get role from DB using service role to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: userRecord } = await supabaseAdmin
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) return null

  // Must be owner, admin, or the site admin
  const allowedRoles = ['owner', 'admin']
  if (!allowedRoles.includes(userRecord.role) && user.email !== ADMIN_EMAIL) return null

  return { userId: user.id, role: userRecord.role, companyId: userRecord.company_id }
}

export async function verifyAdmin(request: Request): Promise<boolean> {
  if (!ADMIN_EMAIL) return false

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.split(' ')[1]
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await supabase.auth.getUser(token)

  return user?.email === ADMIN_EMAIL
}
