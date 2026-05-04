import { motion } from 'framer-motion';

import PartySymbol from './PartySymbol';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function ConstituencyTopCard({ seat }) {
  if (!seat) {
    return (
      <div className="topfour-card">
        <p className="text-base font-black text-[var(--color-ink)]">தரவு காத்திருக்கிறது</p>
      </div>
    );
  }

  return (
    <div className="topfour-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-black text-[var(--color-ink)]">{seat.name}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">
            #{seat.number} · {seat.candidateRoundStatus || seat.roundStatus || 'நேரலை'}
          </p>
        </div>
        <div className="rounded-full bg-[var(--color-sand-strong)] px-3 py-1 text-xs font-bold text-[var(--color-ink-soft)]">
          Top 4
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {(seat.topCandidates || []).slice(0, 4).map((candidate, index) => (
          <div key={`${seat.number}-${candidate.name}-${index}`} className="topfour-row">
            <div className="topfour-rank">{index + 1}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[var(--color-ink)]">{candidate.name}</p>
              <p className="mt-1 truncate text-[11px] font-semibold text-[var(--color-muted)]">
                {candidate.partyTamil} · {candidate.partyCode}
              </p>
            </div>
            <PartySymbol party={candidate} className="topfour-symbol" />
            <div className="text-right">
              <p className="text-sm font-black text-[var(--color-ink)]">
                {formatIndianNumber(candidate.votes)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BattleSpotlight({ seats = [] }) {
  const safeSeats = seats.length ? seats : [null, null];

  return (
    <motion.section
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="topfour-panel"
    >
      <div className="panel-title-bar">
        <h2>2 தொகுதிகள் · Top 4</h2>
        <span>வாக்கு நிலை</span>
      </div>

      <div className="topfour-stack">
        {safeSeats.map((seat, index) => (
          <ConstituencyTopCard key={`${seat?.number || 'empty'}-${index}`} seat={seat} />
        ))}
      </div>
    </motion.section>
  );
}
