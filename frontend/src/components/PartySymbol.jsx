import { useState } from 'react';

export default function PartySymbol({ party, className = '' }) {
  const [broken, setBroken] = useState(false);
  const hasImage = party.symbolImage && !broken;

  return hasImage ? (
    <img
      src={party.symbolImage}
      alt={party.partyTamil || party.tamil || party.code}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`party-symbol ${className}`}
    />
  ) : (
    <div className={`party-symbol-fallback ${className}`} style={{ '--party-color': party.color }}>
      <span>{party.code === 'CPI(M)' ? 'CPM' : party.code}</span>
    </div>
  );
}
