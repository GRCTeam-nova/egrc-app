import { useState, useEffect } from "react";
import { useToken } from "./TokenContext";
import { useLocation } from "react-router-dom";
import { API_URL } from 'config';

// Hook para buscar os dados de empresas
export function useGetEmpresa(formData, companyIdParam) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const companyId =
    companyIdParam || dadosApi?.idCompany || localStorage.getItem("idCompany");

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        setCustomers([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Obter o token de autenticação
        const token = localStorage.getItem('access_token');

        // Usar o token para acessar a API de empresas
        const response = await fetch(
          `${API_URL}companies/${companyId}/shared-holders`,
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
  }, [companyId, formData, setToken]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
