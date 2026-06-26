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
          try { cookieStore.set({ name, value, ...options }) } catch { }
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: '', ...options }) } catch { }
        },
      },
    }
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const items = await itemService.getAllItems(supabase)
    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await req.json()
    const newItem = await itemService.createItem(supabase, payload)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
