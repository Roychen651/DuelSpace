import { useState, useMemo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Bell, Eye, Check } from 'lucide-react'
import { useProposalStore } from '../../stores/useProposalStore'
import { useI18n } from '../../lib/i18n'
import type { Proposal } from '../../types/proposal'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'viewed' | 'accepted'

interface Notif {
  id: string
  type: NotifType
  title: string
  client: string
  time: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEEN_KEY = 'ds:notif-seen'

function deriveNotifications(proposals: Proposal[]): Notif[] {
  const notifs: Notif[] = []

  for (const p of proposals) {
    if (p.status === 'accepted') {
      notifs.push({
        id: `accepted-${p.id}`,
        type: 'accepted',
        title: p.project_title || '—',
        client: p.client_name || '—',
        time: p.updated_at,
      })
    }
    if (p.last_viewed_at) {
      notifs.push({
        id: `viewed-${p.id}`,
        type: 'viewed',
        title: p.project_title || '—',
        client: p.client_name || '—',
        time: p.last_viewed_at,
      })
    }
  }

  return notifs
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20)
}

function timeAgo(dateStr: string, isHe: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 2)   return isHe ? 'הרגע'           : 'just now'
  if (mins < 60)  return isHe ? `לפני ${mins} דק'` : `${mins}m ago`
  if (hours < 24) return isHe ? `לפני ${hours} שע'` : `${hours}h ago`
  return isHe ? `לפני ${days} ימים` : `${days}d ago`
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

export function NotificationBell() {
  const { proposals } = useProposalStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)

  const notifications = useMemo(() => deriveNotifications(proposals), [proposals])

  // Read seenAt directly from localStorage on every render — lightweight and correct
  const seenAt = Number(localStorage.getItem(SEEN_KEY) ?? 0)
  const unreadCount = notifications.filter(n => new Date(n.time).getTime() > seenAt).length

  const handleOpenChange = (v: boolean) => {
    if (v) localStorage.setItem(SEEN_KEY, String(Date.now()))
    setOpen(v)
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition-colors hover:text-white/75"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          aria-label={isHe ? 'התראות' : 'Notifications'}
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[8px] font-black text-white"
              style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={10}
          align="end"
          alignOffset={-4}
          collisionPadding={12}
          className="z-[9998] outline-none"
          style={{
            width: 320,
            background: 'rgba(8,8,18,0.98)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '1.25rem',
            boxShadow:
              '0 24px 64px rgba(0,0,0,0.85), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: '#6366f1' }} />
              <p className="text-[13px] font-bold text-white">
                {isHe ? 'מרכז התראות' : 'Activity Feed'}
              </p>
            </div>
            {unreadCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {unreadCount} {isHe ? 'חדשות' : 'new'}
              </span>
            )}
          </div>

          {/* ── Feed ────────────────────────────────────────────────────────── */}
          <div
            className="max-h-[360px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Bell size={16} className="text-white/20" />
                </div>
                <p className="text-xs text-white/35 font-semibold">
                  {isHe ? 'אין עדיין פעילות' : 'No activity yet'}
                </p>
                <p className="text-[11px] text-white/20 mt-0.5 leading-relaxed">
                  {isHe
                    ? 'שלח הצעה ותראה פעולות לקוח כאן'
                    : 'Send a proposal to see client activity here'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {notifications.map((n) => {
                  const isNew = new Date(n.time).getTime() > seenAt
                  const isAccepted = n.type === 'accepted'
                  const iconColor = isAccepted ? '#22c55e' : '#6366f1'
                  const textEn = isAccepted
                    ? `${n.client} accepted "${n.title}"`
                    : `${n.client} viewed "${n.title}"`
                  const textHe = isAccepted
                    ? `${n.client} אישר את "${n.title}"`
                    : `${n.client} צפה ב-"${n.title}"`

                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
                      style={{
                        background: isNew ? 'rgba(99,102,241,0.07)' : 'transparent',
                      }}
                    >
                      {/* Icon badge */}
                      <div
                        className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-xl"
                        style={{ background: `${iconColor}18`, color: iconColor }}
                      >
                        {isAccepted ? <Check size={12} /> : <Eye size={12} />}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/72 leading-snug">
                          {isHe ? textHe : textEn}
                        </p>
                        <p className="text-[10px] text-white/28 mt-0.5">
                          {timeAgo(n.time, isHe)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isNew && (
                        <div
                          className="mt-2 h-2 w-2 flex-none rounded-full"
                          style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.6)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2.5 text-center"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[10px] text-white/20 font-medium">
                {isHe
                  ? 'מוצגות עד 20 הפעולות האחרונות'
                  : 'Showing up to 20 recent events'}
              </p>
            </div>
          )}

          <Popover.Arrow style={{ fill: 'rgba(8,8,18,0.98)' }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
