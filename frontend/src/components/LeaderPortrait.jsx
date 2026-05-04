import { useState } from 'react';

export default function LeaderPortrait({ party, className = '' }) {
  const [broken, setBroken] = useState(false);
  const hasImage = party.leaderImage && !broken;
  const initials = party.code === 'OTH' ? 'OTH' : party.code.slice(0, 3);

  return hasImage ? (
    <img
      src={party.leaderImage}
      alt={party.leaderTamil}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`leader-image ${className}`}
    />
  ) : (
    <div className={`leader-fallback ${className}`} aria-label={party.leaderTamil}>
      <span>{initials}</span>
    </div>
  );
}
