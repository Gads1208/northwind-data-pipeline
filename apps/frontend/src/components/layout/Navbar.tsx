import React from 'react';
import { Bot, Sparkles, Database, ShieldCheck } from 'lucide-react';
import { navItems } from './Sidebar';

interface NavbarProps {
  activeTab: string;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, isChatOpen, setIsChatOpen }) => {
  const currentItem = navItems.find((i) => i.id === activeTab) || navItems[0];

  return (
    <header className="h-16 border-b border-surfaceBorder bg-[#0d1322]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          {currentItem.label}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 font-medium">
          Contexto Activo: {currentItem.id.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 bg-surface/60 px-3 py-1.5 rounded-lg border border-surfaceBorder">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-accent-cyan" />
            Northwind DB
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
            SQL AST Safe
          </span>
        </div>

        {/* AI Assistant Chat Trigger Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
            isChatOpen
              ? 'bg-gradient-to-r from-brand-600 to-accent-purple text-white shadow-brand-500/25 ring-2 ring-brand-500/50'
              : 'bg-surface hover:bg-surfaceBorder text-slate-200 border border-surfaceBorder hover:border-brand-500/40'
          }`}
        >
          <Bot className="w-4 h-4 text-brand-500 animate-bounce" />
          <span>Agente IA Contextual</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </header>
  );
};
