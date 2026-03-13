import { useEffect, useState } from "react";
import { API_URL } from "config";

// Hook para buscar as avaliações vinculadas a um risco
export function useGetAvaliacoesByRisco(formData, idRisk) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idRisk) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}assessments/assessments/${idRisk}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de avaliações por risco");
        }

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data
          : data?.reportAssessments || data?.data || [];

        setCustomers(normalizedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData, idRisk]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
