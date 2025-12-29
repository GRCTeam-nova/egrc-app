import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext"; // Ajuste o caminho conforme sua estrutura

/**
 * Transforma a lista plana de processos em uma árvore hierárquica.
 * Usa 'processSuperior' para definir quem é pai de quem.
 */
const transformProcessesToTree = (apiData) => {
  if (!Array.isArray(apiData)) return [];

  // 1. Criar Map para acesso rápido
  const processMap = new Map();
  
  apiData.forEach(proc => {
    processMap.set(proc.idProcess, {
      ...proc,
      children: [], // Inicializa array de filhos
      // Garante que arrays existam
      risks: proc.risks || [],
      controls: proc.controls || [],
      departaments: proc.departaments || []
    });
  });

  const roots = [];

  // 2. Construir a árvore
  processMap.forEach((node) => {
    if (node.processSuperior && node.processSuperior.idProcess) {
      // Se tem superior, busca o pai no mapa e adiciona este nó como filho
      const parent = processMap.get(node.processSuperior.idProcess);
      if (parent) {
        parent.children.push(node);
      } else {
        // Se o pai não está na lista (dados parciais), tratamos como raiz orfã
        roots.push(node);
      }
    } else {
      // Se não tem superior, é uma raiz (Processo Macro)
      roots.push(node);
    }
  });

  // 3. Cria um nó "Macro" se houver muitas raízes soltas para organizar o gráfico
  if (roots.length > 1) {
    return [{
      idProcess: 'root-aggregator',
      name: 'Macroprocessos',
      code: 'Geral',
      children: roots,
      departaments: [],
      risks: [],
      controls: []
    }];
  }

  return roots;
};

export function useProcessStructure(endpoint) {
  const [treeData, setTreeData] = useState([]);
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar processos: ${response.status}`);
      }

      const data = await response.json();
      const tree = transformProcessesToTree(data);
      setTreeData(tree);
      setToken(token);

    } catch (err) {
      console.error("Erro fetch processos:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, setToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { treeData, isLoading, error };
}