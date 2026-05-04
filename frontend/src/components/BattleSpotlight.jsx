import { motion } from 'framer-motion';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function ConstituencyTopCard({ seat, index }) {
  if (!seat) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-md mb-3">
        <p className="text-base font-bold text-gray-500">தரவு காத்திருக்கிறது...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all border-l-4 mb-3"
      style={{ borderColor: seat.leadingPartyColor || seat.color || '#999' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex flex-col items-center justify-center font-black shadow-md">
              <div className="text-xs leading-none">தொ.</div>
              <div className="text-base leading-none">{seat.number}</div>
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">{seat.name}</h3>
              <p className="text-xs font-semibold text-gray-500">
                {seat.candidateRoundStatus || seat.roundStatus || 'நேரலை'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-600 rounded-lg px-3 py-1 text-xs font-black text-white shadow-md">
          Top 4
        </div>
      </div>

      <div className="space-y-2">
        {(seat.topCandidates || seat.candidates || []).slice(0, 4).map((candidate, idx) => (
          <div 
            key={`${seat.number}-${candidate.name}-${idx}`} 
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-base shrink-0 shadow-md"
              style={{ backgroundColor: candidate.partyColor || candidate.color || '#999' }}
            >
              {idx + 1}
            </div>
            
            {candidate.symbolImage && (
              <div className="w-10 h-10 bg-gray-50 rounded-md p-1.5 border border-gray-200 shrink-0">
                <img 
                  src={candidate.symbolImage} 
                  alt={candidate.partyCode}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-gray-900 truncate">{candidate.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span 
                  className="text-xs font-black px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: candidate.partyColor || candidate.color }}
                >
                  {candidate.partyCode}
                </span>
                <span className="text-xs font-bold text-gray-600 truncate">
                  {candidate.partyTamil}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-base font-black text-gray-900 leading-none">
                {formatIndianNumber(candidate.votes)}
              </p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">வாக்கு</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function BattleSpotlight({ seats = [] }) {
  const safeSeats = seats.length ? seats : [null, null];

  return (
    <div>
      {safeSeats.map((seat, index) => (
        <ConstituencyTopCard 
          key={`${seat?.number || 'empty'}-${index}`} 
          seat={seat}
          index={index}
        />
      ))}
    </div>
  );
}
