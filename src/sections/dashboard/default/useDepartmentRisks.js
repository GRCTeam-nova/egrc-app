import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext"; 

export function useDepartmentRisks(endpoint) {
  const [data, setData] = useState([]);
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
        throw new Error(`Erro ao buscar riscos: ${response.status} - ${errorText}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      setToken(token); 

    } catch (err) {
      console.error("Erro na busca dos riscos:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, setToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}