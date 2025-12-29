import { useState, useEffect } from 'react';

// Mock de dados com nome, CPF, porcentagem e ativo
const mockData = Array.from({ length: 0 }, (_, i) => ({
}));

// Hook personalizado para buscar dados de clientes
export function useGetMotivos(formData) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = mockData;
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
    customersEmpty: !acoesJudiciais?.length
  };
}