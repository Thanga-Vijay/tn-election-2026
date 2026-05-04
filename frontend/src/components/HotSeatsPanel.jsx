import { motion } from 'framer-motion';

import PartySymbol from './PartySymbol';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export default function HotSeatsPanel({ contests }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="lead-list-panel"
    >
      <div className="panel-title-bar">
        <h2>முன்னிலை 10 தொகுதிகள்</h2>
        <span>நேரடி</span>
      </div>

      <div className="lead-list-rows">
        {contests.map((seat, index) => (
          <div key={`${seat.number}-${seat.name}-${index}`} className="lead-list-row">
            <div className="lead-list-rank">{index + 1}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[var(--color-ink)]">{seat.name}</p>
              <p className="mt-1 truncate text-xs font-semibold text-[var(--color-muted)]">
                {seat.leadingCandidate}
              </p>
            </div>
            <div className="lead-list-party">
              <PartySymbol
                party={{
                  code: seat.leadingPartyCode,
                  color: seat.topCandidates?.[0]?.color || '#888',
                  symbolImage: seat.leadingSymbolImage,
                  partyTamil: seat.leadingPartyTamil
                }}
                className="lead-list-symbol"
              />
              <div>
                <p className="text-xs font-black text-[var(--color-ink-soft)]">{seat.leadingPartyTamil}</p>
                <p className="text-[11px] font-semibold text-[var(--color-muted)]">
                  {formatIndianNumber(seat.margin)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
