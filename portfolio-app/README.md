# 🚀 Portfólio Profissional de Engenharia de Dados & IA

Este é o seu site de portfólio web de alta performance, construído com foco em **design premium (Dark Glassmorphism)**, responsividade e interatividade para demonstrar o projeto **Northwind AI Enterprise Platform**.

---

## ✨ Funcionalidades da Aplicação

1. **Fundo Cósmico com Estrelas & Parallax:** Canvas interativo de alta performance simulando o espaço sideral com centenas de estrelas piscantes (twinkle), estrelas cadentes periódicas e efeito de profundidade (parallax) que se move de forma suave conforme você rola a página para cima e para baixo.
2. **Integração com Deploy no Render:** Botões e banners estratégicos apontando diretamente para o painel em produção em [https://northwind-data-pipeline.onrender.com](https://northwind-data-pipeline.onrender.com).
3. **Hero Section de Alto Impacto:** Apresentação executiva com contadores de métricas de engenharia e botões de chamada para ação rápida.
4. **Showcase Interativo do Flagship Project (Northwind):**
   - **Visão Geral:** Problema de negócio, solução desenvolvida e mockup com link direto para o Render.
   - **Arquitetura Medallion & MCP Clicável:** Inspetor interativo das camadas Bronze, Silver, Gold, MCP Server, Agentes de IA e Dashboard de BI.
   - **Simulador Multi-Agente em Tempo Real:** Console interativo demonstrando a execução de queries, validação de segurança sintática AST contra SQL Injection e respostas dos 5 agentes.
   - **Desafios Técnicos:** Explicação das soluções de engenharia adotadas.
5. **Stack Técnica & Habilidades:** Matriz categorizada cobrindo Engenharia de Dados, IA/MCP, Frontend/BI e DevOps/Nuvem.
6. **Sobre Mim & Princípios de Engenharia:** Posicionamento profissional com foco em segurança de dados e governança.
7. **Seção de Contato:** Botões diretos para GitHub, LinkedIn e E-mail.

---

## 🌐 Como Publicar 100% Grátis (Passo a Passo)

### Opção 1: Vercel (Recomendado - Mais Rápido)

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o seu repositório `northwind-data-pipeline`.
4. Em **Root Directory**, clique em **Edit** e selecione a pasta `portfolio-app`.
5. Clique em **Deploy**.
6. Em menos de 1 minuto, seu portfólio estará online com HTTPS gratuito e uma URL personalizada (ex: `seu-nome-portfolio.vercel.app`).

---

### Opção 2: GitHub Pages (Sem Instalação Extra)

Você pode publicar esta pasta no GitHub Pages de duas formas simples:

#### Método A: Criando um repositório dedicado para o seu portfólio (ex: `gads1208.github.io`)
1. No GitHub, crie um novo repositório chamado `gads1208.github.io` (ou `seu-usuario.github.io`).
2. Copie os arquivos da pasta `portfolio-app/` para esse repositório:
   ```bash
   git init
   git add .
   git commit -m "feat: initial portfolio release"
   git remote add origin https://github.com/Gads1208/gads1208.github.io.git
   git branch -M main
   git push -u origin main
   ```
3. O site ficará no ar imediatamente no endereço: `https://gads1208.github.io`!

#### Método B: Branch `gh-pages` no repositório atual
```bash
git subtree push --prefix portfolio-app origin gh-pages
```
Depois vá em **Settings > Pages** no seu repositório e ative o GitHub Pages na branch `gh-pages`.

---

## ✏️ Como Personalizar Seus Dados

Abra o arquivo `portfolio-app/index.html` e edite os seguintes pontos:
1. **Nome e Título:** Linhas 24-25 e 62.
2. **Links de Redes Sociais:** No final do arquivo (linhas 360-380), substitua:
   - O link do LinkedIn: `https://linkedin.com/in/seu-perfil`
   - O seu e-mail: `mailto:seu-email@dominio.com`
   - O seu usuário no GitHub.

---

## 💻 Testando Localmente

Para abrir o portfólio no seu computador sem precisar de internet ou build:
- Basta abrir o arquivo `index.html` em qualquer navegador (Google Chrome, Firefox, Edge).
- Ou subir um servidor local rápido com Python:
  ```bash
  cd portfolio-app
  python3 -m http.server 3000
  ```
  E acessar [http://localhost:3000](http://localhost:3000).
