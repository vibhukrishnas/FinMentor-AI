import React, { useState, useMemo, useEffect } from 'react';
import { Shield, PiggyBank, Building, Activity, Save, Check, TrendingUp, AlertTriangle, Brain } from 'lucide-react';
import { mockableDbReq } from '../lib/supabaseClient';

export default function MoneyHealth() {
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [emergencyFund, setEmergencyFund] = useState(150000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [termInsurance, setTermInsurance] = useState(5000000);
  const [totalDebt, setTotalDebt] = useState(200000);
  const [investedAmount, setInvestedAmount] = useState(300000);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  // Call the trained ML model via FastAPI
  const fetchMLScore = async () => {
    setMlLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/predict/health-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_income: parseFloat(monthlyIncome) || 0,
          monthly_expenses: parseFloat(monthlyExpenses) || 0,
          emergency_fund: parseFloat(emergencyFund) || 0,
          term_insurance: parseFloat(termInsurance) || 0,
          total_debt: parseFloat(totalDebt) || 0,
          invested_amount: parseFloat(investedAmount) || 0,
        })
      });
      const data = await resp.json();
      setMlResult(data);
    } catch (err) {
      console.error('ML API unreachable:', err);
      setMlResult(null);
    } finally {
      setMlLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => { fetchMLScore(); }, []);

  const score = mlResult?.score ?? 0;
  const dims = mlResult?.dimensions ?? { emergency: { value: 0, months: 0 }, insurance: { value: 0 }, debt: { value: 0 }, investment: { value: 0 } };

  const handleSaveScore = async () => {
    setSaving(true);
    await mockableDbReq(async (db) => {
      return await db.from('health_scores').insert([
        { user_id: 'current-user-uuid', score: score, created_at: new Date().toISOString() }
      ]);
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatus = (val) => val >= 70 ? 'good' : 'warning';
  const getLabel = (val) => val >= 90 ? 'Excellent' : val >= 70 ? 'Healthy' : val >= 40 ? 'Needs Work' : 'Critical';

  const dimensionCards = [
    { ...dims.emergency, label: 'Emergency Fund', icon: PiggyBank },
    { ...dims.insurance, label: 'Insurance Cover', icon: Shield },
    { ...dims.debt, label: 'Debt Health', icon: Building },
    { ...dims.investment, label: 'Investment Rate', icon: TrendingUp },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Money Health Score</h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
          Powered by a trained <span className="text-et-400 font-semibold">Gradient Boosting ML Model</span> (R²=0.95). Enter your real numbers.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="glass-card p-6 space-y-4 border-t-2 border-t-et-500 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-2">Your Financial Snapshot</h2>
          {[
            { label: 'Monthly Income (₹)', val: monthlyIncome, set: setMonthlyIncome },
            { label: 'Monthly Expenses (₹)', val: monthlyExpenses, set: setMonthlyExpenses },
            { label: 'Emergency Fund Saved (₹)', val: emergencyFund, set: setEmergencyFund },
            { label: 'Term Insurance Cover (₹)', val: termInsurance, set: setTermInsurance },
            { label: 'Total Outstanding Debt (₹)', val: totalDebt, set: setTotalDebt },
            { label: 'Total Invested Amount (₹)', val: investedAmount, set: setInvestedAmount },
          ].map((field, i) => (
            <div key={i}>
              <label className="text-xs text-slate-400 font-medium">{field.label}</label>
              <input type="number" value={field.val} onChange={e => field.set(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-et-500 mt-1 text-sm" />
            </div>
          ))}
          <button
            onClick={fetchMLScore}
            disabled={mlLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all mt-2 bg-et-600 hover:bg-et-500 text-white shadow-lg disabled:opacity-50"
          >
            <Brain size={16} className={mlLoading ? 'animate-spin' : ''} />
            {mlLoading ? 'Running ML Model...' : 'Predict Health Score'}
          </button>
          <button 
            onClick={handleSaveScore}
            disabled={saving || saved || !mlResult}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-dark-800 border border-dark-600 hover:bg-dark-700 text-white'}`}
          >
            {saving ? <Activity className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Syncing...' : saved ? 'Saved to Supabase' : 'Save Snapshot'}
          </button>
        </div>

        {/* Score Display */}
        <div className="lg:col-span-2 space-y-6">
          {mlResult && (
            <div className="text-xs text-center text-slate-500 bg-dark-900/50 rounded-lg py-2 px-4 border border-dark-700/50">
              🧠 Predicted by <span className="text-et-400 font-semibold">{mlResult.model}</span> · Confidence: <span className="text-white font-semibold">{mlResult.confidence}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Gauge */}
            <div className="relative w-52 h-52 flex items-center justify-center group shrink-0">
              <svg className="w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                <path className="text-dark-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className={`${score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500'} drop-shadow-lg transition-all duration-1000 ease-out`} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-5xl font-black text-white">{Math.round(score)}</span>
                <span className="text-slate-400 font-medium tracking-widest uppercase text-xs mt-1">/ 100</span>
              </div>
              <div className={`absolute inset-0 ${score >= 70 ? 'bg-emerald-500/10' : 'bg-amber-500/10'} blur-[50px] rounded-full pointer-events-none`}></div>
            </div>

            {/* Dimension Cards */}
            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
              {dimensionCards.map((dim, idx) => {
                const status = getStatus(dim.value);
                const Icon = dim.icon;
                return (
                  <div key={idx} className="glass-card p-4 border border-dark-700/50 hover:border-et-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className={status === 'good' ? 'text-emerald-400' : 'text-amber-400'} />
                      <span className="text-slate-300 font-medium text-sm">{dim.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-bold text-white">{dim.value}%</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${status === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{getLabel(dim.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="glass-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              {score < 70 && <AlertTriangle size={18} className="text-amber-400" />} AI Prescription
            </h3>
            <div className="space-y-3">
              {dims.emergency.value < 70 && (
                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700/50">
                  <PiggyBank size={18} className="text-amber-400 shrink-0" />
                  <span className="text-sm text-slate-300">Build emergency fund to 6 months of expenses (₹{(parseFloat(monthlyExpenses) * 6).toLocaleString('en-IN')}). You have {dims.emergency.months} months covered.</span>
                </div>
              )}
              {dims.insurance.value < 70 && (
                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700/50">
                  <Shield size={18} className="text-amber-400 shrink-0" />
                  <span className="text-sm text-slate-300">Increase term insurance to ₹{((parseFloat(monthlyIncome) * 12 * 10) / 10000000).toFixed(1)} Cr (10x annual income).</span>
                </div>
              )}
              {dims.debt.value < 70 && (
                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700/50">
                  <Building size={18} className="text-red-400 shrink-0" />
                  <span className="text-sm text-slate-300">Debt-to-income ratio is high. Prioritize clearing ₹{parseFloat(totalDebt).toLocaleString('en-IN')} in outstanding debt.</span>
                </div>
              )}
              {dims.investment.value < 70 && (
                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700/50">
                  <TrendingUp size={18} className="text-amber-400 shrink-0" />
                  <span className="text-sm text-slate-300">Increase investments. Aim for 20% of annual income (₹{((parseFloat(monthlyIncome) * 12) * 0.2).toLocaleString('en-IN')}).</span>
                </div>
              )}
              {score >= 70 && <p className="text-emerald-400 font-medium text-center py-4">🎉 Your financial health is strong!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
