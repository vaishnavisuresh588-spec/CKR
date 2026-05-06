'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Eraser, GitCompare } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';

function wordCount(t: string) { return t.trim() === '' ? 0 : t.trim().split(/\s+/).length; }

export default function TextCompare() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('resolver_auth') === 'true');
  }, []);

  const switchTexts = () => { setText1(text2); setText2(text1); };
  const clearAll = () => { setText1(''); setText2(''); };

  const analyze = async () => {
    if (!text1.trim() || !text2.trim()) return;
    if (localStorage.getItem('resolver_auth') !== 'true') { setShowAuthGate(true); return; }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        topic: 'Comparison between two texts',
        claims: [
          { text: text1, source: 'Text A', domain: 'User Input' },
          { text: text2, source: 'Text B', domain: 'User Input' },
        ],
      });
      sessionStorage.setItem('analysisResult', JSON.stringify(response.data));
      router.push('/results');
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please ensure the backend is running.');
      setLoading(false);
    }
  };

  const canCompare = text1.trim().length > 0 && text2.trim().length > 0 && !loading;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] overflow-hidden">
      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        action="compare texts"
      />

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a1a] bg-[#0D0D0D] z-10 shrink-0"
        style={{ marginTop: 64 }}
      >
        {/* Left */}
        <div className="flex items-center gap-2">
          <button onClick={switchTexts}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#222] font-mono text-[11px] text-[#555] hover:text-[#888] hover:border-[#333] transition-colors tracking-[0.08em] uppercase">
            <ArrowLeftRight size={12} /> Switch
          </button>
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#222] font-mono text-[11px] text-[#555] hover:text-[#888] hover:border-[#333] transition-colors tracking-[0.08em] uppercase">
            <Eraser size={12} /> Clear all
          </button>
        </div>

        {/* Center */}
        <button
          onClick={analyze}
          disabled={!canCompare}
          className="chamfer flex items-center gap-2 px-8 py-2.5 text-[13px] font-bold tracking-wide transition-all"
          style={canCompare ? { background: 'var(--orange)', color: 'var(--orange-text)' } : { background: '#1a1a1a', color: '#333', cursor: 'not-allowed' }}
        >
          {loading ? (
            <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Comparing…</>
          ) : (
            <><GitCompare size={14} /> Compare!</>
          )}
        </button>

        {/* Right */}
        <div className="font-mono text-[11px] text-[#333] min-w-[140px] text-right tracking-[0.06em]">
          {text1.length > 0 || text2.length > 0
            ? `${wordCount(text1)} / ${wordCount(text2)} words`
            : 'paste texts to compare'}
        </div>
      </motion.div>

      {/* ── Two-panel editor ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-1 min-h-0"
      >
        {/* Panel A */}
        <div className="flex-1 flex flex-col border-r border-[#1a1a1a] min-h-0">
          <div className="flex items-center justify-between px-5 py-2 border-b border-[#111] bg-[#0D0D0D] shrink-0">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase accent-text">Text A</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">
              {text1.trim() !== '' ? `${wordCount(text1)} words · ${text1.length} chars` : ''}
            </span>
          </div>
          <textarea
            value={text1}
            onChange={e => setText1(e.target.value)}
            placeholder="Paste one version of a text here..."
            className="flex-1 w-full resize-none p-5 text-[13px] leading-relaxed text-[#ccc] placeholder:text-[#2a2a2a] outline-none bg-[#0A0A0A] font-mono accent-caret"
            spellCheck={false}
          />
        </div>

        {/* Panel B */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-2 border-b border-[#111] bg-[#0D0D0D] shrink-0">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase accent-text">Text B</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">
              {text2.trim() !== '' ? `${wordCount(text2)} words · ${text2.length} chars` : ''}
            </span>
          </div>
          <textarea
            value={text2}
            onChange={e => setText2(e.target.value)}
            placeholder="Paste another version of the text here..."
            className="flex-1 w-full resize-none p-5 text-[13px] leading-relaxed text-[#ccc] placeholder:text-[#2a2a2a] outline-none bg-[#0A0A0A] font-mono accent-caret"
            spellCheck={false}
          />
        </div>
      </motion.div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-6 py-1.5 border-t border-[#111] bg-[#0D0D0D] shrink-0">
        <span className="font-mono text-[10px] text-[#333] tracking-[0.1em] uppercase">
          {canCompare ? '● ready to compare' : '○ fill both panels'}
        </span>
        <span className="font-mono text-[10px] text-[#222] tracking-[0.08em]">ResolverAI · Text Compare</span>
      </div>
    </div>
  );
}
