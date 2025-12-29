import { useState, useEffect } from 'react';

// Função para formatar datas para o formato DD/MM/AAAA
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Mock de dados com os novos campos solicitados
const mockData = [
  {
    nome: "Centro-Oeste",
    dataCadastro: "2024-08-15T10:22:35.307Z",
    ativo: true,
    unidades: ["Unidade A", "Unidade B"],
    responsaveis: ["João Silva", "Maria Oliveira", "Carlos Santos", "Ana Costa"],
  },
  {
    nome: "Norte",
    dataCadastro: "2024-08-15T10:22:35.307Z",
    ativo: true,
    unidades: ["Unidade X"],
    responsaveis: ["Paula Moreira", "Lucas Souza"],
  },
  {
    nome: "Nordeste",
    dataCadastro: "2024-08-15T10:22:35.307Z",
    ativo: false,
    unidades: ["Unidade Y", "Unidade Z"],
    responsaveis: ["Ana Silva"],
  },
  {
    nome: "Sul",
    dataCadastro: "2024-08-15T10:22:35.307Z",
    ativo: false,
    unidades: ["Unidade Y", "Unidade Z"],
    responsaveis: ["Ana Silva"],
  },
]; 

// Hook personalizado para buscar dados de statusProcessos
export function useGetRotina(formData) {
  const [statusProcessos, setStatusProcessos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulação de fetch usando o mockData
        const data = mockData.map(documento => ({
          ...documento,
          dataCadastro: formatDate(documento.dataCadastro)
        }));

        setStatusProcessos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  return {
    statusProcessos,
    isLoading,
    error,
    documentosEmpty: !statusProcessos?.length
  };
}
