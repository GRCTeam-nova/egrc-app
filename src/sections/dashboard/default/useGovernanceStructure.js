import { useState, useEffect, useCallback } from 'react';
import { useToken } from '../../../api/TokenContext';

const transformDataToTree = (apiData = []) => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  const companiesMap = apiData.reduce((acc, company) => {
    acc[company.idCompany] = {
      id: company.idCompany,
      name: company.name,
      active: company.active,
      attributes: {
        Documento: company.document,
        Ativa: company.active ? 'Sim' : 'Nao',
      },
      children: [],
    };

    return acc;
  }, {});

  const allChildrenIds = new Set();

  apiData.forEach((company) => {
    const parentNode = companiesMap[company.idCompany];

    if (!parentNode) {
      return;
    }

    (company.companyBottoms || []).forEach((bottomCompany) => {
      const childId = bottomCompany.idCompanyBottom;
      const childNode = companiesMap[childId];

      allChildrenIds.add(childId);

      if (childNode && !parentNode.children.some((child) => child.id === childId)) {
        parentNode.children.push(childNode);
      }
    });
  });

  const rootNodes = Object.values(companiesMap).filter((node) => !allChildrenIds.has(node.id));

  if (rootNodes.length > 1) {
    return [
      {
        name: 'Estrutura Societaria',
        isAggregator: true,
        attributes: { Tipo: 'Raiz Agregadora' },
        children: rootNodes,
      },
    ];
  }

  if (rootNodes.length === 1) {
    return rootNodes;
  }

  return [];
};

const hasMeaningfulGovernanceStructure = (treeData = []) => {
  const hasActiveRelationship = (node) => {
    if (!node || node.active === false) {
      return false;
    }

    if (node.isAggregator) {
      return (node.children || []).some(hasActiveRelationship);
    }

    const activeChildren = (node.children || []).filter((child) => child && child.active !== false);

    return activeChildren.length > 0;
  };

  return treeData.some(hasActiveRelationship);
};

export function useGovernanceStructure(endpoint) {
  const [treeData, setTreeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setToken } = useToken();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('Token de acesso nao encontrado no localStorage.');
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar dados da estrutura de governanca: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const transformedData = transformDataToTree(data);

      setTreeData(transformedData);
      setToken(token);
    } catch (err) {
      console.error('Erro na busca ou transformacao dos dados:', err);
      setTreeData([]);
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
    hasMeaningfulStructure: hasMeaningfulGovernanceStructure(treeData),
    isLoading,
    error,
  };
}

export { transformDataToTree, hasMeaningfulGovernanceStructure };
