"use client"

import React, { useState, useEffect } from "react"
import { useStoreConfig, StoreConfig } from "@/lib/store-config-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save, Plus, Trash2, Wand2, Store, Sparkles, CalendarCheck, Settings2, BookOpen } from "lucide-react"

const BUSINESS_PRESETS: Record<string, Partial<StoreConfig>> = {
  camera: {
    item_name_singular: "máy ảnh",
    item_name_plural: "máy ảnh",
    item_category_label: "Loại máy",
    categories: ["DSLR", "Mirrorless", "Film Camera", "Action Camera", "Instant Camera"],
    item_filter_label: "Chọn Model",
    price_unit_hourly: "Theo Giờ",
    price_unit_daily: "Cả Ngày",
    booking_title: "Đặt thuê máy ảnh",
    booking_subtitle: "Chọn thời gian thuê và máy ảnh phù hợp với nhu cầu của bạn",
    select_item_label: "Chọn máy ảnh",
    select_item_button: "Chọn thuê máy này",
    admin_title: "Camera Rental CMS",
    manage_items_title: 'Quản lý máy ảnh',
    manage_items_subtitle: 'Quản lý kho máy ảnh và thiết bị',
    add_item_button: 'Thêm máy ảnh',
  },
  hotel: {
    item_name_singular: "phòng",
    item_name_plural: "phòng",
    item_category_label: "Hạng phòng",
    categories: ["Standard", "Deluxe", "Suite"],
    item_filter_label: "Chọn hạng",
    price_unit_hourly: "Theo giờ",
    price_unit_daily: "Qua đêm",
    booking_title: "Đặt phòng",
    booking_subtitle: "Chọn thời gian và phòng phù hợp với nhu cầu của bạn",
    select_item_label: "Chọn phòng",
    select_item_button: "Đặt phòng này",
    admin_title: "Hotel / Homestay CMS",
    manage_items_title: 'Quản lý phòng',
    manage_items_subtitle: 'Quản lý kho phòng và dịch vụ',
    add_item_button: 'Thêm phòng',
  },
  dress: {
    item_name_singular: "trang phục",
    item_name_plural: "trang phục",
    item_category_label: "Loại váy",
    categories: ["Cô dâu", "Phù dâu", "Trang phục lễ hội"],
    item_filter_label: "Chọn loại",
    price_unit_hourly: "Theo giờ",
    price_unit_daily: "Theo ngày",
    booking_title: "Đặt thuê trang phục",
    booking_subtitle: "Chọn thời gian thuê và trang phục phù hợp",
    select_item_label: "Chọn trang phục",
    select_item_button: "Chọn thuê trang phục này",
    admin_title: "Dress Rental CMS",
    manage_items_title: 'Quản lý trang phục',
    manage_items_subtitle: 'Quản lý kho trang phục và phụ kiện',
    add_item_button: 'Thêm trang phục',
  },
  car: {
    item_name_singular: "xe",
    item_name_plural: "xe",
    item_category_label: "Hạng xe",
    categories: ["Xe số", "Xe tự động", "Xe sang"],
    item_filter_label: "Chọn hạng xe",
    price_unit_hourly: "Theo giờ",
    price_unit_daily: "Theo ngày",
    booking_title: "Đặt thuê xe",
    booking_subtitle: "Chọn thời gian thuê và xe phù hợp với nhu cầu",
    select_item_label: "Chọn xe",
    select_item_button: "Chọn thuê xe này",
    admin_title: "Car Rental CMS",
    manage_items_title: 'Quản lý xe',
    manage_items_subtitle: 'Quản lý kho xe cho thuê',
    add_item_button: 'Thêm xe',
  },
  equipment: {
    item_name_singular: "thiết bị",
    item_name_plural: "thiết bị",
    item_category_label: "Loại thiết bị",
    categories: ["Âm thanh", "Ánh sáng", "Sân khấu", "Ghế/Bàn"],
    item_filter_label: "Chọn loại",
    price_unit_hourly: "Theo giờ",
    price_unit_daily: "Theo ngày",
    booking_title: "Đặt thuê thiết bị",
    booking_subtitle: "Chọn thời gian và thiết bị phù hợp với sự kiện của bạn",
    select_item_label: "Chọn thiết bị",
    select_item_button: "Chọn thuê thiết bị này",
    admin_title: "Equipment Rental CMS",
    manage_items_title: 'Quản lý thiết bị',
    manage_items_subtitle: 'Quản lý kho thiết bị sự kiện',
    add_item_button: 'Thêm thiết bị',
  },
  custom: {
    item_name_singular: "sản phẩm",
    item_name_plural: "sản phẩm",
    item_category_label: "Danh mục",
    categories: ["Chung"],
    item_filter_label: "Chọn loại",
    price_unit_hourly: "Theo giờ",
    price_unit_daily: "Theo ngày",
    booking_title: "Đặt thuê",
    booking_subtitle: "Chọn thời gian và sản phẩm phù hợp",
    select_item_label: "Chọn sản phẩm",
    select_item_button: "Chọn thuê sản phẩm này",
    admin_title: "Rental CMS",
    manage_items_title: 'Quản lý sản phẩm',
    manage_items_subtitle: 'Quản lý kho sản phẩm',
    add_item_button: 'Thêm sản phẩm',
  },
}

export function StoreCustomization() {
  const { config, reloadConfig } = useStoreConfig()
  const { toast } = useToast()

  const [formData, setFormData] = useState<StoreConfig | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config && config.id !== "") {
      setFormData(config)
    }
  }, [config])

  if (!formData) return <div>Đang tải cấu hình...</div>

  const handleChange = (key: keyof StoreConfig, value: any) => {
    if (key === "business_type") {
      const preset = BUSINESS_PRESETS[value as string]
      setFormData(prev => prev ? {
        ...prev,
        [key]: value,
        ...(preset || {}),
      } : prev)
    } else {
      setFormData(prev => prev ? { ...prev, [key]: value } : prev)
    }
  }

  const handleCategoryChange = (index: number, value: string) => {
    setFormData(prev => {
      if (!prev) return prev
      const cats = [...prev.categories]
      cats[index] = value
      return { ...prev, categories: cats }
    })
  }

  const handleCategoryAdd = () => {
    setFormData(prev => prev ? { ...prev, categories: [...prev.categories, ""] } : prev)
  }

  const handleCategoryRemove = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev
      const cats = prev.categories.filter((_, i) => i !== index)
      return { ...prev, categories: cats }
    })
  }

  const handleFeatureToggle = (key: keyof StoreConfig["features"]) => {
    setFormData(prev => prev ? {
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    } : prev)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("store_config")
        .update(formData)
        .eq("id", formData.id)

      if (error) throw error

      toast({ title: "Thành công", description: "Cấu hình cửa hàng đã được lưu." })
      reloadConfig()
    } catch (err) {
      console.error("Save config error:", err)
      toast({ title: "Lỗi", description: "Không thể lưu cấu hình.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDepositAdd = () => {
    setFormData(prev => prev ? {
      ...prev,
      deposit_methods: [...prev.deposit_methods, { value: `method-${Date.now()}`, label: "" }]
    } : prev)
  }

  const handleDepositChange = (index: number, label: string) => {
    setFormData(prev => {
      if (!prev) return prev
      const newMethods = [...prev.deposit_methods]
      newMethods[index].label = label
      return { ...prev, deposit_methods: newMethods }
    })
  }

  const handleDepositRemove = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev
      const newMethods = prev.deposit_methods.filter((_, i) => i !== index)
      return { ...prev, deposit_methods: newMethods }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cấu hình cửa hàng</h2>
          <p className="text-muted-foreground">Tùy chỉnh nội dung cho nền tảng cho thuê của bạn</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto gap-1 p-1">
          <TabsTrigger value="store" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md rounded-lg">
            <Store className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Cửa hàng</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md rounded-lg">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md rounded-lg">
            <CalendarCheck className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Booking</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md rounded-lg">
            <Settings2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Tính năng</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md rounded-lg">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Nội dung</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Cửa hàng ── */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Thông tin cửa hàng</CardTitle>
              <CardDescription>Cài đặt cơ bản về định danh thương hiệu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên cửa hàng</Label>
                  <Input
                    value={formData.store_name}
                    onChange={e => handleChange("store_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại liên hệ</Label>
                  <Input
                    value={formData.store_phone}
                    onChange={e => handleChange("store_phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Loại hình kinh doanh</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={v => handleChange("business_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camera">📷 Máy ảnh / Thiết bị quay phim</SelectItem>
                    <SelectItem value="hotel">🏨 Khách sạn / Homestay</SelectItem>
                    <SelectItem value="dress">👗 Váy cưới / Trang phục</SelectItem>
                    <SelectItem value="car">🚗 Cho thuê xe</SelectItem>
                    <SelectItem value="equipment">🔧 Thiết bị sự kiện</SelectItem>
                    <SelectItem value="custom">✏️ Tùy chỉnh khác</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wand2 className="h-3 w-3" />
                  Khi đổi loại hình, các nhãn ở tab <strong>Booking</strong> sẽ tự động điền theo preset phù hợp.
                </p>
              </div>

              {/* Quản lý kho: categories editable and synced with presets */}
              <div className="space-y-2">
                <Label>Quản lý kho</Label>
                <p className="text-xs text-muted-foreground">Danh sách danh mục/loại hàng trong kho. sẽ tự đồng bộ khi đổi "Loại hình kinh doanh".</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.categories.map((cat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={cat} onChange={e => handleCategoryChange(idx, e.target.value)} />
                      <Button variant="outline" size="icon" onClick={() => handleCategoryRemove(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-2" onClick={handleCategoryAdd}>
                  <Plus className="h-4 w-4" /> Thêm danh mục
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên sản phẩm (số ít) – vd: máy ảnh, phòng</Label>
                  <Input
                    value={formData.item_name_singular}
                    onChange={e => handleChange("item_name_singular", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên sản phẩm (số nhiều)</Label>
                  <Input
                    value={formData.item_name_plural}
                    onChange={e => handleChange("item_name_plural", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tagline cửa hàng</Label>
                <Input
                  value={formData.store_tagline}
                  onChange={e => handleChange("store_tagline", e.target.value)}
                  placeholder="Dịch vụ cho thuê chuyên nghiệp"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={formData.facebook_url}
                    onChange={e => handleChange("facebook_url", e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={formData.instagram_url}
                    onChange={e => handleChange("instagram_url", e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>TikTok URL</Label>
                  <Input
                    value={formData.tiktok_url}
                    onChange={e => handleChange("tiktok_url", e.target.value)}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Hero ── */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Trang chủ (Hero Section)</CardTitle>
              <CardDescription>Nội dung hiển thị ở phần đầu trang booking khách hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badge nhỏ trên cùng</Label>
                <Input
                  value={formData.hero_badge}
                  onChange={e => handleChange("hero_badge", e.target.value)}
                  placeholder="vd: Chụp ảnh đẹp, thuê máy chuyên nghiệp"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiêu đề chính (Hero Title)</Label>
                  <Input
                    value={formData.hero_title}
                    onChange={e => handleChange("hero_title", e.target.value)}
                    placeholder="vd: Ghi lại khoảnh khắc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề phụ (Hero Subtitle)</Label>
                  <Input
                    value={formData.hero_subtitle}
                    onChange={e => handleChange("hero_subtitle", e.target.value)}
                    placeholder="vd: của riêng bạn"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mô tả Hero</Label>
                <Textarea
                  value={formData.hero_description}
                  onChange={e => handleChange("hero_description", e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn về dịch vụ của bạn..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text nút CTA chính</Label>
                  <Input
                    value={formData.cta_button_text}
                    onChange={e => handleChange("cta_button_text", e.target.value)}
                    placeholder="vd: Đặt thuê ngay"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề trang Admin</Label>
                  <Input
                    value={formData.admin_title}
                    onChange={e => handleChange("admin_title", e.target.value)}
                    placeholder="vd: Camera Rental CMS"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Booking ── */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5" /> Nhãn trang đặt thuê</CardTitle>
              <CardDescription>Tất cả các text hiển thị trong luồng đặt thuê của khách hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Nhóm: Section đặt thuê */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Section Đặt Thuê</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề</Label>
                    <Input
                      value={formData.booking_title}
                      onChange={e => handleChange("booking_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phụ đề</Label>
                    <Input
                      value={formData.booking_subtitle}
                      onChange={e => handleChange("booking_subtitle", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm: Nhãn sản phẩm */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Nhãn Chọn Sản Phẩm</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nhãn bước "Chọn sản phẩm"</Label>
                    <Input
                      value={formData.select_item_label}
                      onChange={e => handleChange("select_item_label", e.target.value)}
                      placeholder="vd: Chọn máy ảnh"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text nút chọn sản phẩm</Label>
                    <Input
                      value={formData.select_item_button}
                      onChange={e => handleChange("select_item_button", e.target.value)}
                      placeholder="vd: Chọn thuê máy này"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nhãn danh mục – vd: "Loại máy", "Hạng phòng"</Label>
                    <Input
                      value={formData.item_category_label}
                      onChange={e => handleChange("item_category_label", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nhãn bộ lọc – vd: "Chọn Model", "Chọn hạng"</Label>
                    <Input
                      value={formData.item_filter_label}
                      onChange={e => handleChange("item_filter_label", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm: Nhãn giá */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Nhãn Giá</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nhãn giá theo giờ</Label>
                    <Input
                      value={formData.price_unit_hourly}
                      onChange={e => handleChange("price_unit_hourly", e.target.value)}
                      placeholder="vd: Theo Giờ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nhãn giá theo ngày</Label>
                    <Input
                      value={formData.price_unit_daily}
                      onChange={e => handleChange("price_unit_daily", e.target.value)}
                      placeholder="vd: Cả Ngày"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm: Phương thức đặt cọc */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Phương Thức Đặt Cọc</p>
                <div className="space-y-2">
                  {formData.deposit_methods.map((method, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={method.label}
                        onChange={e => handleDepositChange(index, e.target.value)}
                        placeholder="Nhập phương thức cọc..."
                      />
                      <Button variant="outline" size="icon" onClick={() => handleDepositRemove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2" onClick={handleDepositAdd}>
                    <Plus className="h-4 w-4" /> Thêm phương thức
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Tính năng ── */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Tính năng & Chế độ thuê</CardTitle>
              <CardDescription>Bật/tắt các tính năng và hình thức cho thuê</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "hourly_booking" as const, label: "Thuê theo giờ", desc: "Cho phép khách chọn thuê theo số giờ." },
                { key: "daily_booking" as const, label: "Thuê theo ngày", desc: "Cho phép khách chọn thuê nguyên ngày / nhiều ngày." },
                { key: "gallery" as const, label: "Gallery ảnh", desc: "Hiển thị section gallery từ Instagram / Facebook." },
                { key: "story" as const, label: "Câu chuyện cửa hàng", desc: "Hiển thị section \"Câu chuyện của chúng tôi\"." },
                { key: "testimonials" as const, label: "Đánh giá khách hàng", desc: "Hiển thị section Testimonials." },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">{label}</Label>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <Switch
                    checked={formData.features[key]}
                    onCheckedChange={() => handleFeatureToggle(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Nội dung ── */}
        <TabsContent value="content">
          <div className="space-y-6">
            {/* Câu chuyện */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Câu chuyện cửa hàng</CardTitle>
                <CardDescription>Nội dung hiển thị trong section "Câu chuyện của chúng tôi"</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề phần câu chuyện</Label>
                  <Input
                    value={formData.story_title}
                    onChange={e => handleChange("story_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nội dung câu chuyện</Label>
                  <Textarea
                    value={formData.story_content}
                    onChange={e => handleChange("story_content", e.target.value)}
                    rows={8}
                    placeholder="Kể câu chuyện về thương hiệu của bạn..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá khách hàng (Testimonials)</CardTitle>
                <CardDescription>Các đánh giá hiển thị trên trang chủ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.testimonials.map((t, i) => (
                  <div key={i} className="p-4 border rounded-xl space-y-3 bg-muted/10 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => setFormData(prev => prev ? {
                        ...prev,
                        testimonials: prev.testimonials.filter((_, idx) => idx !== i)
                      } : prev)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Tên khách hàng</Label>
                        <Input
                          value={t.name}
                          onChange={e => {
                            const updated = [...formData.testimonials]
                            updated[i] = { ...updated[i], name: e.target.value }
                            handleChange("testimonials", updated)
                          }}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Vai trò / Nghề nghiệp</Label>
                        <Input
                          value={t.role}
                          onChange={e => {
                            const updated = [...formData.testimonials]
                            updated[i] = { ...updated[i], role: e.target.value }
                            handleChange("testimonials", updated)
                          }}
                          placeholder="Nhiếp ảnh gia"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nội dung đánh giá</Label>
                      <Textarea
                        value={t.content}
                        onChange={e => {
                          const updated = [...formData.testimonials]
                          updated[i] = { ...updated[i], content: e.target.value }
                          handleChange("testimonials", updated)
                        }}
                        rows={2}
                        placeholder="Dịch vụ rất tốt..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Số sao (1–5)</Label>
                      <Input
                        type="number" min={1} max={5}
                        value={t.rating}
                        onChange={e => {
                          const updated = [...formData.testimonials]
                          updated[i] = { ...updated[i], rating: Number(e.target.value) }
                          handleChange("testimonials", updated)
                        }}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setFormData(prev => prev ? {
                    ...prev,
                    testimonials: [...prev.testimonials, { name: "", role: "", content: "", rating: 5 }]
                  } : prev)}
                >
                  <Plus className="h-4 w-4" /> Thêm đánh giá
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
