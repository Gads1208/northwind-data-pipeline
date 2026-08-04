import React from 'react';
import { Sparkles, Bot, Filter, Download, ArrowUpRight } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { Users, ShoppingBag, DollarSign, Award } from 'lucide-react';

interface GenericAnalyticsPageProps {
  pageId: string;
  title: string;
  onTriggerChat: (prompt: string) => void;
}

export const GenericAnalyticsPage: React.FC<GenericAnalyticsPageProps> = ({ pageId, title, onTriggerChat }) => {
  const getPrompt = () => {
    switch (pageId) {
      case 'customers': return 'Quais clientes possuem maior volume de compras?';
      case 'orders': return 'Quais pedidos atrasaram no envio?';
      case 'products': return 'Quais produtos estão com estoque baixo ou parados?';
      case 'employees': return 'Quais vendedores tiveram maior faturamento?';
      case 'categories': return 'Qual categoria vende mais em volume e valor?';
      case 'sales': return 'Qual foi a evolução temporal de vendas?';
      case 'revenue': return 'Compare o faturamento mensal entre regiões.';
      default: return `Analise os principais indicadores de ${title}.`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            {title}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-mono border border-brand-500/20 uppercase">
              {pageId}
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Métricas detalhadas e assistente de IA configurado para o contexto de <strong>{title}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTriggerChat(getPrompt())}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-purple text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Bot className="w-4 h-4" />
            <span>Perguntar sobre {title}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title={`Métrica 1 - ${title}`} value="1,240" change="+14.2%" isPositive={true} icon={Users} color="brand" />
        <KPICard title={`Métrica 2 - ${title}`} value="85.4%" change="+3.1%" isPositive={true} icon={ShoppingBag} color="purple" />
        <KPICard title={`Volume ${title}`} value="$42,800" change="-1.2%" isPositive={false} icon={DollarSign} color="amber" />
        <KPICard title="Score IA" value="98/100" change="+4.0%" isPositive={true} icon={Award} color="emerald" />
      </div>

      {/* Main Content Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Painel Analítico Contextual - {title}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <button className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-300 flex items-center gap-1.5 hover:bg-surfaceBorder">
              <Filter className="w-3.5 h-3.5" />
              Filtros
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-300 flex items-center gap-1.5 hover:bg-surfaceBorder">
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="p-8 rounded-xl bg-background/50 border border-surfaceBorder text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Análise Interativa de {title} via IA</h4>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Clique no botão <strong>"Agente IA Contextual"</strong> ou selecione uma das perguntas sugeridas para consultar dados em tempo real sobre a base Northwind.
          </p>
          <button
            onClick={() => onTriggerChat(getPrompt())}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-md"
          >
            <span>Executar Consulta Sugerida: "{getPrompt()}"</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
