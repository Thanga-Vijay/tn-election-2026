import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-[1920px] mx-auto flex-col items-center justify-center gap-6 bg-beach px-6 text-center">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="w-20 h-20 border-4 border-accent border-t-coral rounded-full animate-spin" />
      </motion.div>

      <div>
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
          முடிவுகள் ஏற்றப்படுகின்றன...
        </h1>
        <p className="mt-3 text-lg text-gray-600 sm:text-xl font-medium">
          ECI இல் இருந்து நேரடியாக பெறப்படுகிறது
        </p>
      </div>
    </div>
  );
}
