import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Code2, Table as TableIcon, BarChart2, Lightbulb, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  sql?: string;
  data?: any[];
  visualization?: any;
  insights?: string[];
  documentation?: any;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

export const ContextualChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, activeTab }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Olá! Sou o assistente de IA da Northwind. Atualmente estou sincronizado com a página **${activeTab.toUpperCase()}**.\nPergunte-me qualquer coisa em linguagem natural!`,
      insights: [
        `Contexto ativo: ${activeTab}`,
        'Consultas executadas de forma segura via Servidor MCP.'
      ]
    }
  ]);

  const quickPrompts = [
    "Qual cliente comprou mais em 1998?",
    "Quais vendedores tiveram maior faturamento?",
    "Qual categoria vende mais?",
    "Quais produtos estão parados?"
  ];

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/v1/chat/message', {
        message: queryText,
        page_context: activeTab,
        session_id: 'user-session-1'
      });

      const payload = res.data;
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: payload.text || 'Consulta processada.',
        sql: payload.sql,
        data: payload.data,
        visualization: payload.visualization,
        insights: payload.insights,
        documentation: payload.documentation
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'Desculpe, ocorreu uma falha ao conectar com o serviço de IA ou Servidor MCP.',
          insights: ['Verifique a conexão com os containers no Docker Compose.']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-[#0d1322] border-l border-surfaceBorder z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-surfaceBorder bg-surface/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              Assistente de IA & MCP
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-mono">
                {activeTab}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Multi-Agente Especializado Northwind</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surfaceBorder">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                  : 'bg-surface border border-surfaceBorder text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

              {/* SQL Code snippet */}
              {msg.sql && (
                <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-surfaceBorder font-mono text-xs text-brand-500 overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                    <Code2 className="w-3 h-3 text-brand-500" />
                    SQL Gerado pelo Agente:
                  </div>
                  {msg.sql}
                </div>
              )}

              {/* Dynamic Chart rendering */}
              {msg.visualization?.spec?.series?.[0]?.data && (
                <div className="mt-4 p-3 rounded-xl bg-background/60 border border-surfaceBorder">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                    <BarChart2 className="w-3.5 h-3.5 text-accent-cyan" />
                    {msg.visualization.spec.title || 'Visualização Recomendada'}
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {msg.visualization.recommended_chart === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={msg.visualization.spec.x_axis.map((lbl: string, idx: number) => ({
                              name: lbl,
                              value: msg.visualization.spec.series[0].data[idx]
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                          >
                            {msg.visualization.spec.x_axis.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d' }} />
                        </PieChart>
                      ) : (
                        <BarChart data={msg.visualization.spec.x_axis.map((lbl: string, idx: number) => ({
                          label: lbl.length > 12 ? lbl.substring(0, 10) + '...' : lbl,
                          value: msg.visualization.spec.series[0].data[idx]
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                          <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d' }} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data Table */}
              {msg.data && msg.data.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-surfaceBorder">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-surfaceBorder/50 text-slate-400 uppercase text-[10px]">
                      <tr>
                        {Object.keys(msg.data[0]).map((k) => (
                          <th key={k} className="px-3 py-1.5">{k.replace('_', ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surfaceBorder">
                      {msg.data.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-surfaceBorder/20">
                          {Object.values(row).map((val: any, vidx) => (
                            <td key={vidx} className="px-3 py-1.5 truncate max-w-[120px]">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {msg.data.length > 5 && (
                    <div className="p-1 text-center text-[10px] text-slate-500 bg-surface/30">
                      Mostrando 5 de {msg.data.length} linhas
                    </div>
                  )}
                </div>
              )}

              {/* Business Insights */}
              {msg.insights && msg.insights.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-amber-400 text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Insights Gerados pelo Agente:
                  </div>
                  {msg.insights.map((ins, i) => (
                    <p key={i} className="text-slate-300 leading-snug">{ins}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-brand-500 p-3 rounded-xl bg-surface border border-surfaceBorder animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Agentes processando requisição via MCP...
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-surfaceBorder bg-surface/40 flex flex-wrap gap-1.5">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-surface hover:bg-surfaceBorder text-slate-300 border border-surfaceBorder hover:border-brand-500/40 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-surfaceBorder bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pergunte sobre ${activeTab}...`}
            className="flex-1 bg-background border border-surfaceBorder rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
