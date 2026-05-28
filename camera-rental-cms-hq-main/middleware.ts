import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    const isLoginPage = req.nextUrl.pathname.startsWith('/admin/hungcut')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

    // Nếu vào trang admin mà chưa có session -> Đá về login (trừ khi đang ở trang login)
    if (isAdminPage && !isLoginPage && !session) {
      return NextResponse.redirect(new URL('/admin/hungcut', req.url))
    }

    // Nếu đã đăng nhập mà lại vào trang login -> Đá vào dashboard
    if (isLoginPage && session) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  } catch (e) {
    console.error('Middleware error:', e)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
