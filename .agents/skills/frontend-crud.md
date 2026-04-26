---
name: frontend-crud
description: Ativar quando o objetivo envolver implementar, consumir ou adicionar uma nova entidade CRUD no frontend React do sistema EGRC (listagem, criação, edição, roteamento ou menu).
---

# Skill: Adição de Nova Entidade CRUD — Frontend React (EGRC)

Fluxo canônico de 5 passos para implementar completamente uma nova entidade. Siga em ordem. Não pule etapas.

---

## Passo 1 — Tela de Listagem (`src/pages/apps/tela2/lista[Entidade].js`)

### Autenticação Obrigatória
```js
const { token } = useToken(); // sempre importar e instanciar
```
Todas as requisições (`GET`, `PUT`, `DELETE`) devem incluir:
```js
headers: { "Authorization": `Bearer ${token}` }
```

### Busca de Dados em Tempo Real
- Invocar `fetch` via `GET` no endpoint da API.
- Armazenar resultado em estado local com `useState`.

### ActionCell — Inativação e Exclusão
- Inativação: `PUT` com `{ ...row, active: false }`.
- Exclusão permanente (quando aplicável): `DELETE`.

### Navegação para Edição — Código de Negócio na URL
```js
navigate(`/entidade/editar/${row.original.entityCode || row.original.id}`, {
  state: { entityData: row.original }
});
```
> ⚠️ Nunca usar o GUID bruto na URL. Priorizar sempre o campo de código de negócio.

### Limpeza de Linter
Remover imports e variáveis não utilizadas (`no-unused-vars`) antes de encerrar.

---

## Passo 2 — Formulário de Inserção e Edição (`src/pages/apps/configuracoes/novo[Entidade].js`)

### Leitura de Contexto
```js
const location = useLocation();
const { idEntidade } = useParams();
const { entityData } = location.state || {};
```

### useEffect Principal — Cache ou Busca na API
```js
useEffect(() => {
  if (idEntidade && !entityData) {
    // acesso direto por link: buscar na API
    fetch(`/api/v1/entidade/${idEntidade}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(setDados);
  } else if (entityData) {
    setDados(entityData);
  }
}, [idEntidade]);
```

### useEffect Secundário — Mapear Dados para o Formulário
```js
useEffect(() => {
  if (dados) {
    // popular campos do formulário
    // definir isEditMode = true
  }
}, [dados]);
```

### Submissão (`tratarSubmit`)
| Modo | Verbo | Observação |
|------|-------|-----------|
| Criar | `POST` | Campos preenchidos |
| Editar | `PUT` | Objeto completo incluindo `active` |

### Lógica do Botão de Enviar
```
isEditMode   → disabled se !hasChanges
isCreateMode → disabled se !todosObrigatoriosValidos
sempre       → disabled se loading === true
```

### Regras de Campos
- **Código de Negócio**: `disabled` no modo Edição (integridade referencial).
- **Seletores Autocomplete**:
  - Opções disponíveis: apenas `item.active === true`.
  - Item inativo já vinculado: exibir e manter selecionado, mas não listar como nova opção.

---

## Passo 3 — Roteamento (`MainRoutes.js`)

Garantir que as 3 rotas existam como filhas da entidade:

```js
{
  path: 'entidade',
  children: [
    { path: 'lista',      element: <ListaEntidade /> },
    { path: 'criar',      element: <NovoEntidade /> },
    { path: 'editar/:id', element: <NovoEntidade /> },
  ]
}
```

> ⚠️ Usar ferramentas de busca antes de inserir. Inserções incorretas causam erros visuais no arquivo JS.

---

## Passo 4 — Breadcrumbs (`breadcrumbsConfig.js`)

```js
'/entidade/lista':     { title: 'Nome da Entidade', parent: null },
'/entidade/criar':     { title: 'Nova Entidade',    parent: '/entidade/lista' },
'/entidade/editar/:id':{ title: 'Editar Entidade',  parent: '/entidade/lista' },
```

Observar os padrões existentes do `routeMapping` antes de inserir.

---

## Passo 5 — Menu Lateral (`src/menu-items/[area].js`)

```js
{
  id: 'entidade',
  title: 'Entidade',
  type: 'collapse',
  children: [
    {
      id: 'entidade-lista',
      title: 'Listar',
      type: 'item',
      url: '/entidade/lista',
    },
    {
      id: 'entidade-criar',
      title: 'Criar',
      type: 'item',
      url: '/entidade/criar',
      itemClassName: 'hide-route', // oculto no sidebar; acessível via botão interno
    },
    {
      id: 'entidade-editar',
      title: 'Editar',
      type: 'item',
      url: '/entidade/editar/:id',
      itemClassName: 'hide-route', // oculto no sidebar; acessível via botão interno
    },
  ]
}
```

---

## Conclusão da Tarefa

```bash
npm run build
```

- ✅ Zero erros de compilação.
- ✅ Zero avisos de ESLint (`no-unused-vars`, imports não utilizados).
- ✅ Output do build gerado como artefato de evidência.
