import { useState, useEffect } from "react";
import { API_URL } from "../config"; // Ajuste o caminho do config se necessário

// Hook para buscar os dados de Questionários
export function useGetQuestionarios(formData = {}) {
  const [questionarios, setQuestionarios] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Como solicitado, não há filtros de data ou excel, apenas recarregamento
    const { refreshCount } = formData;

    let url = `${API_URL}quiz`;
    // Se precisar de paginação no futuro, adicione os params aqui

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de questionários");
        }

        const data = await response.json();
        
        // ATENÇÃO: Verifique como a API retorna a lista. 
        // Se for um array direto: setQuestionarios(data);
        // Se for um objeto com chave: setQuestionarios(data.result);
        // Estou assumindo que vem direto ou você ajusta aqui:
        setQuestionarios(Array.isArray(data) ? data : data.result || []);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData.refreshCount]);

  return {
    questionarios, // Renomeado de 'acoesJudiciais' para fazer sentido
    isLoading,
    error,
    customersEmpty: !questionarios?.length,
  };
}