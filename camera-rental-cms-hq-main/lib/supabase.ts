import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL hoặc Anon Key đang bị thiếu trong file .env.local')
}

// Dùng createBrowserClient để tự động đồng bộ session vào Cookie,
// giúp middleware.ts và API Routes có thể đọc được session.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
