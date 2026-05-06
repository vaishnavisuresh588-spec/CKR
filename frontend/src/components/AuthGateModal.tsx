'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Zap, X, ArrowRight, LogIn } from 'lucide-react';

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  action?: string; // e.g. "analyze a file", "compare texts"
}

export default function AuthGateModal({ open, onClose, action = 'use this feature' }: AuthGateModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[101] px-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm border border-[#1e1e1e] bg-[#0D0D0D] relative overflow-hidden">
              {/* Accent glow top */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 blur-[40px] pointer-events-none"
                style={{ background: 'color-mix(in srgb, var(--orange) 15%, transparent)' }} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#444] hover:text-white transition-colors z-20"
              >
                <X size={16} />
              </button>

              <div className="relative z-10 p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-12 h-12 chamfer accent-bg flex items-center justify-center mx-auto mb-5"
                >
                  <LogIn size={20} style={{ color: 'var(--orange-text)' }} />
                </motion.div>

                <h2 className="text-[20px] font-black text-white tracking-tight mb-2">
                  Sign in to continue
                </h2>
                <p className="text-[#555] text-[13px] font-mono leading-relaxed mb-6">
                  You need an account to {action}.<br />
                  It&apos;s free and takes 30 seconds.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="chamfer accent-bg w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold tracking-wide transition-opacity hover:opacity-90"
                    style={{ color: 'var(--orange-text)' }}
                  >
                    Create Free Account <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-medium tracking-wide border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-all"
                  >
                    <LogIn size={14} /> Sign In
                  </Link>
                </div>

                <p className="mt-4 font-mono text-[10px] text-[#333] uppercase tracking-[0.1em]">
                  <span className="w-1 h-1 inline-block accent-bg rounded-full mr-1 align-middle" />
                  ResolverAI · Free forever
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
