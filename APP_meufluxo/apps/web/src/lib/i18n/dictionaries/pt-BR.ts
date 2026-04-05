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
  "nav.overview": "Visão geral",
  "nav.finance": "Financeiro",
  "nav.system": "Sistema",
  "nav.dashboard": "Dashboard",
  "nav.movements": "Movimentos",
  "nav.accounts": "Contas",
  "nav.accounts.statement": "Extrato",
  "nav.categories": "Categorias",
  "nav.cashMovements": "Movimentos",
  "nav.scheduled": "Agendados",
  "nav.creditCards": "Cartões",
  "nav.invoices": "Faturas",
  "nav.notifications": "Notificações",
  "nav.settings": "Configurações",
  "nav.income": "Receitas",
  "nav.expenses": "Despesas",
  "nav.income.registrations": "Cadastros",
  "nav.income.receipts": "Recebimentos",
  "nav.income.history": "Histórico",
  "nav.expenses.registrations": "Cadastros",
  "nav.expenses.payments": "Baixas",
  "nav.expenses.history": "Histórico",

  // Topbar
  "topbar.notifications": "Notificações",
  "layout.searchPlaceholder": "Buscar...",

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
  "pages.accounts.title": "Contas",
  "pages.accounts.noAccounts": "Nenhuma conta cadastrada",
  "pages.settings.title": "Configurações",
  "pages.settings.description": "Preferências do app e do workspace.",
  "pages.settings.language": "Idioma",
  "pages.settings.workspace.title": "Workspace",
  "pages.settings.workspace.description": "Nome, moeda e membros (em breve).",
  "pages.settings.workspace.body":
    "Estrutura pronta para multiusuário e permissão por role.",
  "pages.settings.notifications.title": "Notificações",
  "pages.settings.notifications.description":
    "In-app e integrações futuras (WhatsApp).",
  "pages.settings.notifications.body":
    "Canal WhatsApp previsto no domínio, mas ainda não implementado.",
  "pages.settings.holidays.title": "Feriados",
  "pages.settings.holidays.description":
    "Consulta administrativa dos feriados do sistema.",
  "pages.settings.holidays.action": "Abrir listagem de feriados",
  "holidays.page.title": "Feriados",
  "holidays.page.description":
    "Visualização administrativa dos feriados cadastrados no sistema.",
  "holidays.page.listTitle": "Listagem",
  "holidays.page.emptyTitle": "Nenhum feriado encontrado",
  "holidays.page.emptyDescription":
    "Não há feriados cadastrados para os filtros selecionados.",
  "pages.notifications.title": "Notifications",
  "pages.notifications.description": "Avisos e alertas do seu workspace.",
  "pages.cashMovements.title": "Movimentos",
  "pages.scheduled.title": "Movimentos agendados",
  "pages.invoices.title": "Faturas",
  "pages.categories.title": "Categorias",
  "pages.creditCards.title": "Cartões",
  "expenses.registrations.title": "Despesas • Cadastros",
  "expenses.registrations.description":
    "Cadastre lançamentos únicos ou projeções recorrentes com revisão prévia.",
  "expenses.form.title": "Novo lançamento de despesa",
  "expenses.form.description": "Descrição",
  "expenses.form.category": "Categoria",
  "expenses.form.subCategory": "Subcategoria",
  "expenses.form.amount": "Valor",
  "expenses.form.amountBehavior": "Tipo do valor",
  "expenses.form.amountBehavior.fixed": "Fixo",
  "expenses.form.amountBehavior.estimated": "Estimado",
  "expenses.form.amountBehavior.fixedHint":
    "O valor normalmente se repete, mas ainda pode ser ajustado na baixa.",
  "expenses.form.amountBehavior.estimatedHint":
    "O valor serve como previsão e pode variar com mais frequência.",
  "expenses.form.issueDate": "Emissão",
  "expenses.form.dueDate": "Vencimento",
  "expenses.form.firstDueDate": "Primeiro vencimento",
  "expenses.form.document": "Documento",
  "expenses.form.documentPlaceholder": "Ex.: NF-1234",
  "expenses.form.datePlaceholder": "dd/mm/aaaa",
  "expenses.form.suggestedAccount": "Conta do débito",
  "expenses.form.creationType": "Tipo de criação",
  "expenses.form.creationType.single": "Único",
  "expenses.form.creationType.recurring": "Recorrente",
  "expenses.form.monthsToGenerate": "Quantidade de meses",
  "expenses.form.notes": "Observações",
  "expenses.form.selectCategory": "Selecionar categoria",
  "expenses.form.selectSubCategory": "Selecionar subcategoria",
  "expenses.form.selectAccount": "Selecionar conta",
  "expenses.form.categoriesLoading": "Carregando categorias...",
  "expenses.form.categoriesError":
    "Não foi possível carregar as categorias. Tente novamente em instantes.",
  "expenses.form.categoriesEmpty": "Nenhuma categoria de despesa disponível.",
  "expenses.form.subCategoryDisabledHint":
    "Selecione uma categoria para habilitar as subcategorias.",
  "expenses.form.subCategoriesLoading": "Carregando subcategorias...",
  "expenses.form.subCategoriesError":
    "Não foi possível carregar as subcategorias. Tente novamente em instantes.",
  "expenses.form.recurrence.sectionTitle": "Recorrência",
  "expenses.form.recurrence.intervalDays": "Intervalo",
  "expenses.form.recurrence.fixedDate": "Data",
  "expenses.form.recurrence.recurrenceType": "Recorrência",
  "expenses.form.recurrence.repetitions": "Repetições",
  "expenses.form.recurrence.intervalDaysLabel": "Intervalo (dias)",
  "expenses.form.recurrence.sentenceRepeatPrefix": "Repetir",
  "expenses.form.recurrence.sentenceIntervalMid": "vezes a cada",
  "expenses.form.recurrence.sentenceIntervalEnd": "dias",
  "expenses.form.recurrence.sentenceFixedClosing": "vezes no mesmo dia do vencimento",
  "expenses.form.recurrence.sentenceEveryDayMid": "vezes todo dia",
  "expenses.form.recurrence.fixedDayPendingHint": "defina o vencimento acima.",
  "expenses.form.recurrence.compactInterval": "Intervalo",
  "expenses.form.recurrence.compactFixed": "Data fixa",
  "expenses.form.recurrence.sentenceGroupAria": "Como repetir os lançamentos",
  "expenses.form.recurrence.previewEveryDays":
    "Serão criados {{count}} lançamentos a cada {{days}} dias",
  "expenses.form.recurrence.previewFixedDay": "Serão criados {{count}} lançamentos todo dia {{day}}",
  "expenses.form.recurrence.fixedDateHint":
    "O dia do mês fixo é definido pela data de primeiro vencimento.",
  "expenses.form.creationType.singleTitle": "Pontual",
  "expenses.form.creationType.singleDescription":
    "Cria um lançamento com o vencimento informado.",
  "expenses.form.creationType.recurringTitle": "Recorrente",
  "expenses.form.creationType.recurringDescription":
    "Cria vários lançamentos de acordo com a recorrência.",
  "expenses.form.recurrence.intervalDaysTitle": "Intervalo em dias",
  "expenses.form.recurrence.intervalDaysDescription":
    "De acordo com o intervalo de dias definido.",
  "expenses.form.recurrence.fixedDateTitle": "Data fixa",
  "expenses.form.recurrence.fixedDateDescription":
    "Usa a data de vencimento como referência.",
  "expenses.preview.title": "Revisar lançamentos antes da criação",
  "expenses.preview.description":
    "Confira os vencimentos sugeridos e ajuste os valores quando necessário antes de confirmar.",
  "expenses.preview.totalEntries": "Quantidade de lançamentos",
  "expenses.preview.order": "Parcela",
  "expenses.preview.dueDate": "Vencimento",
  "expenses.preview.document": "Documento",
  "expenses.preview.amount": "Valor",
  "expenses.preview.adjustment": "Ajuste automático",
  "expenses.preview.adjusted": "Ajustado para dia útil",
  "expenses.preview.originalDate": "Data original",
  "expenses.preview.adjustedHint":
    "A data foi ajustada automaticamente para o próximo dia útil.",
  "expenses.preview.adjustedWeekendHint":
    "Vencimento em fim de semana, ajustado para o próximo dia útil.",
  "expenses.preview.adjustedHolidayHint":
    "Vencimento em feriado, ajustado para o próximo dia útil.",
  "expenses.preview.manualDocumentChanged": "Documento alterado manualmente.",
  "expenses.preview.manualDueDateChanged": "Vencimento alterado manualmente.",
  "expenses.preview.manualAmountChanged": "Valor alterado manualmente.",
  "expenses.actions.cancel": "Cancelar",
  "expenses.actions.creating": "Criando...",
  "expenses.actions.confirmCreate": "Confirmar criação",
  "expenses.actions.generatePreview": "Gerar pré-visualização",
  "expenses.actions.createSingle": "Criar lançamento",
  "expenses.actions.saveChanges": "Salvar alterações",
  "expenses.actions.loadingPreview": "Processando...",
  "expenses.feedback.singleCreated": "Despesa criada com sucesso.",
  "expenses.feedback.batchCreated": "Lote de despesas criado com sucesso.",
  "expenses.feedback.previewEmpty": "Nenhum lançamento foi retornado no preview.",
  "expenses.feedback.submitError": "Não foi possível processar o cadastro de despesas.",
  "expenses.feedback.batchError": "Não foi possível confirmar a criação do lote.",
  "expenses.validation.categoryRequired": "Categoria é obrigatória.",
  "expenses.validation.invalidSubCategory":
    "A subcategoria selecionada não pertence à categoria informada.",
  "expenses.validation.amountRequired": "Informe o valor.",
  "expenses.validation.amountPositive": "O valor deve ser maior que zero.",
  "expenses.validation.dateInvalid": "Data inválida. Use dd/mm/aaaa ou o formato do calendário.",
  "expenses.validation.documentMaxLength": "Documento deve ter no máximo 80 caracteres.",

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
