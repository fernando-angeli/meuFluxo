# Arquitetura do Dashboard MeuFluxo

## Objetivo

Dashboard principal como carro-chefe: visão clara de entradas/saídas, drill-down por categoria e subcategoria, evolução temporal e listagem detalhada de movimentações, com UX premium e componentes reutilizáveis.

---

## Camada de dados

### Tipos (`@meufluxo/types`)

- **DashboardKpisResponse** (estendido):
  - `incomeByCategory: DashboardCategoryKpi[]` — entradas por categoria (mesma estrutura que expensesByCategory).
  - `temporalEvolution: DashboardTemporalSeries` — labels (eixo X) + séries de valores.
  - `movements: DashboardMovementRow[]` — listagem para a tabela (view model com nomes resolvidos).

- **DashboardTemporalSeries**: `{ labels: string[]; income: number[]; expenses: number[] }`.

- **DashboardMovementRow**: id, description, categoryName, subcategoryName, date (ISO), value, accountName, paymentMethod, status ('paga' | 'aberta' | 'projeção').

### API / Mock

- Mock estendido para retornar `incomeByCategory`, `temporalEvolution` e `movements` (dados coerentes com o período).
- API client continua recebendo o mesmo endpoint; tipos da resposta ampliados.

---

## Componentes

### 1. Página (`app/(app)/dashboard/page.tsx`)

- Orquestra filtros, KPIs e três seções analíticas.
- Seções: **Análise por categoria** → **Evolução temporal** → **Movimentações**.
- Mantém loading (skeleton), error e empty globais.

### 2. CategoryAnalysisSection

- Dois gráficos de pizza lado a lado: **Entradas por categoria** e **Saídas por categoria**.
- Estado: categoria selecionada (para o modal) e controle de abertura do modal.
- Ao clicar em uma fatia (ou legenda): abre o modal de drill-down.
- Responsivo: grid `lg:grid-cols-2`; em mobile empilha.

### 3. AnalyticPieChart (reutilizável)

- Props: `title`, `data` (DashboardCategoryKpi[]), `total`, `periodLabel?`, `onCategoryClick(category)`.
- Card com título, total consolidado, gráfico Recharts (Pie), legenda, tooltip, hover e clique.
- Usado tanto para entradas quanto para saídas; diferença só por título e dados.

### 4. CategoryDrillDownModal

- Abre ao clicar em uma categoria (entrada ou saída).
- Conteúdo: título = nome da categoria; subtítulo = período; corpo = **gráfico de pizza de subcategorias** + **listagem lateral** (nome, valor, %).
- **Seleção única**: uma subcategoria por vez; ao clicar na fatia ou na linha da lista, define a seleção; gráfico e lista destacam o item ativo.
- Estado vazio: mensagem amigável quando não há subcategorias.
- Fechar: botão e overlay; ao fechar, limpa seleção.

### 5. TemporalEvolutionChart

- Props: `data: DashboardTemporalSeries`, `periodLabel?`.
- Gráfico de evolução (Recharts: Area ou Bar) com duas séries: entradas e saídas.
- Eixo X: labels (períodos); eixo Y: valores; legenda clara; visual limpo e escalável.

### 6. DashboardMovementsTable

- Props: `movements`, `isLoading?`, `error?`.
- Colunas: id, descrição, categoria, subcategoria, data, valor, conta, forma de pagamento, status.
- Status com **Badge** (paga / aberta / projeção).
- Estados: loading (skeleton), empty, error; formatação de data e moeda; truncamento + tooltip onde fizer sentido.
- Estrutura preparada para futura paginação/ordenação.

### 7. Blocos compartilhados

- **ChartCard**: Card com header (título + opcional total) e content para gráficos; padrão visual único.
- **Badge**: componente de status (variantes success, warning, muted) para a tabela.
- Empty/Loading locais nos componentes quando necessário.

---

## Fluxo de interação

1. Usuário aplica filtros → dados do dashboard (KPIs + incomeByCategory + expensesByCategory + temporal + movements) são recarregados.
2. Clica em uma fatia (entrada ou saída) → abre CategoryDrillDownModal com a categoria; exibe pizza de subcategorias + lista.
3. No modal, clica em uma subcategoria (fatia ou linha) → seleção única atualizada; destaque visual na lista e no gráfico.
4. Evolução temporal e tabela apenas leitura; evolução futura: ordenação, paginação, filtros por coluna, clique na linha para detalhe.

---

## Responsividade e acessibilidade

- Grid responsivo: desktop lado a lado; tablet/mobile empilhado.
- Contraste, área clicável e foco visível em itens interativos.
- Tooltips onde texto for truncado; labels e legendas claros nos gráficos.
