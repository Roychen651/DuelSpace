import * as SliderPrimitive from '@radix-ui/react-slider'
import * as Popover from '@radix-ui/react-popover'
import { format, addMonths, subMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns'
import { he, enUS } from 'date-fns/locale'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

// ─── PremiumSlider ─────────────────────────────────────────────────────────────

interface PremiumSliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (val: number) => void
  label?: string
  formatValue?: (v: number) => string
  color?: string
}

export function PremiumSlider({
  value, min = 0, max = 100000, step = 100,
  onChange, label, formatValue, color = '#6366f1',
}: PremiumSliderProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">{label}</span>
          <span className="text-sm font-bold" style={{ color }}>
            {formatValue ? formatValue(value) : value.toLocaleString()}
          </span>
        </div>
      )}

      <SliderPrimitive.Root
        className="relative flex w-full touch-none items-center select-none"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        style={{ height: 20 }}
      >
        <SliderPrimitive.Track
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]"
        >
          <SliderPrimitive.Range
            className="absolute h-full"
            style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 outline-none transition-all duration-200 hover:scale-110 focus-visible:ring-2"
          style={{
            background: '#fff',
            borderColor: color,
            boxShadow: `0 0 0 4px ${color}25, 0 2px 8px rgba(0,0,0,0.4)`,
            cursor: 'pointer',
          }}
          aria-label={label ?? 'Slider'}
        />
      </SliderPrimitive.Root>

      {/* Min/max hints */}
      <div className="flex justify-between text-[9px] text-slate-400 dark:text-white/20 tabular-nums">
        <span>{formatValue ? formatValue(min) : min.toLocaleString()}</span>
        <span className="text-slate-400 dark:text-white/30">{pct}%</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
      </div>
    </div>
  )
}

// ─── PremiumDatePicker ────────────────────────────────────────────────────────

interface PremiumDatePickerProps {
  value: string | null | undefined
  onChange: (iso: string | null) => void
  placeholder?: string
  locale: string
  minDate?: Date
  label?: string
}

export function PremiumDatePicker({
  value, onChange, placeholder, locale, minDate, label,
}: PremiumDatePickerProps) {
  const isHe = locale === 'he'
  const dateFnsLocale = isHe ? he : enUS
  const [open, setOpen] = useState(false)

  const selectedDate = value ? new Date(value) : null
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ?? new Date()
  )

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start of month
  const startPad = (getDay(monthStart) + (isHe ? 1 : 0)) % 7
  const paddedDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ]
  // Pad end to fill 6 rows
  while (paddedDays.length % 7 !== 0) paddedDays.push(null)

  const displayValue = selectedDate
    ? format(selectedDate, 'dd/MM/yyyy', { locale: dateFnsLocale })
    : ''

  const handleSelect = (d: Date) => {
    onChange(d.toISOString())
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const weekDayLabels = isHe
    ? ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\'']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/45">
          <Calendar size={10} />
          {label}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition-all duration-300 outline-none"
            style={{
              background: 'var(--input-bg)',
              border: open ? '1px solid rgba(99,102,241,0.55)' : '1px solid var(--border)',
              boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
              color: displayValue ? 'var(--text-main)' : 'var(--text-muted)',
            }}
          >
            <Calendar size={14} className="flex-none text-slate-400 dark:text-white/30" />
            <span className="flex-1 text-start">
              {displayValue || (placeholder ?? (isHe ? 'בחר תאריך' : 'Select date'))}
            </span>
            {selectedDate && (
              <span
                onClick={handleClear}
                className="flex-none text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 transition text-lg leading-none"
                aria-label="Clear date"
              >
                ×
              </span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align={isHe ? 'end' : 'start'}
            className="z-[9999] rounded-2xl p-4 shadow-2xl bg-white dark:bg-[#14141f] border border-slate-200 dark:border-indigo-500/25"
            style={{
              backdropFilter: 'blur(40px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
              width: 280,
            }}
            dir={isHe ? 'rtl' : 'ltr'}
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMonth(m => subMonths(m, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-white/40 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-700 dark:hover:text-white/80 active:scale-90"
              >
                {isHe ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>

              <span className="text-sm font-bold text-slate-700 dark:text-white/80">
                {format(viewMonth, 'MMMM yyyy', { locale: dateFnsLocale })}
              </span>

              <button
                type="button"
                onClick={() => setViewMonth(m => addMonths(m, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-white/40 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-700 dark:hover:text-white/80 active:scale-90"
              >
                {isHe ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekDayLabels.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-slate-400 dark:text-white/25 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {paddedDays.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} />
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                const isToday = isSameDay(day, today)
                const isPast = minDate ? isBefore(day, startOfDay(minDate)) : false

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !isPast && handleSelect(day)}
                    disabled={isPast}
                    className="relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium text-slate-700 dark:text-white/70 transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : isToday
                          ? 'rgba(99,102,241,0.15)'
                          : 'transparent',
                      color: isSelected ? '#fff' : isToday ? '#818cf8' : undefined,
                      boxShadow: isSelected ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                    }}
                  >
                    {format(day, 'd')}
                    {isToday && !isSelected && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full"
                        style={{ background: '#6366f1' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Today shortcut */}
            <button
              type="button"
              onClick={() => handleSelect(today)}
              className="mt-3 w-full rounded-xl py-2 text-xs font-semibold text-slate-500 dark:text-white/50 transition hover:text-slate-800 dark:hover:text-white/80 border border-slate-200 dark:border-white/[0.07]"
            >
              {isHe ? 'היום' : 'Today'}
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
