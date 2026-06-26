"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ItemManagement } from "@/components/item-management"
import { BookingDashboard } from "@/components/booking-dashboard"
import { CalendarView } from "@/components/calendar-view"
import { OrderManagement } from "@/components/order-management"
import { SettingsImage } from "@/components/settings-image"
import { StoreCustomization } from "@/components/store-customization"
import { StaffManagement } from "@/components/staff-management"
import { Camera, Calendar, Package, Settings, LogOut, Edit3, Users } from "lucide-react"
import { useGlobalErrorLogger } from "@/hooks/useGlobalErrorLogger"
import { useStoreConfig } from "@/lib/store-config-context"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'owner' | 'staff'>('staff')
  const router = useRouter()
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { config } = useStoreConfig();

  useGlobalErrorLogger()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAuthenticated(true)
        // Đọc role từ user metadata, mặc định là 'staff' nếu chưa có
        const role = session.user.user_metadata?.role || 'staff'
        setUserRole(role as 'owner' | 'staff')
      } else {
        router.push("/admin/hungcut")
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/hungcut")
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Đang tải...</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const isOwner = userRole === 'owner'
  // Tab grid: staff = 4 cột, owner = 7 cột (thêm 3 tab: thanh toán, cài đặt, nhân viên)
  const tabCols = isOwner ? "grid-cols-7" : "grid-cols-4"

  return (
    <div className="min-h-screen">
      <header
        className={`glass-strong border-b-2 border-white/30 sticky top-0 z-50 transition-transform duration-300 ${isScrollingDown ? "-translate-y-full" : "translate-y-0"
          }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {config.admin_title}
              </h1>
            </div>

            {/* Right content */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2 md:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/70 font-medium">
                  Admin Dashboard
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isOwner
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                  {isOwner ? 'Owner' : 'Staff'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="glass-light hover:glass border-white/30 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-6">
          <Tabs defaultValue="cameras" className="space-y-6">
            <TabsList className={`grid w-full ${tabCols} glass p-2 h-auto gap-2`}>
              {/* Tab Sản phẩm - Tất cả đều thấy */}
              <TabsTrigger
                value="cameras"
                className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline capitalize">{config.item_name_plural}</span>
              </TabsTrigger>

              {/* Tab Đơn hàng - Tất cả đều thấy */}
              <TabsTrigger
                value="bookbook"
                className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Đơn hàng</span>
              </TabsTrigger>

              {/* Tab Lịch - Tất cả đều thấy */}
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Lịch</span>
              </TabsTrigger>

              {/* Tab Quản lý - Tất cả đều thấy */}
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Quản lý</span>
              </TabsTrigger>

              {/* ===== CHỈ OWNER MỚI THẤY ===== */}
              {isOwner && (
                <>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Thanh toán</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="customization"
                    className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Cài đặt</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="staff"
                    className="flex items-center gap-2 data-[state=active]:glass-strong data-[state=active]:shadow-lg rounded-xl py-3 transition-all"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Nhân viên</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="cameras">
              <ItemManagement role={userRole} />
            </TabsContent>

            <TabsContent value="bookbook">
              <BookingDashboard />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView />
            </TabsContent>

            <TabsContent value="orders">
              <OrderManagement />
            </TabsContent>

            {isOwner && (
              <>
                <TabsContent value="settings">
                  <SettingsImage />
                </TabsContent>
                <TabsContent value="customization">
                  <StoreCustomization />
                </TabsContent>
                <TabsContent value="staff">
                  <StaffManagement />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
