import { AnimatePresence, motion } from 'framer-motion';

function AnimatedNumber({ value }) {
  return (
    <div className="relative h-12 overflow-hidden sm:h-14">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35 }}
          className="orbitron absolute inset-0 text-3xl font-black text-[var(--color-gold)] sm:text-4xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function SummaryBar({ data }) {
  const cards = [
    { label: 'மொத்த தொகுதிகள்', value: 234 },
    { label: 'எண்ணப்பட்டவை', value: data.seatsCounted },
    { label: 'பெரும்பான்மை வரம்பு', value: 118 },
    { label: 'எண்ண வேண்டியவை', value: data.seatsRemaining }
  ];

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.article
          key={card.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="summary-card broadcast-panel rounded-2xl px-4 py-4 sm:px-5"
        >
          <AnimatedNumber value={card.value} />
          <p className="mt-3 text-sm font-semibold text-[var(--color-muted)]">{card.label}</p>
        </motion.article>
      ))}
    </section>
  );
}
