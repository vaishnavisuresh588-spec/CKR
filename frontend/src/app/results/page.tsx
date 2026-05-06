'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, Zap, ShieldCheck,
  ArrowLeft, Download, Sparkles, Trophy, Crown
} from 'lucide-react';
import Link from 'next/link';

/* ── Animated circular progress (uses CSS var) ── */
function CircularProgress({ pct }: { pct: number }) {
  const r = 72;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <svg width={180} height={180} className="rotate-[-90deg]">
      <circle cx={90} cy={90} r={r} fill="none" stroke="#1a1a1a" strokeWidth={6} />
      <motion.circle
        cx={90} cy={90} r={r}
        fill="none"
        stroke="var(--orange)"
        strokeWidth={6}
        strokeLinecap="square"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ── Loading screen ── */
function LoadingScreen() {
  const [pct, setPct] = useState(0);
  const phases = [
    'Encoding claims into vector space…',
    'Computing semantic similarity…',
    'Running NLI contradiction detection…',
    'Scoring source credibility…',
    'Synthesizing with OpenAI GPT-OSS 20B…',
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const prog = setInterval(() => {
      setPct(p => { if (p >= 90) { clearInterval(prog); return 90; } return p + Math.random() * 5; });
    }, 300);
    const phase = setInterval(() => setPhaseIdx(i => Math.min(i + 1, phases.length - 1)), 1500);
    return () => { clearInterval(prog); clearInterval(phase); };
  }, []);

  const clamped = Math.min(Math.round(pct), 90);

  return (
    <div className="min-h-screen page-bg flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
        <div className="relative w-[180px] h-[180px]">
          <CircularProgress pct={clamped} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Sparkles size={18} className="accent-text" />
            <span className="font-mono text-[28px] font-bold text-white tracking-tight">{clamped}%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={phaseIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="text-center">
            <p className="text-[15px] font-bold text-white">Generating your insights…</p>
            <p className="font-mono text-[12px] text-[#555] mt-2 tracking-[0.06em]">{phases[phaseIdx]}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-2">
          {phases.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 transition-colors" style={{ background: i <= phaseIdx ? 'var(--orange)' : '#222' }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Verdict chip ── */
function VerdictChip({ confidence }: { confidence: number }) {
  if (confidence >= 0.75)
    return <span className="inline-flex items-center gap-2 bg-[#0a1a0a] border border-[#22C55E]/40 text-[#22C55E] font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5"><CheckCircle2 size={12} /> Consistent</span>;
  if (confidence >= 0.5)
    return <span className="inline-flex items-center gap-2 bg-[#1a1200] border border-[#FF9500]/40 text-[#FF9500] font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5"><Zap size={12} /> Partially Aligned</span>;
  return <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5" style={{ background: 'color-mix(in srgb, var(--orange) 10%, transparent)', borderWidth: 1, borderColor: 'color-mix(in srgb, var(--orange) 40%, transparent)', color: 'var(--orange)' }}><AlertTriangle size={12} /> Contradictory</span>;
}

/* ── Parse structured reasoning from AI ── */
function parseReasoning(reasoning: string) {
  const lines = reasoning.split('\n').map(l => l.trim()).filter(Boolean);
  let claim1 = '', claim2 = '', winner = '', why = '', confidence = '';

  for (const line of lines) {
    if (line.startsWith('1:')) claim1 = line.replace(/^1:\s*/, '');
    else if (line.startsWith('2:')) claim2 = line.replace(/^2:\s*/, '');
    else if (line.toLowerCase().startsWith('winner:')) winner = line.replace(/^winner:\s*/i, '');
    else if (line.toLowerCase().startsWith('why:')) why = line.replace(/^why:\s*/i, '');
    else if (line.toLowerCase().startsWith('confidence:')) confidence = line.replace(/^confidence:\s*/i, '');
  }

  return { claim1, claim2, winner, why, confidence };
}

const CARD = 'bg-[#111] border border-[#222] hover:border-[#333] transition-colors';

/* ── Main ── */
export default function Results() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('analysisResult');
    if (!data) { router.push('/analyzer'); return; }
    const parsed = JSON.parse(data);
    setTimeout(() => { setResult(parsed); setLoading(false); }, 3000);
  }, [router]);

  if (loading) return <LoadingScreen />;

  const parsed = parseReasoning(result.reasoning || '');
  const winnerNum = parsed.winner.trim();

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-6 py-12 space-y-4 pb-32"
    >
      {/* Back */}
      <Link href="/analyzer" className="inline-flex items-center gap-2 font-mono text-[11px] text-[#444] hover:text-[#888] tracking-[0.1em] uppercase transition-colors mb-4">
        <ArrowLeft size={12} /> Back to Analyzer
      </Link>

      {/* ── Verdict card ── */}
      <div className={`${CARD} p-8`}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#444] block mb-3">[ AI Assessment ]</span>
            <h2 className="text-[20px] font-bold text-white leading-snug max-w-2xl">{result.final_conclusion}</h2>
          </div>
          <VerdictChip confidence={result.confidence} />
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between font-mono text-[10px] tracking-[0.1em] uppercase text-[#444] mb-2">
            <span>Confidence Score</span>
            <span className="accent-text">{(result.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#1a1a1a] h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence * 100}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              className="h-full accent-bg"
            />
          </div>
        </div>
      </div>

      {/* ── Comparison: Claim 1 vs Claim 2 ── */}
      {parsed.claim1 && parsed.claim2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Claim 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${CARD} p-6 relative ${winnerNum === '1' ? 'border-[#22C55E]/60' : ''}`}
          >
            {winnerNum === '1' && (
              <div className="absolute -top-3 -right-3 bg-[#22C55E] text-black p-1.5 rounded-full">
                <Crown size={14} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[20px] font-bold accent-text">1</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#444]">Claim</span>
            </div>
            <p className="text-[14px] text-[#ccc] leading-relaxed">{parsed.claim1}</p>
          </motion.div>

          {/* Claim 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${CARD} p-6 relative ${winnerNum === '2' ? 'border-[#22C55E]/60' : ''}`}
          >
            {winnerNum === '2' && (
              <div className="absolute -top-3 -right-3 bg-[#22C55E] text-black p-1.5 rounded-full">
                <Crown size={14} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[20px] font-bold accent-text">2</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#444]">Claim</span>
            </div>
            <p className="text-[14px] text-[#ccc] leading-relaxed">{parsed.claim2}</p>
          </motion.div>
        </div>
      )}

      {/* ── Why this one wins ── */}
      {parsed.why && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={`${CARD} p-6`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-[#22C55E]" />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#888]">
              Claim {winnerNum} wins
            </span>
          </div>
          <p className="text-[14px] text-[#ccc] leading-relaxed">{parsed.why}</p>
        </motion.div>
      )}

      {/* ── Source credibility ── */}
      <div className={`${CARD} p-8`}>
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={15} className="accent-text" />
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#888]">Source Credibility Ranking</span>
        </div>
        <div className="space-y-5">
          {result.source_ranking?.map((rank: any, idx: number) => {
            const score = rank.score as number;
            const color = score > 0.6 ? '#22C55E' : score > 0.4 ? '#FF9500' : 'var(--orange)';
            return (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[13px] font-semibold text-white truncate max-w-[70%]">{rank.source}</span>
                  <span className="font-mono text-[11px] text-[#444]">{(score * 100).toFixed(0)} / 100</span>
                </div>
                <div className="w-full bg-[#1a1a1a] h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.4 + idx * 0.12 }}
                    className="h-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end pt-2">
        <button className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#222] text-[#444] hover:text-[#888] hover:border-[#333] px-5 py-2.5 transition-colors">
          <Download size={12} /> Download Report
        </button>
      </div>
    </motion.main>
  );
}