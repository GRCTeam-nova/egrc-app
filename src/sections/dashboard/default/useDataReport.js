import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext";

export function useDataReport(endpoint) {
  const [data, setData] = useState([]);
  const { setToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar dados: ${response.status} - ${errorText}`);
      }

      const jsonResponse = await response.json();
      const rawData = jsonResponse.reportLgpds || []; // Acessa a chave correta do JSON

      // LÓGICA DE PIVOT: Transformar Lista de Dados em Lista de Processos
      const processMap = new Map();

      rawData.forEach(dataItem => {
        if (dataItem.processes && Array.isArray(dataItem.processes)) {
          dataItem.processes.forEach(proc => {
            // Se o processo ainda não existe no mapa, cria
            if (!processMap.has(proc.idProcess)) {
              processMap.set(proc.idProcess, {
                idProcess: proc.idProcess,
                name: proc.name,
                totalData: 0,
                sensitiveCount: 0,
                commonCount: 0,
                treatmentCount: 0, // Contagem de dados que sofrem tratamento
                associatedData: [] // Lista dos dados para o Modal
              });
            }

            // Atualiza as contagens do processo
            const processEntry = processMap.get(proc.idProcess);
            processEntry.totalData += 1;
            
            if (dataItem.sensitive) {
              processEntry.sensitiveCount += 1;
            } else {
              processEntry.commonCount += 1;
            }

            if (dataItem.performTreatment) {
              processEntry.treatmentCount += 1;
            }

            // Adiciona o dado à lista do processo (para o detalhe)
            processEntry.associatedData.push({
              id: dataItem.idLgpd,
              name: dataItem.name,
              sensitive: dataItem.sensitive,
              performTreatment: dataItem.performTreatment
            });
          });
        }
      });

      // Converte o Map em Array e ordena por volume total de dados
      const groupedData = Array.from(processMap.values()).sort((a, b) => b.totalData - a.totalData);

      setData(groupedData);
      setToken(token);

    } catch (err) {
      console.error("Erro fetch relatório de dados:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, setToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}