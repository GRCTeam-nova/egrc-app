import { useState, useEffect } from 'react';
import { API_QUERY, API_COMMAND } from '../config';

// Hook personalizado para buscar dados de clientes
export function useGetTiposAndamentos(formData) {
  const [tiposAndamento, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Execução da requisição
        const response = await fetch(`${API_QUERY}/api/TipoAndamento`)
        const data = await response.json();
        if (data.tiposAndamento && Array.isArray(data.tiposAndamento) && data.tiposAndamento.length > 0) {
          const andamentosFormatados = data.tiposAndamento.map(andamento => ({
            ...andamento,
            ativo: andamento.ativo ? 'Ativo' : 'Inativo'
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
    tiposAndamento,
    isLoading,
    error,
    customersEmpty: !tiposAndamento?.length
  };
}
