import { useState, useEffect } from "react";

export function useAvaliacoesMock() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simula um delay para imitar uma chamada assíncrona
    const timeoutId = setTimeout(() => {
      try {
        const dadosMock = [
          { nome: "João da Silva", data: "12/02/2025", avaliacao: "Alto" },
          { nome: "Maria Oliveira", data: "12/02/2025", avaliacao: "Médio" },
          { nome: "Carlos Souza", data: "01/02/2025", avaliacao: "Baixo" },
          { nome: "Ana Pereira", data: "05/12/2024", avaliacao: "Médio" },
          { nome: "Ricardo Lima", data: "24/11/2024", avaliacao: "Alto" }
        ];

        setAvaliacoes(dadosMock);
      } catch (err) {
        setError("Erro ao carregar as avaliações");
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    avaliacoes,
    isLoading,
    error,
    avaliacoesEmpty: avaliacoes.length === 0,
  };
}
