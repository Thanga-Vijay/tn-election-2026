import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import LeaderPortrait from './LeaderPortrait';

function AnimatedValue({ value, className = '', style }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.3 }}
          className="block"
          style={style}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function PartyCard({ party, majority, index, isLeader, flashToken }) {
  const [flash, setFlash] = useState(false);
  const progress = Math.min((party.total / majority) * 100, 100);

  useEffect(() => {
    if (!flashToken) {
      return undefined;
    }

    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 900);

    return () => window.clearTimeout(timer);
  }, [flashToken]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0, scale: isLeader ? 1.02 : 1 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      style={{ '--party-color': party.color }}
      className={`party-card glass-panel rounded-3xl p-5 sm:p-6 ${party.hasMajority ? 'party-card-majority' : ''} ${flash ? 'card-flash' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="leader-thumb-ring">
            <LeaderPortrait party={party} className="leader-image-sm" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{party.tamil}</p>
            <p className="mt-1 text-sm font-bold text-[var(--color-gold)]">{party.leaderTamil}</p>
            <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-[var(--color-faint)]">
              {party.code}
            </p>
          </div>
        </div>

        <div className="text-right">
          <AnimatedValue
            value={party.total}
            className="orbitron text-5xl font-black leading-none sm:text-6xl"
            style={{
              color: 'var(--party-color)',
              textShadow: '0 0 18px var(--party-color)'
            }}
          />
          <p
            className="mt-2 text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: 'var(--party-color)' }}
          >
            மொத்தம்
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)]">வென்றவை</p>
          <AnimatedValue value={party.won} className="mt-2 text-2xl font-black text-[var(--color-green)]" />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)]">முன்னிலை</p>
          <AnimatedValue
            value={party.leading}
            className="mt-2 text-2xl font-black text-[var(--color-orange)]"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)]">வாக்கு %</p>
          <AnimatedValue
            value={`${(party.votePct ?? party.pct).toFixed(1)}%`}
            className="mt-2 text-2xl font-black"
            style={{ color: 'var(--party-color)' }}
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-[var(--color-muted)]">பெரும்பான்மைக்கு முன்னேற்றம்</p>
          <p className="font-bold" style={{ color: 'var(--party-color)' }}>
            {party.hasMajority ? '👑 பெரும்பான்மை கடந்தது' : `${party.total}/${majority}`}
          </p>
        </div>

        <div className="party-progress">
          <motion.div
            className="party-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.article>
  );
}
