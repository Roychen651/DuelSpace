import { useRef } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { ArrowRight, Zap, Eye, PenLine, DollarSign, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

// ─── Animated grid background ─────────────────────────────────────────────────

function HeroGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0" style={{ background: '#030305' }} />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Primary glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[900px] -translate-y-1/4"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Left accent */}
      <div
        className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'lp-float-a 20s ease-in-out infinite',
        }}
      />
      {/* Right accent */}
      <div
        className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'lp-float-b 25s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes lp-float-a { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
        @keyframes lp-float-b { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,-30px)} }
        @keyframes lp-spin-slow { to{transform:rotate(360deg)} }
        @keyframes lp-price-tick {
          0%{transform:translateY(0);opacity:1}
          40%{transform:translateY(-100%);opacity:0}
          41%{transform:translateY(100%);opacity:0}
          100%{transform:translateY(0);opacity:1}
        }
        @keyframes lp-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes lp-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes lp-ping { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes lp-slide-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

// ─── Deal Room mockup (3D tilted) ─────────────────────────────────────────────

function DealRoomMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 8 }}
      transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      className="w-full max-w-2xl mx-auto"
    >
      <motion.div
        whileHover={{ rotateX: 4, rotateY: -2, scale: 1.01 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          transform: 'rotateX(8deg) rotateY(-4deg)',
          transformStyle: 'preserve-3d',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(99,102,241,0.15)',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Mockup header bar */}
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-4">
            <div
              className="mx-auto max-w-[240px] rounded-lg py-1.5 px-3 text-[10px] text-white/25 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              dealspace.app/deal/abc123
            </div>
          </div>
        </div>

        {/* Mockup body */}
        <div className="p-6 space-y-4">
          {/* Proposal header */}
          <div className="space-y-1">
            <div className="h-5 w-2/3 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))' }} />
            <div className="h-3 w-1/3 rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Price display — animated slot machine */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">Total</p>
            <MockupPriceSlot />
          </div>

          {/* Add-on cards */}
          <div className="space-y-2">
            {[
              { label: 'Brand Strategy', price: '₪2,400', on: true },
              { label: 'Social Media Package', price: '₪1,800', on: false },
              { label: 'Analytics Report', price: '₪900', on: true },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: item.on
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))'
                    : 'rgba(255,255,255,0.02)',
                  border: item.on
                    ? '1px solid rgba(99,102,241,0.2)'
                    : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full flex items-center justify-center"
                    style={{
                      background: item.on ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      boxShadow: item.on ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                    }}
                  >
                    {item.on && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-[11px] text-white/60">{item.label}</span>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: item.on ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>
                  {item.price}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Accept button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="rounded-xl py-3 text-center text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
              boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            }}
          >
            Accept & Sign
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MockupPriceSlot() {
  const prices = ['₪3,300', '₪5,100', '₪4,200', '₪6,900', '₪3,300']
  return (
    <div className="overflow-hidden h-9 relative">
      <motion.div
        animate={{ y: [0, -36, -72, -108, -144] }}
        transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, times: [0, 0.2, 0.4, 0.6, 0.8] }}
        className="flex flex-col"
      >
        {prices.map((p, i) => (
          <div key={i} className="h-9 flex items-center justify-center text-2xl font-black"
            style={{
              background: 'linear-gradient(90deg, #a5b4fc, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >{p}</div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Bento Feature Cards ──────────────────────────────────────────────────────

function BentoGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const cards = [
    {
      icon: <DollarSign size={20} />,
      color: '#6366f1',
      title: 'Interactive Pricing',
      body: 'Clients toggle add-ons and see the total update instantly. No back-and-forth.',
      demo: <PricingDemo />,
    },
    {
      icon: <Eye size={20} />,
      color: '#a855f7',
      title: 'Know When They Look',
      body: 'Get notified the moment your client opens the deal room. Stay one step ahead.',
      demo: <ViewedDemo />,
    },
    {
      icon: <PenLine size={20} />,
      color: '#22c55e',
      title: 'One-Click Signature',
      body: 'Clients type their name and click Accept. Your proposal becomes a signed agreement.',
      demo: <SignatureDemo />,
    },
  ]

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={fadeUp}
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
        >
          {/* Corner glow */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${card.color}25 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />

          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl mb-4"
            style={{ background: `${card.color}15`, border: `1px solid ${card.color}30`, color: card.color }}
          >
            {card.icon}
          </div>

          <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
          <p className="text-sm text-white/40 leading-relaxed mb-5">{card.body}</p>

          {/* Mini animation demo */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {card.demo}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function PricingDemo() {
  return (
    <div className="space-y-2">
      {[
        { label: 'Design', price: '₪2,400', on: true },
        { label: 'Dev', price: '₪3,200', on: true },
        { label: 'SEO', price: '₪800', on: false },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: item.on ? '#6366f1' : 'rgba(255,255,255,0.1)', boxShadow: item.on ? '0 0 6px rgba(99,102,241,0.6)' : 'none' }}
            />
            <span className="text-[10px] text-white/40">{item.label}</span>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: item.on ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>{item.price}</span>
        </div>
      ))}
      <div className="border-t border-white/5 pt-2 flex justify-between">
        <span className="text-[10px] text-white/30">Total</span>
        <motion.span
          key="total"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
          className="text-[11px] font-black"
          style={{ color: '#a5b4fc' }}
        >
          ₪5,600
        </motion.span>
      </div>
    </div>
  )
}

function ViewedDemo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-none">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
        >
          <Eye size={14} style={{ color: '#c084fc' }} />
        </div>
        {/* Ping animation */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(168,85,247,0.3)',
            animation: 'lp-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-white/70">Client opened your deal</p>
        <p className="text-[9px] text-white/30">Just now · Tel Aviv</p>
      </div>
    </div>
  )
}

function SignatureDemo() {
  return (
    <div className="space-y-2">
      <p className="text-[9px] text-white/25 uppercase tracking-widest">Electronic Signature</p>
      <div
        className="rounded-lg px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }}
      >
        <motion.span
          className="text-sm"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#a5b4fc' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          Alex Johnson
          <motion.span
            style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 2, verticalAlign: 'middle' }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </motion.span>
      </div>
      <motion.div
        className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        animate={{ boxShadow: ['0 0 8px rgba(34,197,94,0.3)', '0 0 16px rgba(34,197,94,0.5)', '0 0 8px rgba(34,197,94,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✓ Accepted
      </motion.div>
    </div>
  )
}

// ─── Infinite marquee ─────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Freelance Designer', text: 'Closed a ₪24k deal within 2 hours of sending. My client loved being able to pick add-ons.', stars: 5 },
  { name: 'David L.', role: 'Marketing Agency', text: 'The viewed notification is a game changer. I followed up at exactly the right moment.', stars: 5 },
  { name: 'Mia R.', role: 'Web Developer', text: 'My proposals look 10x more professional. Win rate went from 30% to 68% in one month.', stars: 5 },
  { name: 'Tom B.', role: 'Brand Consultant', text: 'Clients actually read these. The interactive pricing gets them engaged and committed.', stars: 5 },
  { name: 'Noa S.', role: 'UX/UI Freelancer', text: 'I sent my first proposal on Monday. Signed by Tuesday morning. Absolutely wild.', stars: 5 },
  { name: 'Amir H.', role: 'Video Production', text: 'Set up in 10 minutes. Sent to client. They signed it the same day. Done.', stars: 5 },
]

function TestimonialCard({ item }: { item: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-none w-72 rounded-2xl p-5 mx-3"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: item.stars }).map((_, i) => (
          <Star key={i} size={11} fill="#d4af37" stroke="none" />
        ))}
      </div>
      <p className="text-sm text-white/60 leading-relaxed mb-4">"{item.text}"</p>
      <div>
        <p className="text-xs font-semibold text-white/80">{item.name}</p>
        <p className="text-[10px] text-white/30">{item.role}</p>
      </div>
    </div>
  )
}

function Marquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]
  return (
    <div className="overflow-hidden">
      <div
        className="flex"
        style={{ animation: 'lp-marquee 30s linear infinite' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} item={t} />
        ))}
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNav({ onLogin }: { onLogin: () => void }) {
  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(3,3,5,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
        >
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">DealSpace</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onLogin}
          className="text-sm text-white/50 hover:text-white/90 transition-colors"
        >
          Log in
        </button>
        <motion.button
          onClick={onLogin}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
          <ChevronRight size={14} />
        </motion.button>
      </div>
    </nav>
  )
}

// ─── Main LandingPage ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()

  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: '-60px' })

  const socialRef = useRef(null)
  const socialInView = useInView(socialRef, { once: true, margin: '-60px' })

  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-60px' })

  const goToAuth = () => navigate('/auth')

  return (
    <div
      className="relative min-h-dvh flex flex-col"
      style={{ background: '#030305', color: 'white', fontFamily: 'var(--font-sans, Outfit, sans-serif)' }}
    >
      <HeroGrid />

      <LandingNav onLogin={goToAuth} />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
          style={{
            background: 'rgba(99,102,241,0.08)',
            borderColor: 'rgba(99,102,241,0.2)',
            color: '#a5b4fc',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-indigo-400"
            style={{ animation: 'lp-ping 1.5s cubic-bezier(0,0,0.2,1) infinite', display: 'inline-block' }}
          />
          Now in Beta — First 100 users free forever
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl"
        >
          <span className="text-white">Close Deals.</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Not Tabs.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="text-lg sm:text-xl text-white/45 max-w-xl leading-relaxed mb-10"
        >
          Send interactive proposals your clients can explore, customize, and sign — all in one stunning deal room.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <motion.button
            onClick={goToAuth}
            className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
              boxShadow: '0 0 40px rgba(99,102,241,0.45)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 56px rgba(99,102,241,0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            Start for Free
            <ArrowRight size={17} />
          </motion.button>
          <button
            onClick={goToAuth}
            className="flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold text-white/60 transition hover:text-white/90"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
          >
            See a live demo
          </button>
        </motion.div>

        {/* Social proof counts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 flex items-center gap-6 text-xs text-white/30"
        >
          <span>✓ No credit card</span>
          <span>✓ 2-minute setup</span>
          <span>✓ Cancel anytime</span>
        </motion.div>

        {/* 3D Mockup */}
        <div className="mt-16 w-full max-w-2xl">
          <DealRoomMockup />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="relative z-10 px-6 py-24 max-w-6xl mx-auto w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={featuresInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-indigo-400/70 mb-3 font-semibold">
            Why DealSpace
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Everything your proposal needs
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/35 max-w-lg mx-auto">
            Built for freelancers and agencies who are tired of losing deals to boring PDFs.
          </motion.p>
        </motion.div>

        <BentoGrid />
      </section>

      {/* ── Social proof ─────────────────────────────────────────────────── */}
      <section ref={socialRef} className="relative z-10 py-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={socialInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <p className="text-xs uppercase tracking-widest text-white/30 font-semibold mb-2">What people are saying</p>
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="#d4af37" stroke="none" />
            ))}
          </div>
        </motion.div>

        <Marquee />
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative z-10 px-6 py-32 text-center">
        {/* Glow behind CTA */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div
            className="h-[400px] w-[600px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
          className="relative max-w-2xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-5">
            Your next deal is
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              one link away.
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-white/40 mb-10 leading-relaxed">
            Join freelancers who close deals faster with interactive proposals.
          </motion.p>

          <motion.div variants={fadeUp}>
            <motion.button
              onClick={goToAuth}
              className="inline-flex items-center gap-2 rounded-2xl px-10 py-5 text-lg font-black text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                boxShadow: '0 0 50px rgba(99,102,241,0.5)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 70px rgba(99,102,241,0.65)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get started free
              <ArrowRight size={19} />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
          >
            <Zap size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white/40">DealSpace</span>
        </div>
        <p className="text-[10px] text-white/15">
          © {new Date().getFullYear()} DealSpace. Proposal generation tool — not legal or financial advice.
        </p>
      </footer>
    </div>
  )
}
