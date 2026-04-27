---
trigger: always_on
---

---
name: Frontend CRUD Entity Standard (EGRC)
description: Regras obrigatórias para implementação de novas entidades, telas de listagem e formulários no projeto EGRC.
filters:
  - pattern: "src/pages/apps/**"
  - pattern: "src/MainRoutes.js"
---

# EGRC Frontend Rules

Sempre que o usuário solicitar a criação, edição ou ajuste de uma entidade de frontend (CRUD), aplique rigorosamente as seguintes regras:

## 1. Segurança e Requisições
- **Autenticação**: É obrigatório o uso do hook `useToken`. Todas as requisições (`fetch`, `axios`, etc.) devem incluir o header `Authorization: Bearer ${token}`.
- **Verbos HTTP**: 
    - `GET` para listagem e busca de item único.
    - `POST` para novas criações.
    - `PUT` para atualizações (enviar objeto completo).
    - `DELETE` ou `PUT` (active: false) para remoção conforme contexto.

## 2. Roteamento e Navegação
- **Padrão de URL**: Utilize o Código de Negócio (ex: `indicatorCode`) em vez do ID (GUID) para rotas de edição sempre que disponível.
- **Passagem de Estado**: Ao navegar da Lista para a Edição, envie os dados da linha via `location.state` para evitar requisições desnecessárias: `{ state: { entityData: row.original } }`.
- **Configuração de Rotas**: No `MainRoutes.js`, garanta a existência das três rotas: `lista`, `criar` e `editar/:id`.

## 3. Comportamento de Formulário (Edit/Create)
- **Componente Único**: Utilize o mesmo componente para criação e edição.
- **Hydration**: No `useEffect`, se `location.state` estiver vazio mas houver um ID na URL, dispare um `GET` para recuperar os dados.
- **Campos Bloqueados**: O campo de identificador manual (Código de Negócio) deve estar `disabled` no modo de Edição.
- **Estado do Botão Submit**:
    - Deve estar `disabled` se `loading` for true.
    - No modo **Edição**: `disabled` até que `hasChanges` seja true.
    - No modo **Criação**: `disabled` até que todos os campos obrigatórios sejam válidos.

## 4. Componentes de UI
- **Autocomplete/Selects**: Filtre as opções para mostrar apenas `item.active === true`. Em edições, se o valor atual for inativo, ele deve ser mantido na exibição, mas não sugerido para novos registros.
- **Menu Lateral**: Adicione a classe `hide-route` para rotas de "Criar" e "Editar" no arquivo de configuração do menu.
- **Breadcrumbs**: Defina sempre a rota de `lista` como `parent` das rotas de criação e edição.

## 5. Qualidade de Código
- **Limpeza**: Remova obrigatoriamente qualquer import ou variável não utilizada (`no-unused-vars`).
- **Build**: O código gerado deve ser compatível com as regras do ESLint do projeto para não quebrar o `npm run build`.