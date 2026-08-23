import React, { useEffect, useState } from 'react';
import { 
  Sparkles, Bot, Filter, Download, ArrowUpRight, Loader2,
  Users, ShoppingBag, DollarSign, Award, ShoppingCart, Package, 
  UserCheck, Layers, Truck, TrendingUp, Globe, Settings, LucideIcon, Search
} from 'lucide-react';
import axios from 'axios';
import { KPICard } from '../components/dashboard/KPICard';

interface GenericAnalyticsPageProps {
  pageId: string;
  title: string;
  onTriggerChat: (prompt: string) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  ShoppingBag,
  DollarSign,
  Award,
  ShoppingCart,
  Package,
  UserCheck,
  Layers,
  Truck,
  TrendingUp,
  Globe,
  Settings,
  Sparkles
};

export const GenericAnalyticsPage: React.FC<GenericAnalyticsPageProps> = ({ pageId, title, onTriggerChat }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setSearchTerm('');
    axios.get(`/api/v1/dashboard/context/${pageId}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load contextual dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageId]);

  const getPrompt = () => {
    switch (pageId) {
      case 'customers': return 'Quais clientes possuem maior volume de compras?';
      case 'orders': return 'Quais pedidos atrasaram no envio?';
      case 'products': return 'Quais produtos estão com estoque baixo ou parados?';
      case 'employees': return 'Quais vendedores tiveram maior faturamento?';
      case 'categories': return 'Qual categoria vende mais em volume e valor?';
      case 'suppliers': return 'Quais fornecedores atendem o maior catálogo de produtos?';
      case 'sales': return 'Qual foi a evolução temporal de vendas por país?';
      case 'revenue': return 'Compare o faturamento líquido e descontos por categoria.';
      case 'kpis': return 'Apresente uma análise executiva de cumprimento de metas.';
      case 'analysis': return 'Quais as principais correlações e oportunidades analíticas?';
      case 'forecasting': return 'Qual a projeção de receita e demanda para o próximo trimestre?';
      case 'insights': return 'Quais são os 3 principais insights de negócio para alavancar receita?';
      case 'admin': return 'Qual o status de saúde dos microserviços e latência do MCP?';
      default: return `Analise os principais indicadores de ${title}.`;
    }
  };

  const kpis = data?.kpis || [];
  const tableData = data?.table || { columns: [], rows: [] };

  const filteredRows = (tableData.rows || []).filter((row: any) => {
    if (!searchTerm) return true;
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportCSV = () => {
    if (!tableData.rows || !tableData.rows.length) return;
    const cols = tableData.columns.map((c: any) => c.key);
    const headers = tableData.columns.map((c: any) => `"${c.label}"`).join(',');
    const rows = filteredRows.map((r: any) =>
      cols.map((col: string) => `"${r[col] || ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${pageId}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Métricas em tempo real extraídas via <strong>Servidor MCP</strong> para o contexto de <strong>{title}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTriggerChat(getPrompt())}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-purple text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:opacity-95 transition-opacity"
          >
            <Bot className="w-4 h-4" />
            <span>Perguntar sobre {title}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 rounded-2xl h-32 flex items-center justify-center animate-pulse">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi: any, idx: number) => {
            const IconComponent = ICON_MAP[kpi.icon] || Award;
            return (
              <KPICard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                isPositive={kpi.isPositive}
                icon={IconComponent}
                color={kpi.color || 'brand'}
              />
            );
          })}
        </div>
      )}

      {/* Main Content Card: Data Table Preview */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Painel Analítico Contextual - {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros e agregações consolidadas do banco Northwind.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar dados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-200 text-xs focus:outline-none focus:border-brand-500 w-full sm:w-44"
              />
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-300 flex items-center gap-1.5 hover:bg-surfaceBorder transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        {tableData.columns && tableData.columns.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-surfaceBorder">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-surfaceBorder/50 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  {tableData.columns.map((col: any) => (
                    <th key={col.key} className="p-3">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder bg-background/30">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-surfaceBorder/30 transition-colors">
                      {tableData.columns.map((col: any) => (
                        <td key={col.key} className="p-3 text-xs md:text-sm">
                          {row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableData.columns.length} className="p-6 text-center text-slate-500 text-xs">
                      Nenhum registro encontrado para o filtro aplicado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Interactive AI Assistant Callout */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-brand-600/10 via-accent-purple/5 to-transparent border border-brand-500/20 text-center space-y-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Análise Interativa de {title} via IA</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Consulte métricas específicas, gere previsões ou execute queries SQL sanitizadas automaticamente através do Agente IA Contextual.
          </p>
          <button
            onClick={() => onTriggerChat(getPrompt())}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-all shadow-md"
          >
            <span>Executar Consulta Sugerida: "{getPrompt()}"</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
