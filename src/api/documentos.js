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
    nomeDocumento: 'Documento.pdf',
    descricao: 'Relatório referente ao 3º trimestre',
    tipoDocumento: 'PDF',
    dataCadastro: '2024-10-17T14:35:20.307Z',
    origem: 'Departamento Financeiro',
    base64Content: 'JVBERi0xLjQKJdDUxdgKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIKL0xh...',
    tags: [
      { nome: 'Financeiro', cor: '#ff0000' }
    ]
  },
  {
    nomeDocumento: 'Marketing.pdf',
    descricao: 'Estratégias de marketing para 2024',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-09-25T09:10:12.307Z',
    origem: 'Departamento de Marketing',
    base64Content: 'JVBERi0xLjQKJdDUxdgKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIKL0xh...',
    tags: [
      { nome: 'Marketing', cor: '#0000ff' },
      { nome: 'Anual', cor: '#ff9900' }
    ]
  },
  {
    nomeDocumento: 'Comercial.pdf',
    descricao: 'Proposta para novos clientes corporativos',
    tipoDocumento: 'PDF',
    dataCadastro: '2024-08-15T10:22:35.307Z',
    origem: 'Departamento Comercial',
    base64Content: 'JVBERi0xLjQKJdDUxdgKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIKL0xh...',
    tags: [
      { nome: 'Comercial', cor: '#ff5722' }
    ]
  },
  {
    nomeDocumento: 'Produto.pdf',
    descricao: 'Instruções detalhadas do produto XYZ',
    tipoDocumento: 'PDF',
    dataCadastro: '2024-07-30T08:45:20.307Z',
    origem: 'Desenvolvimento de Produto',
    base64Content: 'JVBERi0xLjQKJdDUxdgKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIKL0xh...',
    tags: [
      { nome: 'Produto', cor: '#673ab7' },
      { nome: 'Instruções', cor: '#3f51b5' }
    ]
  },
  {
    nomeDocumento: 'Contrato.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    base64Content: 'JVBERi0xLjQKJdDUxdgKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIKL0xh...',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Contrato.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Contrato.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Contrato.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Contrato.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Contrato2.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Pesquisa.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'ContratoEstudo.pdf',
    descricao: 'Contrato firmado com parceiro ABC',
    tipoDocumento: 'DOCX',
    dataCadastro: '2024-06-12T13:14:56.307Z',
    origem: 'Jurídico',
    tags: [
      { nome: 'Contrato', cor: '#9c27b0' }
    ]
  },
  {
    nomeDocumento: 'Documento2.pdf',
    descricao: 'Resultados da pesquisa com clientes de 2024',
    tipoDocumento: 'XLSX',
    dataCadastro: '2024-05-10T16:00:45.307Z',
    origem: 'Atendimento ao Cliente',
    tags: [
      { nome: 'Pesquisa', cor: '#ffeb3b' },
      { nome: 'Satisfação', cor: '#ff9800' }
    ]
  }
];


// Hook personalizado para buscar dados de documentos
export function useGetDocumentos(formData) {
  const [documentos, setDocumentos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulação de fetch usando o mockData
        const data = mockData.map(documento => ({
          ...documento,
          dataCadastro: formatDate(documento.dataCadastro)
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
    documentos,
    isLoading,
    error,
    documentosEmpty: !documentos?.length
  };
}
