import { useState, useEffect, useCallback } from "react";
import { useToken } from "../../../api/TokenContext";

export function useDataDepartmentReport(endpoint) {
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
      const rawData = jsonResponse.reportLgpds || [];

      // Lógica de Pivot: Agrupar dados por Departamento
      const deptMap = new Map();

      rawData.forEach(dataItem => {
        if (dataItem.departments && Array.isArray(dataItem.departments)) {
          dataItem.departments.forEach(dept => {
            if (!deptMap.has(dept.idDepartment)) {
              deptMap.set(dept.idDepartment, {
                id: dept.idDepartment,
                name: dept.name,
                totalData: 0,
                sensitiveCount: 0,
                commonCount: 0,
                treatmentCount: 0,
                associatedData: []
              });
            }

            const deptEntry = deptMap.get(dept.idDepartment);
            deptEntry.totalData += 1;
            
            if (dataItem.sensitive) {
              deptEntry.sensitiveCount += 1;
            } else {
              deptEntry.commonCount += 1;
            }

            if (dataItem.performTreatment) {
              deptEntry.treatmentCount += 1;
            }

            deptEntry.associatedData.push({
              id: dataItem.idLgpd,
              name: dataItem.name,
              sensitive: dataItem.sensitive,
              performTreatment: dataItem.performTreatment
            });
          });
        }
      });

      // Ordena por volume total (Maior -> Menor)
      const groupedData = Array.from(deptMap.values()).sort((a, b) => b.totalData - a.totalData);

      setData(groupedData);
      setToken(token);

    } catch (err) {
      console.error("Erro fetch dados por departamento:", err);
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