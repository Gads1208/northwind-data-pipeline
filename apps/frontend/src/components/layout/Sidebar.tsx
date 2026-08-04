import React from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, UserCheck, 
  Layers, Truck, TrendingUp, DollarSign, Target, BarChart3, 
  LineChart, Sparkles, Settings, Bot, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const navItems = [
  { id: 'home', label: 'Home (Visão Geral)', icon: LayoutDashboard, category: 'Principal' },
  { id: 'customers', label: 'Clientes', icon: Users, category: 'Operacional' },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart, category: 'Operacional' },
  { id: 'products', label: 'Produtos', icon: Package, category: 'Catálogo' },
  { id: 'employees', label: 'Funcionários', icon: UserCheck, category: 'Equipe' },
  { id: 'categories', label: 'Categorias', icon: Layers, category: 'Catálogo' },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck, category: 'Logística' },
  { id: 'sales', label: 'Vendas', icon: TrendingUp, category: 'Análise' },
  { id: 'revenue', label: 'Faturamento', icon: DollarSign, category: 'Análise' },
  { id: 'kpis', label: 'KPIs Executivos', icon: Target, category: 'Estratégico' },
  { id: 'analysis', label: 'Análises Avançadas', icon: BarChart3, category: 'Estratégico' },
  { id: 'forecasting', label: 'Previsões', icon: LineChart, category: 'IA & ML' },
  { id: 'insights', label: 'Insights Automáticos', icon: Sparkles, category: 'IA & ML' },
  { id: 'admin', label: 'Administração & MCP', icon: Settings, category: 'Sistema' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-[#0d1322] border-r border-surfaceBorder flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-surfaceBorder flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 text-lg leading-tight font-sans">
            Northwind AI
          </h1>
          <p className="text-[10px] tracking-wider text-brand-500 font-semibold uppercase">MCP Multi-Agent Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-brand-500 border border-brand-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceBorder/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-500' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-surfaceBorder bg-surface/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MCP Server Online
          </span>
          <span className="text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
