import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/callback', '/auth/reset', '/invite', '/terms', '/payment']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Admin panel handles own auth
  if (path.startsWith('/admin')) return supabaseResponse

  // Public paths
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith('/auth/'))) return supabaseResponse

  // Not logged in
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

  // Pricing — owner only (no custom permission override)
  if (path.startsWith('/pricing')) {
    const { data: ur } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (ur?.role !== 'owner') return NextResponse.redirect(new URL('/dashboard', request.url))
    return supabaseResponse
  }

  // For settings pages — check role OR custom permissions
  const settingsRoutes: Record<string, string> = {
    '/categories': 'can_manage_categories',
    '/rules':      'can_edit_rules',
    '/blocked':    'can_edit_rules',
    '/team':       'see_team',
  }

  const matchedRoute = Object.keys(settingsRoutes).find(r => path.startsWith(r))
  if (matchedRoute) {
    const permKey = settingsRoutes[matchedRoute]
    const { data: ur } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = ur?.role || 'manager'

    // Owner and admin always have access
    if (['owner', 'admin'].includes(role)) return supabaseResponse

    // Check custom permission in user_permissions
    // Using service role URL to bypass any RLS issues
    const { data: perms, error: permsError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // If we got a DB error reading permissions — allow access (don't block)
    if (permsError) return supabaseResponse

    // If row exists and permission explicitly granted — allow
    if (perms && (perms as any)[permKey] === true) return supabaseResponse

    // If no permissions row yet — deny
    if (!perms) return NextResponse.redirect(new URL('/dashboard', request.url))

    // Permission exists but this specific permission is false
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
