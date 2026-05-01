import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, X, Hand, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const BASE = 'https://www.lifeprint.com/asl101/fingerspelling/images/';

// Wristband colors matching the reference image style
const WRIST_COLORS = [
  { wrist: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.35)',  glow: 'rgba(244,63,94,0.25)',  text: '#fb7185' },
  { wrist: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', glow: 'rgba(249,115,22,0.25)', text: '#fb923c' },
  { wrist: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  glow: 'rgba(234,179,8,0.25)',  text: '#facc15' },
  { wrist: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  glow: 'rgba(34,197,94,0.25)',  text: '#4ade80' },
  { wrist: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)',  glow: 'rgba(6,182,212,0.25)',  text: '#22d3ee' },
  { wrist: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', glow: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
];

const LETTERS = [
  { letter: 'A', tip: 'Closed fist, thumb rests beside index finger', img: `${BASE}a.gif` },
  { letter: 'B', tip: 'Four fingers straight up, thumb bent across palm', img: `${BASE}b.gif` },
  { letter: 'C', tip: 'Hand curves like the letter C', img: `${BASE}c.gif` },
  { letter: 'D', tip: 'Index finger up, others curl to meet thumb', img: `${BASE}d.gif` },
  { letter: 'E', tip: 'All fingers bent forward, thumb tucked under', img: `${BASE}e.gif` },
  { letter: 'F', tip: 'Index & thumb touch, three fingers up', img: `${BASE}f.gif` },
  { letter: 'G', tip: 'Index & thumb point sideways like a gun', img: `${BASE}g.gif` },
  { letter: 'H', tip: 'Index & middle extend horizontally', img: `${BASE}h.gif` },
  { letter: 'I', tip: 'Only the pinky finger points up', img: `${BASE}i.gif` },
  { letter: 'J', tip: 'Pinky up — trace a J motion downward', img: `${BASE}j.gif`, motion: true },
  { letter: 'K', tip: 'Index up, middle angled, thumb between them', img: `${BASE}k.gif` },
  { letter: 'L', tip: 'L-shape: index up, thumb points out to side', img: `${BASE}l.gif` },
  { letter: 'M', tip: 'Three fingers fold down over the thumb', img: `${BASE}m.gif` },
  { letter: 'N', tip: 'Two fingers fold down over the thumb', img: `${BASE}n.gif` },
  { letter: 'O', tip: 'All fingers and thumb curve to form an O', img: `${BASE}o.gif` },
  { letter: 'P', tip: 'K handshape pointed downward', img: `${BASE}p.gif` },
  { letter: 'Q', tip: 'G handshape pointed downward', img: `${BASE}q.gif` },
  { letter: 'R', tip: 'Index & middle fingers crossed over each other', img: `${BASE}r.gif` },
  { letter: 'S', tip: 'Tight fist, thumb wraps over the fingers', img: `${BASE}s.gif` },
  { letter: 'T', tip: 'Thumb tucked between index and middle finger', img: `${BASE}t.gif` },
  { letter: 'U', tip: 'Index & middle fingers together pointing up', img: `${BASE}u.gif` },
  { letter: 'V', tip: 'Peace sign: index & middle spread apart', img: `${BASE}v.gif` },
  { letter: 'W', tip: 'Three fingers spread wide (W shape)', img: `${BASE}w.gif` },
  { letter: 'X', tip: 'Index finger hooked / bent like a hook', img: `${BASE}x.gif` },
  { letter: 'Y', tip: 'Thumb & pinky out (hang loose / shaka)', img: `${BASE}y.gif` },
  { letter: 'Z', tip: 'Index finger traces a Z shape in the air', img: `${BASE}z.gif`, motion: true },
];

function HandCard({ sign, accent, isSelected, onClick, index }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  return (
    <motion.button
      variants={{ hidden: { opacity: 0, y: 24, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, delay: index * 0.025 } } }}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${accent.bg}, ${accent.bg})`
          : `linear-gradient(135deg, ${accent.bg}, rgba(2,6,23,0.6))`,
        border: `1.5px solid ${isSelected ? accent.border : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isSelected ? `0 0 24px ${accent.glow}, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 16px rgba(0,0,0,0.3)',
      }}
      className="relative rounded-2xl p-3 pb-4 text-left cursor-pointer transition-all duration-300 flex flex-col items-center"
    >
      {/* Motion badge */}
      {sign.motion && (
        <span className="absolute top-2 left-2 z-10 text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide flex items-center gap-0.5"
          style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}>
          <Play size={7} /> MOTION
        </span>
      )}

      {/* Selected ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${accent.border}` }} />
      )}

      {/* Hand image area with white bg like reference */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.92)' }}>
        {!loaded && !err && (
          <div className="absolute inset-0 animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }} />
        )}
        {!err ? (
          <img
            src={sign.img}
            alt={`ASL ${sign.letter}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErr(true)}
            className={`object-contain p-1.5 transition-opacity duration-500 w-full h-full ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ imageRendering: 'auto' }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 p-2" style={{ color: accent.text }}>
            <Hand size={28} />
            <span className="text-xs font-bold">{sign.letter}</span>
          </div>
        )}

        {/* Colorful wristband strip at bottom — like reference image */}
        <div className="absolute bottom-0 left-0 right-0 h-2.5 rounded-b-xl"
          style={{ background: accent.wrist, opacity: 0.85 }} />
      </div>

      {/* Letter label */}
      <div className="text-3xl font-black mt-2 leading-none" style={{ color: accent.text }}>
        {sign.letter}
      </div>

      {/* Tip */}
      <div className="text-[9px] text-slate-500 text-center mt-1 leading-tight line-clamp-2 px-1">
        {sign.tip.split(',')[0]}
      </div>
    </motion.button>
  );
}

function HeroDisplay({ sign, accent, onPrev, onNext, total, currentIdx }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => { setLoaded(false); setErr(false); }, [sign.letter]);

  return (
    <motion.div
      key={sign.letter}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mt-10 rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent.bg}, rgba(2,6,23,0.8))`,
        border: `1.5px solid ${accent.border}`,
        boxShadow: `0 0 60px ${accent.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
      }}
    >
      <div className="flex flex-col md:flex-row items-stretch">

        {/* Left: animated hand image — video-like display */}
        <div className="relative md:w-72 flex-shrink-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(255,255,255,0.95)', minHeight: 260 }}>

          {/* Wristband */}
          <div className="absolute bottom-0 left-0 right-0 h-4 rounded-none"
            style={{ background: accent.wrist }} />

          {/* Scan-line animation overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-0.5 opacity-20"
              style={{ background: `linear-gradient(90deg, transparent, ${accent.wrist}, transparent)` }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {!loaded && !err && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-t-transparent"
                style={{ borderColor: `${accent.wrist} transparent transparent transparent` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}

          {!err ? (
            <img
              src={sign.img}
              alt={`ASL ${sign.letter}`}
              onLoad={() => setLoaded(true)}
              onError={() => setErr(true)}
              className={`relative z-10 object-contain max-h-52 max-w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 z-10" style={{ color: accent.wrist }}>
              <Hand size={60} />
              <span className="text-2xl font-black">{sign.letter}</span>
            </div>
          )}

          {/* Corner label */}
          <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: accent.wrist, color: '#fff' }}>
            {sign.motion ? '▶ ANIMATED' : '◉ LIVE'}
          </div>
        </div>

        {/* Right: info */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: accent.text }}>
                ASL Fingerspelling — Letter
              </span>
              {sign.motion && (
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Play size={10} /> Motion Sign
                </span>
              )}
            </div>

            {/* Giant letter */}
            <div className="text-[8rem] font-black leading-none mb-4 select-none"
              style={{ color: accent.text, textShadow: `0 0 80px ${accent.glow}` }}>
              {sign.letter}
            </div>

            <p className="text-xl font-semibold text-white mb-3">{sign.tip}</p>

            {sign.motion && (
              <p className="text-sm mb-3" style={{ color: accent.text }}>
                ✦ This sign requires a fluid hand motion. Watch the animation carefully.
              </p>
            )}

            <p className="text-slate-400 text-sm leading-relaxed">
              Hold this handshape clearly in front of your camera on the{' '}
              <Link to="/interpreter" className="underline underline-offset-2" style={{ color: accent.text }}>
                Interpreter page
              </Link>{' '}
              for ~1 second to have it recognised by the AI engine.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4"
            style={{ borderTop: `1px solid ${accent.border}` }}>
            <button onClick={onPrev}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.border}` }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-slate-500 text-sm font-mono">
              {currentIdx + 1} / {total}
            </span>
            <button onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.border}` }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ASLAlphabetPage() {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);

  const filtered = LETTERS.filter(l =>
    l.letter.toLowerCase().includes(query.toLowerCase()) ||
    l.tip.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (sign) => {
    const idx = LETTERS.indexOf(sign);
    setSelectedIdx(selectedIdx === idx ? null : idx);
  };

  const goPrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + LETTERS.length) % LETTERS.length);
  };
  const goNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % LETTERS.length);
  };

  const selected = selectedIdx !== null ? LETTERS[selectedIdx] : null;
  const selectedAccent = selected ? WRIST_COLORS[selectedIdx % WRIST_COLORS.length] : null;

  return (
    <div className="pt-28 pb-20 min-h-screen">
      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-6">

        {/* Back link */}
        <Link to="/learn" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-10 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Learn ASL
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-4"
            style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.25)' }}>
            🤚 HAND SIGN GRAPHICS · A – Z
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            ASL{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">
              Alphabet
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Animated hand sign graphics for all 26 letters. Click any card to see a large animated view with navigation.
          </p>

          {/* Search */}
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="asl-search"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search letter or description…"
                className="w-full pl-10 pr-10 py-3 rounded-full text-white placeholder-slate-500 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hero animated display */}
        <AnimatePresence mode="wait">
          {selected && selectedAccent && (
            <HeroDisplay
              sign={selected}
              accent={selectedAccent}
              onPrev={goPrev}
              onNext={goNext}
              total={LETTERS.length}
              currentIdx={selectedIdx}
            />
          )}
        </AnimatePresence>

        {/* Card grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mt-10"
        >
          {filtered.map((sign, i) => {
            const realIdx = LETTERS.indexOf(sign);
            const accent = WRIST_COLORS[realIdx % WRIST_COLORS.length];
            return (
              <HandCard
                key={sign.letter}
                sign={sign}
                accent={accent}
                index={i}
                isSelected={selectedIdx === realIdx}
                onClick={() => handleSelect(sign)}
              />
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <Hand size={40} className="mx-auto mb-4 opacity-30" />
            <p>No signs match your search.</p>
          </div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            { emoji: '💡', title: 'Good Lighting', desc: 'Ensure your hand is well-lit so MediaPipe detects all 21 landmarks cleanly.', color: '#facc15' },
            { emoji: '📏', title: 'Camera Distance', desc: 'Keep your hand 30–60 cm from the camera for best skeleton tracking accuracy.', color: '#22d3ee' },
            { emoji: '⏱️', title: 'Hold Steady', desc: 'Hold each sign for ~1 second — the progress ring fills before auto-capture.', color: '#a78bfa' },
          ].map(tip => (
            <div key={tip.title}
              className="rounded-2xl p-5 flex gap-4 transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-2xl">{tip.emoji}</span>
              <div>
                <h3 className="font-bold text-white mb-1 text-sm">{tip.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs text-slate-700">
          Hand graphics via{' '}
          <a href="https://www.lifeprint.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 underline">
            lifeprint.com
          </a>{' '}
          (ASL University · Dr. Bill Vicars) — for educational use.
        </p>
      </div>
    </div>
  );
}
