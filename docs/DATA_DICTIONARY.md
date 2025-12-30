# 📊 Dicionário de Dados - Northwind Data Pipeline

Este documento descreve todas as tabelas e campos em cada camada do data warehouse.

## Índice

- [Bronze Layer](#bronze-layer)
- [Silver Layer](#silver-layer)
- [Gold Layer](#gold-layer)

---

## Bronze Layer

Camada de dados brutos ingeridos diretamente do PostgreSQL via Airbyte.

### bronze_categories

Categorias de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| category_id | INTEGER | ID único da categoria |
| category_name | STRING | Nome da categoria |
| description | STRING | Descrição da categoria |
| picture | BYTES | Imagem da categoria |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_customers

Informações dos clientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| customer_id | STRING | ID único do cliente (5 caracteres) |
| company_name | STRING | Nome da empresa |
| contact_name | STRING | Nome do contato |
| contact_title | STRING | Cargo do contato |
| address | STRING | Endereço |
| city | STRING | Cidade |
| region | STRING | Região/Estado |
| postal_code | STRING | CEP |
| country | STRING | País |
| phone | STRING | Telefone |
| fax | STRING | Fax |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_employees

Dados dos funcionários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| employee_id | INTEGER | ID único do funcionário |
| last_name | STRING | Sobrenome |
| first_name | STRING | Nome |
| title | STRING | Cargo |
| title_of_courtesy | STRING | Tratamento (Mr., Ms., etc) |
| birth_date | DATE | Data de nascimento |
| hire_date | DATE | Data de contratação |
| address | STRING | Endereço |
| city | STRING | Cidade |
| region | STRING | Região/Estado |
| postal_code | STRING | CEP |
| country | STRING | País |
| home_phone | STRING | Telefone residencial |
| extension | STRING | Ramal |
| notes | STRING | Notas/Observações |
| reports_to | INTEGER | ID do gerente |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_products

Catálogo de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| product_id | INTEGER | ID único do produto |
| product_name | STRING | Nome do produto |
| supplier_id | INTEGER | ID do fornecedor |
| category_id | INTEGER | ID da categoria |
| quantity_per_unit | STRING | Quantidade por unidade |
| unit_price | NUMERIC | Preço unitário |
| units_in_stock | INTEGER | Unidades em estoque |
| units_on_order | INTEGER | Unidades em pedido |
| reorder_level | INTEGER | Nível de reposição |
| discontinued | INTEGER | Descontinuado (0=Não, 1=Sim) |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_orders

Pedidos dos clientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| order_id | INTEGER | ID único do pedido |
| customer_id | STRING | ID do cliente |
| employee_id | INTEGER | ID do funcionário responsável |
| order_date | DATE | Data do pedido |
| required_date | DATE | Data requerida |
| shipped_date | DATE | Data de envio |
| ship_via | INTEGER | ID da transportadora |
| freight | NUMERIC | Valor do frete |
| ship_name | STRING | Nome do destinatário |
| ship_address | STRING | Endereço de entrega |
| ship_city | STRING | Cidade de entrega |
| ship_region | STRING | Região de entrega |
| ship_postal_code | STRING | CEP de entrega |
| ship_country | STRING | País de entrega |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_order_details

Detalhes dos itens de cada pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| order_id | INTEGER | ID do pedido |
| product_id | INTEGER | ID do produto |
| unit_price | NUMERIC | Preço unitário no momento do pedido |
| quantity | INTEGER | Quantidade |
| discount | FLOAT | Desconto aplicado (0 a 1) |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_suppliers

Fornecedores de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| supplier_id | INTEGER | ID único do fornecedor |
| company_name | STRING | Nome da empresa |
| contact_name | STRING | Nome do contato |
| contact_title | STRING | Cargo do contato |
| address | STRING | Endereço |
| city | STRING | Cidade |
| region | STRING | Região/Estado |
| postal_code | STRING | CEP |
| country | STRING | País |
| phone | STRING | Telefone |
| fax | STRING | Fax |
| homepage | STRING | Website |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

### bronze_shippers

Empresas de transporte.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| shipper_id | INTEGER | ID único da transportadora |
| company_name | STRING | Nome da empresa |
| phone | STRING | Telefone |
| _airbyte_ab_id | STRING | ID interno do Airbyte |
| _airbyte_emitted_at | TIMESTAMP | Data/hora de ingestão |
| _airbyte_normalized_at | TIMESTAMP | Data/hora de normalização |

---

## Silver Layer

Camada de dados limpos, padronizados e enriquecidos.

### silver_dim_customers

Dimensão de clientes com dados limpos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| customer_key | STRING | Chave surrogate (hash do customer_id) |
| customer_id | STRING | ID do cliente (business key) |
| company_name | STRING | Nome da empresa |
| contact_name | STRING | Nome do contato |
| contact_title | STRING | Cargo do contato |
| address | STRING | Endereço |
| city | STRING | Cidade |
| region | STRING | Região/Estado |
| postal_code | STRING | CEP |
| country | STRING | País |
| phone | STRING | Telefone |
| fax | STRING | Fax |
| source_updated_at | TIMESTAMP | Data da última atualização na fonte |
| dw_updated_at | TIMESTAMP | Data da última atualização no DW |

### silver_dim_products

Dimensão de produtos enriquecida com categoria e fornecedor.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| product_key | STRING | Chave surrogate |
| product_id | INTEGER | ID do produto (business key) |
| product_name | STRING | Nome do produto |
| supplier_id | INTEGER | ID do fornecedor |
| supplier_name | STRING | Nome do fornecedor |
| category_id | INTEGER | ID da categoria |
| category_name | STRING | Nome da categoria |
| category_description | STRING | Descrição da categoria |
| quantity_per_unit | STRING | Quantidade por unidade |
| unit_price | NUMERIC | Preço unitário |
| units_in_stock | INTEGER | Unidades em estoque |
| units_on_order | INTEGER | Unidades em pedido |
| reorder_level | INTEGER | Nível de reposição |
| is_discontinued | BOOLEAN | Produto descontinuado |
| source_updated_at | TIMESTAMP | Data da última atualização na fonte |
| dw_updated_at | TIMESTAMP | Data da última atualização no DW |

### silver_dim_employees

Dimensão de funcionários com métricas calculadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| employee_key | STRING | Chave surrogate |
| employee_id | INTEGER | ID do funcionário (business key) |
| first_name | STRING | Nome |
| last_name | STRING | Sobrenome |
| full_name | STRING | Nome completo |
| title | STRING | Cargo |
| title_of_courtesy | STRING | Tratamento |
| birth_date | DATE | Data de nascimento |
| hire_date | DATE | Data de contratação |
| address | STRING | Endereço |
| city | STRING | Cidade |
| region | STRING | Região/Estado |
| postal_code | STRING | CEP |
| country | STRING | País |
| home_phone | STRING | Telefone |
| extension | STRING | Ramal |
| reports_to | INTEGER | ID do gerente |
| age | INTEGER | Idade (calculada) |
| years_of_service | INTEGER | Anos de serviço (calculado) |
| source_updated_at | TIMESTAMP | Data da última atualização na fonte |
| dw_updated_at | TIMESTAMP | Data da última atualização no DW |

### silver_fact_orders

Tabela fato de pedidos com métricas agregadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| order_key | STRING | Chave surrogate |
| order_id | INTEGER | ID do pedido (business key) |
| customer_id | STRING | ID do cliente |
| employee_id | INTEGER | ID do funcionário |
| order_date | DATE | Data do pedido |
| required_date | DATE | Data requerida |
| shipped_date | DATE | Data de envio |
| ship_via | INTEGER | ID da transportadora |
| freight | NUMERIC | Valor do frete |
| ship_name | STRING | Nome do destinatário |
| ship_city | STRING | Cidade de entrega |
| ship_country | STRING | País de entrega |
| total_products | INTEGER | Total de produtos no pedido |
| total_quantity | INTEGER | Quantidade total de itens |
| order_subtotal | NUMERIC | Subtotal (sem frete) |
| total_discount_amount | NUMERIC | Total de descontos |
| order_total | NUMERIC | Total do pedido (com frete) |
| days_to_ship | INTEGER | Dias até o envio |
| delivery_status | STRING | Status da entrega (On Time/Late/Pending) |
| source_updated_at | TIMESTAMP | Data da última atualização na fonte |
| dw_updated_at | TIMESTAMP | Data da última atualização no DW |

---

## Gold Layer

Camada de agregações e métricas de negócio prontas para análise.

### gold_sales_by_country

Análise de vendas por país.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| country | STRING | País |
| total_orders | INTEGER | Total de pedidos |
| total_customers | INTEGER | Total de clientes |
| total_revenue | NUMERIC | Receita total |
| avg_order_value | NUMERIC | Valor médio do pedido |
| total_units_sold | INTEGER | Total de unidades vendidas |
| total_discounts | NUMERIC | Total de descontos concedidos |
| revenue_per_customer | NUMERIC | Receita por cliente |
| first_order_date | DATE | Data do primeiro pedido |
| last_order_date | DATE | Data do último pedido |
| updated_at | TIMESTAMP | Data da última atualização |

**Uso**: Dashboard de vendas por região, análise geográfica.

### gold_sales_by_category

Análise de vendas por categoria de produto.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| category_id | INTEGER | ID da categoria |
| category_name | STRING | Nome da categoria |
| category_description | STRING | Descrição da categoria |
| total_orders | INTEGER | Total de pedidos |
| total_products | INTEGER | Total de produtos na categoria |
| total_units_sold | INTEGER | Total de unidades vendidas |
| total_revenue | NUMERIC | Receita total |
| avg_order_line_value | NUMERIC | Valor médio por linha de pedido |
| total_discounts | NUMERIC | Total de descontos |
| revenue_per_order | NUMERIC | Receita por pedido |
| updated_at | TIMESTAMP | Data da última atualização |

**Uso**: Análise de performance de categorias, planejamento de estoque.

### gold_employee_performance

Métricas de performance dos funcionários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| employee_id | INTEGER | ID do funcionário |
| full_name | STRING | Nome completo |
| title | STRING | Cargo |
| employee_city | STRING | Cidade do funcionário |
| employee_country | STRING | País do funcionário |
| years_of_service | INTEGER | Anos de serviço |
| total_orders | INTEGER | Total de pedidos processados |
| total_customers_served | INTEGER | Total de clientes atendidos |
| total_sales | NUMERIC | Total de vendas |
| avg_order_value | NUMERIC | Valor médio do pedido |
| total_discounts_given | NUMERIC | Total de descontos concedidos |
| late_deliveries | INTEGER | Entregas atrasadas |
| on_time_deliveries | INTEGER | Entregas no prazo |
| on_time_delivery_rate | NUMERIC | Taxa de entregas no prazo (%) |
| sales_per_order | NUMERIC | Vendas por pedido |
| first_sale_date | DATE | Data da primeira venda |
| last_sale_date | DATE | Data da última venda |
| updated_at | TIMESTAMP | Data da última atualização |

**Uso**: Avaliação de performance, bônus de vendas, análise de produtividade.

### gold_customer_analytics

Análise comportamental e segmentação de clientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| customer_id | STRING | ID do cliente |
| company_name | STRING | Nome da empresa |
| contact_name | STRING | Nome do contato |
| city | STRING | Cidade |
| country | STRING | País |
| total_orders | INTEGER | Total de pedidos |
| total_spent | NUMERIC | Total gasto |
| avg_order_value | NUMERIC | Valor médio do pedido |
| total_items_purchased | INTEGER | Total de itens comprados |
| total_discounts_received | NUMERIC | Total de descontos recebidos |
| first_order_date | DATE | Data do primeiro pedido |
| last_order_date | DATE | Data do último pedido |
| days_since_last_order | INTEGER | Dias desde o último pedido |
| customer_segment | STRING | Segmento (VIP/Frequent/Regular/New) |
| activity_status | STRING | Status (Active/At Risk/Inactive) |
| updated_at | TIMESTAMP | Data da última atualização |

**Segmentação de Clientes:**
- **VIP**: 10+ pedidos
- **Frequent**: 5-9 pedidos
- **Regular**: 2-4 pedidos
- **New**: 1 pedido

**Status de Atividade:**
- **Active**: Pedido nos últimos 30 dias
- **At Risk**: Pedido entre 31-90 dias atrás
- **Inactive**: Sem pedidos há mais de 90 dias

**Uso**: Campanhas de marketing, retenção de clientes, análise de churn.

### gold_product_performance

Análise de performance de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| product_id | INTEGER | ID do produto |
| product_name | STRING | Nome do produto |
| category_name | STRING | Nome da categoria |
| supplier_name | STRING | Nome do fornecedor |
| current_unit_price | NUMERIC | Preço unitário atual |
| units_in_stock | INTEGER | Unidades em estoque |
| is_discontinued | BOOLEAN | Produto descontinuado |
| total_orders | INTEGER | Total de pedidos |
| total_units_sold | INTEGER | Total de unidades vendidas |
| total_revenue | NUMERIC | Receita total |
| avg_revenue_per_order | NUMERIC | Receita média por pedido |
| total_discounts | NUMERIC | Total de descontos |
| revenue_per_unit | NUMERIC | Receita por unidade |
| performance_tier | STRING | Classificação de performance |
| updated_at | TIMESTAMP | Data da última atualização |

**Classificação de Performance:**
- **Top Seller**: Receita ≥ $10,000
- **Good Performer**: Receita ≥ $5,000
- **Average**: Receita ≥ $1,000
- **Low Performer**: Receita > $0
- **No Sales**: Sem vendas

**Uso**: Gestão de estoque, estratégia de pricing, descontinuação de produtos.

---

## Relacionamentos entre Tabelas

### Silver Layer

```
silver_dim_customers ──┐
                       │
                       ├──▶ silver_fact_orders
                       │
silver_dim_employees ──┘

silver_dim_products ──▶ order_details (bronze) ──▶ silver_fact_orders
```

### De Silver para Gold

```
silver_fact_orders + silver_dim_customers ──▶ gold_sales_by_country
                                           ──▶ gold_customer_analytics

silver_dim_products + bronze_order_details ──▶ gold_sales_by_category
                                            ──▶ gold_product_performance

silver_fact_orders + silver_dim_employees ──▶ gold_employee_performance
```

## Convenções de Nomenclatura

### Prefixos
- `bronze_`: Dados brutos
- `silver_`: Dados limpos
- `gold_`: Agregações de negócio
- `dim_`: Tabela dimensão
- `fact_`: Tabela fato

### Sufixos
- `_id`: Chave natural/business key
- `_key`: Chave surrogate
- `_at`: Timestamp
- `_date`: Data

### Metadados Airbyte
- `_airbyte_ab_id`: ID interno único
- `_airbyte_emitted_at`: Quando foi extraído
- `_airbyte_normalized_at`: Quando foi normalizado

## Tipos de Dados

- **STRING**: Texto de tamanho variável
- **INTEGER**: Número inteiro
- **NUMERIC**: Decimal com precisão
- **FLOAT**: Ponto flutuante
- **BOOLEAN**: Verdadeiro/Falso
- **DATE**: Data (YYYY-MM-DD)
- **TIMESTAMP**: Data e hora com timezone
- **BYTES**: Dados binários

## Regras de Qualidade de Dados

### Checks Implementados
1. **Unicidade**: PKs devem ser únicas
2. **Not Null**: PKs não podem ser nulas
3. **Referential Integrity**: FKs devem existir nas tabelas referenciadas
4. **Data Freshness**: Dados devem ser atualizados nas últimas 24h
5. **Data Ranges**: Datas devem estar em intervalos válidos

## Atualizações

Este dicionário é atualizado sempre que:
- Novos campos são adicionados
- Transformações são modificadas
- Novas tabelas são criadas
- Regras de negócio mudam

**Última atualização**: 2024-12-29
