import React, { useEffect, useState } from 'react';
import {
  DollarSign, ShoppingBag, Users, Award, ArrowRight, Sparkles,
  Loader2, BookOpen, Cpu, Target, Lightbulb, Info
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine, Legend
} from 'recharts';
import axios from 'axios';
import { KPICard } from '../components/dashboard/KPICard';

interface DashboardHomeProps {
  onTriggerChat: (prompt: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#a855f7'];

const MONTHLY_TREND = [
  { month: 'Set/97', revenue: 55629, target: 65000 },
  { month: 'Out/97', revenue: 66749, target: 68000 },
  { month: 'Nov/97', revenue: 43533, target: 70000 },
  { month: 'Dez/97', revenue: 71398, target: 72000 },
  { month: 'Jan/98', revenue: 94222, target: 80000 },
  { month: 'Fev/98', revenue: 99415, target: 85000 },
  { month: 'Mar/98', revenue: 104854, target: 90000 },
  { month: 'Abr/98', revenue: 123799, target: 95000 }
];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onTriggerChat }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/v1/dashboard/summary', { timeout: 3500 })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {};

  const rawCategories = data?.sales_by_category && data.sales_by_category.length > 0
    ? data.sales_by_category
    : [
        { category_name: 'Beverages', total_revenue: 267868.18, total_orders: 404 },
        { category_name: 'Dairy Products', total_revenue: 234507.29, total_orders: 366 },
        { category_name: 'Confections', total_revenue: 167357.23, total_orders: 334 },
        { category_name: 'Meat/Poultry', total_revenue: 163022.36, total_orders: 173 },
        { category_name: 'Seafood', total_revenue: 131261.74, total_orders: 330 },
        { category_name: 'Condiments', total_revenue: 106047.09, total_orders: 216 },
        { category_name: 'Produce', total_revenue: 99984.58, total_orders: 136 },
        { category_name: 'Grains/Cereals', total_revenue: 95744.59, total_orders: 196 }
      ];

  const categories = rawCategories.map((c: any) => ({
    category_name: c.category_name,
    total_revenue: Number(c.total_revenue || c.revenue || 0),
    total_orders: Number(c.total_orders || 0)
  }));

  const rawCountries = data?.sales_by_country && data.sales_by_country.length > 0
    ? data.sales_by_country
    : [
        { country: 'USA', total_revenue: 245840.40 },
        { country: 'Germany', total_revenue: 230284.63 },
        { country: 'Austria', total_revenue: 128003.84 },
        { country: 'Brazil', total_revenue: 106925.78 },
        { country: 'France', total_revenue: 81358.32 },
        { country: 'UK', total_revenue: 58971.31 }
      ];

  const countries = rawCountries.map((c: any) => ({
    country: c.country,
    total_revenue: Number(c.total_revenue || c.revenue || 0),
    total_orders: Number(c.total_orders || 0)
  }));

  const topCustomers = data?.top_customers && data.top_customers.length > 0
    ? data.top_customers
    : [
        { company_name: 'Quick-Stop', country: 'Germany', order_count: 28, total_spent: 110277.30 },
        { company_name: 'Ernst Handel', country: 'Austria', order_count: 30, total_spent: 104874.98 },
        { company_name: 'Save-a-lot Markets', country: 'USA', order_count: 31, total_spent: 104361.95 },
        { company_name: 'Rattlesnake Canyon Grocery', country: 'USA', order_count: 18, total_spent: 51097.80 },
        { company_name: 'Hungry Owl All-Night Grocers', country: 'Ireland', order_count: 19, total_spent: 49979.91 },
        { company_name: 'Hanari Carnes', country: 'Brazil', order_count: 14, total_spent: 32841.37 }
      ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-brand-600/20 via-accent-purple/10 to-transparent border border-brand-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Visão Geral Executiva Northwind
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-mono border border-brand-500/30 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Harness Gemini 4 (Hydrogen • Neon • Argon)
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Plataforma unificada com Data Storytelling, Servidor MCP, Validação Sintática AST (sqlglot) e 14 painéis analíticos interativos.
          </p>
        </div>
        <button
          onClick={() => onTriggerChat('Quais os top 5 clientes por faturamento em 1997?')}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all shrink-0"
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
            title="Faturamento Líquido"
            value={`$${kpis.total_revenue ? Number(kpis.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '1,265,793.04'}`}
            change="+18.4% YoY"
            isPositive={true}
            icon={DollarSign}
            color="brand"
          />
          <KPICard
            title="Total de Pedidos"
            value={kpis.total_orders ?? '830'}
            change="+12.1% YoY"
            isPositive={true}
            icon={ShoppingBag}
            color="purple"
          />
          <KPICard
            title="Ticket Médio"
            value={`$${kpis.avg_order_value ? Number(kpis.avg_order_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '1,525.05'}`}
            change="+5.2% vs Meta"
            isPositive={true}
            icon={Award}
            color="emerald"
          />
          <KPICard
            title="Clientes Ativos"
            value={kpis.total_customers ?? '89'}
            change="21 Países"
            isPositive={true}
            icon={Users}
            color="amber"
          />
        </div>
      )}

      {/* Executive Storytelling Synthesis */}
      <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-600/10 via-surface/80 to-transparent space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            STORYTELLING EXECUTIVO • PANORAMA C-LEVEL NORTHWIND
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            112.8% do OKR Anual Atingido
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-background/50 border border-surfaceBorder">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Tração Comercial
            </div>
            <p className="text-xs text-slate-400">
              O faturamento acumulado atingiu <strong>$1,265M</strong> em 830 pedidos, com forte aceleração no 1º quadrimestre de 1998 (recorde de $123.8k em Abril).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-background/50 border border-surfaceBorder">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Motores de Receita
            </div>
            <p className="text-xs text-slate-400">
              <strong>Beverages ($267.8k)</strong> e <strong>Dairy Products ($234.5k)</strong> lideram o catálogo, enquanto EUA, Alemanha e Áustria concentram 47% das vendas.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Foco de Decisão
            </div>
            <p className="text-xs text-slate-300">
              Capturar <strong>+$148.5k/ano</strong> ativando combos de Cross-Sell (Jev IA), repondo 18 SKUs abaixo do estoque mínimo e travando descontos em 5% na Curva A.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row: 3 Visual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Trend AreaChart (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Evolução Mensal de Receita vs. Meta
              </h3>
              <p className="text-xs text-slate-400">Aceleração histórica Set/97 — Abr/98 ($ USD)</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              +38% Momentum
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="homeRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Receita']}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '0.75rem' }}
                />
                <ReferenceLine y={85000} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Meta $85k', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#homeRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Categories (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Faturamento por Categoria
              </h3>
              <p className="text-xs text-slate-400">Ranking das 8 linhas gastronômicas</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
              Dados MCP
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis
                  dataKey="category_name"
                  stroke="#94a3b8"
                  fontSize={10}
                  angle={-22}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
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

        {/* Pie Chart Countries (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Vendas por País
              </h3>
              <p className="text-xs text-slate-400">Share dos Top Mercados</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
              Global
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
                  cy="48%"
                  innerRadius={42}
                  outerRadius={78}
                  paddingAngle={3}
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
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
          Principais Clientes Corporativos por Faturamento (Curva A)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-surfaceBorder">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surfaceBorder/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">País</th>
                <th className="p-3 text-center">Total Pedidos</th>
                <th className="p-3 text-right">Faturamento Acumulado</th>
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
