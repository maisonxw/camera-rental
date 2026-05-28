"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, ImageIcon, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface GalleryImage {
  id: string
  url: string
  name: string
  uploaded_at: string
}

export function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("uploaded_at", { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error("Error loading images:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ảnh",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`
        const filePath = `gallery/${fileName}`

        // 1. Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from("gallery")
          .getPublicUrl(fileName)

        // 3. Save metadata to PostgreSQL
        const { error: dbError } = await supabase
          .from("gallery")
          .insert({
            url: publicUrl,
            name: file.name,
          })

        if (dbError) throw dbError
      }

      toast({
        title: "Thành công",
        description: `Đã upload ${files.length} ảnh`,
      })

      loadImages()
    } catch (error: any) {
      console.error("Error uploading:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể upload ảnh",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm(`Xóa ảnh "${image.name}"?`)) return

    try {
      // 1. Delete from Storage
      const fileName = image.url.split("/").pop()
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("gallery")
          .remove([fileName])
        if (storageError) throw storageError
      }

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", image.id)

      if (dbError) throw dbError

      toast({
        title: "Đã xóa",
        description: "Ảnh đã được xóa khỏi gallery",
      })

      loadImages()
    } catch (error: any) {
      console.error("Error deleting:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa ảnh",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Gallery</h2>
          <p className="text-muted-foreground mt-1">Upload và quản lý ảnh hiển thị trên trang booking</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="upload-images" className="cursor-pointer">
            <div className="glass-strong hover:glass-card px-6 py-3 rounded-xl flex items-center gap-2 transition-all border-2 border-white/30">
              <Upload className="h-5 w-5" />
              <span className="font-medium">{uploading ? "Đang upload..." : "Upload ảnh"}</span>
            </div>
          </Label>
          <Input
            id="upload-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold">{images.length} ảnh trong gallery</span>
          </div>
          <a
            href="https://www.facebook.com/media/set?vanity=bbbtranslation&set=a.746067487801116"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Xem album Facebook
          </a>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có ảnh nào. Upload ảnh để hiển thị trên trang booking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <Card
                key={image.id}
                className="glass group overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all"
              >
                <div className="aspect-square relative">
                  <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(image)} className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{image.name}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
