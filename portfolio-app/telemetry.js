/**
 * ============================================================================
 * GUILHERME.DATA&AI — Portfolio Telemetry & Access Tracker (telemetry.js)
 * ============================================================================
 * Rastreia automaticamente:
 *  1. Acessos ao portfólio (Pageviews, Visitantes Únicos e Sessões)
 *  2. Quais páginas/seções e abas foram acessadas dentro do portfólio
 *  3. Cliques em projetos em produção (Northwind BI, Car Price AI, Bot Telegram, Loja Jev IA, GitDigest, GitHub)
 *  4. Cliques em canais de contato (LinkedIn, WhatsApp, E-mail, GitHub)
 *  5. Origem do tráfego (Referrer + parâmetros ?utm_source=linkedin, curriculo, github, etc.)
 *  6. Tempo de permanência ativo na sessão
 *
 * Arquitetura Híbrida:
 *  - Envia para a API Backend Python/SQLite (/api/analytics/event) quando disponível
 *  - Sincroniza instantaneamente no LocalStorage + BroadcastChannel (funciona mesmo em hospedagem 100% estática)
 *  - Suporta integração opcional com Supabase REST API
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'nw_portfolio_telemetry_events_v1';
  const VISITOR_KEY = 'nw_portfolio_visitor_id_v1';
  const SESSION_KEY = 'nw_portfolio_session_id_v1';
  const CONFIG_KEY = 'nw_portfolio_telemetry_config_v1';
  const MAX_LOCAL_EVENTS = 1500;

  // Mapeamento amigável das páginas/seções do portfólio
  const SECTION_LABELS = {
    'hero': { name: 'Início (Hero Executivo)', path: '/#hero', category: 'Página / Seção' },
    'flagship': { name: 'Northwind BI (Flagship Case)', path: '/#flagship', category: 'Projeto' },
    'tab-overview': { name: 'Northwind • Visão Geral & Valor', path: '/#flagship/overview', category: 'Aba Interativa' },
    'tab-architecture': { name: 'Northwind • Arquitetura Medallion & MCP', path: '/#architecture', category: 'Aba Interativa' },
    'tab-simulator': { name: 'Northwind • Simulador Multi-Agente IA', path: '/#simulator', category: 'Aba Interativa' },
    'tab-challenges': { name: 'Northwind • Desafios Técnicos & AST', path: '/#flagship/challenges', category: 'Aba Interativa' },
    'car-price-ai': { name: 'Car Price AI (Redes Neurais)', path: '/#car-price-ai', category: 'Projeto' },
    'telegram-bot': { name: 'Bot Telegram (OpenClaw + Gemini)', path: '/#telegram-bot', category: 'Projeto' },
    'northwind-jev-store': { name: 'Loja Jev IA (E-Commerce)', path: '/#northwind-jev-store', category: 'Projeto' },
    'gitdigest': { name: 'GitDigest (Auditoria Git & PDF)', path: '/#gitdigest', category: 'Projeto' },
    'skills': { name: 'Habilidades & Stack Técnica', path: '/#skills', category: 'Página / Seção' },
    'about': { name: 'Sobre Mim & Trajetória Profissional', path: '/#about', category: 'Página / Seção' },
    'contact': { name: 'Contato & Redes Sociais', path: '/#contact', category: 'Página / Seção' }
  };

  // Canal em tempo real entre abas (ex: Portfólio aberto numa aba e Dashboard noutra)
  const channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('nw_portfolio_analytics_channel')
    : null;

  function generateId(prefix) {
    return `${prefix}_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36).slice(-4)}`;
  }

  function getVisitorId() {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = generateId('vis');
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  }

  function getSessionId() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateId('sess');
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  function detectDeviceAndBrowser() {
    const ua = navigator.userAgent || '';
    let device = 'Desktop';
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = 'Mobile';
    else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

    let os = 'Outro';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS|Macintosh/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Navegador';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\//i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';

    return {
      device,
      os,
      browser,
      screen: `${window.screen.width}x${window.screen.height}`
    };
  }

  function detectTrafficSource() {
    const params = new URLSearchParams(window.location.search);
    const utmSource = (params.get('utm_source') || params.get('ref') || params.get('source') || '').toLowerCase();
    const utmMedium = (params.get('utm_medium') || '').toLowerCase();
    const ref = (document.referrer || '').toLowerCase();

    if (utmSource) {
      if (utmSource.includes('linkedin')) return 'LinkedIn';
      if (utmSource.includes('cv') || utmSource.includes('curriculo') || utmSource.includes('pdf') || utmSource.includes('resume')) return 'Currículo (PDF)';
      if (utmSource.includes('github') || utmSource.includes('git')) return 'GitHub';
      if (utmSource.includes('whatsapp') || utmSource.includes('wpp')) return 'WhatsApp';
      if (utmSource.includes('email') || utmSource.includes('mail')) return 'E-mail';
      if (utmSource.includes('recrutador') || utmSource.includes('rh')) return 'Link Recrutador';
      return `UTM: ${utmSource}`;
    }

    if (!ref) return 'Acesso Direto';
    if (ref.includes('linkedin.com')) return 'LinkedIn';
    if (ref.includes('github.com')) return 'GitHub';
    if (ref.includes('google.')) return 'Google Search';
    if (ref.includes('whatsapp.com') || ref.includes('wa.me')) return 'WhatsApp';
    if (ref.includes('t.me') || ref.includes('telegram.org')) return 'Telegram';
    if (ref.includes(window.location.host)) return 'Navegação Interna';

    try {
      const url = new URL(document.referrer);
      return url.hostname.replace(/^www\./, '');
    } catch (_) {
      return 'Referência Externa';
    }
  }

  function saveEventLocally(eventPayload) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(eventPayload);
      if (list.length > MAX_LOCAL_EVENTS) {
        list.splice(0, list.length - MAX_LOCAL_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      if (channel) {
        channel.postMessage({ type: 'NEW_EVENT', event: eventPayload });
      }
    } catch (err) {
      // Ignora erro de quota do localStorage silenciosamente
    }
  }

  async function sendEventToServer(eventPayload) {
    // 1. Tenta enviar para a API local/Render (/api/analytics/event)
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(eventPayload)
      });
    } catch (_) {
      // Caso esteja rodando apenas estático sem server.py, o LocalStorage já guardou
    }

    // 2. Opcional: Se o usuário configurou Supabase Cloud no dashboard
    try {
      const rawCfg = localStorage.getItem(CONFIG_KEY);
      if (rawCfg) {
        const cfg = JSON.parse(rawCfg);
        if (cfg.supabaseUrl && cfg.supabaseKey) {
          await fetch(`${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/portfolio_events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': cfg.supabaseKey,
              'Authorization': `Bearer ${cfg.supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            keepalive: true,
            body: JSON.stringify(eventPayload)
          });
        }
      }
    } catch (_) {}
  }

  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const envInfo = detectDeviceAndBrowser();
  const trafficSource = detectTrafficSource();
  const sessionStartTime = Date.now();

  function trackEvent(eventType, data = {}) {
    const payload = {
      id: generateId('evt'),
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType, // 'pageview' | 'section_view' | 'project_click' | 'contact_click' | 'interaction' | 'session_duration'
      page_path: data.page_path || window.location.pathname + (window.location.hash || ''),
      page_title: data.page_title || 'Início (Portfólio Principal)',
      target_name: data.target_name || '',
      target_url: data.target_url || '',
      source: trafficSource,
      referrer: document.referrer || 'direto',
      device: envInfo.device,
      os: envInfo.os,
      browser: envInfo.browser,
      screen: envInfo.screen,
      duration_sec: data.duration_sec || 0,
      timestamp: new Date().toISOString()
    };

    saveEventLocally(payload);
    sendEventToServer(payload);
    return payload;
  }

  function initPortfolioTracking() {
    // Evita rastrear a própria página de analytics como visita ao portfólio
    if (window.location.pathname.endsWith('analytics.html')) {
      return;
    }

    // 1. Registra Acesso Inicial (Pageview no Portfólio)
    trackEvent('pageview', {
      page_path: '/',
      page_title: 'Portfólio Completo (Acesso Inicial)',
      target_name: 'Portfólio Principal'
    });

    // 2. Rastreia visualização de cada seção/página do portfólio via IntersectionObserver
    const viewedSectionsInSession = new Set();
    const sectionElements = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window && sectionElements.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const secId = entry.target.getAttribute('id');
            if (secId && !viewedSectionsInSession.has(secId)) {
              viewedSectionsInSession.add(secId);
              const meta = SECTION_LABELS[secId] || {
                name: `Seção: ${secId}`,
                path: `/#${secId}`
              };
              trackEvent('section_view', {
                page_path: meta.path,
                page_title: meta.name,
                target_name: secId
              });
            }
          }
        });
      }, { threshold: [0.25] });

      sectionElements.forEach((sec) => observer.observe(sec));
    }

    // 3. Rastreia cliques em Abas da Showcase (Visão Geral, Arquitetura, Simulador, Desafios)
    document.querySelectorAll('.showcase-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        const meta = SECTION_LABELS[tabId] || {
          name: `Aba: ${tabId}`,
          path: `/#${tabId}`
        };
        trackEvent('section_view', {
          page_path: meta.path,
          page_title: meta.name,
          target_name: tabId
        });
      });
    });

    // 4. Rastreia cliques em nós da Arquitetura Medallion e Cenários do Simulador IA
    document.querySelectorAll('.pipeline-node').forEach((node) => {
      node.addEventListener('click', () => {
        const nodeKey = node.getAttribute('data-node') || 'node';
        const title = node.querySelector('.node-title')?.textContent?.trim() || nodeKey;
        trackEvent('interaction', {
          page_path: `/#architecture/${nodeKey}`,
          page_title: `Arquitetura: ${title}`,
          target_name: `Nó Medallion: ${title}`
        });
      });
    });

    document.querySelectorAll('.btn-scenario').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scenario = btn.getAttribute('data-scenario') || 'scenario';
        const title = btn.querySelector('.scenario-title')?.textContent?.trim() || scenario;
        trackEvent('interaction', {
          page_path: `/#simulator/${scenario}`,
          page_title: `Simulador IA: ${title}`,
          target_name: `Simulador: ${title}`
        });
      });
    });

    // 5. Rastreia cliques em Links de Projetos e Contatos
    document.querySelectorAll('a[href]').forEach((anchor) => {
      anchor.addEventListener('click', () => {
        const href = anchor.getAttribute('href') || '';
        const text = (anchor.textContent || '').replace(/\s+/g, ' ').trim();

        // Navegação por âncora interna (#flagship, #about, etc.)
        if (href.startsWith('#') && href.length > 1) {
          const secId = href.substring(1);
          const meta = SECTION_LABELS[secId] || {
            name: text || `Seção #${secId}`,
            path: `/${href}`
          };
          if (!viewedSectionsInSession.has(secId)) {
            viewedSectionsInSession.add(secId);
            trackEvent('section_view', {
              page_path: meta.path,
              page_title: meta.name,
              target_name: secId
            });
          }
          return;
        }

        // Cliques em Contatos
        if (href.includes('linkedin.com')) {
          trackEvent('contact_click', {
            page_path: '/contato/linkedin',
            page_title: 'Clique: LinkedIn',
            target_name: 'LinkedIn (Guilherme Antunes)',
            target_url: href
          });
          return;
        }
        if (href.startsWith('mailto:')) {
          trackEvent('contact_click', {
            page_path: '/contato/email',
            page_title: 'Clique: E-mail',
            target_name: 'E-mail (gads1208@gmail.com)',
            target_url: href
          });
          return;
        }
        if (href.includes('wa.me') || href.includes('whatsapp')) {
          trackEvent('contact_click', {
            page_path: '/contato/whatsapp',
            page_title: 'Clique: WhatsApp',
            target_name: 'WhatsApp Direto',
            target_url: href
          });
          return;
        }

        // Cliques em Projetos em Produção e GitHub
        if (href.includes('northwind-data-pipeline.onrender.com')) {
          trackEvent('project_click', {
            page_path: '/projeto/northwind-bi',
            page_title: 'Projeto: Northwind BI (Render)',
            target_name: 'Northwind BI Dashboard',
            target_url: href
          });
        } else if (href.includes('car-price-predictor')) {
          trackEvent('project_click', {
            page_path: '/projeto/car-price-ai',
            page_title: 'Projeto: Car Price AI (Render)',
            target_name: 'Car Price AI (ML)',
            target_url: href
          });
        } else if (href.includes('t.me/') || href.includes('telegram.org')) {
          trackEvent('project_click', {
            page_path: '/projeto/telegram-bot',
            page_title: 'Projeto: Bot Telegram (OpenClaw)',
            target_name: 'Bot Telegram Northwind',
            target_url: href
          });
        } else if (href.includes('northwind-market-jev') || href.includes('localhost:8085')) {
          trackEvent('project_click', {
            page_path: '/projeto/loja-jev-ia',
            page_title: 'Projeto: Loja Jev IA (E-Commerce)',
            target_name: 'Loja Northwind Jev IA',
            target_url: href
          });
        } else if (href.includes('repo-change-summary') || href.includes('localhost:8080')) {
          trackEvent('project_click', {
            page_path: '/projeto/gitdigest',
            page_title: 'Projeto: GitDigest (Auditoria PDF)',
            target_name: 'GitDigest (PDF + IA)',
            target_url: href
          });
        } else if (href.includes('github.com')) {
          const isSpecificRepo = href.split('/').filter(Boolean).length > 3;
          trackEvent(isSpecificRepo ? 'project_click' : 'contact_click', {
            page_path: isSpecificRepo ? '/projeto/github-repo' : '/contato/github',
            page_title: isSpecificRepo ? `Repositório GitHub (${text || 'Código'})` : 'Perfil GitHub (Gads1208)',
            target_name: isSpecificRepo ? `GitHub Repo: ${href.split('/').pop()}` : 'GitHub: Gads1208',
            target_url: href
          });
        }
      });
    });

    // 6. Rastreia duração da sessão ao sair da página ou a cada 30s
    let lastRecordedDuration = 0;
    const recordDuration = () => {
      const elapsedSec = Math.round((Date.now() - sessionStartTime) / 1000);
      if (elapsedSec > lastRecordedDuration + 5 && elapsedSec < 7200) {
        lastRecordedDuration = elapsedSec;
        trackEvent('session_duration', {
          page_path: '/session/heartbeat',
          page_title: 'Tempo de Permanência',
          duration_sec: elapsedSec
        });
      }
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        recordDuration();
      }
    });
    window.addEventListener('beforeunload', recordDuration);

    // Atalho rápido de teclado: Shift + A abre o Dashboard de Analytics
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        window.location.href = 'analytics.html';
      }
    });
  }

  // Expõe API global para uso pelo Dashboard (analytics.js)
  window.PortfolioTelemetry = {
    STORAGE_KEY,
    VISITOR_KEY,
    SESSION_KEY,
    CONFIG_KEY,
    SECTION_LABELS,
    trackEvent,
    getLocalEvents: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioTracking);
  } else {
    initPortfolioTracking();
  }
})();

