import { useState, useEffect } from "react";

// Hook para buscar os dados de empresas
export function useGetPerfis(formData) {
  const [acoesJudiciais, setCustomers] = useState(null);
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
          `${API_URL}analisys-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de perfis de análise");
        }

        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
