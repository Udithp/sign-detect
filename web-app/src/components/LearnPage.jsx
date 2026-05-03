import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Hand, Loader2, Camera, Check, ChevronLeft, ChevronRight, Lightbulb, Ruler, Timer, Zap, Volume2 } from 'lucide-react';

const WRIST = [
  { wrist:'#f43f5e', bg:'rgba(244,63,94,0.13)',  border:'rgba(244,63,94,0.4)',  glow:'rgba(244,63,94,0.3)',  text:'#fb7185' },
  { wrist:'#f97316', bg:'rgba(249,115,22,0.13)', border:'rgba(249,115,22,0.4)', glow:'rgba(249,115,22,0.3)', text:'#fb923c' },
  { wrist:'#eab308', bg:'rgba(234,179,8,0.13)',  border:'rgba(234,179,8,0.4)',  glow:'rgba(234,179,8,0.3)',  text:'#facc15' },
  { wrist:'#22c55e', bg:'rgba(34,197,94,0.13)',  border:'rgba(34,197,94,0.4)',  glow:'rgba(34,197,94,0.3)',  text:'#4ade80' },
  { wrist:'#06b6d4', bg:'rgba(6,182,212,0.13)',  border:'rgba(6,182,212,0.4)',  glow:'rgba(6,182,212,0.3)',  text:'#22d3ee' },
  { wrist:'#8b5cf6', bg:'rgba(139,92,246,0.13)', border:'rgba(139,92,246,0.4)', glow:'rgba(139,92,246,0.3)', text:'#a78bfa' },
];

const LETTERS = [
  { letter:'A', tip:'Closed fist, thumb rests beside index finger' },
  { letter:'B', tip:'Four fingers straight up, thumb bent across palm' },
  { letter:'C', tip:'Hand curves like the letter C' },
  { letter:'D', tip:'Index finger up, others curl to meet thumb' },
  { letter:'E', tip:'All fingers bent forward, thumb tucked under' },
  { letter:'F', tip:'Index & thumb touch, three fingers up' },
  { letter:'G', tip:'Index & thumb point sideways' },
  { letter:'H', tip:'Index & middle extend horizontally' },
  { letter:'I', tip:'Only the pinky finger points up' },
  { letter:'J', tip:'Pinky up — trace a J motion downward', motion:true },
  { letter:'K', tip:'Index up, middle angled, thumb between them' },
  { letter:'L', tip:'L-shape: index up, thumb out to side' },
  { letter:'M', tip:'Three fingers fold down over the thumb' },
  { letter:'N', tip:'Two fingers fold down over the thumb' },
  { letter:'O', tip:'All fingers and thumb curve to form an O' },
  { letter:'P', tip:'K handshape pointed downward' },
  { letter:'Q', tip:'G handshape pointed downward' },
  { letter:'R', tip:'Index & middle fingers crossed' },
  { letter:'S', tip:'Tight fist, thumb wraps over fingers' },
  { letter:'T', tip:'Thumb tucked between index and middle' },
  { letter:'U', tip:'Index & middle together pointing up' },
  { letter:'V', tip:'Peace sign: index & middle spread apart' },
  { letter:'W', tip:'Three fingers spread wide' },
  { letter:'X', tip:'Index finger hooked like a hook' },
  { letter:'Y', tip:'Thumb & pinky out (hang loose)' },
  { letter:'Z', tip:'Index finger traces a Z in the air', motion:true },
  { letter:'Backspace', tip:'Point your hand to the left with palm open to delete the last character', special: true, img: '/backspace-gesture.png' },
  { letter:'next', tip:'Confirm the character/word by tucking your thumb into a fist', special: true, img: '/next-gesture.png' },
  { letter:'Speak', tip:'Give a clear thumbs-up gesture to hear the translation aloud', special: true, img: '/speak-gesture.png' },
];

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error(`Failed: ${src}`));
    document.head.appendChild(s);
  });
}

// ── Live practice camera ──────────────────────────────────────────────────────
function PracticeCamera({ targetLetter, accent }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detected, setDetected] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const isPred = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let camera = null, hands = null;
    const vid = videoRef.current, cvs = canvasRef.current;
    if (!vid || !cvs) return;
    const ctx = cvs.getContext('2d');

    const predict = async (landmarks) => {
      if (isPred.current) return;
      isPred.current = true;
      try {
        const pts = Array.from(landmarks).map(l => ({ x:l.x, y:l.y, z:l.z??0 }));
        const r = await fetch('/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ landmarks:pts }) });
        const d = await r.json();
        if (mountedRef.current && d.prediction) { setDetected(d.prediction); setIsMatch(d.prediction === targetLetter); }
      } catch(_){} finally { isPred.current = false; }
    };

    const onResults = (results) => {
      if (!mountedRef.current) return;
      ctx.save(); ctx.clearRect(0,0,cvs.width,cvs.height);
      ctx.clearRect(0,0,cvs.width,cvs.height);
      if (results.multiHandLandmarks?.length) {
        const lm = results.multiHandLandmarks[0];
        predict(lm);
        const pairs=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
        const color = isMatch ? '#4ade80' : accent.wrist;
        ctx.shadowColor=color; ctx.shadowBlur=14; ctx.strokeStyle=color+'80'; ctx.lineWidth=7;
        ctx.beginPath(); pairs.forEach(([s,e])=>{ ctx.moveTo(lm[s].x*cvs.width,lm[s].y*cvs.height); ctx.lineTo(lm[e].x*cvs.width,lm[e].y*cvs.height); }); ctx.stroke();
        ctx.shadowBlur=0; ctx.strokeStyle=color; ctx.lineWidth=2;
        ctx.beginPath(); pairs.forEach(([s,e])=>{ ctx.moveTo(lm[s].x*cvs.width,lm[s].y*cvs.height); ctx.lineTo(lm[e].x*cvs.width,lm[e].y*cvs.height); }); ctx.stroke();
        ctx.fillStyle='#cffafe'; lm.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x*cvs.width,p.y*cvs.height,3,0,2*Math.PI); ctx.fill(); });
      } else { if(mountedRef.current){ setDetected(''); setIsMatch(false); } }
      ctx.restore();
      if(!camReady) setCamReady(true);
    };

    const init = async () => {
      try {
        await loadScript('/mediapipe-hands/hands.js');
        await loadScript('/mediapipe-hands/hands_solution_packed_assets_loader.js');
        await loadScript('/mediapipe-camera/camera_utils.js');
        if(!mountedRef.current) return;
        hands = new window.Hands({ locateFile: f=>`/mediapipe-hands/${f}` });
        hands.setOptions({ maxNumHands:1, modelComplexity:0, minDetectionConfidence:0.6, minTrackingConfidence:0.6 });
        hands.onResults(onResults);
        camera = new window.Camera(vid, { onFrame: async()=>{ if(hands) await hands.send({image:vid}); }, width:320, height:240 });
        camera.start();
      } catch(e){ console.error(e); if(mountedRef.current) setCamError(true); }
    };
    init();
    return () => { mountedRef.current=false; if(camera) camera.stop(); if(hands) hands.close(); };
  }, [targetLetter]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Camera size={13} style={{ color:accent.text }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color:accent.text }}>Try It Live</span>
      </div>
      <div className="relative rounded-2xl overflow-hidden flex-1" style={{ border:`1.5px solid ${accent.border}`, minHeight:200, background:'#000' }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" playsInline autoPlay muted style={{ transform:'scaleX(-1)' }} />
        <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 w-full h-full object-cover" style={{ transform:'scaleX(-1)' }} />
        {!camReady && !camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background:'rgba(2,6,23,0.88)' }}>
            <Loader2 size={28} className="animate-spin" style={{ color:accent.text }} />
            <p className="text-xs font-bold tracking-widest" style={{ color:accent.text }}>LOADING CAMERA...</p>
          </div>
        )}
        {camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4" style={{ background:'rgba(2,6,23,0.9)' }}>
            <span className="text-2xl">⚠️</span>
            <p className="text-xs text-slate-400">Camera unavailable. Allow permission & refresh.</p>
          </div>
        )}
        <div className={`absolute bottom-3 left-0 right-0 mx-auto w-fit px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
          isMatch ? 'bg-green-500/90 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]'
          : detected ? 'bg-black/70 text-slate-300' : 'bg-black/50 text-slate-500'
        }`}>
          {isMatch && <Check size={12}/>}
          {detected ? (isMatch ? `✓ Perfect! "${detected}"` : `Detected: ${detected} — keep trying`) : 'Show your hand…'}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-600 text-center">
        Hold the <strong className="text-slate-400">{targetLetter}</strong> sign in front of the camera
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const selected = selectedIdx !== null ? LETTERS[selectedIdx] : null;
  const acc = selected ? WRIST[selectedIdx % WRIST.length] : null;

  const goPrev = () => setSelectedIdx(i => (i-1+LETTERS.length) % LETTERS.length);
  const goNext = () => setSelectedIdx(i => (i+1) % LETTERS.length);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(ellipse,rgba(6,182,212,0.07) 0%,transparent 70%)', filter:'blur(60px)' }} />

      <div className="page-section">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-4"
            style={{ background:'rgba(6,182,212,0.1)', color:'#22d3ee', border:'1px solid rgba(6,182,212,0.2)' }}>
            🤚 ASL REFERENCE
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            Learn the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">Alphabet</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Study the chart below, then <strong className="text-white">click any letter</strong> to practice with live AI detection.
          </p>
        </motion.div>

        {/* ── ASL CHART IMAGE ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl"
          style={{ border:'1.5px solid rgba(6,182,212,0.25)', boxShadow:'0 0 80px rgba(6,182,212,0.1), 0 30px 80px rgba(0,0,0,0.5)' }}>
          {/* Glow overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 rounded-3xl"
            style={{ background:'linear-gradient(135deg,rgba(6,182,212,0.04),transparent 50%,rgba(139,92,246,0.04))' }} />
          <div className="bg-white rounded-3xl p-4 md:p-8">
            <img
              src="/asl-chart.png"
              alt="ASL Alphabet A to Z hand signs chart"
              className="w-full h-auto object-contain rounded-2xl"
              style={{ maxHeight:520 }}
            />
          </div>
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold"
            style={{ background:'rgba(6,182,212,0.15)', color:'#22d3ee', border:'1px solid rgba(6,182,212,0.3)', backdropFilter:'blur(8px)' }}>
            ASL Fingerspelling A – Z
          </div>
        </motion.div>

        {/* ── FUNCTIONAL GESTURES CHART ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Zap size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Functional Gestures</h2>
              <p className="text-xs text-slate-500">Essential controls for the interpreter system</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name:'Backspace', img:'/backspace-gesture.png', desc:'Wave palm left to delete last char' },
              { name:'Next / Confirm', img:'/next-gesture.png', desc:'Open hand to confirm and add space' },
              { name:'Speak Gesture', img:'/speak-gesture.png', desc:'Thumbs up to hear sentence' },
            ].map((f, i) => (
              <div key={f.name} className="glass-panel rounded-3xl p-5 flex flex-col items-center gap-5 border border-white/[0.04] hover:border-cyan-500/30 transition-all group">
                <div className="w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden flex items-center justify-center p-6 relative">
                  {f.img ? (
                    <img src={f.img} alt={f.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <f.icon size={56} className="text-cyan-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon View</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-slate-950 text-[8px] font-bold text-slate-400 border border-white/10 uppercase tracking-tighter">
                    {f.img ? 'Illustration' : 'System Action'}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">{f.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── PRACTICE SECTION HEADER ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Practice Each Sign</h2>
          <p className="text-slate-400 text-sm">Click a letter — the AI camera will detect if you're signing it correctly in real time.</p>
        </motion.div>

        {/* ── LETTER BUTTONS GRID ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2 mb-8">
          {LETTERS.map((sign, i) => {
            const a = WRIST[i % WRIST.length];
            const isSel = selectedIdx === i;
            return (
              <motion.button key={sign.letter} whileHover={{ scale:1.1, y:-3 }} whileTap={{ scale:0.93 }}
                onClick={() => setSelectedIdx(isSel ? null : i)}
                className="relative flex items-center justify-center rounded-xl font-black text-xl transition-all duration-200"
                style={{
                  height: 52, aspectRatio:'1',
                  background: isSel ? a.bg : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSel ? a.border : 'rgba(255,255,255,0.08)'}`,
                  color: isSel ? a.text : '#94a3b8',
                  boxShadow: isSel ? `0 0 20px ${a.glow}` : 'none',
                }}>
                {sign.special ? (
                  <span className="text-[9px] font-bold leading-tight uppercase text-center px-1">
                    {sign.letter === 'next' ? 'NEXT' : sign.letter}
                  </span>
                ) : (
                  sign.letter
                )}
                {sign.motion && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold"
                    style={{ background:'#6366f1', color:'#fff' }}>▶</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── HERO PRACTICE PANEL ── */}
        <AnimatePresence mode="wait">
          {selected && acc && (
            <motion.div key={selected.letter}
              initial={{ opacity:0, y:18, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-12, scale:0.97 }}
              transition={{ duration:0.32 }}
              className="rounded-3xl overflow-hidden mb-10 relative"
              style={{
                background:`linear-gradient(135deg, ${acc.bg}, rgba(2,6,23,0.9))`,
                border:`1.5px solid ${acc.border}`,
                boxShadow:`0 0 70px ${acc.glow}, 0 24px 60px rgba(0,0,0,0.5)`,
              }}>

              {/* Close */}
              <button onClick={() => setSelectedIdx(null)}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition">
                <X size={18}/>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                {/* Left — info */}
                <div className="p-8 flex flex-col justify-between" style={{ borderRight:`1px solid ${acc.border}` }}>
                  <div>
                    <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color:acc.text }}>How to sign</span>
                    <div className="text-[7rem] font-black leading-none my-2 select-none flex items-center justify-center"
                      style={{ color:acc.text, textShadow:`0 0 60px ${acc.glow}`, minHeight: '140px' }}>
                      {selected.img ? (
                        <div className="bg-white p-4 rounded-2xl border-4 border-current shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                          <img src={selected.img} alt={selected.letter} className="h-40 w-auto object-contain" />
                        </div>
                      ) : (
                        selected.letter === 'Backspace' ? '⌫' : selected.letter === 'next' ? '⏩' : selected.letter === 'Speak' ? '🔊' : selected.letter
                      )}
                    </div>
                    <p className="text-lg font-semibold text-white mb-3">{selected.tip}</p>
                    {selected.motion && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                        style={{ background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' }}>
                        ✦ Motion sign — requires hand movement
                      </span>
                    )}
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Refer to the chart above for the hand shape, then try it live in the camera panel →
                    </p>
                  </div>
                  {/* Nav */}
                  <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop:`1px solid ${acc.border}` }}>
                    <button onClick={goPrev} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition hover:scale-105"
                      style={{ background:acc.bg, color:acc.text, border:`1px solid ${acc.border}` }}>
                      <ChevronLeft size={14}/> Prev
                    </button>
                    <span className="text-slate-500 text-xs font-mono">{selectedIdx+1} / {LETTERS.length}</span>
                    <button onClick={goNext} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition hover:scale-105"
                      style={{ background:acc.bg, color:acc.text, border:`1px solid ${acc.border}` }}>
                      Next <ChevronRight size={14}/>
                    </button>
                  </div>
                </div>

                {/* Right — live camera */}
                <div className="p-7">
                  <PracticeCamera key={selected.letter} targetLetter={selected.letter} accent={acc} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {[
            { Icon:Lightbulb, title:'Good Lighting', desc:'Ensure your hand is well-lit for MediaPipe to detect all 21 landmarks cleanly.', color:'#facc15' },
            { Icon:Ruler,     title:'Distance Matters', desc:'Keep your hand 30–60 cm from the camera for the best tracking accuracy.', color:'#22d3ee' },
            { Icon:Timer,     title:'Hold Steady', desc:'Hold each sign firmly — the AI detects in real time when your gesture stabilises.', color:'#a78bfa' },
          ].map(({ Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl p-5 flex gap-4 hover:scale-[1.02] transition-all"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="p-2 rounded-xl flex-shrink-0 self-start" style={{ background:`${color}18` }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 text-sm">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
