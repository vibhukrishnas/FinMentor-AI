import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, ShieldAlert, Sparkles, Brain } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Dashboard({ setActiveTab }) {
  const { user } = useUser();
  const [healthScore, setHealthScore] = useState(null);
  const [fireYears, setFireYears] = useState(null);

  // Fetch ML health score on load
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const resp = await fetch('http://localhost:8000/predict/health-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthly_income: user.monthlyIncome,
            monthly_expenses: user.monthlyExpenses,
            emergency_fund: user.monthlyExpenses * 3,
            term_insurance: user.monthlyIncome * 12 * 5,
            total_debt: 200000,
            invested_amount: user.monthlyIncome * 3,
          })
        });
        const data = await resp.json();
        setHealthScore(Math.round(data.score));
      } catch (e) {
        setHealthScore(52);
      }
    };

    // Calculate FIRE years from user context
    const surplus = (user.monthlyIncome - user.monthlyExpenses) * 0.8;
    const targetCorpus = user.monthlyExpenses * 12 * 25;
    if (surplus > 0) {
      const r = 0.12 / 12;
      const months = Math.log(targetCorpus * r / surplus + 1) / Math.log(1 + r);
      setFireYears(Math.round(months / 12));
    } else {
      setFireYears(null);
    }

    fetchHealth();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {greeting()}, {user.name || 'User'}
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          Your AI financial mentor has analyzed your portfolio. Here is your overview.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={100} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Financial Independence</p>
            <h2 className="text-3xl font-bold mt-2">{fireYears ? `${fireYears} Years` : 'Set Income'}</h2>
            <p className="text-sm text-et-400 mt-1">{fireYears ? `On track to FIRE by ${user.age + fireYears}` : 'Increase surplus to calculate'}</p>
          </div>
          <button onClick={() => setActiveTab('fire')} className="mt-6 flex items-center gap-2 text-white hover:text-et-400 transition-colors w-fit">
            View FIRE Path <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border-t-et-500 border-t-2 group">
          <div className="absolute top-0 right-0 p-4 text-et-500 opacity-20"><ShieldAlert size={100} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Money Health Score</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-4xl font-extrabold text-white">{healthScore ?? '...'}</h2>
              <span className="text-xl text-slate-500">/ 100</span>
            </div>
            <p className="text-sm mt-1 flex items-center gap-1">
              <Brain size={12} className="text-et-400" />
              <span className="text-et-400 text-xs">ML Predicted</span>
            </p>
          </div>
          <button onClick={() => setActiveTab('health')} className="mt-6 flex items-center gap-2 text-white hover:text-et-400 transition-colors w-fit">
            Improve Score <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">AI Recommendations</p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3 text-sm">
                <Sparkles size={16} className="text-et-500 shrink-0 mt-0.5" />
                <span className="text-slate-300">Run the <span className="text-white font-medium">Tax Wizard</span> to compare Old vs New regime for your ₹{(user.monthlyIncome * 12).toLocaleString('en-IN')} salary.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Sparkles size={16} className="text-et-500 shrink-0 mt-0.5" />
                <span className="text-slate-300">Take the <span className="text-white font-medium">Risk Profiler</span> quiz to get ML-powered asset allocation.</span>
              </li>
            </ul>
          </div>
          <button onClick={() => setActiveTab('risk')} className="mt-6 flex items-center gap-2 text-et-400 hover:text-et-300 transition-colors w-fit font-medium">
            Take Risk Quiz <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <section>
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Featured Advisors</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveTab('tax')} className="glass-card p-4 text-left hover:border-et-500/50 hover:bg-dark-800 transition-all flex flex-col gap-2">
              <span className="text-2xl">⚖️</span>
              <span className="font-semibold text-white">Tax Wizard</span>
              <span className="text-xs text-slate-400 text-balance">Model Old vs New regimes & optimize deductions</span>
            </button>
            <button onClick={() => setActiveTab('couple')} className="glass-card p-4 text-left hover:border-et-500/50 hover:bg-dark-800 transition-all flex flex-col gap-2">
              <span className="text-2xl">👩‍❤️‍👨</span>
              <span className="font-semibold text-white">Couples Planner</span>
              <span className="text-xs text-slate-400 text-balance">Optimize goals and net worth together</span>
            </button>
            <button onClick={() => setActiveTab('life')} className="glass-card p-4 text-left hover:border-et-500/50 hover:bg-dark-800 transition-all flex flex-col gap-2 col-span-2">
              <span className="text-2xl">👶</span>
              <span className="font-semibold text-white">Life Event Planning</span>
              <span className="text-xs text-slate-400 text-balance">Get contextual AI advice on major milestones.</span>
            </button>
          </div>
        </section>

        <section className="glass-card p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Pending Actions</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-et-500"></div>
                <span className="text-sm font-medium">Upload Form 16</span>
              </div>
              <button onClick={() => setActiveTab('tax')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors">Do it now</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium">Complete Risk Profile Quiz</span>
              </div>
              <button onClick={() => setActiveTab('risk')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors">Start</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
