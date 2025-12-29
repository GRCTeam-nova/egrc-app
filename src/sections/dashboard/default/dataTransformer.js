// Função de conversão de dados em JavaScript
export const transformApiDataToReactFlow = (apiData) => {
    const nodes = [];
    const edges = [];

    if (!apiData || apiData.length === 0) {
        return { nodes: [], edges: [] };
    }

    // 1. Criar Nós e Arestas
    apiData.forEach(company => {
        const companyId = company.idCompany;
        
        // Criação do Nó
        const node = {
            id: companyId,
            type: 'companyNode', // Tipo de nó customizado
            data: {
                name: company.name,
                document: company.document,
                active: company.active,
                idCompany: companyId
            },
            position: { x: 0, y: 0 } // Posição inicial, será ajustada pelo layout
        };
        nodes.push(node);
        
        // Criação das Arestas (Relação Superior -> Inferior)
        // A relação é do superior para o inferior.
        company.companyBottoms.forEach(bottom => {
            const bottomId = bottom.idCompanyBottom;
            
            // Evita arestas duplicadas
            const edgeId = `e${companyId}-${bottomId}`;
            if (!edges.some(e => e.id === edgeId)) {
                edges.push({
                    id: edgeId,
                    source: companyId,
                    target: bottomId,
                    type: 'smoothstep', // Tipo de aresta para visual mais limpo
                    animated: !company.active // Animar se a empresa superior estiver inativa (exemplo de estilização)
                });
            }
        });
    });
    
    return { nodes, edges };
};
