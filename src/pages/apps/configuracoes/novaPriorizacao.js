/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Switch,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fab,
  Badge,
  Alert,
  AlertTitle,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chart from "react-apexcharts";

// Dados mock para os selects
const perfisEsg = [
  { id: 1, nome: "Perfil ESG 2024" },
  { id: 2, nome: "Perfil ESG Completo" },
  { id: 3, nome: "Perfil ESG Simplificado" },
];

const ciclosAnteriores = [
  { id: 1, nome: "Ciclo 2023" },
  { id: 2, nome: "Ciclo 2022" },
  { id: 3, nome: "Ciclo 2021" },
];

const colaboradores = [
  { id: 1, nome: "João Silva", avatar: "JS" },
  { id: 2, nome: "Maria Santos", avatar: "MS" },
  { id: 3, nome: "Pedro Oliveira", avatar: "PO" },
  { id: 4, nome: "Ana Costa", avatar: "AC" },
  { id: 5, nome: "Carlos Ferreira", avatar: "CF" },
];

const statusPriorizacao = [
  { id: 1, nome: "Em elaboração", cor: "#FFA500" },
  { id: 2, nome: "Concluída", cor: "#28a745" },
  { id: 3, nome: "Revisada", cor: "#007bff" },
];

const eixosEsg = [
  { id: 1, nome: "Ambiental", cor: "#4CAF50", icon: "🌱" },
  { id: 2, nome: "Social", cor: "#2196F3", icon: "👥" },
  { id: 3, nome: "Governança", cor: "#FF9800", icon: "⚖️" },
];

// Dados mock para a tabela de temas
const temasMock = [
  {
    codigo: 1,
    tema: "Emissões de gás carbônico",
    eixo: "Ambiental",
    impactosPositivos: [
      { nome: "Redução de emissões", tipo: "Ambiental" },
      { nome: "Economia de energia", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Poluição do ar", tipo: "Ambiental" },
      { nome: "Mudanças climáticas", tipo: "Social" }
    ],
    probabilidade: 3,
    intensidade: 2,
    abrangencia: 3,
    urgencia: 2,
    significanciaImpacto: 2.5,
    significanciaFinanceira: 3,
    partesInteressadas: {
      clientes: 2,
      fornecedores: 1,
      ongsAssociacoes: 2,
      sociedade: 0,
      conselheiros: 5,
      colaboradores: 5,
      reguladores: 5,
      investidores: 4
    },
    importanciaPI: 4.2,
    priorizacao: 3.5,
    status: "Priorizado",
    observacao: "Tema acima do limite de materialidade definido pela empresa"
  },
  {
    codigo: 2,
    tema: "Gestão de resíduos",
    eixo: "Ambiental",
    impactosPositivos: [
      { nome: "Reciclagem", tipo: "Ambiental" }
    ],
    impactosNegativos: [
      { nome: "Contaminação do solo", tipo: "Ambiental" }
    ],
    probabilidade: 4,
    intensidade: 3,
    abrangencia: 2,
    urgencia: 3,
    significanciaImpacto: 3.0,
    significanciaFinanceira: 2.5,
    partesInteressadas: {
      clientes: 3,
      fornecedores: 2,
      ongsAssociacoes: 4,
      sociedade: 3,
      conselheiros: 3,
      colaboradores: 4,
      reguladores: 5,
      investidores: 2
    },
    importanciaPI: 3.3,
    priorizacao: 2.9,
    status: "Monitorado",
    observacao: "Tema importante para comunidade local"
  },
  {
    codigo: 3,
    tema: "Diversidade e inclusão",
    eixo: "Social",
    impactosPositivos: [
      { nome: "Ambiente inclusivo", tipo: "Social" },
      { nome: "Inovação", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Discriminação", tipo: "Social" }
    ],
    probabilidade: 2,
    intensidade: 4,
    abrangencia: 4,
    urgencia: 3,
    significanciaImpacto: 3.3,
    significanciaFinanceira: 3.8,
    partesInteressadas: {
      clientes: 4,
      fornecedores: 3,
      ongsAssociacoes: 5,
      sociedade: 5,
      conselheiros: 4,
      colaboradores: 5,
      reguladores: 3,
      investidores: 4
    },
    importanciaPI: 4.1,
    priorizacao: 3.7,
    status: "Priorizado",
    observacao: "Fundamental para cultura organizacional"
  },
  {
    codigo: 4,
    tema: "Transparência e ética",
    eixo: "Governança",
    impactosPositivos: [
      { nome: "Confiança", tipo: "Social" },
      { nome: "Reputação", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Corrupção", tipo: "Governança" }
    ],
    probabilidade: 3,
    intensidade: 5,
    abrangencia: 5,
    urgencia: 4,
    significanciaImpacto: 4.0,
    significanciaFinanceira: 4.5,
    partesInteressadas: {
      clientes: 5,
      fornecedores: 4,
      ongsAssociacoes: 3,
      sociedade: 4,
      conselheiros: 5,
      colaboradores: 4,
      reguladores: 5,
      investidores: 5
    },
    importanciaPI: 4.4,
    priorizacao: 4.3,
    status: "Não Priorizado",
    observacao: "Crítico para sustentabilidade do negócio"
  },
  {
    codigo: 5,
    tema: "Segurança e saúde ocupacional",
    eixo: "Social",
    impactosPositivos: [
      { nome: "Bem-estar", tipo: "Social" }
    ],
    impactosNegativos: [
      { nome: "Acidentes", tipo: "Social" },
      { nome: "Doenças ocupacionais", tipo: "Social" }
    ],
    probabilidade: 2,
    intensidade: 4,
    abrangencia: 3,
    urgencia: 5,
    significanciaImpacto: 3.5,
    significanciaFinanceira: 3.2,
    partesInteressadas: {
      clientes: 2,
      fornecedores: 3,
      ongsAssociacoes: 3,
      sociedade: 3,
      conselheiros: 4,
      colaboradores: 5,
      reguladores: 5,
      investidores: 3
    },
    importanciaPI: 3.5,
    priorizacao: 3.4,
    status: "Priorizado",
    observacao: "Prioridade máxima para colaboradores"
  }
];

const steps = [
  { label: 'Configuração Básica', icon: <SettingsIcon /> },
  { label: 'Responsáveis', icon: <PeopleIcon /> },
  { label: 'Avaliação de Temas', icon: <AssessmentIcon /> },
  { label: 'Análises e Gráficos', icon: <TrendingUpIcon /> },
];

// ==============================|| CICLO DE PRIORIZAÇÃO REFATORADO ||============================== //
function NovoCicloPriorizacao() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { cicloDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [cicloPriorizacaoDados, setCicloPriorizacaoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingTema, setEditingTema] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    nomeCiclo: "",
    descricaoCiclo: "",
    dataInicio: null,
    dataFim: null,
    perfilPriorizacao: null,
    cicloAnterior: null,
    priorizador: null,
    revisores: [],
    comentarioPriorizador: "",
    comentarioRevisores: "",
    statusPriorizacao: 1, // Em elaboração por padrão
    temas: temasMock
  });

  // Em caso de edição
  useEffect(() => {
    if (cicloDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do ciclo para edição
    }
  }, [cicloDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSelectAllRevisores = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.revisores.length === colaboradores.length) {
        handleInputChange("revisores", []);
      } else {
        handleInputChange("revisores", colaboradores.map(colaborador => colaborador.id));
      }
    } else {
      handleInputChange("revisores", newValue.map(item => item.id));
    }
  };

  const handleEditTema = (tema) => {
    setEditingTema({ ...tema });
    setEditDialogOpen(true);
  };

  const handleViewTema = (tema) => {
    setSelectedTema(tema);
    setViewDialogOpen(true);
  };

  const handleSaveTema = () => {
    if (editingTema) {
      const updatedTemas = formData.temas.map(tema => 
        tema.codigo === editingTema.codigo ? editingTema : tema
      );
      handleInputChange('temas', updatedTemas);
      setEditDialogOpen(false);
      setEditingTema(null);
      enqueueSnackbar('Tema atualizado com sucesso!', { variant: 'success' });
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [formValidation, setFormValidation] = useState({
    nomeCiclo: true,
    dataInicio: true,
    dataFim: true,
    perfilPriorizacao: true,
    priorizador: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.nomeCiclo.trim()) {
      setFormValidation(prev => ({ ...prev, nomeCiclo: false }));
      missingFields.push("Nome do Ciclo");
    }
    
    if (!formData.dataInicio) {
      setFormValidation(prev => ({ ...prev, dataInicio: false }));
      missingFields.push("Data de Início");
    }

    if (!formData.dataFim) {
      setFormValidation(prev => ({ ...prev, dataFim: false }));
      missingFields.push("Data de Fim");
    }

    if (!formData.perfilPriorizacao) {
      setFormValidation(prev => ({ ...prev, perfilPriorizacao: false }));
      missingFields.push("Perfil de Priorização");
    }

    if (!formData.priorizador) {
      setFormValidation(prev => ({ ...prev, priorizador: false }));
      missingFields.push("Priorizador");
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 
        ? "são obrigatórios e devem estar válidos!" 
        : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simular requisição para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      enqueueSnackbar(`Ciclo de Priorização ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o ciclo de priorização.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelectedRevisores = formData.revisores.length === colaboradores.length && colaboradores.length > 0;

  // Preparar dados para os gráficos com verificações de segurança
  const prepareMatrizData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return [];
    }

    return eixosEsg.map(eixo => ({
      name: eixo.nome,
      data: formData.temas
        .filter(tema => tema && tema.eixo === eixo.nome)
        .map(tema => ({
          x: tema.significanciaFinanceira || 0,
          y: tema.significanciaImpacto || 0,
          z: (tema.importanciaPI || 0) * 10,
          codigo: tema.codigo || 0,
          tema: tema.tema || 'Sem nome'
        }))
    })).filter(serie => serie.data.length > 0);
  };

  const prepareRankingData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return { categories: [], data: [] };
    }

    const sortedTemas = formData.temas
      .filter(tema => tema && typeof tema.tema === 'string' && tema.tema.trim() !== '' && tema.priorizacao !== undefined)
      .sort((a, b) => (b.priorizacao || 0) - (a.priorizacao || 0));

    return {
      categories: sortedTemas.map(tema => tema.tema),
      data: sortedTemas.map(tema => tema.priorizacao || 0)
    };
  };

  const prepareDistribuicaoData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return [];
    }

    return eixosEsg.map(eixo => 
      formData.temas.filter(tema => tema && tema.eixo === eixo.nome).length
    );
  };

  // Configurações dos gráficos com correções de segurança
  const matrizOptions = {
    chart: {
      type: 'bubble',
      height: 500,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: '#fff',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        try {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const series = opts.w.config.series;
          
          if (series && series[seriesIndex] && series[seriesIndex].data && series[seriesIndex].data[dataPointIndex]) {
            return series[seriesIndex].data[dataPointIndex].codigo || '';
          }
          return '';
        } catch (error) {
          console.warn('Erro no formatter do dataLabels:', error);
          return '';
        }
      },
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      background: {
        enabled: true,
        foreColor: '#fff',
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: '#fff'
      }
    },
    xaxis: {
      title: {
        text: 'Significância Financeira (Impacto na Empresa)',
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: function(val) {
          return typeof val === 'number' ? val.toFixed(1) : val;
        }
      }
    },
    yaxis: {
      title: {
        text: 'Significância do Impacto (Impacto da Empresa)',
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: function(val) {
          return typeof val === 'number' ? val.toFixed(1) : val;
        }
      }
    },
    title: {
      text: 'Matriz de Dupla Materialidade ESG',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#263238'
      }
    },
    subtitle: {
      text: 'Tamanho da bolha representa a Importância das Partes Interessadas',
      align: 'center',
      style: {
        fontSize: '12px',
        color: '#666'
      }
    },
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        try {
          const seriesData = w.config.series;
          if (!seriesData || !seriesData[seriesIndex] || !seriesData[seriesIndex].data || !seriesData[seriesIndex].data[dataPointIndex]) {
            return '<div style="padding: 12px;">Dados não disponíveis</div>';
          }

          const data = seriesData[seriesIndex].data[dataPointIndex];
          const tema = formData.temas.find(t => t.codigo === data.codigo);
          
          return `
  <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1976d2;">
      ${data.codigo || 'N/A'}. ${data.tema || 'Sem nome'}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Eixo:</strong> ${tema?.eixo || 'N/A'}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Sig. Financeira:</strong> ${(data.x || 0).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Sig. Impacto:</strong> ${(data.y || 0).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Import. PI:</strong> ${((data.z || 0)/10).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666;">
      <strong>Status:</strong>
      <span style="color: ${
        tema?.status?.toLowerCase() === 'priorizado'
          ? '#4caf50'
          : (tema?.status?.toLowerCase() === 'Não Priorizado' || tema?.status?.toLowerCase() === 'Não Priorizado')
            ? '#4f0601ff'
            : '#ff9800'
      }">${tema?.status || 'N/A'}</span>
    </div>
  </div>
`;

        } catch (error) {
          console.warn('Erro no tooltip custom:', error);
          return '<div style="padding: 12px;">Erro ao carregar dados</div>';
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    colors: ['#1976d2', '#388e3c', '#f57c00'],
    fill: {
      opacity: 0.8
    },
    annotations: {
      xaxis: [
        {
          x: 2.5,
          borderColor: '#999',
          label: {
            text: 'Limite de Materialidade',
            style: {
              color: '#fff',
              background: '#999'
            }
          }
        }
      ],
      yaxis: [
        {
          y: 2.5,
          borderColor: '#999',
          label: {
            text: 'Limite de Materialidade',
            style: {
              color: '#fff',
              background: '#999'
            }
          }
        }
      ]
    }
  };

  // Gráfico de distribuição por eixo
  const distribuicaoOptions = {
    chart: {
      type: 'donut',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels: eixosEsg.map(eixo => eixo.nome),
    colors: eixosEsg.map(eixo => eixo.cor),
    title: {
      text: 'Distribuição de Temas por Eixo ESG',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#263238'
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        try {
          const label = opts.w.config.labels[opts.seriesIndex] || 'N/A';
          const value = typeof val === 'number' ? val.toFixed(1) : val;
          return `${label}: ${value}%`;
        } catch (error) {
          console.warn('Erro no formatter da distribuição:', error);
          return `${val}%`;
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return `${val} tema${val !== 1 ? 's' : ''}`;
        }
      }
    }
  };

  const distribuicaoSeries = prepareDistribuicaoData();

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCamposBasicos();
      case 1:
        return renderResponsaveis();
      case 2:
        return renderTabelaTemas();
      case 3:
        return renderGraficos();
      default:
        return null;
    }
  };

  const renderCamposBasicos = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          Configuração Básica do Ciclo
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Ciclo de Priorização *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeCiclo}
                onChange={(e) => handleInputChange('nomeCiclo', e.target.value)}
                error={!formData.nomeCiclo && formValidation.nomeCiclo === false}
                placeholder="Ex: Ciclo ESG 2024"
                inputProps={{ maxLength: 50 }}
                helperText={`${formData.nomeCiclo.length}/50 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Perfil de Priorização ESG *</InputLabel>
              <Autocomplete
                options={perfisEsg}
                getOptionLabel={(option) => option.nome}
                value={perfisEsg.find(perfil => perfil.id === formData.perfilPriorizacao) || null}
                onChange={(event, newValue) => {
                  handleInputChange('perfilPriorizacao', newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.perfilPriorizacao && formValidation.perfilPriorizacao === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Início *</InputLabel>
              <DatePicker
                value={formData.dataInicio}
                onChange={(newValue) => handleInputChange('dataInicio', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!formData.dataInicio && formValidation.dataInicio === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Fim *</InputLabel>
              <DatePicker
                value={formData.dataFim}
                onChange={(newValue) => handleInputChange('dataFim', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!formData.dataFim && formValidation.dataFim === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Ciclo</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.descricaoCiclo}
                onChange={(e) => handleInputChange('descricaoCiclo', e.target.value)}
                placeholder="Descreva o objetivo e escopo deste ciclo de priorização"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.descricaoCiclo.length}/500 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização Anterior</InputLabel>
              <Autocomplete
                options={ciclosAnteriores}
                getOptionLabel={(option) => option.nome}
                value={ciclosAnteriores.find(ciclo => ciclo.id === formData.cicloAnterior) || null}
                onChange={(event, newValue) => {
                  handleInputChange('cicloAnterior', newValue ? newValue.id : null);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Status da Priorização</InputLabel>
              <Autocomplete
                options={statusPriorizacao}
                getOptionLabel={(option) => option.nome}
                value={statusPriorizacao.find(status => status.id === formData.statusPriorizacao) || null}
                onChange={(event, newValue) => {
                  handleInputChange('statusPriorizacao', newValue ? newValue.id : 1);
                }}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Chip
                      label={option.nome}
                      size="small"
                      sx={{ backgroundColor: option.cor, color: 'white', mr: 1 }}
                    />
                    {option.nome}
                  </Box>
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderResponsaveis = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Responsáveis pelo Ciclo
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Priorizador *</InputLabel>
              <Autocomplete
                options={colaboradores}
                getOptionLabel={(option) => option.nome}
                value={colaboradores.find(colab => colab.id === formData.priorizador) || null}
                onChange={(event, newValue) => {
                  handleInputChange('priorizador', newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.priorizador && formValidation.priorizador === false}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {option.avatar}
                    </Avatar>
                    {option.nome}
                  </Box>
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Revisores</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos", avatar: "ALL" },
                  ...colaboradores,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.revisores.map(
                  (id) => colaboradores.find((colab) => colab.id === id) || id
                )}
                onChange={handleSelectAllRevisores}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === "all" ? allSelectedRevisores : selected}
                        />
                      </Grid>
                      <Grid item>
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                          {option.avatar}
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        {option.nome}
                      </Grid>
                    </Grid>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Comentário do Priorizador</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.comentarioPriorizador}
                onChange={(e) => handleInputChange('comentarioPriorizador', e.target.value)}
                placeholder="Comentários sobre a priorização"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.comentarioPriorizador.length}/500 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Comentário dos Revisores</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.comentarioRevisores}
                onChange={(e) => handleInputChange('comentarioRevisores', e.target.value)}
                placeholder="Comentários da revisão"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.comentarioRevisores.length}/500 caracteres`}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Lista de responsáveis selecionados */}
        {(formData.priorizador || formData.revisores.length > 0) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Equipe Selecionada
            </Typography>
            <List>
              {formData.priorizador && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {colaboradores.find(c => c.id === formData.priorizador)?.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={colaboradores.find(c => c.id === formData.priorizador)?.nome}
                    secondary="Priorizador"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Priorizador" color="primary" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              )}
              {formData.revisores.map(revisorId => {
                const revisor = colaboradores.find(c => c.id === revisorId);
                return revisor ? (
                  <ListItem key={revisorId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {revisor.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={revisor.nome}
                      secondary="Revisor"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Revisor" color="secondary" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : null;
              })}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderTabelaTemas = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Avaliação de Temas ESG
          </Typography>
          <Badge badgeContent={formData.temas.length} color="primary">
            <Chip label="Temas Cadastrados" variant="outlined" />
          </Badge>
        </Box>

        {/* Resumo por status */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="success" sx={{ height: '100%' }}>
                <AlertTitle>Priorizados</AlertTitle>
                {formData.temas.filter(t => t.status === 'Priorizado').length} temas
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="warning" sx={{ height: '100%' }}>
                <AlertTitle>Monitorados</AlertTitle>
                {formData.temas.filter(t => t.status === 'Monitorado').length} temas
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ height: '100%' }}>
                <AlertTitle>Total</AlertTitle>
                {formData.temas.length} temas avaliados
              </Alert>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tema</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Eixo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Impactos +</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Impactos -</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prob.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Intens.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Abrang.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Urgên.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sig. Impacto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sig. Financeira</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Import. PI</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priorização</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.temas.map((tema) => (
                <TableRow key={tema.codigo} hover>
                  <TableCell>
                    <Chip label={tema.codigo} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ minWidth: 200, fontWeight: 500 }}>{tema.tema}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tema.eixo} 
                      size="small"
                      sx={{ 
                        backgroundColor: eixosEsg.find(e => e.nome === tema.eixo)?.cor,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    {tema.impactosPositivos.map((impacto, idx) => (
                      <Chip key={idx} label={impacto.nome} size="small" color="success" sx={{ m: 0.25 }} />
                    ))}
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    {tema.impactosNegativos.map((impacto, idx) => (
                      <Chip key={idx} label={impacto.nome} size="small" color="error" sx={{ m: 0.25 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tema.probabilidade}
                      <LinearProgress 
                        variant="determinate" 
                        value={(tema.probabilidade / 5) * 100} 
                        sx={{ width: 40, height: 6 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tema.intensidade}
                      <LinearProgress 
                        variant="determinate" 
                        value={(tema.intensidade / 5) * 100} 
                        sx={{ width: 40, height: 6 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tema.abrangencia}
                      <LinearProgress 
                        variant="determinate" 
                        value={(tema.abrangencia / 5) * 100} 
                        sx={{ width: 40, height: 6 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tema.urgencia}
                      <LinearProgress 
                        variant="determinate" 
                        value={(tema.urgencia / 5) * 100} 
                        sx={{ width: 40, height: 6 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {tema.significanciaImpacto.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {tema.significanciaFinanceira.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {tema.importanciaPI.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {tema.priorizacao.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tema.status} 
                      size="small"
                      color={tema.status === 'Priorizado' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => handleViewTema(tema)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar tema">
                        <IconButton size="small" onClick={() => handleEditTema(tema)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderGraficos = () => {
    const matrizSeries = prepareMatrizData();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrendingUpIcon color="primary" />
          Análises e Visualizações
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {matrizSeries.length > 0 ? (
                  <Chart
                    options={matrizOptions}
                    series={matrizSeries}
                    type="bubble"
                    height={500}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Nenhum dado disponível para a matriz
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {requisicao === "Criar" ? "Novo Ciclo de Priorização ESG" : "Editar Ciclo de Priorização ESG"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure e gerencie o ciclo de priorização de temas ESG da sua organização
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 3 ? (
                    <Typography variant="caption">Última etapa</Typography>
                  ) : null
                }
                icon={step.icon}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? tratarSubmit : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      startIcon={index === steps.length - 1 ? <SaveIcon /> : null}
                    >
                      {index === steps.length - 1 ? 
                        (requisicao === "Criar" ? "Finalizar Criação" : "Salvar Alterações") : 
                        "Continuar"
                      }
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Voltar
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>Todas as etapas foram concluídas - o ciclo está pronto!</Typography>
            <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
              Revisar
            </Button>
          </Paper>
        )}

        {/* Dialog para edição de tema */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Editar Tema: {editingTema?.tema}
          </DialogTitle>
          <DialogContent>
            {editingTema && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Tema"
                    value={editingTema.tema}
                    onChange={(e) => setEditingTema({...editingTema, tema: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Probabilidade (1-5)"
                    type="number"
                    inputProps={{ min: 1, max: 5 }}
                    value={editingTema.probabilidade}
                    onChange={(e) => setEditingTema({...editingTema, probabilidade: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Intensidade (1-5)"
                    type="number"
                    inputProps={{ min: 1, max: 5 }}
                    value={editingTema.intensidade}
                    onChange={(e) => setEditingTema({...editingTema, intensidade: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Abrangência (1-5)"
                    type="number"
                    inputProps={{ min: 1, max: 5 }}
                    value={editingTema.abrangencia}
                    onChange={(e) => setEditingTema({...editingTema, abrangencia: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Urgência (1-5)"
                    type="number"
                    inputProps={{ min: 1, max: 5 }}
                    value={editingTema.urgencia}
                    onChange={(e) => setEditingTema({...editingTema, urgencia: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observação"
                    value={editingTema.observacao}
                    onChange={(e) => setEditingTema({...editingTema, observacao: e.target.value})}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTema} variant="contained" startIcon={<SaveIcon />}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para visualização de tema */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Detalhes do Tema: {selectedTema?.tema}
          </DialogTitle>
          <DialogContent>
            {selectedTema && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Eixo ESG</Typography>
                    <Chip 
                      label={selectedTema.eixo} 
                      sx={{ 
                        backgroundColor: eixosEsg.find(e => e.nome === selectedTema.eixo)?.cor,
                        color: 'white',
                        mb: 2
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedTema.status} 
                      color={selectedTema.status === 'Priorizado' ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Observação</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedTema.observacao}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Avaliações
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`Probabilidade: ${selectedTema.probabilidade}`} variant="outlined" />
                      <Chip label={`Intensidade: ${selectedTema.intensidade}`} variant="outlined" />
                      <Chip label={`Abrangência: ${selectedTema.abrangencia}`} variant="outlined" />
                      <Chip label={`Urgência: ${selectedTema.urgencia}`} variant="outlined" />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resultados Calculados
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`Sig. Impacto: ${selectedTema.significanciaImpacto.toFixed(1)}`} color="info" />
                      <Chip label={`Sig. Financeira: ${selectedTema.significanciaFinanceira.toFixed(1)}`} color="info" />
                      <Chip label={`Import. PI: ${selectedTema.importanciaPI.toFixed(1)}`} color="info" />
                      <Chip label={`Priorização: ${selectedTema.priorizacao.toFixed(1)}`} color="primary" />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                handleEditTema(selectedTema);
              }} 
              variant="contained"
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Sucesso */}
        <Dialog
          open={successDialogOpen}
          onClose={voltarParaListagem}
          sx={{
            "& .MuiDialog-paper": {
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              textAlign: "center",
            },
          }}
        >
          <Box display="flex" justifyContent="center" mt={2}>
            <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
          </Box>

          <DialogTitle
            sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
          >
            Ciclo de Priorização criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O ciclo de priorização foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
            </DialogContentText>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
            <Button
              onClick={continuarEdicao}
              variant="outlined"
              sx={{ minWidth: "120px" }}
            >
              Continuar Editando
            </Button>
            <Button
              onClick={voltarParaListagem}
              variant="contained"
              sx={{ minWidth: "120px" }}
            >
              Voltar para Listagem
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default NovoCicloPriorizacao;

