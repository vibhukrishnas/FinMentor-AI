import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  HeartPulse,
  Baby,
  Calculator,
  Users,
  LineChart,
  Shield,
} from 'lucide-react';
import { UserProvider, useUser } from './context/UserContext';
import Onboarding from './components/Onboarding';
import { Dashboard, FirePlanner, MoneyHealth, LifeEvents, TaxWizard, CouplePlanner, MFXray, RiskProfiler } from './components';

function AppContent() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user.isOnboarded) {
    return <Onboarding />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'fire', label: 'FIRE Planner', icon: TrendingUp },
    { id: 'health', label: 'Money Health', icon: HeartPulse },
    { id: 'risk', label: 'Risk Profiler', icon: Shield },
    { id: 'life', label: 'Life Events', icon: Baby },
    { id: 'tax', label: 'Tax Wizard', icon: Calculator },
    { id: 'couple', label: "Couple's Planner", icon: Users },
    { id: 'mf', label: 'MF X-Ray', icon: LineChart },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'fire': return <FirePlanner />;
      case 'health': return <MoneyHealth />;
      case 'risk': return <RiskProfiler />;
      case 'life': return <LifeEvents />;
      case 'tax': return <TaxWizard />;
      case 'couple': return <CouplePlanner />;
      case 'mf': return <MFXray />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-200 overflow-hidden font-sans">
      <aside className="w-64 border-r border-dark-800 bg-dark-950/80 backdrop-blur-xl flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-dark-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-et-500 to-et-700 flex items-center justify-center font-bold text-white shadow-lg shadow-et-500/30">
            ET
          </div>
          <span className="font-bold text-xl tracking-tight text-white">FinMentor<span className="text-et-500">AI</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-et-600/10 text-et-400 font-semibold border border-et-500/20 shadow-inner' 
                    : 'text-slate-400 hover:bg-dark-800/80 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-et-500' : ''} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-et-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-et-500 to-et-700 flex items-center justify-center font-bold text-xs text-white">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
             <div className="text-left text-sm flex-1">
                <span className="block font-semibold text-white">{user.name}</span>
                <span className="block text-xs text-slate-400">Age {user.age} · ₹{(user.monthlyIncome / 1000).toFixed(0)}k/mo</span>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full relative h-[100dvh]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-et-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
        <div className="relative z-10 min-h-full">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
