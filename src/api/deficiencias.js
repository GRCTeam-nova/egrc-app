import { useState, useEffect } from "react";
import { useToken } from "./TokenContext";

// Hook para buscar os dados de empresas
export function useGetDeficiencias(formData) {
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

        // Usar o token para acessar a API de empresas
        const response = await fetch(
          `${API_URL}deficiencies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
