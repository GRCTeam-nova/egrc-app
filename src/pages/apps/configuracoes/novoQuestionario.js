import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { DatePicker } from "@mui/x-date-pickers";
import HeatmapAvaliacaoRiscoQuestionario from "./avaliacaoRiscoGraficoQuestionario";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi, readOnly: readOnlyFromState, mode } = location.state || {};
  const isReadOnly = Boolean(readOnlyFromState) || mode === "consultar";
  const [controles, setControle] = useState([]);
  const [diretrizes, setDiretriz] = useState([]);
  const [incidentes, setIncidente] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [causas, setCausa] = useState([]);
  const [kris, setKris] = useState([]);
  const [inherentCoord, setInherentCoord] = React.useState("");
  const [residualCoord, setResidualCoord] = React.useState("");
  const [plannedCoord, setPlannedCoord] = React.useState("");
  const [impactos, setImpactos] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [heatmapDataAv, setHeatmapData] = useState([]);
  const [nivelAv, setNivelAv] = useState([]);
  const [descricaoDoRisco, setDescricaoRisco] = useState("");
  const [si, setSi] = useState({ prob: null, impact: null });
  const [sr, setSr] = useState({ prob: null, impact: null });
  const [sp, setSp] = useState({ prob: null, impact: null });
  const [ciclos, setCiclo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [normativaDados, setNormativaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [justificativaFilho, setJustificativaFilho] = useState("");

  const handleJustificativaChange = (novaJust) => {
    if (isReadOnly) return;
    setJustificativaFilho(novaJust);
  };
  const [statuss] = useState([
    { id: 1, nome: "Não iniciada" },
    { id: 2, nome: "Iniciado" },
    { id: 3, nome: "Concluida" },
  ]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    sobrepor: "",
    tipoNorma: "",
    riscoNorma: "",
    periodicidadeRevisao: "",
    prioridade: "",
    tipoPlano: "",
    ciclo: "",
    empresaInferior: [],
    diretriz: [],
    status: "",
    responsavel: [],
    responsavelAv: [],
    respondente: "",
    kri: [],
    normaDestino: [],
    controle: [],
    incidente: [],
    tratamento: [],
    plano: [],
    causa: [],
    risco: "",
    ameaca: [],
    normativa: [],
    impacto: [],
    planoAcao: [],
    categoria: "",
    processo: [],
    normaOrigem: [],
    conta: [],
    dataPublicacao: null,
    vigenciaInicial: null,
    dataIdentificacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const transformedData = response.data.map((item) => ({
        id:
          item.idRisk ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idCause ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idCompany ||
          item.idDepartment ||
          item.idCollaborator ||
          item.idKri ||
          item.idControl ||
          item.idActionPlanType ||
          item.idThreat ||
          item.idCycle ||
          item.idStrategicGuideline ||
          item.idDeficiency,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}categories`, setCategorias);
    fetchData(`${process.env.REACT_APP_API_URL}cycles`, setCiclo);

    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsaveis,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}risks/treatments`,
      setTratamentos,
    );
    fetchData(`${process.env.REACT_APP_API_URL}risks/causes`, setCausa);
    fetchData(`${process.env.REACT_APP_API_URL}risks/impacts`, setImpactos);
    fetchData(`${process.env.REACT_APP_API_URL}risks/kris`, setKris);
    fetchData(`${process.env.REACT_APP_API_URL}controls`, setControle);
    fetchData(
      `${process.env.REACT_APP_API_URL}risks/strategic-guidelines`,
      setDiretriz,
    );
    fetchData(`${process.env.REACT_APP_API_URL}incidents`, setIncidente);
    fetchData(`${process.env.REACT_APP_API_URL}processes`, setProcessos);
    fetchData(
      `${process.env.REACT_APP_API_URL}risks?onlyWithAnalisysProfile=true`,
      setRiscos,
    );
    window.scrollTo(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dadosApi && dadosApi.idAssessment) {
      setLoading(true);
      const fetchAssessmentDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}assessments/${dadosApi.idAssessment}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de avaliações");
          }

          const data = await response.json();

          const [resRisco] = await Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}risks/${data.idRisk}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const dataRisk = await resRisco.json();

          const [resCategoria] = await Promise.all([
            fetch(
              `${process.env.REACT_APP_API_URL}categories/${dataRisk.idCategory}`,
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ]);

          const dataCategory = await resCategoria.json();

          const [resPerfil] = await Promise.all([
            fetch(
              `${process.env.REACT_APP_API_URL}analisys-profile/${dataCategory.idAnalysisProfile}`,
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ]);

          const dataProfile = await resPerfil.json();

          const [resQuestionario] = await Promise.all([
            fetch(` ${process.env.REACT_APP_API_URL}quiz/${dadosApi.idQuiz}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const dataQuiz = await resQuestionario.json();
          setSi({
            prob: dataQuiz.idProbabilityInherent,
            impact: dataQuiz.idSeverityInherent,
          });
          setSr({
            prob: dataQuiz.idProbabilityResidual,
            impact: dataQuiz.idSeverityResidual,
          });
          setSp({
            prob: dataQuiz.idProbabilityPlanned,
            impact: dataQuiz.idSeverityPlanned,
          });

          setInherentCoord(dataQuiz.coordinateInerent);
          setResidualCoord(dataQuiz.coordinateResidual);
          setPlannedCoord(dataQuiz.coordinatePlanned);
          setJustificativaFilho(dataQuiz.justification);

          setHeatmapData(dataProfile.heatMap || []);
          setNivelAv(dataProfile.assessmentLevel || []);

          setRequisicao("Editar");

          setDescricaoRisco(data.riskDescription || "");
          setFormData((prev) => ({
            ...prev,
            status: dadosApi.statusQuiz || null,
            categoria: dataRisk.idCategory || null,
            dataIdentificacao: data.identificationDate
              ? new Date(data.identificationDate)
              : null,
            processo: dataQuiz.processes
              ? Array.isArray(data.processes)
                ? data.processes
                : [data.processes]
              : [],
            respondente: dadosApi.respondent,
            ciclo: data.idCycle || null,
            risco: data.idRisk || null,
            controle: data.controls
              ? Array.isArray(data.controls)
                ? data.controls
                : [data.controls]
              : [],
            diretriz: data.strategicGuideline
              ? Array.isArray(data.strategicGuideline)
                ? data.strategicGuideline
                : [data.strategicGuideline]
              : [],
            incidente: data.incidents
              ? Array.isArray(data.incidents)
                ? data.incidents
                : [data.incidents]
              : [],
            tratamento: data.treatments
              ? Array.isArray(data.treatments)
                ? data.treatments
                : [data.treatments]
              : [],
            kri: data.kris
              ? Array.isArray(data.kris)
                ? data.kris
                : [data.kris]
              : [],
            causa: data.causes
              ? Array.isArray(data.causes)
                ? data.causes
                : [data.causes]
              : [],
            impacto: data.impacts
              ? Array.isArray(data.impacts)
                ? data.impacts
                : [data.impacts]
              : [],
            responsavel: data.idResponsible
              ? Array.isArray(data.idResponsible)
                ? data.idResponsible
                : [data.idResponsible]
              : [],
            responsavelAv: data.idAnalisysProfile
              ? Array.isArray(data.idAnalisysProfile)
                ? data.idAnalisysProfile
                : [data.idAnalisysProfile]
              : [],
          }));

          setNormativaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false);
        } finally {
          console.log("Requisição finalizada");
          setLoading(false);
        }
      };

      fetchAssessmentDados();
    }
  }, [dadosApi, token]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "prioridade") {
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAllEmpresas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.controle.length === controles.length) {
        setFormData({ ...formData, controle: [] });
      } else {
        setFormData({
          ...formData,
          controle: controles.map((controle) => controle.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "controle",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllDiretrizes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.diretriz.length === diretrizes.length) {
        setFormData({ ...formData, diretriz: [] });
      } else {
        setFormData({
          ...formData,
          diretriz: diretrizes.map((diretriz) => diretriz.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "diretriz",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllResponsaveis = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.responsavel.length === responsaveis.length) {
        setFormData({ ...formData, responsavel: [] });
      } else {
        setFormData({
          ...formData,
          responsavel: responsaveis.map((responsavel) => responsavel.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "responsavel",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllCausa = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.causa.length === causas.length) {
        setFormData({ ...formData, causa: [] });
      } else {
        setFormData({
          ...formData,
          causa: causas.map((causa) => causa.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "causa",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllKri = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.kri.length === kris.length) {
        setFormData({ ...formData, kri: [] });
      } else {
        setFormData({
          ...formData,
          kri: kris.map((kri) => kri.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "kri",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllImpacto = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.impacto.length === impactos.length) {
        setFormData({ ...formData, impacto: [] });
      } else {
        setFormData({
          ...formData,
          impacto: impactos.map((impacto) => impacto.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "impacto",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllIncidentes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.incidente.length === incidentes.length) {
        setFormData({ ...formData, incidente: [] });
      } else {
        setFormData({
          ...formData,
          incidente: incidentes.map((incidente) => incidente.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "incidente",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllTratamentos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.tratamento.length === tratamentos.length) {
        setFormData({ ...formData, tratamento: [] });
      } else {
        setFormData({
          ...formData,
          tratamento: tratamentos.map((tratamento) => tratamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "tratamento",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) {
        setFormData({ ...formData, processo: [] });
      } else {
        setFormData({
          ...formData,
          processo: processos.map((processo) => processo.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "processo",
        newValue.map((item) => item.id),
      );
    }
  };

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

  const [formValidation] = useState({
    ciclo: true,
    risco: true,
  });

  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;

  const allSelectedEmpresas =
    formData.controle.length === controles.length && controles.length > 0;

  const allSelectedDiretrizes =
    formData.diretriz.length === diretrizes.length && diretrizes.length > 0;

  const allSelectedIncidentes =
    formData.incidente.length === incidentes.length && incidentes.length > 0;

  const allSelectedTratamentos =
    formData.tratamento.length === tratamentos.length && tratamentos.length > 0;

  const allSelectedKris =
    formData.kri.length === kris.length && kris.length > 0;

  const allSelectedCausa =
    formData.causa.length === causas.length && causas.length > 0;

  const allSelectedImpacto =
    formData.impacto.length === impactos.length && impactos.length > 0;

  const allSelectedResponsaveis =
    formData.responsavel.length === responsaveis.length &&
    responsaveis.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const idQuiz = dadosApi?.idQuiz || normativaDados?.idQuiz;

  const tratarSubmit = async () => {
    if (isReadOnly) {
      enqueueSnackbar(
        "Este questionário está em modo consulta e não pode ser alterado.",
        {
          variant: "info",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        },
      );
      return;
    }
    const missingFields = [];
    if (!si.prob || !si.impact) {
      missingFields.push("Probabilidade e Impacto Inerente");
    }
    if (nivelAv >= 2 && (!sr.prob || !sr.impact)) {
      missingFields.push("Probabilidade e Impacto Residual");
    }

    if (nivelAv >= 3 && (!sp.prob || !sp.impact)) {
      missingFields.push("Probabilidade e Impacto Planejado");
    }

    if (!justificativaFilho) {
      missingFields.push("Justificativa");
    }

    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Preencha os campos obrigatórios: ${missingFields.join(", ")}`,
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        },
      );
      return;
    }
    const payloadAnswer = {
      idQuiz,
      idProbabilityInherent: si.prob,
      idSeverityInherent: si.impact,
      idProbabilityResidual: sr.prob,
      idSeverityResidual: sr.impact,
      idProbabilityPlanned: sp.prob,
      idSeverityPlanned: sp.impact,
      coordinateInerent: inherentCoord,
      coordinateResidual: residualCoord,
      coordinatePlanned: plannedCoord,
      justification: justificativaFilho,
    };

    const payloadUpdate = {
      ...payloadAnswer,
      active: true,
    };

    try {
      setLoading(true);

      await axios.put(
        `${process.env.REACT_APP_API_URL}quiz/answer`,
        payloadAnswer,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      enqueueSnackbar("Questionário respondido com sucesso!", {
        variant: "success",
      });

      await axios.put(`${process.env.REACT_APP_API_URL}quiz`, payloadUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar("Questionário ativado com sucesso!", {
        variant: "success",
      });

      navigate(-1);
    } catch (error) {
      console.error(error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Respondente *</InputLabel>
              <TextField disabled fullWidth value={formData.respondente} />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Ciclo *</InputLabel>
              <Autocomplete
                disabled
                options={ciclos}
                getOptionLabel={(option) => option.nome}
                value={
                  ciclos.find((ciclo) => ciclo.id === formData.ciclo) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    ciclo: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.ciclo && formValidation.ciclo === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Risco *</InputLabel>
              <Autocomplete
                disabled
                options={riscos}
                getOptionLabel={(option) => option.nome}
                value={
                  riscos.find((risco) => risco.id === formData.risco) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    risco: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.risco && formValidation.risco === false}
                  />
                )}
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.status && formValidation.status === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {formData.status === 3 && (
                <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                  <Stack spacing={1}>
                    <InputLabel>Data de conclusão</InputLabel>
                    <TextField
                      disabled
                      fullWidth
                      value={(() => {
                        const raw =
                          normativaDados?.dateOfConclusion ||
                          normativaDados?.conclusionDate ||
                          normativaDados?.conclusion_date ||
                          normativaDados?.completionDate ||
                          normativaDados?.completion_date ||
                          normativaDados?.finishedAt ||
                          normativaDados?.finished_at ||
                          "";
                        if (!raw) return "";

                        const s = String(raw);

                        const mm = s.match(
                          /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
                        );
                        if (mm) return `${mm[3]}-${mm[2]}-${mm[1]}`;

                        const d = new Date(raw);
                        if (Number.isNaN(d.getTime())) return String(raw);

                        const pad = (n) => String(n).padStart(2, "0");
                        return `${pad(d.getDate())}-${pad(
                          d.getMonth() + 1,
                        )}-${d.getFullYear()}`;
                      })()}
                    />
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12} sx={{ paddingBottom: 3 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Dados do risco
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1} marginTop={2}>
                      <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Descrição do risco</InputLabel>
                          <TextField
                            disabled
                            onChange={(event) =>
                              setDescricaoRisco(event.target.value)
                            }
                            fullWidth
                            multiline
                            rows={4}
                            value={descricaoDoRisco}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Categoria do risco</InputLabel>
                          <Autocomplete
                            disabled
                            options={categorias}
                            getOptionLabel={(option) => option.nome}
                            value={
                              categorias.find(
                                (categoria) =>
                                  categoria.id === formData.categoria,
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                categoria: newValue ? newValue.id : "",
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  !formData.categoria &&
                                  formValidation.categoria === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel>Data da identificação</InputLabel>
                          <DatePicker
                            disabled
                            value={formData.dataIdentificacao || null}
                            onChange={(newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                dataIdentificacao: newValue,
                              }));
                            }}
                            slotProps={{
                              textField: {
                                placeholder: "00/00/0000",
                              },
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Processos associados</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...processos,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.processo.map(
                              (id) =>
                                processos.find(
                                  (processo) => processo.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAll2}
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
                                          ? allSelected2
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
                                  (formData.processo.length === 0 ||
                                    formData.processo.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.processo === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Controles associados</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...controles,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.controle.map(
                              (id) =>
                                controles.find(
                                  (controle) => controle.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAllEmpresas}
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
                                          ? allSelectedEmpresas
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
                                  (formData.controle.length === 0 ||
                                    formData.controle.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.controle === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Diretriz estratégica</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todas" },
                              ...diretrizes,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.diretriz.map(
                              (id) =>
                                diretrizes.find(
                                  (diretriz) => diretriz.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAllDiretrizes}
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
                                          ? allSelectedDiretrizes
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
                                  (formData.diretriz.length === 0 ||
                                    formData.diretriz.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.diretriz === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Incidentes</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...incidentes,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.incidente.map(
                              (id) =>
                                incidentes.find(
                                  (incidente) => incidente.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAllIncidentes}
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
                                          ? allSelectedIncidentes
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
                                  (formData.incidente.length === 0 ||
                                    formData.incidente.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.incidente === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Tratamento</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...tratamentos,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.tratamento.map(
                              (id) =>
                                tratamentos.find(
                                  (tratamento) => tratamento.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAllTratamentos}
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
                                          ? allSelectedTratamentos
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
                                  (formData.tratamento.length === 0 ||
                                    formData.tratamento.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.tratamento === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>KRI</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...kris,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.kri.map(
                              (id) => kris.find((kri) => kri.id === id) || id,
                            )}
                            onChange={handleSelectAllKri}
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
                                          ? allSelectedKris
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
                                  (formData.kri.length === 0 ||
                                    formData.kri.every((val) => val === 0)) &&
                                  formValidation.kri === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Causas</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todas" },
                              ...causas,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.causa.map(
                              (id) =>
                                causas.find((causa) => causa.id === id) || id,
                            )}
                            onChange={handleSelectAllCausa}
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
                                          ? allSelectedCausa
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
                                  (formData.causa.length === 0 ||
                                    formData.causa.every((val) => val === 0)) &&
                                  formValidation.causa === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Impactos</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...impactos,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.impacto.map(
                              (id) =>
                                impactos.find((impacto) => impacto.id === id) ||
                                id,
                            )}
                            onChange={handleSelectAllImpacto}
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
                                          ? allSelectedImpacto
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
                                  (formData.impacto.length === 0 ||
                                    formData.impacto.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.impacto === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} mb={5}>
                        <Stack spacing={1}>
                          <InputLabel>Responsável pelo risco</InputLabel>
                          <Autocomplete
                            multiple
                            disabled
                            disableCloseOnSelect
                            options={[
                              { id: "all", nome: "Selecionar todos" },
                              ...responsaveis,
                            ]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.responsavel.map(
                              (id) =>
                                responsaveis.find(
                                  (responsavel) => responsavel.id === id,
                                ) || id,
                            )}
                            onChange={handleSelectAllResponsaveis}
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
                                          ? allSelectedResponsaveis
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
                                  (formData.responsavel.length === 0 ||
                                    formData.responsavel.every(
                                      (val) => val === 0,
                                    )) &&
                                  formValidation.responsavel === false
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <HeatmapAvaliacaoRiscoQuestionario
                  data={heatmapDataAv}
                  disabledFields={formData.status === 3 || isReadOnly}
                  si={si}
                  sr={sr}
                  sp={sp}
                  setSi={setSi}
                  setSr={setSr}
                  setSp={setSp}
                  nivel={nivelAv}
                  onCoordChange={(type, coord) => {
                    if (type === "inherent") setInherentCoord(coord);
                    if (type === "residual") setResidualCoord(coord);
                    if (type === "planned") setPlannedCoord(coord);
                  }}
                  justificativa={justificativaFilho}
                  onJustificativaChange={handleJustificativaChange}
                />
              </Grid>
            </>
          )}

          {}
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
              {formData.status === 3 || isReadOnly ? (
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
                  onClick={voltarParaListagem}
                >
                  Sair
                </Button>
              ) : (
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
              )}
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
            {}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Plano criado com sucesso!
            </DialogTitle>

            {}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O plano de ação foi cadastrado com sucesso. Você pode voltar
                para a listagem ou adicionar mais informações a esse plano.
              </DialogContentText>
            </DialogContent>

            {}
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
