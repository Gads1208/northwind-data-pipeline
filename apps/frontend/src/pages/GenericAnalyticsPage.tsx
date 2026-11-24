import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles, Bot, Download, ArrowUpRight, Loader2,
  Users, ShoppingBag, DollarSign, Award, ShoppingCart, Package,
  UserCheck, Layers, Truck, TrendingUp, Globe, Settings, LucideIcon,
  Search, BookOpen, Lightbulb, Target, Cpu, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ComposedChart,
  ReferenceLine, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import axios from 'axios';
import { KPICard } from '../components/dashboard/KPICard';
import { NORTHWIND_TAB_BLUEPRINTS, TabAnalyticsBlueprint, ChartConfig } from '../data/northwindStorytellingData';

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

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e', '#ec4899', '#a855f7'];

const TIER_BADGE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'deterministic-template': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'Nível 0 • Zero-LLM Template'
  },
  'gemini-4-hydrogen': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    label: 'Tier Baixo • gemini-4-hydrogen'
  },
  'gemini-4-neon': {
    bg: 'bg-brand-500/10',
    text: 'text-brand-400',
    border: 'border-brand-500/30',
    label: 'Tier Médio • gemini-4-neon'
  },
  'gemini-4-argon': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    label: 'Tier Alto • gemini-4-argon'
  }
};

export const GenericAnalyticsPage: React.FC<GenericAnalyticsPageProps> = ({ pageId, title, onTriggerChat }) => {
  const [apiData, setApiData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'top' | 'focus'>('all');
  const [primaryChartType, setPrimaryChartType] = useState<'default' | 'bar' | 'area' | 'composed' | 'line'>('default');
  const [secondaryChartType, setSecondaryChartType] = useState<'default' | 'bar' | 'pie' | 'radar'>('default');

  const blueprint: TabAnalyticsBlueprint = useMemo(() => {
    return NORTHWIND_TAB_BLUEPRINTS[pageId] || NORTHWIND_TAB_BLUEPRINTS.customers;
  }, [pageId]);

  useEffect(() => {
    setApiData(null);
    setSearchTerm('');
    setSegmentFilter('all');
    setPrimaryChartType('default');
    setSecondaryChartType('default');

    axios.get(`/api/v1/dashboard/context/${pageId}`, { timeout: 2500 })
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.kpis) && res.data.kpis.length > 0) {
          setApiData(res.data);
        }
      })
      .catch(() => {
        // Usa instantaneamente o catálogo analítico embutido quando sem container backend no Render
      });
  }, [pageId]);

  const kpis = apiData?.kpis && apiData.kpis.length > 0 ? apiData.kpis : blueprint.kpis;
  const tableData = apiData?.table && apiData.table.rows && apiData.table.rows.length > 0
    ? apiData.table
    : blueprint.table;
  const story = blueprint.storytelling;
  const tierMeta = TIER_BADGE_STYLES[story.harnessModel] || TIER_BADGE_STYLES['gemini-4-neon'];

  // Filtra dados do gráfico primário conforme o filtro de storytelling selecionado
  const filteredPrimaryData = useMemo(() => {
    const raw = blueprint.primaryChart.data;
    if (segmentFilter === 'all') return raw;
    if (segmentFilter === 'top') {
      const topItems = raw.filter((d) => d.segment === 'top');
      return topItems.length > 0 ? topItems : raw.slice(0, 4);
    }
    const focusItems = raw.filter((d) => d.segment === 'growth' || d.segment === 'risk');
    return focusItems.length > 0 ? focusItems : raw.slice(-4);
  }, [blueprint, segmentFilter]);

  const filteredRows = useMemo(() => {
    return (tableData.rows || []).filter((row: any) => {
      if (!searchTerm) return true;
      return Object.values(row).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [tableData, searchTerm]);

  const formatMetricValue = (val: any, prefix = '', suffix = '') => {
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (prefix === '$') {
      return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    return `${prefix}${num.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`;
  };

  const formatAxisTick = (val: any, prefix = '', suffix = '') => {
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (Math.abs(num) >= 1000) {
      return `${prefix}${(num / 1000).toFixed(0)}k${suffix}`;
    }
    return `${prefix}${num}${suffix}`;
  };

  const exportCSV = () => {
    if (!tableData.rows || !tableData.rows.length) return;
    const cols = tableData.columns.map((c: any) => c.key);
    const headers = tableData.columns.map((c: any) => `"${c.label}"`).join(',');
    const rows = filteredRows.map((r: any) =>
      cols.map((col: string) => `"${r[col] ?? ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `northwind_${pageId}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDynamicChart = (
    cfg: ChartConfig,
    dataset: Record<string, any>[],
    overrideType: string
  ) => {
    const activeType = overrideType === 'default' ? cfg.defaultType : overrideType;
    const prefix = cfg.unitPrefix || '';
    const suffix = cfg.unitSuffix || '';

    if (activeType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataset}
              dataKey={cfg.primaryKey}
              nameKey={cfg.xKey}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={92}
              paddingAngle={3}
              label={({ name, percent }: any) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
            >
              {dataset.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [formatMetricValue(val, prefix, suffix), cfg.primaryLabel]}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={dataset}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey={cfg.xKey} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar
              name={cfg.primaryLabel}
              dataKey={cfg.primaryKey}
              stroke={cfg.primaryColor}
              fill={cfg.primaryColor}
              fillOpacity={0.45}
            />
            {cfg.secondaryKey && (
              <Radar
                name={cfg.secondaryLabel || cfg.secondaryKey}
                dataKey={cfg.secondaryKey}
                stroke={cfg.secondaryColor || '#8b5cf6'}
                fill={cfg.secondaryColor || '#8b5cf6'}
                fillOpacity={0.2}
              />
            )}
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataset} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <defs>
              <linearGradient id={`gradPrimary_${pageId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.primaryColor} stopOpacity={0.45} />
                <stop offset="95%" stopColor={cfg.primaryColor} stopOpacity={0.02} />
              </linearGradient>
              {cfg.secondaryKey && (
                <linearGradient id={`gradSecondary_${pageId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.secondaryColor || '#10b981'} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={cfg.secondaryColor || '#10b981'} stopOpacity={0.02} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey={cfg.xKey} stroke="#94a3b8" fontSize={11} angle={-12} textAnchor="end" />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => formatAxisTick(v, prefix, suffix)}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                name === cfg.primaryLabel ? formatMetricValue(val, prefix, suffix) : Number(val).toLocaleString('pt-BR'),
                name
              ]}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {cfg.referenceTarget && (
              <ReferenceLine
                y={cfg.referenceTarget.value}
                stroke={cfg.referenceTarget.color}
                strokeDasharray="4 4"
                label={{ value: cfg.referenceTarget.label, fill: cfg.referenceTarget.color, fontSize: 10, position: 'insideTopRight' }}
              />
            )}
            <Area
              type="monotone"
              dataKey={cfg.primaryKey}
              name={cfg.primaryLabel}
              stroke={cfg.primaryColor}
              strokeWidth={2.5}
              fill={`url(#gradPrimary_${pageId})`}
            />
            {cfg.secondaryKey && (
              <Area
                type="monotone"
                dataKey={cfg.secondaryKey}
                name={cfg.secondaryLabel || cfg.secondaryKey}
                stroke={cfg.secondaryColor || '#10b981'}
                strokeWidth={2}
                fill={`url(#gradSecondary_${pageId})`}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataset} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey={cfg.xKey} stroke="#94a3b8" fontSize={11} angle={-12} textAnchor="end" />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatAxisTick(v, prefix, suffix)} />
            <Tooltip
              formatter={(val: any, name: any) => [
                name === cfg.primaryLabel ? formatMetricValue(val, prefix, suffix) : Number(val).toLocaleString('pt-BR'),
                name
              ]}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {cfg.referenceTarget && (
              <ReferenceLine
                y={cfg.referenceTarget.value}
                stroke={cfg.referenceTarget.color}
                strokeDasharray="4 4"
                label={{ value: cfg.referenceTarget.label, fill: cfg.referenceTarget.color, fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey={cfg.primaryKey}
              name={cfg.primaryLabel}
              stroke={cfg.primaryColor}
              strokeWidth={3}
              dot={{ r: 4, fill: cfg.primaryColor }}
            />
            {cfg.secondaryKey && (
              <Line
                type="monotone"
                dataKey={cfg.secondaryKey}
                name={cfg.secondaryLabel || cfg.secondaryKey}
                stroke={cfg.secondaryColor || '#10b981'}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: cfg.secondaryColor || '#10b981' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'composed' && cfg.secondaryKey) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataset} margin={{ top: 12, right: 16, left: 4, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey={cfg.xKey} stroke="#94a3b8" fontSize={11} angle={-14} textAnchor="end" interval={0} />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => formatAxisTick(v, prefix, suffix)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={cfg.secondaryColor || '#10b981'}
              fontSize={11}
              tickFormatter={(v) => formatAxisTick(v, '', '')}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                name === cfg.primaryLabel ? formatMetricValue(val, prefix, suffix) : Number(val).toLocaleString('pt-BR'),
                name
              ]}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {cfg.referenceTarget && (
              <ReferenceLine
                yAxisId="left"
                y={cfg.referenceTarget.value}
                stroke={cfg.referenceTarget.color}
                strokeDasharray="4 4"
                label={{ value: cfg.referenceTarget.label, fill: cfg.referenceTarget.color, fontSize: 10, position: 'insideTopRight' }}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey={cfg.primaryKey}
              name={cfg.primaryLabel}
              fill={cfg.primaryColor}
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={cfg.secondaryKey}
              name={cfg.secondaryLabel || cfg.secondaryKey}
              stroke={cfg.secondaryColor || '#10b981'}
              strokeWidth={2.5}
              dot={{ r: 4, fill: cfg.secondaryColor || '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    // Default BarChart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataset} margin={{ top: 12, right: 16, left: 4, bottom: 22 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey={cfg.xKey} stroke="#94a3b8" fontSize={11} angle={-14} textAnchor="end" interval={0} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatAxisTick(v, prefix, suffix)} />
          <Tooltip
            formatter={(val: any, name: any) => [
              name === cfg.primaryLabel ? formatMetricValue(val, prefix, suffix) : Number(val).toLocaleString('pt-BR'),
              name
            ]}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {cfg.referenceTarget && (
            <ReferenceLine
              y={cfg.referenceTarget.value}
              stroke={cfg.referenceTarget.color}
              strokeDasharray="4 4"
              label={{ value: cfg.referenceTarget.label, fill: cfg.referenceTarget.color, fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Bar dataKey={cfg.primaryKey} name={cfg.primaryLabel} fill={cfg.primaryColor} radius={[6, 6, 0, 0]} />
          {cfg.secondaryKey && activeType === 'bar' && (
            <Bar
              dataKey={cfg.secondaryKey}
              name={cfg.secondaryLabel || cfg.secondaryKey}
              fill={cfg.secondaryColor || '#10b981'}
              radius={[6, 6, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title & Harness Routing Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white">{title}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-mono border border-brand-500/20 uppercase">
              /{pageId}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono border flex items-center gap-1.5 ${tierMeta.bg} ${tierMeta.text} ${tierMeta.border}`}>
              <Cpu className="w-3 h-3" />
              {tierMeta.label} (effort: {story.harnessEffort})
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              FinOps: -{story.tokenSavingsPct}% tokens
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Análise governada pela skill <code className="text-brand-400 font-mono">{story.harnessSkill}</code> via <strong>Model Context Protocol (MCP)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTriggerChat(blueprint.suggestedPrompts[0])}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-purple text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:opacity-95 transition-opacity"
          >
            <Bot className="w-4 h-4" />
            <span>Explorar {title} com IA</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
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

      {/* Executive Data Storytelling Narrative Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-600/10 via-surface/80 to-purple-900/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-surfaceBorder pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              {story.badge}
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              {story.headline}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {blueprint.suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onTriggerChat(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface/90 hover:bg-brand-600/20 text-slate-300 hover:text-white border border-surfaceBorder hover:border-brand-500/40 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[210px]">{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Storytelling Pillars: Context -> Key Finding -> Actionable Decision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-surfaceBorder space-y-1.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              1. Contexto &amp; Cenário
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{story.storyContext}</p>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-surfaceBorder space-y-1.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              2. Descoberta &amp; Impacto
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{story.keyFinding}</p>
            <p className="text-[11px] text-amber-300/90 font-medium pt-1">
              Impacto: {story.businessImpact}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              3. Decisão Recomendada
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{story.recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar for Dynamic Visual Exploration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface/60 p-3.5 rounded-xl border border-surfaceBorder">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Recorte Analítico:</span>
          {[
            { id: 'all', label: 'Visão Completa' },
            { id: 'top', label: '🏆 Top Performers (Curva A)' },
            { id: 'focus', label: '⚡ Crescimento & Atenção' }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSegmentFilter(seg.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                segmentFilter === seg.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-background/60 text-slate-400 hover:text-slate-200 border border-surfaceBorder'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Visualização Principal:</span>
          {[
            { id: 'default', label: 'Recomendado IA' },
            { id: 'composed', label: 'Composto' },
            { id: 'bar', label: 'Barras' },
            { id: 'area', label: 'Área' },
            { id: 'line', label: 'Linha' }
          ].map((ct) => (
            <button
              key={ct.id}
              onClick={() => setPrimaryChartType(ct.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                primaryChartType === ct.id
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40 font-semibold'
                  : 'bg-background/40 text-slate-400 hover:text-slate-200 border border-surfaceBorder'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Chart (7 columns) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                {blueprint.primaryChart.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {blueprint.primaryChart.subtitle}
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20 shrink-0">
              {blueprint.primaryChart.badge}
            </span>
          </div>

          <div className="h-80 w-full">
            {renderDynamicChart(blueprint.primaryChart, filteredPrimaryData, primaryChartType)}
          </div>
        </div>

        {/* Secondary Chart (5 columns) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                {blueprint.secondaryChart.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {blueprint.secondaryChart.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(['default', 'bar', 'pie'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSecondaryChartType(t)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    secondaryChartType === t
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                      : 'bg-background/40 text-slate-500 border-surfaceBorder hover:text-slate-300'
                  }`}
                >
                  {t === 'default' ? 'Auto' : t === 'bar' ? 'Barras' : 'Donut'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            {renderDynamicChart(blueprint.secondaryChart, blueprint.secondaryChart.data, secondaryChartType)}
          </div>
        </div>
      </div>

      {/* 3 Strategic Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blueprint.highlights.map((hl, idx) => {
          const isPos = hl.status === 'positive';
          const isCrit = hl.status === 'critical';
          const isWarn = hl.status === 'warning';
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3.5 ${
                isPos
                  ? 'bg-emerald-950/15 border-emerald-500/25'
                  : isCrit
                  ? 'bg-rose-950/15 border-rose-500/25'
                  : isWarn
                  ? 'bg-amber-950/15 border-amber-500/25'
                  : 'bg-cyan-950/15 border-cyan-500/25'
              }`}
            >
              <div className="mt-0.5">
                {isPos ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCrit || isWarn ? (
                  <AlertTriangle className={`w-5 h-5 ${isCrit ? 'text-rose-400' : 'text-amber-400'}`} />
                ) : (
                  <Info className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {hl.label}
                </span>
                <div className="text-base font-extrabold text-white mt-0.5">{hl.value}</div>
                <p className="text-xs text-slate-400 mt-1">{hl.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Card: Data Table Preview */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Base Analítica Detalhada — {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros auditados da camada Gold (Star Schema dbt) via Servidor MCP.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-200 text-xs focus:outline-none focus:border-brand-500 w-full sm:w-48"
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
          <h4 className="text-base font-bold text-white">Aprofundar Storytelling de {title} com o Harness Multi-Agente</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            O Agente Orquestrador selecionará automaticamente o tier ideal (<code>{story.harnessModel}</code>), validará a query SQL via AST (<code>sqlglot</code>) e gerará gráficos e recomendações sob medida.
          </p>
          <button
            onClick={() => onTriggerChat(blueprint.suggestedPrompts[0])}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-all shadow-md"
          >
            <span>Executar Consulta Sugerida: "{blueprint.suggestedPrompts[0]}"</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
