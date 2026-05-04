import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export default function ConstituencyTable({ constituencies, compact = false }) {
  const [open, setOpen] = useState(false);

  // Compact mode for sidebar display
  if (compact) {
    return (
      <div className="space-y-2.5">
        {constituencies.map((seat, idx) => (
          <motion.div
            key={`${seat.number}-${seat.name}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white rounded-xl p-3.5 shadow-lg hover:shadow-xl transition-all border-l-4"
            style={{ borderColor: seat.leadingPartyColor || seat.color || '#999' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl flex flex-col items-center justify-center font-black shadow-lg">
                <div className="text-xs leading-none opacity-75">தொ.</div>
                <div className="text-xl leading-none">{seat.number}</div>
              </div>
              
              {(seat.leadingSymbolImage || seat.leadingPartySymbol) && (
                <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                  <img 
                    src={seat.leadingSymbolImage || seat.leadingPartySymbol} 
                    alt={seat.leadingPartyCode}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-gray-900 truncate mb-1">{seat.name}</h3>
                <p className="text-xs font-bold text-gray-700 truncate mb-1.5">
                  {seat.leadingCandidate}
                </p>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs font-black px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: seat.leadingPartyColor || seat.color || '#666' }}
                  >
                    {seat.leadingPartyCode}
                  </span>
                  <span className="text-xs font-bold text-gray-600 truncate">
                    {seat.leadingPartyTamil}
                  </span>
                </div>
              </div>
              
              <div className="text-right shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl px-3 py-2.5 shadow-sm border border-gray-200">
                <div 
                  className="text-2xl font-black leading-none"
                  style={{ color: seat.leadingPartyColor || seat.color || '#666' }}
                >
                  {(seat.leaderVotes || seat.leadCandidateVotes || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gray-600 mt-1.5 font-bold">வாக்கு</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Full table mode

  return (
    <section className="table-shell glass-panel rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
      >
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">விரிவான தொகுதி நிலவர அட்டவணை</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            முன்னிலை வேட்பாளர், பின்தொடரும் வேட்பாளர், வித்தியாசம் மற்றும் சுற்று நிலை
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1.5 text-sm font-bold text-[var(--color-gold)]">
          {open ? 'மறை' : 'காட்டு'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="table-scroll border-t border-[var(--color-border)]"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-softer)] text-left text-sm text-[var(--color-muted)]">
                  <th className="px-5 py-4 font-semibold sm:px-6">தொகுதி</th>
                  <th className="px-5 py-4 font-semibold sm:px-6">முன்னிலை</th>
                  <th className="px-5 py-4 font-semibold sm:px-6">பின்தொடர்வு</th>
                  <th className="px-5 py-4 font-semibold sm:px-6">வித்தியாசம்</th>
                  <th className="px-5 py-4 font-semibold sm:px-6">நிலை</th>
                </tr>
              </thead>
              <tbody>
                {constituencies.map((seat) => (
                  <tr key={`${seat.number}-${seat.name}`} className="border-t border-[var(--color-border)] text-sm text-white">
                    <td className="px-5 py-4 sm:px-6">
                      <div>
                        <p className="font-bold text-white">{seat.name}</p>
                        <p className="mt-1 text-xs text-[var(--color-faint)]">#{seat.number}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div>
                        <p className="font-bold">{seat.leadingCandidate}</p>
                        <p className="mt-1 text-xs text-[var(--color-gold)]">
                          {seat.leadingPartyTamil} · {seat.leadingPartyCode}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-faint)]">
                          வாக்குகள்: {formatIndianNumber(seat.leaderVotes)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div>
                        <p className="font-bold">{seat.trailingCandidate}</p>
                        <p className="mt-1 text-xs text-[var(--color-faint)]">
                          {seat.trailingPartyTamil} · {seat.trailingPartyCode}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-faint)]">
                          வாக்குகள்: {formatIndianNumber(seat.runnerVotes)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-white sm:px-6">
                      {formatIndianNumber(seat.margin)}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="rounded-full bg-[var(--color-surface-soft)] px-3 py-2 text-xs font-bold text-[var(--color-muted)]">
                        {seat.roundStatus || 'நேரலை'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
