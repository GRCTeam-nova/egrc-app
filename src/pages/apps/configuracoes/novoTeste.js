/* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Box,
  TextField,
  Tooltip,
  Autocomplete,
  Grid,
  Stack,
  Typography,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import FileUploader from "./FileUploader";
import ListagemFaseTestes from "./listaFaseTeste";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parseISO } from "date-fns";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [objetivoControles, setObjetivoControle] = useState("");
  const [tiposControles, setTiposControles] = useState("");
  const [carvs, setCarvs] = useState("");
  const [frequencias, setFrequencias] = useState("");
  const [classificacoes, setClassificacoes] = useState("");
  const [execucoes, setExecucoes] = useState("");
  const [ipes, setIpes] = useState([]);
  const [riscos, setRiscoAssociados] = useState("");
  const [controles, setControles] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [assertions, setAssertions] = useState("");
  const [elementos] = useState([]);
  const [elementosContabil] = useState([]);
  const [compensadoControles] = useState([]);
  const [compensaControles] = useState([]);
  const [processos, setProcessos] = useState("");
  const [descricaoTeste, setDescricaoTeste] = useState("");
  const [descricaoControle, setDescricaoControle] = useState("");
  const [nome, setNome] = useState("");
  const [responsaveisTestes, setResponsavelTeste] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [controleAccordionExpanded, setControleAccordionExpanded] =
    useState(false);
  const [controleDados, setControleDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [setDeletedFiles] = useState([]);
  const [statuss] = useState([
    { id: 1, nome: "Não Iniciado" },
    { id: 2, nome: "Em Teste" },
    { id: 3, nome: "Em Revisão" },
    { id: 4, nome: "Concluído" },
    { id: 5, nome: "Revisado" },
  ]);
  const [conclusaoTestes] = useState([
    { id: 1, nome: "Efetivo" },
    { id: 2, nome: "Inefetivo" },
  ]);
  const [tipoProjetos, setTipoProjetos] = useState([]);
  const [descricaoConclusao, setDescricaoConclusao] = useState("");
  const [dataPrevistaConclusao, setDataPrevistaConclusao] = useState(null);
  const [dataConclusao, setDataConclusao] = useState(null);
  const [dataBase, setDataBase] = useState(null);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    ativo: [],
    ipe: [],
    compensadoControle: [],
    compensaControle: [],
    objetivoControle: [],
    kri: [],
    elemento: [],
    elementoContabil: [],
    carv: [],
    plano: [],
    deficiencia: [],
    ameaca: [],
    controle: "",
    normativa: [],
    assertion: [],
    status: null,
    departamento: [],
    categoria: "",
    conclusaoTeste: "",
    frequencia: "",
    projeto: "",
    responsaveisTeste: "",
    execucao: "",
    classificacao: "",
    tiposControle: "",
    processo: "",
    files: [],
    risco: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idControl, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idControl ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idControl ||
          item.idFramework ||
          item.idTreatment ||
          item.idProject ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idProjectType ||
          item.idNormative ||
          item.idControlType ||
          item.idDepartment ||
          item.idExecution ||
          item.idKri ||
          item.idControl ||
          item.idElementCoso ||
          item.idThreat ||
          item.idObjective ||
          item.idLedgerAccount ||
          item.idInformationActivity ||
          item.idAssertion ||
          item.idCvar ||
          item.idClassification ||
          item.idRisk ||
          item.idDeficiency ||
          item.idCollaborator ||
          item.idPlatform,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/projects`,
      setProjetos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/projects/types`,
      setTipoProjetos
    );
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/ipe`, setIpes);
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/controls`,
      setControles
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setResponsavelTeste
    );
    const frequencias = [
      { id: 1, nome: "Várias vezes ao dia" },
      { id: 2, nome: "Diário" },
      { id: 3, nome: "Semanal" },
      { id: 4, nome: "Quinzenal" },
      { id: 5, nome: "Mensal" },
      { id: 6, nome: "Bimestral" },
      { id: 7, nome: "Trimestral" },
      { id: 8, nome: "Semestral" },
      { id: 9, nome: "Anual" },
      { id: 10, nome: "Bienal" },
      { id: 11, nome: "Quinquenal" },
    ];
    setFrequencias(frequencias);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (!dadosApi?.idTest) return;

    const fetchAll = async () => {
      try {
        // 1) Busca dados do teste existente
        const resTest = await axios.get(
          `https://api.egrc.homologacao.com.br/api/v1/projects/tests/${dadosApi.idTest}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = resTest.data;
        setRequisicao("Editar");
        setControleDados(data);
        setMensagemFeedback("editado");
        setNome(data.name || "");
        setDescricaoTeste(data.description || "");
        setRiscoAssociados(data.controlRisks || "");
        setAssertions(data.controlAssertions || "");
        setClassificacoes(data.controlClassification || "");
        setCarvs(data.controlCvars || "");
        setExecucoes(data.controlExecution || "");
        setFrequencias(data.controlFrequency || "");
        setObjetivoControle(data.controlObjectives || "");
        setProcessos(data.controlProcess || "");
        setTiposControles(data.controlType || "");
        setDescricaoControle(data.description || "");
        setDescricaoConclusao(data.descriptionTestCompletion || "");
        setDataConclusao(
          data.completionDate ? parseISO(data.completionDate) : null
        );
        setDataPrevistaConclusao(
          data.expectedCompletionDate
            ? parseISO(data.expectedCompletionDate)
            : null
        );
        setFormData((prev) => ({
          ...prev,
          projeto: data.idProject,
          controle: data.idControl,
          conclusaoTeste: data.testConclusion,
          // não setamos status aqui
        }));

        // 2) Busca fases do teste e calcula status principal
        const resPhases = await axios.get(
          `https://api.egrc.homologacao.com.br/api/v1/projects/tests/${dadosApi.idTest}/phases`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mainStatus = computeMainStatus(resPhases.data);
        setFormData((prev) => ({ ...prev, status: mainStatus }));
      } catch (err) {
        console.error("Erro ao inicializar edição:", err);
      }
    };

    fetchAll();
  }, [dadosApi, token]);

  function computeMainStatus(phases) {
    // Se não veio nenhuma fase
    if (phases.length === 0) return 1; // NotStarted

    const statuses = phases.map((p) => p.testPhaseStatus);
    const unique = [...new Set(statuses)];
    // Se todas iguais
    if (unique.length === 1) return unique[0];

    // Se houver pelo menos um NotStarted(1) ou InTest(2)
    if (statuses.some((s) => s === 1 || s === 2)) return 2; // InTest

    // Senão (todos são >=3)
    return 3; // InRevision
  }

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nome);

    // Atualiza os departamentos inferiores removendo os que conflitam
    const inferioresAtualizadas = formData.compensaControle.filter((id) => {
      const compensaControle = compensaControles.find(
        (departamento) => departamento.id === id
      );
      if (!compensaControle) return false;
      return formatarNome(compensaControle.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.compensaControle.length) {
      setFormData((prev) => ({
        ...prev,
        compensaControle: inferioresAtualizadas,
      }));
    }

    // **Novo bloco: Atualiza os departamentos laterais**
    const lateraisAtualizadas = formData.compensadoControle.filter((id) => {
      const compensadoControle = compensadoControles.find(
        (departamento) => departamento.id === id
      );
      if (!compensadoControle) return false;
      return formatarNome(compensadoControle.nome) !== nomeDigitado;
    });
    if (lateraisAtualizadas.length !== formData.compensadoControle.length) {
      setFormData((prev) => ({
        ...prev,
        compensadoControle: lateraisAtualizadas,
      }));
    }
  }, [
    nome,
    compensaControles,
    compensadoControles,
    formData.compensaControle,
    formData.compensadoControle,
  ]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAllElementos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.elemento.length === elementos.length) {
        // Deselect all
        setFormData({ ...formData, elemento: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          elemento: elementos.map((elemento) => elemento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "elemento",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllElementosContabil = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.elementoContabil.length === elementosContabil.length) {
        // Deselect all
        setFormData({ ...formData, elementoContabil: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          elementoContabil: elementosContabil.map((elemento) => elemento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "elementoContabil",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllIpes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ipe.length === ipes.length) {
        // Deselect all
        setFormData({ ...formData, ipe: [] });
      } else {
        // Select all
        setFormData({ ...formData, ipe: ipes.map((ipe) => ipe.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "ipe",
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  // Função para voltar para a listagem
  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation] = useState({
    codigo: true,
    nome: true,
    processo: true,
  });

  const allSelectedIpes =
    formData.ipe.length === ipes.length && ipes.length > 0;
  const allSelectedElementos =
    formData.elemento.length === elementos.length && elementos.length > 0;

  const allSelectedElementosContabil =
    formData.elementoContabil.length === elementosContabil.length &&
    elementosContabil.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios para cadastro simples
    const missingRequired = [];
    if (!formData.projeto) missingRequired.push("Projeto");
    if (!formData.controle) missingRequired.push("Controle");
    if (!dataPrevistaConclusao)
      missingRequired.push("Data Prevista de Conclusão");
    if (missingRequired.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingRequired.join(
          ", "
        )} são obrigatórios e devem estar preenchidos!`,
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
      return;
    }

    try {
      setLoading(true);
      if (requisicao === "Criar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/projects/tests";
        method = "POST";
        payload = {
          description: descricaoTeste,
          expectedCompletionDate: dataPrevistaConclusao,
          idProject: formData.projeto,
          idControl: formData.controle,
        };
      } else if (requisicao === "Editar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/projects/tests";
        method = "PUT";
        payload = {
          idTest: controleDados?.idTest,
          name: nome,
          description: descricaoTeste,
          expectedCompletionDate: dataPrevistaConclusao,
          idProject: formData.projeto,
          idControl: formData.controle,
          idProjectType: tiposControles,
          descriptionTestCompletion: descricaoConclusao,
          completionDate: dataConclusao,
          testConclusion: formData.conclusaoTeste,
          active: true,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("Erro ao cadastrar o teste.");
      } else {
        enqueueSnackbar(`Cadastro ${mensagemFeedback} com sucesso!`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }

      if (requisicao === "Criar" && data.data && data.data.idTest) {
        setControleDados(data.data);
        setSuccessDialogOpen(true);
        navigate(location.pathname, {
          replace: true,
          state: { dadosApi: data.data },
        });
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse teste.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Projeto *</InputLabel>
              <Autocomplete
                options={projetos}
                getOptionLabel={(option) => option.nome}
                value={
                  projetos.find((projeto) => projeto.id === formData.projeto) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    projeto: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.projeto && formValidation.projeto === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Controle *</InputLabel>
              <Autocomplete
                options={controles}
                getOptionLabel={(option) => option.nome}
                value={
                  controles.find(
                    (controle) => controle.id === formData.controle
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    controle: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.controle && formValidation.controle === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição do teste *</InputLabel>
              <TextField
                onChange={(event) => setDescricaoTeste(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricaoTeste}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Data prevista de conclusão *</InputLabel>
              <DatePicker
                value={dataPrevistaConclusao}
                onChange={(newValue) => setDataPrevistaConclusao(newValue)}
                inputFormat="dd/MM/yyyy"
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Status</InputLabel>
                  <Autocomplete
                    disabled
                    options={statuss}
                    getOptionLabel={(option) => option.nome}
                    value={
                      statuss.find((status) => status.id === formData.status) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        status: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de Conclusão *</InputLabel>
                  <DatePicker
                    value={dataConclusao}
                    onChange={(newValue) => setDataConclusao(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Conclusão do teste *</InputLabel>
                  <Autocomplete
                    options={conclusaoTestes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      conclusaoTestes.find(
                        (conclusaoTeste) =>
                          conclusaoTeste.id === formData.conclusaoTeste
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        conclusaoTeste: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da conclusão</InputLabel>
                  <TextField
                    multiline
                    rows={2}
                    onChange={(event) =>
                      setDescricaoConclusao(event.target.value)
                    }
                    fullWidth
                    value={descricaoConclusao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo de projeto</InputLabel>
                  <Autocomplete
                    options={tipoProjetos}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tipoProjetos.find(
                        (tipoProjeto) => tipoProjeto.id === formData.tipoProjeto
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoProjeto: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data base</InputLabel>
                  <DatePicker
                    value={dataBase}
                    onChange={(newValue) => setDataBase(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Responsável pelo teste</InputLabel>
                  <Autocomplete
                    options={responsaveisTestes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveisTestes.find(
                        (responsaveisTeste) =>
                          responsaveisTeste.id === formData.responsaveisTeste
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        responsaveisTeste: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion
                  expanded={controleAccordionExpanded}
                  onChange={(_, isExpanded) =>
                    setControleAccordionExpanded(isExpanded)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Campos do controle</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1} marginTop={2}>
                      <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Descrição do controle</InputLabel>
                          <TextField
                            disabled
                            multiline
                            rows={2}
                            onChange={(event) =>
                              setDescricaoControle(event.target.value)
                            }
                            fullWidth
                            value={descricaoControle}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Tipo de controle</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setTiposControles(event.target.value)
                            }
                            fullWidth
                            value={tiposControles}
                          />
                        </Stack>
                      </Grid>

                      {/* <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Compensa os controles</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...compensaControles.filter((departamento) => {
                        // IDs já selecionados em outros autocompletes:
                        const superiorId = formData.departamentoSuperior;
                        const lateralIds = formData.compensadoControle || [];

                        // Se o departamento estiver selecionado neste campo, mantenha-o
                        if (formData.compensaControle.includes(departamento.id))
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !lateralIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nome)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.compensaControle.map(
                      (id) =>
                        compensaControles.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllCompensaControles}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedCompensaControles
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.compensaControle.length === 0 ||
                            formData.compensaControle.every(
                              (val) => val === 0
                            )) &&
                          formValidation.compensaControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Compensado pelos controles</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...compensadoControles.filter((departamento) => {
                        const superiorId = formData.departamentoSuperior;
                        const inferiorIds = formData.compensaControle || [];

                        if (
                          formData.compensadoControle.includes(departamento.id)
                        )
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !inferiorIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nome)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.compensadoControle.map(
                      (id) =>
                        compensadoControles.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllCompensadoControles}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedCompensadoControles
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.compensadoControle.length === 0 ||
                            formData.compensadoControle.every(
                              (val) => val === 0
                            )) &&
                          formValidation.compensaControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid> */}

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Objetivo de controle</InputLabel>
                          <Tooltip
                            title={objetivoControles || ""}
                            arrow
                            placement="top"
                          >
                            <TextField
                              disabled
                              fullWidth
                              value={objetivoControles}
                              onChange={(event) =>
                                setObjetivoControle(event.target.value)
                              }
                              // aplica truncamento no conteúdo visível
                              inputProps={{
                                style: {
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </Tooltip>
                        </Stack>
                      </Grid>

                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Riscos</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setRiscoAssociados(event.target.value)
                            }
                            fullWidth
                            value={riscos}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Processos</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setProcessos(event.target.value)
                            }
                            fullWidth
                            value={processos}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Elemento contábil</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...elementosContabil,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.elementoContabil.map(
                              (id) =>
                                elementosContabil.find(
                                  (elementoContabil) =>
                                    elementoContabil.id === id
                                ) || id
                            )}
                            onChange={handleSelectAllElementosContabil}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox
                                      checked={
                                        option.id === "all"
                                          ? allSelectedElementosContabil
                                          : selected
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs>
                                    {option.nome}
                                  </Grid>
                                </Grid>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  (formData.elementoContabil.length === 0 ||
                                    formData.elementoContabil.every(
                                      (val) => val === 0
                                    )) &&
                                  formValidation.elementoContabil === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Informação da atividade (IPE)</InputLabel>
                          <Autocomplete
                            multiple
                            disableCloseOnSelect
                            disabled
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...ipes,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.ipe.map(
                              (id) => ipes.find((ipe) => ipe.id === id) || id
                            )}
                            onChange={handleSelectAllIpes}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox
                                      checked={
                                        option.id === "all"
                                          ? allSelectedIpes
                                          : selected
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs>
                                    {option.nome}
                                  </Grid>
                                </Grid>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  (formData.ipe.length === 0 ||
                                    formData.ipe.every((val) => val === 0)) &&
                                  formValidation.ipe === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Frequência</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setFrequencias(event.target.value)
                            }
                            fullWidth
                            value={frequencias}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Execução</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setExecucoes(event.target.value)
                            }
                            fullWidth
                            value={execucoes}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Classificação</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setClassificacoes(event.target.value)
                            }
                            fullWidth
                            value={classificacoes}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Elemento COSO</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...elementos,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.elemento.map(
                              (id) =>
                                elementos.find(
                                  (elemento) => elemento.id === id
                                ) || id
                            )}
                            onChange={handleSelectAllElementos}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox
                                      checked={
                                        option.id === "all"
                                          ? allSelectedElementos
                                          : selected
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs>
                                    {option.nome}
                                  </Grid>
                                </Grid>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  (formData.elemento.length === 0 ||
                                    formData.elemento.every(
                                      (val) => val === 0
                                    )) &&
                                  formValidation.elemento === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Assertions</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setAssertions(event.target.value)
                            }
                            fullWidth
                            value={assertions}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>CAVR</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) => setCarvs(event.target.value)}
                            fullWidth
                            value={carvs}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Fase de teste</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemFaseTestes novoOrgao={dadosApi} />
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={1}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
                    onFileDelete={(file) =>
                      setDeletedFiles((prev) => [...prev, file])
                    }
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "8px",
                marginRight: "20px",
                marginTop: 5,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: "91px",
                  height: "32px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
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
            {/* Ícone de Sucesso */}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {/* Título Centralizado */}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Teste criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O teste foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse teste.
              </DialogContentText>
            </DialogContent>

            {/* Botões */}
            <DialogActions
              sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
            >
              <Button
                onClick={voltarParaListagem}
                variant="outlined"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                  },
                }}
              >
                Voltar para a listagem
              </Button>
              <Button
                onClick={continuarEdicao}
                variant="contained"
                sx={{
                  backgroundColor: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0056b3",
                  },
                }}
                autoFocus
              >
                Adicionar mais informações
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
