import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase-middleware'

export async function middleware(req: NextRequest) {
  try {
    const { supabase, supabaseResponse } = updateSession(req)
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

    return supabaseResponse
  } catch (e) {
    console.error('Middleware error:', e)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
