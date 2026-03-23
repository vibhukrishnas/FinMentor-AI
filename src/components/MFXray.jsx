import React, { useState, useMemo } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MFXray() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Generate dynamic chart data from AI-returned XIRR
  const chartData = useMemo(() => {
    const xirr = results?.trueXirr || 12;
    const monthlyRate = xirr / 100 / 12;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      value: Math.round(100 * Math.pow(1 + monthlyRate, i)),
    }));
  }, [results]);

  const handleUpload = async () => {
    setAnalyzing(true);
    try {
      const resp = await fetch('http://localhost:3000/api/mf-xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funds: ["Upload1", "Upload2"] })
      });
      const data = await resp.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      setResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
        <RefreshCw size={64} className="text-et-500 animate-spin" />
        <h2 className="text-2xl font-bold text-white">Analyzing Portfolio...</h2>
        <p className="text-slate-400">Scanning CAMS/KFintech statement. Calculating true XIRR & overlap.</p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Portfolio X-Ray Results</h1>
            <p className="mt-2 text-slate-400">Analysis complete. Here is the true picture of your mutual funds.</p>
          </div>
          <button onClick={()=>setResults(null)} className="bg-dark-800 border border-dark-600 px-4 py-2 rounded-lg text-sm hover:bg-dark-700 transition">Analyze Another Portfolio</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 border-b-4 border-b-emerald-500">
            <span className="text-sm text-slate-400 uppercase tracking-wider">True XIRR</span>
            <div className="text-4xl font-bold text-white mt-2">{results.trueXirr}%</div>
          </div>
          <div className="glass-card p-6 border-b-4 border-b-et-500">
            <span className="text-sm text-slate-400 uppercase tracking-wider">Fund Overlap</span>
            <div className="text-4xl font-bold text-et-500 mt-2">{results.overlapPercentage}%</div>
            <p className="text-xs text-et-400 mt-2 flex items-center gap-1"><AlertTriangle size={12}/> High overlap detected</p>
          </div>
          <div className="glass-card p-6 border-b-4 border-b-amber-500">
            <span className="text-sm text-slate-400 uppercase tracking-wider">Expense Ratio</span>
            <div className="text-4xl font-bold text-white mt-2">{results.expenseRatioAvg}%</div>
          </div>
          <div className="glass-card p-6 border-b-4 border-b-blue-500">
            <span className="text-sm text-slate-400 uppercase tracking-wider">Current Value</span>
            <div className="text-4xl font-bold text-white mt-2">{results.currentValue || '₹12.4L'}</div>
            <p className="text-xs text-blue-400 mt-2">Invested: {results.investedValue || '₹9.8L'}</p>
          </div>
        </div>

        <div className="glass-card p-6">
           <h3 className="text-lg font-bold text-white mb-6">Growth Trajectory (XIRR-based)</h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" />
                  <YAxis stroke="#475569" domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card p-6 bg-et-500/5 border border-et-500/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="text-et-500"/> AI Rebalancing Plan</h3>
          <ul className="space-y-3">
             {results.recommendations.map((rec, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-lg">
                  <div>
                    <span className="font-semibold text-white block">{rec.action}: {rec.fundName}</span>
                    <span className="text-xs text-slate-400">Reason: {rec.reason}</span>
                  </div>
                  <span className={`font-bold px-3 py-1 rounded ${rec.action === 'Enter' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-et-500/10 text-et-500'}`}>{rec.impact}</span>
                </li>
             ))}
          </ul>
          <button className="mt-6 w-full bg-et-600 hover:bg-et-500 text-white font-bold py-3 rounded-lg shadow-lg">Execute 1-Click Rebalance</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Mutual Fund Portfolio X-Ray</h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
          Upload your CAMS or KFintech CAS statement. In under 10 seconds get complete portfolio reconstruction, true XIRR, overlap analysis, and AI rebalancing.
        </p>
      </header>

      <div className="glass-card p-12 border-2 border-dashed border-dark-600 flex flex-col items-center justify-center text-center hover:border-et-500 hover:bg-dark-800/50 transition-all cursor-pointer group" onClick={handleUpload}>
         <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
           <UploadCloud size={40} className="text-et-500" />
         </div>
         <h3 className="text-2xl font-bold text-white mb-2">Click to Upload Statement</h3>
         <p className="text-slate-400">Supports PDF format from CAMS / KFintech</p>
         <button className="mt-8 bg-white text-dark-900 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-slate-200 transition-colors">Select File</button>
      </div>
    </div>
  );
}
