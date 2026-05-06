'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  FileText, Link as LinkIcon, MessageSquare,
  Upload, X, ChevronRight, ArrowRight, CheckCircle2, Plus,
  GitCompare, Zap, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGateModal from '@/components/AuthGateModal';

type SourceTab = 'compare' | 'links' | 'text';

const sourceTypes = [
  {
    id: 'compare' as SourceTab, label: 'Compare Files', icon: GitCompare,
    desc: 'Upload 2 docs — detect contradictions between them.',
    badge: 'NEW',
  },
  {
    id: 'links' as SourceTab, label: 'Multi-Link', icon: LinkIcon,
    desc: 'Paste 2–5 URLs — scrape & compare claims across sources.',
  },
  {
    id: 'text' as SourceTab, label: 'Q&A / Manual', icon: MessageSquare,
    desc: 'Type or paste claims directly to check.',
  },
];

/* Real-world use-case examples per tab */
const EXAMPLES: Record<SourceTab, { icon: string; label: string }[]> = {
  compare: [
    { icon: '⚖️', label: 'Two court documents with conflicting testimonies' },
    { icon: '💊', label: 'Drug trial paper vs. WHO guidelines' },
    { icon: '📰', label: 'Two news reports on the same event' },
    { icon: '🧾', label: 'Insurance policy vs. claim report' },
  ],
  links: [
    { icon: '📰', label: 'CNN vs. BBC on same breaking news' },
    { icon: '🔗', label: 'Multiple product spec pages to compare' },
    { icon: '📚', label: 'Multiple medical journal URLs' },
    { icon: '💹', label: 'Analyst reports from different sources' },
  ],
  text: [
    { icon: '🗣️', label: 'Witness statements that may contradict' },
    { icon: '📝', label: 'Two expert opinions on a diagnosis' },
    { icon: '🏛️', label: 'Political claims from opposing parties' },
    { icon: '🧪', label: 'Experimental results vs. hypothesis' },
  ],
};

function FileDropZone({
  label, file, onFile, accept = '.pdf,.txt,.csv,.docx,.doc',
}: { label: string; file: File | null; onFile: (f: File) => void; accept?: string }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => ref.current?.click()}
      className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed py-8 cursor-pointer transition-all duration-200"
      style={
        drag   ? { borderColor: 'var(--orange)', background: 'color-mix(in srgb, var(--orange) 8%, transparent)' }
        : file ? { borderColor: '#22C55E',       background: '#071a07' }
               : { borderColor: '#2a2a2a',       background: '#0D0D0D' }
      }
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      <div className="absolute top-2 left-3 font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--orange)' }}>{label}</div>

      {file ? (
        <>
          <CheckCircle2 size={24} className="text-[#22C55E]" />
          <div className="text-center px-4">
            <p className="text-[13px] font-semibold text-white truncate max-w-[180px]">{file.name}</p>
            <p className="font-mono text-[11px] text-[#555] mt-1">{(file.size / 1024).toFixed(1)} KB · click to change</p>
          </div>
        </>
      ) : (
        <>
          <Upload size={20} style={{ color: 'var(--orange)' }} />
          <div className="text-center px-4">
            <p className="text-[13px] font-semibold text-white">Drop {label} here</p>
            <p className="font-mono text-[10px] text-[#444] mt-1">PDF · DOCX · TXT · CSV</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Analyzer() {
  const [activeTab,    setActiveTab]    = useState<SourceTab>('compare');
  const [fileA,        setFileA]        = useState<File | null>(null);
  const [fileB,        setFileB]        = useState<File | null>(null);
  const [topic,        setTopic]        = useState('');
  // Multi-Link state
  const [urls,         setUrls]         = useState<string[]>(['', '']);
  const [multiTopic,   setMultiTopic]   = useState('');
  const [claims,       setClaims]       = useState([{ text: '', source: '', domain: '' }]);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingStep,  setLoadingStep]  = useState('');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('resolver_auth') === 'true');
  }, []);

  const requireAuth = () => { if (!isLoggedIn) { setShowAuthGate(true); return false; } return true; };
  const addClaim    = () => setClaims([...claims, { text: '', source: '', domain: '' }]);
  const removeClaim = (i: number) => claims.length > 1 && setClaims(claims.filter((_, idx) => idx !== i));
  const updateClaim = (i: number, field: keyof typeof claims[0], v: string) => {
    const next = [...claims]; next[i][field] = v; setClaims(next);
  };

  // Multi-Link URL list helpers
  const addUrl    = () => urls.length < 5 && setUrls([...urls, '']);
  const removeUrl = (i: number) => urls.length > 2 && setUrls(urls.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, v: string) => { const next = [...urls]; next[i] = v; setUrls(next); };

  const analyze = async () => {
    if (!requireAuth()) return;
    setError(null);
    setLoading(true);

    try {
      let response;

      if (activeTab === 'compare') {
        if (!fileA || !fileB) { alert('Please upload both files.'); setLoading(false); return; }
        setLoadingStep('Extracting text from files…');
        const fd = new FormData();
        fd.append('fileA', fileA);
        fd.append('fileB', fileB);
        if (topic) fd.append('topic', topic);
        setLoadingStep('Running AI contradiction analysis…');
        response = await axios.post('http://localhost:5000/api/compare-files', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        });
      } else if (activeTab === 'links') {
        const validUrls = urls.filter(u => u.trim());
        if (validUrls.length < 2) { alert('Please enter at least 2 URLs to compare.'); setLoading(false); return; }
        setLoadingStep(`Scraping ${validUrls.length} pages in parallel…`);
        response = await axios.post('http://localhost:5000/api/compare-urls', {
          urls: validUrls,
          topic: multiTopic || undefined,
        }, { timeout: 120000 });
      } else {
        const filtered = claims.filter(c => c.text.trim());
        if (!topic) { alert('Please enter a topic.'); setLoading(false); return; }
        if (filtered.length < 2) { alert('Please enter at least 2 claims to detect contradictions.'); setLoading(false); return; }
        setLoadingStep('Processing claims…');
        response = await axios.post('http://localhost:5000/api/analyze', { topic, claims: filtered }, { timeout: 120000 });
      }

      sessionStorage.setItem('analysisResult', JSON.stringify(response.data));
      router.push('/results');
    } catch (err: any) {
      console.error(err);
      const data  = err?.response?.data;
      const status = err?.response?.status;

      if (data?.error === 'off_topic') {
        setError({ title: '⚠️ Documents are off-topic', detail: data.message });
      } else if (status === 503) {
        setError({
          title: '🔴 AI Pipeline not running',
          detail: (data?.error || 'AI service unavailable') + '\n\nRun: cd ai-pipeline && uvicorn main:app --reload',
        });
      } else {
        // Surface per-URL scrape failures if present
        const failedUrls: string[] = data?.failed ?? [];
        const failDetail = failedUrls.length
          ? `\n\nFailed URLs:\n${failedUrls.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}\n\nTip: Use Wikipedia, .gov, or plain article pages — BBC/Reuters require JS rendering.`
          : '';
        setError({
          title: 'Analysis Failed',
          detail: (data?.error || data?.details || 'Make sure both the backend (port 5000) and AI pipeline (port 8000) are running.') + failDetail,
        });
      }
      setLoading(false);
      setLoadingStep('');
    }
  };

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder:text-[#444] px-4 py-3 text-[13px] outline-none transition-colors font-mono focus:border-[var(--orange)]';
  const canAnalyze = () => {
    if (activeTab === 'compare') return !!fileA && !!fileB;
    if (activeTab === 'links') return urls.filter(u => u.trim()).length >= 2;
    return !!topic && claims.filter(c => c.text.trim()).length >= 2;
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-4 py-12">
      <AuthGateModal open={showAuthGate} onClose={() => setShowAuthGate(false)} action="analyze content" />

      {/* Off-topic / error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[520px] border border-amber-600/40 bg-amber-950/60 backdrop-blur-md px-5 py-4 flex items-start gap-3 shadow-xl"
          >
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-amber-300">{error.title}</p>
              <p className="text-[11px] font-mono text-amber-500/80 mt-1 leading-relaxed">{error.detail}</p>
            </div>
            <button onClick={() => setError(null)} className="text-amber-600 hover:text-amber-400 transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-[#222] border-t-[var(--orange)]"
            />
            <div className="text-center">
              <p className="text-white font-bold text-[16px]">Analyzing…</p>
              <p className="font-mono text-[12px] text-[#555] mt-1">{loadingStep}</p>
            </div>
            <div className="flex gap-2">
              {['Extracting', 'Clustering', 'NLI Check', 'Reasoning'].map((s, i) => (
                <motion.span key={s}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.4 }}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] px-2 py-1 border border-[#222] text-[#444]">
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[920px] bg-[#111] border border-[#222] flex flex-col"
        style={{ minHeight: 560 }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1a1a1a]">
          <div className="w-3 h-3 rounded-full accent-bg" />
          <div className="w-3 h-3 rounded-full bg-[#333]" />
          <div className="w-3 h-3 rounded-full bg-[#333]" />
          <span className="font-mono text-[11px] text-[#444] tracking-[0.1em] uppercase ml-4">
            resolver.ai — contradiction detector
          </span>
          <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--orange)' }}>
            <Zap size={10} />
            <span>AI Pipeline Active</span>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* LEFT — source type picker */}
          <aside className="w-[220px] shrink-0 bg-[#0D0D0D] border-r border-[#1a1a1a] p-4 flex flex-col gap-1.5">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#444] mb-3 px-1">
              Input Source
            </p>
            {sourceTypes.map(src => {
              const Icon = src.icon;
              const active = activeTab === src.id;
              return (
                <button key={src.id} onClick={() => setActiveTab(src.id)}
                  className="w-full flex items-center justify-between gap-3 border px-3 py-3 text-left transition-all duration-150"
                  style={active
                    ? { borderColor: 'var(--orange)', background: 'color-mix(in srgb, var(--orange) 8%, transparent)' }
                    : { borderColor: '#1a1a1a', background: 'transparent' }}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={13} style={{ color: active ? 'var(--orange)' : '#555' }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-[#666]'}`}>
                          {src.label}
                        </p>
                        {src.badge && (
                          <span className="text-[9px] font-bold px-1 py-0.5 accent-bg leading-none"
                            style={{ color: 'var(--orange-text)' }}>{src.badge}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#333] mt-0.5 font-mono leading-tight">{src.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={11} style={{ color: active ? 'var(--orange)' : '#2a2a2a' }} />
                </button>
              );
            })}
          </aside>

          {/* RIGHT — configure panel */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-[14px]">
                  {sourceTypes.find(s => s.id === activeTab)?.label}
                </p>
                <p className="font-mono text-[11px] text-[#444] mt-0.5">
                  {sourceTypes.find(s => s.id === activeTab)?.desc}
                </p>
              </div>
              <button onClick={() => router.push('/')} className="text-[#333] hover:text-[#777] transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* ── COMPARE FILES tab ── */}
            <AnimatePresence mode="wait">
              {activeTab === 'compare' && (
                <motion.div key="compare"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <FileDropZone label="Document A" file={fileA} onFile={setFileA} />
                    <FileDropZone label="Document B" file={fileB} onFile={setFileB} />
                  </div>

                  {fileA && fileB && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 font-mono text-[11px] text-[#22C55E] border border-[#22C55E]/20 bg-[#071a07] px-3 py-2">
                      <CheckCircle2 size={12} />
                      Both files ready — AI will detect contradictions between them
                    </motion.div>
                  )}

                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="Topic / context (e.g. COVID-19 vaccine efficacy)" className={inputCls} />

                  {/* VS divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1a1a1a]" />
                    <div className="font-mono text-[10px] text-[#333] tracking-[0.15em] flex items-center gap-1.5">
                      <GitCompare size={10} /> REAL-WORLD USE CASES
                    </div>
                    <div className="flex-1 h-px bg-[#1a1a1a]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {EXAMPLES.compare.map(ex => (
                      <div key={ex.label}
                        className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a] bg-[#0D0D0D] text-[11px] text-[#555] font-mono">
                        <span>{ex.icon}</span>{ex.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── MULTI-LINK tab (2-5 URLs, cross-source comparison) ── */}
              {activeTab === 'links' && (
                <motion.div key="links"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Info banner */}
                  <div className="border border-[#1a1a1a] bg-[#0D0D0D] p-3 flex items-start gap-2.5">
                    <LinkIcon size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--orange)' }} />
                    <p className="font-mono text-[11px] text-[#555]">
                      Add 2–5 URLs from different sources. The AI will scrape all of them in parallel, label each claim by origin, and detect cross-source contradictions.
                    </p>
                  </div>

                  {/* Optional topic */}
                  <input type="text" value={multiTopic} onChange={e => setMultiTopic(e.target.value)}
                    placeholder="Topic / context (e.g. COVID-19 vaccine efficacy) — optional"
                    className={inputCls} />

                  {/* Dynamic URL list */}
                  <div className="space-y-2">
                    {urls.map((u, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, delay: i * 0.04 }}
                        className="flex items-center gap-2"
                      >
                        {/* Source badge */}
                        <span
                          className="shrink-0 font-mono text-[10px] font-bold px-2 py-1 border"
                          style={{
                            color: 'var(--orange)',
                            borderColor: 'color-mix(in srgb, var(--orange) 30%, transparent)',
                            background: 'color-mix(in srgb, var(--orange) 6%, transparent)',
                          }}
                        >
                          S{i + 1}
                        </span>
                        <input
                          type="url"
                          value={u}
                          onChange={e => updateUrl(i, e.target.value)}
                          placeholder={`https://source-${i + 1}.com/article`}
                          className={`${inputCls} flex-1`}
                        />
                        {urls.length > 2 && (
                          <button
                            onClick={() => removeUrl(i)}
                            className="px-2 text-[#444] hover:accent-text transition-colors"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Add URL button */}
                  {urls.length < 5 && (
                    <button
                      onClick={addUrl}
                      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--orange)' }}
                    >
                      <Plus size={11} /> Add URL ({urls.length}/5)
                    </button>
                  )}

                  {/* Source count badge when ≥2 filled */}
                  {urls.filter(u => u.trim()).length >= 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 font-mono text-[11px] text-[#22C55E] border border-[#22C55E]/20 bg-[#071a07] px-3 py-2">
                      <CheckCircle2 size={12} />
                      {urls.filter(u => u.trim()).length} sources ready — AI will compare claims across all of them
                    </motion.div>
                  )}

                  {/* Example use cases */}
                  <div className="grid grid-cols-2 gap-2">
                    {EXAMPLES.links.map(ex => (
                      <div key={ex.label}
                        className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a] bg-[#0D0D0D] text-[11px] text-[#555] font-mono">
                        <span>{ex.icon}</span>{ex.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Q&A / Manual tab ── */}
              {activeTab === 'text' && (
                <motion.div key="text"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="Topic (e.g. climate change, vaccine safety)" className={inputCls} />

                  {/* Min 2 claims notice */}
                  <div className="border border-[#1a1a1a] bg-[#0D0D0D] p-3 flex items-start gap-2.5">
                    <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="font-mono text-[11px] text-[#555]">
                      Add at least <span className="text-amber-400">2 claims</span> to enable contradiction detection. Each claim should represent a distinct assertion from a different source.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {claims.map((claim, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        {/* Claim number badge */}
                        <span
                          className="shrink-0 font-mono text-[10px] font-bold px-2 py-[11px] border mt-0"
                          style={{
                            color: 'var(--orange)',
                            borderColor: 'color-mix(in srgb, var(--orange) 30%, transparent)',
                            background: 'color-mix(in srgb, var(--orange) 6%, transparent)',
                          }}
                        >
                          C{idx + 1}
                        </span>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <input type="text" value={claim.text} onChange={e => updateClaim(idx, 'text', e.target.value)}
                            placeholder={`Claim ${idx + 1} — e.g. "Studies show X causes Y"`}
                            className={inputCls} />
                          <input type="text" value={claim.source} onChange={e => updateClaim(idx, 'source', e.target.value)}
                            placeholder="Source (e.g. WHO, BBC News, Nature 2023)"
                            className={inputCls} style={{ fontSize: '11px', paddingTop: '8px', paddingBottom: '8px' }} />
                        </div>
                        {claims.length > 1 && (
                          <button onClick={() => removeClaim(idx)} className="px-2 py-2 text-[#444] hover:accent-text transition-colors mt-0">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={addClaim}
                      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--orange)' }}>
                      <Plus size={11} /> Add claim
                    </button>
                  </div>

                  {/* Ready indicator */}
                  {claims.filter(c => c.text.trim()).length >= 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 font-mono text-[11px] text-[#22C55E] border border-[#22C55E]/20 bg-[#071a07] px-3 py-2">
                      <CheckCircle2 size={12} />
                      {claims.filter(c => c.text.trim()).length} claims ready — AI will detect contradictions between them
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {EXAMPLES.text.map(ex => (
                      <div key={ex.label}
                        className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a] bg-[#0D0D0D] text-[11px] text-[#555] font-mono">
                        <span>{ex.icon}</span>{ex.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a1a1a] bg-[#0D0D0D]">
          <button onClick={() => router.push('/')}
            className="font-mono text-[12px] text-[#555] hover:text-[#888] border border-[#222] px-4 py-2 transition-colors tracking-[0.08em] uppercase">
            Cancel
          </button>
          <motion.button
            onClick={analyze}
            disabled={loading || !canAnalyze()}
            whileHover={canAnalyze() ? { scale: 1.02 } : {}}
            whileTap={canAnalyze() ? { scale: 0.97 } : {}}
            className="chamfer accent-bg hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed text-[13px] font-bold px-6 py-2.5 transition-all flex items-center gap-2 tracking-wide"
            style={{ color: 'var(--orange-text)' }}
          >
            {loading
              ? <><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing…</>
              : activeTab === 'compare'
              ? <><GitCompare size={14} /> Compare & Detect</>
              : <><ArrowRight size={14} /> Analyze</>
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}