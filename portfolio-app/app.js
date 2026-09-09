/**
 * Data Engineering & AI Portfolio
 * Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initNavigation();
  initShowcaseTabs();
  initArchitectureInspector();
  initSimulator();
});

/* ==========================================================================
   0. Living Cosmos Starfield Engine (Twinkle & Scroll Parallax)
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfieldCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    generateStars();
  });

  // Star generation
  let stars = [];
  const STAR_COUNT = Math.floor(Math.min(Math.max(width * 0.18, 120), 280));

  function generateStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const layer = Math.random();
      let radius, parallaxSpeed, baseAlpha, color;

      if (layer < 0.6) {
        // Distant slow layer
        radius = Math.random() * 0.8 + 0.5;
        parallaxSpeed = 0.08 + Math.random() * 0.04;
        baseAlpha = Math.random() * 0.4 + 0.2;
        color = '255, 255, 255';
      } else if (layer < 0.9) {
        // Mid layer
        radius = Math.random() * 1.2 + 0.9;
        parallaxSpeed = 0.18 + Math.random() * 0.08;
        baseAlpha = Math.random() * 0.4 + 0.4;
        color = Math.random() > 0.4 ? '255, 255, 255' : '165, 243, 252';
      } else {
        // Foreground bright layer
        radius = Math.random() * 1.6 + 1.4;
        parallaxSpeed = 0.32 + Math.random() * 0.12;
        baseAlpha = Math.random() * 0.3 + 0.6;
        color = Math.random() > 0.5 ? '199, 210, 254' : '255, 255, 255';
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha,
        color,
        parallaxSpeed,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2.5 + 1.2,
        twinkleAmp: Math.random() * 0.35 + 0.15
      });
    }
  }

  generateStars();

  // Scroll Tracking with smooth interpolation
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // Shooting star state
  let shootingStar = null;
  let nextShootingStarTime = performance.now() + 3500;

  function spawnShootingStar(now) {
    shootingStar = {
      x: Math.random() * (width * 0.8),
      y: Math.random() * (height * 0.4),
      length: Math.random() * 90 + 70,
      speed: Math.random() * 8 + 10,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 degrees downward
      opacity: 1,
      decay: Math.random() * 0.015 + 0.02
    };
    nextShootingStarTime = now + Math.random() * 6000 + 4000;
  }

  // Animation Loop
  function render(time) {
    // Smooth lerp scroll
    currentScrollY += (targetScrollY - currentScrollY) * 0.1;

    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    const len = stars.length;
    for (let i = 0; i < len; i++) {
      const star = stars[i];

      // Twinkle alpha computation
      const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.phase) * star.twinkleAmp;
      let alpha = star.baseAlpha + twinkle;
      if (alpha < 0.05) alpha = 0.05;
      if (alpha > 1) alpha = 1;

      // Parallax position calculation with vertical infinite loop wrapping
      let renderY = (star.y - currentScrollY * star.parallaxSpeed) % height;
      if (renderY < 0) renderY += height;

      ctx.beginPath();
      ctx.arc(star.x, renderY, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`;
      ctx.fill();

      // Subtle bloom for bright stars
      if (star.radius > 1.8 && alpha > 0.6) {
        ctx.beginPath();
        ctx.arc(star.x, renderY, star.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${(alpha * 0.18).toFixed(3)})`;
        ctx.fill();
      }
    }

    // Shooting Stars handling
    if (!shootingStar && time > nextShootingStarTime) {
      spawnShootingStar(time);
    }

    if (shootingStar) {
      const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
      const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

      const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(1, `rgba(165, 243, 252, ${shootingStar.opacity.toFixed(2)})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(shootingStar.x, shootingStar.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
      shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
      shootingStar.opacity -= shootingStar.decay;

      if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   1. Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Active Link on Scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const id = section.getAttribute('id');
      if (!id) return;
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   2. Showcase Tabs
   ========================================================================== */
function initShowcaseTabs() {
  const tabButtons = document.querySelectorAll('.showcase-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Architecture Inspector
   ========================================================================== */
const architectureData = {
  bronze: {
    title: '🥉 Camada Bronze (Raw Ingestion)',
    badge: 'Ingestão Concluída',
    desc: '8 tabelas brutas extraídas da base Northwind (Orders, OrderDetails, Customers, Products, Employees, Categories, Suppliers, Shippers). Preservação integral de histórico, particionamento por data de carregamento e auditoria com carimbos ISO-8601.',
    specs: [
      { label: 'Fonte de Dados:', val: 'PostgreSQL 15 (Docker)' },
      { label: 'Tabelas Ingeridas:', val: '8 tabelas transacionais' },
      { label: 'Orquestrador:', val: 'Apache Airflow 2.8' }
    ]
  },
  silver: {
    title: '🥈 Camada Silver (Star Schema com dbt)',
    badge: '4 Modelos Dimensionais',
    desc: 'Transformações em dbt aplicando modelagem dimensional (Star Schema). Criação de surrogate keys via hash MD5, padronização de nomenclatura de colunas, tratamento de valores nulos e 16 testes automáticos de unicidade e integridade referencial.',
    specs: [
      { label: 'Modelos Criados:', val: 'fct_orders, dim_customers, dim_products, dim_employees' },
      { label: 'Qualidade de Dados:', val: '16 testes dbt aprovados' },
      { label: 'Materialização:', val: 'Table / Incremental' }
    ]
  },
  gold: {
    title: '🥇 Camada Gold (Business Metrics & Marts)',
    badge: 'Métricas Otimizadas',
    desc: 'Tabelas agregadas e datamarts desenhados especificamente para consultas analíticas de baixa latência. Métricas consolidadas de faturamento mensal, ticket médio por cliente, cohort de retenção e rankings de produtos por categoria.',
    specs: [
      { label: 'Métricas Prontas:', val: 'MoM Growth, Ticket Médio, Top Sellers' },
      { label: 'Tempo de Consulta:', val: '< 25ms para dashboards' },
      { label: 'Consumo:', val: 'APIs FastAPI & Servidor MCP' }
    ]
  },
  mcp: {
    title: '🔌 Servidor Model Context Protocol (MCP)',
    badge: 'Protocolo Oficial',
    desc: 'Implementação da especificação aberta MCP permitindo que LLMs interajam de forma padronizada com o ecossistema de dados. Expõe ferramentas universais: inspect_schema, run_safe_query, get_kpis e recommend_chart.',
    specs: [
      { label: 'Protocolo:', val: 'Model Context Protocol (JSON-RPC)' },
      { label: 'Ferramentas Expostas:', val: '6 Tools Universais' },
      { label: 'Compatibilidade:', val: 'Claude Desktop, Cursor, Custom Agents' }
    ]
  },
  agents: {
    title: '🤖 Orquestrador Multi-Agente & AST Security',
    badge: '5 Agentes Autônomos',
    desc: 'Grafo de agentes coordenados: SQL Agent (gera query), AST Sanitizer (validação estrita contra SQL Injection), Data Analyst Agent (análise estatística), Visualization Agent (recomenda tipo de gráfico) e Business Insight Agent (síntese executiva).',
    specs: [
      { label: 'Segurança:', val: 'sqlglot AST Validator (Reject Non-SELECT)' },
      { label: 'Agentes Ativos:', val: '5 Agentes Especializados' },
      { label: 'Framework:', val: 'Custom Graph Orchestrator (FastAPI Async)' }
    ]
  },
  bi: {
    title: '📊 Dashboard Corporativo Interativo (BI)',
    badge: '14 Páginas Analíticas',
    desc: 'Interface moderna estilo Power BI construída em React 18 e TailwindCSS com Recharts e ECharts. Suporte total a tema escuro/claro, filtros dinâmicos, exportação de relatórios e chatbot de IA contextual acoplado.',
    specs: [
      { label: 'Frontend Stack:', val: 'React 18 + Vite + TypeScript' },
      { label: 'Telas:', val: '14 Dashboards Interativos' },
      { label: 'Gateway:', val: 'Nginx Reverse Proxy' }
    ]
  }
};

function initArchitectureInspector() {
  const nodes = document.querySelectorAll('.pipeline-node');
  const titleElem = document.getElementById('archDetailTitle');
  const badgeElem = document.getElementById('archDetailBadge');
  const descElem = document.getElementById('archDetailDesc');
  const specsElem = document.getElementById('archDetailSpecs');

  if (!titleElem || !specsElem) return;

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const nodeKey = node.getAttribute('data-node');
      const data = architectureData[nodeKey];

      if (data) {
        titleElem.textContent = data.title;
        badgeElem.textContent = data.badge;
        descElem.textContent = data.desc;

        specsElem.innerHTML = data.specs.map(spec => `
          <div class="spec-item">
            <span class="spec-label">${spec.label}</span>
            <span class="spec-val">${spec.val}</span>
          </div>
        `).join('');
      }
    });
  });
}

/* ==========================================================================
   4. Multi-Agent Simulator
   ========================================================================== */
const simulationScenarios = {
  top_customers: [
    {
      agent: '🤖 SQL Agent',
      type: 'info',
      title: 'Tradução de Linguagem Natural para SQL',
      content: 'Interpretando: "Quais os top 5 clientes por faturamento em 1997?"',
      code: `SELECT c.company_name, 
       ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_revenue
FROM orders o
JOIN order_details od ON o.order_id = od.order_id
JOIN customers c ON o.customer_id = c.customer_id
WHERE EXTRACT(YEAR FROM o.order_date) = 1997
GROUP BY c.company_name
ORDER BY total_revenue DESC
LIMIT 5;`
    },
    {
      agent: '🛡️ AST Security Validator',
      type: 'success',
      title: 'Validação Sintática Abstrata',
      content: 'Árvore Sintática (AST) analisada via sqlglot: [NodeType=Select]. Nenhuma mutação (DROP, ALTER, DELETE, INSERT) detectada.',
      badge: 'SAFE_APPROVED'
    },
    {
      agent: '🔌 MCP Server Tool Call',
      type: 'info',
      title: 'Execução via Model Context Protocol',
      content: 'Tool acionada: `run_safe_query`. Conexão com PostgreSQL estabelecida. Latência de execução: 12ms.'
    },
    {
      agent: '📊 Data Analyst Agent',
      type: 'info',
      title: 'Cálculo Estatístico & Métricas',
      content: '1. Quick-Stop ($110,277.30) | 2. Save-a-lot Markets ($104,361.95) | 3. Ernst Handel ($101,234.10). Os top 5 clientes concentraram 28.4% do faturamento total em 1997.'
    },
    {
      agent: '💡 Business Insight Agent',
      type: 'success',
      title: 'Conclusão Executiva para Decisão',
      content: 'Recomendação: Os 3 maiores compradores apresentam crescimento trimestral contínuo. Sugere-se criação de programa VIP de retenção para blindagem contra concorrentes.'
    }
  ],

  security_attack: [
    {
      agent: '🤖 SQL Agent',
      type: 'alert',
      title: 'Query Recebida com Instruções Suspeitas',
      content: 'Prompt do usuário continha injeção maliciosa combinada com consulta.',
      code: `DROP TABLE orders; 
SELECT * FROM employees;`
    },
    {
      agent: '🛡️ AST Security Validator',
      type: 'blocked',
      title: 'BLOQUEIO IMEDIATO DE SEGURANÇA',
      content: 'ALERTA CRÍTICO: Token destrutivo detectado [DropTable]. Violação direta dos guardrails de integridade da base analítica.',
      badge: 'ATTACK_PREVENTED'
    },
    {
      agent: '🔌 MCP Security Guard',
      type: 'blocked',
      title: 'Execução Abortada',
      content: 'Zero comandos foram enviados ao PostgreSQL. A conexão transacional foi cancelada e o evento de segurança foi registrado nos logs de auditoria.'
    },
    {
      agent: '📝 Documentation Agent',
      type: 'info',
      title: 'Relatório de Incidente Sanitizado',
      content: 'O banco de dados permaneceu 100% íntegro. O usuário recebeu a mensagem amigável: "Apenas consultas SELECT de leitura são permitidas neste ambiente".'
    }
  ],

  shipping_delay: [
    {
      agent: '🤖 SQL Agent',
      type: 'info',
      title: 'Análise de Desempenho Logístico',
      content: 'Gerando query para medição de atrasos por transportadora.',
      code: `SELECT s.company_name,
       COUNT(*) AS total_shipments,
       COUNT(CASE WHEN o.shipped_date > o.required_date THEN 1 END) AS delayed_shipments,
       ROUND((COUNT(CASE WHEN o.shipped_date > o.required_date THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) AS delay_rate_pct
FROM orders o
JOIN shippers s ON o.ship_via = s.shipper_id
GROUP BY s.company_name;`
    },
    {
      agent: '🛡️ AST Security Validator',
      type: 'success',
      title: 'Validação Aprovada',
      content: 'Consulta segura do tipo SELECT validada pela árvore sintática AST.'
    },
    {
      agent: '📊 Data Analyst Agent',
      type: 'info',
      title: 'Taxa de Pontualidade Encontrada',
      content: 'Federal Shipping: 96.2% no prazo. Speedy Express: 94.1% no prazo. United Package: 91.8% no prazo (apresenta taxa de atraso de 8.2%).'
    },
    {
      agent: '🎨 Visualization Agent',
      type: 'info',
      title: 'Recomendação de Visualização',
      content: 'Recomendado: Gráfico de Barra Comparativa com linha de meta de SLA fixada em 95% de pontualidade.'
    },
    {
      agent: '💡 Business Insight Agent',
      type: 'success',
      title: 'Alerta Operacional',
      content: 'A United Package responde pela maioria das entregas de maior peso, o que explica os atrasos pontuais. Recomenda-se revisão das rotas marítimas no próximo contrato.'
    }
  ]
};

function initSimulator() {
  const scenarioButtons = document.querySelectorAll('.btn-scenario');
  const consoleBody = document.getElementById('consoleBody');
  const consoleStatus = document.getElementById('consoleStatus');

  if (!consoleBody || !consoleStatus) return;

  function runSimulation(scenarioKey) {
    const steps = simulationScenarios[scenarioKey];
    if (!steps) return;

    consoleBody.innerHTML = '';
    consoleStatus.textContent = 'Status: Executing Agent Graph...';
    consoleStatus.style.color = '#f59e0b';

    steps.forEach((step, index) => {
      setTimeout(() => {
        const stepElem = document.createElement('div');
        const isBlocked = step.type === 'blocked' || step.type === 'alert';
        const isSuccess = step.type === 'success';

        stepElem.className = `agent-step ${isBlocked ? 'blocked' : ''} ${isSuccess ? 'success' : ''}`;
        
        stepElem.innerHTML = `
          <div class="step-agent-name ${isBlocked ? 'alert' : ''}">
            <span>${step.agent}</span>
            <span>&bull; ${step.title}</span>
          </div>
          <p class="step-content">${step.content}</p>
          ${step.code ? `<pre class="step-code"><code>${step.code}</code></pre>` : ''}
        `;

        consoleBody.appendChild(stepElem);

        // If it's the last step, update status
        if (index === steps.length - 1) {
          if (isBlocked) {
            consoleStatus.textContent = 'Status: Security Guard Triggered (Blocked)';
            consoleStatus.style.color = '#f43f5e';
          } else {
            consoleStatus.textContent = 'Status: Completed Successfully';
            consoleStatus.style.color = '#10b981';
          }
        }
      }, index * 400);
    });
  }

  scenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenario = btn.getAttribute('data-scenario');
      runSimulation(scenario);
    });
  });

  // Run initial simulation
  runSimulation('top_customers');
}
