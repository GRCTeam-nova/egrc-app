import { useState, useEffect } from "react";
import { useToken } from "./TokenContext";
import { useLocation } from "react-router-dom";

// Hook para buscar os dados de empresas
export function useAvaliacoesMock(formData) {
  const [steps, setCustomers] = useState(null);
  const location = useLocation();
    const { dadosApi } = location.state || {};
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Obter o token de autenticação
        const token = localStorage.getItem('access_token');

        // Usar o token para acessar a API de empresas
        const response = await fetch(
          `https://api.egrc.homologacao.com.br/api/v1/action-plans/${dadosApi.idActionPlan}/steps`,
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
  }, [formData]);

  return {
    steps,
    isLoading,
    error,
    customersEmpty: !steps?.length,
  };
}
