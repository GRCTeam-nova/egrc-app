/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from "config";
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
  Typography,
  Switch,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { DatePicker } from "@mui/x-date-pickers";
import HeatmapAvaliacaoRisco from "../configuracoes/avaliacaoRiscoGrafico";
import HeatmapAvaliacaoRiscoFixo from "../configuracoes/avaliacaoRiscoGraficoFixo";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListagemAcionistas from "../configuracoes/listaQuestionarios";
import emitter from "../configuracoes/eventEmitter";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const idUser = localStorage.getItem("id_user");
  const [questionariosApi, setQuestionariosApi] = useState([]); // <- NOVO
  const [filledQuestionarios, setFilledQuestionarios] = useState([]);
  const [loadingText, setLoadingText] = useState("");

  const [tipoConsolidacao, setTipoConsolidacao] = useState(1);

  const [sobrepor, setSobrepor] = useState(false);
  const [controles, setControle] = useState([]);
  const [diretrizes, setDiretriz] = useState([]);
  const [incidentes, setIncidente] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [responsaveisAv, setResponsaveisAv] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [respondentes, setRespondentes] = useState([]);
  const [causas, setCausa] = useState([]);
  const [kris, setKris] = useState([]);
  const [impactos, setImpactos] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [heatmapDataAv, setHeatmapData] = useState([]);
  const [nivelAv, setNivelAv] = useState([]);
  const [descricaoDoRisco, setDescricaoRisco] = useState("");
  const [comentario, setComentario] = useState("");
  const [ciclos, setCiclo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [normativaDados, setNormativaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [statuss] = useState([
    { id: 1, nome: "Não iniciada" },
    { id: 2, nome: "Iniciada" },
    { id: 3, nome: "Em avaliação" },
    { id: 4, nome: "Completa" },
    { id: 5, nome: "Finalizada" },
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
    responsavel: [],
    responsavelAv: idUser,
    respondente: [],
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
    justificationInerent: "",
    justificationResidual: "",
    justificationPlanned: "",
    idProbabilityInherent: null,
    idSeverityInherent: null,
    idProbabilityResidual: null,
    idSeverityResidual: null,
    idProbabilityPlanned: null,
    idSeverityPlanned: null,
    status: 1, // Default status
  });

  const [formValidation, setFormValidation] = useState({
    ciclo: true,
    risco: true,
    respondente: true,
    responsavelAv: true,
  });

  const formatDateConclusion = (raw) => {
    if (!raw) return "";

    // Normaliza frações de segundo longas: .0047459 -> .004
    const normalized = String(raw).replace(/\.(\d{3})\d+/, ".$1");

    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return String(raw);

    const pad2 = (n) => String(n).padStart(2, "0");

    const DD = pad2(d.getDate());
    const MM = pad2(d.getMonth() + 1);
    const YYYY = d.getFullYear();
    const HH = pad2(d.getHours());
    const MIN = pad2(d.getMinutes());

    return `${DD}-${MM}-${YYYY} ${HH}-${MIN}`;
  };

  // --- REGRAS DE PERMISSIONAMENTO (Baseado no PDF 1.1) ---
  const isEditing = requisicao === "Editar";
  const statusAtual = formData.status;
  const isResponsibleAv = String(idUser) === String(formData.responsavelAv);

  // 1. Ciclo e Risco: Editáveis apenas na criação. Na alteração (mesmo status 1) são estáticos.
  const isRiskCycleEditable = !isEditing;

  // 2. Respondentes e Responsável: Editáveis na criação e na alteração se status for "Não iniciada" (1) ou "Iniciada" (2).
  const isPeopleEditable =
    !statusAtual || statusAtual === 1 || statusAtual === 2;

  // 3. Avaliação (Heatmap, Justificativa, Switch): Apenas Responsável nos status "Em avaliação" (3) e "Completa" (4).
  const isEvaluationEditable =
    isResponsibleAv && (statusAtual === 3 || statusAtual === 4);

  const isEmAvaliacao = statusAtual === 3;
  const isComplete = statusAtual === 4;
  const isFinalizada = statusAtual === 5;
  localStorage.setItem("AvConcluida", isComplete || isFinalizada);

  const initialOverlay = useMemo(
    () => ({
      inherent: {
        probId: formData.idProbabilityInherent,
        impactId: formData.idSeverityInherent,
      },
      residual: {
        probId: formData.idProbabilityResidual,
        impactId: formData.idSeverityResidual,
      },
      planned: {
        probId: formData.idProbabilityPlanned,
        impactId: formData.idSeverityPlanned,
      },
      justification: comentario,
    }),
    [
      formData.idProbabilityInherent,
      formData.idSeverityInherent,
      formData.idProbabilityResidual,
      formData.idSeverityResidual,
      formData.idProbabilityPlanned,
      formData.idSeverityPlanned,
      comentario,
    ],
  );

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idRisk, idLedgerAccount e idProcess -> id, e name -> nome
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
        ...item, // Mantém os outros campos intactos
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
      setRespondentes,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsaveis,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsaveisAv,
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
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi && dadosApi.idAssessment) {
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

          const [resUsers] = await Promise.all([
            fetch(
              `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ]);

          const data = await response.json();
          const users = await resUsers.json();

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

          const [resQuiz] = await Promise.all([
            fetch(
              `${process.env.REACT_APP_API_URL}quiz/assessments/${dadosApi.idAssessment}`,
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ]);

          const dataQuiz = await resQuiz.json();

          const [resCycle] = await Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}cycles/${data.idCycle}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const dataCycle = await resCycle.json();
          setTipoConsolidacao(dataCycle.typeConsolidation);

          handleFilledQuestionarios(dataQuiz);

          setHeatmapData(dataProfile.heatMap || []);
          setNivelAv(dataProfile.assessmentLevel || []);

          const respondentNames = data.respondents
            ? data.respondents
                .replace(/['"]/g, "")
                .split(",")
                .map((n) => n.trim())
            : [];

          const respondenteIds = respondentNames
            .map((name) => {
              const userObj = users.find((u) => u.name === name);
              return userObj?.idCollaborator ?? null;
            })
            .filter((id) => id);

          setRequisicao("Editar");
          setMensagemFeedback("editada");

          // Se necessário, atualize outros estados individuais
          setDescricaoRisco(data.riskDescription || "");
          setComentario(data.justification || "");
          const normalizeReplaceUserFlag = (v) => {
            if (v == null) return false; // null/undefined
            const s = String(v).trim().toLowerCase();
            if (!s) return false; // ""
            if (["false", "null", "undefined", "0"].includes(s)) return false;
            return true; // qualquer nome real → true
          };

          setSobrepor(normalizeReplaceUserFlag(data.replaceUser));

          // Atualiza o formData garantindo que os campos que devem ser arrays, sejam arrays
          setFormData((prev) => ({
            ...prev,
            status: data.assessmentStatus || null,
            // Para campos que devem ser arrays, utiliza um fallback para []
            categoria: dataRisk.idCategory || null,
            dataIdentificacao: data.identificationDate
              ? new Date(data.identificationDate)
              : null,
            processo: data.processes
              ? data.processes
                  .replace(/["']/g, "")
                  .split(",")
                  .map((name) => {
                    const item = processos.find((p) => p.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            respondente: respondenteIds,
            ciclo: data.idCycle || null,
            risco: data.idRisk || null,
            controle: data.controls
              ? data.controls
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = controles.find((c) => c.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            diretriz: data.strategicGuideline
              ? data.strategicGuideline
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = diretrizes.find((d) => d.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            incidente: data.incidents
              ? data.incidents
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = incidentes.find((i) => i.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            tratamento: data.treatments
              ? data.treatments
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = tratamentos.find(
                      (t) => t.nome === name.trim(),
                    );
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            kri: data.kris
              ? data.kris
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = kris.find((k) => k.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            causa: data.causes
              ? data.causes
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = causas.find((c) => c.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            impacto: data.impacts
              ? data.impacts
                  .replace(/[""]/g, "")
                  .split(",")
                  .map((name) => {
                    const item = impactos.find((i) => i.nome === name.trim());
                    return item || { id: name.trim(), nome: name.trim() };
                  })
              : [],
            responsavel: data.idResponsible
              ? Array.isArray(data.idResponsible)
                ? data.idResponsible
                : [data.idResponsible]
              : [],
            responsavelAv: data.idResponsible || null,
            justificationInerent: data.justificationInerent || "",
            justificationResidual: data.justificationResidual || "",
            justificationPlanned: data.justificationPlanned || "",
            // se existir campo de replace, usamos ele; senão, caímos no original
            idProbabilityInherent:
              data.replaceProbabilityInherent ??
              data.idProbabilityInherent ??
              null,
            idSeverityInherent:
              data.replaceSeverityInherent ?? data.idSeverityInherent ?? null,
            idProbabilityResidual:
              data.replaceProbabilityResidual ??
              data.idProbabilityResidual ??
              null,
            idSeverityResidual:
              data.replaceSeverityResidual ?? data.idSeverityResidual ?? null,
            idProbabilityPlanned:
              data.replaceProbabilityPlanned ??
              data.idProbabilityPlanned ??
              null,
            idSeverityPlanned:
              data.replaceSeverityPlanned ?? data.idSeverityPlanned ?? null,
          }));

          setNormativaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      fetchAssessmentDados();
    }
  }, [dadosApi, token]);

  const handleOverlayChange = useCallback((newOverlay) => {
    setFormData((prev) => {
      // se não mudou nada, retorna o próprio objeto (sem disparar re-render)
      if (
        prev.idProbabilityInherent === newOverlay.inherent.probId &&
        prev.idSeverityInherent === newOverlay.inherent.impactId &&
        prev.idProbabilityResidual === newOverlay.residual.probId &&
        prev.idSeverityResidual === newOverlay.residual.impactId &&
        prev.idProbabilityPlanned === newOverlay.planned.probId &&
        prev.idSeverityPlanned === newOverlay.planned.impactId &&
        prev.justificationInerent === newOverlay.inherent.coordinate &&
        prev.justificationResidual === newOverlay.residual.coordinate &&
        prev.justificationPlanned === newOverlay.planned.coordinate
      ) {
        return prev;
      }
      // só atualiza quando algo de fato for diferente
      return {
        ...prev,
        idProbabilityInherent: newOverlay.inherent.probId,
        idSeverityInherent: newOverlay.inherent.impactId,
        idProbabilityResidual: newOverlay.residual.probId,
        idSeverityResidual: newOverlay.residual.impactId,
        idProbabilityPlanned: newOverlay.planned.probId,
        idSeverityPlanned: newOverlay.planned.impactId,
        justificationInerent: newOverlay.inherent.coordinate,
        justificationResidual: newOverlay.residual.coordinate,
        justificationPlanned: newOverlay.planned.coordinate,
      };
    });
    setComentario(newOverlay.justification);
  }, []);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "prioridade") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleFilledQuestionarios = (items) => {
    setFilledQuestionarios(items);
    console.log("Questionários filtrados:", items);
  };

  useEffect(() => {
    if (normativaDados?.idAssessment) {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}quiz/assessments/${normativaDados.idAssessment}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then((res) => {
          setQuestionariosApi(res.data); // <- NOVO (lista completa)
          setFilledQuestionarios(res.data); // mantém compatibilidade (heatmap etc.)
        })

        .catch((err) => console.error("Erro ao refazer quiz:", err));
    }
  }, [sobrepor, normativaDados?.idAssessment]);

  const avgCoords = useMemo(() => {
    if (filledQuestionarios.length === 0)
      return { inherent: "", residual: "", planned: "" };
    const coordsArray = (key) =>
      filledQuestionarios
        .map((item) => item[key])
        .filter(Boolean)
        .map((str) => str.split(":").map((n) => parseInt(n, 10)))
        .filter(([r, c]) => !isNaN(r) && !isNaN(c));

    const computeAverage = (key) => {
      const coords = coordsArray(key);
      const sum = coords.reduce(
        (acc, [r, c]) => ({ r: acc.r + r, c: acc.c + c }),
        { r: 0, c: 0 },
      );
      const len = coords.length;
      return len ? `${Math.round(sum.r / len)}:${Math.round(sum.c / len)}` : "";
    };

    const computeMax = (key) => {
      const coords = coordsArray(key);
      if (!coords.length) return "";
      const max = coords.reduce(
        ([r0, c0], [r, c]) => [r > r0 ? r : r0, c > c0 ? c : c0],
        coords[0],
      );
      return `${max[0]}:${max[1]}`;
    };

    return {
      inherent:
        tipoConsolidacao === 1
          ? computeAverage("justificationInerent")
          : computeMax("justificationInerent"),
      residual:
        tipoConsolidacao === 1
          ? computeAverage("justificationResidual")
          : computeMax("justificationResidual"),
      planned:
        tipoConsolidacao === 1
          ? computeAverage("justificationPlanned")
          : computeMax("justificationPlanned"),
    };
  }, [filledQuestionarios, tipoConsolidacao]);

  const handleSelectAllEmpresas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.controle.length === controles.length) {
        // Deselect all
        setFormData({ ...formData, controle: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, diretriz: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, responsavel: [] });
      } else {
        // Select all
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

  const handleSelectAllRespondentes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.respondente.length === respondentes.length) {
        // Deselect all
        setFormData({ ...formData, respondente: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          respondente: respondentes.map((respondente) => respondente.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "respondente",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAllCausa = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.causa.length === causas.length) {
        // Deselect all
        setFormData({ ...formData, causa: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, kri: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, impacto: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, incidente: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, tratamento: [] });
      } else {
        // Select all
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
        // Deselect all
        setFormData({ ...formData, processo: [] });
      } else {
        // Select all
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

  

  // Ao salvar com "Sobrepor resultado do risco" ligado, a atualização FINALIZA a avaliação.
  const handleAtualizarClick = () => {
    if (sobrepor) {
      setConfirmSobreporOpen(true);
      return;
    }
    tratarSubmit();
  };

  const handleConfirmSobrepor = () => {
    setConfirmSobreporOpen(false);
    tratarSubmit();
  };
useEffect(() => {
    if (localStorage.getItem("avaliacaoIniciada") === "1") {
      enqueueSnackbar("Avaliação iniciada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      localStorage.removeItem("avaliacaoIniciada");
    }
  }, []);

  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;

  const allSelectedRespondentes =
    formData.respondente.length === respondentes.length &&
    respondentes.length > 0;

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

  
  const [confirmSobreporOpen, setConfirmSobreporOpen] = useState(false);
const { buttonTitle } = useMemo(() => {
    const currentStatus = formData.status;
    const isResp = String(idUser) === String(formData.responsavelAv);
    let title = "";

    if (currentStatus === 1 && isResp) title = "INICIAR AVALIAÇÃO";
    else if ((currentStatus === 3 || currentStatus === 4) && isResp)
      title = "FINALIZAR";

    return { buttonTitle: title, isTester: isResp };
  }, [idUser, formData.status, formData.responsavelAv]);

  const hasQuestionarioConcluido = (questionariosApi ?? []).some((q) => {
    const status = Number(q?.statusQuiz ?? q?.status);
    const active = q?.active !== false;
    return active && status >= 3; // pega statusQuiz 3 (e 4/5 se existirem)
  });

  console.log("DEBUG FINALIZAR", {
    totalApi: questionariosApi?.map((q) => ({
      id: q.idQuiz,
      statusQuiz: q.statusQuiz,
      active: q.active,
    })),
    filled: filledQuestionarios?.map((q) => ({
      id: q.idQuiz,
      statusQuiz: q.statusQuiz,
    })),
    hasQuestionarioConcluido,
  });

  const overlayRequiredFilled =
    !!comentario?.trim() &&
    !!formData.idProbabilityInherent &&
    !!formData.idSeverityInherent &&
    !!formData.idProbabilityResidual &&
    !!formData.idSeverityResidual &&
    !!formData.idProbabilityPlanned &&
    !!formData.idSeverityPlanned &&
    !!formData.justificationInerent &&
    !!formData.justificationResidual &&
    !!formData.justificationPlanned;

  const canFinalizar =
    isResponsibleAv &&
    (statusAtual === 2 || statusAtual === 3 || statusAtual === 4) &&
    hasQuestionarioConcluido && sobrepor === false;

  const handleStart = async () => {
    let url = "";
    let method = "";
    let payload = {};

    try {
      setLoadingText("Gerando os questionários...");
      setLoading(true);

      if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}assessments`;
        method = "PUT";

        const findProb = (name) =>
          heatmapDataAv?.heatMapProbabilities?.find((p) => p.name === name);
        const findImp = (name) =>
          heatmapDataAv?.heatMapImpacts?.find((i) => i.name === name);

        const inhProb = findProb(formData.idProbabilityInherent);
        const inhImp = findImp(formData.idSeverityInherent);
        const resProb = findProb(formData.idProbabilityResidual);
        const resImp = findImp(formData.idSeverityResidual);
        const plnProb = findProb(formData.idProbabilityPlanned);
        const plnImp = findImp(formData.idSeverityPlanned);

        payload = {
          idAssessment: normativaDados?.idAssessment,
          assessmentStatus: 2 || null,

          replaceUser: sobrepor
            ? responsaveisAv.find((r) => r.id === formData.responsavelAv)
                ?.nome || null
            : null,

          justification: comentario,

          idProbabilityInherent:
            inhProb?.idHeatMapProbability || formData.idProbabilityInherent,
          idSeverityInherent:
            inhImp?.idHeatMapImpact || formData.idSeverityInherent,
          idProbabilityResidual:
            resProb?.idHeatMapProbability || formData.idProbabilityResidual,
          idSeverityResidual:
            resImp?.idHeatMapImpact || formData.idSeverityResidual,
          idProbabilityPlanned:
            plnProb?.idHeatMapProbability || formData.idProbabilityPlanned,
          idSeverityPlanned:
            plnImp?.idHeatMapImpact || formData.idSeverityPlanned,

          replaceProbabilityPlanned: formData.idProbabilityPlanned,
          replaceProbabilityResidual: formData.idProbabilityResidual,
          replaceSeverityResidual: formData.idSeverityResidual,
          replaceSeverityPlanned: formData.idSeverityPlanned,
          replaceProbabilityInherent: formData.idProbabilityInherent,
          replaceSeverityInherent: formData.idSeverityInherent,

          justificationInerent: formData.justificationInerent,
          justificationResidual: formData.justificationResidual,
          justificationPlanned: formData.justificationPlanned,
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

      // ✅ Aqui está a regra: se der 500 mas mesmo assim executou no backend, tratamos como sucesso
      const ignore500 = response.status === 500;
      if (!response.ok && !ignore500) {
        throw new Error("Não foi possível iniciar.");
      }

      // Sucesso (response.ok ou 500 ignorado)
      setFormData((prev) => ({ ...prev, status: 3 }));
      setNormativaDados((prev) => ({ ...prev, assessmentStatus: 3 }));

      // deixa o feedback de sucesso pós-refresh (você já tem o effect que lê isso)
      localStorage.setItem("avaliacaoIniciada", "1");

      // avisa componentes/listagens
      emitter.emit("refreshQuestionarios");

      // dá um tempinho pro usuário ver a mensagem antes do refresh
      await new Promise((r) => setTimeout(r, 800));

      // ✅ refresh real da tela
      navigate(0);
    } catch (error) {
      console.error(error);

      // mantém erro só quando NÃO for o 400 (pois acima já tratamos)
      enqueueSnackbar("Não foi possível iniciar.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleTesteRealizado = async () => {
    let url = "";
    let method = "";
    let payload = {};

    try {
      setLoading(true);

      if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}assessments`;
        method = "PUT";

        // Lógica de mapeamento
        const findProb = (name) =>
          heatmapDataAv?.heatMapProbabilities?.find((p) => p.name === name);
        const findImp = (name) =>
          heatmapDataAv?.heatMapImpacts?.find((i) => i.name === name);

        const inhProb = findProb(formData.idProbabilityInherent);
        const inhImp = findImp(formData.idSeverityInherent);
        const resProb = findProb(formData.idProbabilityResidual);
        const resImp = findImp(formData.idSeverityResidual);
        const plnProb = findProb(formData.idProbabilityPlanned);
        const plnImp = findImp(formData.idSeverityPlanned);

        payload = {
          idAssessment: normativaDados?.idAssessment,
          assessmentStatus: 5 || null, // Status "Finalizada"

          replaceUser: sobrepor
            ? responsaveisAv.find((r) => r.id === formData.responsavelAv)
                ?.nome || null
            : null,

          // Campos adicionados
          justification: comentario,

          idProbabilityInherent:
            inhProb?.idHeatMapProbability || formData.idProbabilityInherent,
          idSeverityInherent:
            inhImp?.idHeatMapImpact || formData.idSeverityInherent,
          idProbabilityResidual:
            resProb?.idHeatMapProbability || formData.idProbabilityResidual,
          idSeverityResidual:
            resImp?.idHeatMapImpact || formData.idSeverityResidual,
          idProbabilityPlanned:
            plnProb?.idHeatMapProbability || formData.idProbabilityPlanned,
          idSeverityPlanned:
            plnImp?.idHeatMapImpact || formData.idSeverityPlanned,

          replaceProbabilityPlanned: formData.idProbabilityPlanned,
          replaceProbabilityResidual: formData.idProbabilityResidual,
          replaceSeverityResidual: formData.idSeverityResidual,
          replaceSeverityPlanned: formData.idSeverityPlanned,
          replaceProbabilityInherent: formData.idProbabilityInherent,
          replaceSeverityInherent: formData.idSeverityInherent,

          justificationInerent: formData.justificationInerent,
          justificationResidual: formData.justificationResidual,
          justificationPlanned: formData.justificationPlanned,
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

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setNormativaDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        setFormData((prev) => ({ ...prev, status: 5 }));
        setNormativaDados((prev) => ({ ...prev, assessmentStatus: 5 }));
        enqueueSnackbar("Avaliação finalizada com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível finalizar.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirTeste = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.revisor) {
      // Nota: formData.revisor não parece estar definido no state inicial do seu código original,
      // mas mantive a lógica de validação que você já tinha.
      // Caso necessário, verifique se 'revisor' existe no formData.
      setFormValidation((prev) => ({ ...prev, revisor: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}assessments`;
        method = "PUT";

        // Lógica de mapeamento
        const findProb = (name) =>
          heatmapDataAv?.heatMapProbabilities?.find((p) => p.name === name);
        const findImp = (name) =>
          heatmapDataAv?.heatMapImpacts?.find((i) => i.name === name);

        const inhProb = findProb(formData.idProbabilityInherent);
        const inhImp = findImp(formData.idSeverityInherent);
        const resProb = findProb(formData.idProbabilityResidual);
        const resImp = findImp(formData.idSeverityResidual);
        const plnProb = findProb(formData.idProbabilityPlanned);
        const plnImp = findImp(formData.idSeverityPlanned);

        payload = {
          idAssessment: normativaDados?.idAssessment,
          assessmentStatus: 4 || null,

          replaceUser: sobrepor
            ? responsaveisAv.find((r) => r.id === formData.responsavelAv)
                ?.nome || null
            : null,

          // Campos adicionados
          justification: comentario,

          idProbabilityInherent:
            inhProb?.idHeatMapProbability || formData.idProbabilityInherent,
          idSeverityInherent:
            inhImp?.idHeatMapImpact || formData.idSeverityInherent,
          idProbabilityResidual:
            resProb?.idHeatMapProbability || formData.idProbabilityResidual,
          idSeverityResidual:
            resImp?.idHeatMapImpact || formData.idSeverityResidual,
          idProbabilityPlanned:
            plnProb?.idHeatMapProbability || formData.idProbabilityPlanned,
          idSeverityPlanned:
            plnImp?.idHeatMapImpact || formData.idSeverityPlanned,

          replaceProbabilityPlanned: formData.idProbabilityPlanned,
          replaceProbabilityResidual: formData.idProbabilityResidual,
          replaceSeverityResidual: formData.idSeverityResidual,
          replaceSeverityPlanned: formData.idSeverityPlanned,
          replaceProbabilityInherent: formData.idProbabilityInherent,
          replaceSeverityInherent: formData.idSeverityInherent,

          justificationInerent: formData.justificationInerent,
          justificationResidual: formData.justificationResidual,
          justificationPlanned: formData.justificationPlanned,
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

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setNormativaDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        setFormData((prev) => ({ ...prev, status: 4 }));
        setNormativaDados((prev) => ({ ...prev, assessmentStatus: 4 }));
        enqueueSnackbar("Teste concluído com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetornar = async () => {
    try {
      setLoading(true);
      const url = `${process.env.REACT_APP_API_URL}assessments`;

      // Lógica de mapeamento
      const findProb = (name) =>
        heatmapDataAv?.heatMapProbabilities?.find((p) => p.name === name);
      const findImp = (name) =>
        heatmapDataAv?.heatMapImpacts?.find((i) => i.name === name);

      const inhProb = findProb(formData.idProbabilityInherent);
      const inhImp = findImp(formData.idSeverityInherent);
      const resProb = findProb(formData.idProbabilityResidual);
      const resImp = findImp(formData.idSeverityResidual);
      const plnProb = findProb(formData.idProbabilityPlanned);
      const plnImp = findImp(formData.idSeverityPlanned);

      // Payload preenchido
      const payload = {
        idAssessment: normativaDados?.idAssessment,
        // Ao retornar, o status volta para Iniciado/Em andamento?
        // No seu código original você seta localmente o status para 2.
        // Se a API aceitar, enviamos o status desejado.
        assessmentStatus: 2,

        replaceUser: sobrepor
          ? responsaveisAv.find((r) => r.id === formData.responsavelAv)?.nome ||
            null
          : null,

        justification: comentario,

        idProbabilityInherent:
          inhProb?.idHeatMapProbability || formData.idProbabilityInherent,
        idSeverityInherent:
          inhImp?.idHeatMapImpact || formData.idSeverityInherent,
        idProbabilityResidual:
          resProb?.idHeatMapProbability || formData.idProbabilityResidual,
        idSeverityResidual:
          resImp?.idHeatMapImpact || formData.idSeverityResidual,
        idProbabilityPlanned:
          plnProb?.idHeatMapProbability || formData.idProbabilityPlanned,
        idSeverityPlanned:
          plnImp?.idHeatMapImpact || formData.idSeverityPlanned,

        replaceProbabilityPlanned: formData.idProbabilityPlanned,
        replaceProbabilityResidual: formData.idProbabilityResidual,
        replaceSeverityResidual: formData.idSeverityResidual,
        replaceSeverityPlanned: formData.idSeverityPlanned,
        replaceProbabilityInherent: formData.idProbabilityInherent,
        replaceSeverityInherent: formData.idSeverityInherent,

        justificationInerent: formData.justificationInerent,
        justificationResidual: formData.justificationResidual,
        justificationPlanned: formData.justificationPlanned,
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro ao retornar fase");

      setFormData((prev) => ({ ...prev, status: 2 }));
      setNormativaDados((prev) => ({ ...prev, assessmentStatus: 2 }));
      enqueueSnackbar("Fase retornada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível retornar a fase.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!formData.ciclo) {
      setFormValidation((prev) => ({ ...prev, ciclo: false }));
      missingFields.push("Ciclo");
    }
    if (!formData.risco) {
      setFormValidation((prev) => ({ ...prev, risco: false }));
      missingFields.push("Risco");
    }
    if (!formData.respondente || formData.respondente.length === 0) {
      setFormValidation((prev) => ({ ...prev, respondente: false }));
      missingFields.push("Respondente");
    }
    // Adicionada validação de responsável
    if (!formData.responsavelAv) {
      setFormValidation((prev) => ({ ...prev, responsavelAv: false }));
      missingFields.push("Responsável");
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}assessments`;
      method = "POST";
      payload = {
        idRisk: formData.risco,
        idCycle: formData.ciclo,
        idRespondents: formData.respondente,
        idResponsible: formData.responsavelAv,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}assessments`;
      method = "PUT";
      // mapeia nome → objeto dentro do heatmapDataAv
      const findProb = (name) =>
        heatmapDataAv.heatMapProbabilities.find((p) => p.name === name);
      const findImp = (name) =>
        heatmapDataAv.heatMapImpacts.find((i) => i.name === name);

      // extrai itens
      const inhProb = findProb(formData.idProbabilityInherent);
      const inhImp = findImp(formData.idSeverityInherent);
      const resProb = findProb(formData.idProbabilityResidual);
      const resImp = findImp(formData.idSeverityResidual);
      const plnProb = findProb(formData.idProbabilityPlanned);
      const plnImp = findImp(formData.idSeverityPlanned);

      payload = {
        idAssessment: normativaDados?.idAssessment,
        idRisk: formData.risco,
        idCycle: formData.ciclo,
        idRespondents: formData.respondente,
        idResponsible: formData.responsavelAv,
        assessmentStatus: sobrepor ? 5 : (formData.status),

        replaceUser: sobrepor
          ? responsaveisAv.find((r) => r.id === formData.responsavelAv)?.nome ||
            null
          : null,
        justification: comentario,
        idProbabilityInherent:
          inhProb?.idHeatMapProbability || formData.idProbabilityInherent,
        idSeverityInherent:
          inhImp?.idHeatMapImpact || formData.idSeverityInherent,
        idProbabilityResidual:
          resProb?.idHeatMapProbability || formData.idProbabilityResidual,
        idSeverityResidual:
          resImp?.idHeatMapImpact || formData.idSeverityResidual,
        idProbabilityPlanned:
          plnProb?.idHeatMapProbability || formData.idProbabilityPlanned,
        idSeverityPlanned:
          plnImp?.idHeatMapImpact || formData.idSeverityPlanned,

        replaceProbabilityPlanned: formData.idProbabilityPlanned,
        replaceProbabilityResidual: formData.idProbabilityResidual,
        replaceSeverityResidual: formData.idSeverityResidual,
        replaceSeverityPlanned: formData.idSeverityPlanned,
        replaceProbabilityInherent: formData.idProbabilityInherent,
        replaceSeverityInherent: formData.idSeverityInherent,

        justificationInerent: formData.justificationInerent,
        justificationResidual: formData.justificationResidual,
        justificationPlanned: formData.justificationPlanned,
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
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
        throw new Error("O Código informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Avaliação ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idAssessment) {
        setNormativaDados(data.data);
        navigate(location.pathname, {
          replace: true,
          state: { dadosApi: data.data },
        });
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar(
        "Já existe uma avaliação criada para esse risco e ciclo.",
        {
          variant: "error",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />

      {loading && !!loadingText && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: (theme) => theme.zIndex.modal + 2,
            pointerEvents: "none",
          }}
        >
          <Typography variant="h6">{loadingText}</Typography>
        </Box>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Ciclo *</InputLabel>
              <Autocomplete
                disabled={isEditing}
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
                disabled={isEditing}
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

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Respondentes *</InputLabel>
              <Autocomplete
                multiple
                disabled={!isPeopleEditable}
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...respondentes,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.respondente.map(
                  (id) =>
                    respondentes.find((respondente) => respondente.id === id) ||
                    id,
                )}
                onChange={handleSelectAllRespondentes}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? allSelectedRespondentes
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
                      (formData.respondente.length === 0 ||
                        formData.respondente.every((val) => val === 0)) &&
                      formValidation.respondente === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Responsável pela avaliação</InputLabel>
              <Autocomplete
                disabled={!isPeopleEditable}
                options={responsaveisAv}
                getOptionLabel={(option) => option.nome}
                value={
                  responsaveisAv.find(
                    (responsavelAv) =>
                      responsavelAv.id === formData.responsavelAv,
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    responsavelAv: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.responsavelAv &&
                      formValidation.responsavelAv === false
                    }
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

              {isFinalizada && (
                <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                  <Stack spacing={1}>
                    <InputLabel>Data de conclusão</InputLabel>
                    <TextField
                      disabled
                      fullWidth
                      value={(() => {
                        const raw = normativaDados?.dateOfConclusion || "";
                        return formatDateConclusion(raw);
                      })()}
                    />
                  </Stack>
                </Grid>
              )}

              {requisicao === "Editar" && !!buttonTitle && (
                <Grid item xs={3} mt={4} ml={5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {buttonTitle === "INICIAR AVALIAÇÃO" ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleStart}
                      >
                        INICIAR AVALIAÇÃO
                      </Button>
                    ) : buttonTitle === "FINALIZAR" ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleTesteRealizado}
                        disabled={!canFinalizar}
                      >
                        FINALIZAR
                      </Button>
                    ) : buttonTitle === "REVISADO / RETORNAR" ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleConcluirTeste}
                        >
                          REVISADO
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleRetornar}
                        >
                          RETORNAR
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={tratarSubmit}
                      >
                        {buttonTitle}
                      </Button>
                    )}
                  </Stack>
                </Grid>
              )}

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo de Consolidação</InputLabel>
                  <TextField
                    disabled
                    fullWidth
                    value={
                      tipoConsolidacao === 1
                        ? "Média"
                        : tipoConsolidacao === 2
                          ? "Pior avaliação"
                          : ""
                    }
                  />
                </Stack>
              </Grid>

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

                      <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Comentário</InputLabel>
                          <TextField
                            disabled={!isEvaluationEditable}
                            onChange={(event) =>
                              setComentario(event.target.value)
                            }
                            fullWidth
                            multiline
                            rows={4}
                            value={comentario}
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
                    <Typography variant="h6">Questionários</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemAcionistas
                      normativaDados={normativaDados}
                      onFilledQuestionarios={handleFilledQuestionarios}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {isResponsibleAv && (
                <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      style={{ marginTop: 0.5 }}
                    >
                      <Switch
                        disabled={!isEvaluationEditable}
                        checked={sobrepor}
                        onChange={(event) => {
                          const ch = event.target.checked;
                          setSobrepor(ch);
                          if (!ch) {
                            setFormData((prev) => ({
                              ...prev,
                              idProbabilityInherent: null,
                              idSeverityInherent: null,
                              idProbabilityResidual: null,
                              idSeverityResidual: null,
                              idProbabilityPlanned: null,
                              idSeverityPlanned: null,
                              justificationInerent: "",
                              justificationResidual: "",
                              justificationPlanned: "",
                            }));
                            setComentario("");
                          }
                        }}
                      />
                      <Typography>Sobrepor resultado do risco</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              )}

              {sobrepor === false && (
                <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                  <HeatmapAvaliacaoRiscoFixo
                    data={heatmapDataAv}
                    avgInherent={avgCoords.inherent}
                    avgResidual={avgCoords.residual}
                    avgPlanned={avgCoords.planned}
                  />
                </Grid>
              )}

              {sobrepor && isResponsibleAv && (
                <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                  <HeatmapAvaliacaoRisco
                    data={heatmapDataAv}
                    nivel={nivelAv}
                    avgInherent={avgCoords.inherent}
                    avgResidual={avgCoords.residual}
                    avgPlanned={avgCoords.planned}
                    initialOverlay={initialOverlay}
                    onOverlayChange={handleOverlayChange}
                    disableOverlay={!isEvaluationEditable}
                  />
                </Grid>
              )}
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
              {isFinalizada ? (
                <Button
                  variant="contained"
                  color="primary"
                  style={{
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
                  onClick={handleAtualizarClick}
                >
                  Atualizar
                </Button>
              )}
            </Box>
          </Grid>

          {/* Confirmação ao salvar com sobreposição (finaliza a avaliação) */}
          <Dialog
            open={confirmSobreporOpen}
            onClose={() => setConfirmSobreporOpen(false)}
            sx={{
              "& .MuiDialog-paper": {
                padding: "16px",
                borderRadius: "12px",
                width: "460px",
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              Atenção: esta ação vai finalizar a avaliação
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ fontSize: "15px" }}>
                Você ativou <b>“Sobrepor resultado do risco”</b>. Ao salvar desta
                forma, a avaliação será <b>FINALIZADA</b> e não poderá mais ser
                editada.
                <br />
                <br />
                Deseja confirmar a ação?
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setConfirmSobreporOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmSobrepor}
              >
                Confirmar e salvar
              </Button>
            </DialogActions>
          </Dialog>

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
              Avaliação criada com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A avaliação foi cadastrada com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações.
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
