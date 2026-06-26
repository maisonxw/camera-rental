import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { itemService } from '@/lib/services/item.service'

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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const item = await itemService.getItemById(supabase, params.id)
    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // RBAC: Chặn staff không được sửa sản phẩm
    const role = session.user.user_metadata?.role || 'staff'
    if (role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to edit items' }, { status: 403 })
    }

    const payload = await req.json()
    const updatedItem = await itemService.updateItem(supabase, params.id, payload)
    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // RBAC: Chặn staff không được xóa sản phẩm
    const role = session.user.user_metadata?.role || 'staff'
    if (role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete items' }, { status: 403 })
    }

    await itemService.deleteItem(supabase, params.id)
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
