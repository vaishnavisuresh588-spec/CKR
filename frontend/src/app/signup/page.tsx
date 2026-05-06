'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap, Check } from 'lucide-react';
import BackgroundParticles from '@/components/BackgroundParticles';

const PERKS = [
  'Semantic contradiction detection',
  'Source credibility ranking',
  'GPT-OSS 20B powered reasoning',
  'PDF, URL & text comparison',
];

const TYPEWRITER_TEXT = 'resolverai --analyze --source web';

function Typewriter() {
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (displayed.length < TYPEWRITER_TEXT.length) {
        t = setTimeout(() => setDisplayed(TYPEWRITER_TEXT.slice(0, displayed.length + 1)), 55);
      } else {
        t = setTimeout(() => setPhase('pause'), 1800);
      }
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 400);
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 28);
      } else {
        t = setTimeout(() => setPhase('typing'), 600);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, phase]);

  return (
    <div className="mb-8 border border-[#1a1a1a] bg-[#050505] px-4 py-3 font-mono text-[11px] text-[#444]">
      <span className="accent-text">$</span>{' '}
      <span className="text-[#888]">{displayed}</span>
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
        className="accent-text ml-0.5">▊</motion.span>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as number[] },
});

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Signup failed.'); setLoading(false); return; }
      localStorage.setItem('resolver_auth', 'true');
      localStorage.setItem('resolver_token', data.token);
      localStorage.setItem('resolver_user', JSON.stringify(data.user));
      router.push('/analyzer');
    } catch {
      setError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-[#050505] border px-4 py-3.5 text-[14px] text-white placeholder:text-[#222] outline-none transition-all duration-200 font-mono tracking-wide accent-caret ${
      focused === field
        ? 'border-[var(--orange)] shadow-[0_0_0_1px_var(--orange)]'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`;

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-4 py-12 relative overflow-hidden scanlines vignette">

      <BackgroundParticles />

      {/* Line grid */}
      <div className="absolute inset-0 line-grid pointer-events-none opacity-30" />

      {/* Accent grid mesh */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(color-mix(in srgb, var(--orange) 5%, transparent) 1px, transparent 1px),
                          linear-gradient(90deg, color-mix(in srgb, var(--orange) 5%, transparent) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* Drifting blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35], x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 8%, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25], x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 5%, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}
      />

      {/* Moving gradient mesh */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 55% 45% at 80% 20%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 20% 80%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 60% 50%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 80% 20%, rgba(0,0,0,0.4) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sweeping scan line */}
      <motion.div
        initial={{ top: '-2px' }}
        animate={{ top: '100%' }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-[3]"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--orange) 60%, transparent) 50%, transparent)' }}
      />

      <div className="w-full max-w-4xl relative z-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <motion.span whileHover={{ scale: 1.12, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-8 h-8 chamfer accent-bg flex items-center justify-center">
                <Zap size={15} style={{ color: 'var(--orange-text)' }} />
              </motion.span>
              <span className="font-black text-white text-[20px] tracking-tight">
                Resolver<span className="accent-text">AI</span>
              </span>
            </Link>
          </div>

          {/* Status pill */}
          <motion.div {...fadeUp(0.06)}
            className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full accent-bg pulse-dot" />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">AI Pipeline Active</span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-[30px] font-black text-white tracking-tight">Create your account</motion.h1>
          <motion.p {...fadeUp(0.14)} className="text-[#444] text-[11px] mt-1 font-mono tracking-[0.1em]">
            FREE FOREVER · NO CREDIT CARD REQUIRED
          </motion.p>
        </motion.div>

        {/* Two-panel card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 border border-[#1a1a1a] overflow-hidden relative"
        >
          {/* Animated top accent */}
          <div className="absolute top-0 left-0 right-0 h-px z-10"
            style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 blur-[50px] pointer-events-none z-10"
            style={{ background: 'color-mix(in srgb, var(--orange) 20%, transparent)' }}
          />
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 z-20 pointer-events-none"
            style={{ borderColor: 'var(--orange)' }} />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 z-20 pointer-events-none"
            style={{ borderColor: 'color-mix(in srgb, var(--orange) 50%, transparent)' }} />

          {/* Left panel — perks */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="hidden md:flex flex-col justify-between p-10 bg-[#0D0D0D] border-r border-[#1a1a1a] relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--orange) 8%, transparent) 0%, transparent 55%)' }} />
            <div className="relative z-10">
              <Typewriter />
              <h2 className="text-[26px] font-black text-white leading-tight tracking-tight mb-3">
                Everything you need<br />to find the <span className="accent-text">truth</span>.
              </h2>
              <p className="text-[#444] text-[12px] font-mono leading-relaxed mb-8">
                Powered by DeBERTa-v3 and GPT-OSS 20B — the most advanced contradiction detection pipeline.
              </p>
              <div className="space-y-3">
                {PERKS.map((perk, i) => (
                  <motion.div key={perk}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.36 + i * 0.1, type: 'spring', stiffness: 300 }}
                      className="w-5 h-5 chamfer accent-bg flex items-center justify-center shrink-0">
                      <Check size={10} style={{ color: 'var(--orange-text)' }} />
                    </motion.span>
                    <span className="text-[12px] text-[#666] font-mono">{perk}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="relative z-10 font-mono text-[10px] text-[#222] uppercase tracking-[0.12em]">
              NLI · DeBERTa-v3 · GPT-OSS 20B · NVIDIA NIM
            </p>
          </motion.div>

          {/* Right panel — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="bg-[#080808] p-8 md:p-10 relative"
          >
            <form onSubmit={handleSignup} className="space-y-5">

              <motion.div {...fadeUp(0.26)}>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  placeholder="Ajay Kumar" className={inputCls('name')} autoComplete="name" />
              </motion.div>

              <motion.div {...fadeUp(0.32)}>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@example.com" className={inputCls('email')} autoComplete="email" />
              </motion.div>

              <motion.div {...fadeUp(0.38)}>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    placeholder="Min. 6 characters" className={`${inputCls('password')} pr-12`}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#888] transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map(i => (
                          <motion.div key={i} className="h-[3px] flex-1 rounded-full"
                            animate={{ background: i <= strength ? strengthColor : '#1a1a1a' }}
                            transition={{ duration: 0.3 }} />
                        ))}
                      </div>
                      <motion.span key={strengthLabel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-[10px] tracking-wide w-10 text-right"
                        style={{ color: strengthColor }}>{strengthLabel}</motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="border border-red-900/50 bg-red-950/20 px-4 py-2.5">
                    <p className="text-red-400 text-[12px] font-mono">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div {...fadeUp(0.44)}>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full chamfer accent-bg py-4 text-[13px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 orange-glow"
                  style={{ color: 'var(--orange-text)' }}>
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <motion.span animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                        <ArrowRight size={15} />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p {...fadeUp(0.5)} className="text-center text-[12px] text-[#333] mt-6 font-mono">
              Already have an account?{' '}
              <Link href="/login" className="accent-text hover:opacity-80 transition-opacity font-bold">Sign in →</Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
