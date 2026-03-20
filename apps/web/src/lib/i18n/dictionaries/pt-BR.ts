/**
 * Dicionário PT-BR (fonte das chaves do sistema).
 * Todas as chaves devem existir aqui e nos outros idiomas.
 */
export const ptBR = {
  // App / marca
  "app.tagline": "Controle financeiro pessoal",

  // Navegação (sidebar e menu)
  "nav.main": "Navegação principal",
  "nav.openMenu": "Abrir menu",
  "nav.closeMenu": "Fechar menu",
  "nav.menu": "Menu de navegação",
  "nav.overview": "Overview",
  "nav.finance": "Finance",
  "nav.system": "System",
  "nav.dashboard": "Dashboard",
  "nav.accounts": "Accounts",
  "nav.categories": "Categories",
  "nav.cashMovements": "Cash Movements",
  "nav.scheduled": "Scheduled",
  "nav.creditCards": "Credit Cards",
  "nav.invoices": "Invoices",
  "nav.notifications": "Notifications",
  "nav.settings": "Settings",

  // Topbar
  "topbar.notifications": "Notificações",

  "userMenu.guest": "Usuário",
  "userMenu.myAccount": "Minha conta",
  "userMenu.preferences": "Preferências",
  "userMenu.logout": "Sair",

  // Tema
  "theme.toggle": "Alternar tema",

  // Workspace
  "workspace.label": "Workspace",
  "workspace.switch": "Trocar workspace",
  "workspace.list": "Workspaces",
  "workspace.addSoon": "Adicionar workspace (em breve)",
  "workspace.family": "Família",
  "workspace.none": "Nenhum",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.errorSummary": "Resumo financeiro do período.",
  "dashboard.indicators": "Indicadores principais",
  "dashboard.currentBalance": "Saldo atual",
  "dashboard.income": "Receitas",
  "dashboard.expenses": "Despesas",
  "dashboard.netBalance": "Saldo líquido",
  "dashboard.analysisByCategory": "Análise por categoria",
  "dashboard.temporalEvolution": "Evolução temporal",
  "dashboard.movements": "Movimentações",
  "dashboard.incomeByCategory": "Entradas por categoria",
  "dashboard.expensesByCategory": "Saídas por categoria",
  "dashboard.temporalEvolutionFull": "Evolução temporal (entradas x saídas)",
  "dashboard.noDataInPeriod": "Nenhum dado no período",
  "dashboard.emptyMessage": "Nenhum movimento no período. Ajuste as datas ou cadastre movimentações.",
  "dashboard.loadError": "Não foi possível carregar o dashboard.",

  // Filtros
  "filters.period": "Período",
  "filters.type": "Tipo",
  "filters.year": "Ano",
  "filters.quickMonths": "Atalhos de mês",
  "filters.accounts": "Contas",
  "filters.categories": "Categorias",
  "filters.subcategories": "Subcategorias",
  "filters.all": "Todos",
  "filters.allAccounts": "Todas as contas",
  "filters.allCategories": "Todas as categorias",
  "filters.allSubcategories": "Todas as subcategorias",
  "filters.select": "Selecionar",
  "filters.selectPeriod": "Selecionar período",
  "filters.apply": "Aplicar",
  "filters.noOption": "Nenhuma opção",
  "filters.noAccount": "Nenhuma conta",
  "filters.noCategory": "Nenhuma categoria",
  "filters.noSubcategory": "Nenhuma subcategoria",
  "filters.loading": "Carregando...",
  "filters.movementType.all": "Todos",
  "filters.movementType.income": "Receita",
  "filters.movementType.expense": "Despesa",

  // Tabelas (cabeçalhos e colunas)
  "table.date": "Data",
  "table.dueAt": "Vencimento",
  "table.title": "Título",
  "table.description": "Descrição",
  "table.category": "Categoria",
  "table.account": "Conta",
  "table.amount": "Valor",
  "table.balance": "Saldo",
  "table.status": "Status",
  "table.month": "Mês",
  "table.card": "Cartão",
  "table.total": "Total",
  "table.name": "Nome",
  "table.type": "Tipo",
  "table.parent": "Pai",

  // Status
  "status.active": "Ativa",
  "status.inactive": "Inativa",

  // Páginas (títulos e descrições)
  "pages.accounts.title": "Accounts",
  "pages.accounts.noAccounts": "Nenhuma conta cadastrada",
  "pages.settings.title": "Settings",
  "pages.settings.description": "Preferências do app e do workspace.",
  "pages.settings.language": "Idioma",
  "pages.notifications.title": "Notifications",
  "pages.notifications.description": "Avisos e alertas do seu workspace.",
  "pages.cashMovements.title": "Cash Movements",
  "pages.scheduled.title": "Scheduled Movements",
  "pages.invoices.title": "Invoices",
  "pages.categories.title": "Categories",
  "pages.creditCards.title": "Credit Cards",

  // Auth / Login
  "auth.login": "Entrar",
  "auth.loginDescription": "Acesse seu workspace e acompanhe seu financeiro.",
  "auth.email": "E-mail",
  "auth.password": "Senha",
  "auth.placeholderEmail": "voce@exemplo.com",
  "auth.entering": "Entrando...",
  "auth.noAccount": "Ainda sem conta?",
  "auth.createWorkspace": "Criar workspace (em breve)",

  // Comum / acessibilidade
  "common.close": "Fechar",
  "footer.ready": "v0 • pronto para integrar com API REST",
} as const;

export type PtBRKeys = keyof typeof ptBR;
