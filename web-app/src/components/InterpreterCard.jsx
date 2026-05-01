import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Activity, Zap, Loader2, MessageCircle, Shield, Check, Volume2, Languages, Globe } from 'lucide-react';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

const STABLE_HOLD_MS = 600;
const REPEAT_COOLDOWN_MS = 2000;

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', speechLang: 'en-US' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳', speechLang: 'kn-IN' },
];

const InterpreterCard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [outputSentence, setOutputSentence] = useState('');
  const [stagedLetter, setStagedLetter] = useState('');
  const [currentPrediction, setCurrentPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const isPredicting = useRef(false);
  const stableStartTime = useRef(null);
  const lastStablePred = useRef('');
  const lastAutoAddTime = useRef(0);
  const lastProcessedHoldTime = useRef(0);
  const currentPredRef = useRef('');
  const audioRef = useRef(null);   // persistent audio element — bypasses autoplay policy
  currentPredRef.current = currentPrediction;

  useEffect(() => {
    if (!currentPrediction) return;
    
    if (currentPrediction !== lastStablePred.current) {
      lastStablePred.current = currentPrediction;
      stableStartTime.current = Date.now();
      return;
    }
    const heldMs = Date.now() - (stableStartTime.current ?? Date.now());
    if (heldMs < STABLE_HOLD_MS) return;

    if (stableStartTime.current === lastProcessedHoldTime.current) return;
    lastProcessedHoldTime.current = stableStartTime.current;

    const timeSinceLastAdd = Date.now() - lastAutoAddTime.current;

    if (currentPrediction === 'Speak') {
      if (timeSinceLastAdd < REPEAT_COOLDOWN_MS) return;
      if (outputSentence.trim()) {
        translateAndSpeak(outputSentence);
      }
      setOutputSentence('');
      setStagedLetter('');
      lastAutoAddTime.current = Date.now();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    } else if (currentPrediction === 'Backspace') {
      if (timeSinceLastAdd < REPEAT_COOLDOWN_MS) return;
      if (stagedLetter) {
        setStagedLetter('');
      } else {
        setOutputSentence(prev => prev.slice(0, -1));
      }
      lastAutoAddTime.current = Date.now();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    } else if (currentPrediction === 'next') {
      if (timeSinceLastAdd < REPEAT_COOLDOWN_MS) return;
      if (stagedLetter) {
        setOutputSentence(prev => prev + stagedLetter);
        setStagedLetter(''); // clear staged letter after committing
      }
      lastAutoAddTime.current = Date.now();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    } else if (currentPrediction === ' ') {
      if (timeSinceLastAdd < REPEAT_COOLDOWN_MS) return;
      if (stagedLetter) {
        setOutputSentence(prev => prev + stagedLetter + ' ');
        setStagedLetter('');
      } else {
        setOutputSentence(prev => prev + ' ');
      }
      lastAutoAddTime.current = Date.now();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    } else {
      // Normal letter detected. We push the old staged letter (if any) and stage the new one.
      if (stagedLetter) {
        setOutputSentence(prev => prev + stagedLetter);
      }
      setStagedLetter(currentPrediction);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 300);
    }
  }, [currentPrediction, outputSentence, stagedLetter, holdProgress]);

  // Fetch autocomplete suggestions whenever the current word changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      const words = outputSentence.split(' ');
      const currentWord = (words[words.length - 1] + stagedLetter).trim();
      
      if (!currentWord || currentWord.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`/autocomplete?prefix=${currentWord}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    };
    
    // Debounce to avoid spamming the backend
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [outputSentence, stagedLetter]);

  const handleSuggestionClick = (word) => {
    const words = outputSentence.split(' ');
    words.pop(); // remove the partial word being typed
    const newSentence = (words.length > 0 ? words.join(' ') + ' ' : '') + word + ' ';
    setOutputSentence(newSentence);
    setStagedLetter('');
    setSuggestions([]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!stableStartTime.current || !currentPredRef.current) { setHoldProgress(0); return; }
      const progress = Math.min(100, ((Date.now() - stableStartTime.current) / STABLE_HOLD_MS) * 100);
      setHoldProgress(progress);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;
    const canvasCtx = canvasElement.getContext('2d');
    let camera = null;
    let hands = null;
    let isMounted = true;

    const sendToPredict = async (landmarks) => {
      if (isPredicting.current) return;
      isPredicting.current = true;
      const timeout = setTimeout(() => { isPredicting.current = false; }, 3000);
      try {
        const plainLandmarks = Array.from(landmarks).map(lm => ({
          x: lm.x, y: lm.y, z: lm.z ?? 0,
        }));
        const response = await fetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: plainLandmarks }),
        });
        const data = await response.json();
        if (data.prediction && isMounted) {
          setCurrentPrediction(data.prediction);
          setIsModelReady(true);
        } else if (data.prediction === '' && isMounted) {
          setCurrentPrediction('');
          lastStablePred.current = '';
          stableStartTime.current = null;
        }
      } catch (err) {
        console.error('Prediction API error:', err);
      } finally {
        clearTimeout(timeout);
        isPredicting.current = false;
      }
    };

    const onResults = (results) => {
      if (!isMounted) return;
      setIsLoading(false);
      setIsModelReady(true);

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.fillStyle = '#020617';
      canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        sendToPredict(landmarks);

        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [5, 9], [9, 10], [10, 11], [11, 12],
          [9, 13], [13, 14], [14, 15], [15, 16],
          [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
        ];

        const drawConnectors = (pairs) => {
          canvasCtx.beginPath();
          pairs.forEach(([s, e]) => {
            canvasCtx.moveTo(landmarks[s].x * canvasElement.width, landmarks[s].y * canvasElement.height);
            canvasCtx.lineTo(landmarks[e].x * canvasElement.width, landmarks[e].y * canvasElement.height);
          });
          canvasCtx.stroke();
        };

        canvasCtx.shadowColor = '#06b6d4';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        canvasCtx.lineWidth = 8;
        drawConnectors(connections);

        canvasCtx.shadowBlur = 0;
        canvasCtx.strokeStyle = '#22d3ee';
        canvasCtx.lineWidth = 2;
        drawConnectors(connections);

        canvasCtx.fillStyle = '#cffafe';
        Array.from(landmarks).forEach((lm) => {
          canvasCtx.beginPath();
          canvasCtx.arc(lm.x * canvasElement.width, lm.y * canvasElement.height, 4, 0, 2 * Math.PI);
          canvasCtx.fill();
        });

      } else {
        setCurrentPrediction('');
        lastStablePred.current = '';
        stableStartTime.current = null;
      }
      canvasCtx.restore();
    };

    const initMediaPipe = async () => {
      try {
        await loadScript('/mediapipe-hands/hands.js');
        await loadScript('/mediapipe-hands/hands_solution_packed_assets_loader.js');
        await loadScript('/mediapipe-camera/camera_utils.js');
        if (!isMounted) return;

        const Hands = window.Hands;
        const MediaPipeCamera = window.Camera;
        if (typeof Hands !== 'function') throw new Error('window.Hands not found');
        if (typeof MediaPipeCamera !== 'function') throw new Error('window.Camera not found');

        hands = new Hands({ locateFile: (file) => `/mediapipe-hands/${file}` });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        hands.onResults(onResults);

        camera = new MediaPipeCamera(videoElement, {
          onFrame: async () => { if (hands) await hands.send({ image: videoElement }); },
          width: 640, height: 480,
        });
        camera.start();
      } catch (err) {
        console.error('MediaPipe init failed:', err);
        if (isMounted) { setIsLoading(false); setLoadError(err.message); }
      }
    };

    initMediaPipe();
    return () => {
      isMounted = false;
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, []);

  const manualAdd = () => {
    if (!currentPrediction || currentPrediction === 'Speak' || currentPrediction === 'next') return;
    if (currentPrediction === 'Backspace') {
      setOutputSentence(prev => prev.slice(0, -1));
    } else {
      if (stagedLetter) {
        setOutputSentence(prev => prev + stagedLetter);
        setStagedLetter('');
      } else {
        setOutputSentence(prev => prev + currentPrediction);
      }
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };


  const getBrowserVoice = (langCode) => {
    const voices = window.speechSynthesis.getVoices();
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
    const target = langMap[langCode] || 'en-US';
    return (
      voices.find(v => v.lang === target) ||
      voices.find(v => v.lang.startsWith(target.split('-')[0])) ||
      null
    );
  };

  const speakWithBrowser = (text, langCode) => {
    window.speechSynthesis.cancel();
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = langMap[langCode] || 'en-US';
    const voice = getBrowserVoice(langCode);
    if (voice) msg.voice = voice;
    msg.rate = 0.95;
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
  };

  // Play audio blob via persistent <audio> element (bypasses autoplay policy)
  const playAudioBlob = async (blob) => {
    const url = URL.createObjectURL(blob);
    const player = audioRef.current;
    player.src = url;
    player.onended = () => URL.revokeObjectURL(url);
    await player.play();
  };

  const translateAndSpeak = async (textToSpeak) => {
    if (!textToSpeak || !textToSpeak.trim()) return;

    // ── English: browser SpeechSynthesis (always reliable) ──────────────────
    if (selectedLang === 'en') {
      speakWithBrowser(textToSpeak.trim().toLowerCase(), 'en');
      return;
    }

    setIsTranslating(true);
    try {
      // Step 1: Translate to target language
      const transResp = await fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak.trim(), lang: selectedLang }),
      });
      const transData = await transResp.json();
      const translated = transData.translated || textToSpeak.trim();
      setTranslatedText(translated);

      // ── Kannada: gTTS backend as PRIMARY ────────────────────────────────
      // kn-IN voice is rarely installed on Windows; Google TTS is far more reliable
      if (selectedLang === 'kn') {
        const ttsResp = await fetch('/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: translated, lang: 'kn' }),
        });
        if (ttsResp.ok) {
          await playAudioBlob(await ttsResp.blob());
        } else {
          // Fallback: browser voice if gTTS fails
          speakWithBrowser(translated, 'kn');
        }
        return;
      }

      // ── Hindi: browser voice first, gTTS fallback ────────────────────────
      // hi-IN is more commonly available on Windows/Android
      if (selectedLang === 'hi') {
        const hiVoice = getBrowserVoice('hi');
        if (hiVoice) {
          speakWithBrowser(translated, 'hi');
        } else if (window.speechSynthesis.getVoices().length === 0) {
          // Voices not loaded yet — wait once
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            const v = getBrowserVoice('hi');
            if (v) {
              speakWithBrowser(translated, 'hi');
            } else {
              // No Hindi voice available → gTTS
              fetch('/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: translated, lang: 'hi' }),
              }).then(r => r.ok ? r.blob() : null)
                .then(b => { if (b) playAudioBlob(b); })
                .catch(() => speakWithBrowser(translated, 'en'));
            }
          };
        } else {
          // Voices loaded but no hi-IN → use gTTS backend
          const ttsResp = await fetch('/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: translated, lang: 'hi' }),
          });
          if (ttsResp.ok) {
            await playAudioBlob(await ttsResp.blob());
          } else {
            speakWithBrowser(translated, 'en');
          }
        }
      }

    } catch (err) {
      console.error('[TTS] Error:', err);
      speakWithBrowser(textToSpeak.trim().toLowerCase(), 'en');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      {/* Hidden persistent audio element for Kannada/Hindi TTS */}
      <audio ref={audioRef} style={{ display: 'none' }} preload="none" />
      <motion.div
        className="w-full glass-panel rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl border-white/10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><Activity size={24} /></div>
            <div>
              <h3 className="font-bold text-xl">SignBridge Interpreter</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Neural Engine V2.1 — Hold sign {STABLE_HOLD_MS / 1000}s to auto-add
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/50 border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${loadError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
              : isModelReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]'
                : 'bg-yellow-500 animate-pulse'
              }`} />
            <span className="text-sm font-medium text-slate-300">
              {loadError ? 'Load Error' : isModelReady ? 'Engine Active' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900 aspect-[4/3]">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full text-xs font-bold border border-white/10">
              <Camera size={14} className="text-cyan-400" />
              <span className="tracking-widest">LIVE CAMERA</span>
            </div>
            {isLoading && !loadError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                <Loader2 className="text-cyan-400 animate-spin mb-4" size={40} />
                <p className="text-cyan-400 font-bold tracking-widest text-sm">LOADING NEURAL MODEL...</p>
                <p className="text-slate-500 text-xs mt-2">Initializing MediaPipe Hands engine</p>
              </div>
            )}
            {loadError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm gap-3 px-6 text-center">
                <div className="text-red-400 text-4xl">⚠</div>
                <p className="text-red-400 font-bold tracking-widest text-sm">MODEL LOAD FAILED</p>
                <p className="text-slate-400 text-xs max-w-xs">{loadError}</p>
              </div>
            )}
            <video ref={videoRef} className="w-full h-full object-contain transform scale-x-[-1]" playsInline autoPlay muted />
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#020617] aspect-[4/3]">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full text-xs font-bold border border-white/10">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-yellow-400 tracking-widest">SKELETON MAPPING</span>
            </div>
            <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-contain" />
            <AnimatePresence mode="wait">
              {currentPrediction && (
                <motion.div
                  key={currentPrediction}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute bottom-8 right-8 z-20"
                >
                  <div className="relative h-24 w-24">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="4" />
                      <circle
                        cx="48" cy="48" r="44" fill="none"
                        stroke={justAdded ? '#22c55e' : '#06b6d4'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - holdProgress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.2s' }}
                      />
                    </svg>
                    <div className={`absolute inset-1 rounded-2xl backdrop-blur-2xl border flex items-center justify-center text-5xl font-bold transition-all ${justAdded ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      }`}>
                      {justAdded ? <Check size={32} /> : currentPrediction}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Languages size={18} />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Output Language</p>
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setSelectedLang(lang.code); setTranslatedText(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedLang === lang.code
                    ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="flex justify-between w-full mb-4 px-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Spelling Stack</p>
            </div>
            
            <div className="min-h-[80px] w-full flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
              {(!outputSentence && !stagedLetter) && <span className="text-slate-700 font-mono text-4xl md:text-6xl font-bold tracking-widest uppercase">Awaiting input...</span>}
              
              <span className="font-mono text-4xl md:text-6xl font-bold tracking-widest text-slate-300 uppercase whitespace-pre-wrap">
                {outputSentence}
              </span>

              {stagedLetter && (
                <span className="font-mono text-4xl md:text-6xl font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] uppercase border-b-4 border-cyan-400">
                  {stagedLetter}
                </span>
              )}
              
              <motion.span
                className="inline-block w-3 h-10 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>

            {/* Suggestions Bar */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full flex flex-wrap justify-center gap-2 mt-6 border-t border-white/5 pt-4"
                >
                  {suggestions.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(word)}
                      className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold tracking-widest hover:bg-cyan-500/20 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    >
                      {word}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Translated Text Display */}
            {selectedLang !== 'en' && translatedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-widest mb-3">
                  <Globe size={12} />
                  {LANGUAGES.find(l => l.code === selectedLang)?.label} TRANSLATION
                </div>
                <p className="text-2xl md:text-3xl font-bold text-violet-300 leading-relaxed drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  {translatedText}
                </p>
              </motion.div>
            )}

            {/* Translation Loading Indicator */}
            {isTranslating && (
              <div className="mt-4 flex items-center gap-2 text-violet-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                <span className="tracking-widest text-xs font-bold">TRANSLATING...</span>
              </div>
            )}
          </div>

          <div className="flex flex-row md:flex-col gap-4">
            <button onClick={() => {
              if (outputSentence.trim()) {
                translateAndSpeak(outputSentence);
              }
            }}
              className="p-6 rounded-3xl bg-green-500/20 text-green-400 font-bold hover:bg-green-500/30 transition-all border border-green-500/30 flex-1 md:flex-none text-sm group flex items-center justify-center gap-2">
              <Volume2 size={18} className="group-hover:scale-110 transition-transform" />
              {selectedLang === 'en' ? 'Speak' : selectedLang === 'hi' ? 'बोलें' : 'ಮಾತನಾಡಿ'}
            </button>
            <button onClick={() => { setOutputSentence(''); setStagedLetter(''); setTranslatedText(''); }}
              className="p-6 rounded-3xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all border border-white/5 flex-1 md:flex-none text-sm">
              Clear
            </button>
            <button onClick={() => { if (stagedLetter) { setOutputSentence(prev => prev + stagedLetter); setStagedLetter(''); } }}
              className="p-6 rounded-3xl bg-slate-800 text-cyan-400 font-bold hover:bg-slate-700 transition-all border border-cyan-500/20 flex-1 md:flex-none text-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              Next (Append)
            </button>
            <button onClick={() => setOutputSentence(prev => prev + ' ')}
              className="p-6 rounded-3xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all border border-white/5 flex-1 md:flex-none text-sm">
              Space
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 flex gap-8 items-center text-slate-500">
        <div className="flex items-center gap-2"><MessageCircle size={18} /><span className="text-sm">Hold sign 1s to auto-add</span></div>
        <div className="flex items-center gap-2"><Zap size={18} /><span className="text-sm">Low Latency</span></div>
        <div className="flex items-center gap-2"><Shield size={18} /><span className="text-sm">Local Processing</span></div>
      </div>
    </div>
  );
};

export default InterpreterCard;