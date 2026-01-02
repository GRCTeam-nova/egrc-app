import { useState, useEffect } from "react";
import { API_URL } from 'config';

// Hook para buscar os dados de empresas
export function useGetAtivos(formData = {}) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { GenerateExcel, StartDate, EndDate, HasRisks } = formData;

    // ✅ Se o GenerateExcel for explicitamente false, não chamamos nada.
    if (GenerateExcel === false) {
      setIsLoading(false);
      return;
    }

    let url = `${API_URL}actives/reports`;
    const params = [];

    // ✅ Só adiciona GenerateExcel quando for true (não manda false para a API)
    if (GenerateExcel === true) {
      params.push(`GenerateExcel=true`);
    }
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
    if (HasRisks !== undefined) {
      params.push(`HasRisks=${HasRisks}`);
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
          throw new Error("Erro ao buscar os dados de controles");
        }

        if (GenerateExcel === true) {
          // download Excel
          const blob = await response.blob();
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = "ativos.xlsx";
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

          // Mantém a listagem como está; se preferir, pode setar [].
          // setCustomers([]);
        } else {
          // listagem JSON
          const data = await response.json();
          setCustomers(data.reportPlatforms);
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
    formData.HasRisks,
    formData.GenerateExcel,
  ]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
