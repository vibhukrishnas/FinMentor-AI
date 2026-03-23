import React, { useState, useEffect } from 'react';
import { Baby, Gem, Gift, Briefcase, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function LifeEvents() {
  const { user } = useUser();
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);

  useEffect(() => {
    if (!activeEvent) return;
    const fetchAI = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/life-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: activeEvent, income: user.monthlyIncome * 12, age: user.age })
        });
        const data = await response.json();
        setAiAdvice(data);
      } catch (err) {
        console.error(err);
        setAiAdvice(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, [activeEvent]);

  const events = [
    { id: 'baby', label: 'New Baby', icon: Baby, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'marriage', label: 'Marriage', icon: Gem, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'inheritance', label: 'Inheritance/Bonus', icon: Gift, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'job', label: 'Job Change', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold text-white">Life Event Financial Advisor</h1>
        <p className="mt-2 text-slate-400 text-lg">
          AI advice customized to your tax bracket, portfolio, and goals for specific life milestones.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {events.map(event => (
          <button 
            key={event.id}
            onClick={() => setActiveEvent(event.id)}
            className={`glass-card p-6 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 border-2 ${activeEvent === event.id ? 'border-et-500 scale-105 shadow-et-500/20' : 'border-transparent hover:border-dark-600 hover:bg-dark-800/80'}`}
          >
            <div className={`p-4 rounded-full ${event.bg}`}>
              <event.icon size={32} className={event.color} />
            </div>
            <span className="font-semibold text-white">{event.label}</span>
          </button>
        ))}
      </div>

      {activeEvent && (
        <div className="glass-card p-8 mt-8 border-l-4 border-l-et-500 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Zap size={200} />
          </div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-et-500" /> AI Action Plan for: {events.find(e => e.id === activeEvent)?.label}
          </h2>
          <div className="mt-6 space-y-6 relative z-10">
            {loading ? (
               <div className="flex items-center gap-3 text-et-500 font-semibold animate-pulse">
                 <Zap className="animate-spin" /> Deep AI Analysis running on ET Cloud...
               </div>
            ) : aiAdvice ? (
               <>
                 {aiAdvice.tasks.map((task, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-et-600 flex items-center justify-center font-bold text-white shrink-0">{task.step}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <p className="text-slate-400 mt-1">{task.description}</p>
                      </div>
                    </div>
                 ))}
                 <button className="bg-white text-dark-900 hover:bg-slate-200 mt-6 px-6 py-2.5 rounded-lg font-semibold shadow-xl transition-all">Apply to My Plan</button>
               </>
            ) : (
               <p className="text-red-400">Failed to generate AI advice from server.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
