import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// Admin client sử dụng Service Role Key (chỉ dùng ở server-side)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/users - Lấy danh sách nhân viên (chỉ Owner)
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = session.user.user_metadata?.role || 'staff'
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = getAdminClient()
    const { data, error } = await adminClient.auth.admin.listUsers()
    if (error) throw error

    // Chỉ trả về danh sách staff (không hiện chính mình)
    const staffList = data.users
      .filter(u => u.user_metadata?.role === 'staff')
      .map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        role: u.user_metadata?.role || 'staff',
      }))

    return NextResponse.json(staffList)
  } catch (error: any) {
    console.error('Error listing users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/users - Tạo tài khoản Staff mới (chỉ Owner)
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = session.user.user_metadata?.role || 'staff'
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Only Owner can create staff accounts' }, { status: 403 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const adminClient = getAdminClient()
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Tự động xác nhận email, không cần người dùng click link
      user_metadata: { role: 'staff' },
    })

    if (error) throw error

    return NextResponse.json(
      { id: data.user.id, email: data.user.email, role: 'staff' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
