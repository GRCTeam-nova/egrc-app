# Workflow: /newentity

Invoque para adicionar uma nova entidade CRUD completa no frontend, quando a API já existe e está documentada.

**Uso:** `/newentity [NomeEntidade] | [/api/v1/endpoint] | [campoCode]`

**Exemplo:** `/newentity Fornecedores | /api/v1/suppliers | supplierCode`

---

## Pré-verificação (antes de escrever qualquer código)

Produzir um artefato **Plano de Implementação** contendo:

```markdown
## Plano — [NomeEntidade]

**API:** [endpoint base]
**Código de negócio na URL:** [campoCode]

### Arquivos que serão criados
- [ ] src/pages/apps/tela2/lista[Entidade].js
- [ ] src/pages/apps/configuracoes/novo[Entidade].js

### Arquivos que serão modificados
- [ ] src/MainRoutes.js
- [ ] src/breadcrumbsConfig.js
- [ ] src/menu-items/[area].js

### Campos do formulário
| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|-----------|
| ...   | ...  | ...         | ...        |
```

Aguardar aprovação do plano antes de prosseguir.

---

## Execução — 5 Passos (`frontend-crud.md`)

- [ ] **Passo 1** — `lista[Entidade].js`
  - `useToken()` + headers Bearer em todas as requisições.
  - ActionCell: inativar (`PUT active:false`) ou deletar (`DELETE`).
  - Navegação para edição usando `[campoCode]` na URL + `location.state`.

- [ ] **Passo 2** — `novo[Entidade].js`
  - `useLocation()` + `useParams()`.
  - `useEffect` principal: cache do `location.state` ou `GET` à API.
  - `useEffect` secundário: mapear dados para o formulário.
  - Submit: `POST` (criar) ou `PUT` com objeto completo (editar).
  - Botão `disabled` por `hasChanges` / campos válidos / `loading`.
  - Código de negócio `disabled` no modo edição.
  - Seletores: apenas `active === true` para novos vínculos.

- [ ] **Passo 3** — `MainRoutes.js`
  - Rotas: `lista`, `criar`, `editar/:id`.

- [ ] **Passo 4** — `breadcrumbsConfig.js`
  - Entradas para `lista` (parent: null), `criar` e `editar/:id` (parent: lista).

- [ ] **Passo 5** — `src/menu-items/[area].js`
  - Item de menu para `lista`.
  - `itemClassName: 'hide-route'` para `criar` e `editar`.

---

## Conclusão

```bash
npm run build
```

Gerar output do build como artefato. Zero erros de compilação e ESLint obrigatórios.
