'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';

const navLinks = [
  { href: '/analyzer', label: 'Analyzer' },
  { href: '/text',     label: 'Compare'  },
  { href: '/settings', label: 'Settings' },
];

interface UserInfo { id: string; name: string; email: string; avatar?: string; }

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [user,      setUser]      = useState<UserInfo | null>(null);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* ── Scroll listener ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Auth state from localStorage ── */
  useEffect(() => {
    const raw = localStorage.getItem('resolver_user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
    const onStorage = () => {
      const r = localStorage.getItem('resolver_user');
      setUser(r ? JSON.parse(r) : null);
    };
    window.addEventListener('storage', onStorage);
    // Also poll once on path change
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('resolver_auth');
    localStorage.removeItem('resolver_token');
    localStorage.removeItem('resolver_user');
    setUser(null);
    setDropOpen(false);
    router.push('/');
  };

  /* ── Avatar initials ── */
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <motion.nav
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-[#222] shadow-lg shadow-black/20'
          : 'bg-[#0A0A0A] border-[#1a1a1a]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            className="w-7 h-7 accent-bg chamfer-sm flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h4v4H2V2zm6 0h4v4H8V2zm-6 6h4v4H2V8zm6 2h2v2H8v-2z" fill="currentColor"/>
            </svg>
          </motion.div>
          <span className="font-black text-[15px] tracking-tight">
            Resolver<span className="accent-text">AI</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`relative text-[13px] font-medium tracking-wide px-4 py-2 transition-all duration-200 ${
                  active ? 'accent-text' : 'text-[#555] hover:text-white'
                }`}
              >
                {active && (
                  <motion.span layoutId="nav-active-bg" className="absolute inset-0 rounded-sm"
                    style={{ background: 'color-mix(in srgb, var(--orange) 12%, transparent)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.span layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] accent-bg rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — Auth or User profile */}
        <div className="flex items-center gap-2">
          {user ? (
            /* ── Logged-in: avatar + dropdown ── */
            <div ref={dropRef} className="relative">
              <motion.button
                onClick={() => setDropOpen(o => !o)}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-[#1e1e1e] hover:border-[var(--orange)] transition-colors duration-200 bg-[#0D0D0D]"
              >
              {/* ── Circular avatar ── */}
              <div
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-black shrink-0 border-2"
                style={{
                  borderColor: 'var(--orange)',
                  background: user.avatar ? 'transparent' : 'var(--orange)',
                  color: 'var(--orange-text)',
                }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : initials
                }
              </div>
                <span className="text-[13px] font-medium text-white max-w-[100px] truncate hidden sm:block">
                  {user.name}
                </span>
                <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} className="text-[#555]" />
                </motion.span>
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0D0D0D] border border-[#1e1e1e] shadow-xl shadow-black/40 z-[200]"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-[#1a1a1a]">
                      <p className="text-[13px] font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-[#444] font-mono truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link href="/settings" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#888] hover:text-white hover:bg-[#111] transition-colors">
                        <User size={13} className="accent-text" />
                        Profile & Settings
                      </Link>
                      <Link href="/settings?tab=account" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#888] hover:text-white hover:bg-[#111] transition-colors">
                        <Settings size={13} className="accent-text" />
                        Account Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#1a1a1a] py-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:text-red-400 hover:bg-red-950/20 transition-colors">
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Logged-out: Sign In / Sign Up ── */
            <>
              <Link href="/login">
                <motion.span whileTap={{ scale: 0.97 }}
                  className="text-[13px] font-medium px-4 py-2 text-[#555] hover:text-white transition-colors tracking-wide">
                  Sign In
                </motion.span>
              </Link>
              <Link href="/signup">
                <motion.span
                  className="chamfer accent-bg text-[13px] font-bold px-5 py-2.5 tracking-wide inline-flex items-center gap-1.5"
                  style={{ color: 'var(--orange-text)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign Up
                  <motion.span animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>→</motion.span>
                </motion.span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
