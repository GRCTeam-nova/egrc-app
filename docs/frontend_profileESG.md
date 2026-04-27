### Guia para Desenvolvedor Frontend: Integração do ProfileESG

Este guia detalha o fluxo de trabalho e as rotas necessárias para a criação e edição de Perfis ESG, incluindo a gestão de listas de níveis (`LevelLists`) e indicadores de níveis (`LevelIndicators`).

---

### 1. Fluxo Lógico de Implementação

Devido à dependência hierárquica entre as entidades, a implementação no frontend deve seguir estes passos:

1.  **Criação/Edição do Perfil**: O usuário define as informações básicas do perfil e os **nomes** das listas de níveis que ele deseja (ex: "Impacto", "Probabilidade").
2.  **Obtenção de IDs**: Após salvar o perfil, o frontend deve consultar os detalhes do perfil para obter os `IDs` gerados automaticamente para cada `LevelList`.
3.  **Configuração de Indicadores**: Com os `IDs` das listas em mãos, o usuário pode adicionar os indicadores específicos (ex: "Baixo", "Médio", "Alto") para cada lista.

---

### 2. Rotas da API

*   **Listar Perfis**: `GET /api/v1/ProfileESG`
*   **Detalhes do Perfil**: `GET /api/v1/ProfileESG/{id}`
*   **Criar Perfil**: `POST /api/v1/ProfileESG`
*   **Atualizar Perfil**: `PUT /api/v1/ProfileESG`
*   **Criar Indicador**: `POST /api/v1/LevelIndicator`

---

### 3. Tela de Criação (Novo Perfil)

Na criação, enviamos apenas os nomes das listas de níveis em `levelListNames`. O backend criará essas listas automaticamente vinculadas ao novo perfil.

**Requisição: `POST /api/v1/ProfileESG`**
```json
{
  "profileCode": "ESG-2024-001",
  "profileESGName": "Perfil Padrão de Sustentabilidade",
  "profileESGDescription": "Descrição detalhada do perfil para avaliação de indicadores ESG.",
  "levelListNames": [
    "Nível de Impacto",
    "Probabilidade de Ocorrência"
  ],
  "stakeholderIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "47c23178-0c67-4e73-9a3d-4c3d4a46a6f3"
  ],
  "prioritizationCycleIds": [
    "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
  ]
}
```

**Resposta de Sucesso (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "idProfileESG": "b9d8e7f6-a5b4-c3d2-e1f0-987654321abc"
  },
  "notifications": []
}
```

---

### 4. Tela de Edição (Atualizar Perfil)

Na edição, a lista enviada em `levelListNames` substitui integralmente a anterior. Se você remover um nome da lista, a `LevelList` correspondente será removida do banco.

**Requisição: `PUT /api/v1/ProfileESG`**
```json
{
  "id": "b9d8e7f6-a5b4-c3d2-e1f0-987654321abc",
  "profileCode": "ESG-2024-001-REV",
  "profileESGName": "Perfil Padrão de Sustentabilidade - Revisado",
  "profileESGDescription": "Descrição atualizada com novos critérios de avaliação.",
  "active": true,
  "levelListNames": [
    "Nível de Impacto",
    "Probabilidade",
    "Nível de Urgência"
  ],
  "stakeholderIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "prioritizationCycleIds": [
    "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
  ]
}
```

---

### 5. Cadastro de Indicadores (Próximo Passo)

Após criar ou editar o perfil, você deve dar um `GET /api/v1/ProfileESG/{id}` para obter os IDs das listas. Exemplo de retorno:

```json
{
  "id": "...",
  "levelLists": [
    { "id": "uuid-da-lista-impacto", "levelListName": "Nível de Impacto" },
    { "id": "uuid-da-lista-probabilidade", "levelListName": "Probabilidade" }
  ]
}
```

Com o ID `uuid-da-lista-impacto`, o usuário poderá adicionar indicadores para essa lista específica:

**Requisição: `POST /api/v1/LevelIndicator`**
```json
{
  "levelIndicatorName": "Alto Impacto",
  "value": 3,
  "cssColor": "#FF0000",
  "levelListId": "uuid-da-lista-impacto"
}
```

### Observações Importantes
- **Substituição de Relações**: Sempre que você enviar o `PUT` do Perfil, o backend limpa as relações de `Stakeholders`, `PrioritizationCycles` e `LevelLists` e as recria com base nos arrays enviados.
- **Nomes de Listas**: O campo `levelListNames` é uma lista simples de strings. Use isso para permitir que o usuário adicione ou remova "categorias" de níveis dinamicamente.