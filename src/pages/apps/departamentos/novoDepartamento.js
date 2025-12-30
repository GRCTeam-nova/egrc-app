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
        try {
          const response = await fetch(
            `${API_URL}departments/${dadosApi.idDepartment}`,
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
            normativa: data.idNormatives || null,
            risco: data.idRisks || null,
            processo: data.idProcesses || null,
            tipoResponsabilidade: data.idResponsabilityType || null,
            formatoUnidade: data.idUnitFormat || null,
            incidente: data.idIncidents || null,
            planoAcao: data.idActionPlans || null,
            dado: data.idLgpds || null,
            responsavel: data.idResponsible || null,
          }));

          setDepartamentosDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idDepartment) {
        fetchDepartamentosDados();
      }
    }
  }, [dadosApi]);

  useEffect(() => {
    fetchData(
      `${API_URL}departments`,
      setDepartamentosInferiores
    );
    fetchData(
      `${API_URL}departments`,
      setDepartamentosLaterais
    );
    fetchData(
      `${API_URL}departments`,
      setDepartamentosSuperiores
    );
    fetchData(`${API_URL}risks`, setRiscos);
    fetchData(
      `${API_URL}processes`,
      setProcessos
    );
    fetchData(
      `${API_URL}departments/responsability-types`,
      setTiposResponsabilidades
    );
    fetchData(
      `${API_URL}departments/unit-formats`,
      setFormatoUnidades
    );
    fetchData(
      `${API_URL}collaborators/responsibles`,
      setResponsavel
    );
    fetchData(
      `${API_URL}incidents`,
      setIncidentes
    );
    fetchData(
      `${API_URL}datas`,
      setDados
    );
    fetchData(
      `${API_URL}normatives`,
      setNormativas
    );
    fetchData(
      `${API_URL}action-plans`,
      setPlanosAcao
    );
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
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
          item.idActionPlan ||
          item.idResponsabilityType ||
          item.idCollaborator ||
          item.idLgpd ||
          item.idNormative,
        nome: item.name,
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
    const superiorSelecionada = departamentosSuperiores.find(
      (departamento) => departamento.id === formData.departamentoSuperior
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        departamentoSuperior: null,
      }));
    }

    // Atualiza os departamentos inferiores removendo os que conflitam
    const inferioresAtualizadas = formData.departamentoInferior.filter((id) => {
      const departamentoInferior = departamentosInferiores.find(
        (departamento) => departamento.id === id
      );
      if (!departamentoInferior) return false;
      return formatarNome(departamentoInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.departamentoInferior.length) {
      setFormData((prev) => ({
        ...prev,
        departamentoInferior: inferioresAtualizadas,
      }));
    }

    // **Novo bloco: Atualiza os departamentos laterais**
    const lateraisAtualizadas = formData.departamentoLateral.filter((id) => {
      const departamentoLateral = departamentosLateral.find(
        (departamento) => departamento.id === id
      );
      if (!departamentoLateral) return false;
      return formatarNome(departamentoLateral.nome) !== nomeDigitado;
    });
    if (lateraisAtualizadas.length !== formData.departamentoLateral.length) {
      setFormData((prev) => ({
        ...prev,
        departamentoLateral: lateraisAtualizadas,
      }));
    }
  }, [
    nomeDepartamento,
    departamentosSuperiores,
    departamentosInferiores,
    departamentosLateral,
    formData.departamentoInferior,
    formData.departamentoLateral,
  ]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "departamentoSuperior") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id], // Seleciona o novo processo automaticamente
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
      // Aplica o mesmo filtro usado nas opções do Autocomplete para Departamentos Inferiores
      const filteredInferiores = departamentosInferiores.filter(
        (departamento) => {
          const superiorId = formData.departamentoSuperior;
          const lateralIds = formData.departamentoLateral || [];
          return (
            departamento.id !== superiorId &&
            !lateralIds.includes(departamento.id) &&
            formatarNome(departamento.nome) !== formatarNome(nomeDepartamento)
          );
        }
      );
      if (formData.departamentoInferior.length === filteredInferiores.length) {
        // Deseleciona todos se já estiverem todos selecionados
        setFormData({ ...formData, departamentoInferior: [] });
      } else {
        // Seleciona apenas os itens filtrados
        setFormData({
          ...formData,
          departamentoInferior: filteredInferiores.map(
            (departamento) => departamento.id
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

  const handleSelectDepartamentoLateral = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Aplica o mesmo filtro usado nas opções do Autocomplete para Departamentos Laterais
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
        // Deseleciona todos se já estiverem todos selecionados
        setFormData({ ...formData, departamentoLateral: [] });
      } else {
        // Seleciona apenas os itens filtrados
        setFormData({
          ...formData,
          departamentoLateral: filteredLaterais.map(
            (departamento) => departamento.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "departamentoLateral",
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

  const handleSelectAllConta = (event, newValue) => {
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

    const handleSelectAllDados = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.dado.length === dados.length) {
        // Deselect all
        setFormData({ ...formData, dado: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          dado: dados.map((dado) => dado.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "dado",
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
  const handleSelectAllPlanos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.planoAcao.length === planosAcao.length) {
        // Deselect all
        setFormData({ ...formData, planoAcao: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          planoAcao: planosAcao.map((planoAcao) => planoAcao.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "planoAcao",
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
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
  const allSelectedRiscos =
    formData.risco.length === riscos.length && riscos.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedIncidentes =
    formData.incidente.length === incidentes.length && incidentes.length > 0;
  const allSelectedDados =
    formData.dado.length === dados.length && dados.length > 0;
  const allSelectedNormativas =
    formData.normativa.length === normativas.length && normativas.length > 0;
  const allSelectedPlanos =
    formData.planoAcao.length === planosAcao.length && planosAcao.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  // Função para voltar para a listagem
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
      return; // Para a execução se a validação falhar
    }

    // Separe os arquivos novos dos já existentes:
    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File)
    );

    // Realiza upload dos novos arquivos, se houver
    let uploadFilesResult = { files: [] };
    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", 2); // 1 para empresa
      // Em edição, já temos o id da empresa; em criação, envia string vazia
      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? departamentoDados?.idDepartment : ""
      );
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
      url = `${API_URL}departments`;
      method = "POST";
      payload = {
        name: nomeDepartamento,
        code: codigo,
      };
    } else if (requisicao === "Editar") {
      url = `${API_URL}departments`;
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
        idResponsible:
          formData.responsavel === "" ? null : formData.responsavel,
        idDepartmentSuperior: formData.departamentoSuperior?.length
          ? formData.departamentoSuperior
          : null,
        idDepartmentBottoms: formData.departamentoInferior?.length
          ? formData.departamentoInferior
          : null,
        idDepartmentSides: formData.departamentoLateral?.length
          ? formData.departamentoLateral
          : null,
        idIncidents: formData.incidente?.length ? formData.incidente : null,
        idUnitFormat: formData.formatoUnidade?.length
          ? formData.formatoUnidade
          : null,
        idRisks: formData.risco?.length ? formData.risco : null,
        idResponsabilityType: formData.tipoResponsabilidade?.length
          ? formData.tipoResponsabilidade
          : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idActionPlans: formData.planoAcao?.length ? formData.planoAcao : null,
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
        throw new Error("Não foi possível cadastrar o Departamento.");
      } else {
        enqueueSnackbar(`Departamento ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idDepartment) {
        // Atualiza o estado para modo de edição
        setDepartamentosDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
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
                error={
                  !nomeDepartamento && formValidation.nomeDepartamento === false
                }
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
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposResponsabilidades.find(
                        (tipoResponsabilidade) =>
                          tipoResponsabilidade.id ===
                          formData.tipoResponsabilidade
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
                        error={
                          !formData.tipoResponsabilidade &&
                          formValidation.tipoResponsabilidade === false
                        }
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
                    getOptionLabel={(option) => option.nome}
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
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.formatoUnidade &&
                          formValidation.formatoUnidade === false
                        }
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
                      // IDs dos departamentos já selecionados nos outros campos:
                      const selectedInferior =
                        formData.departamentoInferior || [];
                      const selectedLateral =
                        formData.departamentoLateral || [];
                      const selectedIds = [
                        ...selectedInferior,
                        ...selectedLateral,
                      ];

                      // Se for o valor atual selecionado, não filtra
                      if (formData.departamentoSuperior === departamento.id)
                        return true;

                      // Exclui se já estiver selecionado em outro campo ou se o nome for igual ao nome do departamento atual
                      return (
                        !selectedIds.includes(departamento.id) &&
                        formatarNome(departamento.nome) !==
                          formatarNome(nomeDepartamento)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      departamentosSuperiores.find(
                        (departamento) =>
                          departamento.id === formData.departamentoSuperior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      // Quando selecionar um departamento superior, removemos dele dos inferiores (por exemplo)
                      setFormData((prev) => {
                        const updatedInferior =
                          prev.departamentoInferior.filter((id) =>
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
                        error={
                          !formData.departamentoSuperior &&
                          formValidation.departamentoSuperior === false
                        }
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
                        // IDs já selecionados em outros autocompletes:
                        const superiorId = formData.departamentoSuperior;
                        const lateralIds = formData.departamentoLateral || [];

                        // Se o departamento estiver selecionado neste campo, mantenha-o
                        if (
                          formData.departamentoInferior.includes(
                            departamento.id
                          )
                        )
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !lateralIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !==
                            formatarNome(nomeDepartamento)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamentoInferior.map(
                      (id) =>
                        departamentosInferiores.find(
                          (departamento) => departamento.id === id
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

                        if (
                          formData.departamentoLateral.includes(departamento.id)
                        )
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !inferiorIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !==
                            formatarNome(nomeDepartamento)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamentoLateral.map(
                      (id) =>
                        departamentosLateral.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectDepartamentoLateral}
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
                                  ? allSelectedDepartamentoLateral
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
                          (formData.departamentoLateral.length === 0 ||
                            formData.departamentoLateral.every(
                              (val) => val === 0
                            )) &&
                          formValidation.departamentoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
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
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...processos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processo.map(
                      (id) =>
                        processos.find((processo) => processo.id === id) || id
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
                          (formData.processo.length === 0 ||
                            formData.processo.every((val) => val === 0)) &&
                          formValidation.processo === false
                        }
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
                      { id: "all", nome: "Selecionar todas" },
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
                  <InputLabel>Normativas</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...normativas,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.normativa.map(
                      (id) =>
                        normativas.find((normativa) => normativa.id === id) ||
                        id
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
                                option.id === "all"
                                  ? allSelectedNormativas
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
                          (formData.normativa.length === 0 ||
                            formData.normativa.every((val) => val === 0)) &&
                          formValidation.normativa === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Dados</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...dados,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.dado.map(
                      (id) =>
                        dados.find((dado) => dado.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllDados}
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
                                  ? allSelectedDados
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
                          (formData.dado.length === 0 ||
                            formData.dado.every((val) => val === 0)) &&
                          formValidation.dado === false
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
                      ...planosAcao,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.planoAcao.map(
                      (id) =>
                        planosAcao.find((planoAcao) => planoAcao.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllPlanos}
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
                                  ? allSelectedPlanos
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

              <Grid item xs={2}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginLeft: 25, marginTop: 35.5 }}
                  >
                    <Switch
                      checked={temporario}
                      onChange={(event) => setTemporario(event.target.checked)}
                    />
                    <Typography>{"Temporário"}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginLeft: 15, marginTop: 35.5 }}
                  >
                    <Switch
                      checked={colegiada}
                      onChange={(event) => setColegiada(event.target.checked)}
                    />
                    <Typography>{"Colegiada"}</Typography>
                  </Stack>
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
                    containerFolder={2}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
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
              Departamento Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O departamento foi cadastrado com sucesso. Você pode voltar para
                a listagem ou adicionar mais informações a esse departamento.
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
