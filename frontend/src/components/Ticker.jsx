export default function Ticker({ parties, total, majority }) {
  const tickerText = [
    ...parties.slice(0, 6).map((party) => `${party.tamil}: ${party.total}`),
    `பெரும்பான்மை: ${majority}`,
    `மொத்தம்: ${total}`,
    'தமிழ்நாடு தேர்தல் 2026 முடிவுகள் நேரலையில்'
  ].join(' · ');

  return (
    <div className="ticker-shell px-0">
      <div className="shrink-0 bg-[var(--color-gold)] px-4 py-3 text-sm font-black tracking-[0.2em] text-black">
        உடனடி
      </div>

      <div className="overflow-hidden py-3">
        <div className="ticker-track text-sm font-bold text-[var(--color-gold)] sm:text-base">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    </div>
  );
}
