"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Calendar,
  Phone,
  Mail,
  Camera,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  cameraId: string
  cameraName: string
  startDate: string
  endDate: string
  startTime?: string | null
  endTime?: string | null
  totalDays: number
  dailyRate: number
  totalAmount: number
  status: "pending" | "confirmed" | "active" | "completed" | "overtime" | "cancelled"
  createdAt: string
  notes?: string
  adminNotes?: string | null
  depositMethod: string
  isOverdue?: boolean | null
}

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: Clock,
    nextStatus: "confirmed",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
    nextStatus: "active",
  },
  active: {
    label: "Đang thuê",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    icon: Package,
    nextStatus: "completed",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    icon: CheckCircle,
    nextStatus: null,
  },
  overtime: {
    label: "Quá hạn",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: Clock,
    nextStatus: null,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    icon: XCircle,
    nextStatus: null,
  },
} as const

export function OrderManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  const { toast } = useToast()

  const DEPOSIT_METHODS: Record<string, string> = {
    "cccd-taisan": "CCCD + tài sản tương đương (Laptop, Macbook, xe máy...)",
    "cccd-80": "CCCD + 80% giá trị máy",
    "100": "Cọc 100% giá trị máy",
  }

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Booking>>({})

  // --- realtime load bookings ---
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('createdAt', { ascending: false })

        if (error) throw error
        setBookings(data as Booking[])
        setLoading(false)
      } catch (err) {
        console.error("Lỗi tải bookings:", err)
        setLoading(false)
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        })
      }
    }

    loadBookings()

    const channel = supabase
      .channel('order-mgmt-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadBookings)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  const payload = {
    customerName: editForm.customerName,
    customerPhone: editForm.customerPhone,
    startDate: editForm.startDate,
    endDate: editForm.endDate,
    depositMethod: editForm.depositMethod,
    adminNotes: editForm.adminNotes ?? null,
  }


  // --- memoized filteredBookings (no duplicated state) ---
  const filteredBookings = useMemo(() => {
    let filtered = statusFilter === "all"
      ? bookings.filter(b => b.status !== "cancelled")
      : bookings


    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.cameraName.toLowerCase().includes(q) ||
          b.id.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return filtered
  }, [bookings, searchTerm, statusFilter])

  const updateCameraAvailability = async (cameraId: string, change: number) => {
    if (!cameraId) return
    try {
      const { data: cam, error: fetchError } = await supabase
        .from('cameras')
        .select('quantity, available')
        .eq('id', cameraId)
        .single()

      if (fetchError || !cam) return

      const quantity = Number(cam.quantity || 0)
      const available = Number(cam.available || 0)
      const newAvailable = Math.max(0, Math.min(quantity, available + change))

      await supabase
        .from('cameras')
        .update({ available: newAvailable })
        .eq('id', cameraId)
    } catch (err) {
      console.error("updateCameraAvailability error:", err)
    }
  }

  const updateBookingStatus = async (
    bookingId: string,
    status: Booking["status"],
    notes?: string | null
  ) => {
    try {
      const orig = bookings.find((b) => b.id === bookingId)
      if (!orig) return

      const payload: any = { status }
      payload.adminNotes = notes ?? (orig.adminNotes ?? null)

      // Cập nhật trạng thái đơn vào Supabase
      const { error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', bookingId)

      if (error) throw error

      // Tính lại available
      if (orig?.cameraId) {
        await recalcCameraAvailability(orig.cameraId)
      }

      // Fetch lại dữ liệu mới nhất
      const { data } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false })
      if (data) setBookings(data as Booking[])

      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái đơn #${bookingId} → ${STATUS_CONFIG[status].label}`,
      })
    } catch (err) {
      console.error("updateBookingStatus error:", err)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      })
    }
  }

  const recalcCameraAvailability = async (cameraId: string) => {
    try {
      const { data: allBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('cameraId', cameraId)
        .in('status', ['confirmed', 'active'])

      if (bookingsError) throw bookingsError

      const activeCount = allBookings?.length || 0

      const { data: cam, error: camError } = await supabase
        .from('cameras')
        .select('quantity')
        .eq('id', cameraId)
        .single()

      if (camError) throw camError

      const newAvailable = Math.max(0, (cam.quantity ?? 1) - activeCount)

      await supabase
        .from('cameras')
        .update({ available: newAvailable })
        .eq('id', cameraId)
    } catch (err) {
      console.error("recalc error:", err)
    }
  }

  // --- quick helper for clicking next status button ---
  const handleQuickStatusUpdate = async (booking: Booking, status: string) => {
    // ensure typing for status
    await updateBookingStatus(booking.id, status as Booking["status"])
  }

  // // --- delete booking (RTDB) ---
  // const deleteBooking = async (bookingId: string) => {
  //   try {
  //     // get booking to check camera & status
  //     const orig = bookings.find((b) => b.id === bookingId)
  //     await remove(ref(db, `bookings/${bookingId}`))

  //     // if booking was confirmed (reserved), return camera
  //     if (orig?.status === "confirmed" && orig.cameraId) {
  //       await updateCameraAvailability(orig.cameraId, +1)
  //     }

  //     toast({
  //       title: "Đã xóa",
  //       description: `Đã xóa đơn hàng #${bookingId}`,
  //     })
  //   } catch (err) {
  //     console.error("deleteBooking error:", err)
  //     toast({
  //       title: "Lỗi",
  //       description: "Không thể xóa đơn hàng",
  //       variant: "destructive",
  //     })
  //   }
  // }

  // --- handle confirm from status update dialog ---
  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return
    await updateBookingStatus(selectedBooking.id, newStatus as Booking["status"], adminNotes || null)
    setIsStatusUpdateOpen(false)
    setSelectedBooking(null)
    setNewStatus("")
    setAdminNotes("")
  }

  // --- stats calcs ---
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      active: bookings.filter((b) => b.status === "active").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      overtime: bookings.filter((b) => b.status === "overtime").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }
  }, [bookings])

  const getStatusBadge = (status: Booking["status"]) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    return (
      <Badge variant="secondary" className={cn("flex items-center gap-1", config.textColor)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const canUpdateStatus = (booking: Booking) => {
    const config = STATUS_CONFIG[booking.status]
    return config.nextStatus !== null
  }

  const getNextStatusLabel = (booking: Booking) => {
    const config = STATUS_CONFIG[booking.status]
    if (!config.nextStatus) return null
    return STATUS_CONFIG[config.nextStatus as keyof typeof STATUS_CONFIG].label
  }


  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quản lý đơn hàng</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Xác nhận và quản lý tình trạng đơn hàng</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setLoading(true)
              const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('createdAt', { ascending: false })

              if (!error && data) {
                setBookings(data as Booking[])
              }
              setLoading(false)
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { value: stats.total, label: "Tổng đơn hàng" },
          { value: stats.pending, label: "Chờ xác nhận", color: "text-yellow-600" },
          { value: stats.confirmed, label: "Đã xác nhận", color: "text-blue-600" },
          { value: stats.active, label: "Đang thuê", color: "text-green-600" },
          { value: stats.completed, label: "Hoàn thành", color: "text-gray-600" },
          { value: stats.overtime, label: "Quá hạn", color: "text-orange-600" },
          { value: stats.cancelled, label: "Đã hủy", color: "text-red-600" },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${stat.color || ""}`}>{stat.value}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên khách hàng, email, máy ảnh hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="active">Đang thuê</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Orders List */}
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>
            Hiển thị {filteredBookings.length} trong tổng số {bookings.length} đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-muted/40 transition"
            >
              <div className="flex flex-col gap-4">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{booking.customerName}</p>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">#{booking.id}</p>
                      <p className="text-xs text-muted-foreground">{booking.customerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.cameraName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.startDate).toLocaleDateString("vi-VN")} →{" "}
                        {new Date(booking.endDate).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.totalDays} ngày</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Phương thức đặt cọc:{" "}
                      <span className="font-medium text-foreground">
                        {DEPOSIT_METHODS[booking.depositMethod] ?? "—"}
                      </span>
                    </p>

                  </div>
                </div>

                {(booking.notes || booking.adminNotes) && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    {booking.notes && (
                      <p className="italic text-muted-foreground">Ghi chú khách: {booking.notes}</p>
                    )}
                    {booking.adminNotes && (
                      <p className="italic text-blue-600">Ghi chú admin: {booking.adminNotes}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 items-center justify-end">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setEditForm(booking)
                      setIsEditBookingOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>



                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteTargetId(booking.id)
                      setIsDeleteConfirmOpen(true)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                </div>
              </div>
            </Card>
          ))}
          <Dialog open={isEditBookingOpen} onOpenChange={setIsEditBookingOpen}>
            <DialogContent className="sm:max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-lg p-0">

              {/* HEADER – giống style CameraForm */}
              <DialogHeader className="sticky top-0 bg-background p-4 sm:p-5 md:p-6 border-b z-10">
                <DialogTitle>Sửa đơn #{selectedBooking?.id}</DialogTitle>
                <DialogDescription>Chỉnh sửa thông tin đặt máy</DialogDescription>
              </DialogHeader>

              {/* BODY */}
              <div className="p-4 sm:p-5 md:p-6 space-y-6">

                {/* Tên KH */}
                <div>
                  <Label>Tên khách hàng</Label>
                  <Input
                    className="mt-1 w-full"
                    value={editForm.customerName || ""}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  />
                </div>

                {/* SDT */}
                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    className="mt-1 w-full"
                    value={editForm.customerPhone || ""}
                    onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  />
                </div>

                {/* Trạng thái đơn hàng */}
                <div>
                  <Label>Trạng thái đơn hàng</Label>
                  <Select
                    value={editForm.status || ""}
                    onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 w-full min-w-full">
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="active">Đang thuê</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="overtime">Quá hạn</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phương thức cọc */}
                <div>
                  <Label>Phương thức cọc</Label>
                  <Select
                    value={editForm.depositMethod || ""}
                    onValueChange={(v) => setEditForm({ ...editForm, depositMethod: v })}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 w-full min-w-full">
                      <SelectItem value="cccd-taisan">CCCD + tài sản</SelectItem>
                      <SelectItem value="cccd-80">CCCD + 80%</SelectItem>
                      <SelectItem value="100">Cọc 100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ghi chú admin */}
                <div>
                  <Label>Ghi chú admin</Label>
                  <Textarea
                    className="mt-1 w-full"
                    rows={3}
                    value={editForm.adminNotes || ""}
                    onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <DialogFooter className="p-4 sm:p-5 md:p-6 flex justify-between">

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditBookingOpen(false)}>
                    Huỷ
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!selectedBooking) return

                      const payload = {
                        customerName: editForm.customerName || "",
                        customerPhone: editForm.customerPhone || "",
                        startDate: editForm.startDate || "",
                        endDate: editForm.endDate || "",
                        startTime: editForm.startTime || "",
                        endTime: editForm.endTime || "",
                        depositMethod: editForm.depositMethod || "",
                        adminNotes: editForm.adminNotes || null,
                        status: editForm.status || "pending",
                      }

                      await supabase
                        .from('bookings')
                        .update(payload)
                        .eq('id', selectedBooking.id)

                      await recalcCameraAvailability(selectedBooking.cameraId)

                      toast({
                        title: "Đã lưu thay đổi",
                        description: "Thông tin đơn hàng đã cập nhật."
                      })

                      setIsEditBookingOpen(false)
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </DialogFooter>

            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-md w-full rounded-lg p-0">

              {/* HEADER */}
              <DialogHeader className="p-4 sm:p-5 border-b">
                <DialogTitle>Huỷ đơn hàng</DialogTitle>
                <DialogDescription>
                  Hành động này không thể hoàn tác
                </DialogDescription>
              </DialogHeader>

              {/* BODY */}
              <div className="p-4 sm:p-5">
                <p className="text-sm">
                  Bạn có chắc chắn muốn huỷ đơn:
                </p>
                <p className="font-semibold text-destructive">
                  #{deleteTargetId}
                </p>
              </div>

              {/* FOOTER */}
              <DialogFooter className="p-4 sm:p-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Huỷ
                </Button>

                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!deleteTargetId) return

                    try {
                      const booking = bookings.find(b => b.id === deleteTargetId)
                      if (!booking) return





                      const { error: deleteError } = await supabase
                        .from('bookings')
                        .delete()
                        .eq('id', deleteTargetId)

                      if (deleteError) throw deleteError


                      // recalc camera availability
                      if (
                        booking.cameraId &&
                        (booking.status === "confirmed" || booking.status === "active")
                      ) {
                        await recalcCameraAvailability(booking.cameraId)
                      }

                      // Cập nhật lại state cục bộ ngay lập tức để nó biến mất luôn
                      setBookings(prev => prev.filter(b => b.id !== deleteTargetId))

                      toast({
                        title: "Đã huỷ đơn",
                        description: `Đơn #${deleteTargetId} đã được huỷ`,
                      })
                    } catch (err) {
                      console.error("Cancel booking error:", err)
                      toast({
                        title: "Lỗi",
                        description: "Không thể huỷ đơn hàng",
                        variant: "destructive",
                      })
                    } finally {
                      setDeleteTargetId(null)
                      setIsDeleteConfirmOpen(false)
                    }
                  }}
                >
                  Huỷ đơn
                </Button>

              </DialogFooter>

            </DialogContent>
          </Dialog>

          {!loading && filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" ? "Không có đơn hàng phù hợp" : "Chưa có đơn hàng trong hệ thống"}
              </p>
            </div>
          )}

          {loading && <div className="text-center py-8 text-muted-foreground">Đang tải danh sách đơn hàng...</div>}
        </CardContent>

      </Card>
    </div >
  )
}
