import { useState, useEffect } from "react";

// Função para realizar o fluxo de autenticação e obter o token final
const authenticateAndGetToken = async () => {
  try {
    const tenantResponse = await fetch(
      `${process.env.REACT_APP_API_URL}accounts/tenants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "18bded94-ffba-4bab-819a-0293bae304bf",
        },
        body: JSON.stringify({
          email: "rodrigojolivi@gmail.com",
          password: "Test@123",
        }),
      }
    );

    if (!tenantResponse.ok) {
      throw new Error("Falha na autenticação inicial");
    }

    const tenantData = await tenantResponse.json();
    const accessToken = tenantData.access_token;
    const tenantId = tenantData.tenants[0]?.idTenant;

    const tokenResponse = await fetch(
      `${process.env.REACT_APP_API_URL}accounts/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id_tenant: tenantId }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Falha ao obter o token final");
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error("Erro na autenticação:", error);
    throw new Error("Falha na autenticação");
  }
};

// Hook para buscar os dados de empresas
export function useGetAvaliacao(formData) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Obter o token de autenticação
        const token = await authenticateAndGetToken();

        // Usar o token para acessar a API de empresas
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}cycles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de ciclos");
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
