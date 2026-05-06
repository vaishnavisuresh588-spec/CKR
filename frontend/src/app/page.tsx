'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

/* ── Reusable fade-up on scroll ── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Char-by-char stagger reveal + idle glitch + hover wave ── */
function GlitchReveal({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [glitchSet, setGlitchSet] = useState<Set<number>>(new Set());
  const chars = text.split('');

  // Idle glitch: randomly flicker chars when not hovered
  useEffect(() => {
    if (!inView) return;
    const fire = () => {
      if (hoveredIdx !== null) return;
      const count = Math.floor(Math.random() * 2) + 1;
      const picks = new Set<number>();
      for (let k = 0; k < count; k++) {
        picks.add(Math.floor(Math.random() * chars.filter(c => c !== ' ').length));
      }
      setGlitchSet(picks);
      setTimeout(() => setGlitchSet(new Set()), 120);
    };
    const schedule = () => {
      const t = setTimeout(() => { fire(); schedule(); }, 1800 + Math.random() * 2200);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [inView, hoveredIdx, chars.length]);

  const getHoverOffset = (i: number) => {
    if (hoveredIdx === null) return 0;
    const dist = Math.abs(i - hoveredIdx);
    if (dist === 0) return -14;
    if (dist === 1) return -7;
    if (dist === 2) return -3;
    return 0;
  };

  return (
    <span ref={ref} className={`inline-flex ${className}`} aria-label={text} style={{ perspective: '600px' }}>
      {chars.map((char, i) => {
        const isHovered = hoveredIdx === i;
        const isGlitching = glitchSet.has(i) && hoveredIdx === null;
        const yOffset = isGlitching ? (Math.random() > 0.5 ? -5 : 4) : getHoverOffset(i);
        return (
          <motion.span
            key={i}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            initial={{ opacity: 0, y: 24 }}
            animate={inView
              ? { opacity: isGlitching ? 0.4 : 1, y: yOffset, x: isGlitching ? (Math.random() > 0.5 ? 2 : -2) : 0 }
              : { opacity: 0, y: 24 }
            }
            transition={inView && hoveredIdx !== null
              ? { type: 'spring', stiffness: 500, damping: 20 }
              : isGlitching
                ? { duration: 0.06, ease: 'linear' }
                : { duration: 0.45, delay: delay + i * 0.028, ease: [0.16, 1, 0.3, 1] }
            }
            style={{
              display: 'inline-block',
              transformOrigin: 'center bottom',
              color: isHovered
                ? 'var(--orange)'
                : isGlitching
                  ? 'var(--orange)'
                  : undefined,
              textShadow: isHovered
                ? '0 0 20px color-mix(in srgb, var(--orange) 80%, transparent), 0 0 40px color-mix(in srgb, var(--orange) 40%, transparent)'
                : isGlitching
                  ? '0 0 16px color-mix(in srgb, var(--orange) 70%, transparent)'
                  : hoveredIdx !== null && Math.abs(i - hoveredIdx) <= 2
                    ? '0 0 12px color-mix(in srgb, var(--orange) 30%, transparent)'
                    : undefined,
              transition: 'color 0.1s ease, text-shadow 0.1s ease',
              cursor: 'default',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ── Staggered word reveal ── */
function WordReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const words = text.split(' ');
  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`} style={{ perspective: '800px' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', transformOrigin: 'center bottom' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Mono label ── */
function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase accent-text px-2.5 py-1 mb-5"
      style={{ border: '1px solid color-mix(in srgb, var(--orange) 30%, transparent)' }}>
      {children}
    </span>
  );
}

/* ── Cursor-following spotlight ── */
function MouseGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return (
    <div
      className="fixed pointer-events-none z-[9997] mix-blend-soft-light"
      style={{
        width: 500, height: 500,
        left: pos.x - 250, top: pos.y - 250,
        background: 'radial-gradient(circle, color-mix(in srgb, var(--orange) 12%, transparent) 0%, transparent 65%)',
        transition: 'left 0.15s ease-out, top 0.15s ease-out',
      }}
    />
  );
}

/* ── Canvas particle starfield ── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const PARTICLE_COUNT = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Get accent color from CSS var
    const getAccent = () => getComputedStyle(document.documentElement).getPropertyValue('--orange').trim() || '#FFFFFF';

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = getAccent();

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `${accent}${Math.round((1 - dist / 120) * 25).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw + update particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${accent}${Math.round(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ── 3D Tilt card ── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateX.set((e.clientY - cy) / 20 * -1);
    rotateY.set((e.clientX - cx) / 20);
  };
  const handleLeave = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Dynamic terminal animation (loops forever) ── */
const TERMINAL_SEQUENCES = [
  [
    { text: '$ resolver-ai analyze --sources 2 --model gpt-oss-20b', color: '#ccc', delay: 15 },
    { text: '', color: '', delay: 200 },
    { text: '  ⟳ Loading model: openai/gpt-oss-20b via NVIDIA NIM...', color: '#888', delay: 10 },
    { text: '  ✓ Model loaded (2.1s)', color: '#22C55E', delay: 250 },
    { text: '', color: '', delay: 100 },
    { text: '  [1/5] Encoding claims → 384-dim vectors', color: '#888', delay: 10 },
    { text: '  ████████████████████████████████ 100%', color: 'var(--orange)', delay: 8 },
    { text: '  ✓ Embedded 2 claims', color: '#22C55E', delay: 200 },
    { text: '', color: '', delay: 80 },
    { text: '  [2/5] Computing cosine similarity...', color: '#888', delay: 10 },
    { text: '  ✓ Similarity: 0.82 → HIGH (above threshold)', color: '#22C55E', delay: 200 },
    { text: '', color: '', delay: 80 },
    { text: '  [3/5] NLI classification (DeBERTa-v3)', color: '#888', delay: 10 },
    { text: '  ⚡ CONTRADICTION detected (confidence: 0.94)', color: '#EF4444', delay: 250 },
    { text: '', color: '', delay: 80 },
    { text: '  [4/5] Scoring source credibility...', color: '#888', delay: 10 },
    { text: '  │ Nature.com       → 0.85  [ACADEMIC]', color: '#22C55E', delay: 150 },
    { text: '  │ random-blog.xyz  → 0.30  [BLOG]', color: '#F59E0B', delay: 150 },
    { text: '', color: '', delay: 80 },
    { text: '  [5/5] Reasoning with GPT-OSS 20B...', color: '#888', delay: 10 },
    { text: '  ████████████████████████████████ done', color: 'var(--orange)', delay: 8 },
    { text: '', color: '', delay: 150 },
    { text: '  ┌─────────────────────────────────────────┐', color: '#333', delay: 3 },
    { text: '  │  VERDICT: Claim 1 wins                  │', color: '#22C55E', delay: 3 },
    { text: '  │  Confidence: 87%                        │', color: '#22C55E', delay: 3 },
    { text: '  │  Reason: Peer-reviewed source, stronger │', color: '#22C55E', delay: 3 },
    { text: '  │  empirical evidence and methodology.    │', color: '#22C55E', delay: 3 },
    { text: '  └─────────────────────────────────────────┘', color: '#333', delay: 3 },
    { text: '', color: '', delay: 1800 },
  ],
  [
    { text: '$ resolver-ai compare --file report.pdf --url https://cdc.gov/data', color: '#ccc', delay: 15 },
    { text: '', color: '', delay: 200 },
    { text: '  ⟳ Extracting claims from report.pdf (3 pages)...', color: '#888', delay: 10 },
    { text: '  ✓ Extracted 4 claims', color: '#22C55E', delay: 200 },
    { text: '  ⟳ Scraping https://cdc.gov/data...', color: '#888', delay: 10 },
    { text: '  ✓ Scraped 2 claims', color: '#22C55E', delay: 200 },
    { text: '', color: '', delay: 100 },
    { text: '  [NLI] Running pairwise analysis (6 pairs)...', color: '#888', delay: 10 },
    { text: '  ████████████████████████████████ 100%', color: 'var(--orange)', delay: 8 },
    { text: '  ✓ Found 2 contradictions, 4 entailments', color: '#F59E0B', delay: 250 },
    { text: '', color: '', delay: 80 },
    { text: '  [SCORE] cdc.gov → 0.92 [GOV]  |  report.pdf → 0.70 [UNKNOWN]', color: '#888', delay: 10 },
    { text: '', color: '', delay: 150 },
    { text: '  ┌─────────────────────────────────────────┐', color: '#333', delay: 3 },
    { text: '  │  VERDICT: CDC data is more reliable     │', color: '#22C55E', delay: 3 },
    { text: '  │  Confidence: 91%                        │', color: '#22C55E', delay: 3 },
    { text: '  └─────────────────────────────────────────┘', color: '#333', delay: 3 },
    { text: '', color: '', delay: 1800 },
  ],
];

function TerminalTyping() {
  const [lines, setLines] = useState<{ text: string; color: string }[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // Auto-scroll to bottom whenever lines update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const blink = setInterval(() => setCursorVisible(v => !v), 530);

    async function runLoop() {
      while (!cancelled) {
        for (const sequence of TERMINAL_SEQUENCES) {
          if (cancelled) return;
          setLines([]);
          for (const line of sequence) {
            if (cancelled) return;
            if (line.text === '') {
              await new Promise(r => setTimeout(r, line.delay));
              setLines(prev => [...prev, { text: '', color: '' }]);
              continue;
            }
            // Type character by character
            for (let c = 1; c <= line.text.length; c++) {
              if (cancelled) return;
              const partial = line.text.slice(0, c);
              setLines(prev => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                if (lastIdx >= 0 && next[lastIdx].color === line.color && next[lastIdx].text !== line.text) {
                  next[lastIdx] = { text: partial, color: line.color };
                } else {
                  next.push({ text: partial, color: line.color });
                }
                return next;
              });
              await new Promise(r => setTimeout(r, line.delay));
            }
            await new Promise(r => setTimeout(r, 60));
          }
        }
      }
    }
    runLoop();
    return () => { cancelled = true; clearInterval(blink); };
  }, [inView]);

  return (
    <div ref={ref} className="bg-[#0A0A0A] border border-[#222] font-mono text-[12px] relative">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a1a1a] bg-[#0D0D0D]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        <span className="text-[10px] text-[#333] ml-auto tracking-[0.1em] uppercase">resolver-ai — terminal</span>
      </div>
      {/* Top fade gradient */}
      <div className="absolute top-[44px] left-0 right-0 h-8 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-10" />
      {/* Scrollable output */}
      <div
        ref={scrollRef}
        className="h-[260px] overflow-y-auto px-5 py-4 space-y-0 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.color || '#444', minHeight: '1.5em', lineHeight: '1.7' }}>
            {line.text}
            {i === lines.length - 1 && line.text && (
              <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s', color: 'var(--orange)' }} className="ml-px">▊</span>
            )}
          </div>
        ))}
        {lines.length === 0 && (
          <span style={{ opacity: cursorVisible ? 1 : 0, color: 'var(--orange)' }}>▊</span>
        )}
      </div>
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ to, label }: { to: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <p className="text-[22px] font-black text-white tracking-tight">{to}</p>
      <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-white/60 mt-0.5">{label}</p>
    </motion.div>
  );
}

/* ── Marquee strip ── */
const MARQUEE_ITEMS = [
  'Semantic Clustering', 'NLI Detection', 'Contradiction Resolution',
  'Source Credibility Scoring', 'GPT-OSS 20B', 'DeBERTa-v3',
  'Explainable AI', 'Chain-of-Thought', 'NVIDIA NIM',
];

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]; // doubled for seamless loop
  return (
    <div className="relative overflow-hidden border-y border-[#1a1a1a] bg-[#0D0D0D] py-3 select-none">
      <div className="marquee">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 font-mono text-[11px] tracking-[0.12em] uppercase text-[#444] whitespace-nowrap">
            <span className="w-1 h-1 accent-bg rounded-full shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Problem / feature data ── */
const problems = [
  { n: '01', heading: 'Sources contradict each other.', body: 'News, research, and social media all claim different truths. No tool helps you reconcile them systematically.' },
  { n: '02', heading: 'AI hallucinates without sources.', body: 'Generic LLMs generate confident-sounding answers with no grounding. You need provenance, not plausible text.' },
  { n: '03', heading: 'Credibility is invisible.', body: 'A tabloid and a peer-reviewed journal say opposite things — you need an engine that knows the difference.' },
  { n: '04', heading: 'The reasoning is a black box.', body: 'Even when you get an answer, you have no idea why. ResolverAI shows every step with full chain-of-thought.' },
];

const features = [
  { label: '[ PHASE 01 ]', heading: 'Semantic Clustering', body: 'all-MiniLM-L6-v2 encodes every claim into vector space and computes pairwise cosine similarity.', stat: '384-dim embeddings' },
  { label: '[ PHASE 02 ]', heading: 'NLI Contradiction Detection', body: 'DeBERTa-v3 NLI cross-encoder classifies each pair as Entailment / Neutral / Contradiction.', stat: 'DeBERTa-v3-small' },
  { label: '[ PHASE 03 ]', heading: 'Source Credibility Scoring', body: 'Domain heuristics assign credibility weights. Peer-reviewed journals outrank anonymous blogs.', stat: '0.0 – 1.0 score' },
  { label: '[ PHASE 04 ]', heading: 'NVIDIA NIM Reasoning Engine', body: 'GPT-OSS 20B synthesizes contradictions, scores, and claims into a crisp numbered verdict.', stat: 'GPT-OSS 20B · NVIDIA NIM' },
  { label: '[ PHASE 05 ]', heading: 'Explainable Report', body: 'Every conclusion comes with source rankings and a confidence percentage — fully transparent.', stat: 'Full chain-of-thought' },
  { label: '[ INPUT ]', heading: 'Multiple Source Types', body: 'Feed claims manually, scrape a live URL, or upload a PDF/CSV/TXT. All formats processed identically.', stat: 'PDF · URL · Text' },
];

/* ── Pipeline steps ── */
const pipeline = [
  { step: 'INPUT',   desc: 'Manual text / URL / PDF file',                              accent: false },
  { step: 'EMBED',   desc: 'all-MiniLM-L6-v2  →  384-dim vectors',                     accent: true  },
  { step: 'CLUSTER', desc: 'Cosine similarity  →  pair ranking',                        accent: true  },
  { step: 'NLI',     desc: 'DeBERTa-v3  →  entailment / contradiction',                accent: true  },
  { step: 'SCORE',   desc: 'Domain heuristics  →  credibility 0–1',                     accent: true  },
  { step: 'REASON',  desc: 'GPT-OSS 20B (NVIDIA NIM)  →  numbered verdict + rationale', accent: false, green: true },
  { step: 'OUTPUT',  desc: 'Verdict · Confidence · Sources · Reasoning',                accent: false },
];

export default function Home() {
  return (
    <div className="bg-[#0A0A0A] text-white overflow-hidden">

      {/* Cursor spotlight */}
      <MouseGlow />

      {/* Particle starfield */}
      <ParticleField />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden scanlines vignette" style={{ background: 'var(--orange)' }}>

        {/* Drifting glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob-1 absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(0,0,0,0.18)' }} />
          <div className="blob-2 absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* Animated grid mesh */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--orange) 8%, transparent) 1px, transparent 1px),
                            linear-gradient(90deg, color-mix(in srgb, var(--orange) 8%, transparent) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)'
        }} />

        {/* Floating orbs */}
        {[{ w: 320, h: 320, top: '10%', left: '5%', dur: 7, delay: 0 },
          { w: 200, h: 200, top: '60%', left: '70%', dur: 9, delay: 2 },
          { w: 150, h: 150, top: '30%', left: '80%', dur: 6, delay: 1 },
          { w: 250, h: 250, top: '75%', left: '20%', dur: 11, delay: 3 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none blur-[80px]"
            style={{ width: orb.w, height: orb.h, top: orb.top, left: orb.left, background: 'rgba(0,0,0,0.25)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3], x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}

        {/* Moving gradient mesh overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          animate={{
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,0,0,0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0,0,0,0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(0,0,0,0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,0,0,0.3) 0%, transparent 70%)',
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Horizontal scanline glitch bar */}
        <div className="scanline-bar z-0" style={{ top: '40%' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-white/25 px-3 py-1.5 mb-12"
          >
            <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/80">AI Pipeline Active</span>
          </motion.div>

          {/* Headline — glitch char-by-char reveal */}
          <div className="max-w-5xl mb-8" style={{ perspective: '1000px' }}>
            <h1 className="font-black text-[72px] md:text-[96px] lg:text-[112px] leading-[0.92] tracking-[-0.04em] text-white uppercase">
              <GlitchReveal text="Resolve" delay={0.1} /><br />
              <GlitchReveal text="Contradictions." delay={0.18} /><br />
              <motion.span
                className="inline-block"
                style={{ color: '#1A0A00' }}
                initial={{ opacity: 0, x: -40, skewX: -5 }}
                animate={{ opacity: 1, x: 0, skewX: 0 }}
                transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlitchReveal text="Know the Truth." delay={0.72} />
              </motion.span>
            </h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-2 text-[17px] font-medium max-w-xl leading-relaxed"
          >
            <span className="shimmer-text font-bold">Turn conflicting information into clear, explainable truth</span>
            <span className="text-white/70"> using state-of-the-art NLP, semantic analysis, and NVIDIA-powered reasoning.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link href="/signup"
              className="chamfer bg-[#1A0A00] text-white text-[14px] font-bold px-8 py-4 tracking-wide flex items-center gap-2 btn-accent-hover">
              Get Started Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >→</motion.span>
            </Link>
            <Link href="/login"
              className="text-white text-[14px] font-medium px-8 py-4 tracking-wide btn-outline-accent">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-20 flex items-center gap-8 border-t border-white/20 pt-6"
          >
            {[
              { val: '6-Phase', lbl: 'NLP Pipeline' },
              { val: '20B', lbl: 'GPT-OSS Model' },
              { val: '3', lbl: 'Source Types' },
              { val: '100%', lbl: 'Explainable' },
            ].map(({ val, lbl }) => (
              <Counter key={lbl} to={val} label={lbl} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MARQUEE TICKER ═══════════ */}
      <MarqueeStrip />

      {/* ═══════════ PROBLEM SECTION ═══════════ */}
      <section className="bg-[#0A0A0A] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <MonoLabel>[ The Problem ]</MonoLabel>
            <h2 className="text-[52px] md:text-[64px] font-black tracking-[-0.03em] leading-tight max-w-2xl">
              <WordReveal text="Information is broken." />
            </h2>
            <p className="mt-4 text-[#888] text-[16px] max-w-xl leading-relaxed">
              Every day you encounter claims that contradict each other. No tool helps you reconcile them.
            </p>
          </FadeUp>

          <div className="mt-16 grid md:grid-cols-2 gap-px border border-[#222] bg-[#222]">
            {problems.map((p, i) => (
              <FadeUp key={p.n} delay={i * 0.08}>
                <TiltCard>
                  <div className="glow-card bg-[#0A0A0A] p-8 hover:bg-[#0D0D0D] transition-colors group cursor-default h-full">
                    <span className="font-mono text-[11px] tracking-[0.14em] uppercase accent-text mb-4 block">[ {p.n} ]</span>
                    <h3 className="text-[20px] font-bold text-white mb-3 group-hover:accent-text transition-colors duration-300">{p.heading}</h3>
                    <p className="text-[14px] text-[#666] leading-relaxed">{p.body}</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>

          {/* Terminal demo */}
          <FadeUp delay={0.3}>
            <div className="mt-16">
              <TerminalTyping />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ MARQUEE TICKER 2 ═══════════ */}
      <MarqueeStrip />

      {/* ═══════════ SOLUTION SECTION ═══════════ */}
      <section className="bg-[#0A0A0A] border-t border-[#1a1a1a] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <MonoLabel>[ Our Solution ]</MonoLabel>
            <h2 className="text-[52px] md:text-[64px] font-black tracking-[-0.03em] leading-tight">
              Everything automated.<br />
              <span className="accent-text">
                <WordReveal text="Own your insight." delay={0.2} />
              </span>
            </h2>
            <p className="mt-4 text-[#888] text-[16px] max-w-xl leading-relaxed">
              A complete contradiction-resolution pipeline. No guesswork. No black boxes.
            </p>
          </FadeUp>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px border border-[#222] bg-[#222]">
            {features.map((f, i) => (
              <FadeUp key={f.label} delay={i * 0.07}>
                <TiltCard>
                  <div className="glow-card bg-[#0A0A0A] p-8 hover:bg-[#0D0D0D] transition-colors group h-full flex flex-col cursor-default">
                    <span className="font-mono text-[11px] tracking-[0.14em] uppercase accent-text mb-5 block">{f.label}</span>
                    <h3 className="text-[18px] font-bold text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">{f.heading}</h3>
                    <p className="text-[13px] text-[#666] leading-relaxed flex-1">{f.body}</p>
                    <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#444]">{f.stat}</span>
                      <motion.div
                        className="w-4 h-px accent-bg"
                        whileHover={{ width: 32 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PIPELINE DIAGRAM ═══════════ */}
      <section className="bg-[#0A0A0A] border-t border-[#1a1a1a] py-32 px-6 line-grid">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <MonoLabel>[ Pipeline ]</MonoLabel>
            <h2 className="text-[48px] font-black tracking-[-0.03em] mb-16">How it resolves.</h2>
          </FadeUp>

          <div className="flex flex-col gap-0 font-mono text-[13px]">
            {pipeline.map((row, i, arr) => (
              <FadeUp key={row.step} delay={i * 0.06}>
                <div className="flex items-start gap-6 group">
                  <div className="flex flex-col items-center shrink-0 w-6 pt-1">
                    <motion.div
                      className="w-2 h-2 rounded-full border"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, type: 'spring', stiffness: 400 }}
                      style={
                        i === 0 || i === arr.length - 1
                          ? { borderColor: 'white', background: 'white' }
                          : row.green
                            ? { borderColor: '#22C55E', background: '#22C55E' }
                            : { borderColor: 'var(--orange)', background: 'var(--orange)' }
                      }
                    />
                    {i < arr.length - 1 && (
                      <motion.div
                        className="w-px flex-1 min-h-[32px]"
                        initial={{ scaleY: 0, originY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07 + 0.1, duration: 0.4 }}
                        style={{ background: '#333' }}
                      />
                    )}
                  </div>
                  <div className="pb-8 group-last:pb-0 hover:pl-1 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-mono font-bold tracking-[0.1em] w-20 transition-colors duration-200"
                        style={{ color: row.green ? '#22C55E' : row.accent ? 'var(--orange)' : 'white' }}>
                        {row.step}
                      </span>
                      <span className="text-[#444]">——</span>
                      <span className="text-[#666] text-[13px] group-hover:text-[#888] transition-colors duration-200">{row.desc}</span>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="bg-[#0A0A0A] border-t border-[#222] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="relative border border-[#222] p-14 overflow-hidden glow-card">
              {/* Rotating gradient border overlay */}
              <div className="gradient-border absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
              {/* Animated background blobs */}
              <div className="blob-1 absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full pointer-events-none"
                style={{ background: 'color-mix(in srgb, var(--orange) 8%, transparent)' }} />
              <div className="blob-2 absolute -bottom-24 -left-24 w-64 h-64 blur-[80px] rounded-full pointer-events-none"
                style={{ background: 'color-mix(in srgb, var(--orange) 5%, transparent)' }} />
              {/* Content */}
              <div className="relative z-10">
                <MonoLabel>[ Get Started ]</MonoLabel>
                <h2 className="text-[48px] md:text-[64px] font-black tracking-[-0.03em] leading-tight mt-2 max-w-2xl">
                  <WordReveal text="Break free from conflicting information." delay={0.1} />
                </h2>
                <p className="mt-4 text-[#888] text-[16px] max-w-lg leading-relaxed mb-10">
                  Free to use. No credit card required. Paste your claims and get a fully reasoned verdict in seconds.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup"
                    className="chamfer accent-bg text-[14px] font-bold px-8 py-4 tracking-wide orange-glow flex items-center gap-2 btn-accent-hover"
                    style={{ color: 'var(--orange-text)' }}>
                    Create Free Account
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >→</motion.span>
                  </Link>
                  <Link href="/login"
                    className="text-[13px] font-medium px-8 py-4 btn-outline-accent">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#0A0A0A] border-t border-[#1a1a1a] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-black text-white text-[15px] tracking-tight">
              Resolver<span className="accent-text">AI</span>
            </p>
            <p className="font-mono text-[11px] text-[#444] mt-1 tracking-[0.1em] uppercase">
              Contradictory Knowledge Resolver
            </p>
          </div>
          <div className="flex items-center gap-8 font-mono text-[11px] text-[#444] uppercase tracking-[0.1em]">
            <span>NLI · NLP · NVIDIA NIM</span>
            <span className="hidden md:block">·</span>
            <span>DeBERTa · GPT-OSS 20B</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
