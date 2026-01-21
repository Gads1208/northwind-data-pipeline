# 📚 Documentação do Projeto Northwind Data Pipeline

Este diretório contém toda a documentação técnica e de negócio do projeto.

## 📖 Índice de Documentos

### Visão Geral do Projeto
- **[PORTFOLIO_SUMMARY.md](PORTFOLIO_SUMMARY.md)** - Resumo executivo para portfólio
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Visão geral técnica do projeto
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura e design do sistema

### Guias de Setup
- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de início
- **[SETUP.md](SETUP.md)** - Setup completo passo a passo
- **[AIRBYTE_SETUP.md](AIRBYTE_SETUP.md)** - Configuração do Airbyte

### Guias Técnicos
- **[PYTHON_INGESTION.md](PYTHON_INGESTION.md)** - Ingestão de dados com Python
- **[COMMANDS.md](COMMANDS.md)** - Comandos úteis do projeto
- **[DATA_DICTIONARY.md](DATA_DICTIONARY.md)** - Dicionário de dados
- **[DIAGRAMS.md](DIAGRAMS.md)** - Diagramas do sistema

### Troubleshooting
- **[SOLUCAO_PERMISSOES.md](SOLUCAO_PERMISSOES.md)** - Solução de problemas de permissões
- **[TESTE_PIPELINE.md](TESTE_PIPELINE.md)** - Testes do pipeline

### Referências
- **[CHECKLIST.md](CHECKLIST.md)** - Checklist de implementação
- **[STATS.md](STATS.md)** - Estatísticas do projeto
- **[project_structure.txt](project_structure.txt)** - Estrutura de diretórios
- **[sample_queries.sql](sample_queries.sql)** - Queries SQL de exemplo

## 📊 Artefatos do dbt

Os seguintes arquivos são gerados automaticamente pelo dbt:
- `manifest.json` - Metadados do projeto dbt
- `catalog.json` - Catálogo de tabelas
- `run_results.json` - Resultados das execuções
- `graph.gpickle` - Grafo de dependências
- `index.html` - Documentação interativa

## 🔧 Estrutura de Pastas

```
docs/
├── README.md (este arquivo)
├── *.md (documentação markdown)
├── *.sql (queries de exemplo)
├── *.json (artefatos dbt)
├── compiled/ (modelos dbt compilados)
└── run/ (resultados de execuções dbt)
```

## 📝 Contribuindo

Para adicionar nova documentação:
1. Crie o arquivo .md neste diretório
2. Adicione link neste README.md
3. Use markdown padrão GitHub
4. Inclua exemplos práticos quando relevante

---

**Última atualização**: 2026-01-21
