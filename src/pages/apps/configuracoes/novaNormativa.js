import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ptBR from "date-fns/locale/pt-BR";
import { API_URL } from "config";
import { useToken } from "../../../api/TokenContext";
import useAuth from "../../../hooks/useAuth";
import LoadingOverlay from "./LoadingOverlay";
import DrawerEmpresa from "./novaEmpresaDrawerNormativos";
import DrawerDepartamento from "./novoDepartamentoDrawerNormativas";
import DrawerProcesso from "./novoProcessoDrawerNormativa";
import FileUploader from "./FileUploader";
import DrawerPlanos from "./novoPlanoDrawerNormativa";
import ListagemTrecho from "./listaTrecho";

const FILE_CONTAINER_FOLDER = 6;

const STATUS = {
  ELABORACAO: 1,
  EM_APROVACAO: 2,
  VERSAO_FINAL: 3,
  REVOGADO: 4,
  EM_ALTERACAO: 5,
};

const STATUS_OPTIONS = [
  { id: STATUS.ELABORACAO, nome: "Elaboração" },
  { id: STATUS.EM_APROVACAO, nome: "Em aprovação" },
  { id: STATUS.VERSAO_FINAL, nome: "Versão final" },
  { id: STATUS.REVOGADO, nome: "Revogado" },
  { id: STATUS.EM_ALTERACAO, nome: "Em alteração" },
];

const REVISION_STATUS_OPTIONS = [
  { id: 1, nome: "Revisada" },
  { id: 2, nome: "Próxima da revisão" },
  { id: 3, nome: "Em atraso" },
];

const FREQUENCY_OPTIONS = [
  { id: 1, nome: "Semestral" },
  { id: 2, nome: "Anual" },
  { id: 3, nome: "Bienal" },
];

const RISK_OPTIONS = [
  { id: 1, nome: "Alto" },
  { id: 2, nome: "Médio" },
  { id: 3, nome: "Baixo" },
  { id: "na", nome: "Não aplicável" },
];

const NORMATIVE_ENVIRONMENT_OPTIONS = [
  { id: 1, nome: "Interno", kind: "internal" },
  { id: 2, nome: "Externo", kind: "external" },
];

const INITIAL_FORM_DATA = {
  idNormative: "",
  code: "",
  name: "",
  ambiente: "",
  responsavel: "",
  revisor: "",
  statusNorma: "",
  ativo: true,
  tipoNorma: "",
  regulador: "",
  riscoNorma: null,
  periodicidadeRevisao: "",
  statuRevisao: "",
  normaOrigem: [],
  normaDestino: [],
  empresa: [],
  departamento: [],
  processo: [],
  planoAcao: [],
  aprovador: [],
  dataCadastro: new Date(),
  dataPublicacao: null,
  vigenciaInicial: null,
  ultimaRevisao: null,
  dataRevogacao: null,
  motivoRevogacao: "",
  description: "",
  note: "",
  descriptionReviewer: "",
  files: [],
};

const INITIAL_DRAFT_COMMENTS = {
  description: "",
  note: "",
  descriptionReviewer: "",
};

const INITIAL_FIELD_ERROR_MESSAGES = {
  code: "",
};

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(value) {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function getEntityId(item) {
  return (
    item?.id ||
    item?.idNormative ||
    item?.idDepartment ||
    item?.idProcess ||
    item?.idCompany ||
    item?.idCollaborator ||
    item?.idNormativeType ||
    item?.idRegulatory ||
    item?.idActionPlan ||
    item?.idEnvironment ||
    item?.idReviewer ||
    item?.idReviwer ||
    item?.idResponsible
  );
}

function mapOption(item) {
  return {
    id: getEntityId(item),
    nome: item?.nome || item?.name || item?.description || "",
    ...item,
  };
}

function resolveEnvironmentKind(environment) {
  const normalizedName = normalizeText(environment?.nome || environment?.name);

  if (normalizedName.includes("extern")) return "external";
  if (normalizedName.includes("intern")) return "internal";
  return "";
}

function toIdArray(value, fallback = []) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return fallback;
}

function resolveRiskValue(value) {
  const numericValue = Number(value);
  return [1, 2, 3].includes(numericValue) ? numericValue : null;
}

function appendCommentHistory(currentValue, newValue, userName) {
  const trimmedValue = (newValue || "").trim();
  if (!trimmedValue) return currentValue || "";

  const entry = `[${userName}]: ${trimmedValue} - ${new Date().toLocaleString(
    "pt-BR",
  )}`;

  return currentValue ? `${currentValue}\n\n${entry}` : entry;
}

function calculateRevisionFields(lastRevision, frequencyRevision) {
  const revisionDate = toDate(lastRevision);
  const normalizedFrequency = Number(frequencyRevision);
  const daysByFrequency = { 1: 180, 2: 360, 3: 720 };
  const revisionDays = daysByFrequency[normalizedFrequency];

  if (!revisionDate || !revisionDays) {
    return {
      limitDate: null,
      days: "",
      status: "",
    };
  }

  const limitDate = new Date(revisionDate);
  limitDate.setDate(limitDate.getDate() + revisionDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  limitDate.setHours(0, 0, 0, 0);

  const diffMs = limitDate.getTime() - today.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { limitDate, days, status: 3 };
  }

  if (days <= 30) {
    return { limitDate, days, status: 2 };
  }

  return { limitDate, days, status: 1 };
}

function extractApiNotifications(error) {
  return Array.isArray(error?.response?.data?.notifications)
    ? error.response.data.notifications
    : [];
}

function getApiNotificationMessages(error) {
  const messages = extractApiNotifications(error)
    .map((notification) => notification?.message?.trim())
    .filter(Boolean);

  if (messages.length > 0) {
    return messages;
  }

  const fallbackMessage = error?.response?.data?.message?.trim();
  return fallbackMessage ? [fallbackMessage] : [];
}

function resolveNotificationField(notification) {
  const normalizedCode = normalizeText(notification?.code);
  const normalizedMessage = normalizeText(notification?.message);

  if (normalizedCode === "code" || normalizedMessage.includes("codigo")) {
    return "code";
  }

  return "";
}

function extractFileList(source) {
  if (!source) return [];

  if (Array.isArray(source.files)) {
    return source.files;
  }

  if (Array.isArray(source.normativeDocuments)) {
    return source.normativeDocuments
      .map((document) => ({
        name: document.name || document.description || "Documento",
        path: document.file,
      }))
      .filter((document) => document.path);
  }

  return [];
}

function extractFilePaths(files) {
  return (files || [])
    .map((file) => {
      if (typeof file === "string") return file;
      if (file?.path) return file.path;
      if (file?.file) return file.file;
      return null;
    })
    .filter(Boolean);
}

function mapNormativeToForm(record) {
  if (!record) return { ...INITIAL_FORM_DATA };

  return {
    idNormative: record.idNormative || record.id || "",
    code: record.code || "",
    name: record.name || "",
    ambiente:
      record.idEnvironment ||
      record.environment?.idEnvironment ||
      record.environment?.id ||
      "",
    responsavel:
      record.idResponsible ||
      record.responsible?.idCollaborator ||
      record.responsible?.id ||
      "",
    revisor:
      record.idReviwer ||
      record.idReviewer ||
      record.reviwer?.idCollaborator ||
      record.reviwer?.id ||
      "",
    statusNorma: record.normativeStatus || "",
    ativo: typeof record.active === "boolean" ? record.active : true,
    tipoNorma:
      record.idNormativeType || record.normativeType?.idNormativeType || "",
    regulador: record.idRegulatory || record.regulatory?.idRegulatory || "",
    riscoNorma: resolveRiskValue(record.normativeRisk),
    periodicidadeRevisao: record.frequencyRevision || "",
    statuRevisao: record.normativeRevisionStatus || "",
    normaOrigem: Array.isArray(record.idOrigins)
      ? record.idOrigins.filter(Boolean)
      : toIdArray(
          record.normativeOrigins?.map(
            (origin) =>
              origin.idNormativeOrigin || origin.idNormative || origin.id,
          ),
        ),
    normaDestino: Array.isArray(record.idDestinies)
      ? record.idDestinies.filter(Boolean)
      : toIdArray(
          record.normativeDestinies?.map(
            (destiny) =>
              destiny.idNormativeDestiny || destiny.idNormative || destiny.id,
          ),
        ),
    empresa: Array.isArray(record.idCompanies)
      ? record.idCompanies.filter(Boolean)
      : toIdArray(
          record.normativeCompanies?.map(
            (company) => company.idCompany || company.company?.idCompany,
          ),
        ),
    departamento: Array.isArray(record.idDepartments)
      ? record.idDepartments.filter(Boolean)
      : toIdArray(
          record.normativeDepartments?.map(
            (department) =>
              department.idDepartment || department.department?.idDepartment,
          ),
        ),
    processo: Array.isArray(record.idProcesses)
      ? record.idProcesses.filter(Boolean)
      : Array.isArray(record.idProcess)
        ? record.idProcess.filter(Boolean)
        : toIdArray(
            record.normativeProcess?.map(
              (process) => process.idProcess || process.process?.idProcess,
            ),
          ),
    planoAcao: Array.isArray(record.idActionPlans)
      ? record.idActionPlans.filter(Boolean)
      : toIdArray(
          record.normativeActionPlans?.map(
            (plan) => plan.idActionPlan || plan.actionPlan?.idActionPlan,
          ),
        ),
    aprovador: Array.isArray(record.idApprovers)
      ? record.idApprovers.filter(Boolean)
      : toIdArray(
          record.normativeApprovers?.map(
            (approver) =>
              approver.idApprover || approver.approver?.idCollaborator,
          ),
        ),
    dataCadastro: toDate(record.registerDate) || new Date(),
    dataPublicacao: toDate(record.publishDate),
    vigenciaInicial: toDate(record.initialVigency),
    ultimaRevisao: toDate(record.lastRevision),
    dataRevogacao: toDate(record.revocationDate),
    motivoRevogacao: record.revocationReason || "",
    description: record.description || "",
    note: record.note || "",
    descriptionReviewer: record.descriptionReviewer || record.conclusion || "",
    files: extractFileList(record),
  };
}

function getEnvironmentKind(environmentId, environments) {
  const environment = environments.find(
    (item) => String(item.id) === String(environmentId),
  );

  return resolveEnvironmentKind(environment);
}

function buildNormativeEnvironmentOptions(environments) {
  return NORMATIVE_ENVIRONMENT_OPTIONS.map((preset) => {
    const matchedEnvironment = environments.find(
      (item) => resolveEnvironmentKind(item) === preset.kind,
    );

    if (matchedEnvironment) {
      return {
        ...matchedEnvironment,
        nome: preset.nome,
        kind: preset.kind,
      };
    }

    return { ...preset };
  });
}

function buildSelectedValues(ids, options) {
  return ids.map(
    (id) =>
      options.find((option) => String(option.id) === String(id)) || {
        id,
        nome: String(id),
      },
  );
}

function CommentCard({
  title,
  placeholder,
  draftValue,
  historyValue,
  onDraftChange,
  onSave,
  disabled,
  loading,
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        backgroundColor: "#f9f9f9",
        padding: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <InputLabel sx={{ m: 0, fontWeight: "bold" }}>{title}</InputLabel>
        <Button
          variant="outlined"
          size="small"
          onClick={onSave}
          disabled={disabled || loading || !draftValue.trim()}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Salvar comentário
        </Button>
      </Stack>

      <TextField
        fullWidth
        multiline
        rows={3}
        value={draftValue}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        sx={{ backgroundColor: "#fff" }}
      />

      {historyValue ? (
        <>
          <InputLabel sx={{ fontWeight: "bold", mt: 1 }}>
            Histórico de comentários
          </InputLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={historyValue}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f0f7ff",
              },
              "& .MuiInputBase-input": {
                color: "#0d0d0d !important",
                WebkitTextFillColor: "#0d0d0d !important",
              },
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}

function ColumnsLayouts() {
  const { token } = useToken();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const normativeIdFromQuery =
    queryParams.get("idnormative") || queryParams.get("idNormative");
  const dadosApiFromUrl = normativeIdFromQuery
    ? {
        idNormative: normativeIdFromQuery,
      }
    : null;
  const { dadosApi } = location.state || {};
  const routeData = dadosApi || dadosApiFromUrl;
  const idNormativeFromRoute = routeData?.idNormative || "";
  const idUser = localStorage.getItem("id_user");
  const userName = localStorage.getItem("username") || "Usuário";

  const [ambientes, setAmbientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [normaOrigens, setNormaOrigens] = useState([]);
  const [normaDestinos, setNormaDestinos] = useState([]);
  const [planosAcoes, setPlanosAcoes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [aprovadores, setAprovadores] = useState([]);
  const [reguladores, setReguladores] = useState([]);
  const [tipoNormas, setTipoNormas] = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [draftComments, setDraftComments] = useState(INITIAL_DRAFT_COMMENTS);
  const [normativaDados, setNormativaDados] = useState(null);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrorMessages, setFieldErrorMessages] = useState(
    INITIAL_FIELD_ERROR_MESSAGES,
  );
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [confirmRevisorOpen, setConfirmRevisorOpen] = useState(false);
  const [confirmRevogOpen, setConfirmRevogOpen] = useState(false);
  const [tempResponsavelId, setTempResponsavelId] = useState(null);
  const [tempRevDate, setTempRevDate] = useState(null);
  const [showJustificativaField, setShowJustificativaField] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialResponsibleApplied, setInitialResponsibleApplied] =
    useState(false);
  const [formValidation, setFormValidation] = useState({
    code: true,
    name: true,
    ambiente: true,
    revisor: true,
    responsavel: true,
    statusNorma: true,
    ultimaRevisao: true,
  });

  const requisicao =
    formData.idNormative || idNormativeFromRoute ? "Editar" : "Criar";
  const feedbackLabel = requisicao === "Criar" ? "cadastrada" : "editada";

  useEffect(() => {
    window.hasChanges = hasChanges;
    return () => {
      window.hasChanges = false;
    };
  }, [hasChanges]);

  const withDirty = (updater) => {
    setHasChanges(true);
    setFormData((previous) =>
      typeof updater === "function"
        ? updater(previous)
        : { ...previous, ...updater },
    );
  };

  const clearFieldError = (field) => {
    setFieldErrorMessages((previous) =>
      previous[field]
        ? { ...previous, [field]: INITIAL_FIELD_ERROR_MESSAGES[field] || "" }
        : previous,
    );

    setFormValidation((previous) =>
      previous[field] ? previous : { ...previous, [field]: true },
    );
  };

  const applyApiValidationFeedback = (error) => {
    const notifications = extractApiNotifications(error);

    if (notifications.length === 0) return;

    const validationUpdates = {};
    const messageUpdates = {};

    notifications.forEach((notification) => {
      const field = resolveNotificationField(notification);
      if (!field) return;

      validationUpdates[field] = false;
      messageUpdates[field] = notification.message || "";
    });

    if (Object.keys(validationUpdates).length > 0) {
      setFormValidation((previous) => ({
        ...previous,
        ...validationUpdates,
      }));
    }

    if (Object.keys(messageUpdates).length > 0) {
      setFieldErrorMessages((previous) => ({
        ...previous,
        ...messageUpdates,
      }));
    }
  };

  const loadOptions = useCallback(async () => {
    const endpoints = [
      {
        url: `${API_URL}actives/environments`,
        setter: setAmbientes,
        transform: buildNormativeEnvironmentOptions,
      },
      { url: `${API_URL}departments`, setter: setDepartamentos },
      { url: `${API_URL}normatives/types`, setter: setTipoNormas },
      { url: `${API_URL}normatives/regulatories`, setter: setReguladores },
      { url: `${API_URL}normatives`, setter: setNormaOrigens },
      { url: `${API_URL}normatives`, setter: setNormaDestinos },
      { url: `${API_URL}companies`, setter: setEmpresas },
      { url: `${API_URL}processes`, setter: setProcessos },
      { url: `${API_URL}action-plans`, setter: setPlanosAcoes },
      {
        url: `${API_URL}collaborators/responsibles`,
        setter: setResponsaveis,
      },
      {
        url: `${API_URL}collaborators/responsibles`,
        setter: setAprovadores,
      },
    ];

    await Promise.all(
      endpoints.map(async ({ url, setter, transform }) => {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mappedOptions = (response.data || []).map(mapOption);
        setter(transform ? transform(mappedOptions) : mappedOptions);
      }),
    );
  }, [token]);

  const loadNormative = useCallback(async (idNormative) => {
    if (!idNormative) return;

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}normatives/${idNormative}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNormativaDados(response.data);
      setFormData(mapNormativeToForm(response.data));
      setDraftComments(INITIAL_DRAFT_COMMENTS);
      setDeletedFiles([]);
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível carregar a normativa.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        await loadOptions();

        if (idNormativeFromRoute) {
          await loadNormative(idNormativeFromRoute);
        }

        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Não foi possível carregar os catálogos da tela.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [idNormativeFromRoute, loadNormative, loadOptions, token]);

  useEffect(() => {
    if (initialResponsibleApplied) return;
    if (requisicao !== "Criar") return;
    if (!idUser || responsaveis.length === 0) return;

    const userIsResponsible = responsaveis.some(
      (responsavel) => String(responsavel.id) === String(idUser),
    );

    setInitialResponsibleApplied(true);
    if (formData.responsavel || !userIsResponsible) return;

    setFormData((previous) => ({
      ...previous,
      responsavel: idUser,
    }));
  }, [
    formData.responsavel,
    idUser,
    initialResponsibleApplied,
    requisicao,
    responsaveis,
  ]);

  const ambienteKind = useMemo(
    () => getEnvironmentKind(formData.ambiente, ambientes),
    [ambientes, formData.ambiente],
  );

  const isExterno = ambienteKind === "external";
  const isInterno = ambienteKind === "internal";
  const currentStatus = formData.statusNorma || "";
  const currentNormativeId = formData.idNormative || idNormativeFromRoute;
  const currentUserEmail = normalizeText(user?.email);

  const revisionData = useMemo(
    () =>
      calculateRevisionFields(
        formData.ultimaRevisao,
        formData.periodicidadeRevisao,
      ),
    [formData.ultimaRevisao, formData.periodicidadeRevisao],
  );

  const currentNotification = useMemo(() => {
    if (!currentUserEmail) return null;
    if (!Array.isArray(normativaDados?.normativeNotifications)) return null;

    return (
      normativaDados.normativeNotifications.find(
        (notification) =>
          normalizeText(notification.email) === currentUserEmail,
      ) || null
    );
  }, [currentUserEmail, normativaDados?.normativeNotifications]);

  const isApproverListed =
    Array.isArray(formData.aprovador) &&
    formData.aprovador.some((id) => String(id) === String(idUser));

  const isApprovalPendingForCurrentUser = Boolean(
    currentNotification?.emailSent &&
      !currentNotification?.emailReplied &&
      !currentNotification?.returned,
  );

  const isFutureApprover = Boolean(
    currentStatus === STATUS.EM_APROVACAO &&
      currentNotification &&
      !currentNotification.emailSent &&
      !currentNotification.emailReplied &&
      !currentNotification.approved &&
      !currentNotification.returned,
  );

  const canReplyApproval =
    currentStatus === STATUS.EM_APROVACAO &&
    (isApprovalPendingForCurrentUser ||
      (!currentNotification && isApproverListed));

  const isResponsible = String(formData.responsavel) === String(idUser);
  const isReviewer = String(formData.revisor) === String(idUser);
  const reviewWorkflowEnabled =
    currentStatus === STATUS.VERSAO_FINAL &&
    resolveRiskValue(formData.riscoNorma) !== null;

  const canEditGeneralFields =
    requisicao === "Criar" ||
    ((currentStatus === STATUS.ELABORACAO ||
      currentStatus === STATUS.EM_ALTERACAO) &&
      isResponsible &&
      !isFutureApprover);

  const canEditReviewFields = requisicao === "Editar" && isReviewer;
  const canEditLastRevision =
    canEditReviewFields &&
    currentStatus === STATUS.VERSAO_FINAL &&
    !formData.ultimaRevisao;
  const canEditRisk = canEditGeneralFields || canEditReviewFields;
  const canEditElaborationComment =
    (requisicao === "Criar" && !isExterno) ||
    ((currentStatus === STATUS.ELABORACAO ||
      currentStatus === STATUS.EM_ALTERACAO) &&
      isResponsible);
  const canEditApprovalComment = canReplyApproval;
  const canRevogar =
    requisicao === "Editar" &&
    currentStatus !== STATUS.REVOGADO &&
    isResponsible;
  const canAlterar =
    requisicao === "Editar" &&
    currentStatus === STATUS.VERSAO_FINAL &&
    isResponsible &&
    !isExterno;
  const canSendElaborated =
    requisicao === "Editar" &&
    currentStatus === STATUS.ELABORACAO &&
    isResponsible;
  const canSendAltered =
    requisicao === "Editar" &&
    currentStatus === STATUS.EM_ALTERACAO &&
    isResponsible;
  const canMarkReviewed = reviewWorkflowEnabled && canEditReviewFields;

  const showElaborationComment =
    !(isExterno && currentStatus === STATUS.VERSAO_FINAL) ||
    Boolean(formData.description);
  const showApprovalComment =
    requisicao === "Editar" &&
    (formData.aprovador.length > 0 || Boolean(formData.note));

  const visibleStatusOptions = useMemo(() => {
    if (requisicao !== "Criar") {
      return STATUS_OPTIONS;
    }

    if (isExterno) {
      return STATUS_OPTIONS.filter(
        (statusOption) => statusOption.id === STATUS.VERSAO_FINAL,
      );
    }

    if (isInterno) {
      return STATUS_OPTIONS.filter(
        (statusOption) =>
          statusOption.id === STATUS.ELABORACAO ||
          statusOption.id === STATUS.VERSAO_FINAL,
      );
    }

    return STATUS_OPTIONS.filter(
      (statusOption) =>
        statusOption.id === STATUS.ELABORACAO ||
        statusOption.id === STATUS.VERSAO_FINAL,
    );
  }, [isExterno, isInterno, requisicao]);

  const selectedRiskOption =
    RISK_OPTIONS.find((option) =>
      option.id === "na"
        ? resolveRiskValue(formData.riscoNorma) === null
        : option.id === resolveRiskValue(formData.riscoNorma),
    ) || null;

  const buildUpdatePayload = (source, overrides = {}) => {
    const base = {
      ...INITIAL_FORM_DATA,
      ...source,
      ...overrides,
    };

    const normalizedRisk = resolveRiskValue(base.riscoNorma);
    const normalizedStatus = Number(base.statusNorma) || null;
    const shouldFillRevisionWorkflow =
      normalizedStatus === STATUS.VERSAO_FINAL && normalizedRisk !== null;

    const computedRevision = shouldFillRevisionWorkflow
      ? calculateRevisionFields(base.ultimaRevisao, base.periodicidadeRevisao)
      : { limitDate: null, days: "", status: "" };

    return {
      idNormative: base.idNormative,
      code: base.code?.trim() || null,
      name: base.name?.trim() || null,
      description: base.description || null,
      note: base.note || null,
      registerDate: toIso(base.dataCadastro),
      publishDate: toIso(base.dataPublicacao),
      initialVigency: toIso(base.vigenciaInicial),
      lastRevision: toIso(base.ultimaRevisao),
      conclusion: base.descriptionReviewer || null,
      frequencyRevision: shouldFillRevisionWorkflow
        ? Number(base.periodicidadeRevisao) || null
        : null,
      limitDateRevision: shouldFillRevisionWorkflow
        ? toIso(computedRevision.limitDate)
        : null,
      daysRevision:
        shouldFillRevisionWorkflow && computedRevision.days !== ""
          ? String(computedRevision.days)
          : null,
      revocationDate: toIso(base.dataRevogacao),
      revocationReason: base.motivoRevogacao || null,
      normativeStatus: normalizedStatus,
      normativeRevisionStatus: shouldFillRevisionWorkflow
        ? Number(base.statuRevisao) || computedRevision.status || null
        : null,
      normativeRisk: normalizedRisk,
      descriptionReviewer: base.descriptionReviewer || null,
      active: Boolean(base.ativo),
      idNormativeType: base.tipoNorma || null,
      idRegulatory: base.regulador || null,
      idResponsible: base.responsavel || null,
      idEnvironment: base.ambiente || null,
      idReviwer: base.revisor || null,
      idOrigins: base.normaOrigem,
      idDestinies: base.normaDestino,
      idActionPlans: base.planoAcao,
      idApprovers: base.aprovador,
      idCompanies: base.empresa,
      idDepartments: base.departamento,
      idProcesses: base.processo,
      files: extractFilePaths(base.files),
    };
  };

  const uploadCurrentFiles = async (idNormative) => {
    if (deletedFiles.length > 0) {
      const payload = deletedFiles
        .map((file) => file?.name || file?.filename)
        .filter(Boolean);

      if (payload.length > 0) {
        await axios.delete(`${API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: FILE_CONTAINER_FOLDER,
            files: payload,
          },
        });
      }
    }

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File),
    );

    let uploadedFiles = [];

    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", FILE_CONTAINER_FOLDER);

      if (idNormative) {
        formDataUpload.append("IdContainer", idNormative);
      }

      newFiles.forEach((file) => {
        formDataUpload.append("Files", file, file.name);
      });

      const uploadResponse = await axios.post(
        `${API_URL}files/uploads`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      uploadedFiles = uploadResponse.data?.files || [];
    }

    return [...existingFiles, ...uploadedFiles];
  };

  const applyDraftComments = (source, fields = Object.keys(draftComments)) => {
    const nextSource = { ...source };

    fields.forEach((field) => {
      const draftValue = draftComments[field]?.trim();
      if (!draftValue) return;

      nextSource[field] = appendCommentHistory(
        nextSource[field],
        draftValue,
        userName,
      );
    });

    return nextSource;
  };

  const clearDraftComments = (fields = Object.keys(draftComments)) => {
    setDraftComments((previous) => {
      const nextDrafts = { ...previous };
      fields.forEach((field) => {
        nextDrafts[field] = "";
      });
      return nextDrafts;
    });
  };

  const validateBaseFields = ({ requireLastRevision = false } = {}) => {
    const nextValidation = {
      code: Boolean(formData.code.trim()),
      name: Boolean(formData.name.trim()),
      ambiente: Boolean(formData.ambiente),
      revisor: Boolean(formData.revisor),
      responsavel: Boolean(formData.responsavel),
      statusNorma: Boolean(formData.statusNorma),
      ultimaRevisao: !requireLastRevision || Boolean(formData.ultimaRevisao),
    };

    setFormValidation(nextValidation);

    const missingLabels = [];

    if (!nextValidation.name) missingLabels.push("Nome");
    if (!nextValidation.code) missingLabels.push("Código");
    if (!nextValidation.ambiente) missingLabels.push("Ambiente");
    if (!nextValidation.revisor) missingLabels.push("Revisor");
    if (!nextValidation.responsavel) missingLabels.push("Responsável");
    if (!nextValidation.statusNorma) missingLabels.push("Status da norma");
    if (!nextValidation.ultimaRevisao) missingLabels.push("Última revisão");

    if (missingLabels.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingLabels.join(", ")} são obrigatórios para continuar.`,
        {
          variant: "error",
        },
      );
      return false;
    }

    return true;
  };

  const saveCommentField = async (field) => {
    const draftValue = draftComments[field]?.trim();

    if (!draftValue) {
      enqueueSnackbar("Escreva um comentário antes de salvar.", {
        variant: "warning",
      });
      return;
    }

    if (!normativaDados?.idNormative) {
      enqueueSnackbar(
        "O comentário rápido só pode ser salvo após a criação da normativa.",
        {
          variant: "warning",
        },
      );
      return;
    }

    setLoading(true);

    try {
      const baseSource = mapNormativeToForm(normativaDados);
      const updatedValue = appendCommentHistory(
        baseSource[field],
        draftValue,
        userName,
      );

      const payload = buildUpdatePayload(baseSource, {
        [field]: updatedValue,
      });

      await axios.put(`${API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNormativaDados((previous) => ({
        ...previous,
        [field]: updatedValue,
        ...(field === "descriptionReviewer" ? { conclusion: updatedValue } : {}),
      }));

      setFormData((previous) => ({
        ...previous,
        [field]: updatedValue,
      }));

      clearDraftComments([field]);

      enqueueSnackbar("Comentário salvo com sucesso.", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível salvar o comentário.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNormative = async () => {
    if (!validateBaseFields()) return;

    setLoading(true);

    try {
      const createPayload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        idReviewer: formData.revisor || null,
        idResponsible: formData.responsavel || null,
        idEnvironment: formData.ambiente || null,
      };

      const createResponse = await axios.post(
        `${API_URL}normatives`,
        createPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdId = createResponse.data?.data?.idNormative;

      if (!createdId) {
        throw new Error("A API não retornou o identificador da normativa.");
      }

      const sourceForUpdate = applyDraftComments(
        {
          ...formData,
          idNormative: createdId,
          statusNorma:
            formData.statusNorma ||
            (isExterno ? STATUS.VERSAO_FINAL : STATUS.ELABORACAO),
        },
        ["description"],
      );

      const payload = buildUpdatePayload(sourceForUpdate);

      await axios.put(`${API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearDraftComments();
      setFieldErrorMessages(INITIAL_FIELD_ERROR_MESSAGES);
      setHasChanges(false);
      setSuccessDialogOpen(true);

      navigate(location.pathname, {
        replace: true,
        state: { dadosApi: { idNormative: createdId } },
      });

      await loadNormative(createdId);

      enqueueSnackbar(`Normativa ${feedbackLabel} com sucesso!`, {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      applyApiValidationFeedback(error);
      const [apiMessage] = getApiNotificationMessages(error);
      enqueueSnackbar(apiMessage || "Não foi possível cadastrar a normativa.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNormative = async ({
    overrides = {},
    commentFields = Object.keys(draftComments),
    reloadAfter = true,
    successMessage = "Normativa atualizada com sucesso!",
  } = {}) => {
    if (!currentNormativeId) return false;

    const currentSource = applyDraftComments(
      {
        ...formData,
        ...overrides,
      },
      commentFields,
    );

    setLoading(true);

    try {
      const syncedFiles = await uploadCurrentFiles(currentNormativeId);
      const payload = buildUpdatePayload(
        {
          ...currentSource,
          files: syncedFiles,
        },
        overrides,
      );

      await axios.put(`${API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearDraftComments(commentFields);
      setFieldErrorMessages(INITIAL_FIELD_ERROR_MESSAGES);
      setDeletedFiles([]);
      setHasChanges(false);

      if (reloadAfter) {
        await loadNormative(currentNormativeId);
      } else {
        setFormData((previous) => ({
          ...previous,
          ...currentSource,
          files: syncedFiles,
        }));
      }

      enqueueSnackbar(successMessage, {
        variant: "success",
      });

      return true;
    } catch (error) {
      console.error(error);
      applyApiValidationFeedback(error);
      const [apiMessage] = getApiNotificationMessages(error);
      enqueueSnackbar(apiMessage || "Não foi possível atualizar a normativa.", {
        variant: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmRevog = (newDate) => {
    if (!newDate) {
      withDirty({ dataRevogacao: null });
      return;
    }

    setTempRevDate(newDate);
    setShowJustificativaField(!formData.motivoRevogacao.trim());
    setConfirmRevogOpen(true);
  };

  const handleCancelRevog = () => {
    setConfirmRevogOpen(false);
    setTempRevDate(null);
    setShowJustificativaField(false);
  };

  const handleConfirmRevog = async () => {
    if (!formData.motivoRevogacao.trim()) {
      enqueueSnackbar("A justificativa de revogação é obrigatória.", {
        variant: "error",
      });
      return;
    }

    const revocationReason = appendCommentHistory(
      normativaDados?.revocationReason || "",
      formData.motivoRevogacao,
      userName,
    );

    const updated = await updateNormative({
      overrides: {
        statusNorma: STATUS.REVOGADO,
        dataRevogacao: tempRevDate || new Date(),
        motivoRevogacao: revocationReason,
      },
      commentFields: [],
      successMessage: "Normativa revogada com sucesso!",
    });

    if (updated) {
      handleCancelRevog();
    }
  };

  const handleWorkflowSubmit = async (targetStatus) => {
    if (!validateBaseFields()) return;

    const hasApprovers =
      Array.isArray(formData.aprovador) && formData.aprovador.length > 0;

    const finalStatus =
      targetStatus ||
      (hasApprovers ? STATUS.EM_APROVACAO : STATUS.VERSAO_FINAL);

    const shouldStampLastRevision =
      finalStatus === STATUS.VERSAO_FINAL && !formData.ultimaRevisao;

    const updated = await updateNormative({
      overrides: {
        statusNorma: finalStatus,
        ultimaRevisao: shouldStampLastRevision
          ? new Date()
          : formData.ultimaRevisao,
      },
      commentFields: ["description"],
      successMessage:
        finalStatus === STATUS.EM_APROVACAO
          ? "Normativa enviada para aprovação."
          : "Normativa finalizada com sucesso!",
    });

    if (!updated) return;

    if (finalStatus === STATUS.EM_APROVACAO) {
      try {
        await axios.put(
          `${API_URL}normatives/${currentNormativeId}/send-mail-in-approver`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          "A normativa foi atualizada, mas o disparo do e-mail do aprovador falhou.",
          {
            variant: "warning",
          },
        );
      }
    }
  };

  const handleReplyApproval = async (isApproved) => {
    if (!currentNormativeId) return;

    setLoading(true);

    try {
      if (draftComments.note.trim()) {
        const sourceWithApprovalComment = applyDraftComments(
          { ...formData },
          ["note"],
        );

        const syncedFiles = await uploadCurrentFiles(currentNormativeId);
        const payload = buildUpdatePayload({
          ...sourceWithApprovalComment,
          files: syncedFiles,
        });

        await axios.put(`${API_URL}normatives`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        clearDraftComments(["note"]);
        setDeletedFiles([]);
      }

      await axios.put(
        `${API_URL}normatives/reply-pending-approval-status`,
        {
          idNormative: currentNormativeId,
          isApproved,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await loadNormative(currentNormativeId);
      setHasChanges(false);

      enqueueSnackbar(
        isApproved
          ? "Resposta de aprovação enviada com sucesso!"
          : "A normativa foi retornada ao responsável.",
        {
          variant: "success",
        },
      );
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível responder a aprovação pendente.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlterar = async () => {
    await updateNormative({
      overrides: {
        statusNorma: STATUS.EM_ALTERACAO,
      },
      commentFields: ["description"],
      successMessage: "Normativa colocada em alteração!",
    });
  };

  const handleMarkReviewed = async () => {
    if (!currentNormativeId) return;

    const updated = await updateNormative({
      overrides: {
        ultimaRevisao: new Date(),
        statuRevisao: 1,
      },
      commentFields: ["descriptionReviewer"],
      successMessage: "Revisão registrada com sucesso!",
    });

    if (updated) {
      setFormValidation((previous) => ({
        ...previous,
        ultimaRevisao: true,
      }));
    }
  };

  const handleSubmit = async () => {
    if (requisicao === "Criar") {
      await createNormative();
      return;
    }

    const requireLastRevision =
      canEditReviewFields &&
      currentStatus === STATUS.VERSAO_FINAL &&
      (isExterno || canEditLastRevision);

    if (!validateBaseFields({ requireLastRevision })) return;

    const updated = await updateNormative({
      successMessage: `Normativa ${feedbackLabel} com sucesso!`,
    });

    if (updated) {
      navigate(-1);
      window.scrollTo(0, 0);
    }
  };

  const handleResponsavelChange = (_, newValue) => {
    const newId = newValue ? newValue.id : "";

    withDirty((previous) => ({
      ...previous,
      responsavel: newId,
    }));

    if (!newId) return;

    setTempResponsavelId(newId);
    setConfirmRevisorOpen(true);
  };

  const handleConfirmReplication = () => {
    withDirty((previous) => ({
      ...previous,
      revisor: tempResponsavelId,
    }));
    setConfirmRevisorOpen(false);
    setTempResponsavelId(null);
  };

  const handleDenyReplication = () => {
    setConfirmRevisorOpen(false);
    setTempResponsavelId(null);
  };

  const handleEnvironmentChange = (_, newValue) => {
    const selectedEnvironmentId = newValue ? newValue.id : "";
    const selectedKind = getEnvironmentKind(selectedEnvironmentId, ambientes);

    withDirty((previous) => ({
      ...previous,
      ambiente: selectedEnvironmentId,
      statusNorma:
        selectedKind === "external"
          ? STATUS.VERSAO_FINAL
          : previous.statusNorma &&
              [STATUS.ELABORACAO, STATUS.VERSAO_FINAL].includes(
                previous.statusNorma,
              )
            ? previous.statusNorma
            : STATUS.ELABORACAO,
    }));
  };

  const handleRiskChange = (_, newValue) => {
    const nextRisk = resolveRiskValue(newValue?.id);

    withDirty((previous) => ({
      ...previous,
      riscoNorma: nextRisk,
      periodicidadeRevisao: nextRisk || "",
      statuRevisao: nextRisk ? previous.statuRevisao : "",
    }));
  };

  const handleMultiSelectAll = (field, options) => (_, newValue) => {
    const clickedAll = newValue.some((option) => option.id === "all");

    if (clickedAll) {
      withDirty((previous) => ({
        ...previous,
        [field]:
          previous[field].length === options.length
            ? []
            : options.map((option) => option.id),
      }));
      return;
    }

    withDirty((previous) => ({
      ...previous,
      [field]: newValue.map((option) => option.id),
    }));
  };

  const handleCompanyCreated = (newCompany) => {
    const mappedCompany = mapOption(newCompany);
    setEmpresas((previous) => [...previous, mappedCompany]);
    withDirty((previous) => ({
      ...previous,
      empresa: [...previous.empresa, mappedCompany.id],
    }));
  };

  const handleDepartmentCreated = (newDepartment) => {
    const mappedDepartment = mapOption(newDepartment);
    setDepartamentos((previous) => [...previous, mappedDepartment]);
    withDirty((previous) => ({
      ...previous,
      departamento: [...previous.departamento, mappedDepartment.id],
    }));
  };

  const handleProcessCreated = (newProcess) => {
    const mappedProcess = mapOption(newProcess);
    setProcessos((previous) => [...previous, mappedProcess]);
    withDirty((previous) => ({
      ...previous,
      processo: [...previous.processo, mappedProcess.id],
    }));
  };

  const handlePlanCreated = (newPlan) => {
    const mappedPlan = mapOption(newPlan);
    setPlanosAcoes((previous) => [...previous, mappedPlan]);
    withDirty((previous) => ({
      ...previous,
      planoAcao: [...previous.planoAcao, mappedPlan.id],
    }));
  };

  const selectedEnvironment =
    ambientes.find((item) => String(item.id) === String(formData.ambiente)) ||
    null;
  const selectedResponsible =
    responsaveis.find(
      (item) => String(item.id) === String(formData.responsavel),
    ) || null;
  const selectedReviewer =
    responsaveis.find((item) => String(item.id) === String(formData.revisor)) ||
    null;
  const selectedStatus =
    STATUS_OPTIONS.find((item) => item.id === formData.statusNorma) || null;
  const selectedNormativeType =
    tipoNormas.find((item) => String(item.id) === String(formData.tipoNorma)) ||
    null;
  const selectedRegulatory =
    reguladores.find((item) => String(item.id) === String(formData.regulador)) ||
    null;
  const selectedFrequency =
    FREQUENCY_OPTIONS.find(
      (item) => item.id === Number(formData.periodicidadeRevisao),
    ) || null;
  const selectedRevisionStatus =
    REVISION_STATUS_OPTIONS.find(
      (item) =>
        item.id === Number(formData.statuRevisao || revisionData.status || ""),
    ) || null;

  return (
    <>
      <LoadingOverlay isActive={loading} />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={3} sx={{ padding: 3 }}>
          {requisicao === "Editar" ? (
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ borderBottom: "2px solid #e0e0e0", pb: 2, mb: 2 }}
            >
              <Typography variant="h5" fontWeight="bold" color="primary">
                Edição de Normativa
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2}>
                {canSendElaborated ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit()}
                  >
                    ELABORADA
                  </Button>
                ) : null}

                {canSendAltered ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit()}
                  >
                    ALTERADA
                  </Button>
                ) : null}

                {canReplyApproval ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleReplyApproval(true)}
                  >
                    APROVADA
                  </Button>
                ) : null}

                {canReplyApproval ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => handleReplyApproval(false)}
                  >
                    RETORNAR
                  </Button>
                ) : null}

                {canAlterar ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAlterar}
                  >
                    ALTERAR
                  </Button>
                ) : null}

                {canMarkReviewed ? (
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={handleMarkReviewed}
                  >
                    REVISADO
                  </Button>
                ) : null}

                {canRevogar ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleOpenConfirmRevog(new Date())}
                  >
                    REVOGAR
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          ) : null}

          {isFutureApprover ? (
            <Grid item xs={12}>
              <Alert severity="info">
                Esta normativa ainda não está liberada para a sua aprovação.
                Enquanto isso, a tela permanece somente para consulta.
              </Alert>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#555" }}>
              1. Identificação principal
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                fullWidth
                value={formData.code}
                error={!formValidation.code}
                disabled={!canEditGeneralFields}
                helperText={
                  !formValidation.code
                    ? fieldErrorMessages.code || "Campo obrigatório."
                    : ""
                }
                onChange={(event) => {
                  clearFieldError("code");
                  withDirty({ code: event.target.value });
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                fullWidth
                value={formData.name}
                error={!formValidation.name}
                disabled={!canEditGeneralFields}
                onChange={(event) =>
                  withDirty({ name: event.target.value })
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Ambiente *</InputLabel>
              <Autocomplete
                options={ambientes}
                getOptionLabel={(option) => option.nome}
                value={selectedEnvironment}
                onChange={handleEnvironmentChange}
                isOptionEqualToValue={(option, value) =>
                  String(option.id) === String(value.id)
                }
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.ambiente} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Responsável (dono da norma) *</InputLabel>
              <Autocomplete
                options={responsaveis}
                getOptionLabel={(option) => option.nome}
                value={selectedResponsible}
                onChange={handleResponsavelChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.responsavel} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Revisor *</InputLabel>
              <Autocomplete
                options={responsaveis}
                getOptionLabel={(option) => option.nome}
                value={selectedReviewer}
                onChange={(_, newValue) =>
                  withDirty({ revisor: newValue ? newValue.id : "" })
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.revisor} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Status da norma *</InputLabel>
              <Autocomplete
                options={visibleStatusOptions}
                getOptionLabel={(option) => option.nome}
                value={selectedStatus}
                onChange={(_, newValue) =>
                  withDirty({
                    statusNorma: newValue ? newValue.id : "",
                  })
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.statusNorma} />
                )}
                disabled={requisicao === "Editar" || !canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3 }}>
              <Switch
                checked={formData.ativo}
                onChange={(event) =>
                  withDirty({ ativo: event.target.checked })
                }
                disabled={!canEditGeneralFields}
              />
              <Typography>{formData.ativo ? "Ativo" : "Inativo"}</Typography>
            </Stack>
          </Grid>

          {requisicao === "Editar" ? (
            <>
              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  2. Associações e relacionamentos
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Norma de origem</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...normaOrigens]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.normaOrigem, normaOrigens)}
                    onChange={handleMultiSelectAll("normaOrigem", normaOrigens)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.normaOrigem.length === normaOrigens.length &&
                                normaOrigens.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Norma de destino</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...normaDestinos]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.normaDestino, normaDestinos)}
                    onChange={handleMultiSelectAll("normaDestino", normaDestinos)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.normaDestino.length ===
                                  normaDestinos.length && normaDestinos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Empresa{" "}
                    {canEditGeneralFields ? (
                      <DrawerEmpresa
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onCompanyCreated={handleCompanyCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...empresas]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.empresa, empresas)}
                    onChange={handleMultiSelectAll("empresa", empresas)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.empresa.length === empresas.length &&
                                empresas.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Departamentos{" "}
                    {canEditGeneralFields ? (
                      <DrawerDepartamento
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onDepartmentCreated={handleDepartmentCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...departamentos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(
                      formData.departamento,
                      departamentos,
                    )}
                    onChange={handleMultiSelectAll(
                      "departamento",
                      departamentos,
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.departamento.length ===
                                  departamentos.length &&
                                departamentos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Processos{" "}
                    {canEditGeneralFields ? (
                      <DrawerProcesso
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onProcessCreated={handleProcessCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...processos]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.processo, processos)}
                    onChange={handleMultiSelectAll("processo", processos)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.processo.length === processos.length &&
                                processos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Plano de ação{" "}
                    {canEditGeneralFields ? (
                      <DrawerPlanos
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onPlansCreated={handlePlanCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...planosAcoes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.planoAcao, planosAcoes)}
                    onChange={handleMultiSelectAll("planoAcao", planosAcoes)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.planoAcao.length ===
                                  planosAcoes.length && planosAcoes.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  3. Classificação e prazos
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da norma</InputLabel>
                  <Autocomplete
                    options={tipoNormas}
                    getOptionLabel={(option) => option.nome}
                    value={selectedNormativeType}
                    onChange={(_, newValue) =>
                      withDirty({ tipoNorma: newValue ? newValue.id : "" })
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Regulador</InputLabel>
                  <Autocomplete
                    options={reguladores}
                    getOptionLabel={(option) => option.nome}
                    value={selectedRegulatory}
                    onChange={(_, newValue) =>
                      withDirty({ regulador: newValue ? newValue.id : "" })
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Data de cadastro</InputLabel>
                  <DatePicker
                    value={formData.dataCadastro || null}
                    disabled
                    onChange={() => {}}
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Data de publicação</InputLabel>
                  <DatePicker
                    value={formData.dataPublicacao || null}
                    onChange={(newValue) =>
                      withDirty({ dataPublicacao: newValue })
                    }
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Vigência inicial</InputLabel>
                  <DatePicker
                    value={formData.vigenciaInicial || null}
                    onChange={(newValue) =>
                      withDirty({ vigenciaInicial: newValue })
                    }
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  4. Workflow e comentários
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Aprovadores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...aprovadores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.aprovador, aprovadores)}
                    onChange={handleMultiSelectAll("aprovador", aprovadores)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.aprovador.length ===
                                  aprovadores.length && aprovadores.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              {showElaborationComment ? (
                <Grid item xs={12}>
                  <CommentCard
                    title="Comentário da elaboração"
                    placeholder="Digite aqui seu comentário, justificativa ou observação da elaboração."
                    draftValue={draftComments.description}
                    historyValue={formData.description}
                    onDraftChange={(value) =>
                      setDraftComments((previous) => ({
                        ...previous,
                        description: value,
                      }))
                    }
                    onSave={() => saveCommentField("description")}
                    disabled={!canEditElaborationComment}
                    loading={loading}
                  />
                </Grid>
              ) : null}

              {showApprovalComment ? (
                <Grid item xs={12}>
                  <CommentCard
                    title="Comentário da aprovação"
                    placeholder="Digite aqui o comentário da aprovação pendente."
                    draftValue={draftComments.note}
                    historyValue={formData.note}
                    onDraftChange={(value) =>
                      setDraftComments((previous) => ({
                        ...previous,
                        note: value,
                      }))
                    }
                    onSave={() => saveCommentField("note")}
                    disabled={!canEditApprovalComment}
                    loading={loading}
                  />
                </Grid>
              ) : null}

              <Grid item xs={12} mt={2}>
                <Accordion
                  sx={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #e0e0e0",
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      5. Revisão periódica
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                          Apenas o revisor pode alterar os campos desta seção.
                          Quando a norma nasce em versão final, a primeira data
                          de última revisão deve ser preenchida aqui.
                        </Alert>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel>Última revisão</InputLabel>
                          <DatePicker
                            value={formData.ultimaRevisao || null}
                            onChange={(newValue) =>
                              withDirty({
                                ultimaRevisao: newValue,
                              })
                            }
                            disabled={!canEditLastRevision}
                            slotProps={{
                              textField: {
                                placeholder: "00/00/0000",
                                error: !formValidation.ultimaRevisao,
                                helperText:
                                  currentStatus === STATUS.VERSAO_FINAL &&
                                  !formData.ultimaRevisao &&
                                  canEditLastRevision
                                    ? "Obrigatória para normativas que começam em versão final."
                                    : currentStatus === STATUS.ELABORACAO ||
                                        currentStatus === STATUS.EM_ALTERACAO
                                      ? "Será preenchida automaticamente quando a normativa ficar em versão final."
                                      : "",
                              },
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel>Risco da norma</InputLabel>
                          <Autocomplete
                            options={RISK_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedRiskOption}
                            onChange={handleRiskChange}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} />}
                            disabled={!canEditRisk}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Status da revisão</InputLabel>
                          <Autocomplete
                            options={REVISION_STATUS_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedRevisionStatus}
                            renderInput={(params) => <TextField {...params} />}
                            disabled
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Periodicidade</InputLabel>
                          <Autocomplete
                            options={FREQUENCY_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedFrequency}
                            onChange={(_, newValue) =>
                              withDirty({
                                periodicidadeRevisao: newValue ? newValue.id : "",
                              })
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} />}
                            disabled={!canEditReviewFields}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Data limite</InputLabel>
                          <DatePicker
                            value={revisionData.limitDate || null}
                            onChange={() => {}}
                            disabled
                            slotProps={{
                              textField: { placeholder: "00/00/0000" },
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Dias da revisão</InputLabel>
                          <TextField
                            value={
                              revisionData.days === "" ? "" : String(revisionData.days)
                            }
                            disabled
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <CommentCard
                          title="Comentário da revisão"
                          placeholder="Digite aqui o comentário da revisão periódica."
                          draftValue={draftComments.descriptionReviewer}
                          historyValue={formData.descriptionReviewer}
                          onDraftChange={(value) =>
                            setDraftComments((previous) => ({
                              ...previous,
                              descriptionReviewer: value,
                            }))
                          }
                          onSave={() => saveCommentField("descriptionReviewer")}
                          disabled={!canEditReviewFields}
                          loading={loading}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Accordion
                  sx={{
                    backgroundColor: "#fff5f5",
                    border: "1px solid #f5c6c6",
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="error"
                    >
                      6. Revogação da norma
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Data da revogação</InputLabel>
                          <DatePicker
                            value={formData.dataRevogacao || null}
                            onChange={handleOpenConfirmRevog}
                            slotProps={{
                              textField: { placeholder: "00/00/0000" },
                            }}
                            disabled={!canRevogar}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={9}>
                        <Stack spacing={1}>
                          <InputLabel>Motivo da revogação</InputLabel>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.motivoRevogacao}
                            onChange={(event) =>
                              withDirty({
                                motivoRevogacao: event.target.value,
                              })
                            }
                            disabled={!canRevogar}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  Anexos
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={FILE_CONTAINER_FOLDER}
                    initialFiles={formData.files}
                    disabled={!canEditGeneralFields}
                    onFilesChange={(files) => {
                      setHasChanges(true);
                      setFormData((previous) => ({
                        ...previous,
                        files,
                      }));
                    }}
                    onFileDelete={(file) =>
                      setDeletedFiles((previous) => [...previous, file])
                    }
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Accordion sx={{ border: "1px solid #e0e0e0", boxShadow: "none" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Trechos
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemTrecho />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </>
          ) : null}

          {requisicao === "Criar" || canEditGeneralFields ? (
            <Grid
              item
              xs={12}
              mt={2}
              mb={5}
              display="flex"
              justifyContent="flex-start"
            >
              <Button
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1, fontWeight: "bold" }}
                onClick={handleSubmit}
              >
                {requisicao === "Criar" ? "Cadastrar" : "Atualizar formulário"}
              </Button>
            </Grid>
          ) : null}
        </Grid>

        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
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
            Normativa criada com sucesso!
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: "16px", color: "#555", px: 2 }}>
              A normativa foi cadastrada com sucesso. Você pode voltar para a
              listagem ou continuar a edição desta normativa.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
          >
            <Button
              onClick={() => {
                setSuccessDialogOpen(false);
                navigate(-1);
              }}
              variant="outlined"
              sx={{ borderColor: "#007bff", color: "#007bff", fontWeight: 600 }}
            >
              Voltar para a listagem
            </Button>
            <Button
              onClick={() => setSuccessDialogOpen(false)}
              variant="contained"
              sx={{ backgroundColor: "#007bff", fontWeight: 600 }}
            >
              Continuar editando
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmRevisorOpen} onClose={handleDenyReplication}>
          <DialogTitle>Definir revisor?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deseja que o responsável selecionado também seja atribuído como
              revisor desta normativa?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDenyReplication}>Não</Button>
            <Button onClick={handleConfirmReplication} autoFocus variant="contained">
              Sim
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmRevogOpen} onClose={handleCancelRevog}>
          <DialogTitle>Confirmar revogação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja revogar esta norma em{" "}
              {tempRevDate?.toLocaleDateString("pt-BR")}? Isso definirá o status
              como "Revogado" e esta norma não poderá mais ser editada.
            </DialogContentText>

            {showJustificativaField ? (
              <TextField
                autoFocus
                margin="dense"
                label="Justificativa de revogação"
                fullWidth
                multiline
                rows={3}
                value={formData.motivoRevogacao}
                onChange={(event) =>
                  withDirty({
                    motivoRevogacao: event.target.value,
                  })
                }
                sx={{ mt: 2 }}
              />
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelRevog}>Cancelar</Button>
            <Button onClick={handleConfirmRevog} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
