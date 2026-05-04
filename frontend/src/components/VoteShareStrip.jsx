import { motion } from 'framer-motion';

import LeaderPortrait from './LeaderPortrait';
import PartySymbol from './PartySymbol';

export default function VoteShareStrip({ blocks }) {
  return (
    <section className="hero-bloc-strip">
      {blocks.map((block, index) => (
        <motion.article
          key={block.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          className="hero-bloc-card"
          style={{ '--party-color': block.color }}
        >
          <div className="hero-bloc-media">
            <LeaderPortrait
              party={{ leaderTamil: block.leaderTamil, leaderImage: block.leaderImage, code: block.key }}
              className="hero-bloc-portrait"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--color-ink-soft)]">{block.title}</p>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--color-muted)]">{block.leaderTamil}</p>
              </div>
              <PartySymbol party={block} className="hero-bloc-symbol" />
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-[var(--color-muted)]">மொத்த முன்னிலை</p>
                <p className="orbitron mt-1 text-5xl font-black text-[var(--color-ink)]">{block.seats}</p>
              </div>
              <div className="hero-bloc-stat-grid">
                <div>
                  <p>வெற்றி</p>
                  <span>{block.won}</span>
                </div>
                <div>
                  <p>முன்னிலை</p>
                  <span>{block.leading}</span>
                </div>
                <div>
                  <p>வாக்கு %</p>
                  <span>{block.votePct.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
