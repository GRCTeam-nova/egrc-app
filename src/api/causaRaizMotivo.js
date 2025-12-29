import { useState, useEffect } from 'react';

// Mock de dados para causaRaizEmpresas
const mockDocumentos = [
  {
    motivo: "Motivo Alpha",
    subMotivo: [
      { id: 1, nome: "Sub-Motivo A" },
      { id: 2, nome: "Sub-Motivo B" },
      { id: 3, nome: "Sub-Motivo C" },
      { id: 4, nome: "Sub-Motivo D" },
      { id: 5, nome: "Sub-Motivo E" }
    ],
    adicionadoEm: "26/12/2024",
    via: "Manual"
  },
  {
    motivo: "Motivo Beta",
    subMotivo: [
      { id: 4, nome: "Sub-Motivo D" },
      { id: 5, nome: "Sub-Motivo E" }
    ],
    adicionadoEm: "25/12/2024",
    via: "Automático"
  },
  {
    motivo: "Motivo Gama",
    subMotivo: [
      { id: 6, nome: "Sub-Motivo F" },
      { id: 7, nome: "Sub-Motivo G" },
      { id: 8, nome: "Sub-Motivo H" }
    ],
    adicionadoEm: "24/12/2024",
    via: "Manual"
  },
  {
    motivo: "Motivo Delta",
    subMotivo: [
      { id: 9, nome: "Sub-Motivo I" },
      { id: 10, nome: "Sub-Motivo J" }
    ],
    adicionadoEm: "27/12/2024",
    via: "Automático"
  },
  {
    motivo: "Motivo Upsilon",
    subMotivo: [
      { id: 11, nome: "Sub-Motivo K" },
      { id: 12, nome: "Sub-Motivo L" },
      { id: 13, nome: "Sub-Motivo M" }
    ],
    adicionadoEm: "27/12/2024",
    via: "Automático"
  },
  {
    motivo: "Motivo Lambda",
    subMotivo: [
      { id: 14, nome: "Sub-Motivo N" },
      { id: 15, nome: "Sub-Motivo O" }
    ],
    adicionadoEm: "27/12/2024",
    via: "Automático"
  },
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
