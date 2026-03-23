import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ArrowRight, Sparkles, User, Briefcase, IndianRupee } from 'lucide-react';

export default function Onboarding() {
  const { updateUser } = useUser();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(100000);
  const [expenses, setExpenses] = useState(50000);

  const handleComplete = () => {
    updateUser({
      name: name || 'User',
      age: parseInt(age),
      monthlyIncome: parseFloat(income),
      monthlyExpenses: parseFloat(expenses),
      isOnboarded: true,
    });
  };

  const steps = [
    {
      icon: User, title: "What's your name?", subtitle: "Let's personalize your financial journey",
      input: <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rohan" className="w-full text-3xl bg-transparent border-b-2 border-dark-600 focus:border-et-500 text-white text-center py-4 focus:outline-none placeholder:text-dark-600" autoFocus />
    },
    {
      icon: Briefcase, title: "How old are you?", subtitle: "This helps us calculate your FIRE timeline",
      input: (
        <div className="flex flex-col items-center gap-4">
          <input type="range" min="18" max="65" value={age} onChange={e => setAge(e.target.value)} className="w-full accent-et-500" />
          <span className="text-6xl font-black text-white">{age} <span className="text-2xl text-slate-500">years</span></span>
        </div>
      )
    },
    {
      icon: IndianRupee, title: "Monthly Income & Expenses", subtitle: "We'll use this across all modules",
      input: (
        <div className="space-y-6 w-full">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Monthly Income (₹)</label>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full text-2xl bg-dark-900 border border-dark-700 rounded-xl p-4 text-white focus:outline-none focus:border-et-500" />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Monthly Expenses (₹)</label>
            <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className="w-full text-2xl bg-dark-900 border border-dark-700 rounded-xl p-4 text-white focus:outline-none focus:border-et-500" />
          </div>
        </div>
      )
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-et-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Progress */}
        <div className="flex gap-2 mb-12 justify-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-et-500 w-12' : 'bg-dark-700 w-8'}`} />
          ))}
        </div>

        <div className="text-center mb-8 animate-in fade-in duration-500" key={step}>
          <div className="w-16 h-16 rounded-2xl bg-et-500/10 flex items-center justify-center mx-auto mb-6">
            <Icon size={32} className="text-et-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">{current.title}</h1>
          <p className="text-slate-400 mt-2">{current.subtitle}</p>
        </div>

        <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500" key={`input-${step}`}>
          {current.input}
        </div>

        <div className="flex justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-slate-400 hover:text-white transition px-6 py-3">← Back</button>
          ) : <div />}

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="bg-et-600 hover:bg-et-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-et-500/20 flex items-center gap-2 transition-all">
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleComplete} className="bg-gradient-to-r from-et-500 to-et-700 hover:from-et-400 hover:to-et-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-et-500/30 flex items-center gap-2 transition-all">
              <Sparkles size={18} /> Launch FinMentor AI
            </button>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-et-500 to-et-700 flex items-center justify-center font-bold text-white text-xs">ET</div>
            <span className="font-bold text-white">FinMentor<span className="text-et-500">AI</span></span>
          </div>
          <p className="text-xs text-slate-600">Powered by Economic Times</p>
        </div>
      </div>
    </div>
  );
}
