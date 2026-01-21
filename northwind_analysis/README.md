# 📊 Análise Descritiva Northwind - Comportamento de Clientes e Vendas

Projeto de análise descritiva completa utilizando a base de dados clássica Northwind, com foco em comportamento de clientes e análise de vendas.

## 🎯 Objetivos

- Analisar padrões de comportamento de compra dos clientes
- Identificar produtos mais vendidos e categorias de maior receita
- Avaliar performance de vendas por período, região e funcionários
- Gerar insights visuais sobre o negócio

## 🛠️ Tecnologias

- **Python 3.11+**
- **Pandas** - Manipulação de dados
- **Matplotlib** - Visualizações básicas
- **Seaborn** - Visualizações estatísticas
- **Plotly** - Gráficos interativos
- **PostgreSQL** - Banco de dados fonte
- **SQLAlchemy** - Conexão com banco de dados

## 📋 Pré-requisitos

1. Docker e Docker Compose instalados
2. Python 3.11+
3. Banco de dados Northwind rodando (via docker-compose do projeto principal)

## 🚀 Instalação

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt