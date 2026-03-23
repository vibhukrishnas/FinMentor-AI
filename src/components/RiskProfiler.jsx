import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Shield, TrendingUp, Landmark, Gem, Brain, PieChart } from 'lucide-react';

export default function RiskProfiler() {
  const { user } = useUser();
  const [age, setAge] = useState(user.age || 30);
  const [income, setIncome] = useState(user.monthlyIncome || 100000);
  const [dependents, setDependents] = useState(1);
  const [investments, setInvestments] = useState(500000);
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/predict/risk-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age),
          monthly_income: parseFloat(income),
          dependents: parseInt(dependents),
          existing_investments: parseFloat(investments),
          risk_tolerance: parseInt(riskTolerance),
        })
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const profileColors = {
    Conservative: { bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    Moderate: { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    Aggressive: { bg: 'bg-et-500', text: 'text-et-400', glow: 'shadow-et-500/30' },
  };

  const toleranceLabels = ['', 'Very Safe', 'Safe', 'Cautious', 'Slightly Cautious', 'Balanced', 'Slightly Bold', 'Bold', 'Very Bold', 'Aggressive', 'Max Risk'];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">AI Risk Profiler</h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
          Powered by a trained <span className="text-et-400 font-semibold">GradientBoosting ML Model</span> (99.5% accuracy). Get your personalized asset allocation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="glass-card p-6 space-y-5 border-t-2 border-t-et-500">
          <h2 className="text-lg font-semibold text-white">Your Profile</h2>
          <div>
            <label className="text-xs text-slate-400 font-medium">Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-et-500 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Monthly Income (₹)</label>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-et-500 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Dependents</label>
            <input type="number" value={dependents} onChange={e => setDependents(e.target.value)} min="0" max="5" className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-et-500 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Total Existing Investments (₹)</label>
            <input type="number" value={investments} onChange={e => setInvestments(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-et-500 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Risk Tolerance: <span className="text-white font-semibold">{riskTolerance}/10</span> — {toleranceLabels[riskTolerance]}</label>
            <input type="range" min="1" max="10" value={riskTolerance} onChange={e => setRiskTolerance(e.target.value)} className="w-full accent-et-500 mt-2" />
          </div>
          <button onClick={handlePredict} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold bg-et-600 hover:bg-et-500 text-white shadow-lg transition-all disabled:opacity-50">
            <Brain size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Running ML Prediction...' : 'Predict My Risk Profile'}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              <div className="text-xs text-center text-slate-500 bg-dark-900/50 rounded-lg py-2 px-4 border border-dark-700/50">
                🧠 <span className="text-et-400 font-semibold">{result.model}</span> · Accuracy: <span className="text-white font-semibold">{result.accuracy}</span> · Confidence: <span className="text-white font-semibold">{result.confidence}%</span>
              </div>

              <div className={`glass-card p-8 text-center border-2 ${profileColors[result.risk_profile]?.text || 'text-white'} border-current shadow-2xl ${profileColors[result.risk_profile]?.glow}`}>
                <Shield size={48} className="mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white">{result.risk_profile}</h2>
                <p className="text-slate-400 mt-2">Investor Profile</p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PieChart size={20} className="text-et-500" /> Recommended Asset Allocation</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Equity (Stocks & MFs)', pct: result.allocation.equity, color: 'bg-emerald-500', icon: TrendingUp },
                    { label: 'Debt (FD, Bonds, PPF)', pct: result.allocation.debt, color: 'bg-blue-500', icon: Landmark },
                    { label: 'Gold (SGBs, Gold ETF)', pct: result.allocation.gold, color: 'bg-amber-500', icon: Gem },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-300 flex items-center gap-2"><item.icon size={14} /> {item.label}</span>
                        <span className="text-sm font-bold text-white">{item.pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full">
              <Shield size={64} className="text-dark-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-500">Enter your details and click Predict</h3>
              <p className="text-slate-600 mt-2 text-sm">The ML model will classify your risk profile and suggest an optimal asset allocation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
