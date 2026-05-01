import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Clock, Wifi, WifiOff, BarChart2, Trash2 } from 'lucide-react';

const API = '';

function StatCard({ icon, label, value, sub, color = 'text-cyan-400' }) {
  return (
    <div className="card border border-white/5 flex items-center gap-5">
      <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [h, hist] = await Promise.all([
        fetch(`${API}/health`).then(r => r.json()),
        fetch(`${API}/history`).then(r => r.json()),
      ]);
      setHealth(h);
      setHistory(hist);
      setError(null);
    } catch (e) {
      setError('Cannot reach API server on port 5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, []);

  const clearHistory = async () => {
    await fetch(`${API}/history`, { method: 'DELETE' });
    setHistory([]);
  };

  // Letter frequency from history
  const freq = history.reduce((acc, h) => {
    const l = h.prediction;
    if (l && l !== 'Speak') acc[l] = (acc[l] || 0) + 1;
    return acc;
  }, {});
  const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxFreq = sortedFreq[0]?.[1] || 1;
  const avgConf = history.length
    ? (history.reduce((s, h) => s + (h.confidence || 0), 0) / history.length).toFixed(1)
    : '—';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="page-section">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full glass-dark text-cyan-400 text-xs font-bold tracking-widest mb-4 border border-cyan-500/20">
            ANALYTICS
          </span>
          <h1 className="text-5xl font-black mb-2">
            Session <span className="gradient-text">Stats</span>
          </h1>
          <p className="text-slate-400">Live metrics from the neural engine and prediction history.</p>
        </motion.div>

        {error ? (
          <div className="card border border-red-500/30 flex items-center gap-4 text-red-400">
            <WifiOff size={24} />
            <div>
              <p className="font-semibold">API Offline</p>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Health cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard
                icon={<Wifi size={22} />}
                label="API Status"
                value={health ? 'Online' : '…'}
                sub={health?.runtime}
                color="text-green-400"
              />
              <StatCard
                icon={<Cpu size={22} />}
                label="Model"
                value={health?.model?.toUpperCase() || '…'}
                sub={`Smooth window: ${health?.smooth_window ?? '…'} frames`}
              />
              <StatCard
                icon={<BarChart2 size={22} />}
                label="Avg Confidence"
                value={avgConf !== '—' ? `${avgConf}%` : '—'}
                sub={`${history.length} predictions logged`}
              />
              <StatCard
                icon={<Activity size={22} />}
                label="Session Signs"
                value={history.length}
                sub="unique prediction events"
                color="text-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Frequency chart */}
              <div className="card border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Top Signs This Session</h2>
                  <span className="text-xs text-slate-500">Top 10</span>
                </div>
                {sortedFreq.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">
                    No predictions yet — go use the Interpreter!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortedFreq.map(([letter, count]) => (
                      <div key={letter} className="flex items-center gap-3">
                        <span className="w-8 text-center font-bold text-cyan-400 font-mono">{letter}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxFreq) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          />
                        </div>
                        <span className="w-6 text-right text-slate-400 text-sm">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent predictions log */}
              <div className="card border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Prediction Log</h2>
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">Empty — start signing!</p>
                  ) : (
                    [...history].reverse().map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xl font-bold text-cyan-400 font-mono w-8 text-center">
                          {item.prediction}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div
                              className="h-full bg-cyan-500/60 rounded-full"
                              style={{ width: `${Math.min(item.confidence || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 w-14 text-right">
                          {item.confidence?.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-600 w-16 text-right">
                          {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
