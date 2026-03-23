import React, { useState } from 'react';
import { Calculator, CheckCircle2, FileText, Brain } from 'lucide-react';

export default function TaxWizard() {
  const [salary, setSalary] = useState(1500000);
  const [sec80c, setSec80c] = useState(150000);
  const [hra, setHra] = useState(120000);
  const [sec80d, setSec80d] = useState(25000);
  const [homeLoan, setHomeLoan] = useState(0);
  const [mode, setMode] = useState('input');
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/predict/tax-regime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gross_salary: parseFloat(salary) || 0,
          sec_80c: parseFloat(sec80c) || 0,
          hra: parseFloat(hra) || 0,
          sec_80d: parseFloat(sec80d) || 0,
          home_loan: parseFloat(homeLoan) || 0,
        })
      });
      const data = await resp.json();
      setMlResult(data);
      setMode('result');
    } catch (err) {
      console.error('ML Tax API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Tax Wizard</h1>
          <p className="mt-2 text-slate-400">Powered by a trained <span className="text-et-400 font-semibold">Random Forest ML Model</span> (97.3% accuracy).</p>
        </div>
        <button className="bg-dark-800 border border-dark-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-dark-700 transition">
          <FileText size={18} /> Upload Form 16
        </button>
      </header>

      {mode === 'input' ? (
        <div className="glass-card p-8 border-t-4 border-t-et-500 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 font-medium block mb-2">Annual Gross Salary (₹)</label>
              <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full text-2xl bg-dark-900 border border-dark-700 rounded-lg p-4 text-white focus:outline-none focus:border-et-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">80C Investments (₹)</label>
                <input type="number" value={sec80c} onChange={(e) => setSec80c(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500" />
                <p className="text-xs text-slate-500 mt-1">Max ₹1.5L (PPF, ELSS, LIC)</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">HRA Exemption (₹)</label>
                <input type="number" value={hra} onChange={(e) => setHra(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Medical Ins. 80D (₹)</label>
                <input type="number" value={sec80d} onChange={(e) => setSec80d(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500" />
                <p className="text-xs text-slate-500 mt-1">Max ₹75K (self + parents)</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Home Loan Int. 24b (₹)</label>
                <input type="number" value={homeLoan} onChange={(e) => setHomeLoan(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500" />
                <p className="text-xs text-slate-500 mt-1">Max ₹2L</p>
              </div>
            </div>
            <button onClick={handleCalculate} disabled={loading} className="w-full bg-white text-dark-900 hover:bg-slate-200 font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
              {loading ? <Brain size={20} className="animate-spin" /> : <Calculator size={20}/>}
              {loading ? 'Running ML Prediction...' : 'Calculate Optimal Tax Regime'}
            </button>
          </div>
        </div>
      ) : mlResult && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          {/* ML Model Badge */}
          <div className="text-xs text-center text-slate-500 bg-dark-900/50 rounded-lg py-2 px-4 border border-dark-700/50">
            🧠 Predicted by <span className="text-et-400 font-semibold">{mlResult.model}</span> · Accuracy: <span className="text-white font-semibold">{mlResult.accuracy}</span> · Confidence: <span className="text-white font-semibold">{mlResult.confidence}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Old Regime */}
            <div className={`glass-card p-8 relative ${mlResult.recommended === 'old' ? 'border-2 border-et-500 scale-105 z-10 shadow-2xl shadow-et-500/10' : 'border border-dark-700/50'}`}>
              {mlResult.recommended === 'old' && (
                <div className="absolute -top-4 -right-4 bg-et-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-et-500/40">
                  <CheckCircle2 size={14}/> ML RECOMMENDED
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-300">Old Regime</h2>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Gross Income</span><span className="font-semibold">₹ {(parseFloat(salary) || 0).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Total Deductions</span><span className="font-semibold text-emerald-400">- ₹ {mlResult.old_regime.total_deductions.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Taxable Income</span><span className="font-semibold text-white">₹ {mlResult.old_regime.taxable_income.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between pt-4"><span className="text-lg font-bold text-white">Total Tax (incl. cess)</span><span className="text-2xl font-bold text-white">₹ {mlResult.old_regime.tax.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* New Regime */}
            <div className={`glass-card p-8 relative ${mlResult.recommended === 'new' ? 'border-2 border-et-500 scale-105 z-10 shadow-2xl shadow-et-500/10 bg-gradient-to-br from-dark-800 to-dark-900' : 'border border-dark-700/50'}`}>
              {mlResult.recommended === 'new' && (
                <div className="absolute -top-4 -right-4 bg-et-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-et-500/40">
                  <CheckCircle2 size={14}/> ML RECOMMENDED
                </div>
              )}
              <h2 className="text-2xl font-bold text-et-400">New Regime</h2>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Gross Income</span><span className="font-semibold">₹ {(parseFloat(salary) || 0).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Standard Deduction</span><span className="font-semibold text-emerald-400">- ₹ {mlResult.new_regime.standard_deduction.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-b border-dark-700 pb-2"><span className="text-slate-400">Taxable Income</span><span className="font-semibold text-white">₹ {mlResult.new_regime.taxable_income.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between pt-4"><span className="text-lg font-bold text-white">Total Tax (incl. cess)</span><span className="text-3xl font-bold text-et-400">₹ {mlResult.new_regime.tax.toLocaleString('en-IN')}</span></div>
              </div>
              {mlResult.savings > 0 && (
                <div className="mt-6 p-4 bg-et-500/10 border border-et-500/20 rounded-xl">
                  <p className="text-et-400 font-medium">You save ₹ {mlResult.savings.toLocaleString('en-IN')} with the {mlResult.recommended === 'new' ? 'New' : 'Old'} Regime.</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
             <button onClick={() => { setMode('input'); setMlResult(null); }} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">← Re-calculate with different numbers</button>
          </div>
        </div>
      )}
    </div>
  );
}
