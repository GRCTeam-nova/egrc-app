// Configuração centralizada para o sistema de breadcrumbs
// Este arquivo permite fácil manutenção e adição de novas rotas

export const routeMapping = {
  // Dashboard
  '/dashboard/resumo': { title: 'Resumo', parent: null },
  '/dashboard/analytics': { title: 'Analytics', parent: null },
  
  // Empresas
  '/empresas/lista': { title: 'Empresas', parent: null },
  '/empresas/criar': { title: 'Nova Empresa', parent: '/empresas/lista' },
  
  // Departamentos
  '/departamentos/lista': { title: 'Departamentos', parent: null },
  '/departamentos/criar': { title: 'Novo Departamento', parent: '/departamentos/lista' },
  
  // Processos
  '/processos/lista': { title: 'Processos', parent: null },
  '/processos/criar': { title: 'Novo Processo', parent: '/processos/lista' },
  
  // Dados
  '/dados/lista': { title: 'Dados', parent: null },
  '/dados/criar': { title: 'Novo Dado', parent: '/dados/lista' },
  
  // Contas
  '/contas/lista': { title: 'Contas', parent: null },
  '/contas/criar': { title: 'Nova Conta', parent: '/contas/lista' },
  
  // Ativos
  '/ativos/lista': { title: 'Ativos', parent: null },
  '/ativos/criar': { title: 'Novo Ativo', parent: '/ativos/lista' },
  
  // Riscos
  '/riscos/lista': { title: 'Riscos', parent: null },
  '/riscos/criar': { title: 'Novo Risco', parent: '/riscos/lista' },
  
  // Ciclos
  '/ciclos/lista': { title: 'Ciclos', parent: null },
  '/ciclos/criar': { title: 'Novo Ciclo', parent: '/ciclos/lista' },
  
  // Avaliações
  '/avaliacoes/lista': { title: 'Avaliações de Risco', parent: null },
  '/avaliacoes/criar': { title: 'Nova Avaliação de Risco', parent: '/avaliacoes/lista' },
  
  // Índices
  '/indices/lista': { title: 'Índices', parent: null },
  '/indices/criar': { title: 'Novo Índice', parent: '/indices/lista' },
  
  // Questionários
  '/questionarios/criar': { title: 'Novo Questionário', parent: '/avaliacoes/criar' },
  
  // Incidentes
  '/incidentes/lista': { title: 'Incidentes', parent: null },
  '/incidentes/criar': { title: 'Novo Incidente', parent: '/incidentes/lista' },
  
  // Categorias
  '/categorias/lista': { title: 'Categorias', parent: null },
  '/categorias/criar': { title: 'Nova Categoria', parent: '/categorias/lista' },
  
  // Perfis
  '/perfis/lista': { title: 'Perfis', parent: null },
  '/perfis/criar': { title: 'Novo Perfil', parent: '/perfis/lista' },
  
  // Controles
  '/controles/lista': { title: 'Controles', parent: null },
  '/controles/criar': { title: 'Novo Controle', parent: '/controles/lista' },
  
  // IPEs
  '/ipes/lista': { title: 'IPEs', parent: null },
  '/ipes/criar': { title: 'Novo IPE', parent: '/ipes/lista' },
  
  // Objetivos
  '/objetivos/lista': { title: 'Objetivos', parent: null },
  '/objetivos/criar': { title: 'Novo Objetivo', parent: '/objetivos/lista' },
  
  // Fase de Teste
  '/fase/lista': { title: 'Fases de Teste', parent: null },
  '/fase/criar': { title: 'Fase', parent: '/testes/criar' },

  // Perfil ESG
  '/esg/lista': { title: 'Perfil ESG', parent: null },
  '/esg/criar': { title: 'Novo Perfil ESG', parent: '/esg/lista' },
  
  // Indicadores
  '/indicadores/lista': { title: 'Indicadores', parent: null },
  '/indicadores/criar': { title: 'Novo Indicador', parent: '/indicadores/lista' },
  
  // Ciclo priorização
  '/priorizacao/lista': { title: 'Ciclo Priorização', parent: null },
  '/priorizacao/criar': { title: 'Novo Ciclo Priorização', parent: '/priorizacao/lista' },
  
  // Medidas
  '/medida/lista': { title: 'Medidas', parent: null },
  '/medida/criar': { title: 'Nova Medida', parent: '/medida/lista' },
  
  // Medidas
  '/dimensao/lista': { title: 'Dimensões', parent: null },
  '/dimensao/criar': { title: 'Nova dimensão', parent: '/dimensao/lista' },
  
  // Fonte de Dados
  '/fonteDeDados/lista': { title: 'Fonte de dados', parent: null },
  '/fonteDeDados/criar': { title: 'Nova fonte de dados', parent: '/fonteDeDados/lista' },
  
  // Fatores Emissão
  '/fatoresEmissao/lista': { title: 'Fatores de emissão', parent: null },
  '/fatoresEmissao/criar': { title: 'Novo fator de emissão', parent: '/fatoresEmissao/lista' },

  // Gestão de Coletas
  '/gestaoColeta/lista': { title: 'Gestão de Coletas', parent: null },
  
  // Funcionários / Colaboradores
  '/colaboradores/lista': { title: 'Colaboradores', parent: null },
  '/colaboradores/criar': { title: 'Novo Colaborador', parent: '/colaboradores/lista' },
  '/colaboradores/trocar-senha': { title: 'Trocar Senha', parent: null },
  
  // Temas
  '/tema/lista': { title: 'Temas', parent: null },
  '/tema/criar': { title: 'Novo Tema', parent: '/tema/lista' },
  
  // Impacto ESG
  '/impactoEsg/lista': { title: 'Impacto ESG', parent: null },
  '/impactoEsg/criar': { title: 'Novo Impacto ESG', parent: '/impactoEsg/lista' },
  
  // Grupo Temas
  '/grupoTemas/lista': { title: 'Grupo', parent: null },
  '/grupoTemas/criar': { title: 'Novo Grupo', parent: '/grupoTemas/lista' },
  
  // Coleta
  '/coleta/lista': { title: 'Métrica com coleta', parent: null },
  '/coleta/criar': { title: 'Nova métrica', parent: '/coleta/lista' },
  
  // Padrões e frameworks
  '/padroesFrameworks/lista': { title: 'Padrões e frameworks', parent: null },
  '/padroesFrameworks/criar': { title: 'Novo padrão', parent: '/padroesFrameworks/lista' },
  
  // ODS
  '/ods/lista': { title: 'ODS', parent: null },
  '/ods/criar': { title: 'Novo ODS', parent: '/ods/lista' },
  
  // Projetos
  '/projetos/lista': { title: 'Projetos', parent: null },
  '/projetos/criar': { title: 'Novo Projeto', parent: '/projetos/lista' },
  
  // Normativas
  '/normativas/lista': { title: 'Normativas', parent: null },
  '/normativas/criar': { title: 'Nova Normativa', parent: '/normativas/lista' },
  
  // Planos
  '/planos/lista': { title: 'Planos', parent: null },
  '/planos/criar': { title: 'Novo Plano', parent: '/planos/lista' },
  
  // Deficiências
  '/deficiencias/lista': { title: 'Deficiências', parent: null },
  '/deficiencias/criar': { title: 'Nova Deficiência', parent: '/deficiencias/lista' },
  
  // Testes
  '/testes/lista': { title: 'Testes', parent: null },
  '/testes/criar': { title: 'Novo Teste', parent: '/testes/lista' }
};

// Função utilitária para adicionar novas rotas facilmente
export const addRoute = (path, title, parent = null) => {
  routeMapping[path] = { title, parent };
};

// Função para obter informações de uma rota
export const getRouteInfo = (path) => {
  return routeMapping[path] || null;
};

// Função para construir o caminho do breadcrumb
export const buildBreadcrumbPath = (pathname) => {
  const items = [];
  const currentRoute = routeMapping[pathname];
  
  if (!currentRoute) {
    return items;
  }

  // Construir o caminho recursivamente
  const buildPath = (route) => {
    if (route.parent) {
      const parentRoute = routeMapping[route.parent];
      if (parentRoute) {
        buildPath(parentRoute);
        items.push({
          title: parentRoute.title,
          path: route.parent,
          isLink: true
        });
      }
    }
  };

  buildPath(currentRoute);
  
  // Adicionar o item atual (sem link)
  items.push({
    title: currentRoute.title,
    path: pathname,
    isLink: false
  });

  return items;
};

