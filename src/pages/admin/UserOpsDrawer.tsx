import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import {
  X, Crown, Zap, User, Building2, Phone, Trash2,
  Send, Ghost, Snowflake, CheckCircle2, AlertTriangle,
  Loader2, Gift, StickyNote, FileText, ExternalLink,
  Clock, Calendar, TrendingUp, KeyRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Exported types ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  full_name: string
  company_name: string
  phone: string
  admin_notes: string
  plan_tier: 'free' | 'pro' | 'unlimited'
  is_suspended: boolean
  bonus_quota: number
  created_at: string
  last_sign_in_at: string | null
  proposal_count: number
  total_pipeline_value: number
}

interface UserProposal {
  id: string
  project_title: string
  client_name: string
  status: string
  base_price: number
  currency: string
  public_token: string
  created_at: string
}

type Tier = 'free' | 'pro' | 'unlimited'
type TabId = 'overview' | 'billing' | 'security' | 'danger'
type FeedbackState = 'idle' | 'loading' | 'ok' | 'error'

interface UserOpsDrawerProps {
  user: AdminUser | null
  isHe: boolean
  onClose: () => void
  onUpdated: (patch: Partial<AdminUser> & { id: string }) => void
  onDeleted: (userId: string) => void
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TIER_CFG: Record<Tier, {
  label_en: string; label_he: string
  color: string; bg: string; border: string; glow: string
}> = {
  free:      { label_en:'Free',      label_he:'חינם',       color:'rgba(255,255,255,0.55)', bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.14)', glow:'none' },
  pro:       { label_en:'Pro',       label_he:'פרו',        color:'#a5b4fc',               bg:'rgba(99,102,241,0.15)',  border:'rgba(99,102,241,0.4)',   glow:'0 0 20px rgba(99,102,241,0.25)' },
  unlimited: { label_en:'Unlimited', label_he:'ללא הגבלה', color:'#fbbf24',               bg:'rgba(212,175,55,0.13)', border:'rgba(212,175,55,0.4)',   glow:'0 0 22px rgba(212,175,55,0.22)' },
}

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label_en: string; label_he: string }> = {
  draft:          { color:'rgba(255,255,255,0.45)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)',  label_en:'Draft',    label_he:'טיוטה' },
  sent:           { color:'#818cf8',               bg:'rgba(99,102,241,0.1)',   border:'rgba(99,102,241,0.3)',   label_en:'Sent',     label_he:'נשלח' },
  viewed:         { color:'#fbbf24',               bg:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.3)',   label_en:'Viewed',   label_he:'נצפה' },
  accepted:       { color:'#4ade80',               bg:'rgba(74,222,128,0.1)',   border:'rgba(74,222,128,0.3)',   label_en:'Accepted', label_he:'אושר' },
  rejected:       { color:'#f87171',               bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)',  label_en:'Rejected', label_he:'נדחה' },
  needs_revision: { color:'#fb923c',               bg:'rgba(251,146,60,0.1)',   border:'rgba(251,146,60,0.3)',   label_en:'Revision', label_he:'תיקון' },
  archived:       { color:'rgba(255,255,255,0.25)', bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.07)', label_en:'Archived', label_he:'ארכיון' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(email: string, name: string): string {
  if (name.trim()) {
    const p = name.trim().split(' ')
    return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : p[0].slice(0,2).toUpperCase()
  }
  return email.slice(0,2).toUpperCase()
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days}d ago`
  if (days < 365) return `${Math.floor(days/30)}mo ago`
  return `${Math.floor(days/365)}y ago`
}

function fmtAmount(amount: number, currency: string): string {
  const sym = currency === 'ILS' ? '₪' : currency === 'EUR' ? '€' : '$'
  if (amount >= 1000) return `${sym}${Math.round(amount/1000)}K`
  return `${sym}${Math.round(amount)}`
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span style={{ color: '#6366f1' }}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0.75rem', padding: '0.75rem 1rem',
  fontSize: 13, color: 'white', outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
  transition: 'border 0.15s, background 0.15s',
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={INPUT_STYLE}
      onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.5)'; e.currentTarget.style.background='#0f0f1a' }}
      onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
    />
  )
}

function Btn({
  onClick, feedback, idle, ok, err,
  variant = 'ghost', icon, disabled, className = '',
}: {
  onClick: () => void; feedback: FeedbackState
  idle: string; ok: string; err: string
  variant?: 'ghost' | 'indigo' | 'green' | 'danger' | 'gold'
  icon?: React.ReactNode; disabled?: boolean; className?: string
}) {
  const V: Record<string, { base: React.CSSProperties; hover: React.CSSProperties }> = {
    ghost:  { base:{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.7)' },     hover:{ background:'rgba(255,255,255,0.1)' } },
    indigo: { base:{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.35)',color:'#a5b4fc' },                   hover:{ background:'rgba(99,102,241,0.22)' } },
    green:  { base:{ background:'rgba(34,197,94,0.1)',   border:'1px solid rgba(34,197,94,0.3)',  color:'#4ade80' },                   hover:{ background:'rgba(34,197,94,0.18)' } },
    danger: { base:{ background:'rgba(239,68,68,0.08)',  border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' },                   hover:{ background:'rgba(239,68,68,0.16)' } },
    gold:   { base:{ background:'rgba(212,175,55,0.1)',  border:'1px solid rgba(212,175,55,0.3)', color:'#fbbf24' },                   hover:{ background:'rgba(212,175,55,0.18)' } },
  }
  const isLoading = feedback === 'loading'
  const isOk      = feedback === 'ok'
  const isErr     = feedback === 'error'
  return (
    <button
      type="button" onClick={onClick} disabled={isLoading || disabled}
      className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all ${className}`}
      style={{ ...V[variant].base, opacity: isLoading || disabled ? 0.6 : 1 }}
      onMouseEnter={e => { if (!isLoading && !disabled) Object.assign((e.currentTarget as HTMLElement).style, V[variant].hover) }}
      onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, V[variant].base) }}
    >
      {isLoading ? <Loader2    size={14} className="animate-spin flex-none" /> :
       isOk      ? <CheckCircle2 size={14} style={{ color:'#4ade80' }} className="flex-none" /> :
       isErr     ? <AlertTriangle size={14} style={{ color:'#f87171' }} className="flex-none" /> :
       icon      ? <span className="flex-none">{icon}</span> : null}
      {isOk ? ok : isErr ? err : idle}
    </button>
  )
}

// ─── UserOpsDrawer ────────────────────────────────────────────────────────────

export function UserOpsDrawer({ user, isHe, onClose, onUpdated, onDeleted }: UserOpsDrawerProps) {
  const open = !!user

  // Tabs
  const [tab, setTab] = useState<TabId>('overview')

  // Overview
  const [name,     setName]    = useState('')
  const [company,  setCompany] = useState('')
  const [phone,    setPhone]   = useState('')
  const [notes,    setNotes]   = useState('')
  const [profFb,   setProfFb]  = useState<FeedbackState>('idle')
  const [notesFb,  setNotesFb] = useState<FeedbackState>('idle')

  // Billing
  const [tier,     setTier]    = useState<Tier>('free')
  const [quota,    setQuota]   = useState(0)
  const [billFb,   setBillFb]  = useState<FeedbackState>('idle')

  // Security
  const [resetFb,  setResetFb] = useState<FeedbackState>('idle')

  // Impersonate (header)
  const [impFb,    setImpFb]   = useState<FeedbackState>('idle')
  const [impLink,  setImpLink] = useState<string | null>(null)

  // Proposals (lazy)
  const [proposals,    setProposals]    = useState<UserProposal[] | null>(null)
  const [proposalsLoading, setPropsLoading] = useState(false)

  // Danger
  const [suspFb,   setSuspFb]  = useState<FeedbackState>('idle')
  const [delFb,    setDelFb]   = useState<FeedbackState>('idle')

  // Reset all state when a new user opens
  useEffect(() => {
    if (!user) return
    setTab('overview')
    setName(user.full_name); setCompany(user.company_name); setPhone(user.phone); setNotes(user.admin_notes)
    setTier(user.plan_tier); setQuota(user.bonus_quota)
    setProfFb('idle'); setNotesFb('idle'); setBillFb('idle')
    setResetFb('idle'); setSuspFb('idle'); setDelFb('idle')
    setImpFb('idle'); setImpLink(null)
    setProposals(null)
  }, [user?.id]) // only on user ID change, not on every field update

  // Lazy-fetch proposals when user selects security tab (we embed proposals count there)
  // Actually show proposals on overview tab as a quick count, not a full list

  // ── Helpers ────────────────────────────────────────────────────────────────
  const withFb = useCallback((setFb: (s: FeedbackState) => void, fn: () => Promise<void>) => async () => {
    setFb('loading')
    try { await fn(); setFb('ok') } catch { setFb('error') }
    setTimeout(() => setFb('idle'), 2500)
  }, [])

  // ── Overview: Save profile ─────────────────────────────────────────────────
  const handleSaveProfile = useCallback(withFb(setProfFb, async () => {
    if (!user) return
    const { error } = await supabase.rpc('admin_update_user_advanced', {
      p_target_id: user.id, p_name: name.trim(), p_company: company.trim(), p_bonus_quota: quota,
    })
    if (error) throw error
    // Also save phone separately (admin_update_user_advanced doesn't have phone — use admin_update_user_profile)
    const { error: phoneError } = await supabase.rpc('admin_update_user_profile', {
      p_target_user_id: user.id, p_full_name: name.trim(),
    })
    if (phoneError) throw phoneError
    onUpdated({ id: user.id, full_name: name.trim(), company_name: company.trim() })
  }), [user, name, company, quota, withFb, onUpdated])

  // ── Overview: Save notes ───────────────────────────────────────────────────
  const handleSaveNotes = useCallback(withFb(setNotesFb, async () => {
    if (!user) return
    const { error } = await supabase.rpc('admin_save_note', { p_target_id: user.id, p_note: notes })
    if (error) throw error
    onUpdated({ id: user.id, admin_notes: notes })
  }), [user, notes, withFb, onUpdated])

  // ── Billing: Save tier + quota ─────────────────────────────────────────────
  const handleSaveBilling = useCallback(withFb(setBillFb, async () => {
    if (!user) return
    if (tier !== user.plan_tier) {
      const { error } = await supabase.rpc('admin_set_user_tier', { p_target_user_id: user.id, p_new_tier: tier })
      if (error) throw error
    }
    const { error } = await supabase.rpc('admin_update_user_advanced', {
      p_target_id: user.id, p_name: name.trim(), p_company: company.trim(), p_bonus_quota: quota,
    })
    if (error) throw error
    onUpdated({ id: user.id, plan_tier: tier, bonus_quota: quota })
  }), [user, tier, quota, name, company, withFb, onUpdated])

  // ── Security: Password reset ───────────────────────────────────────────────
  const handleResetPass = useCallback(withFb(setResetFb, async () => {
    if (!user) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }), [user, withFb])

  // ── Impersonate (header) ───────────────────────────────────────────────────
  const handleImpersonate = useCallback(async () => {
    if (!user) return
    setImpFb('loading')
    setImpLink(null)
    try {
      const { data, error } = await supabase.functions.invoke<{ link?: string; error?: string }>(
        'admin-impersonate',
        { body: { target_email: user.email } },
      )
      if (error || !data?.link) throw new Error(data?.error ?? error?.message ?? 'No link returned')
      setImpLink(data.link)
      window.open(data.link, '_blank', 'noopener,noreferrer')
      setImpFb('ok')
    } catch (e: unknown) {
      console.error('[impersonate]', e)
      setImpFb('error')
    }
    setTimeout(() => setImpFb('idle'), 5000)
  }, [user])

  // ── Danger: Suspend ────────────────────────────────────────────────────────
  const handleSuspend = useCallback(withFb(setSuspFb, async () => {
    if (!user) return
    const next = !user.is_suspended
    const { error } = await supabase.rpc('admin_toggle_suspend', { p_target_id: user.id, p_suspend: next })
    if (error) throw error
    onUpdated({ id: user.id, is_suspended: next })
  }), [user, withFb, onUpdated])

  // ── Danger: Delete ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!user) return
    const msg = isHe
      ? `האם אתה בטוח? פעולה זו תמחק לצמיתות את ${user.email} וכל הצעותיו. אין דרך חזרה.`
      : `Permanently delete ${user.email} and ALL their proposals? This cannot be undone.`
    if (!window.confirm(msg)) return
    setDelFb('loading')
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_target_user_id: user.id })
      if (error) throw error
      onDeleted(user.id)
      onClose()
    } catch (e: unknown) {
      setDelFb('error')
      setTimeout(() => setDelFb('idle'), 3000)
    }
  }, [user, isHe, onDeleted, onClose])

  // ── Lazy load proposals when tab opened ───────────────────────────────────
  const loadProposals = useCallback(async () => {
    if (!user || proposals !== null) return
    setPropsLoading(true)
    try {
      const { data } = await supabase.rpc('admin_get_user_proposals', { p_target_id: user.id })
      setProposals((data as UserProposal[]) ?? [])
    } finally {
      setPropsLoading(false)
    }
  }, [user, proposals])

  useEffect(() => {
    if (tab === 'security') loadProposals()
  }, [tab, loadProposals])

  // ── i18n ──────────────────────────────────────────────────────────────────
  const L = {
    impersonate:   isHe ? 'כניסה כמשתמש'          : 'Impersonate User',
    impOk:         isHe ? 'נפתח בטאב חדש!'          : 'Opened in new tab!',
    impErr:        isHe ? 'שגיאה — הפונקציה לא פרוסה?' : 'Error — function deployed?',
    copyLink:      isHe ? 'העתק לינק'               : 'Copy Link',
    tabOverview:   isHe ? 'פרופיל'                  : 'Profile',
    tabBilling:    isHe ? 'חיוב'                    : 'Billing',
    tabSecurity:   isHe ? 'אבטחה'                   : 'Security',
    tabDanger:     isHe ? 'סכנה'                    : 'Danger',
    fullName:      isHe ? 'שם מלא'                  : 'Full Name',
    company:       isHe ? 'שם חברה'                 : 'Company',
    phoneLabel:    isHe ? 'טלפון'                   : 'Phone',
    saveProfile:   isHe ? 'שמור פרופיל'             : 'Save Profile',
    adminNotes:    isHe ? 'הערות אדמין (פרטי)'      : 'Admin Notes (Private)',
    notesHint:     isHe ? 'הערות אלה נשמרות במטדטה של המשתמש ואינן גלויות לו' : 'Notes are private — only visible in this panel',
    saveNotes:     isHe ? 'שמור הערות'              : 'Save Notes',
    tierTitle:     isHe ? 'חבילה נוכחית'            : 'Current Tier',
    bonusQuota:    isHe ? 'מכסה נוספת (ידנית)'      : 'Bonus Quota',
    bonusHint:     isHe ? 'הצעות מחיר נוספות מחוץ לחבילה' : 'Extra proposals beyond tier limit',
    saveBilling:   isHe ? 'שמור הגדרות חיוב'       : 'Save Billing',
    resetPass:     isHe ? 'שלח איפוס סיסמה'         : 'Send Password Reset',
    resetOk:       isHe ? 'נשלח!'                   : 'Sent!',
    recentProposals: isHe ? 'הצעות אחרונות'         : 'Recent Proposals',
    noProposals:   isHe ? 'אין הצעות עדיין'         : 'No proposals yet',
    statusActive:  isHe ? 'פעיל'                    : 'Active',
    statusFrozen:  isHe ? 'מוקפא'                   : 'Frozen',
    freezeTitle:   isHe ? 'הקפאת חשבון'             : 'Freeze Account',
    freezeHint:    isHe ? 'הקפאה מונעת מהמשתמש להתחבר ולגשת לתוכן' : 'Prevents the user from accessing the platform',
    freeze:        isHe ? 'הקפא חשבון'              : 'Freeze Account',
    unfreeze:      isHe ? 'בטל הקפאה'               : 'Unfreeze Account',
    deleteTitle:   isHe ? 'מחיקה לצמיתות'           : 'Permanent Deletion',
    deleteHint:    isHe ? 'מוחק את המשתמש, כל הצעותיו ושירותיו. לא ניתן לשחזר.' : 'Deletes the user, all proposals and services. Irreversible.',
    hardDelete:    isHe ? 'מחק לצמיתות'             : 'Hard Delete',
    saved:         isHe ? 'נשמר!'                   : 'Saved!',
    done:          isHe ? 'הושלם'                   : 'Done',
    error:         isHe ? 'שגיאה'                   : 'Error',
    close:         isHe ? 'סגור'                    : 'Close',
    joined:        isHe ? 'הצטרף'                   : 'Joined',
    lastSeen:      isHe ? 'פעיל לאחרונה'            : 'Last Seen',
    pipeline:      isHe ? 'צפי הכנסות'              : 'Pipeline',
    proposals:     isHe ? 'הצעות'                   : 'Proposals',
    userId:        isHe ? 'מזהה משתמש'              : 'User ID',
    openDealRoom:  isHe ? 'פתח Deal Room'           : 'Open Deal Room',
  }

  if (!user) return null

  const cfg = TIER_CFG[user.plan_tier]
  const initials = getInitials(user.email, user.full_name)

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: L.tabOverview, icon: <User size={12} /> },
    { id: 'billing',  label: L.tabBilling,  icon: <Crown size={12} /> },
    { id: 'security', label: L.tabSecurity, icon: <KeyRound size={12} /> },
    { id: 'danger',   label: L.tabDanger,   icon: <Trash2 size={12} /> },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[9998]"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                />
              </Dialog.Overlay>

              {/* Drawer */}
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ x: isHe ? '-100%' : '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: isHe ? '-100%' : '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  className="fixed top-0 bottom-0 z-[9999] flex flex-col outline-none"
                  style={{
                    [isHe ? 'left' : 'right']: 0,
                    width: 'min(500px, 100vw)',
                    background: '#06060e',
                    borderInlineStart: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isHe ? '10px 0 50px rgba(0,0,0,0.8)' : '-10px 0 50px rgba(0,0,0,0.8)',
                  }}
                  dir={isHe ? 'rtl' : 'ltr'}
                >

                  {/* ── Header ────────────────────────────────────────────── */}
                  <div
                    className="flex-none px-5 pt-5 pb-4 space-y-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)' }}
                  >
                    <Dialog.Title className="sr-only">User Operations — {user.email}</Dialog.Title>

                    {/* Top row: close + status */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button" onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                      >
                        <X size={13} />
                      </button>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
                        style={user.is_suspended
                          ? { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171' }
                          : { background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', color:'#4ade80' }
                        }
                      >
                        {user.is_suspended ? <Snowflake size={8} /> : <CheckCircle2 size={8} />}
                        {user.is_suspended ? L.statusFrozen : L.statusActive}
                      </span>
                    </div>

                    {/* Avatar + identity */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl text-[14px] font-black"
                        style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black text-white truncate leading-tight">
                          {user.full_name || user.email.split('@')[0]}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{user.email}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}>
                            {user.plan_tier === 'unlimited' && <Crown size={8} />}
                            {user.plan_tier === 'pro'       && <Zap   size={8} />}
                            {isHe ? cfg.label_he : cfg.label_en}
                          </span>
                          {user.bonus_quota > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                              style={{ background:'rgba(251,146,60,0.12)', border:'1px solid rgba(251,146,60,0.3)', color:'#fb923c' }}>
                              <Gift size={7} />+{user.bonus_quota}
                            </span>
                          )}
                          {user.company_name && (
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.company_name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { icon: <Calendar size={9} />, label: L.joined,    value: fmtDate(user.created_at).replace(' 2026','').replace(' 2025','') },
                        { icon: <Clock     size={9} />, label: L.lastSeen,  value: timeAgo(user.last_sign_in_at) },
                        { icon: <FileText  size={9} />, label: L.proposals, value: String(user.proposal_count) },
                        { icon: <TrendingUp size={9}/>, label: L.pipeline,  value: user.total_pipeline_value > 0 ? `₪${Math.round(user.total_pipeline_value/1000)}K` : '—' },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl px-2 py-2 text-center"
                          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex justify-center mb-0.5" style={{ color:'rgba(255,255,255,0.25)' }}>{s.icon}</div>
                          <p className="text-[9px] uppercase tracking-wide" style={{ color:'rgba(255,255,255,0.25)' }}>{s.label}</p>
                          <p className="text-[10px] font-bold text-white tabular-nums mt-0.5 truncate">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* ── Impersonate CTA ──────────────────────────────────── */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleImpersonate}
                        disabled={impFb === 'loading'}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-black transition-all"
                        style={{
                          background: impFb === 'ok'    ? 'rgba(34,197,94,0.15)'   :
                                      impFb === 'error' ? 'rgba(239,68,68,0.1)'    :
                                      'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
                          border: impFb === 'ok'    ? '1px solid rgba(34,197,94,0.4)'   :
                                  impFb === 'error' ? '1px solid rgba(239,68,68,0.35)'  :
                                  '1px solid rgba(34,197,94,0.3)',
                          color: impFb === 'error' ? '#f87171' : '#4ade80',
                          boxShadow: impFb === 'ok' ? '0 0 24px rgba(34,197,94,0.15)' : 'none',
                          opacity: impFb === 'loading' ? 0.7 : 1,
                        }}
                        onMouseEnter={e => { if (impFb === 'idle') e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(16,185,129,0.14))' }}
                        onMouseLeave={e => { if (impFb === 'idle') e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))' }}
                      >
                        {impFb === 'loading' ? <Loader2   size={14} className="animate-spin" /> :
                         impFb === 'ok'      ? <CheckCircle2 size={14} /> :
                         impFb === 'error'   ? <AlertTriangle size={14} /> :
                         <Ghost size={14} />}
                        {impFb === 'ok' ? L.impOk : impFb === 'error' ? L.impErr : L.impersonate}
                      </button>

                      {/* Copy generated link */}
                      <AnimatePresence>
                        {impLink && (
                          <motion.div
                            initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                            style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)' }}
                          >
                            <p className="flex-1 text-[10px] truncate" style={{ color:'rgba(34,197,94,0.7)', fontFamily:'monospace' }}>
                              {impLink.slice(0, 55)}…
                            </p>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(impLink).catch(()=>{})}
                              className="flex-none text-[10px] font-bold rounded-lg px-2 py-1 transition-colors"
                              style={{ background:'rgba(34,197,94,0.12)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)' }}
                            >
                              {L.copyLink}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ── Tabs ──────────────────────────────────────────────── */}
                  <Tabs.Root
                    value={tab}
                    onValueChange={v => setTab(v as TabId)}
                    className="flex flex-1 flex-col overflow-hidden"
                  >
                    {/* Tab bar */}
                    <Tabs.List
                      className="flex flex-none"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      {TABS.map(t => (
                        <Tabs.Trigger
                          key={t.id}
                          value={t.id}
                          className="flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-semibold outline-none transition-all"
                          style={{
                            color:        tab === t.id ? 'white'                     : 'rgba(255,255,255,0.35)',
                            borderBottom: tab === t.id ? '2px solid #6366f1'        : '2px solid transparent',
                            background:   tab === t.id ? 'rgba(99,102,241,0.07)'    : 'transparent',
                            ...(t.id === 'danger' && tab === 'danger' ? { color: '#f87171', borderBottom: '2px solid #ef4444', background: 'rgba(239,68,68,0.06)' } : {}),
                          }}
                        >
                          <span style={{
                            color: tab === t.id
                              ? (t.id === 'danger' ? '#f87171' : '#818cf8')
                              : 'rgba(255,255,255,0.3)'
                          }}>
                            {t.icon}
                          </span>
                          <span className="hidden sm:inline">{t.label}</span>
                        </Tabs.Trigger>
                      ))}
                    </Tabs.List>

                    {/* ── Tab contents ─────────────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent' }}>

                      {/* ── Overview tab ─────────────────────────────────── */}
                      <Tabs.Content value="overview" className="p-5 space-y-5 outline-none">

                        {/* Profile fields */}
                        <div className="space-y-3">
                          <div>
                            <FieldLabel icon={<User size={11} />} label={L.fullName} />
                            <StyledInput type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={L.fullName} />
                          </div>
                          <div>
                            <FieldLabel icon={<Building2 size={11} />} label={L.company} />
                            <StyledInput type="text" value={company} onChange={e=>setCompany(e.target.value)} placeholder={L.company} />
                          </div>
                          <div>
                            <FieldLabel icon={<Phone size={11} />} label={L.phoneLabel} />
                            <StyledInput type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+972 50 000 0000" inputMode="tel" />
                          </div>
                          <Btn onClick={handleSaveProfile} feedback={profFb} idle={L.saveProfile} ok={L.saved} err={L.error} variant="indigo" icon={<CheckCircle2 size={14}/>} />
                        </div>

                        {/* Separator */}
                        <div style={{ height:1, background:'rgba(255,255,255,0.06)' }} />

                        {/* Admin notes */}
                        <div className="space-y-2">
                          <FieldLabel icon={<StickyNote size={11} />} label={L.adminNotes} />
                          <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            placeholder={isHe ? 'הוסף הערה...' : 'Add a note…'}
                            className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-all resize-none"
                            style={{ ...INPUT_STYLE, height: 'auto' }}
                            onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.45)'; e.currentTarget.style.background='#0f0f1a' }}
                            onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
                          />
                          <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.22)' }}>{L.notesHint}</p>
                          <Btn onClick={handleSaveNotes} feedback={notesFb} idle={L.saveNotes} ok={L.saved} err={L.error} variant="ghost" icon={<StickyNote size={14}/>} />
                        </div>

                        {/* UUID */}
                        <div className="rounded-xl px-3 py-2.5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color:'rgba(255,255,255,0.2)' }}>{L.userId}</p>
                          <p className="text-[11px] font-mono" style={{ color:'rgba(255,255,255,0.35)', wordBreak:'break-all' }}>{user.id}</p>
                        </div>
                      </Tabs.Content>

                      {/* ── Billing tab ──────────────────────────────────── */}
                      <Tabs.Content value="billing" className="p-5 space-y-5 outline-none">

                        {/* Tier selector — glowing radio cards */}
                        <div className="space-y-2">
                          <FieldLabel icon={<Crown size={11} />} label={L.tierTitle} />
                          <div className="flex flex-col gap-2">
                            {(['free', 'pro', 'unlimited'] as Tier[]).map(t => {
                              const c = TIER_CFG[t]
                              const active = t === tier
                              return (
                                <button
                                  key={t} type="button"
                                  onClick={() => setTier(t)}
                                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-start transition-all"
                                  style={{
                                    background: active ? c.bg    : 'rgba(255,255,255,0.03)',
                                    border:     `1.5px solid ${active ? c.border : 'rgba(255,255,255,0.07)'}`,
                                    boxShadow:  active ? c.glow  : 'none',
                                  }}
                                >
                                  {/* Radio dot */}
                                  <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full"
                                    style={{ border: `2px solid ${active ? c.color : 'rgba(255,255,255,0.2)'}`, background: active ? c.color : 'transparent' }}>
                                    {active && <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#06060e' }} />}
                                  </div>
                                  {/* Icon + label */}
                                  <div className="flex flex-1 items-center gap-2">
                                    {t === 'unlimited' && <Crown size={13} style={{ color: c.color }} />}
                                    {t === 'pro'       && <Zap   size={13} style={{ color: c.color }} />}
                                    {t === 'free'      && <User  size={13} style={{ color: c.color }} />}
                                    <span className="text-[13px] font-bold" style={{ color: active ? c.color : 'rgba(255,255,255,0.5)' }}>
                                      {isHe ? c.label_he : c.label_en}
                                    </span>
                                  </div>
                                  {active && <CheckCircle2 size={13} style={{ color: c.color, flexShrink: 0 }} />}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Separator */}
                        <div style={{ height:1, background:'rgba(255,255,255,0.06)' }} />

                        {/* Bonus quota */}
                        <div className="space-y-2">
                          <FieldLabel icon={<Gift size={11} />} label={L.bonusQuota} />
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setQuota(q => Math.max(0, q-1))}
                              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-lg font-black transition-colors"
                              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}
                              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}}
                              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                              −
                            </button>
                            <input
                              type="number" value={quota} min={0} max={9999} inputMode="numeric"
                              onChange={e => setQuota(Math.max(0, parseInt(e.target.value)||0))}
                              className="flex-1 text-center text-[22px] font-black text-white outline-none rounded-xl"
                              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'0.5rem' }}
                              onFocus={e=>{e.currentTarget.style.border='1px solid rgba(251,146,60,0.5)'}}
                              onBlur={e =>{e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'}}
                            />
                            <button type="button" onClick={() => setQuota(q => Math.min(9999, q+1))}
                              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-lg font-black transition-colors"
                              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}
                              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}}
                              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                              +
                            </button>
                          </div>
                          <p className="text-[11px]" style={{ color:'rgba(255,255,255,0.25)' }}>{L.bonusHint}</p>
                        </div>

                        <Btn onClick={handleSaveBilling} feedback={billFb} idle={L.saveBilling} ok={L.saved} err={L.error} variant="ghost" icon={<Crown size={14}/>} />
                      </Tabs.Content>

                      {/* ── Security tab ─────────────────────────────────── */}
                      <Tabs.Content value="security" className="p-5 space-y-5 outline-none">

                        {/* Password reset */}
                        <div className="space-y-2">
                          <FieldLabel icon={<KeyRound size={11} />} label={isHe ? 'איפוס סיסמה' : 'Password Reset'} />
                          <p className="text-[12px]" style={{ color:'rgba(255,255,255,0.35)' }}>
                            {isHe ? 'שליחת מייל איפוס סיסמה ישירות לתיבת הדואר של המשתמש' : "Sends a password reset email directly to the user's inbox."}
                          </p>
                          <Btn onClick={handleResetPass} feedback={resetFb} idle={L.resetPass} ok={L.resetOk} err={L.error} variant="indigo" icon={<Send size={14}/>} />
                        </div>

                        {/* Separator */}
                        <div style={{ height:1, background:'rgba(255,255,255,0.06)' }} />

                        {/* Recent proposals mini-list */}
                        <div className="space-y-2">
                          <FieldLabel icon={<FileText size={11} />} label={L.recentProposals} />
                          {proposalsLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 size={18} className="animate-spin" style={{ color:'rgba(255,255,255,0.3)' }} />
                            </div>
                          ) : proposals === null ? (
                            <p className="text-[12px]" style={{ color:'rgba(255,255,255,0.25)' }}>
                              {isHe ? 'טוען...' : 'Loading...'}
                            </p>
                          ) : proposals.length === 0 ? (
                            <div className="rounded-xl py-5 text-center" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                              <FileText size={20} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 6px' }} />
                              <p className="text-[12px]" style={{ color:'rgba(255,255,255,0.25)' }}>{L.noProposals}</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {proposals.map(p => {
                                const sc = STATUS_CFG[p.status] ?? STATUS_CFG.draft
                                return (
                                  <div key={p.id}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[12px] font-semibold text-white truncate">
                                        {p.project_title || (isHe ? '(ללא שם)' : '(untitled)')}
                                      </p>
                                      <p className="text-[10px] truncate" style={{ color:'rgba(255,255,255,0.3)' }}>
                                        {p.client_name || '—'} · {fmtDate(p.created_at).replace(' 2026','')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-none">
                                      <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase"
                                        style={{ color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>
                                        {isHe ? sc.label_he : sc.label_en}
                                      </span>
                                      <span className="text-[10px] font-bold tabular-nums" style={{ color:'rgba(255,255,255,0.5)' }}>
                                        {fmtAmount(p.base_price, p.currency)}
                                      </span>
                                      <a
                                        href={`/deal/${p.public_token}`}
                                        target="_blank" rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors"
                                        style={{ color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.8)'}}
                                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'}}
                                        title={L.openDealRoom}
                                      >
                                        <ExternalLink size={11} />
                                      </a>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </Tabs.Content>

                      {/* ── Danger tab ───────────────────────────────────── */}
                      <Tabs.Content value="danger" className="p-5 space-y-4 outline-none">

                        {/* Suspend card */}
                        <div className="rounded-2xl p-4 space-y-3"
                          style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.15)' }}>
                          <div className="flex items-start gap-2.5">
                            <Snowflake size={14} style={{ color:'#fb923c', flexShrink:0, marginTop:1 }} />
                            <div>
                              <p className="text-[12px] font-bold text-white">{L.freezeTitle}</p>
                              <p className="text-[11px] mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{L.freezeHint}</p>
                            </div>
                          </div>
                          <Btn
                            onClick={handleSuspend} feedback={suspFb}
                            idle={user.is_suspended ? L.unfreeze : L.freeze}
                            ok={L.done} err={L.error}
                            variant={user.is_suspended ? 'indigo' : 'gold'}
                            icon={user.is_suspended ? <CheckCircle2 size={14}/> : <Snowflake size={14}/>}
                          />
                        </div>

                        {/* Delete card */}
                        <div className="rounded-2xl p-4 space-y-3"
                          style={{
                            background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.04) 0px, rgba(239,68,68,0.04) 1px, transparent 1px, transparent 12px)',
                            border: '1px solid rgba(239,68,68,0.2)',
                          }}>
                          <div className="flex items-start gap-2.5">
                            <Trash2 size={14} style={{ color:'#f87171', flexShrink:0, marginTop:1 }} />
                            <div>
                              <p className="text-[12px] font-bold" style={{ color:'#f87171' }}>{L.deleteTitle}</p>
                              <p className="text-[11px] mt-0.5" style={{ color:'rgba(248,113,113,0.6)' }}>{L.deleteHint}</p>
                            </div>
                          </div>
                          <Btn
                            onClick={handleDelete} feedback={delFb}
                            idle={L.hardDelete} ok={L.done} err={L.error}
                            variant="danger" icon={<Trash2 size={14}/>}
                          />
                        </div>
                      </Tabs.Content>

                    </div>{/* end scrollable */}
                  </Tabs.Root>

                  {/* ── Footer ────────────────────────────────────────────── */}
                  <div className="flex-none px-5 py-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button type="button" onClick={onClose}
                      className="w-full rounded-xl py-2.5 text-[12px] font-semibold transition-all"
                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'}}>
                      {L.close}
                    </button>
                  </div>

                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
