'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import BackgroundParticles from '@/components/BackgroundParticles';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as number[] },
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed.'); setLoading(false); return; }
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
    `w-full bg-[#080808] border px-4 py-3.5 text-[14px] text-white placeholder:text-[#222] outline-none transition-all duration-200 font-mono tracking-wide accent-caret ${
      focused === field
        ? 'border-[var(--orange)] shadow-[0_0_0_1px_var(--orange)]'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`;

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-4 relative overflow-hidden scanlines vignette">

      {/* Canvas particles */}
      <BackgroundParticles />

      {/* Line grid */}
      <div className="absolute inset-0 line-grid pointer-events-none opacity-30" />

      {/* Animated accent grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(color-mix(in srgb, var(--orange) 5%, transparent) 1px, transparent 1px),
                          linear-gradient(90deg, color-mix(in srgb, var(--orange) 5%, transparent) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* Drifting blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 9%, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3], x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-[40%] right-[5%] w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 10%, transparent)' }}
      />

      {/* Moving gradient mesh */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 55% 45% at 20% 30%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 80% 70%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 50% 10%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 55% 45% at 20% 30%, rgba(0,0,0,0.4) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sweeping scan line */}
      <motion.div
        initial={{ top: '-2px' }}
        animate={{ top: '100%' }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-[3]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--orange) 60%, transparent) 50%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <motion.div {...fadeUp(0)} className="mb-8 text-center">
          <div className="flex justify-center mb-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <motion.span
                whileHover={{ scale: 1.12, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-8 h-8 chamfer accent-bg flex items-center justify-center"
              >
                <Zap size={15} style={{ color: 'var(--orange-text)' }} />
              </motion.span>
              <span className="font-black text-white text-[20px] tracking-tight">
                Resolver<span className="accent-text">AI</span>
              </span>
            </Link>
          </div>

          {/* Status pill */}
          <motion.div
            {...fadeUp(0.05)}
            className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 mb-5"
          >
            <span className="w-2 h-2 rounded-full accent-bg pulse-dot" />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">AI Pipeline Active</span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-[32px] font-black text-white tracking-tight">
            Welcome back
          </motion.h1>
          <motion.p {...fadeUp(0.14)} className="text-[#444] text-[11px] mt-1 font-mono tracking-[0.1em]">
            SIGN IN TO CONTINUE RESOLVING CONTRADICTIONS
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="border border-[#1a1a1a] bg-[#0D0D0D]/90 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Animated top glow */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 blur-[50px] pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--orange) 22%, transparent)' }}
          />
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 pointer-events-none"
            style={{ borderColor: 'var(--orange)' }} />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 pointer-events-none"
            style={{ borderColor: 'color-mix(in srgb, var(--orange) 50%, transparent)' }} />

          <div className="relative z-10 p-8">
            <form onSubmit={handleLogin} className="space-y-5">

              <motion.div {...fadeUp(0.22)}>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@example.com" className={inputCls('email')} autoComplete="email" />
              </motion.div>

              <motion.div {...fadeUp(0.28)}>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    placeholder="••••••••" className={`${inputCls('password')} pr-12`}
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#888] transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-red-900/50 bg-red-950/20 px-4 py-2.5">
                    <p className="text-red-400 text-[12px] font-mono">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div {...fadeUp(0.34)}>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full chamfer accent-bg py-4 text-[13px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 orange-glow"
                  style={{ color: 'var(--orange-text)' }}>
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <motion.span animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                        <ArrowRight size={15} />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Footer links */}
        <motion.p {...fadeUp(0.42)} className="text-center text-[12px] text-[#333] mt-6 font-mono">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="accent-text hover:opacity-80 transition-opacity font-bold">Create one free →</Link>
        </motion.p>

        <motion.div {...fadeUp(0.48)} className="flex items-center justify-center gap-3 mt-4">
          <span className="w-1 h-1 accent-bg rounded-full" />
          <span className="font-mono text-[10px] text-[#222] uppercase tracking-[0.12em]">NLI · DeBERTa-v3 · GPT-OSS 20B</span>
          <span className="w-1 h-1 accent-bg rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
