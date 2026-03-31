import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Crown, Zap, User, Building2, Shield, Trash2,
  Send, Link2, Snowflake, CheckCircle2, AlertTriangle,
  Loader2, Gift, BadgeDollarSign, KeyRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  full_name: string
  company_name: string
  plan_tier: 'free' | 'pro' | 'unlimited'
  is_suspended: boolean
  bonus_quota: number
  created_at: string
  last_sign_in_at: string | null
  proposal_count: number
  total_pipeline_value: number
}

type Tier = 'free' | 'pro' | 'unlimited'

interface UserOpsDrawerProps {
  user: AdminUser | null
  isHe: boolean
  onClose: () => void
  onUpdated: (patch: Partial<AdminUser> & { id: string }) => void
  onDeleted: (userId: string) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_CFG: Record<Tier, { label_en: string; label_he: string; color: string; bg: string; border: string; glow: string }> = {
  free:      { label_en: 'Free',      label_he: 'חינם',        color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', glow: 'none' },
  pro:       { label_en: 'Pro',       label_he: 'פרו',         color: '#a5b4fc',               bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.4)',   glow: '0 0 14px rgba(99,102,241,0.3)' },
  unlimited: { label_en: 'Unlimited', label_he: 'ללא הגבלה',  color: '#fbbf24',               bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.4)',   glow: '0 0 16px rgba(212,175,55,0.25)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(email: string, name: string): string {
  if (name.trim()) {
    const p = name.trim().split(' ')
    return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Shared field styles ──────────────────────────────────────────────────────

const fieldInput: React.CSSProperties = {
  width: '100%', background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem',
  padding: '0.75rem 1rem', fontSize: 13, color: 'white',
  outline: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
  transition: 'border 0.15s, background 0.15s',
}

function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span style={{ color: '#6366f1' }}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
    </div>
  )
}

function SectionHeader({ icon, title, color = '#6366f1' }: { icon: React.ReactNode; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-[12px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</p>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
}

type FeedbackState = 'idle' | 'loading' | 'ok' | 'error'

function ActionButton({
  onClick, feedback, labelIdle, labelOk, labelErr,
  variant = 'default', icon, disabled,
}: {
  onClick: () => void
  feedback: FeedbackState
  labelIdle: string; labelOk: string; labelErr: string
  variant?: 'default' | 'indigo' | 'danger'
  icon?: React.ReactNode
  disabled?: boolean
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',   color: 'rgba(255,255,255,0.7)' },
    indigo:  { background: 'rgba(99,102,241,0.12)',  border: '1px solid rgba(99,102,241,0.35)',   color: '#a5b4fc' },
    danger:  { background: 'rgba(239,68,68,0.08)',   border: '1px solid rgba(239,68,68,0.25)',    color: '#f87171' },
  }
  const hoverStyles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(255,255,255,0.09)' },
    indigo:  { background: 'rgba(99,102,241,0.2)' },
    danger:  { background: 'rgba(239,68,68,0.15)' },
  }

  const isLoading = feedback === 'loading'
  const isOk      = feedback === 'ok'
  const isErr     = feedback === 'error'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all"
      style={{ ...styles[variant], opacity: isLoading || disabled ? 0.6 : 1 }}
      onMouseEnter={e => { if (!isLoading && !disabled) Object.assign((e.currentTarget as HTMLElement).style, hoverStyles[variant]) }}
      onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, styles[variant]) }}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin flex-none" /> :
       isOk      ? <CheckCircle2 size={14} style={{ color: '#4ade80' }} className="flex-none" /> :
       isErr     ? <AlertTriangle size={14} style={{ color: '#f87171' }} className="flex-none" /> :
       icon ? <span className="flex-none">{icon}</span> : null}
      {isOk ? labelOk : isErr ? labelErr : labelIdle}
    </button>
  )
}

// ─── UserOpsDrawer ────────────────────────────────────────────────────────────

export function UserOpsDrawer({ user, isHe, onClose, onUpdated, onDeleted }: UserOpsDrawerProps) {
  const open = !!user

  // ── Section A state ──────────────────────────────────────────────────────
  const [name,        setName]       = useState('')
  const [company,     setCompany]    = useState('')
  const [profileFb,   setProfileFb]  = useState<FeedbackState>('idle')

  // ── Section B state ──────────────────────────────────────────────────────
  const [tier,        setTierLocal]  = useState<Tier>('free')
  const [bonusQuota,  setBonusQuota] = useState(0)
  const [billingFb,   setBillingFb]  = useState<FeedbackState>('idle')

  // ── Section C state ──────────────────────────────────────────────────────
  const [resetFb,     setResetFb]    = useState<FeedbackState>('idle')
  const [linkFb,      setLinkFb]     = useState<FeedbackState>('idle')

  // ── Section D state ──────────────────────────────────────────────────────
  const [suspendFb,   setSuspendFb]  = useState<FeedbackState>('idle')
  const [deleteFb,    setDeleteFb]   = useState<FeedbackState>('idle')

  // Reset form when user changes
  useEffect(() => {
    if (!user) return
    setName(user.full_name)
    setCompany(user.company_name)
    setTierLocal(user.plan_tier)
    setBonusQuota(user.bonus_quota)
    setProfileFb('idle'); setBillingFb('idle')
    setResetFb('idle');   setLinkFb('idle')
    setSuspendFb('idle'); setDeleteFb('idle')
  }, [user])

  // Auto-clear feedback after 2.5s
  const withFeedback = useCallback((setFb: (s: FeedbackState) => void, fn: () => Promise<void>) => async () => {
    setFb('loading')
    try {
      await fn()
      setFb('ok')
    } catch {
      setFb('error')
    }
    setTimeout(() => setFb('idle'), 2500)
  }, [])

  // ── Section A: Save profile ───────────────────────────────────────────────
  const handleSaveProfile = useCallback(withFeedback(setProfileFb, async () => {
    if (!user) return
    const { error } = await supabase.rpc('admin_update_user_advanced', {
      p_target_id:   user.id,
      p_name:        name.trim(),
      p_company:     company.trim(),
      p_bonus_quota: bonusQuota,
    })
    if (error) throw error
    onUpdated({ id: user.id, full_name: name.trim(), company_name: company.trim(), bonus_quota: bonusQuota })
  }), [user, name, company, bonusQuota, withFeedback, onUpdated])

  // ── Section B: Save billing (tier + quota together) ───────────────────────
  const handleSaveBilling = useCallback(withFeedback(setBillingFb, async () => {
    if (!user) return
    // Tier
    if (tier !== user.plan_tier) {
      const { error } = await supabase.rpc('admin_set_user_tier', { p_target_user_id: user.id, p_new_tier: tier })
      if (error) throw error
    }
    // Quota
    const { error } = await supabase.rpc('admin_update_user_advanced', {
      p_target_id:   user.id,
      p_name:        name.trim(),
      p_company:     company.trim(),
      p_bonus_quota: bonusQuota,
    })
    if (error) throw error
    onUpdated({ id: user.id, plan_tier: tier, bonus_quota: bonusQuota })
  }), [user, tier, bonusQuota, name, company, withFeedback, onUpdated])

  // ── Section C: Password reset ──────────────────────────────────────────────
  const handleResetPassword = useCallback(withFeedback(setResetFb, async () => {
    if (!user) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }), [user, withFeedback])

  // ── Section C: Copy magic link ─────────────────────────────────────────────
  const handleCopyLink = useCallback(withFeedback(setLinkFb, async () => {
    if (!user) return
    await navigator.clipboard.writeText(user.email)
    // intentional: full impersonation requires Service Role edge function (planned)
  }), [user, withFeedback])

  // ── Section D: Suspend toggle ──────────────────────────────────────────────
  const handleSuspend = useCallback(withFeedback(setSuspendFb, async () => {
    if (!user) return
    const next = !user.is_suspended
    const { error } = await supabase.rpc('admin_toggle_suspend', { p_target_id: user.id, p_suspend: next })
    if (error) throw error
    onUpdated({ id: user.id, is_suspended: next })
  }), [user, withFeedback, onUpdated])

  // ── Section D: Hard delete ─────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!user) return
    const msg = isHe
      ? `האם אתה בטוח? פעולה זו תמחק לצמיתות את ${user.email} וכל הצעותיו. לא ניתן לבטל.`
      : `Are you sure? This permanently deletes ${user.email} and all their data. Cannot be undone.`
    if (!window.confirm(msg)) return
    setDeleteFb('loading')
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_target_user_id: user.id })
      if (error) throw error
      onDeleted(user.id)
      onClose()
    } catch (e: unknown) {
      setDeleteFb('error')
      setTimeout(() => setDeleteFb('idle'), 3000)
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }, [user, isHe, onDeleted, onClose])

  // ── i18n ──────────────────────────────────────────────────────────────────
  const L = {
    identity:        isHe ? 'תמיכה וזהות'        : 'Support & Identity',
    billing:         isHe ? 'חיוב ומכסה'          : 'Billing & Quota',
    auth:            isHe ? 'פעולות אימות'         : 'Auth Actions',
    danger:          isHe ? 'אזור סכנה'            : 'Danger Zone',
    fullName:        isHe ? 'שם מלא'               : 'Full Name',
    companyName:     isHe ? 'שם חברה'              : 'Company Name',
    saveProfile:     isHe ? 'שמור פרופיל'          : 'Save Profile',
    saved:           isHe ? 'נשמר!'                : 'Saved!',
    error:           isHe ? 'שגיאה'                : 'Error',
    currentTier:     isHe ? 'חבילה נוכחית'         : 'Current Tier',
    bonusQuota:      isHe ? 'מכסה נוספת (ידנית)'   : 'Bonus Quota (Manual)',
    bonusHelper:     isHe ? 'הצעות נוספות מחוץ לחבילה' : 'Extra proposals beyond tier limit',
    saveBilling:     isHe ? 'שמור הגדרות חיוב'    : 'Save Billing Settings',
    resetPass:       isHe ? 'שלח איפוס סיסמה'      : 'Send Password Reset',
    resetOk:         isHe ? 'נשלח בהצלחה!'         : 'Email sent!',
    copyLink:        isHe ? 'העתק לינק כניסה'      : 'Copy Email (Impersonate)',
    copyOk:          isHe ? 'הועתק!'               : 'Copied!',
    suspend:         isHe ? 'הקפא חשבון'           : 'Freeze Account',
    unsuspend:       isHe ? 'בטל הקפאה'            : 'Unfreeze Account',
    suspendOk:       isHe ? 'הושלם'                : 'Done',
    hardDelete:      isHe ? 'מחק לצמיתות'          : 'Hard Delete User',
    deleteOk:        isHe ? 'נמחק'                 : 'Deleted',
    statusActive:    isHe ? 'פעיל'                 : 'Active',
    statusSuspended: isHe ? 'מוקפא'                : 'Suspended',
    close:           isHe ? 'סגור'                 : 'Close',
    joined:          isHe ? 'הצטרף'                : 'Joined',
    proposals:       isHe ? 'הצעות'                : 'Proposals',
    impersonateNote: isHe
      ? 'האימייל הועתק. התחזות מלאה דורשת Edge Function עם Service Role (בתכנון).'
      : 'Email copied. Full impersonation requires a Service Role Edge Function (planned).',
  }

  const cfg = user ? TIER_CFG[user.plan_tier] : TIER_CFG.free

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && user && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[9998]"
                  style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
                />
              </Dialog.Overlay>

              {/* Drawer */}
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ x: isHe ? '-100%' : '100%', opacity: 0.6 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isHe ? '-100%' : '100%', opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' as const }}
                  className="fixed top-0 bottom-0 z-[9999] flex flex-col outline-none"
                  style={{
                    [isHe ? 'left' : 'right']: 0,
                    width: 'min(520px, 100vw)',
                    background: 'rgba(6,6,14,0.99)',
                    borderInlineStart: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isHe
                      ? '8px 0 40px rgba(0,0,0,0.7)'
                      : '-8px 0 40px rgba(0,0,0,0.7)',
                  }}
                  dir={isHe ? 'rtl' : 'ltr'}
                >

                  {/* ── Sticky Header ─────────────────────────────────────── */}
                  <div
                    className="flex-none px-6 pt-6 pb-5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {/* Close */}
                    <div className="flex items-start justify-between mb-5">
                      <Dialog.Title className="sr-only">User Operations</Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                      >
                        <X size={13} />
                      </button>

                      {/* Status badge */}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
                        style={user.is_suspended
                          ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                          : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                        }
                      >
                        {user.is_suspended ? <Snowflake size={9} /> : <CheckCircle2 size={9} />}
                        {user.is_suspended ? L.statusSuspended : L.statusActive}
                      </span>
                    </div>

                    {/* Avatar + identity */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl text-[15px] font-black"
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.color,
                          boxShadow: cfg.glow,
                        }}
                      >
                        {getInitials(user.email, user.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        {user.full_name && (
                          <p className="text-[15px] font-black text-white truncate leading-tight">{user.full_name}</p>
                        )}
                        <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {/* Tier badge */}
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}
                          >
                            {user.plan_tier === 'unlimited' && <Crown size={8} />}
                            {user.plan_tier === 'pro'       && <Zap   size={8} />}
                            {isHe ? cfg.label_he : cfg.label_en}
                          </span>
                          {/* Bonus quota badge */}
                          {user.bonus_quota > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black"
                              style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c' }}>
                              <Gift size={8} />+{user.bonus_quota}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: L.joined,    value: fmtDate(user.created_at).replace(' 2026','') },
                        { label: L.proposals, value: String(user.proposal_count) },
                        { label: 'ID',        value: user.id.slice(0, 8) + '…' },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl px-3 py-2 text-center"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.label}</p>
                          <p className="mt-0.5 text-[11px] font-bold text-white tabular-nums truncate">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Scrollable body ────────────────────────────────────── */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

                    {/* ── A: Identity ─────────────────────────────────────── */}
                    <SectionHeader icon={<User size={13} />} title={L.identity} color="#6366f1" />

                    <div className="space-y-3">
                      <div>
                        <FieldLabel icon={<User size={11} />} label={L.fullName} />
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder={L.fullName}
                          style={fieldInput}
                          onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.5)'; e.currentTarget.style.background='#0f0f1a' }}
                          onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
                        />
                      </div>
                      <div>
                        <FieldLabel icon={<Building2 size={11} />} label={L.companyName} />
                        <input
                          type="text" value={company} onChange={e => setCompany(e.target.value)}
                          placeholder={L.companyName}
                          style={fieldInput}
                          onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.5)'; e.currentTarget.style.background='#0f0f1a' }}
                          onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
                        />
                      </div>
                      <ActionButton
                        onClick={handleSaveProfile} feedback={profileFb}
                        labelIdle={L.saveProfile} labelOk={L.saved} labelErr={L.error}
                        variant="indigo" icon={<CheckCircle2 size={14} />}
                      />
                    </div>

                    <Divider />

                    {/* ── B: Billing & Quota ──────────────────────────────── */}
                    <SectionHeader icon={<BadgeDollarSign size={13} />} title={L.billing} color="#fbbf24" />

                    <div className="space-y-3">
                      {/* Tier pills */}
                      <div>
                        <FieldLabel icon={<Crown size={11} />} label={L.currentTier} />
                        <div className="flex gap-2">
                          {(['free', 'pro', 'unlimited'] as Tier[]).map(t => {
                            const c      = TIER_CFG[t]
                            const active = t === tier
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTierLocal(t)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wide transition-all"
                                style={{
                                  color:      active ? c.color : 'rgba(255,255,255,0.3)',
                                  background: active ? c.bg    : 'rgba(255,255,255,0.03)',
                                  border:     `1px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
                                  boxShadow:  active ? c.glow  : 'none',
                                }}
                              >
                                {t === 'unlimited' && <Crown size={10} style={{ color: active ? c.color : 'rgba(255,255,255,0.2)' }} />}
                                {t === 'pro'       && <Zap   size={10} style={{ color: active ? c.color : 'rgba(255,255,255,0.2)' }} />}
                                {isHe ? c.label_he : c.label_en}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Bonus quota */}
                      <div>
                        <FieldLabel icon={<Gift size={11} />} label={L.bonusQuota} />
                        <input
                          type="number" value={bonusQuota} min={0} max={9999}
                          onChange={e => setBonusQuota(Math.max(0, parseInt(e.target.value) || 0))}
                          inputMode="numeric"
                          style={{ ...fieldInput }}
                          onFocus={e => { e.currentTarget.style.border='1px solid rgba(251,146,60,0.5)'; e.currentTarget.style.background='#0f0f0a' }}
                          onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
                        />
                        <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{L.bonusHelper}</p>
                      </div>

                      <ActionButton
                        onClick={handleSaveBilling} feedback={billingFb}
                        labelIdle={L.saveBilling} labelOk={L.saved} labelErr={L.error}
                        variant="default" icon={<BadgeDollarSign size={14} />}
                      />
                    </div>

                    <Divider />

                    {/* ── C: Auth Actions ─────────────────────────────────── */}
                    <SectionHeader icon={<KeyRound size={13} />} title={L.auth} color="#34d399" />

                    <div className="space-y-2.5">
                      <ActionButton
                        onClick={handleResetPassword} feedback={resetFb}
                        labelIdle={L.resetPass} labelOk={L.resetOk} labelErr={L.error}
                        variant="default" icon={<Send size={14} />}
                      />
                      <ActionButton
                        onClick={async () => {
                          await handleCopyLink()
                          if (user) {
                            setTimeout(() => alert(
                              isHe
                                ? `האימייל ${user.email} הועתק. התחזות מלאה דורשת Edge Function עם Service Role (בתכנון).`
                                : `Copied ${user.email}. Full impersonation requires a Service Role Edge Function (planned).`
                            ), 100)
                          }
                        }}
                        feedback={linkFb}
                        labelIdle={L.copyLink} labelOk={L.copyOk} labelErr={L.error}
                        variant="default" icon={<Link2 size={14} />}
                      />
                    </div>

                    <Divider />

                    {/* ── D: Danger Zone ──────────────────────────────────── */}
                    <SectionHeader icon={<Shield size={13} />} title={L.danger} color="#ef4444" />

                    <div className="space-y-2.5">
                      {/* Suspend toggle */}
                      <ActionButton
                        onClick={handleSuspend} feedback={suspendFb}
                        labelIdle={user.is_suspended ? L.unsuspend : L.suspend}
                        labelOk={L.suspendOk} labelErr={L.error}
                        variant={user.is_suspended ? 'indigo' : 'danger'}
                        icon={user.is_suspended ? <CheckCircle2 size={14} /> : <Snowflake size={14} />}
                      />

                      {/* Hard delete */}
                      <ActionButton
                        onClick={handleDelete} feedback={deleteFb}
                        labelIdle={L.hardDelete} labelOk={L.deleteOk} labelErr={L.error}
                        variant="danger" icon={<Trash2 size={14} />}
                      />
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-8" />
                  </div>

                  {/* ── Sticky footer ──────────────────────────────────────── */}
                  <div
                    className="flex-none px-6 py-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                    >
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
