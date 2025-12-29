import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext";

export function useProcessControls(endpoint) {
  const [data, setData] = useState([]);
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
        throw new Error(`Erro ao buscar controles: ${response.status} - ${errorText}`);
      }

      const rawData = await response.json();
      
      // Garante que o array de controles exista
      const processedData = rawData.map(proc => ({
        ...proc,
        controls: proc.controls || []
      }));

      setData(processedData);
      setToken(token);

    } catch (err) {
      console.error("Erro fetch controles:", err);
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