import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export default function ConstituencyTable({ constituencies }) {
  const [open, setOpen] = useState(false);

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
