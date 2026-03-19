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
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
} from "@mui/material";
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerDepartamento";
import DrawerRisco from "../configuracoes/novoRiscoDrawerDepartamento";
import DrawerIncidente from "../configuracoes/novoIncidenteDrawerDepartamento";
import DrawerPlanos from "../configuracoes/novoPlanoDrawerDepartamento";
import FileUploader from "../configuracoes/FileUploader";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [responsaveis, setResponsavel] = useState([]);
  const [departamentosInferiores, setDepartamentosInferiores] = useState([]);
  const [departamentosLateral, setDepartamentosLaterais] = useState([]);
  const [departamentosSuperiores, setDepartamentosSuperiores] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState([]);
  const [formatosUnidades, setFormatoUnidades] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [dados, setDados] = useState([]);
  const [normativas, setNormativas] = useState([]);
  const [planosAcao, setPlanosAcao] = useState([]);
  const [nomeDepartamento, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [temporario, setTemporario] = useState(false);
  const [colegiada, setColegiada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [departamentoDados, setDepartamentosDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  // --- ESTADOS DOS FILTROS EM CASCATA ---
  const [riscosFiltrados, setRiscosFiltrados] = useState([]);
  const [normativasFiltradas, setNormativasFiltradas] = useState([]);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [incidentesFiltrados, setIncidentesFiltrados] = useState([]);
  
  const [riscoOrigemMap, setRiscoOrigemMap] = useState({});
  const [normativaOrigemMap, setNormativaOrigemMap] = useState({});
  const [dadoOrigemMap, setDadoOrigemMap] = useState({});
  const [incidenteOrigemMap, setIncidenteOrigemMap] = useState({});

  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  // --------------------------------------

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    departamentoLateral: [],
    tipoResponsabilidade: [],
    planoAcao: [],
    normativa: [],
    formatoUnidade: [],
    departamentoSuperior: "",
    processo: [],
    dado: [],
    files: [],
    risco: [],
    incidente: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchDepartamentosDados = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}departments/${dadosApi.idDepartment}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
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
          setTemporario(data.temporary);
          setColegiada(data.collegiate);
          setFormData((prev) => ({
            ...prev,
            files: data.files || [],
            departamentoInferior: Array.isArray(data.departmentBottoms)
              ? data.departmentBottoms.map((u) => u.idDepartmentBottom)
              : [],
            departamentoLateral: Array.isArray(data.departmentSides)
              ? data.departmentSides.map((u) => u.idDepartmentSide)
              : [],
            departamentoSuperior: data.idDepartmentSuperior || null,
            normativa: data.idNormatives || [],
            risco: data.idRisks || [],
            processo: data.idProcesses || [],
            tipoResponsabilidade: data.idResponsabilityType || null,
            formatoUnidade: data.idUnitFormat || null,
            incidente: data.idIncidents || [],
            planoAcao: data.idActionPlans || [],
            dado: data.idLgpds || [],
            responsavel: data.idResponsible || null,
          }));

          setDepartamentosDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
          setLoading(false);
        }
      };

      if (dadosApi.idDepartment) {
        fetchDepartamentosDados();
      }
    }
  }, [dadosApi, token]);

  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}departments`, setDepartamentosInferiores);
    fetchData(`${process.env.REACT_APP_API_URL}departments`, setDepartamentosLaterais);
    fetchData(`${process.env.REACT_APP_API_URL}departments`, setDepartamentosSuperiores);
    fetchData(`${process.env.REACT_APP_API_URL}risks`, setRiscos);
    fetchData(`${process.env.REACT_APP_API_URL}processes`, setProcessos);
    fetchData(`${process.env.REACT_APP_API_URL}departments/responsability-types`, setTiposResponsabilidades);
    fetchData(`${process.env.REACT_APP_API_URL}departments/unit-formats`, setFormatoUnidades);
    fetchData(`${process.env.REACT_APP_API_URL}collaborators/responsibles`, setResponsavel);
    fetchData(`${process.env.REACT_APP_API_URL}incidents`, setIncidentes);
    fetchData(`${process.env.REACT_APP_API_URL}datas`, setDados);
    fetchData(`${process.env.REACT_APP_API_URL}normatives`, setNormativas);
    fetchData(`${process.env.REACT_APP_API_URL}action-plans`, setPlanosAcao);
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados
      const transformedData = response.data.map((item) => ({
        id:
          item.idCompany ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idDepartment ||
          item.idRisk ||
          item.idIncident ||
          item.idUnitFormat ||
          item.idActionPlan ||
          item.idResponsabilityType ||
          item.idCollaborator ||
          item.idLgpd ||
          item.idNormative ||
          item.id,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeDepartamento);

    const superiorSelecionada = departamentosSuperiores.find(
      (departamento) => departamento.id === formData.departamentoSuperior
    );
    if (superiorSelecionada && formatarNome(superiorSelecionada.nome) === nomeDigitado) {
      setFormData((prev) => ({ ...prev, departamentoSuperior: null }));
    }

    const inferioresAtualizadas = formData.departamentoInferior.filter((id) => {
      const departamentoInferior = departamentosInferiores.find((departamento) => departamento.id === id);
      if (!departamentoInferior) return false;
      return formatarNome(departamentoInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.departamentoInferior.length) {
      setFormData((prev) => ({ ...prev, departamentoInferior: inferioresAtualizadas }));
    }

    const lateraisAtualizadas = formData.departamentoLateral.filter((id) => {
      const departamentoLateral = departamentosLateral.find((departamento) => departamento.id === id);
      if (!departamentoLateral) return false;
      return formatarNome(departamentoLateral.nome) !== nomeDigitado;
    });
    if (lateraisAtualizadas.length !== formData.departamentoLateral.length) {
      setFormData((prev) => ({ ...prev, departamentoLateral: lateraisAtualizadas }));
    }
  }, [
    nomeDepartamento,
    departamentosSuperiores,
    departamentosInferiores,
    departamentosLateral,
    formData.departamentoSuperior,
    formData.departamentoInferior,
    formData.departamentoLateral,
  ]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "departamentoSuperior") {
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // --- EFEITO 1: PROCESSO FILTRA RISCO, NORMATIVA E DADO ---
  useEffect(() => {
    const atualizarDependentesDeProcesso = async () => {
      if (formData.processo.length === 0) {
        setRiscosFiltrados(riscos);
        setNormativasFiltradas(normativas);
        setDadosFiltrados(dados);
        setRiscoOrigemMap({});
        setNormativaOrigemMap({});
        setDadoOrigemMap({});
        return;
      }

      const idsRiscoPermitidos = new Set();
      const idsNormativaPermitidos = new Set();
      const idsDadoPermitidos = new Set();
      const novoMapaRisco = {};
      const novoMapaNormativa = {};
      const novoMapaDado = {};

      const promises = formData.processo.map((id) =>
        axios.get(`${process.env.REACT_APP_API_URL}processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      try {
        const results = await Promise.all(promises);
        results.forEach((res) => {
          const nomeProc = res.data.name;

          // Processa Riscos
          const proRiscos = res.data.risks || res.data.idRisks || [];
          proRiscos.forEach((r) => {
            const idRisco = typeof r === "object" ? r.idRisk || r.id : r;
            if (idRisco) {
              idsRiscoPermitidos.add(idRisco);
              if (!novoMapaRisco[idRisco]) novoMapaRisco[idRisco] = [];
              if (!novoMapaRisco[idRisco].includes(nomeProc)) novoMapaRisco[idRisco].push(nomeProc);
            }
          });

          // Processa Normativas
          const proNorms = res.data.normatives || res.data.idNormatives || [];
          proNorms.forEach((n) => {
            const idNorm = typeof n === "object" ? n.idNormative || n.id : n;
            if (idNorm) {
              idsNormativaPermitidos.add(idNorm);
              if (!novoMapaNormativa[idNorm]) novoMapaNormativa[idNorm] = [];
              if (!novoMapaNormativa[idNorm].includes(nomeProc)) novoMapaNormativa[idNorm].push(nomeProc);
            }
          });

          // Processa Dados
          const proDados = res.data.lgpds || res.data.datas || res.data.idLgpds || res.data.idDatas || [];
          proDados.forEach((d) => {
            const idDado = typeof d === "object" ? d.idLgpd || d.idData || d.id : d;
            if (idDado) {
              idsDadoPermitidos.add(idDado);
              if (!novoMapaDado[idDado]) novoMapaDado[idDado] = [];
              if (!novoMapaDado[idDado].includes(nomeProc)) novoMapaDado[idDado].push(nomeProc);
            }
          });
        });

        // Função de segurança rigorosa para identificar itens órfãos 
        // caso o backend retorne o campo, mas ele esteja vazio.
        const isOrphan = (item, keys) => {
          let hasField = false;
          for (const key of keys) {
            if (item[key] !== undefined) {
              hasField = true;
              if (Array.isArray(item[key]) && item[key].length > 0) return false;
            }
          }
          return hasField; 
        };

        setRiscosFiltrados(
          riscos.filter((r) => idsRiscoPermitidos.has(r.id) || isOrphan(r, ['processes', 'idProcesses']))
        );
        setNormativasFiltradas(
          normativas.filter((n) => idsNormativaPermitidos.has(n.id) || isOrphan(n, ['processes', 'idProcesses']))
        );
        setDadosFiltrados(
          dados.filter((d) => idsDadoPermitidos.has(d.id) || isOrphan(d, ['processes', 'idProcesses']))
        );

        setRiscoOrigemMap(novoMapaRisco);
        setNormativaOrigemMap(novoMapaNormativa);
        setDadoOrigemMap(novoMapaDado);
      } catch (e) {
        console.error("Erro ao buscar dependências de processo:", e);
      }
    };

    if (riscos.length > 0 || normativas.length > 0 || dados.length > 0) {
      atualizarDependentesDeProcesso();
    }
  }, [formData.processo, riscos, normativas, dados, token]);


  // --- EFEITO 2: RISCO FILTRA INCIDENTE ---
  useEffect(() => {
    const atualizarIncidentes = async () => {
      if (formData.risco.length === 0) {
        setIncidentesFiltrados(incidentes);
        setIncidenteOrigemMap({});
        return;
      }

      const idsIncidentePermitidos = new Set();
      const novoMapaIncidente = {};

      const promises = formData.risco.map((id) =>
        axios.get(`${process.env.REACT_APP_API_URL}risks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      try {
        const results = await Promise.all(promises);
        results.forEach((res) => {
          const nomeRisco = res.data.name;
          // Pega diretamente a key 'incidents' ou 'idIncidents' que retornam do backend
          const incs = res.data.incidents || res.data.idIncidents || [];
          incs.forEach((i) => {
            const idInc = typeof i === "object" ? i.idIncident || i.id : i;
            if (idInc) {
              idsIncidentePermitidos.add(idInc);
              if (!novoMapaIncidente[idInc]) novoMapaIncidente[idInc] = [];
              if (!novoMapaIncidente[idInc].includes(nomeRisco)) novoMapaIncidente[idInc].push(nomeRisco);
            }
          });
        });

        // Mesmo isolamento rigoroso de órfãos para os incidentes
        const isOrphan = (item, keys) => {
          let hasField = false;
          for (const key of keys) {
            if (item[key] !== undefined) {
              hasField = true;
              if (Array.isArray(item[key]) && item[key].length > 0) return false;
            }
          }
          return hasField; 
        };

        setIncidentesFiltrados(
          incidentes.filter((i) => idsIncidentePermitidos.has(i.id) || isOrphan(i, ['risks', 'idRisks']))
        );
        setIncidenteOrigemMap(novoMapaIncidente);
      } catch (e) {
        console.error("Erro ao buscar dependências de risco:", e);
      }
    };

    if (incidentes.length > 0) {
      atualizarIncidentes();
    }
  }, [formData.risco, incidentes, token]);

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const handleRiskCreated = (newRisco) => {
    setRiscos((prevRiscos) => [...prevRiscos, newRisco]);
    setFormData((prev) => ({
      ...prev,
      risco: [...prev.risco, newRisco.id],
    }));
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidentes((prevIncidents) => [...prevIncidents, newIncident]);
    setFormData((prev) => ({
      ...prev,
      incidente: [...prev.incidente, newIncident.id],
    }));
  };

  const handlePlanCreated = (newPlan) => {
    setPlanosAcao((prevPlans) => [...prevPlans, newPlan]);
    setFormData((prev) => ({
      ...prev,
      planoAcao: [...prev.planoAcao, newPlan.id],
    }));
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      const filteredInferiores = departamentosInferiores.filter((departamento) => {
        const superiorId = formData.departamentoSuperior;
        const lateralIds = formData.departamentoLateral || [];
        return (
          departamento.id !== superiorId &&
          !lateralIds.includes(departamento.id) &&
          formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
        );
      });
      if (formData.departamentoInferior.length === filteredInferiores.length) {
        setFormData({ ...formData, departamentoInferior: [] });
      } else {
        setFormData({
          ...formData,
          departamentoInferior: filteredInferiores.map((departamento) => departamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral("departamentoInferior", newValue.map((item) => item.id));
    }
  };

  const handleSelectDepartamentoLateral = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      const filteredLaterais = departamentosLateral.filter((departamento) => {
        const superiorId = formData.departamentoSuperior;
        const inferiorIds = formData.departamentoInferior || [];
        return (
          departamento.id !== superiorId &&
          !inferiorIds.includes(departamento.id) &&
          formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
        );
      });
      if (formData.departamentoLateral.length === filteredLaterais.length) {
        setFormData({ ...formData, departamentoLateral: [] });
      } else {
        setFormData({
          ...formData,
          departamentoLateral: filteredLaterais.map((departamento) => departamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral("departamentoLateral", newValue.map((item) => item.id));
    }
  };

  // --- HANDLERS COM INTERCEPTAÇÃO E AVISO ---
  const handleSelectAllProcessos = (event, newValue) => {
    let novosIds = [];
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) novosIds = [];
      else novosIds = processos.map((p) => p.id);
    } else {
      novosIds = newValue.map((item) => item.id);
    }

    if (
      formData.processo.length === 0 &&
      novosIds.length > 0 &&
      (formData.risco.length > 0 || formData.normativa.length > 0 || formData.dado.length > 0)
    ) {
      setPendingAction({ type: "processo", ids: novosIds });
      setWarningDialogOpen(true);
      return;
    }
    tratarMudancaInputGeral("processo", novosIds);
  };

  const handleSelectAllRiscos = (event, newValue) => {
    let novosIds = [];
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.risco.length === riscosFiltrados.length) novosIds = [];
      else novosIds = riscosFiltrados.map((r) => r.id);
    } else {
      novosIds = newValue.map((item) => item.id);
    }

    if (formData.risco.length === 0 && novosIds.length > 0 && formData.incidente.length > 0) {
      setPendingAction({ type: "risco", ids: novosIds });
      setWarningDialogOpen(true);
      return;
    }
    tratarMudancaInputGeral("risco", novosIds);
  };

  const confirmarMudancaFiltro = () => {
    if (pendingAction.type === "processo") {
      setFormData((prev) => ({
        ...prev,
        processo: pendingAction.ids,
        risco: [],
        normativa: [],
        dado: [],
        incidente: [],
      }));
    } else if (pendingAction.type === "risco") {
      setFormData((prev) => ({
        ...prev,
        risco: pendingAction.ids,
        incidente: [],
      }));
    }
    setWarningDialogOpen(false);
    setPendingAction(null);
  };

  const handleSelectAllIncidentes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.incidente.length === incidentesFiltrados.length) {
        setFormData({ ...formData, incidente: [] });
      } else {
        setFormData({ ...formData, incidente: incidentesFiltrados.map((incidente) => incidente.id) });
      }
    } else {
      tratarMudancaInputGeral("incidente", newValue.map((item) => item.id));
    }
  };

  const handleSelectAllDados = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.dado.length === dadosFiltrados.length) {
        setFormData({ ...formData, dado: [] });
      } else {
        setFormData({ ...formData, dado: dadosFiltrados.map((dado) => dado.id) });
      }
    } else {
      tratarMudancaInputGeral("dado", newValue.map((item) => item.id));
    }
  };

  const handleSelectAllNormativas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normativa.length === normativasFiltradas.length) {
        setFormData({ ...formData, normativa: [] });
      } else {
        setFormData({ ...formData, normativa: normativasFiltradas.map((normativa) => normativa.id) });
      }
    } else {
      tratarMudancaInputGeral("normativa", newValue.map((item) => item.id));
    }
  };

  const handleSelectAllPlanos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.planoAcao.length === planosAcao.length) {
        setFormData({ ...formData, planoAcao: [] });
      } else {
        setFormData({ ...formData, planoAcao: planosAcao.map((planoAcao) => planoAcao.id) });
      }
    } else {
      tratarMudancaInputGeral("planoAcao", newValue.map((item) => item.id));
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const [formValidation, setFormValidation] = useState({
    nomeDepartamento: true,
    codigo: true,
  });

  const allSelected =
    formData.departamentoInferior.length === departamentosInferiores.length &&
    departamentosInferiores.length > 0;
  const allSelectedDepartamentoLateral =
    formData.departamentoLateral.length === departamentosLateral.length &&
    departamentosLateral.length > 0;
  
  const allSelectedProcessos =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedRiscos =
    formData.risco.length === riscosFiltrados.length && riscosFiltrados.length > 0;
  const allSelectedIncidentes =
    formData.incidente.length === incidentesFiltrados.length && incidentesFiltrados.length > 0;
  const allSelectedDados =
    formData.dado.length === dadosFiltrados.length && dadosFiltrados.length > 0;
  const allSelectedNormativas =
    formData.normativa.length === normativasFiltradas.length && normativasFiltradas.length > 0;
  
  const allSelectedPlanos =
    formData.planoAcao.length === planosAcao.length && planosAcao.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeDepartamento.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeDepartamento: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
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
      return;
    }

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter((file) => !(file instanceof File));

    let uploadFilesResult = { files: [] };
    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", 2);
      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? departamentoDados?.idDepartment : ""
      );
      newFiles.forEach((file) => {
        formDataUpload.append("Files", file, file.name);
      });

      const uploadResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}files/uploads`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      uploadFilesResult = uploadResponse.data;
    }

    const finalFiles = [...existingFiles, ...uploadFilesResult.files];

    const finalFilesPayload = finalFiles.map((file) => {
      if (typeof file === "string") return file;
      if (file.path) return file.path;
      return file;
    });

    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}departments`;
      method = "POST";
      payload = {
        name: nomeDepartamento,
        code: codigo,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}departments`;
      method = "PUT";
      payload = {
        idDepartment: departamentoDados?.idDepartment,
        active: true,
        name: nomeDepartamento,
        code: codigo,
        temporary: temporario,
        collegiate: colegiada,
        description: descricao,
        files: finalFilesPayload,
        idNormatives: formData.normativa?.length ? formData.normativa : null,
        idLgpds: formData.dado?.length ? formData.dado : null,
        idResponsible: formData.responsavel === "" ? null : formData.responsavel,
        idDepartmentSuperior: formData.departamentoSuperior?.length ? formData.departamentoSuperior : null,
        idDepartmentBottoms: formData.departamentoInferior?.length ? formData.departamentoInferior : null,
        idDepartmentSides: formData.departamentoLateral?.length ? formData.departamentoLateral : null,
        idIncidents: formData.incidente?.length ? formData.incidente : null,
        idUnitFormat: formData.formatoUnidade?.length ? formData.formatoUnidade : null,
        idRisks: formData.risco?.length ? formData.risco : null,
        idResponsabilityType: formData.tipoResponsabilidade?.length ? formData.tipoResponsabilidade : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idActionPlans: formData.planoAcao?.length ? formData.planoAcao : null,
      };
    }

    try {
      setLoading(true);

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
        throw new Error("Não foi possível cadastrar o Departamento.");
      } else {
        enqueueSnackbar(`Departamento ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idDepartment) {
        setDepartamentosDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      setLoading(false);
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse departamento.", {
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
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
                placeholder="Código do departamento"
                value={codigo}
                error={!codigo && formValidation.codigo === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nomeDepartamento}
                error={!nomeDepartamento && formValidation.nomeDepartamento === false}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição</InputLabel>
                  <TextField
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipos de Responsabilidade</InputLabel>
                  <Autocomplete
                    options={tiposResponsabilidades}
                    getOptionLabel={(option) => option.nome || ""}
                    value={
                      tiposResponsabilidades.find(
                        (tipoResponsabilidade) => tipoResponsabilidade.id === formData.tipoResponsabilidade
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoResponsabilidade: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!formData.tipoResponsabilidade && formValidation.tipoResponsabilidade === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Formato de Unidade</InputLabel>
                  <Autocomplete
                    options={formatosUnidades}
                    getOptionLabel={(option) => option.nome || ""}
                    value={
                      formatosUnidades.find(
                        (formatoUnidade) => formatoUnidade.id === formData.formatoUnidade
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        formatoUnidade: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!formData.formatoUnidade && formValidation.formatoUnidade === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Departamento superior</InputLabel>
                  <Autocomplete
                    options={departamentosSuperiores.filter((departamento) => {
                      const selectedInferior = formData.departamentoInferior || [];
                      const selectedLateral = formData.departamentoLateral || [];
                      const selectedIds = [...selectedInferior, ...selectedLateral];

                      if (formData.departamentoSuperior === departamento.id) return true;

                      return (
                        !selectedIds.includes(departamento.id) &&
                        formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
                      );
                    })}
                    getOptionLabel={(option) => option.nome || ""}
                    value={
                      departamentosSuperiores.find(
                        (departamento) => departamento.id === formData.departamentoSuperior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => {
                        const updatedInferior = prev.departamentoInferior.filter((id) =>
                          newValue ? id !== newValue.id : true
                        );
                        return {
                          ...prev,
                          departamentoSuperior: newValue ? newValue.id : "",
                          departamentoInferior: updatedInferior,
                        };
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!formData.departamentoSuperior && formValidation.departamentoSuperior === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Departamentos Inferiores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...departamentosInferiores.filter((departamento) => {
                        const superiorId = formData.departamentoSuperior;
                        const lateralIds = formData.departamentoLateral || [];

                        if (formData.departamentoInferior.includes(departamento.id)) return true;

                        return (
                          departamento.id !== superiorId &&
                          !lateralIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.departamentoInferior
                      .map((id) => departamentosInferiores.find((departamento) => departamento.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAll}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox checked={option.id === "all" ? allSelected : selected} />
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
                          (formData.departamentoInferior.length === 0 ||
                            formData.departamentoInferior.every((val) => val === 0)) &&
                          formValidation.departamentoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Departamentos Laterais</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...departamentosLateral.filter((departamento) => {
                        const superiorId = formData.departamentoSuperior;
                        const inferiorIds = formData.departamentoInferior || [];

                        if (formData.departamentoLateral.includes(departamento.id)) return true;

                        return (
                          departamento.id !== superiorId &&
                          !inferiorIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.departamentoLateral
                      .map((id) => departamentosLateral.find((departamento) => departamento.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectDepartamentoLateral}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox checked={option.id === "all" ? allSelectedDepartamentoLateral : selected} />
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
                          (formData.departamentoLateral.length === 0 ||
                            formData.departamentoLateral.every((val) => val === 0)) &&
                          formValidation.departamentoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: PROCESSOS */}
              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Processos{" "}
                    <DrawerProcesso
                      buttonSx={{ marginLeft: 1.5, height: "20px", minWidth: "20px" }}
                      onProcessCreated={handleProcessCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={processos.length > 0 ? [{ id: "all", nome: "Selecionar todas" }, ...processos] : []}
                    noOptionsText="Nenhum processo encontrado"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.processo
                      .map((id) => processos.find((processo) => processo.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllProcessos}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox checked={option.id === "all" ? allSelectedProcessos : selected} />
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
                          (formData.processo.length === 0 || formData.processo.every((val) => val === 0)) &&
                          formValidation.processo === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: RISCOS */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Risco{" "}
                    <DrawerRisco
                      buttonSx={{ marginLeft: 1.5, height: "20px", minWidth: "20px" }}
                      onRiscoCreated={handleRiskCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={riscosFiltrados.length > 0 ? [{ id: "all", nome: "Selecionar todas" }, ...riscosFiltrados] : []}
                    noOptionsText="Nenhum risco encontrado"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.risco
                      .map((id) => riscos.find((risco) => risco.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllRiscos}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => {
                      const origens = riscoOrigemMap[option.id] ? riscoOrigemMap[option.id].join(", ") : "";
                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={option.id === "all" ? allSelectedRiscos : selected} />
                            </Grid>
                            <Grid item xs>
                              <Typography variant="body1">{option.nome}</Typography>
                              {option.id !== "all" && origens && (
                                <Typography variant="caption" display="block" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                  Processo(s): {origens}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.risco.length === 0 || formData.risco.every((val) => val === 0)) &&
                          formValidation.risco === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: INCIDENTES */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Incidente{" "}
                    <DrawerIncidente
                      buttonSx={{ marginLeft: 1.5, height: "20px", minWidth: "20px" }}
                      onIncidentCreated={handleIncidentCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={incidentesFiltrados.length > 0 ? [{ id: "all", nome: "Selecionar todas" }, ...incidentesFiltrados] : []}
                    noOptionsText="Nenhum incidente encontrado"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.incidente
                      .map((id) => incidentes.find((incidente) => incidente.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllIncidentes}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => {
                      const origens = incidenteOrigemMap[option.id] ? incidenteOrigemMap[option.id].join(", ") : "";
                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={option.id === "all" ? allSelectedIncidentes : selected} />
                            </Grid>
                            <Grid item xs>
                              <Typography variant="body1">{option.nome}</Typography>
                              {option.id !== "all" && origens && (
                                <Typography variant="caption" display="block" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                  Risco(s): {origens}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.incidente.length === 0 || formData.incidente.every((val) => val === 0)) &&
                          formValidation.incidente === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: NORMATIVAS */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Normativas</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={normativasFiltradas.length > 0 ? [{ id: "all", nome: "Selecionar todas" }, ...normativasFiltradas] : []}
                    noOptionsText="Nenhuma normativa encontrada"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.normativa
                      .map((id) => normativas.find((normativa) => normativa.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllNormativas}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => {
                      const origens = normativaOrigemMap[option.id] ? normativaOrigemMap[option.id].join(", ") : "";
                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={option.id === "all" ? allSelectedNormativas : selected} />
                            </Grid>
                            <Grid item xs>
                              <Typography variant="body1">{option.nome}</Typography>
                              {option.id !== "all" && origens && (
                                <Typography variant="caption" display="block" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                  Processo(s): {origens}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.normativa.length === 0 || formData.normativa.every((val) => val === 0)) &&
                          formValidation.normativa === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: DADOS */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Dados</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={dadosFiltrados.length > 0 ? [{ id: "all", nome: "Selecionar todos" }, ...dadosFiltrados] : []}
                    noOptionsText="Nenhum dado encontrado"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.dado
                      .map((id) => dados.find((dado) => dado.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllDados}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => {
                      const origens = dadoOrigemMap[option.id] ? dadoOrigemMap[option.id].join(", ") : "";
                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={option.id === "all" ? allSelectedDados : selected} />
                            </Grid>
                            <Grid item xs>
                              <Typography variant="body1">{option.nome}</Typography>
                              {option.id !== "all" && origens && (
                                <Typography variant="caption" display="block" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                  Processo(s): {origens}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.dado.length === 0 || formData.dado.every((val) => val === 0)) &&
                          formValidation.dado === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* AUTOCOMPLETE: PLANO DE AÇÃO */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Plano de ação{" "}
                    <DrawerPlanos
                      buttonSx={{ marginLeft: 1.5, height: "20px", minWidth: "20px" }}
                      onPlansCreated={handlePlanCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={planosAcao.length > 0 ? [{ id: "all", nome: "Selecionar todos" }, ...planosAcao] : []}
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.planoAcao
                      .map((id) => planosAcao.find((plano) => plano.id === id))
                      .filter(Boolean)}
                    onChange={handleSelectAllPlanos}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox checked={option.id === "all" ? allSelectedPlanos : selected} />
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
                          (formData.planoAcao.length === 0 || formData.planoAcao.every((val) => val === 0)) &&
                          formValidation.planoAcao === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} style={{ marginLeft: 25, marginTop: 35.5 }}>
                    <Switch checked={temporario} onChange={(event) => setTemporario(event.target.checked)} />
                    <Typography>{"Temporário"}</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={4}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} style={{ marginLeft: 15, marginTop: 35.5 }}>
                    <Switch checked={colegiada} onChange={(event) => setColegiada(event.target.checked)} />
                    <Typography>{"Colegiada"}</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome || ""}
                    value={
                      responsaveis.find((responsavel) => responsavel.id === formData.responsavel) || null
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
                        error={!formData.responsavel && formValidation.responsavel === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={2}
                    initialFiles={formData.files}
                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, files }))}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: "8px", marginRight: "20px", marginTop: 5 }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: "91px", height: "32px", borderRadius: "4px", fontSize: "14px", fontWeight: 600 }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
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
            <DialogTitle sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}>
              Departamento Criado com Sucesso!
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ fontSize: "16px", color: "#555", px: 2 }}>
                O departamento foi cadastrado com sucesso. Você pode voltar para a listagem ou adicionar mais informações a esse departamento.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}>
              <Button
                onClick={voltarParaListagem}
                variant="outlined"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "rgba(0, 123, 255, 0.1)" },
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
                  "&:hover": { backgroundColor: "#0056b3" },
                }}
                autoFocus
              >
                Adicionar mais informações
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de Aviso de Filtro */}
          <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)}>
            <DialogTitle sx={{ fontWeight: 600 }}>{"Alteração de filtro"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Ao alterar a seleção de {pendingAction?.type === "processo" ? "Processos" : "Riscos"}, a lista de dependentes será filtrada e exibirá apenas correspondências válidas.
                <br /><br />
                <strong>Os dependentes vinculados que não corresponderem à nova seleção serão removidos.</strong>
                <br /><br />
                Deseja continuar?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setWarningDialogOpen(false)} color="primary">Cancelar</Button>
              <Button onClick={confirmarMudancaFiltro} color="error" variant="contained" autoFocus>
                Limpar Seleções Incompatíveis
              </Button>
            </DialogActions>
          </Dialog>

        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;