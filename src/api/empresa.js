import { useEffect, useState } from "react";
import { API_URL } from "config";
import { useToken } from "./TokenContext";

export function useGetEmpresa(formData = {}) {
  const [acoesJudiciais, setCustomers] = useState(null);
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { GenerateExcel, refreshCount } = formData;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        let url = `${API_URL}companies/reports`;

        if (GenerateExcel === true) {
          url += "?GenerateExcel=true";
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de empresas");
        }

        if (GenerateExcel === true) {
          const blob = await response.blob();
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = "Empresas.xlsx";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }

          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          const data = await response.json();
          setCustomers(data.reportCompanies || []);
        }

        setToken(token);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [GenerateExcel, refreshCount, setToken]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
