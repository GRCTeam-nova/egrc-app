import { useState, useEffect } from "react";
import { API_URL } from 'config';
import { useToken } from "./TokenContext";

// Hook para buscar os dados de empresas
export function useGetTeste(formData, projectId) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');

        // Define o endpoint de acordo com a existência de projectId
        const url = formData.projectId 
          ? `${API_URL}projects/${formData.projectId}/tests`
          : `${API_URL}projects`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de empresas");
        }

        const data = await response.json();
        setCustomers(data);
        setToken(token);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}

export function useGetTestesByProjeto(formData, idProject) {
  const [acoesJudiciais, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idProject) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}projects/${idProject}/tests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de testes por projeto");
        }

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data
          : data?.reportTests || data?.data || [];

        const sortedData = [...normalizedData]
          .map((item) => ({
            ...item,
            id: item.idTest || item.id,
          }))
          .sort((testA, testB) => {
            const timestampA = new Date(testA.baseDate || testA.date || 0).getTime();
            const timestampB = new Date(testB.baseDate || testB.date || 0).getTime();
            return timestampB - timestampA;
          });

        setCustomers(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData?.refreshCount, idProject]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
