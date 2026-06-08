import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't need auth
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/callback', '/auth/reset', '/invite']

// Routes only for owner/admin
const OWNER_ADMIN_PATHS = ['/categories', '/rules', '/blocked', '/team', '/pricing']
// Routes only for owner
const OWNER_ONLY_PATHS = ['/pricing']

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

  // Admin panel — handles own auth
  if (path.startsWith('/admin')) {
    return supabaseResponse
  }

  // Public paths — always accessible
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith('/auth/'))) {
    return supabaseResponse
  }

  // Not logged in — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Logged in — check role for restricted pages
  if (OWNER_ADMIN_PATHS.some(p => path.startsWith(p))) {
    // Get user role from DB
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userRecord?.role || 'manager'

    // Pricing — owner only
    if (path.startsWith('/pricing') && role !== 'owner') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Categories, rules, blocked, team — owner or admin only
    const ownerAdminRoutes = ['/categories', '/rules', '/blocked', '/team']
    if (ownerAdminRoutes.some(r => path.startsWith(r)) && !['owner', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
