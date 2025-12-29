import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext"; 

/**
 * Transforma a lista de departamentos da API em uma estrutura de árvore.
 * @param {Array} apiData - Dados brutos da API (Lista plana de departamentos).
 * @returns {Array} Dados no formato de árvore hierárquica.
 */
const transformDataToTree = (apiData) => {
  if (!Array.isArray(apiData)) return [];

  // 1. Criar um mapa de todos os departamentos por idDepartment para acesso rápido
  const deptMap = apiData.reduce((acc, dept) => {
    acc[dept.idDepartment] = {
      name: dept.name,
      // Guardamos atributos úteis para o Tooltip ou visualização
      attributes: {
        Ativa: dept.active ? 'Sim' : 'Não',
        'Responsabilidade': dept.responsibilityType || 'N/A'
      },
      // Guardamos os lados (laterais) para exibir no card, se necessário
      sides: dept.departmentSides || [], 
      children: [],
      // ID para rastreamento
      id: dept.idDepartment, 
      active: dept.active // Mantemos o boolean puro para filtragens lógicas se precisar
    };
    return acc;
  }, {});

  // Conjunto para rastrear todos os IDs que são "Bottom" (filhos) de alguém
  const allChildrenIds = new Set();

  // 2. Construir as relações pai-filho
  apiData.forEach(dept => {
    // Se o departamento não estiver ativo, talvez não queira processar os filhos dele,
    // mas aqui seguiremos a lógica de processar tudo que vem da API.
    
    const parentId = dept.idDepartment;
    const parentNode = deptMap[parentId];

    if (parentNode && dept.departmentBottoms) {
      dept.departmentBottoms.forEach(childRef => {
        // No JSON de exemplo, o objeto dentro de departmentBottoms tem a chave "idDepartment" também
        const childId = childRef.idDepartment;
        
        // Marcamos que este ID é filho de alguém
        allChildrenIds.add(childId);
        
        const childNode = deptMap[childId];
        
        // Adicionar o filho ao array 'children' do pai, se o nó filho existir no mapa
        if (childNode) {
          // Verifica duplicidade
          if (!parentNode.children.some(child => child.id === childId)) {
            parentNode.children.push(childNode);
          }
        }
      });
    }
  });

  // 3. Identificar a(s) raiz(es): departamentos que não estão no conjunto de filhos
  // Filtrar apenas nós que existem no mapa
  const rootNodes = Object.values(deptMap).filter(node => !allChildrenIds.has(node.id));

  // 4. Se houver mais de uma raiz, criar um nó "fantasma" para uni-las
  if (rootNodes.length > 1) {
    return [{
      name: 'Organograma Geral',
      attributes: { Tipo: 'Raiz Agregadora', 'Total Deptos': Object.keys(deptMap).length },
      children: rootNodes,
      // Adiciona propriedades vazias para evitar erros de renderização
      sides: [],
      id: 'root-agregador'
    }];
  } else if (rootNodes.length === 1) {
    return rootNodes;
  } else {
    // Caso a lista venha vazia
    return [];
  }
};

/**
 * Hook customizado para buscar a estrutura de departamentos.
 * @param {string} endpoint - O endpoint da API.
 * @returns {{treeData: Array, isLoading: boolean, error: string | null}}
 */
export function useDepartmentStructure(endpoint) {
  const [treeData, setTreeData] = useState([]);
  const { setToken } = useToken(); 
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
        throw new Error(`Erro ao buscar departamentos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Transforma os dados brutos em formato de árvore
      const transformedData = transformDataToTree(data);
      
      setTreeData(transformedData);
      setToken(token); 

    } catch (err) {
      console.error("Erro na busca ou transformação dos departamentos:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, setToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    treeData, // O componente espera treeData ou data
    isLoading,
    error,
  };
}

export { transformDataToTree };