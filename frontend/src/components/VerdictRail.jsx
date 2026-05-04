import { AnimatePresence, motion } from 'framer-motion';

import PartySymbol from './PartySymbol';

function formatIndianNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function CandidateFocus({ title, candidate, partyTamil, partyCode, votes, imageUrl, symbolImage, color }) {
  const fallback = partyCode === 'CPI(M)' ? 'CPM' : partyCode;

  return (
    <div className="focus-candidate-card" style={{ '--party-color': color || '#999' }}>
      <div className="focus-candidate-media">
        {imageUrl ? (
          <img src={imageUrl} alt={candidate} className="focus-candidate-image" />
        ) : (
          <div className="focus-candidate-fallback">{fallback}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[var(--color-muted)]">{title}</p>
        <p className="mt-1 truncate text-lg font-black text-[var(--color-ink)]">{candidate}</p>
        <div className="mt-2 flex items-center gap-2">
          <PartySymbol party={{ code: partyCode, symbolImage, color, partyTamil }} className="focus-symbol" />
          <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
            {partyTamil} · {partyCode}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-[var(--color-muted)]">வாக்குகள்</p>
        <p className="mt-1 text-3xl font-black text-[var(--color-ink)]">{formatIndianNumber(votes)}</p>
      </div>
    </div>
  );
}

export default function VerdictRail({ seat, totalSeats, seatsCounted, majority }) {
  return (
    <section className="focus-rail">
      <div className="focus-summary-card">
        <p className="text-xs font-black tracking-[0.2em] text-[var(--color-muted)]">மொத்த நிலவரம்</p>
        <p className="orbitron mt-3 text-5xl font-black text-[var(--color-ink)]">{seatsCounted}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-ink-soft)]">எண்ணப்பட்டவை</p>
        <div className="mt-4 space-y-1 text-sm font-semibold text-[var(--color-muted)]">
          <p>மொத்தம்: {totalSeats}</p>
          <p>பெரும்பான்மை: {majority}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={seat?.number || 'empty-seat'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="focus-seat-panel"
        >
          {seat ? (
            <>
              <div className="focus-seat-header">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[var(--color-muted)]">
                    10 வினாடி தொகுதி கவனம்
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-[var(--color-ink)]">{seat.name}</h2>
                </div>
                <div className="rounded-full bg-[var(--color-sand)] px-4 py-2 text-sm font-bold text-[var(--color-ink-soft)]">
                  #{seat.number}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-4">
                <CandidateFocus
                  title="முன்னிலை"
                  candidate={seat.leadingCandidate}
                  partyTamil={seat.leadingPartyTamil}
                  partyCode={seat.leadingPartyCode}
                  votes={seat.leaderVotes}
                  imageUrl={seat.leadCandidateImage}
                  symbolImage={seat.leadingSymbolImage}
                  color={seat.topCandidates?.[0]?.color}
                />
                <CandidateFocus
                  title="பின்தொடர்வு"
                  candidate={seat.trailingCandidate}
                  partyTamil={seat.trailingPartyTamil}
                  partyCode={seat.trailingPartyCode}
                  votes={seat.runnerVotes}
                  imageUrl={seat.trailingCandidateImage}
                  symbolImage={seat.trailingSymbolImage}
                  color={seat.topCandidates?.[1]?.color}
                />
                <div className="focus-margin-card">
                  <p className="text-xs font-bold text-[var(--color-muted)]">வித்தியாசம்</p>
                  <p className="mt-2 text-4xl font-black text-[var(--color-ink)]">
                    {formatIndianNumber(seat.margin)}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[var(--color-ink-soft)]">
                    {seat.candidateRoundStatus || seat.roundStatus || 'நேரலை'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="focus-seat-header">
              <h2 className="text-2xl font-black text-[var(--color-ink)]">தொகுதி தரவு காத்திருக்கிறது</h2>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
