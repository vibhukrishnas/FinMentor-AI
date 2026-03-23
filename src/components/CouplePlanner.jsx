import React, { useState } from 'react';
import { Users, Split, ShieldCheck, Heart, Zap } from 'lucide-react';

export default function CouplePlanner() {
  const [p1Income, setP1Income] = useState(1200000);
  const [p2Income, setP2Income] = useState(1800000);
  const [rent, setRent] = useState(25000);
  const [p2Sips, setP2Sips] = useState(40000);
  const [loading, setLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:3000/api/couple-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partnerAIncome: parseInt(p1Income), 
          partnerBIncome: parseInt(p2Income), 
          monthlyRent: parseInt(rent),
          monthlySips: parseInt(p2Sips) 
        })
      });
      const data = await resp.json();
      setAiStrategy(data);
    } catch (err) {
      console.error(err);
      setAiStrategy(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Users className="text-et-500" size={40} /> Couple's Money Planner
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
          India's first AI-powered joint financial planning tool. Optimize across both incomes for tax efficiency and joint goals.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6 border-t-2 border-t-blue-500 relative">
          <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold">Partner A</div>
          <h2 className="text-xl font-bold text-white mb-6">Income Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 font-medium">Annual Income (₹)</label>
              <input type="number" value={p1Income} onChange={(e)=>setP1Income(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-400 font-medium">Monthly Rent Paid (₹)</label>
              <input type="number" value={rent} onChange={(e)=>setRent(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mt-1" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-t-2 border-t-pink-500 relative">
          <div className="absolute top-4 right-4 bg-pink-500/20 text-pink-400 text-xs px-2 py-1 rounded font-bold">Partner B</div>
          <h2 className="text-xl font-bold text-white mb-6">Income Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 font-medium">Annual Income (₹)</label>
              <input type="number" value={p2Income} onChange={(e)=>setP2Income(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-400 font-medium">Monthly SIPs (₹)</label>
              <input type="number" value={p2Sips} onChange={(e)=>setP2Sips(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-8">
         <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-purple-500/20 transition-all flex items-center gap-3 text-lg disabled:opacity-50"
          >
           {loading ? <Zap className="animate-spin" size={24} /> : <Heart fill="currentColor" size={24} />}
           {loading ? 'Generating AI Strategy...' : 'Generate Joint Optimization Plan'}
         </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-et-400 font-semibold animate-pulse">
          <Zap className="inline animate-spin mr-2" size={20} /> Analyzing both incomes with Gemini AI...
        </div>
      )}

      {aiStrategy && aiStrategy.strategies && (
        <div className="glass-card p-8 bg-gradient-to-br from-dark-800 to-dark-900 border-l-4 border-l-purple-500 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
             <Split size={24} className="text-purple-500"/> AI Joint Strategy
          </h3>
          <div className="space-y-6">
            {aiStrategy.strategies.map((item, idx) => (
              <div key={idx} className="bg-dark-900/50 p-5 rounded-xl border border-dark-700/50 flex gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg h-fit shrink-0"><ShieldCheck size={24}/></div>
                <div>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400 mt-1">{item.description}</p>
                  {item.savings && <p className="text-emerald-400 font-semibold mt-2">Estimated savings: {item.savings}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiStrategy && !aiStrategy.strategies && (
        <p className="text-red-400 text-center">Failed to generate AI strategy. Ensure the backend server is running.</p>
      )}
    </div>
  );
}
