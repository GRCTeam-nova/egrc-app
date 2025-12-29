import { useState, useEffect } from 'react';

// Mock de dados para causaRaizEmpresas
const mockDocumentos = [
  {
    nome: "Produto Alpha",
    codigo: "12.345.678/0001-90",
    empresa: "Empresa A",
    adicionadoEm: "26/12/2024",
    via: "Manual"
  },
  {
    nome: "Produto Beta",
    codigo: "98.765.432/0001-21",
    empresa: "Empresa B",
    adicionadoEm: "25/12/2024",
    via: "Automático"
  },
  {
    nome: "Produto Gama",
    codigo: "11.222.333/0001-44",
    empresa: "Empresa C",
    adicionadoEm: "24/12/2024",
    via: "Manual"
  },
  {
    nome: "Produto Delta",
    codigo: "11.552.343/0001-44",
    empresa: "Empresa D",
    adicionadoEm: "27/12/2024",
    via: "Automático"
  }
];

// Hook personalizado para buscar dados de causaRaizEmpresas
export function useGetDocumentos(formData, processoSelecionadoId) {
  const [causaRaizEmpresas, setDocumentos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulando um atraso de carregamento para emular a chamada de uma API
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDocumentos(mockDocumentos);
      } catch (err) {
        setError("Erro ao carregar os dados do mock.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  return {
    causaRaizEmpresas,
    isLoading,
    error,
    customersEmpty: !causaRaizEmpresas?.length
  };
}
