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
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Dados mock para os selects
const eixosEsg = [
  { id: 1, nome: "Ambiental" },
  { id: 2, nome: "Social" },
  { id: 3, nome: "Governança" },
];

const criteriosAvaliados = [
  // Critérios Ambientais
  { id: 1, nome: "Mitigação de emissões de gases de efeito estufa (GEE)", eixo: "Ambiental" },
  { id: 2, nome: "Adaptação às mudanças climáticas", eixo: "Ambiental" },
  { id: 3, nome: "Eficiência energética", eixo: "Ambiental" },
  { id: 4, nome: "Uso da água", eixo: "Ambiental" },
  { id: 5, nome: "Gestão de efluentes", eixo: "Ambiental" },
  { id: 6, nome: "Conservação e uso sustentável da biodiversidade", eixo: "Ambiental" },
  { id: 7, nome: "Uso sustentável do solo", eixo: "Ambiental" },
  { id: 8, nome: "Conservação e uso sustentável dos oceanos", eixo: "Ambiental" },
  { id: 9, nome: "Economia circular", eixo: "Ambiental" },
  { id: 10, nome: "Gestão de resíduos", eixo: "Ambiental" },
  { id: 11, nome: "Gestão ambiental", eixo: "Ambiental" },
  { id: 12, nome: "Prevenção da poluição sonora (ruídos e vibrações)", eixo: "Ambiental" },
  { id: 13, nome: "Qualidade do ar (emissão de poluentes)", eixo: "Ambiental" },
  { id: 14, nome: "Gerenciamento de áreas contaminadas", eixo: "Ambiental" },
  // Critérios Sociais
  { id: 15, nome: "Investimento social privado", eixo: "Social" },
  { id: 16, nome: "Diálogo e engajamento das partes interessadas", eixo: "Social" },
  { id: 17, nome: "Impacto social", eixo: "Social" },
  { id: 18, nome: "Respeito aos direitos humanos", eixo: "Social" },
  { id: 19, nome: "Combate ao trabalho forçado ou compulsório", eixo: "Social" },
  { id: 20, nome: "Combate ao trabalho infantil", eixo: "Social" },
  { id: 21, nome: "Políticas e práticas de diversidade e equidade", eixo: "Social" },
  { id: 22, nome: "Cultura e promoção de inclusão", eixo: "Social" },
  { id: 23, nome: "Desenvolvimento profissional", eixo: "Social" },
  { id: 24, nome: "Saúde e segurança ocupacional", eixo: "Social" },
  { id: 25, nome: "Qualidade de vida", eixo: "Social" },
  { id: 26, nome: "Liberdade de associação", eixo: "Social" },
  { id: 27, nome: "Política de remuneração e benefícios", eixo: "Social" },
  { id: 28, nome: "Relacionamento com consumidores e clientes", eixo: "Social" },
  { id: 29, nome: "Relacionamento com os fornecedores", eixo: "Social" },
  // Critérios de Governança
  { id: 30, nome: "Estrutura e composição da governança corporativa", eixo: "Governança" },
  { id: 31, nome: "Propósito e estratégia em relação à sustentabilidade", eixo: "Governança" },
  { id: 32, nome: "Compliance, programa de integridade e práticas anticorrupção", eixo: "Governança" },
  { id: 33, nome: "Práticas de combate à concorrência desleal (antitruste)", eixo: "Governança" },
  { id: 34, nome: "Engajamento das partes interessadas", eixo: "Governança" },
  { id: 35, nome: "Gestão de riscos do negócio", eixo: "Governança" },
  { id: 36, nome: "Controles internos", eixo: "Governança" },
  { id: 37, nome: "Auditorias interna e externa", eixo: "Governança" },
  { id: 38, nome: "Gestão da segurança da informação", eixo: "Governança" },
  { id: 39, nome: "Privacidade de dados pessoais", eixo: "Governança" },
  { id: 40, nome: "Responsabilização (prestação de contas)", eixo: "Governança" },
  { id: 41, nome: "Relatórios ESG, de sustentabilidade e/ou relato integrado", eixo: "Governança" },
  { id: 42, nome: "Produtos perigosos", eixo: "Ambiental" },
  { id: 43, nome: "Diálogo social e desenvolvimento territorial", eixo: "Social" },
];

const gruposTema = [
  { id: 1, nome: "Grupo Ambiental" },
  { id: 2, nome: "Grupo Social" },
  { id: 3, nome: "Grupo Governança" },
  { id: 4, nome: "Grupo Estratégico" },
  { id: 5, nome: "Grupo Operacional" },
];

const indicadores = [
  { id: 1, nome: "Indicador de Emissões GEE" },
  { id: 2, nome: "Indicador de Consumo de Água" },
  { id: 3, nome: "Indicador de Geração de Resíduos" },
  { id: 4, nome: "Indicador de Diversidade" },
  { id: 5, nome: "Indicador de Segurança do Trabalho" },
  { id: 6, nome: "Indicador de Governança" },
];

const stakeholders = [
  { id: 1, nome: "Cliente" },
  { id: 2, nome: "Fornecedor" },
  { id: 3, nome: "Acionistas/Investidores" },
  { id: 4, nome: "Conselheiros" },
  { id: 5, nome: "Associações/ONGs/Órgãos" },
  { id: 6, nome: "Sociedade" },
  { id: 7, nome: "Colaboradores" },
  { id: 8, nome: "Reguladores" },
];

const ods = [
  { id: 1, nome: "ODS 1 - Erradicação da Pobreza" },
  { id: 2, nome: "ODS 2 - Fome Zero e Agricultura Sustentável" },
  { id: 3, nome: "ODS 3 - Saúde e Bem-Estar" },
  { id: 4, nome: "ODS 4 - Educação de Qualidade" },
  { id: 5, nome: "ODS 5 - Igualdade de Gênero" },
  { id: 6, nome: "ODS 6 - Água Potável e Saneamento" },
  { id: 7, nome: "ODS 7 - Energia Limpa e Acessível" },
  { id: 8, nome: "ODS 8 - Trabalho Decente e Crescimento Econômico" },
  { id: 9, nome: "ODS 9 - Indústria, Inovação e Infraestrutura" },
  { id: 10, nome: "ODS 10 - Redução das Desigualdades" },
  { id: 11, nome: "ODS 11 - Cidades e Comunidades Sustentáveis" },
  { id: 12, nome: "ODS 12 - Consumo e Produção Responsáveis" },
  { id: 13, nome: "ODS 13 - Ação Contra a Mudança Global do Clima" },
  { id: 14, nome: "ODS 14 - Vida na Água" },
  { id: 15, nome: "ODS 15 - Vida Terrestre" },
  { id: 16, nome: "ODS 16 - Paz, Justiça e Instituições Eficazes" },
  { id: 17, nome: "ODS 17 - Parcerias e Meios de Implementação" },
];

const capitais = [
  { id: 1, nome: "Financeiro" },
  { id: 2, nome: "Humano" },
  { id: 3, nome: "Intelectual" },
  { id: 4, nome: "Social e Relacionamento" },
  { id: 5, nome: "Manufaturado" },
  { id: 6, nome: "Natural" },
];

const impactosEsg = [
  { id: 1, nome: "Diminuição do nível de água no rio dificulta a utilização da água na produção", tipo: "financeiro" },
  { id: 2, nome: "As emissões das fábricas aumenta o efeito estufa", tipo: "impacto" },
  { id: 3, nome: "Redução de custos operacionais", tipo: "financeiro" },
  { id: 4, nome: "Melhoria da imagem corporativa", tipo: "impacto" },
  { id: 5, nome: "Aumento da produtividade", tipo: "financeiro" },
];

const empresas = [
  { id: 1, nome: "Empresa A" },
  { id: 2, nome: "Empresa B" },
  { id: 3, nome: "Empresa C" },
];

const processos = [
  { id: 1, nome: "Processo de Produção" },
  { id: 2, nome: "Processo de Vendas" },
  { id: 3, nome: "Processo de RH" },
  { id: 4, nome: "Processo Financeiro" },
];

const departamentos = [
  { id: 1, nome: "Departamento de Sustentabilidade" },
  { id: 2, nome: "Departamento de RH" },
  { id: 3, nome: "Departamento Financeiro" },
  { id: 4, nome: "Departamento de Produção" },
];

const riscos = [
  { id: 1, nome: "Risco Climático" },
  { id: 2, nome: "Risco Regulatório" },
  { id: 3, nome: "Risco Reputacional" },
  { id: 4, nome: "Risco Operacional" },
];

const planosAcao = [
  { id: 1, nome: "Plano de Redução de Emissões" },
  { id: 2, nome: "Plano de Diversidade e Inclusão" },
  { id: 3, nome: "Plano de Gestão de Resíduos" },
];

const padroesEsg = [
  { id: 1, nome: "GRI", topicos: ["GRI 102", "GRI 201", "GRI 302", "GRI 401"] },
  { id: 2, nome: "SASB", topicos: ["SASB-001", "SASB-002", "SASB-003"] },
  { id: 3, nome: "TCFD", topicos: ["TCFD-Gov", "TCFD-Str", "TCFD-Risk"] },
  { id: 4, nome: "CDP", topicos: ["CDP-CC", "CDP-Water", "CDP-Forest"] },
];

const colaboradores = [
  { id: 1, nome: "João Silva" },
  { id: 2, nome: "Maria Santos" },
  { id: 3, nome: "Pedro Oliveira" },
  { id: 4, nome: "Ana Costa" },
];

// ==============================|| NOVO TEMA ESG ||============================== //
function NovoTema() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { temaDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    // Campos obrigatórios
    codigoTema: "",
    nomeTema: "",
    descricaoTema: "",
    responsavel: null,
    
    // Campos de seleção múltipla
    eixoEsg: [],
    criteriosRelacionadosAvaliados: [],
    grupoTema: [],
    indicadoresTema: [],
    stakeholders: [],
    ods: [],
    capitais: [],
    significanciaFinanceira: [],
    significanciaDeImpacto: [],
    empresaTema: [],
    processoTema: [],
    departamentoTema: [],
    riscoTema: [],
    planoAcao: [],
    
    // Campos de padrão/framework
    nomePadrao: null,
    nomeTopico: null,
    
    // Campos automáticos (readonly)
    cicloPriorizacao: null,
    statusTema: "Ativo",
    
    // Anexos
    anexos: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (temaDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do tema para edição
      // setFormData com os dados existentes
    }
  }, [temaDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleMultiSelectChange = (field) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    setHasChanges(true);
  };

  const handlePadraoChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      nomePadrao: newValue,
      nomeTopico: null // Reset tópico quando muda padrão
    }));
    setHasChanges(true);
  };

  const getTopicosPorPadrao = () => {
    if (!formData.nomePadrao) return [];
    const padrao = padroesEsg.find(p => p.id === formData.nomePadrao.id);
    return padrao ? padrao.topicos.map((topico, index) => ({ id: index + 1, nome: topico })) : [];
  };

  const [formValidation, setFormValidation] = useState({
    codigoTema: true,
    nomeTema: true,
    descricaoTema: true,
    responsavel: true,
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

  const validarCodigoTema = (codigo) => {
    // Regra: máximo de 10 caracteres e não pode repetir
    if (codigo.length > 10) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarNomeTema = (nome) => {
    // Regra: tamanho curto e não pode repetir
    if (nome.length > 100) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.codigoTema.trim() || !validarCodigoTema(formData.codigoTema)) {
      setFormValidation(prev => ({ ...prev, codigoTema: false }));
      missingFields.push("Código do Tema");
    }
    
    if (!formData.nomeTema.trim() || !validarNomeTema(formData.nomeTema)) {
      setFormValidation(prev => ({ ...prev, nomeTema: false }));
      missingFields.push("Nome do Tema");
    }
    
    if (!formData.descricaoTema.trim()) {
      setFormValidation(prev => ({ ...prev, descricaoTema: false }));
      missingFields.push("Descrição do Tema");
    }
    
    if (!formData.responsavel) {
      setFormValidation(prev => ({ ...prev, responsavel: false }));
      missingFields.push("Responsável");
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
      
      enqueueSnackbar(`Tema ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o tema ESG.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={3} marginTop={1}>
          
          {/* Seção: Informações Básicas */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Informações Básicas do Tema
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código do Tema *</InputLabel>
              <TextField
                fullWidth
                value={formData.codigoTema}
                onChange={(e) => handleInputChange('codigoTema', e.target.value)}
                error={!formData.codigoTema && formValidation.codigoTema === false}
                placeholder="Digite o código do tema (máx. 10 caracteres)"
                inputProps={{ maxLength: 10 }}
                helperText="Máximo de 10 caracteres. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Tema *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeTema}
                onChange={(e) => handleInputChange('nomeTema', e.target.value)}
                error={!formData.nomeTema && formValidation.nomeTema === false}
                placeholder="Digite o nome do tema"
                helperText="Tamanho curto. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Tema *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricaoTema}
                onChange={(e) => handleInputChange('descricaoTema', e.target.value)}
                error={!formData.descricaoTema && formValidation.descricaoTema === false}
                placeholder="Digite a descrição detalhada do tema"
                helperText="Descrição longa do tema."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Padrão/Framework</InputLabel>
              <Autocomplete
                multiple
                options={padroesEsg}
                getOptionLabel={(option) => option.nome}
                value={formData.padroesEsg}
                onChange={handleMultiSelectChange('padroesEsg')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os padrões" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Tópico do Padrão</InputLabel>
              <Autocomplete
                options={getTopicosPorPadrao()}
                getOptionLabel={(option) => option.nome}
                value={formData.nomeTopico}
                onChange={(event, newValue) => handleInputChange('nomeTopico', newValue)}
                disabled={!formData.nomePadrao}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione o tópico" />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Responsável *</InputLabel>
              <Autocomplete
                options={colaboradores}
                getOptionLabel={(option) => option.nome}
                value={formData.responsavel}
                onChange={(event, newValue) => handleInputChange('responsavel', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.responsavel && formValidation.responsavel === false}
                    placeholder="Selecione o responsável"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Seção: Classificação ESG */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Classificação ESG
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Eixo ESG</InputLabel>
              <Autocomplete
                multiple
                options={eixosEsg}
                getOptionLabel={(option) => option.nome}
                value={formData.eixoEsg}
                onChange={handleMultiSelectChange('eixoEsg')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os eixos ESG" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Grupo do Tema</InputLabel>
              <Autocomplete
                multiple
                options={gruposTema}
                getOptionLabel={(option) => option.nome}
                value={formData.grupoTema}
                onChange={handleMultiSelectChange('grupoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os grupos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Indicadores do Tema</InputLabel>
              <Autocomplete
                multiple
                options={indicadores}
                getOptionLabel={(option) => option.nome}
                value={formData.indicadoresTema}
                onChange={handleMultiSelectChange('indicadoresTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os indicadores" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Stakeholders e Relacionamentos */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Stakeholders e Relacionamentos
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Stakeholders</InputLabel>
              <Autocomplete
                multiple
                options={stakeholders}
                getOptionLabel={(option) => option.nome}
                value={formData.stakeholders}
                onChange={handleMultiSelectChange('stakeholders')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os stakeholders" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>ODS Relacionados</InputLabel>
              <Autocomplete
                multiple
                options={ods}
                getOptionLabel={(option) => option.nome}
                value={formData.ods}
                onChange={handleMultiSelectChange('ods')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os ODS" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Capitais Relacionados</InputLabel>
              <Autocomplete
                multiple
                options={capitais}
                getOptionLabel={(option) => option.nome}
                value={formData.capitais}
                onChange={handleMultiSelectChange('capitais')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os capitais" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Impactos e Significância */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Impactos
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Significância Financeira</InputLabel>
              <Autocomplete
                multiple
                options={impactosEsg.filter(i => i.tipo === 'financeiro')}
                getOptionLabel={(option) => option.nome}
                value={formData.significanciaFinanceira}
                onChange={handleMultiSelectChange('significanciaFinanceira')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os impactos financeiros" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Significância de Impacto</InputLabel>
              <Autocomplete
                multiple
                options={impactosEsg.filter(i => i.tipo === 'impacto')}
                getOptionLabel={(option) => option.nome}
                value={formData.significanciaDeImpacto}
                onChange={handleMultiSelectChange('significanciaDeImpacto')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os impactos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Organização e Gestão */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Organização e Gestão
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Empresa</InputLabel>
              <Autocomplete
                multiple
                options={empresas}
                getOptionLabel={(option) => option.nome}
                value={formData.empresaTema}
                onChange={handleMultiSelectChange('empresaTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione as empresas" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Processo</InputLabel>
              <Autocomplete
                multiple
                options={processos}
                getOptionLabel={(option) => option.nome}
                value={formData.processoTema}
                onChange={handleMultiSelectChange('processoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os processos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Departamento</InputLabel>
              <Autocomplete
                multiple
                options={departamentos}
                getOptionLabel={(option) => option.nome}
                value={formData.departamentoTema}
                onChange={handleMultiSelectChange('departamentoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os departamentos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Riscos</InputLabel>
              <Autocomplete
                multiple
                options={riscos}
                getOptionLabel={(option) => option.nome}
                value={formData.riscoTema}
                onChange={handleMultiSelectChange('riscoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os riscos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Plano de Ação</InputLabel>
              <Autocomplete
                multiple
                options={planosAcao}
                getOptionLabel={(option) => option.nome}
                value={formData.planoAcao}
                onChange={handleMultiSelectChange('planoAcao')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os planos de ação" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Informações Automáticas */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Histórico de priorização
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização</InputLabel>
              <TextField
                fullWidth
                value={formData.cicloPriorizacao || "Será definido automaticamente"}
                InputProps={{ readOnly: true }}
                helperText="Campo preenchido automaticamente na tela de priorização"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Status do Tema</InputLabel>
              <TextField
                fullWidth
                value={formData.statusTema}
                InputProps={{ readOnly: true }}
                helperText="Status baseado na última priorização realizada"
              />
            </Stack>
          </Grid>

          {/* Botões de ação */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={tratarSubmit}
                sx={{ minWidth: 120 }}
              >
                {requisicao === "Criar" ? "Criar" : "Atualizar"}
              </Button>
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: 120 }}
              >
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>

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
            Tema ESG criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O tema ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoTema;

