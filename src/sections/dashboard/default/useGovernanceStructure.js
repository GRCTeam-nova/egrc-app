import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext"; // Assumindo que TokenContext existe e fornece useToken

/**
 * Transforma a lista de empresas da API em uma estrutura de árvore para o react-d3-tree.
 * @param {Array} apiData - Dados brutos da API.
 * @returns {Array} Dados no formato de árvore.
 */
const transformDataToTree = (apiData) => {
  // 1. Criar um mapa de todas as empresas por idCompany para acesso rápido
  const companiesMap = apiData.reduce((acc, company) => {
    acc[company.idCompany] = {
      name: company.name,
      attributes: {
        Documento: company.document,
        Ativa: company.active ? 'Sim' : 'Não',
      },
      children: [],
      // Adicionar o ID para rastreamento de raiz
      id: company.idCompany, 
    };
    return acc;
  }, {});

  // Conjunto para rastrear todos os IDs que são filhos de alguma empresa
  const allChildrenIds = new Set();

  // 2. Construir as relações pai-filho
  apiData.forEach(company => {
    const parentId = company.idCompany;
    const parentNode = companiesMap[parentId];

    if (parentNode) {
      company.companyBottoms.forEach(bottomCompany => {
        const childId = bottomCompany.idCompanyBottom;
        allChildrenIds.add(childId);
        
        const childNode = companiesMap[childId];
        
        // Adicionar o filho ao array 'children' do pai, se o nó filho existir no mapa
        if (childNode) {
          // Verifica se o filho já foi adicionado para evitar duplicação (baseado no ID)
          if (!parentNode.children.some(child => child.id === childId)) {
            parentNode.children.push(childNode);
          }
        }
      });
    }
  });

  // 3. Identificar a(s) raiz(es): empresas que não estão no conjunto de filhos
  const rootNodes = Object.values(companiesMap).filter(node => !allChildrenIds.has(node.id));

  // 4. Se houver mais de uma raiz, criar um nó "fantasma" para uni-las
  if (rootNodes.length > 1) {
    return [{
      name: 'Estrutura Societária',
      attributes: { Tipo: 'Raiz Agregadora' },
      children: rootNodes,
    }];
  } else if (rootNodes.length === 1) {
    return rootNodes;
  } else {
    // Caso não haja dados ou a estrutura seja totalmente circular/desconectada
    return [];
  }
};

/**
 * Hook customizado para buscar a estrutura de governança e transformá-la em dados de árvore.
 * @param {string} endpoint - O endpoint da API.
 * @returns {{treeData: Array, isLoading: boolean, error: string | null}}
 */
export function useGovernanceStructure(endpoint) {
  const [treeData, setTreeData] = useState([]);
  const { setToken } = useToken(); // Para manter o padrão de empresa.js
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Token de acesso não encontrado no localStorage.");
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar dados da estrutura de governança: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Transforma os dados brutos em formato de árvore
      const transformedData = transformDataToTree(data);
      
      setTreeData(transformedData);
      setToken(token); // Atualiza o token no contexto, seguindo o padrão de empresa.js

    } catch (err) {
      console.error("Erro na busca ou transformação dos dados:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, setToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    treeData,
    isLoading,
    error,
  };
}

// Exportar a função de transformação para testes ou uso externo, se necessário
export { transformDataToTree };
