import { useState, useEffect } from "react";
import { API_URL } from 'config';

// Hook para buscar os dados de avaliações (assessments)
export function useGetAvaliacoes(formData = {}) {
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Removemos o HasRisks, a menos que sua API de avaliações também espere esse parâmetro
    const { GenerateExcel, StartDate, EndDate } = formData; 

    // Se o GenerateExcel for explicitamente false, não chamamos nada.
    if (GenerateExcel === false) {
      setIsLoading(false);
      return;
    }

    // Endpoint atualizado para Avaliações
    let url = `${API_URL}assessments/reports`;
    const params = [];

    // Só adiciona GenerateExcel quando for true (não manda false para a API)
    if (GenerateExcel === true) {
      params.push(`GenerateExcel=true`);
    }
    
    // Tratamento de datas
    if (StartDate) {
      const [year, month, day] = StartDate.split("-");
      const formattedStartDate = `${day}/${month}/${year}`;
      params.push(`StartDate=${encodeURIComponent(formattedStartDate)}`);
    }
    if (EndDate) {
      const [year, month, day] = EndDate.split("-");
      const formattedEndDate = `${day}/${month}/${year}`;
      params.push(`EndDate=${encodeURIComponent(formattedEndDate)}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

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
          throw new Error("Erro ao buscar os dados de avaliações");
        }

        if (GenerateExcel === true) {
          // Download Excel
          const blob = await response.blob();
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = "Avaliacoes.xlsx"; // Nome padrão atualizado
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }

          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);

          console.log(
            "Download do Excel concluído. O componente pai deve resetar GenerateExcel."
          );
        } else {
          // Listagem JSON
          const data = await response.json();
          
          // Define o array base
          const dadosOriginais = data.reportAssessments || data;

          // Mapeia o array para trocar a chave 'id' por 'idAssessment'
          const dadosFormatados = dadosOriginais.map(item => {
            // Desestrutura extraindo o 'id' e mantendo o resto das propriedades
            const { id, ...restoDoItem } = item; 
            
            return {
              ...restoDoItem,
              idAssessment: id // Atribui o valor do antigo 'id' à nova chave
            };
          });

          // Seta o estado com os dados já alterados
          setAvaliacoes(dadosFormatados);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    formData.refreshCount,
    formData.StartDate,
    formData.EndDate,
    formData.GenerateExcel,
  ]);

  return {
    // Mapeado como acoesJudiciais para manter compatibilidade com a ListagemAvaliacoes
    acoesJudiciais: avaliacoes, 
    isLoading,
    error,
    avaliacoesEmpty: !avaliacoes?.length,
  };
}