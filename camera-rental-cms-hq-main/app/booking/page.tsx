"use client"
import { useState, useEffect } from "react"
import { PublicBooking } from "@/components/public-booking"
import { Camera, BedDouble, Shirt, Car, Wrench, Package, Star, Headset, Shield, Clock, Banknote, Sparkles, Phone, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FacebookGallery } from "@/components/facebook-gallery"
import { useGlobalErrorLogger } from "@/hooks/useGlobalErrorLogger";
import { useStoreConfig } from "@/lib/store-config-context";

const BUSINESS_ICONS: Record<string, React.ElementType> = {
  camera: Camera,
  hotel: BedDouble,
  dress: Shirt,
  car: Car,
  equipment: Wrench,
  custom: Package,
}

export default function BookingPage() {
  useGlobalErrorLogger();
  const { config } = useStoreConfig();
  const BusinessIcon = BUSINESS_ICONS[config.business_type] || Camera
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State mới cho mobile menu

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Ẩn header khi scroll xuống, hiện khi scroll lên
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false)
        setIsMobileMenuOpen(false) // Tự động đóng menu khi scroll
      } else {
        setShowHeader(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Component con hiển thị Social Icons để tái sử dụng
  const SocialIcons = () => (
    <div className="flex items-center gap-4">
      {config.facebook_url && (
        <a
          href={config.facebook_url}
          target="_blank"
          className="hover:scale-110 transition-transform text-pink-500"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
            alt="Facebook"
            className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 hover:opacity-100"
          />
        </a>
      )}
      {config.instagram_url && (
        <a
          href={config.instagram_url}
          target="_blank"
          className="hover:scale-110 transition-transform"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
            alt="Instagram"
            className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 hover:opacity-100"
          />
        </a>
      )}
      {config.tiktok_url && (
        <a
          href={config.tiktok_url}
          target="_blank"
          className="hover:scale-110 transition-transform"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg"
            alt="TikTok"
            className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 hover:opacity-100"
          />
        </a>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      <header
        className={`glass-strong fixed top-0 left-0 w-full z-50 border-b border-white/20 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          {/* Main Header Row: Luôn hiển thị Logo bên trái, Desktop Menu hoặc Mobile Toggle bên phải */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-pink-400/30 to-purple-400/30 backdrop-blur-sm">
                <BusinessIcon className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent leading-tight">
                  {config.store_name}
                </h1>
                <p className="text-[10px] sm:text-sm text-foreground/60">{config.store_tagline}</p>
              </div>
            </div>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-8">
              <a href={`tel:${config.store_phone}`} className="flex items-center gap-2 hover:text-pink-400 transition-colors font-medium">
                <Phone size={20} className="text-pink-400" />
                <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {config.store_phone}
                </span>
              </a>
              <SocialIcons />
            </div>

            {/* Mobile Menu Button (Visible on Mobile only) */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:bg-pink-100/20"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4 animate-in slide-in-from-top-2 fade-in-20">
              <div className="flex flex-col items-center gap-4 space-y-2">
                <a href={`tel:${config.store_phone}`} className="flex items-center gap-2 p-2 rounded-lg bg-white/40 w-full justify-center">
                  <Phone size={20} className="text-pink-500" />
                  <span className="text-lg font-bold text-foreground">
                    Hotline: {config.store_phone}
                  </span>
                </a>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-foreground/60">Theo dõi chúng tôi tại:</span>
                  <SocialIcons />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- PHẦN CÒN LẠI CỦA TRANG GIỮ NGUYÊN --- */}
      <section className="relative py-16 sm:py-20 overflow-hidden pt-28 sm:pt-32">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/30 mb-4">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span className="text-sm sm:text-base font-medium text-foreground/80">
                {config.hero_badge}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight break-words">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {config.hero_title}
              </span>
              <br />
              <span className="text-foreground">{config.hero_subtitle}</span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {config.hero_description}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8"
                onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                {config.cta_button_text}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-2xl glass-light border-white/30 hover:glass bg-transparent"
                onClick={() => document.getElementById("story-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-center max-w-6xl mx-auto">
            {config.highlights.map((item, index) => {
              const IconComp = [Shield, Clock, Headset, Banknote][index % 4] || Shield;
              return (
                <div key={index} className="text-center space-y-3 flex flex-col items-center">
                  <div className="inline-flex p-4 rounded-2xl glass-light border border-white/20">
                    <IconComp className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm sm:text-base text-foreground/60">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="booking-section" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {config.booking_title}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-lg text-foreground/70">
              {config.booking_subtitle}
            </p>
          </div>

          <PublicBooking />
        </div>
      </section>

      {config.features.gallery && (
        <section className="py-20 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Những khoảnh khắc đẹp từ khách hàng
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-lg text-foreground/70">
                Hơn 500+ khách hàng đã tin tưởng và tạo ra những bức ảnh tuyệt vời
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <FacebookGallery albumUrl={config.instagram_url} />
            </div>
          </div>
        </section>
      )}

      {config.features.story && (
        <section id="story-section" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {config.story_title}
                  </span>
                </h2>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-12 space-y-6 border border-white/20">
                <div className="text-base sm:text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                  <span className="text-2xl text-pink-400 font-serif">"</span>
                  {config.story_content}
                  <span className="text-2xl text-pink-400 font-serif">"</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {config.features.testimonials && (
        <section className="py-20 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Khách hàng nói gì về chúng tôi
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-lg text-foreground/70">
                Những phản hồi chân thực từ khách hàng đã sử dụng dịch vụ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {config.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="glass-card rounded-3xl p-6 space-y-4 border border-white/20 hover:glass-strong transition-all"
                >
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-white/20">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm sm:text-base text-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-400/30 to-purple-400/30 backdrop-blur-sm">
                <BusinessIcon className="h-8 w-8 text-pink-500" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {config.store_name}
                </h3>
                <p className="text-sm sm:text-base text-foreground/60">{config.store_tagline}</p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-foreground/70">
              {config.hero_description}
            </p>

            <p className="text-sm sm:text-base text-foreground/50 pt-6">
              © {new Date().getFullYear()} {config.store_name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
