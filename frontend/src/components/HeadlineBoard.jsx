import { AnimatePresence, motion } from 'framer-motion';

export default function HeadlineBoard({ slide }) {
  return (
    <section className="flex items-center justify-center h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide?.key || 'empty'}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-4xl px-12 w-full"
        >
          <div className="bg-white rounded-3xl p-10 shadow-2xl border-4 border-red-600 relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-red-600 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-red-600 to-transparent opacity-20"></div>
            
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full mb-6 shadow-lg">
              <p className="text-sm font-black text-white uppercase tracking-widest">
                {slide?.kicker || 'அதிகாரப்பூர்வ ECI தரவு'}
              </p>
            </div>
            
            <h3 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
              {slide?.title || 'தமிழ்நாடு தேர்தல் முடிவுகள் 2026'}
            </h3>
            
            <p className="text-2xl text-gray-700 font-bold leading-relaxed mb-6">
              {slide?.body || 'நேரடி எண்ணிக்கை தொடர்கிறது'}
            </p>

            <div className="pt-6 border-t-4 border-red-200">
              <p className="text-base font-black text-gray-700 uppercase tracking-wide">
                {slide?.meta || 'நேரலை தரவு · ECI'}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
