"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Calendar, ChevronDown, Info, CheckCircle2, AlertTriangle, Trash2, ShieldCheck, Sparkles, Camera } from "lucide-react"

type BookingMode = "hourly" | "daily"

interface Booking {
  id: string
  mode: BookingMode
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  totalPrice: number
  timestamp: number
}

const HOURLY_RATE = 50000
const DAILY_RATE = 500000

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

// 📅 CUSTOM REACT DATE PICKER (High-Fidelity)
interface DatePickerInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  minDate?: string
  rangeStartDate?: string
  rangeEndDate?: string
  mode: BookingMode
  activeType: "pickup" | "return"
  disabled?: boolean
}

function DatePickerInput({ placeholder, value, onChange, minDate, rangeStartDate, rangeEndDate, mode, activeType, disabled }: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const wrapperRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = useMemo(() => {
    const grid = []
    const firstDayIndex = new Date(year, month, 1).getDay()
    const prevMonthTotalDays = new Date(year, month, 0).getDate()

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push(new Date(year, month - 1, prevMonthTotalDays - i))
    }

    const currentMonthTotalDays = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= currentMonthTotalDays; d++) {
      grid.push(new Date(year, month, d))
    }

    const nextDaysCount = 42 - grid.length
    for (let d = 1; d <= nextDaysCount; d++) {
      grid.push(new Date(year, month + 1, d))
    }

    return grid
  }, [year, month])

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isOpen])

  return (
    <div className="relative flex-grow" ref={wrapperRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-5 py-3.5 bg-[#FFFDF9] hover:bg-[#fff6f6] border border-pink-100 rounded-full transition-all font-black text-sm shadow-sm flex items-center gap-3 ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <Calendar className="w-4 h-4 text-slate-800 shrink-0" />
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-[105%] left-0 z-[100] bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xl w-[320px] sm:w-[340px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-5 px-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 border rounded-full hover:bg-slate-50 transition text-slate-500 font-bold text-xs">&lt;</button>
            <span className="font-extrabold text-slate-800 text-sm">{monthNames[month]} {year}</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 border rounded-full hover:bg-slate-50 transition text-slate-500 font-bold text-xs">&gt;</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
            {days.map((day, idx) => {
              const dStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`
              const isCurrentMonth = day.getMonth() === month
              const isPast = minDate ? dStr < minDate : false

              let isInRange = false
              if (mode === "daily" && rangeStartDate && rangeEndDate) {
                isInRange = dStr >= rangeStartDate && dStr <= rangeEndDate
              } else {
                isInRange = value === dStr
              }

              let isStartEnd = false
              if (mode === "daily" && rangeStartDate && rangeEndDate) {
                isStartEnd = dStr === rangeStartDate || dStr === rangeEndDate
              }

              const isReturnDisabled = activeType === 'return' && rangeStartDate && (mode === 'daily' ? dStr <= rangeStartDate : dStr < rangeStartDate)
              const isBlocked = (isPast && isCurrentMonth) || isReturnDisabled

              return (
                <button
                  key={idx}
                  disabled={isBlocked}
                  onClick={() => { onChange(dStr); setIsOpen(false) }}
                  className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-full transition-all relative ${isInRange
                      ? isStartEnd
                        ? activeType === 'pickup' && dStr === rangeStartDate ? "bg-[#df52cc] text-white shadow-md" : "bg-[#f87171] text-white shadow-md"
                        : "bg-[#fca5a5] text-white shadow-sm"
                      : isBlocked
                        ? "text-slate-300 pointer-events-none bg-slate-50/50"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-pink-50 hover:text-pink-600"
                          : "text-slate-300 hover:bg-slate-50"
                    }`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// 🕒 CUSTOM TIME PICKER
interface TimePickerInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  options: string[]
}

function TimePickerInput({ placeholder, value, onChange, options }: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isOpen])

  return (
    <div className="w-28 sm:w-32 shrink-0 relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-[#FAF5F6]/40 hover:bg-[#FFFDF9] border border-pink-100 rounded-full transition-all font-black text-xs text-slate-600 shadow-sm cursor-pointer flex items-center justify-between"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>{value || placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute top-[105%] right-0 z-[100] bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-48 overflow-y-auto w-full sm:w-[150%] p-1.5 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((time) => {
            const isSelected = value === time
            return (
              <button
                key={time}
                onClick={() => { onChange(time); setIsOpen(false) }}
                className={`py-2 text-[11px] font-black rounded-xl transition ${isSelected ? "bg-[#df52cc] text-white shadow-md" : "text-slate-700 hover:bg-pink-50 hover:text-pink-600"
                  }`}
              >
                {time}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BookingExperienceDemo() {
  const [todayStr, setTodayStr] = useState("")

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0])
  }, [])

  const [mode, setMode] = useState<BookingMode>("hourly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [history, setHistory] = useState<Booking[]>([])
  const [isSuccess, setIsSuccess] = useState(false)


  // Load History
  useEffect(() => {
    const saved = localStorage.getItem("demo_bookings")
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleModeSwitch = (newMode: BookingMode) => {
    setMode(newMode)
    setStartDate("")
    setEndDate("")
    setStartTime("")
    setEndTime("")
  }

  const hourOptions = useMemo(() => Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`), [])

  const calculation = useMemo(() => {
    let isValid = true
    let conflict = false
    let unit = 0
    let unitLabel = ""
    let rate = 0
    let total = 0

    if (!startDate) return { unit, unitLabel, rate, total, isValid: false, conflict, isFullySelected: false }

    if (mode === "hourly") {
      if (!startTime || !endTime) return { unit, unitLabel, rate, total, isValid: false, conflict, isFullySelected: false }

      const startH = parseInt(startTime.split(":")[0])
      const endH = parseInt(endTime.split(":")[0])
      unit = endH - startH
      unitLabel = "giờ"
      rate = HOURLY_RATE
      total = Math.max(0, unit * rate)

      if (unit <= 0 || isNaN(unit)) isValid = false
      if (todayStr && startDate < todayStr) isValid = false

      // Conflict logic
      conflict = history.some(b => {
        if (b.mode === "hourly" && b.startDate === startDate) {
          const bStartH = parseInt(b.startTime!)
          const bEndH = parseInt(b.endTime!)
          return ((startH >= bStartH && startH < bEndH) || (endH > bStartH && endH <= bEndH) || (startH <= bStartH && endH >= bEndH))
        }
        if (b.mode === "daily") {
          const bStart = new Date(b.startDate)
          const bEnd = new Date(b.endDate)
          const curr = new Date(startDate)
          bStart.setHours(0, 0, 0, 0); bEnd.setHours(23, 59, 59, 999); curr.setHours(12, 0, 0, 0)
          return curr >= bStart && curr <= bEnd
        }
        return false
      })

    } else {
      if (!endDate || !startTime || !endTime) return { unit, unitLabel, rate, total, isValid: false, conflict, isFullySelected: false }

      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0)

      const diffTime = end.getTime() - start.getTime()
      unit = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      unitLabel = "ngày"
      rate = DAILY_RATE
      total = Math.max(0, unit * rate)

      if (unit <= 0 || isNaN(unit)) isValid = false
      if (todayStr && startDate < todayStr) isValid = false

      conflict = history.some(b => {
        const bStart = new Date(b.startDate); const bEnd = new Date(b.endDate)
        bStart.setHours(0, 0, 0, 0); bEnd.setHours(23, 59, 59, 999)
        const currentStart = new Date(startDate); const currentEnd = new Date(endDate)
        currentStart.setHours(0, 0, 0, 0); currentEnd.setHours(23, 59, 59, 999)

        if (b.mode === "daily") {
          return ((currentStart >= bStart && currentStart <= bEnd) || (currentEnd >= bStart && currentEnd <= bEnd) || (currentStart <= bStart && currentEnd >= bEnd))
        } else {
          const hDate = new Date(b.startDate); hDate.setHours(12, 0, 0, 0)
          return hDate >= currentStart && hDate <= currentEnd
        }
      })
    }

    return { unit, unitLabel, rate, total, isValid, conflict, isFullySelected: true }
  }, [mode, startDate, endDate, startTime, endTime, history, todayStr])

  const handleBooking = () => {
    if (!calculation.isValid || calculation.conflict) return

    const newBooking: Booking = {
      id: "bk-" + Math.random().toString(36).substr(2, 5),
      mode,
      startDate,
      endDate: mode === "daily" ? endDate : startDate,
      startTime: startTime,
      endTime: endTime,
      totalPrice: calculation.total,
      timestamp: Date.now()
    }

    const updatedHistory = [newBooking, ...history]
    setHistory(updatedHistory)
    localStorage.setItem("demo_bookings", JSON.stringify(updatedHistory))

    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 3000)

    setStartDate(""); setEndDate(""); setStartTime(""); setEndTime("")
  }

  const deleteBooking = (id: string) => {
    const updated = history.filter(b => b.id !== id)
    setHistory(updated)
    localStorage.setItem("demo_bookings", JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-amber-50/50 via-pink-50/50 to-purple-50/50 p-4 md:p-8 font-sans text-slate-800 antialiased selection:bg-pink-100 selection:text-pink-600">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900">
            Booking Experience<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#df52cc] to-pink-500">
              Realtime Demo
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">

          <div className="lg:col-span-2 space-y-8">

            {/* Toggle Logic Wrapper */}
            <div className="flex justify-center">
              <div className="bg-slate-100/80 p-1.5 rounded-[1.8rem] flex gap-1 w-full max-w-md border border-slate-200/50 shadow-inner">
                <button
                  onClick={() => handleModeSwitch("hourly")}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[1.4rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${mode === "hourly" ? "bg-white shadow-md text-[#df52cc] scale-[1.01]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Theo giờ
                </button>
                <button
                  onClick={() => handleModeSwitch("daily")}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[1.4rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${mode === "daily" ? "bg-white shadow-md text-[#df52cc] scale-[1.01]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Theo ngày
                </button>
              </div>
            </div>

            {/* High Fidelity Visual Form Area (Matching the Screenshot 100%) */}
            <div className="bg-[#FAF5F6] p-6 sm:p-10 rounded-[2.5rem] border border-pink-100/40 shadow-[0_20px_50px_-12px_rgba(244,63,94,0.06)] space-y-8 relative overflow-visible">

              <div className="text-center space-y-3">
                <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Chọn ngày bắt đầu và ngày kết thúc thuê máy</h3>
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#df52cc]"></span><span>Ngày nhận máy</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f87171]"></span><span>Ngày trả máy</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300"></span><span>Không khả dụng</span></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-2">

                {/* START SECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 ml-4 block">Ngày bắt đầu</label>
                  <div className="flex gap-2 relative">
                    <DatePickerInput
                      placeholder="Ngày nhận"
                      value={startDate}
                      onChange={setStartDate}
                      minDate={todayStr}
                      rangeStartDate={startDate}
                      rangeEndDate={mode === "daily" ? endDate : startDate}
                      mode={mode}
                      activeType="pickup"
                    />
                    <TimePickerInput
                      placeholder="Giờ nhận"
                      value={startTime}
                      onChange={setStartTime}
                      options={hourOptions}
                    />
                  </div>
                </div>

                {/* END SECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 ml-4 block">Ngày kết thúc</label>
                  <div className="flex gap-2 relative">
                    {mode === "hourly" ? (
                      <DatePickerInput
                        placeholder="Ngày trả"
                        value={startDate}
                        onChange={() => { }}
                        mode="hourly"
                        activeType="return"
                        disabled={true}
                      />
                    ) : (
                      <DatePickerInput
                        placeholder="Ngày trả"
                        value={endDate}
                        onChange={setEndDate}
                        minDate={startDate || todayStr}
                        rangeStartDate={startDate}
                        rangeEndDate={endDate}
                        mode="daily"
                        activeType="return"
                      />
                    )}
                    <TimePickerInput
                      placeholder="Giờ trả"
                      value={endTime}
                      onChange={setEndTime}
                      options={hourOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Validation Messages Overlay */}
              <div className="space-y-2 pt-2">
                {calculation.isFullySelected && !calculation.isValid && (
                  <div className="bg-red-50 border border-red-100 p-3.5 rounded-2xl flex items-start gap-3.5 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs">Thời gian đặt thuê không hợp lệ!</p>
                    </div>
                  </div>
                )}

                {calculation.isFullySelected && calculation.isValid && calculation.conflict && (
                  <div className="bg-orange-50 border border-orange-100 p-3.5 rounded-2xl flex items-start gap-3.5 text-orange-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs">Cảnh báo trùng lịch đặt!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-pink-100/40">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3.5 bg-[#FFFDF9] hover:bg-[#fff6f6] border border-pink-100 rounded-full font-black text-sm text-slate-800 shadow-sm transition active:scale-[0.98]"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!calculation.isValid || !calculation.isFullySelected || calculation.conflict}
                  className="flex-grow py-3.5 bg-gradient-to-r from-[#df52cc] to-pink-500 hover:from-pink-500 hover:to-pink-600 rounded-full font-black text-sm text-white shadow-md transition active:scale-[0.99] text-center disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isSuccess ? "Đã ghi nhận đơn hàng!" : "Tiếp tục"}
                </button>
              </div>

            </div>

            {/* History List */}
            <div className="space-y-4 pt-6">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider">
                <Info className="w-4 h-4 text-[#df52cc]" /> Bộ nhớ tạm LocalStorage
              </h3>
              <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-pink-50 rounded-xl text-[#df52cc]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-xs">{item.mode === "hourly" ? "Thuê theo giờ" : "Thuê theo ngày"}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {formatDateDisplay(item.startDate)} {item.startTime && `| ${item.startTime} - ${item.endTime}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-900">{item.totalPrice.toLocaleString("vi-VN")}đ</p>
                      <button onClick={() => deleteBooking(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Realtime dynamic invoice details preview sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white sticky top-8 shadow-xl border border-slate-800 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#df52cc] to-pink-500" />
              <h3 className="text-xl font-black mb-8 flex items-center gap-2 border-b border-slate-800 pb-4">
                <CheckCircle2 className="text-[#df52cc] w-5 h-5" /> Chi Tiết Tạm Tính
              </h3>

              <div className="space-y-8 text-xs font-bold uppercase tracking-wider">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Loại hình thuê:</span>
                    <span className="text-white font-black">{mode === "hourly" ? "Thuê theo Giờ" : "Thuê theo Ngày"}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Đơn giá:</span>
                    <span className="text-white font-black">{calculation.rate.toLocaleString("vi-VN")}đ / {mode === "hourly" ? "h" : "ngày"}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Thời lượng thuê:</span>
                    <span className="text-[#df52cc] font-black">{calculation.isFullySelected ? `${calculation.unit} ${calculation.unitLabel}` : "--"}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-left">
                  <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Công thức tính toán:</p>
                  <p className="text-sm font-black text-emerald-400 normal-case tracking-normal">
                    {calculation.isFullySelected ? (
                      `${calculation.unit} ${calculation.unitLabel} × ${calculation.rate.toLocaleString("vi-VN")}đ = ${calculation.total.toLocaleString("vi-VN")}đ`
                    ) : "Vui lòng chọn đầy đủ thời gian..."}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <p className="text-[9px] font-bold text-gray-400 tracking-widest">Tổng thanh toán dự kiến:</p>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                    <p className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                      {calculation.isFullySelected ? calculation.total.toLocaleString("vi-VN") : "0"}
                      <span className="text-sm text-[#df52cc] font-bold ml-1">đ</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
