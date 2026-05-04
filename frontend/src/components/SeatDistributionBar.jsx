import { motion } from 'framer-motion';

export default function SeatDistributionBar({ parties, total, majority }) {
  const majorityPercent = (majority / total) * 100;

  return (
    <section className="broadcast-panel rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">இருக்கை விநியோகம்</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ஒவ்வொரு கட்சியும் எட்டியுள்ள தற்போதைய மொத்த நிலை</p>
        </div>
        <div className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-gold-soft)] px-3 py-2 text-xs font-bold text-[var(--color-gold)]">
          👑 பெரும்பான்மை {majority}
        </div>
      </div>

      <div className="relative pt-8">
        <div
          className="absolute -top-0.5 -translate-x-1/2 rounded-full bg-[var(--color-gold-soft)] px-3 py-1 text-xs font-bold text-[var(--color-gold)]"
          style={{ left: `${majorityPercent}%` }}
        >
          👑 பெரும்பான்மை {majority}
        </div>

        <div className="relative flex h-12 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]">
          {parties.map((party) => {
            const width = total > 0 ? (party.total / total) * 100 : 0;

            return (
              <motion.div
                key={party.code}
                className="seat-segment"
                style={{ '--party-color': party.color }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                title={`${party.code}: ${party.total}`}
              >
                {width > 4 ? <span className="relative z-10 text-xs sm:text-sm">{party.code}</span> : null}
              </motion.div>
            );
          })}

          <div className="majority-marker" style={{ left: `${majorityPercent}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
        {parties.map((party) => (
          <div key={party.code} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-softer)] px-3 py-1.5">
            <span className="legend-dot" style={{ '--party-color': party.color }} />
            <span className="font-semibold text-white">{party.code}</span>
            <span>{party.total}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
