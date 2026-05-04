import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-center text-white">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="loading-ring"
      />

      <div>
        <h1 className="text-2xl font-black text-[var(--color-gold)] sm:text-3xl">
          முடிவுகள் ஏற்றப்படுகின்றன...
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)] sm:text-base">
          ECI இல் இருந்து நேரடியாக பெறப்படுகிறது
        </p>
      </div>
    </div>
  );
}
