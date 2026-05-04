import { motion } from 'framer-motion';

export default function Header({ data, connected }) {
  return (
    <header className="header-surface">
      <div className="mx-auto flex max-w-[1840px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-w-0 flex-1"
        >
          <h1 className="truncate text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[3rem]">
            {data.headline?.title || 'தமிழ்நாடு சட்டமன்றத் தேர்தல் 2026'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="header-meta-panel"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-live-border)] bg-[var(--color-live-soft)] px-3 py-1.5 text-xs font-bold text-[var(--color-live-text)]">
            <span className="relative inline-flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-live)] opacity-80" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-live)]" />
            </span>
            நேரலை
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-white/65">புதுப்பிப்பு</p>
            <p className="mt-1 text-sm font-black text-white">{data.updatedAt}</p>
          </div>

          <div
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              connected
                ? 'bg-[var(--color-online-soft)] text-[var(--color-online-text)]'
                : 'bg-[var(--color-live-soft)] text-[var(--color-live-text)]'
            }`}
          >
            {connected ? 'இணைப்பு செயலில்' : 'மீண்டும் இணைப்பு'}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
