---
name: Adição de Nova Entidade CRUD (Frontend React)
description: Passos completos para configurar corretamente as telas de uma nova entidade no EGRC.
---

# Instruções para o Especialista de Frontend: Adição Completa de Nova Entidade.

Quando você receber o objetivo de implementar e consumir uma nova API ou adicionar uma nova entidade do sistema EGRC (como listagem, tela de criação e edição), você deve seguir o rigoroso passo a passo definido abaixo. Essa rotina garante o funcionamento completo, desde requisições e segurança até o roteamento e estilização de navegação.

## Passo 1: Ajuste a Tela de Listagem (`src/pages/apps/tela2/lista[Entidade].js`)
A listagem deve buscar os dados em tempo real da API e gerenciar as funções das linhas (como Exclusão ou Inativação).

1. **Obtenção Segura**: 
   - Certifique-se de importar e instanciar `const { token } = useToken()`.
   - Refatore o hook ou a variável de buscar os dados para invocar `fetch` via `GET` no endpoint da API.
   - Insira obrigatoriamente, em todas as requisições (`GET`, `PUT`, `DELETE`), os headers de autenticação:
     ```json
     { "Authorization": "Bearer ${token}" }
     ```
2. **Atualização/Inativação de Registros (ActionCell)**:
   - Configure a função da célula ou o clique nos reticências da tabela para atualizar (`PUT`) desativando o `active`, ou fazendo hard delete via (`DELETE`).
3. **Navegação de Edição (Uso de Business Code)**:
   - O botão que envia o usuário para Edição deve usar o `useNavigate()`;
   - **Padrão de URL**: Priorize o uso do **Código de Negócio** (ex: `indicatorCode`, `measureCode`, `sdgCode`) na URL em vez do ID (GUID), para URLs mais amigáveis: `/entidade/editar/${row.original.entityCode || row.original.id}`.
   - Envie o objeto atual da linha dentro do `location.state` para performance: `{ state: { entityData: row.original } }`.
4. **Limpeza de Linter (ESLint)**:
   - Remova imports e variaveis não utilizadas antes de encerrar o arquivo (`no-unused-vars`).

## Passo 2: Ajuste o Formulário de Inserção e Edição (`src/pages/apps/configuracoes/novo[Entidade].js`)
Esta será a tela compartilhada para criar ou processar a atualização individual do item.

1. **Preenchimento Inicial Misto (`useEffect`)**:
   - Utilize as ferramentas de leitura do React Router: `const location = useLocation();` e `const { id[NomeID] } = useParams();`.
   - Receba inicialmente os valores do array via cache da tela de lista com `const { dadosApi } = location.state || {}`.
   - Crie um `useEffect` principal responsável pela API: se a rota possuir um **ID**, porém o cache `dadosApi` estiver vazio (acesso direto do link), faça um `GET` no item ou na lista completa filtrada da API usando o token e armazene este item.
   - Em um segundo `useEffect`, analise esses dados obtidos e mapeie os valores para os formulários nos locais corretos alterando automaticamente o estado da página para "Editar".
2. **Submissão de Dados (`tratarSubmit`)**:
   - Valide se está no modo criar (utilize o verbo `POST`) ou modo editar (utilize o verbo `PUT`).
   - A requisição `PUT` deve enviar o objeto completo, incluindo o campo `active`.
   - **Lógica do Botão de Enviar**:
     - No modo **Editar**: O botão deve estar `disabled` até que haja uma alteração no formulário (`hasChanges`).
     - No modo **Criar**: O botão deve estar `disabled` até que todos os campos obrigatórios estejam preenchidos e válidos.
     - Sempre desabilitar enquanto `loading` for true.
3. **Regras de Negócio de Campos**:
   - **Código de Negócio**: O campo de código (identificador manual) deve ser **desabilitado** (`disabled`) no modo Edição para manter a integridade referencial.
   - **Seletores (Autocomplete)**:
     - Regra de Filtro: Apenas itens ativos (`item.active === true`) devem aparecer na listagem de opções.
     - Regra de Edição: Se um registro já possui um item vinculado que se tornou inativo, ele deve continuar sendo exibido e selecionado, mas não deve aparecer como opção para novos vínculos.

## Passo 3: Configurar Roteamento e 404 (`MainRoutes.js`)
Configurar o roteador do projeto assegurando o carregamento nas views corretas.

1. Acesse o JSON do `MainRoutes.js`.
2. Localize a área do menu (ex: `children` principal) ou a declaração unificada de suas rotas.
3. Garanta que todas as 3 permutações existam como rotas filhas na sua chave da entidade:
   - `path: 'lista'` — Componente de Lista.
   - `path: 'criar'` — Componente de Criação / Edição.
   - `path: 'editar/:id'` — Exatamente o mesmo Componente de Criação / Edição. 
*(Obs: Utilize exatamente as ferramentas de busca de arquivo. Faça inserções de rotas com extremo cuidado pra não causar erros visuais no arquivo JS)*.

## Passo 4: Atualize os Itens de Breadcrumb e Trilha de Página (`breadcrumbsConfig.js`)
Permita que o componente Breadcrumb consiga criar a trilha visual até a página alvo.

1. Navegue e observe os padrões existentes para `routeMapping`.
2. Adicione os metadados textuais da tela principal de listagem definindo `parent: null`, com o Título.
3. Crie os metadados exatos para as rotas `/entidade/criar`, bem como separadamente da rota `/entidade/editar/<<idVariavelConfig>>`, vinculando `parent: "/entidade/lista"`. 

## Passo 5: Atualize o Elemento Físico de Menu (`src/menu-items/[area].js`)
Configure as rotas visíveis e restrinja as escondidas.

1. Adicione a sua Entidade como um Menu Item contendo a sub-categoria Listar e Criar.
2. Como geralmente o design do EGRC não mostra um item chamado "Editar [X]" estático do Menu, use e repasse a string ou classe CSS predefinida de **"hide-route"** para que a tela não quebre a interface do sidebar lateral, mas ainda exista para controle global.
3. Exemplo rápido: incluir `itemClassName: 'hide-route'` para as rotas específicas filhas (como as de Criar e de Editar) a fim de deixá-las operantes apenas via cliques nos botões internos dentro das Listagens padrão.

Conclua confirmando o funcionamento por um "npm run build" rodando sem disparos do Eslint.
