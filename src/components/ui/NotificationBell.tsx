import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Popover from '@radix-ui/react-popover'
import { Bell, Eye, Check, CheckCheck } from 'lucide-react'
import { useProposalStore } from '../../stores/useProposalStore'
import { useI18n } from '../../lib/i18n'
import type { Proposal } from '../../types/proposal'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'viewed' | 'accepted'

interface Notif {
  id: string
  proposalId: string
  type: NotifType
  title: string
  client: string
  time: string
  /** view_count — shown as ×N suffix to de-spam repeated views */
  viewCount?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEEN_KEY = 'ds:notif-seen'

function deriveNotifications(proposals: Proposal[]): Notif[] {
  const notifs: Notif[] = []

  for (const p of proposals) {
    // ── Accepted ────────────────────────────────────────────────────────────
    // Guard: accepted_at must exist — it is set atomically by the accept_proposal
    // RPC when the client actually signs. Using updated_at would cause phantom
    // notifications every time the owner autosaves the proposal.
    if (p.status === 'accepted' && p.accepted_at) {
      notifs.push({
        id: `accepted-${p.id}`,
        proposalId: p.id,
        type: 'accepted',
        title: p.project_title || '—',
        client: p.client_name || '—',
        time: p.accepted_at,   // ← always the actual signing timestamp
      })
    }

    // ── Viewed ──────────────────────────────────────────────────────────────
    // Guards:
    // 1. last_viewed_at must exist (obvious)
    // 2. sent_at must exist — proposal must have been sent to the client first.
    //    Without this, the owner previewing their own deal room URL triggers a
    //    "viewed" notification before the client ever sees it.
    // 3. Skip accepted proposals — the accepted notification already covers them.
    if (p.last_viewed_at && p.sent_at && p.status !== 'accepted') {
      notifs.push({
        id: `viewed-${p.id}`,
        proposalId: p.id,
        type: 'viewed',
        title: p.project_title || '—',
        client: p.client_name || '—',
        time: p.last_viewed_at,
        viewCount: p.view_count ?? 1,
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
  if (mins < 2)   return isHe ? 'הרגע'             : 'just now'
  if (mins < 60)  return isHe ? `לפני ${mins} דק'`  : `${mins}m ago`
  if (hours < 24) return isHe ? `לפני ${hours} שע'` : `${hours}h ago`
  return isHe ? `לפני ${days} ימים` : `${days}d ago`
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

export function NotificationBell() {
  const { proposals } = useProposalStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // seenAt as state so markAllAsRead triggers a re-render immediately
  const [seenAt, setSeenAt] = useState<number>(() =>
    Number(localStorage.getItem(SEEN_KEY) ?? 0)
  )

  const notifications = useMemo(() => deriveNotifications(proposals), [proposals])

  const unreadCount = useMemo(
    () => notifications.filter(n => new Date(n.time).getTime() > seenAt).length,
    [notifications, seenAt]
  )

  // Explicit mark-all-as-read — NOT triggered on open
  const markAllAsRead = useCallback(() => {
    const now = Date.now()
    localStorage.setItem(SEEN_KEY, String(now))
    setSeenAt(now)
  }, [])

  // Clicking a notification: mark all read, close, navigate
  const handleNotifClick = useCallback((n: Notif) => {
    markAllAsRead()
    setOpen(false)
    navigate(`/proposals/${n.proposalId}`)
  }, [navigate, markAllAsRead])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-white/35 transition-colors hover:text-slate-700 dark:hover:text-white/75"
          style={{ border: '1px solid var(--border-glass)', background: 'var(--bg-card)' }}
          aria-label={isHe ? 'התראות' : 'Notifications'}
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[8px] font-black text-white"
              style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.55)' }}
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
          className="z-[9998] outline-none bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/9"
          style={{
            width: 320,
            borderRadius: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/7"
          >
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: '#6366f1' }} />
              <p className="text-[13px] font-bold text-main">
                {isHe ? 'מרכז התראות' : 'Activity Feed'}
              </p>
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors"
                style={{
                  color: 'rgba(129,140,248,0.8)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  background: 'rgba(99,102,241,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
                  e.currentTarget.style.color = '#a5b4fc'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                  e.currentTarget.style.color = 'rgba(129,140,248,0.8)'
                }}
              >
                <CheckCheck size={11} />
                {isHe ? 'סמן הכל כנקרא' : 'Mark all read'}
              </button>
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
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/4 border border-slate-200 dark:border-white/7"
                >
                  <Bell size={16} className="text-slate-400 dark:text-white/20" />
                </div>
                <p className="text-xs text-muted font-semibold">
                  {isHe ? 'אין עדיין פעילות' : 'No activity yet'}
                </p>
                <p className="text-[11px] text-muted opacity-60 mt-0.5 leading-relaxed">
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

                  // De-spammed label: "viewed ×N" when viewed more than once
                  const viewSuffix = !isAccepted && n.viewCount && n.viewCount > 1
                    ? ` (×${n.viewCount})`
                    : ''

                  const textEn = isAccepted
                    ? `${n.client} accepted "${n.title}"`
                    : `${n.client} viewed "${n.title}"${viewSuffix}`
                  const textHe = isAccepted
                    ? `${n.client} אישר את "${n.title}"`
                    : `${n.client} צפה ב-"${n.title}"${viewSuffix}`

                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotifClick(n)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-all"
                      style={{
                        background: isNew ? 'rgba(99,102,241,0.07)' : 'transparent',
                        borderInlineStart: isNew ? '2px solid #6366f1' : '2px solid transparent',
                        opacity: isNew ? 1 : 0.65,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.opacity = '1'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isNew ? 'rgba(99,102,241,0.07)' : 'transparent'
                        e.currentTarget.style.opacity = isNew ? '1' : '0.65'
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
                        <p className="text-[12px] font-medium text-main leading-snug">
                          {isHe ? textHe : textEn}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">
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
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 text-center border-t border-slate-100 dark:border-white/6">
              <p className="text-[10px] text-muted opacity-60 font-medium">
                {isHe
                  ? 'מוצגות עד 20 הפעולות האחרונות'
                  : 'Showing up to 20 recent events'}
              </p>
            </div>
          )}

          <Popover.Arrow className="fill-white dark:fill-[rgba(8,8,18,0.98)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
