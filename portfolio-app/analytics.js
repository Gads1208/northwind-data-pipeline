/**
 * ============================================================================
 * GUILHERME.DATA&AI — Portfolio Analytics Dashboard Engine (analytics.js)
 * ============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'nw_portfolio_telemetry_events_v1';
  const DEMO_SEED_KEY = 'nw_portfolio_demo_seeded_v1';

  let allEvents = [];
  let selectedDays = 14;
  let includeDemo = true;
  let selectedEventType = 'all';
  let backendConnected = false;

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Gera dados históricos de fallback caso o usuário abra o HTML estático sem o server.py
  function generateClientDemoEvents() {
    const now = new Date();
    const sources = ['LinkedIn', 'Currículo (PDF)', 'GitHub', 'Acesso Direto', 'WhatsApp'];
    const devices = [
      { device: 'Desktop', os: 'Windows', browser: 'Chrome', screen: '1920x1080' },
      { device: 'Desktop', os: 'macOS', browser: 'Chrome', screen: '1728x1117' },
      { device: 'Desktop', os: 'Linux', browser: 'Firefox', screen: '2560x1440' },
      { device: 'Mobile', os: 'iOS', browser: 'Safari', screen: '390x844' },
      { device: 'Mobile', os: 'Android', browser: 'Chrome', screen: '412x915' }
    ];
    const sections = [
      { id: 'hero', path: '/#hero', title: 'Início (Hero Executivo)', prob: 0.98 },
      { id: 'flagship', path: '/#flagship', title: 'Northwind BI (Flagship Case)', prob: 0.88 },
      { id: 'tab-architecture', path: '/#architecture', title: 'Northwind • Arquitetura Medallion & MCP', prob: 0.68 },
      { id: 'tab-simulator', path: '/#simulator', title: 'Northwind • Simulador Multi-Agente IA', prob: 0.62 },
      { id: 'northwind-jev-store', path: '/#northwind-jev-store', title: 'Loja Jev IA (E-Commerce)', prob: 0.57 },
      { id: 'telegram-bot', path: '/#telegram-bot', title: 'Bot Telegram (OpenClaw + Gemini)', prob: 0.53 },
      { id: 'gitdigest', path: '/#gitdigest', title: 'GitDigest (Auditoria Git & PDF)', prob: 0.49 },
      { id: 'car-price-ai', path: '/#car-price-ai', title: 'Car Price AI (Redes Neurais)', prob: 0.46 },
      { id: 'skills', path: '/#skills', title: 'Habilidades & Stack Técnica', prob: 0.64 },
      { id: 'about', path: '/#about', title: 'Sobre Mim & Trajetória Profissional', prob: 0.72 },
      { id: 'contact', path: '/#contact', title: 'Contato & Redes Sociais', prob: 0.41 }
    ];
    const projects = [
      { path: '/projeto/northwind-bi', title: 'Projeto: Northwind BI (Render)', target: 'Northwind BI Dashboard', prob: 0.48 },
      { path: '/projeto/github-repo', title: 'Repositório GitHub (Código)', target: 'GitHub Repo: northwind-data-pipeline', prob: 0.34 },
      { path: '/projeto/telegram-bot', title: 'Projeto: Bot Telegram (OpenClaw)', target: 'Bot Telegram Northwind', prob: 0.31 },
      { path: '/projeto/loja-jev-ia', title: 'Projeto: Loja Jev IA (E-Commerce)', target: 'Loja Northwind Jev IA', prob: 0.29 },
      { path: '/projeto/gitdigest', title: 'Projeto: GitDigest (Auditoria PDF)', target: 'GitDigest (PDF + IA)', prob: 0.25 },
      { path: '/projeto/car-price-ai', title: 'Projeto: Car Price AI (Render)', target: 'Car Price AI (ML)', prob: 0.23 }
    ];
    const contacts = [
      { path: '/contato/linkedin', title: 'Clique: LinkedIn', target: 'LinkedIn (Guilherme Antunes)', prob: 0.28 },
      { path: '/contato/github', title: 'Perfil GitHub (Gads1208)', target: 'GitHub: Gads1208', prob: 0.22 },
      { path: '/contato/whatsapp', title: 'Clique: WhatsApp', target: 'WhatsApp Direto', prob: 0.12 },
      { path: '/contato/email', title: 'Clique: E-mail', target: 'E-mail (gads1208@gmail.com)', prob: 0.09 }
    ];

    const demoList = [];
    let counter = 1;
    for (let v = 1; v <= 42; v++) {
      const vid = `vis_demo_${String(v).padStart(3, '0')}`;
      const sid = `sess_demo_${String(v).padStart(3, '0')}_1`;
      const src = sources[v % sources.length];
      const dev = devices[v % devices.length];
      const dayOffset = Math.floor(Math.pow((v / 42), 1.3) * 13);
      const baseTime = new Date(now.getTime() - dayOffset * 86400000 - (v * 1100000));

      demoList.push({
        id: `evt_local_demo_${counter++}`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'pageview',
        page_path: '/',
        page_title: 'Portfólio Completo (Acesso Inicial)',
        target_name: 'Portfólio Principal',
        source: src,
        device: dev.device,
        os: dev.os,
        browser: dev.browser,
        screen: dev.screen,
        duration_sec: 0,
        is_demo: 1,
        timestamp: baseTime.toISOString()
      });

      sections.forEach((sec, idx) => {
        if (((v * (idx + 3)) % 100) / 100 <= sec.prob) {
          demoList.push({
            id: `evt_local_demo_${counter++}`,
            visitor_id: vid,
            session_id: sid,
            event_type: 'section_view',
            page_path: sec.path,
            page_title: sec.title,
            target_name: sec.id,
            source: src,
            device: dev.device,
            os: dev.os,
            browser: dev.browser,
            screen: dev.screen,
            duration_sec: 0,
            is_demo: 1,
            timestamp: new Date(baseTime.getTime() + (idx + 1) * 9000).toISOString()
          });
        }
      });

      projects.forEach((proj, idx) => {
        if (((v * (idx + 5)) % 100) / 100 <= proj.prob) {
          demoList.push({
            id: `evt_local_demo_${counter++}`,
            visitor_id: vid,
            session_id: sid,
            event_type: 'project_click',
            page_path: proj.path,
            page_title: proj.title,
            target_name: proj.target,
            source: src,
            device: dev.device,
            os: dev.os,
            browser: dev.browser,
            screen: dev.screen,
            duration_sec: 0,
            is_demo: 1,
            timestamp: new Date(baseTime.getTime() + 45000 + idx * 7000).toISOString()
          });
        }
      });

      contacts.forEach((cnt, idx) => {
        if (((v * (idx + 7)) % 100) / 100 <= cnt.prob) {
          demoList.push({
            id: `evt_local_demo_${counter++}`,
            visitor_id: vid,
            session_id: sid,
            event_type: 'contact_click',
            page_path: cnt.path,
            page_title: cnt.title,
            target_name: cnt.target,
            source: src,
            device: dev.device,
            os: dev.os,
            browser: dev.browser,
            screen: dev.screen,
            duration_sec: 0,
            is_demo: 1,
            timestamp: new Date(baseTime.getTime() + 80000 + idx * 5000).toISOString()
          });
        }
      });

      demoList.push({
        id: `evt_local_demo_${counter++}`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'session_duration',
        page_path: '/session/heartbeat',
        page_title: 'Tempo de Permanência',
        target_name: '',
        source: src,
        device: dev.device,
        os: dev.os,
        browser: dev.browser,
        screen: dev.screen,
        duration_sec: 55 + (v * 7) % 140,
        is_demo: 1,
        timestamp: new Date(baseTime.getTime() + 95000).toISOString()
      });
    }
    return demoList;
  }

  async function loadEventsData() {
    const statusText = document.getElementById('storageStatusText');
    const localRaw = localStorage.getItem(STORAGE_KEY);
    let localEvents = localRaw ? JSON.parse(localRaw) : [];

    // 1. Tenta sincronizar e buscar do servidor SQLite (/api/analytics/events)
    try {
      if (localEvents.length > 0) {
        await fetch('/api/analytics/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: localEvents })
        });
      }

      const res = await fetch(`/api/analytics/events?include_demo=${includeDemo ? '1' : '0'}`);
      if (res.ok) {
        const data = await res.json();
        backendConnected = true;
        allEvents = data.events || [];
        if (statusText) {
          statusText.textContent = `ONLINE • SQLITE API (${data.real_count} Eventos Reais | ${data.demo_count} Demo)`;
        }
        renderDashboard();
        return;
      }
    } catch (_) {
      backendConnected = false;
    }

    // 2. Fallback para LocalStorage caso aberto de forma 100% estática
    if (!localStorage.getItem(DEMO_SEED_KEY) && localEvents.length === 0) {
      const seeded = generateClientDemoEvents();
      localEvents = seeded;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localEvents));
      localStorage.setItem(DEMO_SEED_KEY, '1');
    }

    const realCount = localEvents.filter((e) => !e.is_demo).length;
    const demoCount = localEvents.filter((e) => e.is_demo).length;

    allEvents = includeDemo ? localEvents : localEvents.filter((e) => !e.is_demo);
    allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (statusText) {
      statusText.textContent = `MODO ESTÁTICO • LOCALSTORAGE SYNC (${realCount} Eventos Reais | ${demoCount} Demo)`;
    }
    renderDashboard();
  }

  function getFilteredEventsByPeriod() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - selectedDays * 86400000);
    return allEvents.filter((ev) => {
      const t = new Date(ev.timestamp);
      return t >= cutoff;
    });
  }

  function formatDuration(sec) {
    if (!sec || sec <= 0) return '0m 00s';
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }

  function renderDashboard() {
    const filtered = getFilteredEventsByPeriod();

    const pageviews = filtered.filter((e) => e.event_type === 'pageview');
    const sectionViews = filtered.filter((e) => e.event_type === 'section_view');
    const projectClicks = filtered.filter((e) => e.event_type === 'project_click');
    const contactClicks = filtered.filter((e) => e.event_type === 'contact_click');
    const durations = filtered.filter((e) => e.event_type === 'session_duration' && e.duration_sec > 0);

    const uniqueVisitors = new Set(filtered.map((e) => e.visitor_id)).size;
    const uniqueSessions = new Set(filtered.map((e) => e.session_id)).size;

    const totalVisitsCount = Math.max(pageviews.length, uniqueSessions);
    const avgSec = durations.length > 0
      ? durations.reduce((acc, cur) => acc + Number(cur.duration_sec || 0), 0) / durations.length
      : (totalVisitsCount > 0 ? 78 : 0);

    // 1. Atualiza os 6 KPIs
    document.getElementById('kpiTotalVisits').textContent = totalVisitsCount.toLocaleString('pt-BR');
    document.getElementById('kpiSessionsSub').textContent = `${uniqueSessions} sessões`;

    document.getElementById('kpiUniqueVisitors').textContent = uniqueVisitors.toLocaleString('pt-BR');
    const recurrence = uniqueVisitors > 0 ? (totalVisitsCount / uniqueVisitors).toFixed(1) : '0.0';
    document.getElementById('kpiRecurrenceSub').textContent = `${recurrence}x`;

    document.getElementById('kpiSectionViews').textContent = sectionViews.length.toLocaleString('pt-BR');
    const secPerVisit = totalVisitsCount > 0 ? (sectionViews.length / totalVisitsCount).toFixed(1) : '0.0';
    document.getElementById('kpiSectionsPerVisit').textContent = secPerVisit;

    document.getElementById('kpiProjectClicks').textContent = projectClicks.length.toLocaleString('pt-BR');
    const projCtr = totalVisitsCount > 0 ? Math.min(100, Math.round((projectClicks.length / totalVisitsCount) * 100)) : 0;
    document.getElementById('kpiProjectCtr').textContent = `${projCtr}%`;

    document.getElementById('kpiAvgDuration').textContent = formatDuration(avgSec);

    document.getElementById('kpiContactClicks').textContent = contactClicks.length.toLocaleString('pt-BR');
    const contactConv = uniqueVisitors > 0 ? Math.min(100, Math.round((contactClicks.length / uniqueVisitors) * 100)) : 0;
    document.getElementById('kpiContactConv').textContent = `${contactConv}%`;

    // 2. Renderiza Gráfico Diário (SVG)
    renderDailyChart(filtered);

    // 3. Renderiza Ranking de Páginas / Seções Acessadas
    renderSectionsRanking(sectionViews, uniqueVisitors);

    // 4. Renderiza Ranking de Projetos Mais Clicados
    renderProjectsRanking(projectClicks, totalVisitsCount);

    // 5. Renderiza Origem do Tráfego (Referrers / UTMs)
    renderSourcesRanking(pageviews.length > 0 ? pageviews : filtered);

    // 6. Renderiza Canais de Contato + Perfil Tecnológico
    renderContactsAndTech(contactClicks, pageviews.length > 0 ? pageviews : filtered);

    // 7. Renderiza Tabela de Acessos em Tempo Real
    renderEventsTable(filtered);
  }

  function renderDailyChart(events) {
    const container = document.getElementById('dailyChartContainer');
    const badge = document.getElementById('chartTotalBadge');
    if (!container) return;

    const chartDays = Math.min(selectedDays, 14);
    if (badge) {
      badge.textContent = selectedDays === 1 ? 'Hoje (Por Hora)' : `Últimos ${chartDays} dias`;
    }

    const buckets = [];
    const now = new Date();

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      buckets.push({
        key,
        label,
        views: 0,
        visitors: new Set(),
        clicks: 0
      });
    }

    const bucketMap = Object.fromEntries(buckets.map((b) => [b.key, b]));

    events.forEach((ev) => {
      const dayKey = new Date(ev.timestamp).toISOString().slice(0, 10);
      const b = bucketMap[dayKey];
      if (!b) return;
      b.visitors.add(ev.visitor_id);
      if (ev.event_type === 'pageview') b.views += 1;
      if (ev.event_type === 'project_click') b.clicks += 1;
    });

    const maxVal = Math.max(5, ...buckets.map((b) => Math.max(b.views, b.visitors.size, b.clicks)));
    const svgWidth = 680;
    const svgHeight = 230;
    const padLeft = 34;
    const padRight = 16;
    const padTop = 18;
    const padBottom = 34;
    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const colWidth = plotW / buckets.length;

    let gridLines = '';
    for (let g = 0; g <= 4; g++) {
      const y = padTop + (plotH / 4) * g;
      const val = Math.round(maxVal - (maxVal / 4) * g);
      gridLines += `
        <line x1="${padLeft}" y1="${y}" x2="${svgWidth - padRight}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
        <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" fill="#64748b" font-size="10" font-family="JetBrains Mono">${val}</text>
      `;
    }

    let barsSvg = '';
    let visitorPoints = [];

    buckets.forEach((b, idx) => {
      const centerX = padLeft + idx * colWidth + colWidth / 2;
      const barW = Math.min(18, colWidth * 0.34);

      const viewsH = (b.views / maxVal) * plotH;
      const viewsY = padTop + plotH - viewsH;

      const clicksH = (b.clicks / maxVal) * plotH;
      const clicksY = padTop + plotH - clicksH;

      const visCount = b.visitors.size;
      const visY = padTop + plotH - (visCount / maxVal) * plotH;
      visitorPoints.push(`${centerX},${visY}`);

      barsSvg += `
        <g>
          <title>${b.label}: ${b.views} acessos | ${visCount} visitantes únicos | ${b.clicks} cliques em projetos</title>
          <rect x="${centerX - barW - 1}" y="${viewsY}" width="${barW}" height="${Math.max(2, viewsH)}" rx="4" fill="url(#barGradIndigo)" />
          <rect x="${centerX + 1}" y="${clicksY}" width="${barW}" height="${Math.max(2, clicksH)}" rx="4" fill="url(#barGradEmerald)" />
          <text x="${centerX}" y="${svgHeight - 10}" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">${b.label}</text>
        </g>
      `;
    });

    const polylineSvg = visitorPoints.length > 1
      ? `<polyline fill="none" stroke="#06b6d4" stroke-width="2.5" points="${visitorPoints.join(' ')}" />`
      : '';

    const dotsSvg = visitorPoints.map((pt) => {
      const [cx, cy] = pt.split(',');
      return `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#06b6d4" stroke="#0f172a" stroke-width="1.5"/>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; overflow: visible;">
        <defs>
          <linearGradient id="barGradIndigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.3"/>
          </linearGradient>
          <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.25"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${barsSvg}
        ${polylineSvg}
        ${dotsSvg}
      </svg>
    `;
  }

  function renderSectionsRanking(sectionEvents, totalVisitors) {
    const listElem = document.getElementById('sectionsRankingList');
    if (!listElem) return;

    const counts = {};
    sectionEvents.forEach((ev) => {
      const key = ev.page_title || ev.page_path;
      if (!counts[key]) {
        counts[key] = {
          title: ev.page_title || ev.page_path,
          path: ev.page_path || '/#',
          views: 0,
          visitors: new Set()
        };
      }
      counts[key].views += 1;
      counts[key].visitors.add(ev.visitor_id);
    });

    const sorted = Object.values(counts).sort((a, b) => b.views - a.views).slice(0, 8);
    if (sorted.length === 0) {
      listElem.innerHTML = `<p class="panel-desc">Nenhuma seção registrada neste período. Role a página principal do portfólio para testar!</p>`;
      return;
    }

    const maxViews = Math.max(1, sorted[0].views);

    listElem.innerHTML = sorted.map((item) => {
      const widthPct = Math.round((item.views / maxViews) * 100);
      const reachPct = totalVisitors > 0 ? Math.min(100, Math.round((item.visitors.size / totalVisitors) * 100)) : 100;
      return `
        <div class="ranking-item">
          <div class="ranking-row-top">
            <div class="ranking-name">
              <span>${item.title}</span>
              <span class="ranking-path">${item.path}</span>
            </div>
            <div class="ranking-metrics">
              <span class="ranking-count">${item.views} acessos</span>
              <span class="ranking-pct" title="Percentual dos visitantes únicos que acessaram esta seção">${reachPct}% alcance</span>
            </div>
          </div>
          <div class="ranking-bar-track">
            <div class="ranking-bar-fill" style="width: ${widthPct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderProjectsRanking(projectEvents, totalVisits) {
    const listElem = document.getElementById('projectsRankingList');
    if (!listElem) return;

    const counts = {};
    projectEvents.forEach((ev) => {
      const key = ev.target_name || ev.page_title;
      if (!counts[key]) {
        counts[key] = {
          name: ev.target_name || ev.page_title,
          path: ev.page_path || '/projeto',
          clicks: 0
        };
      }
      counts[key].clicks += 1;
    });

    const sorted = Object.values(counts).sort((a, b) => b.clicks - a.clicks);
    if (sorted.length === 0) {
      listElem.innerHTML = `<p class="panel-desc">Nenhum clique em projeto registrado neste período.</p>`;
      return;
    }

    const maxClicks = Math.max(1, sorted[0].clicks);

    listElem.innerHTML = sorted.map((item) => {
      const widthPct = Math.round((item.clicks / maxClicks) * 100);
      const ctrPct = totalVisits > 0 ? Math.min(100, Math.round((item.clicks / totalVisits) * 100)) : 0;
      return `
        <div class="ranking-item">
          <div class="ranking-row-top">
            <div class="ranking-name">
              <span>🚀 ${item.name}</span>
              <span class="ranking-path">${item.path}</span>
            </div>
            <div class="ranking-metrics">
              <span class="ranking-count">${item.clicks} cliques</span>
              <span class="ranking-pct">${ctrPct}% das visitas</span>
            </div>
          </div>
          <div class="ranking-bar-track">
            <div class="ranking-bar-fill fill-emerald" style="width: ${widthPct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSourcesRanking(baseEvents) {
    const listElem = document.getElementById('sourcesRankingList');
    if (!listElem) return;

    const counts = {};
    baseEvents.forEach((ev) => {
      const src = ev.source || 'Acesso Direto';
      counts[src] = (counts[src] || 0) + 1;
    });

    const total = Math.max(1, baseEvents.length);
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      listElem.innerHTML = `<p class="panel-desc">Sem dados de origem no período.</p>`;
      return;
    }

    const maxCount = Math.max(1, sorted[0].count);
    const sourceIcons = {
      'LinkedIn': '💼',
      'Currículo (PDF)': '📄',
      'GitHub': '🐙',
      'Acesso Direto': '🔗',
      'WhatsApp': '💬',
      'Google Search': '🔍'
    };

    listElem.innerHTML = sorted.map((item) => {
      const widthPct = Math.round((item.count / maxCount) * 100);
      const sharePct = Math.round((item.count / total) * 100);
      const icon = sourceIcons[item.name] || '🌐';
      return `
        <div class="ranking-item">
          <div class="ranking-row-top">
            <div class="ranking-name">
              <span>${icon} ${item.name}</span>
            </div>
            <div class="ranking-metrics">
              <span class="ranking-count">${item.count} acessos</span>
              <span class="ranking-pct">${sharePct}%</span>
            </div>
          </div>
          <div class="ranking-bar-track">
            <div class="ranking-bar-fill fill-violet" style="width: ${widthPct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderContactsAndTech(contactEvents, baseEvents) {
    const contactsElem = document.getElementById('contactsRankingList');
    const techElem = document.getElementById('techBreakdownGrid');

    if (contactsElem) {
      const counts = {};
      contactEvents.forEach((ev) => {
        const name = ev.target_name || ev.page_title;
        counts[name] = (counts[name] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      if (sorted.length === 0) {
        contactsElem.innerHTML = `<p class="panel-desc">Nenhum clique em contato no período.</p>`;
      } else {
        const maxC = Math.max(1, sorted[0].count);
        contactsElem.innerHTML = sorted.map((item) => {
          const w = Math.round((item.count / maxC) * 100);
          return `
            <div class="ranking-item">
              <div class="ranking-row-top">
                <div class="ranking-name"><span>🤝 ${item.name}</span></div>
                <div class="ranking-metrics"><span class="ranking-count">${item.count} cliques</span></div>
              </div>
              <div class="ranking-bar-track">
                <div class="ranking-bar-fill fill-amber" style="width: ${w}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (techElem) {
      const countBy = (field) => {
        const map = {};
        baseEvents.forEach((e) => {
          const k = e[field] || 'Outro';
          map[k] = (map[k] || 0) + 1;
        });
        const total = Math.max(1, baseEvents.length);
        return Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([k, v]) => ({ k, pct: `${Math.round((v / total) * 100)}%` }));
      };

      const devices = countBy('device');
      const systems = countBy('os');
      const browsers = countBy('browser');

      const renderRows = (arr) => arr.map((r) => `
        <div class="tech-stat-row">
          <span>${r.k}</span>
          <strong style="font-family: var(--font-mono); color: #38bdf8;">${r.pct}</strong>
        </div>
      `).join('');

      techElem.innerHTML = `
        <div class="tech-subcard">
          <div class="tech-subtitle">📱 Dispositivos</div>
          ${renderRows(devices)}
        </div>
        <div class="tech-subcard">
          <div class="tech-subtitle">💻 Sistema (OS)</div>
          ${renderRows(systems)}
        </div>
        <div class="tech-subcard">
          <div class="tech-subtitle">🌐 Navegador</div>
          ${renderRows(browsers)}
        </div>
      `;
    }
  }

  function renderEventsTable(events) {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    const visibleEvents = events
      .filter((e) => e.event_type !== 'session_duration')
      .filter((e) => selectedEventType === 'all' || e.event_type === selectedEventType)
      .slice(0, 80);

    if (visibleEvents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #94a3b8; padding: 28px;">
            Nenhum evento encontrado para este filtro. Abra o portfólio ou clique em "⚡ Simular Acesso".
          </td>
        </tr>
      `;
      return;
    }

    const badgeMeta = {
      pageview: { cls: 'evt-pageview', label: '👁️ Acesso Inicial' },
      section_view: { cls: 'evt-section', label: '📄 Seção Lida' },
      project_click: { cls: 'evt-project', label: '🚀 Clique Projeto' },
      contact_click: { cls: 'evt-contact', label: '🤝 Clique Contato' },
      interaction: { cls: 'evt-interaction', label: '⚡ Interação IA' }
    };

    tbody.innerHTML = visibleEvents.map((ev) => {
      const dt = new Date(ev.timestamp);
      const formattedDate = dt.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const meta = badgeMeta[ev.event_type] || { cls: 'evt-section', label: ev.event_type };
      const isRealBadge = ev.is_demo ? '' : '<span style="color:#10b981; font-weight:700; margin-left:4px;" title="Acesso Real">● REAL</span>';

      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 0.77rem; color: #94a3b8;">${formattedDate}</td>
          <td><span class="visitor-chip">${ev.visitor_id.slice(0, 12)}</span>${isRealBadge}</td>
          <td><span class="evt-badge ${meta.cls}">${meta.label}</span></td>
          <td style="font-weight: 600; color: #f8fafc;">${ev.page_title}</td>
          <td style="font-family: var(--font-mono); font-size: 0.76rem; color: #64748b;">${ev.page_path}</td>
          <td>${ev.source || 'Acesso Direto'}</td>
          <td style="font-size: 0.77rem; color: #94a3b8;">${ev.device} • ${ev.os} (${ev.browser})</td>
        </tr>
      `;
    }).join('');
  }

  async function simulateLiveVisitor() {
    const sources = ['LinkedIn', 'Currículo (PDF)', 'GitHub', 'WhatsApp'];
    const pickSource = sources[Math.floor(Math.random() * sources.length)];
    const vid = `vis_live_${Math.random().toString(36).substring(2, 6)}`;
    const sid = `sess_live_${Date.now().toString(36).slice(-4)}`;
    const now = Date.now();

    const simBatch = [
      {
        id: `evt_sim_${now}_1`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'pageview',
        page_path: '/',
        page_title: 'Portfólio Completo (Acesso Inicial)',
        target_name: 'Portfólio Principal',
        source: pickSource,
        device: 'Desktop',
        os: 'Windows',
        browser: 'Chrome',
        screen: '1920x1080',
        duration_sec: 0,
        is_demo: 0,
        timestamp: new Date(now).toISOString()
      },
      {
        id: `evt_sim_${now}_2`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'section_view',
        page_path: '/#flagship',
        page_title: 'Northwind BI (Flagship Case)',
        target_name: 'flagship',
        source: pickSource,
        device: 'Desktop',
        os: 'Windows',
        browser: 'Chrome',
        screen: '1920x1080',
        duration_sec: 0,
        is_demo: 0,
        timestamp: new Date(now + 1000).toISOString()
      },
      {
        id: `evt_sim_${now}_3`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'section_view',
        page_path: '/#about',
        page_title: 'Sobre Mim & Trajetória Profissional',
        target_name: 'about',
        source: pickSource,
        device: 'Desktop',
        os: 'Windows',
        browser: 'Chrome',
        screen: '1920x1080',
        duration_sec: 0,
        is_demo: 0,
        timestamp: new Date(now + 2000).toISOString()
      },
      {
        id: `evt_sim_${now}_4`,
        visitor_id: vid,
        session_id: sid,
        event_type: 'project_click',
        page_path: '/projeto/northwind-bi',
        page_title: 'Projeto: Northwind BI (Render)',
        target_name: 'Northwind BI Dashboard',
        source: pickSource,
        device: 'Desktop',
        os: 'Windows',
        browser: 'Chrome',
        screen: '1920x1080',
        duration_sec: 0,
        is_demo: 0,
        timestamp: new Date(now + 3000).toISOString()
      }
    ];

    // Salva localmente e envia ao backend
    const raw = localStorage.getItem(STORAGE_KEY);
    const localList = raw ? JSON.parse(raw) : [];
    simBatch.forEach((ev) => localList.push(ev));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localList));

    try {
      await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: simBatch })
      });
    } catch (_) {}

    showToast(`⚡ Novo acesso via ${pickSource} registrado em tempo real!`);
    await loadEventsData();
  }

  function exportToCsv() {
    const filtered = getFilteredEventsByPeriod();
    if (filtered.length === 0) {
      showToast('Sem dados para exportar.');
      return;
    }

    const headers = ['timestamp', 'visitor_id', 'session_id', 'event_type', 'page_title', 'page_path', 'target_name', 'source', 'device', 'os', 'browser', 'is_demo'];
    const csvRows = [
      headers.join(','),
      ...filtered.map((row) =>
        headers.map((field) => `"${String(row[field] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_acessos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Relatório CSV exportado com sucesso!');
  }

  async function clearDemoData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw).filter((e) => !e.is_demo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    try {
      await fetch('/api/analytics/reset?mode=demo_only', { method: 'DELETE' });
    } catch (_) {}

    const demoCheckbox = document.getElementById('includeDemoToggle');
    if (demoCheckbox) demoCheckbox.checked = false;
    includeDemo = false;

    showToast('🗑️ Dados de demonstração ocultados. Exibindo apenas acessos 100% reais!');
    await loadEventsData();
  }

  function initDashboardEvents() {
    // Filtro de Período
    document.querySelectorAll('.period-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDays = parseInt(btn.getAttribute('data-days'), 10) || 14;
        renderDashboard();
      });
    });

    // Toggle Demo vs Apenas Reais
    const demoToggle = document.getElementById('includeDemoToggle');
    if (demoToggle) {
      demoToggle.addEventListener('change', () => {
        includeDemo = demoToggle.checked;
        loadEventsData();
      });
    }

    // Filtro da Tabela por Tipo de Evento
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        selectedEventType = chip.getAttribute('data-type') || 'all';
        renderEventsTable(getFilteredEventsByPeriod());
      });
    });

    // Botões de ação
    document.getElementById('simulateVisitBtn')?.addEventListener('click', simulateLiveVisitor);
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCsv);
    document.getElementById('resetDataBtn')?.addEventListener('click', clearDemoData);

    // Botões de copiar Link UTM para recrutadores
    document.querySelectorAll('.utm-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const utm = btn.getAttribute('data-utm');
        const prodBase = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
          ? 'https://guilherme-portfolio.onrender.com/'
          : `${window.location.origin}/`;
        const fullUrl = `${prodBase}?utm_source=${utm}`;
        navigator.clipboard?.writeText(fullUrl);
        showToast(`📋 Copiado: ${fullUrl}`);
      });
    });

    // Escuta novos eventos em tempo real vindos da aba do portfólio
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('nw_portfolio_analytics_channel');
      ch.onmessage = () => {
        loadEventsData();
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        loadEventsData();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDashboardEvents();
    loadEventsData();
  });
})();

