import { useState, useEffect } from 'react';

// Função para gerar um CNPJ aleatório
const generateRandomCNPJ = () => {
  const randomNumbers = () => Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
  return `${randomNumbers()}/0001-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
};

// Mock de empresas
const mockData = Array.from({ length: 30 }, (_, i) => ({
  nome: `Teste-Campo Incidentes ${i + 1}`,
  ativo: Math.random() > 0.5, 
  cnpj: generateRandomCNPJ()
}));

// Hook personalizado para buscar dados de clientes
export function useGetIncidentes(formData) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulação de uma requisição que retorna os dados mockados
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
