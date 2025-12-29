import { useState, useEffect } from 'react';
import { API_QUERY } from '../config';

// Hook personalizado para buscar dados de clientes
export function useGetCompetencia(formData) {
  const [competencias, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Execução da requisição
        const response = await fetch(`${API_QUERY}/api/Competencia`)
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
    competencias,
    isLoading,
    error,
    customersEmpty: !competencias?.length
  };
}
