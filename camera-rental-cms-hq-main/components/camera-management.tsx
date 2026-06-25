"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Package, X, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Camera {
  id: string
  name: string
  brand: string
  model: string
  category: string
  oneHoursRate: number
  fullDayRate: number
  quantity: number
  available: number
  description: string
  specifications: string
  status: "active" | "maintenance" | "retired"
  mainImage?: string
  images?: string[]
}

const CAMERA_CATEGORIES = [
  "DSLR",
  "Mirrorless",
  "Film Camera",
  "Action Camera",
  "Instant Camera",
  "Medium Format",
  "Large Format",
]

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11z"></path>
    <circle cx="10" cy="10" r="3"></circle>
    <line x1="14" y1="14" x2="21" y2="21"></line>
  </svg>
)

export function CameraManagement() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRates, setSelectedRates] = useState<Record<string, string>>({})
  
  // Gallery zoom state
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  const { toast } = useToast()

  // Load cameras from Supabase
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          // Map snake_case từ DB sang camelCase
          const mapped = data.map((c: any) => ({
            ...c,
            mainImage: c.main_image || "",
          }))
          setCameras(mapped as Camera[])
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Supabase:", error)
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải dữ liệu từ Supabase. Kiểm tra lại cấu hình .env.local",
          variant: "destructive"
        })
      }
    }
    loadCameras()
  }, [])

  const handleAddCamera = async (data: Omit<Camera, "id">) => {
    try {
      // Tách mainImage ra — chỉ gửi khi cột tồn tại trong DB
      const { mainImage, ...rest } = data as any
      const payload = mainImage ? { ...rest, main_image: mainImage } : rest

      const { error } = await supabase
        .from('items')
        .insert([payload])

      if (error) {
        console.error("Supabase error chi tiết:", JSON.stringify(error))
        throw error
      }

      toast({ title: "Thành công", description: "Đã thêm máy ảnh mới" })

      // Reload list
      const { data: updatedList } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (updatedList) {
        const mapped = updatedList.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setCameras(mapped as Camera[])
      }

      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Lỗi khi thêm:", error)
      toast({ title: "Lỗi", description: error?.message || "Không thể thêm máy ảnh", variant: "destructive" })
    }
  }

  const handleEditCamera = async (data: Omit<Camera, "id">) => {
    if (!editingCamera) return
    try {
      // Tách mainImage ra — map sang tên cột Supabase
      const { mainImage, ...rest } = data as any
      const payload = mainImage !== undefined ? { ...rest, main_image: mainImage } : rest

      const { error } = await supabase
        .from('items')
        .update(payload)
        .eq('id', editingCamera.id)

      if (error) {
        console.error("Supabase error chi tiết:", JSON.stringify(error))
        throw error
      }

      toast({ title: "Thành công", description: "Đã cập nhật thông tin" })

      // Refresh list
      const { data: updatedList } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (updatedList) {
        const mapped = updatedList.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setCameras(mapped as Camera[])
      }

      setEditingCamera(null)
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error)
      toast({ title: "Lỗi", description: error?.message || "Cập nhật thất bại", variant: "destructive" })
    }
  }

  const handleDeleteCamera = async (id: string) => {
    if (!confirm("Xóa máy ảnh này vĩnh viễn?")) return
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: "Thành công", description: "Đã xóa máy ảnh" })
      setCameras(cameras.filter(c => c.id !== id))
    } catch (error) {
      console.error("Lỗi khi xóa:", error)
      toast({ title: "Lỗi", description: "Xóa thất bại", variant: "destructive" })
    }
  }

  const fallbackSave = (data: Omit<Camera, "id">) => {
    const newCam = { ...data, id: Date.now().toString() }
    const updated = [...cameras, newCam]
    setCameras(updated)
    localStorage.setItem("cameras", JSON.stringify(updated))
    toast({ title: "Lưu tạm", description: "Đã lưu vào bộ nhớ cục bộ" })
    setIsAddDialogOpen(false)
  }

  const fallbackUpdate = (id: string, data: Omit<Camera, "id">) => {
    const updated = cameras.map(c => c.id === id ? { ...data, id } : c)
    setCameras(updated)
    localStorage.setItem("cameras", JSON.stringify(updated))
    toast({ title: "Lưu tạm", description: "Đã cập nhật cục bộ" })
    setEditingCamera(null)
  }

  const fallbackDelete = (id: string) => {
    const updated = cameras.filter(c => c.id !== id)
    setCameras(updated)
    localStorage.setItem("cameras", JSON.stringify(updated))
    toast({ title: "Lưu tạm", description: "Đã xóa cục bộ" })
  }

  const getRatePrice = (camera: Camera, type: string) => {
    switch (type) {
      case "fullDayRate": return camera.fullDayRate
      case "oneHoursRate": return camera.oneHoursRate || camera.fullDayRate
      default: return camera.fullDayRate
    }
  }

  const filtered = cameras.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý máy ảnh</h2>
          <p className="text-muted-foreground text-sm md:text-base">Quản lý kho máy ảnh và thiết bị</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" /> Thêm máy ảnh
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-lg p-0">
            <DialogHeader className="sticky top-0 bg-background p-6 border-b">
              <DialogTitle>Thêm máy ảnh mới</DialogTitle>
              <DialogDescription>Nhập thông tin chi tiết</DialogDescription>
            </DialogHeader>
            <div className="p-1">
              <CameraForm onSubmit={handleAddCamera} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and total */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Input
          placeholder="Tìm kiếm máy ảnh..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:flex-1"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          Tổng: {cameras.length} máy
        </div>
      </div>

      {/* Camera cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(camera => (
          <Card key={camera.id} className="relative flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CameraIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{camera.name}</CardTitle>
                    <CardDescription className="truncate">{camera.brand} {camera.model}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={camera.status === "active" ? "default" : "secondary"}
                  className="whitespace-nowrap"
                >
                  {camera.status === "active" ? "Hoạt động" : camera.status === "maintenance" ? "Bảo trì" : "Ngừng"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Loại máy ảnh */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Loại</Label>
                  <p className="font-medium truncate">{camera.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tình trạng</Label>
                  <p className="font-medium">{camera.available} sẵn có </p>
                </div>
              </div>


              {/* Giá thuê */}
              <div>
                <Label className="text-muted-foreground">Giá thuê</Label>
                <Select
                  value={selectedRates[camera.id] || "fullDayRate"}
                  onValueChange={v => setSelectedRates(p => ({ ...p, [camera.id]: v }))}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 w-full min-w-full">
                    <SelectItem value="oneHoursRate">Theo giờ</SelectItem>
                    <SelectItem value="fullDayRate">1 ngày</SelectItem>
                  </SelectContent>
                </Select>
                <p className="font-medium mt-1 text-primary">
                  {getRatePrice(camera, selectedRates[camera.id] || "fullDayRate").toLocaleString("vi-VN")}đ
                </p>
              </div>

              {/* Ảnh chính */}
              {camera.mainImage ? (
                <div
                  className="w-full aspect-video rounded-lg overflow-hidden cursor-zoom-in relative group"
                  onClick={() => {
                    const allImgs = [camera.mainImage!, ...(camera.images || [])]
                    setGalleryImages(allImgs)
                    setActiveImageIndex(0)
                    setShowGallery(true)
                  }}
                >
                  <img
                    src={camera.mainImage}
                    alt={camera.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">Ảnh chính</span>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Camera className="h-10 w-10 opacity-30" />
                </div>
              )}

              {/* Ảnh mẫu */}
              {camera.images && camera.images.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Ảnh mẫu ({camera.images.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {camera.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-zoom-in hover:scale-105 transition-transform"
                        onClick={() => {
                          const allImgs = camera.mainImage ? [camera.mainImage, ...(camera.images || [])] : (camera.images || [])
                          const offset = camera.mainImage ? 1 : 0
                          setGalleryImages(allImgs)
                          setActiveImageIndex(i + offset)
                          setShowGallery(true)
                        }}
                      />
                    ))}
                    {camera.images.length > 4 && (
                      <div
                        className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs cursor-zoom-in hover:bg-muted/80 transition-colors font-medium"
                        onClick={() => {
                          const allImgs = camera.mainImage ? [camera.mainImage, ...(camera.images || [])] : (camera.images || [])
                          setGalleryImages(allImgs)
                          setActiveImageIndex(5)
                          setShowGallery(true)
                        }}
                      >
                        +{camera.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {/* Dialog sửa máy ảnh */}
                <Dialog open={editingCamera?.id === camera.id} onOpenChange={o => !o && setEditingCamera(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCamera(camera)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Sửa
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-lg p-0">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 bg-background p-4 sm:p-5 md:p-6 border-b z-10">
                      <DialogTitle>Chỉnh sửa máy ảnh</DialogTitle>
                      <DialogDescription>Cập nhật thông tin</DialogDescription>
                    </DialogHeader>

                    {/* Form container */}
                    <div className="p-4 sm:p-5 md:p-6">
                      <CameraForm
                        camera={camera}
                        onSubmit={handleEditCamera}
                        isEditing
                      />
                    </div>
                  </DialogContent>
                </Dialog>


                {/* Xóa */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteCamera(camera.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy máy ảnh</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Không có kết quả phù hợp" : "Chưa có máy ảnh nào"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gallery Overlay */}
      {showGallery && galleryImages.length > 0 && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center select-none"
          onClick={() => setShowGallery(false)}
        >
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl transition shadow-lg z-50"
          >
            ✕
          </button>

          <div 
            className="relative w-full max-w-6xl h-full flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1)}
              className="absolute left-2 sm:left-4 md:left-10 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 hover:bg-white/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition shadow-2xl z-40"
              style={{ display: galleryImages.length > 1 ? 'flex' : 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-14 md:h-14"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            <img src={galleryImages[activeImageIndex]} alt="gallery" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg transition-all duration-300 shadow-2xl" />

            <button
              onClick={() => setActiveImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 sm:right-4 md:right-10 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 hover:bg-white/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition shadow-2xl z-40"
              style={{ display: galleryImages.length > 1 ? 'flex' : 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-14 md:h-14"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

interface CameraFormProps {
  camera?: Camera
  onSubmit: (data: Omit<Camera, "id">) => void
  isEditing?: boolean
}

function CameraForm({ camera, onSubmit, isEditing = false }: CameraFormProps) {
  const [formData, setFormData] = useState({
    name: camera?.name || "",
    brand: camera?.brand || "",
    model: camera?.model || "",
    category: camera?.category || "",
    fullDayRate: camera?.fullDayRate || 0,
    oneHoursRate: camera?.oneHoursRate || 0,
    quantity: camera?.quantity || 1,
    available: camera?.available || 1,
    description: camera?.description || "",
    specifications: camera?.specifications || "",
    status: camera?.status || "active",
    mainImage: camera?.mainImage || "",
    images: camera?.images || [],
  })

  // Main image
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>(camera?.mainImage || "")

  // Sample images
  const [sampleFiles, setSampleFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleMainImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImageFile(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  const clearMainImage = () => {
    setMainImageFile(null)
    setMainImagePreview("")
    setFormData(p => ({ ...p, mainImage: "" }))
  }

  const handleSampleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    setSampleFiles(prev => [...prev, ...newFiles])
  }

  const removeSavedSampleImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const removeNewSampleFile = (index: number) => {
    setSampleFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let mainImageUrl = formData.mainImage
    let imageUrls = formData.images || []

    // Upload main image
    if (mainImageFile) {
      const fd = new FormData()
      fd.append("files", mainImageFile)
      fd.append("cameraName", formData.name)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (res.ok) {
          const data = await res.json()
          mainImageUrl = data.urls[0] || mainImageUrl
        }
      } catch (err) {
        console.error("Upload ảnh chính lỗi:", err)
      }
    }

    // Upload sample images
    if (sampleFiles.length > 0) {
      const fd = new FormData()
      sampleFiles.forEach(f => fd.append("files", f))
      fd.append("cameraName", formData.name)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (res.ok) {
          const data = await res.json()
          imageUrls = [...imageUrls, ...data.urls]
        }
      } catch (err) {
        console.error("Upload ảnh mẫu lỗi:", err)
      }
    }

    onSubmit({ ...formData, mainImage: mainImageUrl, images: imageUrls })
    setUploading(false)
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 max-w-2xl sm:max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Grid thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên máy ảnh */}
          <div>
            <Label>Tên máy ảnh *</Label>
            <Input
              className="w-full"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          {/* Thương hiệu */}
          <div>
            <Label>Thương hiệu *</Label>
            <Input
              className="w-full"
              value={formData.brand}
              onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
              required
            />
          </div>

          {/* Model */}
          <div>
            <Label>Model *</Label>
            <Input
              className="w-full"
              value={formData.model}
              onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
              required
            />
          </div>

          {/* Loại máy ảnh */}
          <div>
            <Label>Loại máy ảnh</Label>
            <Select
              value={formData.category}
              onValueChange={v => setFormData(p => ({ ...p, category: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 max-h-[60vh] overflow-y-auto">
                {CAMERA_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Giá thuê */}
        <div className="space-y-3">
          <Label>Giá thuê (VNĐ)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "oneHoursRate", label: "Theo giờ" },
              { key: "fullDayRate", label: "1 ngày" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  className="w-full"
                  value={formData[key as keyof typeof formData]}
                  onChange={e => setFormData(p => ({ ...p, [key]: +e.target.value || 0 }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== Ảnh chính ===== */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ảnh chính</Label>
          <p className="text-xs text-muted-foreground">Hiển thị nổi bật trên card sản phẩm</p>

          {mainImagePreview ? (
            <div className="relative group w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/30">
              <img src={mainImagePreview} alt="Ảnh chính" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={clearMainImage}
                  className="opacity-0 group-hover:opacity-100 transition bg-red-500 text-white rounded-full p-2 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
                <label className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-gray-800 rounded-full p-2 shadow-lg cursor-pointer">
                  <Edit className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleMainImageFile} className="hidden" />
                </label>
              </div>
              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">Ảnh chính</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors bg-muted/20 hover:bg-primary/5">
              <Camera className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <span className="text-sm text-muted-foreground">Click để chọn ảnh chính</span>
              <span className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleMainImageFile} className="hidden" />
            </label>
          )}
        </div>

        {/* ===== Ảnh mẫu ===== */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ảnh mẫu</Label>
          <p className="text-xs text-muted-foreground">Thêm nhiều ảnh để khách hàng xem chi tiết sản phẩm</p>

          {/* Existing saved sample images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {formData.images.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSavedSampleImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New files preview */}
          {sampleFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {sampleFiles.map((f, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square ring-2 ring-primary/40">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[9px] text-center py-0.5">Mới</div>
                  <button
                    type="button"
                    onClick={() => removeNewSampleFile(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors bg-muted/10 hover:bg-primary/5 w-fit">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Thêm ảnh mẫu</span>
            <input type="file" accept="image/*" multiple onChange={handleSampleFiles} className="hidden" />
          </label>
        </div>

        {/* Mô tả & thông số kỹ thuật */}
        <div>
          <Label>Mô tả</Label>
          <Textarea
            className="w-full"
            value={formData.description}
            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div>
          <Label>Thông số kỹ thuật</Label>
          <Textarea
            className="w-full"
            value={formData.specifications}
            onChange={e => setFormData(p => ({ ...p, specifications: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Trạng thái */}
        <div>
          <Label>Trạng thái</Label>
          <Select
            value={formData.status}
            onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 max-h-[60vh] overflow-y-auto">
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="retired">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Footer button */}
        <DialogFooter>
          <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
            {uploading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm máy ảnh"}
          </Button>
        </DialogFooter>

      </form>
    </div>
  );

}

