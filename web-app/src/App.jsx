import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InterpreterCard from './components/InterpreterCard';
import EducationGrid from './components/EducationGrid';
import LearnPage from './components/LearnPage';
import StatsPage from './components/StatsPage';

import { Hand, ArrowRight, Book, Shield, Zap, Info, MessageSquare, BarChart2, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 border-b-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/50 text-cyan-400">
            <Hand size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SignBridge</span>
        </Link>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
        <Link to="/" className={`hover:text-cyan-400 transition-colors ${location.pathname === '/' ? 'text-cyan-400' : ''}`}>Home</Link>
        <Link to="/interpreter" className={`hover:text-cyan-400 transition-colors ${location.pathname === '/interpreter' ? 'text-cyan-400' : ''}`}>Interpreter</Link>
        <Link to="/learn" className={`hover:text-cyan-400 transition-colors ${location.pathname === '/learn' ? 'text-cyan-400' : ''}`}>Learn ASL</Link>

        <Link to="/stats" className={`hover:text-cyan-400 transition-colors flex items-center gap-1 ${location.pathname === '/stats' ? 'text-cyan-400' : ''}`}>Stats <BarChart2 size={14}/></Link>
      </div>
      <Link to="/interpreter" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all">
        Launch App <ArrowRight size={16} />
      </Link>
    </nav>
  );
};

const HomePage = () => (
  <div className="pt-32 pb-20">
    {/* Hero Section */}
    <section className="px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative mb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-sm text-cyan-300 mb-8 border-cyan-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Next-Gen AI Interpretation
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
          Voices for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Voiceless</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          Bridging the communication gap with state-of-the-art Neural Networks. Experience real-time American Sign Language translation powered by computer vision.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/interpreter" className="px-10 py-5 rounded-full bg-cyan-500 text-white font-bold text-lg hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-2">
            Try the Interpreter <ArrowRight size={20} />
          </Link>
          <a href="#about-asl" className="px-10 py-5 rounded-full glass-panel font-bold text-lg hover:bg-white/10 transition-colors border border-white/10">
            Learn More
          </a>
        </div>
      </motion.div>
    </section>

    {/* Educational Info Section */}
    <section id="about-asl" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Understanding <span className="text-cyan-400">ASL</span></h2>
          <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
            <p>
              American Sign Language (ASL) is a complete, complex language that employs signs made by moving the hands combined with facial expressions and postures of the body. It is the primary language of many North Americans who are deaf and is one of several communication options used by people who are hard of hearing.
            </p>
            <p>
              Contrary to popular belief, ASL is not a visual representation of English. It has its own unique grammar, syntax, and idioms. It is a rich, vibrant language with a history that spans over two centuries, evolving within the American Deaf community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <Book className="text-cyan-400 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-white mb-1">Rich Grammar</h4>
                  <p className="text-sm">Features complex rules for sentence structure and verb conjugation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <MessageSquare className="text-cyan-400 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-white mb-1">Visual-Spatial</h4>
                  <p className="text-sm">Uses physical space and movement to convey meaning and nuance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
          <div className="relative glass-panel rounded-[2.5rem] p-10 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Info className="text-cyan-400" /> Did You Know?
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0 mt-1">1</div>
                <p className="text-slate-300">ASL is considered the 4th most studied second language in American universities.</p>
              </li>
              <li className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0 mt-1">2</div>
                <p className="text-slate-300">Thomas Hopkins Gallaudet and Laurent Clerc established the first school for the deaf in the US in 1817.</p>
              </li>
              <li className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0 mt-1">3</div>
                <p className="text-slate-300">Facial expressions are a critical part of ASL grammar, serving as "adverbs" and "adjectives".</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Tech Info Section */}
    <section className="py-24 px-6 max-w-7xl mx-auto bg-white/5 rounded-[3rem] border border-white/10">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">The Technology Behind</h2>
        <p className="text-slate-400 text-lg">Harnessing advanced machine learning for accessibility.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold">Neural Core</h3>
          <p className="text-slate-400 italic font-serif">"cnn8grps_rad1_model"</p>
          <p className="text-slate-400 text-sm">A custom Convolutional Neural Network trained on thousands of sign gesture samples for high accuracy.</p>
        </div>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Hand size={32} />
          </div>
          <h3 className="text-xl font-bold">Landmark Tracking</h3>
          <p className="text-slate-400 italic">MediaPipe Hands</p>
          <p className="text-slate-400 text-sm">Real-time detection of 21 3D hand landmarks allows for precise gesture mapping and motion analysis.</p>
        </div>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold">Privacy Layer</h3>
          <p className="text-slate-400 italic">Edge Processing</p>
          <p className="text-slate-400 text-sm">By processing landmark data locally, we ensure that video streams are never stored or transmitted.</p>
        </div>
      </div>
    </section>

    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold mb-4">Why Sign Language Matters</h2>
        <p className="text-slate-400 max-w-2xl text-lg">Understanding the impact and importance of ASL in fostering an inclusive society.</p>
      </div>
      <EducationGrid />
    </section>
  </div>
);

const InterpreterPage = () => (
  <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative min-h-screen">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Interpreter</h1>
      <p className="text-slate-400 max-w-2xl mx-auto">Position your hand clearly in front of the camera. The system will track your gestures and translate them using the neural engine.</p>
    </motion.div>
    
    <div className="flex justify-center">
      <InterpreterCard />
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 font-sans">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interpreter" element={<InterpreterPage />} />
          <Route path="/learn" element={<LearnPage />} />

          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </AnimatePresence>
      
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 SignBridge. Empowering through innovation.</p>
      </footer>
    </div>
  );
}

export default App;
