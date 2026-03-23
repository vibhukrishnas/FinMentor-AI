import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FirePlanner() {
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(150000);
  const [expenses, setExpenses] = useState(60000);

  const chartData = useMemo(() => {
    const currentAge = parseInt(age) || 30;
    const monthlyIncome = parseFloat(income) || 0;
    const monthlyExpenses = parseFloat(expenses) || 0;
    
    // Assume 80% of surplus is invested
    const sip = (monthlyIncome - monthlyExpenses) * 0.8; 
    const targetCorpus = (monthlyExpenses * 12 * 30); // 30x annual expenses
    
    const dataPoints = [];
    const currentYear = new Date().getFullYear();
    const annualReturn = 0.12; // 12% expected return
    
    for (let i = 0; i <= 15; i += 3) {
      const months = i * 12;
      const r = annualReturn / 12;
      
      let futureValue = 0;
      if (months > 0 && sip > 0) {
        futureValue = sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
      }
      
      dataPoints.push({
        year: currentYear + i,
        netWorth: Math.round(futureValue / 100000), // in Lakhs
        target: Math.round(targetCorpus / 100000) // horizontal target line in Lakhs
      });
    }
    return dataPoints;
  }, [age, income, expenses]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold text-white">FIRE Path Planner</h1>
        <p className="mt-2 text-slate-400">Your AI-generated month-by-month financial roadmap to Financial Independence.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="glass-card p-6 space-y-6 lg:col-span-1 border-t-2 border-t-et-500">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Target size={20}/> Your Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 font-medium">Current Age</label>
              <input type="number" value={age} onChange={(e)=>setAge(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500 mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-400 font-medium">Monthly Income (₹)</label>
              <input type="number" value={income} onChange={(e)=>setIncome(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500 mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-400 font-medium">Monthly Expenses (₹)</label>
              <input type="number" value={expenses} onChange={(e)=>setExpenses(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:outline-none focus:border-et-500 mt-1" />
            </div>
          </div>
          <button className="w-full bg-et-600 hover:bg-et-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-et-600/20 transition-all flex justify-center items-center gap-2">
            Generate AI Roadmap <ArrowRight size={18}/>
          </button>
        </div>

        {/* Dashboard / Projections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 border border-dark-700/50 flex flex-col justify-center items-center text-center transition-all hover:bg-dark-800">
              <span className="text-sm text-slate-400 uppercase tracking-wider">FIRE Age</span>
              <span className="text-3xl font-bold text-white mt-1">{(parseInt(age) || 30) + 15}</span>
            </div>
            <div className="glass-card p-4 border border-dark-700/50 flex flex-col justify-center items-center text-center transition-all hover:bg-dark-800">
              <span className="text-sm text-slate-400 uppercase tracking-wider">Target Corpus</span>
              <span className="text-3xl font-bold text-et-400 mt-1">₹ {(((expenses || 0) * 12 * 30) / 10000000).toFixed(2)} Cr</span>
            </div>
            <div className="glass-card p-4 border border-dark-700/50 flex flex-col justify-center items-center text-center transition-all hover:bg-dark-800">
              <span className="text-sm text-slate-400 uppercase tracking-wider">Required SIP</span>
              <span className="text-3xl font-bold text-white mt-1">₹ {Math.max(0, ((income || 0) - (expenses || 0)) * 0.8).toLocaleString()}</span>
            </div>
          </div>

          <div className="glass-card p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><TrendingUp size={18}/> Projected Net Worth vs Target (Lakhs)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}} itemStyle={{color: '#fff'}} />
                <Area type="monotone" dataKey="target" stroke="#94a3b8" fillOpacity={1} fill="url(#colorTarget)" />
                <Area type="monotone" dataKey="netWorth" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorNW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
