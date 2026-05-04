import { AnimatePresence, motion } from 'framer-motion';

export default function HeadlineBoard({ slide }) {
  return (
    <section className="story-panel">
      <div className="panel-title-bar panel-title-bar-center">
        <h2>தமிழ்நாடு தேர்தல் 2026</h2>
        <span>5 வினாடி புதுப்பிப்பு</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide?.key || 'empty'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.35 }}
          className="story-frame"
        >
          <p className="story-kicker">{slide?.kicker || 'அதிகாரப்பூர்வ ECI தரவு'}</p>
          <h3 className="story-title">{slide?.title || 'தகவல் ஏற்றப்படுகிறது'}</h3>
          <p className="story-body">{slide?.body || 'சமீபத்திய நிலவரம் விரைவில் இங்கு வரும்.'}</p>

          <div className="story-footer">
            <span>{slide?.metaLeft || 'நேரலை தரவு'}</span>
            <span>{slide?.metaRight || 'ECI'}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
