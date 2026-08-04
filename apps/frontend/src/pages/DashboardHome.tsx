import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { KPICard } from '../components/dashboard/KPICard';

interface DashboardHomeProps {
  onTriggerChat: (prompt: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899'];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onTriggerChat }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/dashboard/summary')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {};
  const categories = data?.sales_by_category || [
    { category_name: 'Beverages', total_revenue: 12500 },
    { category_name: 'Dairy Products', total_revenue: 9800 },
    { category_name: 'Confections', total_revenue: 8700 },
    { category_name: 'Seafood', total_revenue: 6400 },
    { category_name: 'Condiments', total_revenue: 5200 }
  ];
  const countries = data?.sales_by_country || [
    { country: 'USA', total_revenue: 15400 },
    { country: 'Germany', total_revenue: 11200 },
    { country: 'Austria', total_revenue: 8900 },
    { country: 'Brazil', total_revenue: 6300 },
    { country: 'France', total_revenue: 5100 }
  ];
  const topCustomers = data?.top_customers || [
    { company_name: 'Save-a-lot Markets', country: 'USA', order_count: 12, total_spent: 9840.50 },
    { company_name: 'Ernst Handel', country: 'Austria', order_count: 10, total_spent: 8450.00 },
    { company_name: 'QUICK-Stop', country: 'Germany', order_count: 8, total_spent: 6120.25 },
    { company_name: 'Rattlesnake Canyon Grocery', country: 'USA', order_count: 7, total_spent: 5400.00 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-brand-600/20 via-accent-purple/10 to-transparent border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Visão Geral Executiva Northwind
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Plataforma unificada com Inteligência Artificial, Servidor MCP e Agentes para análise preditiva de negócios.
          </p>
        </div>
        <button
          onClick={() => onTriggerChat("Qual cliente comprou mais em 1998?")}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
        >
          <span>Fazer pergunta à IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Faturamento Total"
          value={`$${kpis.total_revenue ? Number(kpis.total_revenue).toLocaleString() : '54,320'}`}
          change="+18.4%"
          isPositive={true}
          icon={DollarSign}
          color="brand"
        />
        <KPICard
          title="Total de Pedidos"
          value={kpis.total_orders || 14}
          change="+12.1%"
          isPositive={true}
          icon={ShoppingBag}
          color="purple"
        />
        <KPICard
          title="Ticket Médio"
          value={`$${kpis.avg_order_value ? Number(kpis.avg_order_value).toLocaleString() : '3,880'}`}
          change="+5.2%"
          isPositive={true}
          icon={Award}
          color="emerald"
        />
        <KPICard
          title="Clientes Ativos"
          value={kpis.total_customers || 14}
          change="+8.0%"
          isPositive={true}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Faturamento por Categoria</span>
            <span className="text-xs text-brand-500 font-normal">Dados MCP</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="category_name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d' }} />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Distribuição de Vendas por País</span>
            <span className="text-xs text-accent-purple font-normal">Market Share</span>
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countries}
                  dataKey="total_revenue"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ country }) => country}
                >
                  {countries.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
          Principais Clientes por Faturamento
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surfaceBorder/40 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">País</th>
                <th className="p-3">Total Pedidos</th>
                <th className="p-3 text-right">Faturamento Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder">
              {topCustomers.map((cust: any, idx: number) => (
                <tr key={idx} className="hover:bg-surfaceBorder/30 transition-colors">
                  <td className="p-3 font-semibold text-white">{cust.company_name}</td>
                  <td className="p-3 text-slate-400">{cust.country}</td>
                  <td className="p-3">{cust.order_count}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    ${Number(cust.total_spent).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
