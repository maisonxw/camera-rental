"use client"

import { useState, useEffect } from "react"
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
import { Plus, Trash2, Users, Mail, Lock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StaffMember {
  id: string
  email: string
  created_at: string
  role: string
}

export function StaffManagement() {
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const { toast } = useToast()

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Không thể tải danh sách nhân viên')
      const data = await res.json()
      setStaffList(data)
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !newPassword) return
    if (newPassword.length < 6) {
      toast({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", variant: "destructive" })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Tạo tài khoản thất bại')
      }
      toast({ title: "Thành công", description: `Đã tạo tài khoản nhân viên: ${newEmail}` })
      setNewEmail("")
      setNewPassword("")
      setIsAddDialogOpen(false)
      fetchStaff()
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStaff = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${email}" không? Hành động này không thể hoàn tác.`)) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Xóa tài khoản thất bại')
      }
      toast({ title: "Thành công", description: `Đã xóa tài khoản: ${email}` })
      fetchStaff()
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              Quản lý Nhân viên
            </CardTitle>
            <CardDescription className="mt-1">
              Tạo và quản lý tài khoản nhân viên (Staff). Nhân viên có thể xem sản phẩm và xử lý đơn hàng.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo tài khoản nhân viên mới</DialogTitle>
                <DialogDescription>
                  Nhân viên sẽ có thể đăng nhập và xử lý đơn hàng nhưng không thể thay đổi dữ liệu sản phẩm.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="nhanvien@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mật khẩu
                  </Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Đang tải danh sách nhân viên...</p>
            </div>
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Users className="h-12 w-12 opacity-30" />
            <p className="font-medium">Chưa có nhân viên nào</p>
            <p className="text-sm">Bấm "Thêm nhân viên" để tạo tài khoản nhân viên đầu tiên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>Nhân viên có thể xem sản phẩm và xử lý đơn hàng nhưng không thể Thêm/Sửa/Xóa sản phẩm hoặc vào tab Cài đặt.</p>
            </div>
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 rounded-2xl glass border border-white/20 transition-all hover:glass-strong"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {staff.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{staff.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Tạo lúc: {new Date(staff.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Staff
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDeleteStaff(staff.id, staff.email || '')}
                    disabled={deletingId === staff.id}
                  >
                    {deletingId === staff.id ? (
                      <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
