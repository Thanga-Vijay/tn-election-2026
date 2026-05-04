import { motion } from 'framer-motion';

export default function LeaderShowcase({ party, totalSeats, majority }) {
  if (!party) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-r from-sand to-ocean">
        <p className="text-xl font-semibold text-gray-600">தலைமை கட்சி விவரம் ஏற்றப்படுகிறது...</p>
      </div>
    );
  }

  const partyColor = party.color || '#999';
  const isLeading = party.total >= majority;

  return (
    <div 
      className="h-full flex items-center justify-between px-12 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${partyColor}15 0%, ${partyColor}05 100%)`
      }}
    >
      {/* Left: Party leader image */}
      <div className="flex items-center gap-8">
        {party.image && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={party.image}
              alt={party.leaderTamil}
              className="w-36 h-36 rounded-full object-cover border-4 shadow-2xl"
              style={{ borderColor: partyColor }}
            />
            {/* Party symbol badge */}
            {party.symbolImage && (
              <div 
                className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white shadow-lg p-2 border-2"
                style={{ borderColor: partyColor }}
              >
                <img src={party.symbolImage} alt={party.code} className="w-full h-full object-contain" />
              </div>
            )}
          </motion.div>
        )}

        <div>
          <div 
            className="text-sm font-bold uppercase tracking-wider mb-1"
            style={{ color: partyColor }}
          >
            {isLeading ? 'முன்னிலை கட்சி' : 'முக்கிய கட்சி'}
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-2">
            {party.tamil || party.code}
          </h1>
          <p className="text-xl font-semibold text-gray-700">
            தலைவர்: {party.leaderTamil || party.leaderEnglish}
          </p>
        </div>
      </div>

      {/* Right: Seat statistics */}
      <div className="flex items-center gap-8">
        {/* Total seats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div 
            className="text-7xl font-black mb-1"
            style={{ color: partyColor }}
          >
            {party.total || 0}
          </div>
          <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            மொத்த இடங்கள்
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-24 w-px bg-gray-300"></div>

        {/* Won & Leading breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{party.won || 0}</div>
              <div className="text-xs font-semibold text-gray-600">வெற்றி</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{party.leading || 0}</div>
              <div className="text-xs font-semibold text-gray-600">முன்னிலை</div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            வாக்கு பங்கு: <span style={{ color: partyColor }}>{party.votePct?.toFixed(1)}%</span>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-24 w-px bg-gray-300"></div>

        {/* Majority indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center px-6"
        >
          <div className="text-sm font-bold text-gray-500 uppercase mb-1">பெரும்பான்மை</div>
          <div className="text-4xl font-black text-gray-900">{majority}</div>
          {isLeading && (
            <div className="mt-2 text-sm font-bold text-green-600 animate-pulse">
              ✓ அடைந்தது
            </div>
          )}
          {!isLeading && party.total >= majority * 0.8 && (
            <div className="mt-2 text-sm font-bold text-orange-600">
              இன்னும் {majority - party.total}
            </div>
          )}
        </motion.div>
      </div>

      {/* Decorative party flag */}
      {party.symbolImage && (
        <div 
          className="absolute bottom-0 right-12 opacity-10 pointer-events-none"
          style={{ transform: 'translateY(20%)' }}
        >
          <img
            src={party.symbolImage}
            alt=""
            className="w-48 h-48 object-contain"
          />
        </div>
      )}
    </div>
  );
}
