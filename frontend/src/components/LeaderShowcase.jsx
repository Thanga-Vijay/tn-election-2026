import { motion } from 'framer-motion';

import LeaderPortrait from './LeaderPortrait';

export default function LeaderShowcase({ parties }) {
  return (
    <section className="broadcast-panel rounded-[2rem] p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[var(--color-gold)]">
            தலைவர்கள்
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">முன்னிலை தரும் முகங்கள்</h2>
        </div>
        <div className="rounded-full bg-[var(--color-gold-soft)] px-3 py-1.5 text-xs font-bold text-[var(--color-gold)]">
          ஒளிபரப்பு காட்சி
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {parties.map((party, index) => (
          <motion.article
            key={party.code}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            style={{ '--party-color': party.color }}
            className="leader-spotlight"
          >
            <div className="leader-spotlight-media">
              <LeaderPortrait party={party} />
              <div className="leader-spotlight-glow" />
            </div>

            <div className="relative z-10 mt-3">
              <p className="text-base font-black text-white">{party.leaderTamil}</p>
              <p className="mt-1 text-xs font-semibold tracking-[0.22em] text-[var(--color-faint)]">
                {party.tamil} · {party.code}
              </p>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--color-muted)]">இருக்கைகள்</p>
                <p className="orbitron mt-1 text-3xl font-black" style={{ color: 'var(--party-color)' }}>
                  {party.total}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--color-surface-soft)] px-3 py-2 text-right">
                <p className="text-[11px] font-semibold text-[var(--color-muted)]">முன்னிலை</p>
                <p className="text-lg font-black text-[var(--color-orange)]">{party.leading}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
