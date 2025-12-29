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
        const response = await fetch(`${API_QUERY}/api/Processo?PageNumber=1&ItensPerPage=1000`);
        const data = await response.json();
        setCustomers(data.processos);
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
