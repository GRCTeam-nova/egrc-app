import { useState, useEffect } from 'react';
import { API_QUERY } from '../config';

// Função para formatar datas para o formato DD/MM/AAAA
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Hook personalizado para buscar dados de clientes
export function useGetAndamentos(formData, processoSelecionadoId) {
  const [andamentos, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_QUERY}/api/Andamento/Listar/${processoSelecionadoId}`);
    const data = await response.json();

    if (data.andamentos && Array.isArray(data.andamentos) && data.andamentos.length > 0) {
        // Formatação das datas e valores financeiros sem filtragem por ativo
        const andamentosFormatados = data.andamentos.map(andamento => ({
            ...andamento,
            dataCriacao: formatDate(andamento.dataCriacao),
            dataAndamento: formatDate(andamento.dataAndamento),
            prazoJudicial: formatDate(andamento.prazoJudicial),
        }));

        setCustomers(andamentosFormatados);
        } else {
          setCustomers(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  return {
    andamentos,
    isLoading,
    error,
    customersEmpty: !andamentos?.length
  };
}
