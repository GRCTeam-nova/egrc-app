import { useState, useEffect } from 'react';

// Função para formatar datas para o formato DD/MM/AAAA
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Mock de dados com os novos campos solicitados
const mockData = [
  {
    nomeTarefa: 'Tarefa Teste',
    prioridade: '#f2c48c',
    tipoTarefa: 'Em andamento',
    prazo: '2024-10-17T14:35:20.307Z',
    responsavel: 'Eduardo, Leticia, Tainara',
    status: [
      { nome: 'Concluido', cor: '#ff0000' }
    ]
  },
  {
    nomeTarefa: 'Tarefa Teste',
    prioridade: '#260e06',
    tipoTarefa: 'Em andamento',
    prazo: '2024-10-17T14:35:20.307Z',
    responsavel: 'Eduardo, Leticia, Tainara',
    status: [
      { nome: 'Concluido', cor: '#ff0000' }
    ]
  },
  {
    nomeTarefa: 'Tarefa Teste',
    prioridade: '#45c47e',
    tipoTarefa: 'Em andamento',
    prazo: '2024-10-17T14:35:20.307Z',
    responsavel: 'Eduardo, Leticia, Tainara',
    status: [
      { nome: 'Concluido', cor: '#ff0000' }
    ]
  },
  {
    nomeTarefa: 'Tarefa Teste',
    prioridade: '#FFA500',
    tipoTarefa: 'Em andamento',
    prazo: '2024-10-17T14:35:20.307Z',
    responsavel: 'Eduardo, Leticia, Tainara',
    status: [
      { nome: 'Em atraso', cor: '#ff0000' }
    ]
  },
];


// Hook personalizado para buscar dados de tarefas
export function useGetTarefas(formData) {
  const [tarefas, setDocumentos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulação de fetch usando o mockData
        const data = mockData.map(tarefa => ({
          ...tarefa,
          prazo: formatDate(tarefa.prazo)
        }));

        setDocumentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  return {
    tarefas,
    isLoading,
    error,
    documentosEmpty: !tarefas?.length
  };
}
