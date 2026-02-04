/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
import DrawerEmpresa from "../configuracoes/novaEmpresaDrawerProcessos";
import DrawerDepartamento from "../configuracoes/novoDepartamentoDrawerProcesso";
import DrawerRisco from "../configuracoes/novoRiscoDrawerProcessos";
import DrawerDado from "../configuracoes/novoDadoDrawerProcessos";
import DrawerConta from "../configuracoes/novaContaDrawerProcessos";
import DrawerIncidente from "../configuracoes/novoIncidenteDrawerProcesso";
import DrawerDeficiencia from "../configuracoes/novaDeficienciaDrawerProcessos";
import DrawerPlanos from "../configuracoes/novoPlanoDrawerProcesso";
import FileUploader from "../configuracoes/FileUploader";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const authToken = token || localStorage.getItem("access_token");
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [planosAcoes, setPlanoAcao] = useState([]);
  const [departamentosInferiores, setDepartamentosInferiores] = useState([]);
  const [empresas, setDepartamentosLaterais] = useState([]);
  const [processosSuperiores, setDepartamentosSuperiores] = useState([]);
  const [processosInferiores, setProcessoInferior] = useState([]);
  const [responsaveis, setResponsavel] = useState([]);
  const [processosAnteriores, setProcessosAnteriores] = useState([]);
  const [processosPosteriores, setProcessosPosteriores] = useState([]);
  const [dados, setDados] = useState([]);
  const [kris, setKris] = useState([]);
  const [deficiencias, setDeficiencias] = useState([]);
  const [formatosUnidades, setFormatoUnidades] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [contas, setContas] = useState([]);
  const [nomeDepartamento, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [processosDados, setProcessosDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    empresa: [],
    tipoResponsabilidade: [],
    planoAcao: [],
    dado: [],
    deficiencia: [],
    formatoUnidade: "",
    responsavel: "",
    processoSuperior: "",
    processoInferior: [],
    processoAnterior: [],
    processoPosterior: [],
    risco: [],
    files: [],
    incidente: [],
    conta: [],
    kri: null,
    dataInicioOperacao: null,
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi && authToken) {
      const fetchDepartamentosDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}processes/${dadosApi.id}`,
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
          // Garante que os valores estão definidos
          setFormData((prev) => ({
            ...prev,
            empresa: Array.isArray(data.companies)
              ? data.companies.map((u) => u.idCompany)
              : [],
            departamentoInferior: Array.isArray(data.departments)
              ? data.departments.map((u) => u.idDepartment)
              : [],
            processoInferior: Array.isArray(data.processBottoms)
              ? data.processBottoms.map((u) => u.idProcessBottom)
              : [],
            kri: data.idKri || null,
processoAnterior: data.idProcessPrevious 
    ? (Array.isArray(data.idProcessPrevious) 
        ? data.idProcessPrevious.map((p) => p.idProcess || p.id) 
        : [data.idProcessPrevious.idProcess || data.idProcessPrevious.id || data.idProcessPrevious])
    : [],
processoPosterior: data.idProcessNext 
    ? (Array.isArray(data.idProcessNext) 
        ? data.idProcessNext.map((p) => p.idProcess || p.id) 
        : [data.idProcessNext.idProcess || data.idProcessNext.id || data.idProcessNext])
    : [],
            processoSuperior: data.idProcessSuperior || null,
            formatoUnidade: data.idProcessType || null,
            dado: data.idLgpds || null,
            risco: data.idRisks || null,
            responsavel: data.idResponsible || null,
            planoAcao: data.idActionPlans,
            files: data.files || [],
            deficiencia: data.idDeficiencies || null,
            conta: data.idLedgerAccounts || null,
            incidente: data.idIncidents || null,
          }));

          setProcessosDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.id) {
        fetchDepartamentosDados();
      }
    }
  }, [dadosApi, authToken]);

  const datasetsCarregados =
    empresas.length > 0 &&
    processosInferiores.length >= 0 &&
    processosSuperiores.length >= 0 &&
    dados.length >= 0 &&
    riscos.length >= 0 &&
    deficiencias.length >= 0 &&
    contas.length >= 0 &&
    incidentes.length >= 0 &&
    formatosUnidades.length >= 0;

  const camposObrigatoriosPreenchidos =
    requisicao === "Editar"
      ? codigo?.trim()?.length > 0 &&
        nomeDepartamento?.trim()?.length > 0 &&
        Array.isArray(formData.empresa) &&
        formData.empresa.length > 0
      : true;

  // 3) quando ambos estiverem OK, desligue o overlay
  useEffect(() => {
    if (
      requisicao === "Editar" &&
      datasetsCarregados &&
      camposObrigatoriosPreenchidos
    ) {
      setLoading(false);
    }
  }, [
    requisicao,
    datasetsCarregados,
    camposObrigatoriosPreenchidos,
    codigo,
    nomeDepartamento,
    formData.empresa,
  ]);

  const handleCompanyCreated = (newCompany) => {
    setDepartamentosLaterais((prevCompanies) => [...prevCompanies, newCompany]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      empresa: [...prev.empresa, newCompany.id], // Seleciona o novo processo automaticamente
    }));
  };

  const handleDepartmentCreated = (newDepartment) => {
    setDepartamentosInferiores((prevDepartments) => [
      ...prevDepartments,
      newDepartment,
    ]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      departamentoInferior: [...prev.departamentoInferior, newDepartment.id], // Seleciona o novo processo automaticamente
    }));
  };

  const handleRiskCreated = (newRisco) => {
    setRiscos((prevRiscos) => [...prevRiscos, newRisco]);
    setFormData((prev) => ({
      ...prev,
      risco: [...prev.risco, newRisco.id],
    }));
  };

  const handleDataCreated = (newData) => {
    setDados((prevDatas) => [...prevDatas, newData]);
    setFormData((prev) => ({
      ...prev,
      dado: [...prev.dado, newData.id],
    }));
  };

  const handleAccountCreated = (newAccount) => {
    setContas((prevAccounts) => [...prevAccounts, newAccount]);
    setFormData((prev) => ({
      ...prev,
      conta: [...prev.conta, newAccount.id],
    }));
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidentes((prevIncidents) => [...prevIncidents, newIncident]);
    setFormData((prev) => ({
      ...prev,
      incidente: [...prev.incidente, newIncident.id],
    }));
  };

  const handleDeficiencyCreated = (newDeficiencia) => {
    setDeficiencias((prevDeficiencias) => [
      ...prevDeficiencias,
      newDeficiencia,
    ]);
    setFormData((prev) => ({
      ...prev,
      deficiencia: [...prev.deficiencia, newDeficiencia.id],
    }));
  };

  useEffect(() => {
    if (!authToken) return;
    fetchData(
      `${process.env.REACT_APP_API_URL}departments`,
      setDepartamentosInferiores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setDepartamentosLaterais
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setDepartamentosSuperiores
    );
    fetchData(`${process.env.REACT_APP_API_URL}risks`, setRiscos);
    fetchData(`${process.env.REACT_APP_API_URL}datas`, setDados);
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts`,
      setContas
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}action-plans`,
      setPlanoAcao
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}deficiencies`,
      setDeficiencias
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessoInferior
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsavel
    );
    fetchData(`${process.env.REACT_APP_API_URL}risks/kris`, setKris);
    // Carrega os mesmos processos para os novos campos
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessosAnteriores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessosPosteriores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes/types`,
      setFormatoUnidades
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}incidents`,
      setIncidentes
    );
    window.scrollTo(0, 0);
  }, [authToken]);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Transformando os dados para alterar idCompany, idLedgerAccount e idProcess -> id, e name -> nome
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
          item.idResponsabilityType ||
          item.idLgpd ||
          item.idKri ||
          item.idNormative ||
          item.idDeficiency ||
          item.idProcessType ||
          item.idActionPlan ||
          item.idCollaborator ||
          item.idResponsible,
        nome: item.name,
        processType: item.processType, // Adiciona processType para filtragem
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeDepartamento);

    // Verifica e remove o departamento superior se necessário
    const superiorSelecionada = processosSuperiores.find(
      (processo) => processo.id === formData.processoSuperior
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        processoSuperior: null,
      }));
    }

    // Atualiza os departamentos inferiores removendo os que conflitam
    const inferioresAtualizadas = formData.processoInferior.filter((id) => {
      const processoInferior = processosInferiores.find(
        (processo) => processo.id === id
      );
      if (!processoInferior) return false;
      return formatarNome(processoInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.processoInferior.length) {
      setFormData((prev) => ({
        ...prev,
        processoInferior: inferioresAtualizadas,
      }));
    }
  }, [
    nomeDepartamento,
    processosSuperiores,
    processosInferiores,
    formData.processoSuperior,
    formData.processoInferior,
  ]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "processoSuperior") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (
        formData.departamentoInferior.length === departamentosInferiores.length
      ) {
        // Deselect all
        setFormData({ ...formData, departamentoInferior: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          departamentoInferior: departamentosInferiores.map(
            (departamentoInferior) => departamentoInferior.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "departamentoInferior",
        newValue.map((item) => item.id)
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
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectEmpresa = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.empresa.length === empresas.length) {
        // Deselect all
        setFormData({ ...formData, empresa: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          empresa: empresas.map((empresa) => empresa.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "empresa",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllDado = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.dado.length === dados.length) {
        // Deselect all
        setFormData({ ...formData, dado: [] });
      } else {
        // Select all
        setFormData({ ...formData, dado: dados.map((dado) => dado.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "dado",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllDeficiencias = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.deficiencia.length === deficiencias.length) {
        // Deselect all
        setFormData({ ...formData, deficiencia: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          deficiencia: deficiencias.map((deficiencia) => deficiencia.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "deficiencia",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Aplica o filtro: remove o item selecionado como processo superior e os que conflitam com o nome digitado
      const filteredInferiores = processosInferiores.filter((processo) => {
        const superiorId = formData.processoSuperior;
        if (processo.id === superiorId) return false;
        return formatarNome(processo.nome) !== formatarNome(nomeDepartamento);
      });
      if (formData.processoInferior.length === filteredInferiores.length) {
        // Se já estiverem selecionados todos os itens filtrados, deseleciona todos
        setFormData({ ...formData, processoInferior: [] });
      } else {
        // Seleciona somente os itens filtrados
        setFormData({
          ...formData,
          processoInferior: filteredInferiores.map((processo) => processo.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "processoInferior",
        newValue.map((item) => item.id)
      );
    }
  };

  // Handlers para os novos campos (Processo Anterior e Posterior)
  const handleSelectProcessoAnterior = (event, newValue) => {
    tratarMudancaInputGeral(
      "processoAnterior",
      newValue.map((item) => item.id)
    );
  };

  const handleSelectProcessoPosterior = (event, newValue) => {
    tratarMudancaInputGeral(
      "processoPosterior",
      newValue.map((item) => item.id)
    );
  };

  const handleSelectAllRisco = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.risco.length === riscos.length) {
        // Deselect all
        setFormData({ ...formData, risco: [] });
      } else {
        // Select all
        setFormData({ ...formData, risco: riscos.map((risco) => risco.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "risco",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllConta = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.conta.length === contas.length) {
        // Deselect all
        setFormData({ ...formData, conta: [] });
      } else {
        // Select all
        setFormData({ ...formData, conta: contas.map((conta) => conta.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "conta",
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

  const handlePlanCreated = (newPlan) => {
    setPlanoAcao((prevPlans) => [...prevPlans, newPlan]);
    setFormData((prev) => ({
      ...prev,
      planoAcao: [...prev.planoAcao, newPlan.id],
    }));
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processosInferiores/configuracoes-menu', { state: { tab: 'Órgão' } });
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

  const [formValidation, setFormValidation] = useState({
    nomeDepartamento: true,
    codigo: true,
    empresa: true,
  });

  const allSelected =
    formData.departamentoInferior.length === departamentosInferiores.length &&
    departamentosInferiores.length > 0;
  const allSelectedRiscos =
    formData.risco.length === riscos.length && riscos.length > 0;
  const allSelected2 =
    formData.processoInferior.length === processosInferiores.length &&
    processosInferiores.length > 0;
  const allSelected3 =
    formData.dado.length === dados.length && dados.length > 0;
  const allSelected4 =
    formData.deficiencia.length === deficiencias.length &&
    deficiencias.length > 0;
  const allSelectedContas =
    formData.conta.length === contas.length && contas.length > 0;
  const allSelectedPlanoAcao =
    formData.planoAcao.length === planosAcoes.length && planosAcoes.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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
    if (formData.empresa.length === 0) {
      setFormValidation((prev) => ({ ...prev, empresa: false }));
      missingFields.push("Empresa");
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

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File)
    );

    // Realiza upload dos novos arquivos, se houver
    let uploadFilesResult = { files: [] };
    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", 10); // 1 para empresa
      // Em edição, já temos o id da empresa; em criação, envia string vazia
      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? processosDados?.idProcess : ""
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
      uploadFilesResult = uploadResponse.data; // Supõe-se que seja um objeto do tipo { files: [...] }
    }

    // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
    const finalFiles = [...existingFiles, ...uploadFilesResult.files];

    // Transforma cada item para que o payload contenha somente a URL (string)
    const finalFilesPayload = finalFiles.map((file) => {
      // Se for uma string já, retorna-a; se for objeto e tiver a propriedade "path", retorna o valor dela.
      if (typeof file === "string") return file;
      if (file.path) return file.path;
      return file;
    });

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}processes`;
      method = "POST";
      payload = {
        name: nomeDepartamento,
        code: codigo,
        idCompanies: formData.empresa,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}processes`;
      method = "PUT";
      payload = {
        idProcess: processosDados?.idProcess,
        active: true,
        files: finalFilesPayload,
        name: nomeDepartamento,
        code: codigo,
        description: descricao,
        idProcessType:
          formData.formatoUnidade && formData.formatoUnidade !== ""
            ? formData.formatoUnidade
            : null,
        idProcessSuperior: formData.processoSuperior || null,
        idProcessPrevious:
          formData.processoAnterior.length > 0
            ? formData.processoAnterior[0]
            : null,

        idProcessNext:
          formData.processoPosterior.length > 0
            ? formData.processoPosterior[0]
            : null,
        idProcessBottoms: formData.processoInferior || null,
        idCompanies: formData.empresa,
        idDepartments: formData.departamentoInferior,
        idLgpds: formData.dado,
        idKri: formData.kri || null,
        idResponsible: formData.responsavel || null,
        idDeficiencies: formData.deficiencia,
        idIncidents: formData.incidente,
        idActionPlans: formData.planoAcao,
        idRisks: formData.risco,
        idLedgerAccounts: formData.conta,
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
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
        throw new Error("Não foi possível cadastrar o Processo.");
      } else {
        enqueueSnackbar(`Processo ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idProcess) {
        // Atualiza o estado para modo de edição
        setProcessosDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse processo.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtragem para os novos campos
  const tipoProcessoSelecionado = formatosUnidades.find(
    (f) => f.id === formData.formatoUnidade
  )?.nome;

  // Localize estas variáveis antes do return do componente
const opcoesProcessoAnterior = formData.formatoUnidade
  ? processosAnteriores.filter(
      (p) =>
        // Compara o ID do tipo de processo para ser mais preciso
        (p.idProcessType === formData.formatoUnidade || p.processType === tipoProcessoSelecionado) &&
        !formData.processoPosterior.includes(p.id) &&
        p.id !== processosDados?.idProcess
    )
  : [];

const opcoesProcessoPosterior = formData.formatoUnidade
  ? processosPosteriores.filter(
      (p) =>
        (p.idProcessType === formData.formatoUnidade || p.processType === tipoProcessoSelecionado) &&
        !formData.processoAnterior.includes(p.id) &&
        p.id !== processosDados?.idProcess
    )
  : [];

  return (
    <>
      <LoadingOverlay
        open={loading}
        message="Preparando edição do processo..."
        hint="Sincronizando empresas, departamentos, processos, riscos e dados LGPD"
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
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
                error={
                  !nomeDepartamento && formValidation.nomeDepartamento === false
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>
                Empresa *{" "}
                <DrawerEmpresa
                  buttonSx={{
                    marginLeft: 1.5,
                    height: "20px",
                    minWidth: "20px",
                  }}
                  onCompanyCreated={handleCompanyCreated}
                />
              </InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: "all", nome: "Selecionar todas" }, ...empresas]}
                getOptionLabel={(option) => option.nome}
                value={formData.empresa.map(
                  (id) => empresas.find((empresa) => empresa.id === id) || id
                )}
                onChange={handleSelectEmpresa}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === "all" ? allSelected : selected}
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
                      (formData.empresa.length === 0 ||
                        formData.empresa.every((val) => val === 0)) &&
                      formValidation.empresa === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Departamento{" "}
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
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...departamentosInferiores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamentoInferior.map(
                      (id) =>
                        departamentosInferiores.find(
                          (departamentoInferior) =>
                            departamentoInferior.id === id
                        ) || id
                    )}
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
                      <TextField
                        {...params}
                        error={
                          (formData.departamentoInferior.length === 0 ||
                            formData.departamentoInferior.every(
                              (val) => val === 0
                            )) &&
                          formValidation.departamentoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

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
                  <InputLabel>Tipo de processo</InputLabel>

                  {/* helper para rotular com o nível */}
                  {/*
      Coloque fora do return, junto dos outros helpers se preferir:
      const formatTipoProcLabel = (opt) => opt?.hierarchy != null
        ? `Nível ${opt.hierarchy} — ${opt.nome}`
        : opt?.nome || '';
    */}
                  <Autocomplete
                    options={[...formatosUnidades].sort(
                      (a, b) => (a?.hierarchy ?? 999) - (b?.hierarchy ?? 999)
                    )}
                    getOptionLabel={(option) =>
                      option?.hierarchy != null
                        ? `Nível ${option.hierarchy} — ${option.nome}`
                        : option?.nome || ""
                    }
                    value={
                      formatosUnidades.find(
                        (formatoUnidade) =>
                          formatoUnidade.id === formData.formatoUnidade
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        formatoUnidade: newValue ? newValue.id : "",
                        // Limpa dependentes ao mudar o tipo
                        processoAnterior: [],
                        processoPosterior: [],
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        {/* Título com nível + nome */}
                        <Grid container alignItems="center">
                          <Grid item xs>
                            <strong>
                              {option?.hierarchy != null
                                ? `Nível ${option.hierarchy} — ${option.nome}`
                                : option?.nome}
                            </strong>
                            {option?.hierarchy != null && (
                              <div style={{ fontSize: 12, opacity: 0.75 }}>
                                Hierarquia: {option.hierarchy}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    // chips (tags) também exibem o nível
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <span
                          key={option.id}
                          {...getTagProps({ index })}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            margin: 2,
                            borderRadius: 16,
                            background: "rgba(0,0,0,0.08)",
                          }}
                        >
                          {option?.hierarchy != null
                            ? `Nível ${option.hierarchy} — ${option.nome}`
                            : option?.nome}
                        </span>
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.formatoUnidade &&
                          formValidation.formatoUnidade === false
                        }
                        placeholder="Selecione o tipo (com nível)"
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Risco{" "}
                    <DrawerRisco
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onRiscoCreated={handleRiskCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...riscos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.risco.map(
                      (id) => riscos.find((risco) => risco.id === id) || id
                    )}
                    onChange={handleSelectAllRisco}
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
                                  ? allSelectedRiscos
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
                          (formData.risco.length === 0 ||
                            formData.risco.every((val) => val === 0)) &&
                          formValidation.risco === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Processo superior</InputLabel>
                  <Autocomplete
                    options={processosSuperiores.filter((processo) => {
                      // IDs dos departamentos já selecionados nos outros campos:
                      const selectedInferior = formData.processoInferior || [];
                      const selectedIds = [...selectedInferior];

                      // Se for o valor atual selecionado, não filtra
                      if (formData.processoSuperior === processo.id)
                        return true;

                      // Exclui se já estiver selecionado em outro campo ou se o nome for igual ao nome do departamento atual
                      return (
                        !selectedIds.includes(processo.id) &&
                        formatarNome(processo.nome) !==
                          formatarNome(nomeDepartamento)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      processosSuperiores.find(
                        (processoSuperior) =>
                          processoSuperior.id === formData.processoSuperior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        processoSuperior: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.processoSuperior &&
                          formValidation.processoSuperior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Processos Inferiores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...processosInferiores.filter((processo) => {
                        // IDs já selecionados em outros autocompletes:
                        const superiorId = formData.processoSuperior || [];

                        // Se o departamento estiver selecionado neste campo, mantenha-o
                        if (formData.processoInferior.includes(processo.id))
                          return true;

                        return (
                          processo.id !== superiorId &&
                          formatarNome(processo.nome) !==
                            formatarNome(nomeDepartamento)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processoInferior.map(
                      (id) =>
                        processosInferiores.find(
                          (processoInferior) => processoInferior.id === id
                        ) || id
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
                      <TextField
                        {...params}
                        error={
                          (formData.processoInferior.length === 0 ||
                            formData.processoInferior.every(
                              (val) => val === 0
                            )) &&
                          formValidation.processoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Processo Anterior</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={opcoesProcessoAnterior}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processoAnterior.map(
                      (id) => processosAnteriores.find((p) => p.id === id) || id
                    )}
                    onChange={handleSelectProcessoAnterior}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    disabled={!formData.formatoUnidade} // Desabilita se o tipo de processo não estiver preenchido
                    renderInput={(params) => (
                      <TextField
                        {...params}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Processo Posterior</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={opcoesProcessoPosterior}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processoPosterior.map(
                      (id) =>
                        processosPosteriores.find((p) => p.id === id) || id
                    )}
                    onChange={handleSelectProcessoPosterior}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    disabled={!formData.formatoUnidade} // Desabilita se o tipo de processo não estiver preenchido
                    renderInput={(params) => (
                      <TextField
                        {...params}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Dado{" "}
                    <DrawerDado
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onDataCreated={handleDataCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...dados,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.dado.map(
                      (id) => dados.find((dado) => dado.id === id) || id
                    )}
                    onChange={handleSelectAllDado}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected3 : selected
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
                          (formData.dado.length === 0 ||
                            formData.dado.every((val) => val === 0)) &&
                          formValidation.dado === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Deficiências{" "}
                    <DrawerDeficiencia
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onDeficienciaCreated={handleDeficiencyCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...deficiencias,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.deficiencia.map(
                      (id) =>
                        deficiencias.find(
                          (deficiencia) => deficiencia.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllDeficiencias}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected4 : selected
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
                          (formData.deficiencia.length === 0 ||
                            formData.deficiencia.every((val) => val === 0)) &&
                          formValidation.deficiencia === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Conta{" "}
                    <DrawerConta
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onAccountCreated={handleAccountCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...contas,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.conta.map(
                      (id) => contas.find((conta) => conta.id === id) || id
                    )}
                    onChange={handleSelectAllConta}
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
                                  ? allSelectedContas
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
                          (formData.conta.length === 0 ||
                            formData.conta.every((val) => val === 0)) &&
                          formValidation.conta === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Incidente{" "}
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
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...incidentes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.incidente.map(
                      (id) =>
                        incidentes.find((incidente) => incidente.id === id) ||
                        id
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
                                  ? allSelectedContas
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
                            formData.incidente.every((val) => val === 0)) &&
                          formValidation.incidente === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
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
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...planosAcoes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.planoAcao.map(
                      (id) =>
                        planosAcoes.find((planoAcao) => planoAcao.id === id) ||
                        id
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
                                option.id === "all"
                                  ? allSelectedPlanoAcao
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
                          (formData.planoAcao.length === 0 ||
                            formData.planoAcao.every((val) => val === 0)) &&
                          formValidation.planoAcao === false
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
                    // REMOVIDO: multiple
                    // REMOVIDO: disableCloseOnSelect

                    // Opções: removemos a opção "Selecionar todos" pois é seleção única
                    options={kris}
                    getOptionLabel={(option) => option.nome}
                    // VALUE: Busca o objeto inteiro baseado no ID salvo no state
                    value={kris.find((kri) => kri.id === formData.kri) || null}
                    // ONCHANGE: Atualiza o state com apenas o ID (GUID) ou null
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        kri: newValue ? newValue.id : null,
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        // Ajuste a validação conforme necessário (se for obrigatório ou não)
                        error={!formData.kri && formValidation.kri === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
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
                        error={
                          !formData.responsavel &&
                          formValidation.responsavel === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={10}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
                  />
                </Stack>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="flex-end"
              spacing={2}
              sx={{ height: "100%" }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={voltarParaCadastroMenu}
              >
                Cancelar
              </Button>
              <Button variant="contained" onClick={tratarSubmit}>
                Salvar
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            display="flex"
            alignItems="center"
          >
            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
            {"Processo Cadastrado com Sucesso!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              O processo foi cadastrado com sucesso. Deseja continuar editando
              ou voltar para a listagem?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={voltarParaListagem} color="primary">
              Voltar para a listagem
            </Button>
            <Button onClick={continuarEdicao} color="primary" autoFocus>
              Continuar editando
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
