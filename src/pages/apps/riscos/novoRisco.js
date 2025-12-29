/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Switch,
  Stack,
  Typography,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LinkIcon from "@mui/icons-material/Link";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import DrawerIncidente from "../configuracoes/novoIncidenteDrawerRiscos";
import DrawerDepartamento from "../configuracoes/novoDepartamentoDrawerRiscos";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerRiscos";
import DrawerControle from "../configuracoes/novoControleDrawerRiscos";
import DrawerCategoria from "../configuracoes/novaCategoriaDrawerRiscos";
import FileUploader from "../configuracoes/FileUploader";
import DrawerPlanos from "../configuracoes/novoPlanoDrawerRisco";

// Componente para seções organizadas
function SectionCard({ title, icon, children, ...props }) {
  return (
    <Card sx={{ mb: 3, ...props.sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, color: 'primary.main', fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
      </CardContent>
    </Card>
  );
}

// ==============================|| LAYOUTS - COLUMNS CORRIGIDO ||============================== //
function ColumnsLayoutsCorrigido() {
  const { token } = useToken();
  const authToken = token || localStorage.getItem("access_token");
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  
  // Estados existentes (mantidos do código original)
  const [planosAcoes, setPlanoAcao] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [diretrizes, setDiretrizes] = useState([]);
  const [fatores, setFatores] = useState([]);
  const [riscoAssociados, setRiscoAssociados] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [causas, setCausas] = useState([]);
  const [impactos, setImpactos] = useState([]);
  const [normativas, setNormativas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [kris, setKris] = useState([]);
  const [controles, setControles] = useState([]);
  const [ameacas, setAmeacas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [descricaoTratamento, setDescricaoTratamento] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [riscoDados, setRiscoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    files: [],
    controle: [],
    kri: [],
    impacto: [],
    planoAcao: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    categoria: "",
    processo: [],
    riscoAssociado: [],
    conta: [],
    framework: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
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
          item.idRisk ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idDepartment ||
          item.idActionPlan ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idResponsible ||
          item.idCollaborator,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    if (!authToken) return;
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/categories`,
      setCategorias
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/action-plans`,
      setPlanoAcao
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/departments`,
      setDepartamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks`,
      setRiscoAssociados
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/frameworks`,
      setFrameworks
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/treatments`,
      setTratamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/strategic-guidelines`,
      setDiretrizes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/factors`,
      setFatores
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/causes`,
      setCausas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/impacts`,
      setImpactos
    );
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/kris`, setKris);
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/risks/threats`,
      setAmeacas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives`,
      setNormativas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/controls`,
      setControles
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/incidents`,
      setIncidentes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setResponsavel
    );
    window.scrollTo(0, 0);
  }, [authToken]);

  const handlePlanCreated = (newPlan) => {
    setPlanoAcao((prevPlans) => [...prevPlans, newPlan]);
    setFormData((prev) => ({
      ...prev,
      planoAcao: [...prev.planoAcao, newPlan.id],
    }));
  };

  // Em caso de edição - CORRIGIDO
  useEffect(() => {
    if (dadosApi && authToken) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/risks/${dadosApi.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de empresas");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNome(data.name);
          setCodigo(data.code);
          setDescricao(data.description);
          setDescricaoTratamento(data.treatmentDescription);
          
          // CORREÇÃO: Aguardar que os dados sejam carregados antes de definir formData
          setFormData((prev) => ({
            ...prev,
            planoAcao: Array.isArray(data.idActionPlans) ? data.idActionPlans : [],
            causa: Array.isArray(data.causes)
              ? data.causes.map((u) => u.idCause)
              : [],
            departamento: Array.isArray(data.departments)
              ? data.departments.map((u) => u.idDepartment)
              : [],
            fator: Array.isArray(data.factors)
              ? data.factors.map((u) => u.idFactor)
              : [],
            impacto: Array.isArray(data.impacts)
              ? data.impacts.map((u) => u.idImpact)
              : [],
            incidente: Array.isArray(data.incidents)
              ? data.incidents.map((u) => u.idIncident)
              : [],
            kri: Array.isArray(data.krises)
              ? data.krises.map((u) => u.idKri)
              : [],
            normativa: Array.isArray(data.normatives)
              ? data.normatives.map((u) => u.idNormative)
              : [],
            riscoAssociado: Array.isArray(data.riskAssociates)
              ? data.riskAssociates.map((u) => u.idRiskAssociate)
              : [],
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            categoria: data.idCategory || "",
            controle: Array.isArray(data.idControls) ? data.idControls : [],
            framework: Array.isArray(data.idFrameworks)
              ? data.idFrameworks
              : [],
            files: data.files || [],
            processo: Array.isArray(data.idProcesses) ? data.idProcesses : [],
            responsavel: data.idResponsible || "",
            ameaca: Array.isArray(data.idThreats) ? data.idThreats : [],
            tratamento: data.idTreatment || "",
            dataInicioOperacao: data.date ? new Date(data.date) : null,
          }));

          setStatus(data.active);
          setRiscoDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.id) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, authToken]);

  const handleIncidentCreated = (newIncidente) => {
    setIncidentes((prevIncidentes) => [...prevIncidentes, newIncidente]);
    setFormData((prev) => ({
      ...prev,
      incidente: [...prev.incidente, newIncidente.id],
    }));
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const handleControlCreated = (newControle) => {
    setControles((prevControles) => [...prevControles, newControle]);
    setFormData((prev) => ({
      ...prev,
      controle: [...prev.controle, newControle.id],
    }));
  };

  const handleCategoriaCreated = (newCategoria) => {
    setCategorias((prevCategorias) => [...prevCategorias, newCategoria]);
    setFormData((prev) => ({
      ...prev,
      categoria: newCategoria.id,
    }));
  };

  const handleDepartmentCreated = (newDepartamento) => {
    setDepartamentos((prevDepartamentos) => [
      ...prevDepartamentos,
      newDepartamento,
    ]);
    setFormData((prev) => ({
      ...prev,
      departamento: [...prev.departamento, newDepartamento.id],
    }));
  };

  const handleSelectAllPlanoAcao = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.planoAcao.length === planosAcoes.length) {
        // Deselect all
        setFormData({ ...formData, planoAcao: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          planoAcao: planosAcoes.map((planoAcao) => planoAcao.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "planoAcao",
        newValue.map((item) => item.id)
      );
    }
  };

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nome);

    // Verifica e remove o departamento superior se necessário
    const superiorSelecionada = riscoAssociados.find(
      (risco) => risco.id === formData.riscoAssociado
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        riscoAssociado: [],
      }));
    }
  }, [nome, riscoAssociados, formData.riscoAssociado]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.riscoAssociado.length === riscoAssociados.length) {
        // Deselect all
        setFormData({ ...formData, riscoAssociado: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          riscoAssociado: riscoAssociados.map(
            (riscoAssociado) => riscoAssociado.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "riscoAssociado",
        newValue.map((item) => item.id)
      );
    }
  };

  // NEW
  const handleSelectAllFrameworks = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.framework.length === frameworks.length) {
        // Desmarcar todos
        setFormData({ ...formData, framework: [] });
      } else {
        // Selecionar todos
        setFormData({
          ...formData,
          framework: frameworks.map((fw) => fw.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "framework",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllCausas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.causa.length === causas.length) {
        // Deselect all
        setFormData({ ...formData, causa: [] });
      } else {
        // Select all
        setFormData({ ...formData, causa: causas.map((causa) => causa.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "causa",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllImpactos = (event, newValue) => {
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
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllNormativas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normativa.length === normativas.length) {
        // Deselect all
        setFormData({ ...formData, normativa: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          normativa: normativas.map((normativa) => normativa.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "normativa",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllDepartamentos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.departamento.length === departamentos.length) {
        // Deselect all
        setFormData({ ...formData, departamento: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          departamento: departamentos.map((departamento) => departamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "departamento",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllControles = (event, newValue) => {
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
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllKris = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.kri.length === kris.length) {
        // Deselect all
        setFormData({ ...formData, kri: [] });
      } else {
        // Select all
        setFormData({ ...formData, kri: kris.map((kri) => kri.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "kri",
        newValue.map((item) => item.id)
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
        newValue.map((item) => item.id)
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
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllAmeacas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ameaca.length === ameacas.length) {
        // Deselect all
        setFormData({ ...formData, ameaca: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          ameaca: ameacas.map((ameaca) => ameaca.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "ameaca",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllFatores = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.fator.length === fatores.length) {
        // Deselect all
        setFormData({ ...formData, fator: [] });
      } else {
        // Select all
        setFormData({ ...formData, fator: fatores.map((fator) => fator.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "fator",
        newValue.map((item) => item.id)
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
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const [formValidation, setFormValidation] = useState({
    codigo: true,
    nome: true,
    categoria: true,
  });

  const allSelected =
    formData.riscoAssociado.length === riscoAssociados.length &&
    riscoAssociados.length > 0;
  const allSelectedPlanoAcao =
    formData.planoAcao.length === planosAcoes.length && planosAcoes.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedDiretrizes =
    formData.diretriz.length === diretrizes.length && diretrizes.length > 0;
  const allSelectedFatores =
    formData.fator.length === fatores.length && fatores.length > 0;
  const allSelectedIncidente =
    formData.incidente.length === incidentes.length && incidentes.length > 0;
  const allSelectedCausas =
    formData.causa.length === causas.length && causas.length > 0;
  const allSelectedImpactos =
    formData.impacto.length === impactos.length && impactos.length > 0;
  const allSelectedNormativas =
    formData.normativa.length === normativas.length && normativas.length > 0;
  const allSelectedDepartamentos =
    formData.departamento.length === departamentos.length &&
    departamentos.length > 0;
  const allSelectedKris =
    formData.kri.length === kris.length && kris.length > 0;
  const allSelectedControles =
    formData.controle.length === controles.length && controles.length > 0;
  const allSelectedAmeacas =
    formData.ameaca.length === ameacas.length && ameacas.length > 0;

  const allSelectedFrameworks =
    formData.framework.length === frameworks.length && frameworks.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.categoria) {
      setFormValidation((prev) => ({ ...prev, categoria: false }));
      missingFields.push("Categoria");
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

      // --- Lógica de arquivos para riscos (containerFolder 3) ---
      // Se o formData não tiver a propriedade "files", garanta que seja um array
      const riskFiles = formData.files || [];

      // Separe os arquivos novos (instâncias de File) dos já existentes (objetos com URL)
      const newFiles = riskFiles.filter((file) => file instanceof File);
      const existingFiles = riskFiles.filter((file) => !(file instanceof File));

      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 3); // 3 para riscos
        // Em edição, já temos o id do risco; em criação, envia string vazia
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? riscoDados?.idRisk : ""
        );
        newFiles.forEach((file) => {
          formDataUpload.append("Files", file, file.name);
        });

        const uploadResponse = await axios.post(
          "https://api.egrc.homologacao.com.br/api/v1/files/uploads",
          formDataUpload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Espera-se que o endpoint retorne um objeto do tipo { files: [...] }
        uploadFilesResult = uploadResponse.data;
      }

      // Combina os arquivos já existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];

      // Transforma cada item para que o payload contenha somente a URL (string)
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // --- Configuração do payload e endpoint para riscos ---
      if (requisicao === "Criar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/risks";
        method = "POST";
        payload = {
          code: codigo,
          name: nome,
          idCategory: formData.categoria || null,
        };
      } else if (requisicao === "Editar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/risks";
        method = "PUT";
        payload = {
          idRisk: riscoDados?.idRisk,
          code: codigo,
          name: nome,
          description: descricao,
          idActionPlans: formData.planoAcao?.length ? formData.planoAcao : null,
          treatmentDescription: descricaoTratamento,
          date: formData.dataInicioOperacao
            ? formData.dataInicioOperacao.toISOString()
            : null,
          idResponsible: formData.responsavel || null,
          active: status,
          idCategory: formData.categoria || null,
          idFrameworks: formData.framework?.length ? formData.framework : null,
          idTreatment: formData.tratamento || null,
          idRiskAssociates: formData.riscoAssociado?.length
            ? formData.riscoAssociado
            : null,
          idStrategicGuidelines: formData.diretriz?.length
            ? formData.diretriz
            : null,
          idFactors: formData.fator?.length ? formData.fator : null,
          idIncidents: formData.incidente?.length ? formData.incidente : null,
          idCauses: formData.causa?.length ? formData.causa : null,
          idImpacts: formData.impacto?.length ? formData.impacto : null,
          idNormatives: formData.normativa?.length ? formData.normativa : null,
          idDepartments: formData.departamento?.length
            ? formData.departamento
            : null,
          idKrises: formData.kri?.length ? formData.kri : null,
          idProcesses: formData.processo?.length ? formData.processo : null,
          idControls: formData.controle?.length ? formData.controle : null,
          idThreats: formData.ameaca?.length ? formData.ameaca : null,
          files: finalFilesPayload,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
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
        enqueueSnackbar(`Risco ${mensagemFeedback} com sucesso!`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }

      if (requisicao === "Criar" && data.data.idRisk) {
        setRiscoDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Um risco já foi cadastrado com esse código.", {
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
        <Box sx={{ width: '100%', marginTop: 2 }}>
          {/* Seção 1: Informações Básicas */}
          <SectionCard 
            title="Informações Básicas" 
            icon={<InfoIcon color="primary" />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Código *</InputLabel>
                  <TextField
                    onChange={(event) => setCodigo(event.target.value)}
                    fullWidth
                    placeholder="Código do risco"
                    value={codigo}
                    error={!codigo && formValidation.codigo === false}
                    helperText={!codigo && formValidation.codigo === false ? "Campo obrigatório" : ""}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Nome *</InputLabel>
                  <TextField
                    onChange={(event) => setNome(event.target.value)}
                    fullWidth
                    placeholder="Nome do risco"
                    value={nome}
                    error={!nome && formValidation.nome === false}
                    helperText={!nome && formValidation.nome === false ? "Campo obrigatório" : ""}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Categoria principal *{" "}
                    <DrawerCategoria
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onCategoryCreated={handleCategoriaCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    options={categorias}
                    getOptionLabel={(option) => option.nome}
                    value={
                      categorias.find(
                        (categoria) => categoria.id === formData.categoria
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
                        placeholder="Selecione uma categoria"
                        error={
                          !formData.categoria && formValidation.categoria === false
                        }
                        helperText={
                          !formData.categoria && formValidation.categoria === false 
                            ? "Campo obrigatório" 
                            : ""
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {requisicao === "Editar" && (
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>Data de identificação</InputLabel>
                    <DatePicker
                      value={formData.dataInicioOperacao || null}
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          dataInicioOperacao: newValue,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          placeholder: "00/00/0000",
                          fullWidth: true,
                        },
                      }}
                    />
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Descrição</InputLabel>
                  <TextField
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Descreva o risco detalhadamente"
                    value={descricao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveis.find(
                        (responsavel) => responsavel.id === formData.responsavel
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        responsavel: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Selecione um responsável"
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6} mt={1}>
                <Stack spacing={1}>
                  <InputLabel>Status</InputLabel>
                  <Stack direction="row" alignItems="center" spacing={1} >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>{status ? "Ativo" : "Inativo"}</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </SectionCard>

          {requisicao === "Editar" && (
            <>
              {/* Seção 2: Análise de Risco */}
              <SectionCard 
                title="Análise de Risco" 
                icon={<AssessmentIcon color="primary" />}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Causas</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...causas]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.causa.map(
                          (id) => causas.find((causa) => causa.id === id) || id
                        )}
                        onChange={handleSelectAllCausas}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedCausas : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Impactos</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...impactos]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.impacto.map(
                          (id) => impactos.find((impacto) => impacto.id === id) || id
                        )}
                        onChange={handleSelectAllImpactos}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedImpactos : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Ameaças</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todas" }, ...ameacas]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.ameaca.map(
                          (id) => ameacas.find((ameaca) => ameaca.id === id) || id
                        )}
                        onChange={handleSelectAllAmeacas}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedAmeacas : selected
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
                          <TextField {...params}/>
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Fatores</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...fatores]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.fator.map(
                          (id) => fatores.find((fator) => fator.id === id) || id
                        )}
                        onChange={handleSelectAllFatores}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedFatores : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Incidentes{" "}
                        <DrawerIncidente
                          buttonSx={{
                            marginLeft: 1.5,
                            height: "20px",
                            minWidth: "20px",
                          }}
                          onIncidentCreated={handleIncidentCreated}
                        />
                      </InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...incidentes]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.incidente.map(
                          (id) => incidentes.find((incidente) => incidente.id === id) || id
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
                                    option.id === "all" ? allSelectedIncidente : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Seção 3: Tratamento e Controle */}
              <SectionCard 
                title="Tratamento e Controle" 
                icon={<SecurityIcon color="primary" />}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Tratamento</InputLabel>
                      <Autocomplete
                        options={tratamentos}
                        getOptionLabel={(option) => option.nome}
                        value={
                          tratamentos.find(
                            (tratamento) => tratamento.id === formData.tratamento
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            tratamento: newValue ? newValue.id : "",
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Selecione um tratamento" />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Plano de ação{" "}
                        <DrawerPlanos
                          buttonSx={{
                            marginLeft: 1.5,
                            height: "20px",
                            minWidth: "20px",
                          }}
                          onPlansCreated={handlePlanCreated}
                        />
                      </InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...planosAcoes]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.planoAcao.map(
                          (id) => planosAcoes.find((planoAcao) => planoAcao.id === id) || id
                        )}
                        onChange={handleSelectAllPlanoAcao}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedPlanoAcao : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>Descrição do tratamento</InputLabel>
                      <TextField
                        onChange={(event) => setDescricaoTratamento(event.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Descreva como o risco será tratado"
                        value={descricaoTratamento}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Controles{" "}
                        <DrawerControle
                          buttonSx={{
                            marginLeft: 1.5,
                            height: "20px",
                            minWidth: "20px",
                          }}
                          onControlCreated={handleControlCreated}
                        />
                      </InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...controles]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.controle.map(
                          (id) => controles.find((controle) => controle.id === id) || id
                        )}
                        onChange={handleSelectAllControles}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedControles : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>KRI</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...kris]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.kri.map(
                          (id) => kris.find((kri) => kri.id === id) || id
                        )}
                        onChange={handleSelectAllKris}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedKris : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Seção 4: Governança e Compliance */}
              <SectionCard 
                title="Governança e Compliance" 
                icon={<AccountBalanceIcon color="primary" />}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Frameworks</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...frameworks]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.framework.map(
                          (id) => frameworks.find((fw) => fw.id === id) || id
                        )}
                        onChange={handleSelectAllFrameworks}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedFrameworks : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Diretrizes estratégicas</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...diretrizes]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.diretriz.map(
                          (id) => diretrizes.find((diretriz) => diretriz.id === id) || id
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
                                    option.id === "all" ? allSelectedDiretrizes : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Normativas</InputLabel>
                      <Autocomplete
                        multiple
                        disabled
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...normativas]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.normativa.map(
                          (id) => normativas.find((normativa) => normativa.id === id) || id
                        )}
                        onChange={handleSelectAllNormativas}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedNormativas : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Processos{" "}
                        <DrawerProcesso
                          buttonSx={{
                            marginLeft: 1.5,
                            height: "20px",
                            minWidth: "20px",
                          }}
                          onProcessCreated={handleProcessCreated}
                        />
                      </InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todas" }, ...processos]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.processo.map(
                          (id) => processos.find((processo) => processo.id === id) || id
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
                                    option.id === "all" ? allSelected2 : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Departamentos{" "}
                        <DrawerDepartamento
                          buttonSx={{
                            marginLeft: 1.5,
                            height: "20px",
                            minWidth: "20px",
                          }}
                          onDepartmentCreated={handleDepartmentCreated}
                        />
                      </InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: "all", nome: "Selecionar todos" }, ...departamentos]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.departamento.map(
                          (id) => departamentos.find((departamento) => departamento.id === id) || id
                        )}
                        onChange={handleSelectAllDepartamentos}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelectedDepartamentos : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Seção 5: Relacionamentos */}
              <SectionCard 
                title="Relacionamentos" 
                icon={<LinkIcon color="primary" />}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>Risco Associado</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[
                          { id: "all", nome: "Selecionar todos" },
                          ...riscoAssociados.filter((risco) => {
                            const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();
                            return formatarNome(risco.nome) !== formatarNome(nome);
                          }),
                        ]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.riscoAssociado.map(
                          (id) => riscoAssociados.find((r) => r.id === id)
                        ).filter(Boolean)}
                        onChange={handleSelectAll}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={
                                    option.id === "all" ? allSelected : selected
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
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>Anexos</InputLabel>
                      <FileUploader
                        containerFolder={1}
                        initialFiles={formData.files}
                        onFilesChange={(files) =>
                          setFormData((prev) => ({ ...prev, files }))
                        }
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>
            </>
          )}

          {/* Botões de ação */}
          <Paper sx={{ p: 3, mt: 3, backgroundColor: 'grey.50' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-start">
              <Button
                variant="contained"
                color="primary"
                onClick={tratarSubmit}
                sx={{
                  minWidth: 120,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {requisicao === "Criar" ? "Criar Risco" : "Atualizar"}
              </Button>
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{
                  minWidth: 120,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* Dialog de sucesso mantido do original */}
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
            Risco Criado com Sucesso!
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{ fontSize: "16px", color: "#555", px: 2 }}
            >
              O risco foi cadastrado com sucesso. Você pode voltar para a
              listagem ou adicionar mais informações a esse risco.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
          >
            <Button
              onClick={() => {
                setSuccessDialogOpen(false);
                voltarParaCadastroMenu();
              }}
              variant="outlined"
              sx={{
                borderColor: "#007bff",
                color: "#007bff",
                fontWeight: 600,
              }}
            >
              Voltar para Listagem
            </Button>
            <Button
              onClick={() => {
                setRequisicao("Editar");
                setSuccessDialogOpen(false);
              }}
              variant="contained"
              sx={{
                backgroundColor: "#007bff",
                fontWeight: 600,
              }}
            >
              Continuar Editando
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayoutsCorrigido;

