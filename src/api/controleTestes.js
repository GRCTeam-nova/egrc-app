import { useEffect, useState } from "react";
import { API_URL } from "config";

export function useGetTestesByControle(formData, idControl) {
  const [acoesJudiciais, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idControl) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}controls/${idControl}/tests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados de testes por controle");
        }

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data
          : data?.reportTests || data?.data || [];

        const sortedData = [...normalizedData]
          .map((item) => ({
            ...item,
            id: item.idTest || item.id,
          }))
          .sort((testA, testB) => {
            const timestampA = new Date(testA.date || 0).getTime();
            const timestampB = new Date(testB.date || 0).getTime();
            return timestampB - timestampA;
          });

        setCustomers(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData?.refreshCount, idControl]);

  return {
    acoesJudiciais,
    isLoading,
    error,
    customersEmpty: !acoesJudiciais?.length,
  };
}
