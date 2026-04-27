import { useState, useEffect } from "react";
import { API_URL } from '../config';

export function useGetESGImpact(formData) {
  const [impacts, setImpacts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${API_URL}ESGImpact`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de impactos ESG");
        }

        const data = await response.json();
        setImpacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData?.refreshCount]);

  return {
    impacts,
    isLoading,
    error,
  };
}
