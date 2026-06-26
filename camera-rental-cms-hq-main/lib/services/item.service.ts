import { SupabaseClient } from '@supabase/supabase-js'

export const itemService = {
  async getAllItems(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data
  },

  async getItemById(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  },

  async createItem(supabase: SupabaseClient, payload: any) {
    const { data, error } = await supabase
      .from('items')
      .insert([payload])
      .select()
      
    if (error) throw error
    return data?.[0]
  },

  async updateItem(supabase: SupabaseClient, id: string, payload: any) {
    const { data, error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id)
      .select()
      
    if (error) throw error
    return data?.[0]
  },

  async deleteItem(supabase: SupabaseClient, id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    return true
  }
}
