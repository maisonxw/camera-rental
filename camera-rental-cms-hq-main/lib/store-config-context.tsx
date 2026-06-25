"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface StoreConfig {
  id: string
  store_name: string
  store_tagline: string
  store_logo_url: string
  store_phone: string
  store_email: string
  
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  
  business_type: string
  
  item_name_singular: string
  item_name_plural: string
  item_category_label: string
  item_filter_label: string
  price_unit_hourly: string
  price_unit_daily: string
  booking_title: string
  booking_subtitle: string
  select_item_label: string
  select_item_button: string
  hero_title: string
  hero_subtitle: string
  hero_description: string
  hero_badge: string
  cta_button_text: string
  
  admin_title: string
  manage_items_title: string
  manage_items_subtitle: string
  add_item_button: string
  dashboard_subtitle: string
  
  categories: string[]
  
  deposit_methods: { value: string; label: string }[]
  
  features: {
    gallery: boolean
    testimonials: boolean
    story: boolean
    hourly_booking: boolean
    daily_booking: boolean
  }
  
  testimonials: {
    name: string
    role: string
    content: string
    rating: number
  }[]
  
  story_title: string
  story_content: string
  
  highlights: {
    icon: string
    title: string
    desc: string
  }[]
  
  primary_color: string
  secondary_color: string
  
  success_redirect_url: string
  success_redirect_app: string
}

const defaultConfig: StoreConfig = {
  id: '',
  store_name: 'Camera Rental demo',
  store_tagline: 'Dịch vụ cho thuê chuyên nghiệp',
  store_logo_url: '',
  store_phone: '0917435128',
  store_email: '',
  facebook_url: 'https://web.facebook.com/hungcut.04/',
  instagram_url: 'https://www.instagram.com/chupchoet.digicam',
  tiktok_url: 'https://www.tiktok.com/@chupchoet.digicam',
  business_type: 'camera',
  item_name_singular: 'máy ảnh',
  item_name_plural: 'máy ảnh',
  item_category_label: 'Loại máy',
  item_filter_label: 'Chọn Model',
  price_unit_hourly: 'Theo Giờ',
  price_unit_daily: 'Cả Ngày',
  booking_title: 'Đặt thuê máy ảnh',
  booking_subtitle: 'Chọn thời gian thuê và máy ảnh phù hợp với nhu cầu của bạn',
  select_item_label: 'Chọn máy ảnh',
  select_item_button: 'Chọn thuê máy này',
  hero_title: 'Ghi lại khoảnh khắc',
  hero_subtitle: 'của riêng bạn',
  hero_description: 'Ghi lại khoảnh khắc theo cách của bạn! Trải nghiệm dịch vụ thuê máy ảnh chuyên nghiệp, dành cho mọi ai yêu nhiếp ảnh và muốn kể câu chuyện của chính mình qua ống kính.',
  hero_badge: 'Chụp ảnh đẹp, thuê máy chuyên nghiệp',
  cta_button_text: 'Đặt thuê ngay',
  admin_title: 'Camera Rental CMS',
  manage_items_title: 'Quản lý máy ảnh',
  manage_items_subtitle: 'Quản lý kho máy ảnh và thiết bị',
  add_item_button: 'Thêm máy ảnh',
  dashboard_subtitle: 'Tổng quan về các đơn đặt thuê máy ảnh',
  categories: ['DSLR', 'Mirrorless', 'Film Camera', 'Action Camera', 'Instant Camera'],
  deposit_methods: [
    { value: 'cccd-taisan', label: 'Cọc CCCD + tài sản tương đương (Laptop, Macbook, xe máy,...)' },
    { value: 'cccd-80', label: 'Cọc CCCD + 80% giá trị máy' },
    { value: '100', label: 'Cọc 100% giá trị máy' }
  ],
  features: {
    gallery: true,
    testimonials: true,
    story: true,
    hourly_booking: true,
    daily_booking: true
  },
  testimonials: [],
  story_title: 'Câu chuyện của chúng tôi',
  story_content: 'Từ niềm đam mê với nhiếp ảnh...',
  highlights: [],
  primary_color: '#ec4899',
  secondary_color: '#a855f7',
  success_redirect_url: 'https://www.instagram.com/chupchoet.digicam/',
  success_redirect_app: 'instagram://user?username=chupchoet.digicam'
}

const StoreConfigContext = createContext<{ config: StoreConfig; loading: boolean; reloadConfig: () => void }>({
  config: defaultConfig,
  loading: true,
  reloadConfig: () => {}
})

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from('store_config').select('*').limit(1).single()
      if (data) {
            const merged = { ...defaultConfig, ...data }

            // Auto-adjust labels based on business type for quick CMS switching
            const business = merged.business_type || merged.business_type === '' ? merged.business_type : defaultConfig.business_type
            const labelMap: Record<string, Partial<StoreConfig>> = {
              camera: {
                item_name_singular: 'máy ảnh',
                item_name_plural: 'máy ảnh',
                item_category_label: 'Loại máy',
                item_filter_label: 'Chọn Model',
                manage_items_title: 'Quản lý máy ảnh',
                manage_items_subtitle: 'Quản lý kho máy ảnh và thiết bị',
                add_item_button: 'Thêm máy ảnh',
                dashboard_subtitle: 'Tổng quan về các đơn đặt thuê máy ảnh',
              },
              hotel: {
                item_name_singular: 'phòng',
                item_name_plural: 'phòng',
                item_category_label: 'Loại phòng',
                item_filter_label: 'Chọn phòng',
                manage_items_title: 'Quản lý phòng',
                manage_items_subtitle: 'Quản lý kho phòng và thiết bị',
                add_item_button: 'Thêm phòng',
                dashboard_subtitle: 'Tổng quan về các đơn đặt thuê phòng',
              },
              dress: {
                item_name_singular: 'trang phục',
                item_name_plural: 'trang phục',
                item_category_label: 'Loại trang phục',
                item_filter_label: 'Chọn trang phục',
                manage_items_title: 'Quản lý trang phục',
                manage_items_subtitle: 'Quản lý kho trang phục và phụ kiện',
                add_item_button: 'Thêm trang phục',
                dashboard_subtitle: 'Tổng quan về các đơn đặt thuê trang phục',
              }
            }

            const adjusted = { ...merged, ...(labelMap[business] || {}) }
            setConfig(adjusted)
      }
    } catch (e) {
      console.error('Failed to load store config', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  return (
    <StoreConfigContext.Provider value={{ config, loading, reloadConfig: loadConfig }}>
      {children}
    </StoreConfigContext.Provider>
  )
}

export function useStoreConfig() {
  return useContext(StoreConfigContext)
}
