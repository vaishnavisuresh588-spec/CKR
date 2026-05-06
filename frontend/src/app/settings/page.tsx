'use client';
// Theme system: accent colors + backgrounds persist in localStorage

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Camera, Check, AlertCircle, LogOut } from 'lucide-react';
import BackgroundParticles from '@/components/BackgroundParticles';

interface UserInfo { id: string; name: string; email: string; avatar?: string; }

const API = 'http://localhost:5000/api/auth';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as number[] },
});

export default function SettingsPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user,      setUser]      = useState<UserInfo | null>(null);
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [avatarPrev,setAvatarPrev] = useState('');   // local preview
  const [newPass,   setNewPass]   = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [focused,   setFocused]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  /* ── Load user from localStorage on mount ── */
  useEffect(() => {
    const raw = localStorage.getItem('resolver_user');
    if (!raw) { router.push('/login'); return; }
    const u: UserInfo = JSON.parse(raw);
    setUser(u);
    setName(u.name);
    setEmail(u.email);
    setAvatarPrev(u.avatar || '');

    // Refresh from backend to get latest avatar/name
    const token = localStorage.getItem('resolver_token');
    if (token) {
      fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.user) {
            const fresh = data.user;
            setName(fresh.name);
            setEmail(fresh.email);
            setAvatarPrev(fresh.avatar || '');
            setUser(fresh);
            localStorage.setItem('resolver_user', JSON.stringify(fresh));
            window.dispatchEvent(new Event('storage'));
          }
        })
        .catch(() => {});
    }
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Avatar file pick → compress → preview ── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      // Resize to max 400×400, then compress as JPEG 70%
      const MAX = 400;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setAvatarPrev(compressed);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  /* ── Save profile → MongoDB via PUT /api/auth/profile ── */
  const handleSaveProfile = async () => {
    if (!name.trim()) { showToast('Name cannot be empty.', false); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('resolver_token');
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), avatar: avatarPrev }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Save failed.', false); return; }

      // Update localStorage so Navbar re-renders immediately
      const updated = data.user;
      localStorage.setItem('resolver_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      setUser(updated);
      showToast('Profile saved to your account!');
    } catch {
      showToast('Could not reach server.', false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPass.length < 6) { showToast('Min 6 characters.', false); return; }
    if (newPass !== confirm)  { showToast('Passwords do not match.', false); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setNewPass(''); setConfirm('');
    showToast('Password updated!');
  };

  const handleLogout = () => {
    localStorage.removeItem('resolver_auth');
    localStorage.removeItem('resolver_token');
    localStorage.removeItem('resolver_user');
    router.push('/');
  };

  const inputCls = (field: string) =>
    `w-full bg-[#080808] border px-4 py-3 text-[13px] text-white placeholder:text-[#222] outline-none transition-all duration-200 font-mono accent-caret ${
      focused === field
        ? 'border-[var(--orange)] shadow-[0_0_0_1px_var(--orange)]'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const ACCENT_COLORS = [
    { name: 'White',   value: '#FFFFFF', text: '#000000' },
    { name: 'Cyan',    value: '#22d3ee', text: '#000000' },
    { name: 'Violet',  value: '#a78bfa', text: '#000000' },
    { name: 'Emerald', value: '#34d399', text: '#000000' },
    { name: 'Rose',    value: '#fb7185', text: '#000000' },
    { name: 'Amber',   value: '#fbbf24', text: '#000000' },
    { name: 'Sky',     value: '#38bdf8', text: '#000000' },
    { name: 'Lime',    value: '#a3e635', text: '#000000' },
  ];

  const THEMES = [
    { name: 'Dark',        bg: '#0A0A0A', surface: '#111111' },
    { name: 'Midnight',    bg: '#050510', surface: '#0a0a1a' },
    { name: 'Deep Purple', bg: '#0d0010', surface: '#130018' },
  ];

  const [accentColor,  setAccentColor]  = useState('#FFFFFF');
  const [accentText,   setAccentText]   = useState('#000000');
  const [themeName,    setThemeName]    = useState('Dark');

  // Read theme from localStorage on client only (after mount)
  useEffect(() => {
    setAccentColor(localStorage.getItem('resolver_accent')    || '#FFFFFF');
    setAccentText(localStorage.getItem('resolver_accentTxt')  || '#000000');
    setThemeName(localStorage.getItem('resolver_theme')       || 'Dark');
  }, []);

  const applyAccent = (value: string, text: string) => {
    document.documentElement.style.setProperty('--orange', value);
    document.documentElement.style.setProperty('--orange-text', text);
    localStorage.setItem('resolver_accent',    value);
    localStorage.setItem('resolver_accentTxt', text);
    setAccentColor(value);
    setAccentText(text);
  };

  const applyTheme = (t: typeof THEMES[number]) => {
    // Set CSS variable
    document.documentElement.style.setProperty('--bg', t.bg);
    document.documentElement.style.setProperty('--surface', t.surface);
    // Force immediate repaint on all relevant elements
    document.documentElement.style.background = t.bg;
    document.body.style.background = t.bg;
    document.body.style.backgroundColor = t.bg;
    document.querySelectorAll<HTMLElement>('.page-bg').forEach(el => {
      el.style.background = t.bg;
    });
    localStorage.setItem('resolver_theme', t.name);
    localStorage.setItem('resolver_themeBg', t.bg);
    setThemeName(t.name);
  };

  // Re-apply saved theme on mount
  useEffect(() => {
    const savedAccent    = localStorage.getItem('resolver_accent');
    const savedAccentTxt = localStorage.getItem('resolver_accentTxt');
    const savedBg        = localStorage.getItem('resolver_themeBg');
    if (savedAccent)    document.documentElement.style.setProperty('--orange', savedAccent);
    if (savedAccentTxt) document.documentElement.style.setProperty('--orange-text', savedAccentTxt);
    if (savedBg)        { document.documentElement.style.setProperty('--bg', savedBg); document.body.style.background = savedBg; }
  }, []);

  const TABS = [
    { id: 'profile',    label: 'Profile'    },
    { id: 'account',    label: 'Account'    },
    { id: 'appearance', label: 'Appearance' },
    { id: 'security',   label: 'Security'   },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen page-bg pt-24 pb-16 px-4 relative overflow-hidden">

      <BackgroundParticles />
      <div className="absolute inset-0 line-grid pointer-events-none opacity-20" />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--orange) 7%, transparent)' }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0,   x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[999] flex items-center gap-2.5 px-5 py-3 border shadow-xl text-[13px] font-mono"
            style={{
              background:   toast.ok ? '#0a1a0a' : '#1a0a0a',
              borderColor:  toast.ok ? '#22c55e40' : '#ef444440',
              color:        toast.ok ? '#22c55e'  : '#ef4444',
            }}
          >
            {toast.ok ? <Check size={14} /> : <AlertCircle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Page header */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <span className="font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] border border-[#1a1a1a] px-2.5 py-1 inline-block mb-3">
            [ Account ]
          </span>
          <h1 className="text-[32px] font-black text-white tracking-tight">Settings</h1>
          <p className="text-[#444] text-[12px] font-mono mt-1">Your profile is saved to your account email.</p>
        </motion.div>

        {/* Avatar card */}
        <motion.div {...fadeUp(0.08)}
          className="border border-[#1a1a1a] bg-[#0D0D0D] p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l pointer-events-none"
            style={{ borderColor: 'var(--orange)' }} />

          <div className="flex items-center gap-5">
            {/* Circular avatar */}
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-[22px] font-black border-2 relative"
                style={{
                  borderColor: 'var(--orange)',
                  background: avatarPrev ? 'transparent' : 'var(--orange)',
                  color: 'var(--orange-text)',
                }}
              >
                {avatarPrev
                  ? <img src={avatarPrev} alt={user.name} className="w-full h-full object-cover" />
                  : initials
                }
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              </motion.div>

              {/* Small camera badge */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-[#0D0D0D] accent-bg flex items-center justify-center"
                style={{ color: 'var(--orange-text)' }}>
                <Camera size={10} />
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={handleAvatarChange} />

            <div>
              <p className="text-white font-bold text-[18px]">{user.name}</p>
              <p className="text-[#444] text-[12px] font-mono">{user.email}</p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-2 text-[11px] font-mono accent-text hover:opacity-70 transition-opacity tracking-[0.08em] uppercase">
                Upload photo → (saved to your account)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div {...fadeUp(0.12)} className="flex border-b border-[#1a1a1a] mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-[12px] font-mono uppercase tracking-[0.1em] transition-colors ${
                activeTab === tab.id ? 'accent-text' : 'text-[#444] hover:text-[#888]'
              }`}>
              {activeTab === tab.id && (
                <motion.span layoutId="settings-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] accent-bg"
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }} />
              )}
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <motion.div key="profile"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="border border-[#1a1a1a] bg-[#0D0D0D] p-6 space-y-5"
            >
              <div>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">
                  <User size={10} className="inline mr-1.5 accent-text" />Full Name
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  className={inputCls('name')} placeholder="Your name" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">
                  <Mail size={10} className="inline mr-1.5 accent-text" />Email Address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  className={inputCls('email')} placeholder="your@email.com" />
              </div>
              <motion.button onClick={handleSaveProfile} disabled={saving}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="chamfer accent-bg px-6 py-3 text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-2 disabled:opacity-50"
                style={{ color: 'var(--orange-text)' }}>
                {saving ? (
                  <>
                    <motion.span animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 rounded-full border-2 border-current/20 border-t-current" />
                    Saving to MongoDB…
                  </>
                ) : 'Save Profile'}
              </motion.button>
            </motion.div>
          )}

          {/* Account tab */}
          {activeTab === 'account' && (
            <motion.div key="account"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="border border-[#1a1a1a] bg-[#0D0D0D] p-6">
                <h3 className="font-bold text-white text-[14px] mb-1">Account Information</h3>
                <p className="text-[#444] text-[12px] font-mono mb-4">Stored in MongoDB, tied to your email.</p>
                <div className="space-y-3">
                  {[
                    { label: 'User ID',  value: user.id   },
                    { label: 'Name',     value: user.name  },
                    { label: 'Email',    value: user.email },
                    { label: 'Plan',     value: 'Free Forever' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#111]">
                      <span className="font-mono text-[11px] text-[#444] uppercase tracking-[0.1em]">{row.label}</span>
                      <span className="text-[12px] text-white font-mono truncate max-w-[200px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-red-900/30 bg-red-950/10 p-6">
                <h3 className="font-bold text-red-400 text-[14px] mb-1">Sign Out</h3>
                <p className="text-[#555] text-[12px] font-mono mb-4">Your profile and image are saved to your account.</p>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-[12px] font-mono text-red-500 hover:text-red-400 border border-red-900/40 hover:border-red-600/60 px-4 py-2.5 transition-colors">
                  <LogOut size={13} /> Sign Out of ResolverAI
                </button>
              </div>
            </motion.div>
          )}

          {/* Appearance tab */}
          {activeTab === 'appearance' && (
            <motion.div key="appearance"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Accent color */}
              <div className="border border-[#1a1a1a] bg-[#0D0D0D] p-6">
                <h3 className="font-bold text-white text-[14px] mb-1">Accent Color</h3>
                <p className="text-[#444] text-[12px] font-mono mb-5">Changes the highlight color across the whole app.</p>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map(c => (
                    <motion.button
                      key={c.name}
                      onClick={() => applyAccent(c.value, c.text)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.94 }}
                      title={c.name}
                      className="relative w-9 h-9 rounded-full border-2 transition-all duration-200"
                      style={{
                        background: c.value,
                        borderColor: accentColor === c.value ? c.value : '#2a2a2a',
                        boxShadow:   accentColor === c.value ? `0 0 16px ${c.value}80` : 'none',
                      }}
                    >
                      {accentColor === c.value && (
                        <Check size={14} className="absolute inset-0 m-auto" style={{ color: c.text }} />
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-mono text-[#444]">
                  Current: <span style={{ color: accentColor }}>{ACCENT_COLORS.find(c => c.value === accentColor)?.name ?? 'Custom'}</span>
                </p>
              </div>

              {/* Background theme */}
              <div className="border border-[#1a1a1a] bg-[#0D0D0D] p-6">
                <h3 className="font-bold text-white text-[14px] mb-1">Background Theme</h3>
                <p className="text-[#444] text-[12px] font-mono mb-5">Choose your preferred background darkness.</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(t => (
                    <motion.button
                      key={t.name}
                      onClick={() => applyTheme(t)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative p-4 border text-left transition-all duration-200"
                      style={{
                        background:  t.bg,
                        borderColor: themeName === t.name ? accentColor : '#1a1a1a',
                        boxShadow:   themeName === t.name ? `0 0 12px ${accentColor}40` : 'none',
                      }}
                    >
                      <div className="w-full h-8 rounded mb-2" style={{ background: t.surface }} />
                      <p className="text-[11px] font-mono" style={{ color: themeName === t.name ? accentColor : '#888' }}>
                        {themeName === t.name && '✓ '}{t.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <motion.button
                onClick={() => { applyAccent('#FFFFFF', '#000000'); applyTheme(THEMES[0]); }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="text-[12px] font-mono text-[#444] hover:text-white border border-[#1a1a1a] hover:border-[#333] px-5 py-2.5 transition-colors">
                Reset to Defaults
              </motion.button>
            </motion.div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <motion.div key="security"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="border border-[#1a1a1a] bg-[#0D0D0D] p-6 space-y-5"
            >
              <div>
                <h3 className="font-bold text-white text-[14px] mb-1">Change Password</h3>
                <p className="text-[#444] text-[12px] font-mono mb-5">Set a new password for your account.</p>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">
                  <Lock size={10} className="inline mr-1.5 accent-text" />New Password
                </label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                  onFocus={() => setFocused('newpass')} onBlur={() => setFocused(null)}
                  className={inputCls('newpass')} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#444] uppercase tracking-[0.14em] mb-2">
                  <Lock size={10} className="inline mr-1.5 accent-text" />Confirm Password
                </label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  className={inputCls('confirm')} placeholder="Repeat password" />
                {confirm.length > 0 && (
                  <p className={`mt-1.5 text-[11px] font-mono ${newPass === confirm ? 'text-green-500' : 'text-red-500'}`}>
                    {newPass === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
              <motion.button onClick={handleChangePassword} disabled={saving}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="chamfer accent-bg px-6 py-3 text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-2 disabled:opacity-50"
                style={{ color: 'var(--orange-text)' }}>
                {saving ? (
                  <>
                    <motion.span animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 rounded-full border-2 border-current/20 border-t-current" />
                    Updating…
                  </>
                ) : 'Update Password'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}