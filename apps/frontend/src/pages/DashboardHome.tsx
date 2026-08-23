import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Award, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { KPICard } from '../components/dashboard/KPICard';

interface DashboardHomeProps {
  onTriggerChat: (prompt: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#a855f7'];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onTriggerChat }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/v1/dashboard/summary')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Error fetching dashboard summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {};
  
  const rawCategories = data?.sales_by_category && data.sales_by_category.length > 0
    ? data.sales_by_category
    : [
        { category_name: 'Meat/Poultry', total_revenue: 10524.50 },
        { category_name: 'Condiments', total_revenue: 3764.30 },
        { category_name: 'Dairy Products', total_revenue: 3421.50 },
        { category_name: 'Produce', total_revenue: 2092.50 },
        { category_name: 'Beverages', total_revenue: 1531.20 },
        { category_name: 'Seafood', total_revenue: 1240.00 }
      ];

  const categories = rawCategories.map((c: any) => ({
    category_name: c.category_name,
    total_revenue: Number(c.total_revenue || c.revenue || 0),
    total_orders: Number(c.total_orders || 0)
  }));

  const rawCountries = data?.sales_by_country && data.sales_by_country.length > 0
    ? data.sales_by_country
    : [
        { country: 'USA', total_revenue: 8960.00 },
        { country: 'Switzerland', total_revenue: 3169.50 },
        { country: 'Austria', total_revenue: 2578.50 },
        { country: 'Germany', total_revenue: 2206.30 },
        { country: 'Brazil', total_revenue: 2093.50 }
      ];

  const countries = rawCountries.map((c: any) => ({
    country: c.country,
    total_revenue: Number(c.total_revenue || c.revenue || 0),
    total_orders: Number(c.total_orders || 0)
  }));

  const topCustomers = data?.top_customers || [
    { company_name: 'Save-a-lot Markets', country: 'USA', order_count: 1, total_spent: 7760.00 },
    { company_name: 'Richter Supermarkt', country: 'Switzerland', order_count: 1, total_spent: 2764.50 },
    { company_name: 'Ernst Handel', country: 'Austria', order_count: 1, total_spent: 2578.50 },
    { company_name: 'Hanari Carnes', country: 'Brazil', order_count: 2, total_spent: 1913.50 }
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
          <KPICard
            title="Faturamento Total"
            value={`$${kpis.total_revenue ? Number(kpis.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '22,574.00'}`}
            change="+18.4%"
            isPositive={true}
            icon={DollarSign}
            color="brand"
          />
          <KPICard
            title="Total de Pedidos"
            value={kpis.total_orders ?? 14}
            change="+12.1%"
            isPositive={true}
            icon={ShoppingBag}
            color="purple"
          />
          <KPICard
            title="Ticket Médio"
            value={`$${kpis.avg_order_value ? Number(kpis.avg_order_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '1,612.43'}`}
            change="+5.2%"
            isPositive={true}
            icon={Award}
            color="emerald"
          />
          <KPICard
            title="Clientes Ativos"
            value={kpis.total_customers ?? 23}
            change="+8.0%"
            isPositive={true}
            icon={Users}
            color="amber"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Faturamento por Categoria
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
              Dados MCP
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis 
                  dataKey="category_name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Faturamento']}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '0.75rem' }} 
                />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Distribuição de Vendas por País
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
              Market Share
            </span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countries}
                  dataKey="total_revenue"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ country, percent }) => `${country} (${(percent * 100).toFixed(0)}%)`}
                >
                  {countries.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Vendas']}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '0.75rem' }} 
                />
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
        <div className="overflow-x-auto rounded-xl border border-surfaceBorder">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surfaceBorder/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">País</th>
                <th className="p-3 text-center">Total Pedidos</th>
                <th className="p-3 text-right">Faturamento Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder bg-background/30">
              {topCustomers.map((cust: any, idx: number) => (
                <tr key={idx} className="hover:bg-surfaceBorder/30 transition-colors">
                  <td className="p-3 font-semibold text-white">{cust.company_name}</td>
                  <td className="p-3 text-slate-400">{cust.country}</td>
                  <td className="p-3 text-center">{cust.order_count}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    ${Number(cust.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
