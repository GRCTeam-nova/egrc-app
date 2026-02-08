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
import ListagemSteps from "./listaSteps";
import DrawerDepartamentos from "./novoDepartamentoDrawerPlanos";
import DrawerDeficiencia from "./novaDeficienciaDrawerPlanos";
import DrawerProcesso from "./novoProcessoDrawerPlanos";
import DrawerRisco from "./novoRiscoDrawerPlanos";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FileUploader from "../configuracoes/FileUploader";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [status, setStatus] = useState(true);
  const [deficiencias, setDeficiencia] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [tiposPlanos, setTipoPlano] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [normativaDados, setNormativaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [contas, setContas] = useState([]);
  const [responsaveis, setResponsavel] = useState([]);
  const [steps, setSteps] = useState([]); // para a RN das datas
  const [statuss] = useState([
    { id: 1, nome: "Não iniciada" },
    { id: 2, nome: "Em andamento" },
    { id: 3, nome: "Em revisão" },
    { id: 4, nome: "Revisado" },
  ]);
  const [prioridades] = useState([
    { id: 1, nome: "Baixa" },
    { id: 2, nome: "Média" },
    { id: 3, nome: "Alta" },
  ]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    status: "",
    tipoNorma: "",
    riscoNorma: "",
    periodicidadeRevisao: "",
    prioridade: "",
    tipoPlano: "",
    empresaInferior: [],
    normaDestino: [],
    deficiencia: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    risco: [],
    ameaca: [],
    conta: [],

    responsavel: null,
    startDate: null,
    endDate: null,
    conclusionDate: null,
    files: [],
    normativa: [],
    planoAcao: [],
    departamento: [],
    processo: [],
    normaOrigem: [],
    conta: [],
    dataPublicacao: null,
    vigenciaInicial: null,
  });

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
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idCompany ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idActionPlanType ||
          item.idThreat ||
          item.idCollaborator ||
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
    fetchData(
      `${process.env.REACT_APP_API_URL}departments`,
      setDepartamentos
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}deficiencies`,
      setDeficiencia
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
    fetchData(`${process.env.REACT_APP_API_URL}risks`, setRiscos);

    fetchData(
      `${process.env.REACT_APP_API_URL}action-plans/types`,
      setTipoPlano
    );
    fetchData(`${process.env.REACT_APP_API_URL}ledger-accounts`, setContas);
    fetchData(`${process.env.REACT_APP_API_URL}collaborators/responsibles`, setResponsavel);

    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}action-plans/${dadosApi.idActionPlan}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de planos");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setNome(data.name);
          setCodigo(data.code);
          setStatus(data.active);
          setDescricao(data.description);
          setFormData((prev) => ({
            ...prev,
            status: data.actionPlanStatus || null,
            prioridade: data.actionPlanPriority || null,
            tipoPlano: data.idActionPlanType || null,
            departamento: data.idDepartments || null,
            deficiencia: data.idDeficiencies || null,
            processo: data.idProcesses || null,
            risco: data.idRisks || null,
            conta: data.idLedgerAccounts || [],
            responsavel: data.idResponsible || null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            conclusionDate: data.conclusionDate ? new Date(data.conclusionDate) : null,
            files: data.files || [],

          }));

          setNormativaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idActionPlan) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const handleDepartmentCreated = (newDepartamento) => {
    setDepartamentos((prevDepartamentos) => [...prevDepartamentos, newDepartamento]);
    setFormData((prev) => ({
      ...prev,
      departamento: [...prev.departamento, newDepartamento.id],
    }));
  };

  const handleDeficiencyCreated = (newDeficiencia) => {
    setDeficiencia((prevDeficiencias) => [
      ...prevDeficiencias,
      newDeficiencia,
    ]);
    setFormData((prev) => ({
      ...prev,
      deficiencia: [...prev.deficiencia, newDeficiencia.id],
    }));
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


  const tratarMudancaInputGeral = (field, value) => {
    if (field === "prioridade") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
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

  const handleSelectAllEmpresas = (event, newValue) => {
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

  const handleSelectAllRisco = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.risco.length === riscos.length) {
        // Deselect all
        setFormData({ ...formData, risco: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          risco: riscos.map((risco) => risco.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "risco",
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

  const [formValidation, setFormValidation] = useState({
    codigo: true,
    prioridade: true,
    nome: true,
  });


  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;

  const allSelectedEmpresas =
    formData.deficiencia.length === deficiencias.length &&
    deficiencias.length > 0;

  const allSelectedDepartamentos =
    formData.departamento.length === departamentos.length &&
    departamentos.length > 0;

  const allSelectedRisco =
    formData.risco.length === riscos.length && riscos.length > 0;

  const allSelectedContas =
    formData.conta.length === contas.length && contas.length > 0;

  const handleSelectAllContas = (event, newValue) => {
    const hasAll = newValue?.some((o) => o.id === "all");
    setFormData((prev) => ({
      ...prev,
      conta: hasAll ? (allSelectedContas ? [] : contas.map((c) => c.id)) : newValue.map((o) => o.id),
    }));
  };


  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.prioridade) {
      setFormValidation((prev) => ({ ...prev, prioridade: false }));
      missingFields.push("Prioridade");
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

    let finalFilesPayload = formData.files || [];

    if (requisicao === "Editar") {
      const newFiles = (formData.files || []).filter((f) => f instanceof File);
      const existingFiles = (formData.files || []).filter((f) => !(f instanceof File));

      let uploadFilesResult = { files: [] };

      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 11);
        formDataUpload.append("IdContainer", normativaDados?.idActionPlan || "");

        newFiles.forEach((file) => formDataUpload.append("Files", file, file.name));

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

      const finalFiles = [...existingFiles, ...(uploadFilesResult.files || [])];

      finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file?.path) return file.path;
        return file;
      });
    }


    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}action-plans`;
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        actionPlanPriority: formData.prioridade,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}action-plans`;
      method = "PUT";
      payload = {
        idActionPlan: normativaDados?.idActionPlan,
        code: codigo,
        name: nome,
        description: descricao,

        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        conclusionDate: formData.conclusionDate ? formData.conclusionDate.toISOString() : null,

        actionPlanStatus: formData.status,
        actionPlanPriority: formData.prioridade,
        active: status,

        idActionPlanType: formData.tipoPlano || null,
        idResponsible: formData.responsavel || null,

        idDepartments: formData.departamento?.length ? formData.departamento : null,
        idDeficiencies: formData.deficiencia?.length ? formData.deficiencia : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idRisks: formData.risco?.length ? formData.risco : null,

        idLedgerAccounts: formData.conta?.length ? formData.conta : null,
        files: finalFilesPayload?.length ? finalFilesPayload : [],
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
        enqueueSnackbar(`Plano ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idActionPlan) {
        // Atualiza o estado para modo de edição
        setNormativaDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse plano.", {
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
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Prioridade *</InputLabel>
              <Autocomplete
                options={prioridades}
                getOptionLabel={(option) => option.nome}
                value={
                  prioridades.find(
                    (prioridade) => prioridade.id === formData.prioridade
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    prioridade: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.prioridade &&
                      formValidation.prioridade === false
                    }
                  />
                )}
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
                  <InputLabel>Status</InputLabel>
                  <Autocomplete
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={responsaveis.find((r) => r.id === formData.responsavel) || null}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({ ...prev, responsavel: newValue ? newValue.id : null }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>


              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo do plano</InputLabel>
                  <Autocomplete
                    options={tiposPlanos}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposPlanos.find(
                        (tipoPlano) => tipoPlano.id === formData.tipoPlano
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoPlano: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoPlano &&
                          formValidation.tipoPlano === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Contas contábeis</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...contas]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.conta.map((id) => contas.find((c) => c.id === id) || id)}
                    onChange={handleSelectAllContas}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox checked={option.id === "all" ? allSelectedContas : selected} />
                          </Grid>
                          <Grid item xs>{option.nome}</Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>


              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Departamentos{" "}
                    <DrawerDepartamentos
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
                      ...departamentos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamento.map(
                      (id) =>
                        departamentos.find(
                          (departamento) => departamento.id === id
                        ) || id
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
                                option.id === "all"
                                  ? allSelectedDepartamentos
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
                          (formData.departamento.length === 0 ||
                            formData.departamento.every((val) => val === 0)) &&
                          formValidation.departamento === false
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
                          (formData.deficiencia.length === 0 ||
                            formData.deficiencia.every((val) => val === 0)) &&
                          formValidation.deficiencia === false
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

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Riscos{" "}
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
                      { id: "all", nome: "Selecionar todos" },
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
                                  ? allSelectedRisco
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
                  <InputLabel>Data de início (RN)</InputLabel>
                  <DatePicker
                    value={formData.startDate}
                    onChange={() => { }}
                    
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de fim (RN)</InputLabel>
                  <DatePicker
                    value={formData.endDate}
                    onChange={() => { }}
                  
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de fim efetivo</InputLabel>
                  <DatePicker
                    value={formData.conclusionDate}
                    onChange={(newValue) =>
                      setFormData((prev) => ({ ...prev, conclusionDate: newValue }))
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </Grid>


              <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 35, marginLeft: 25 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>{status ? "Ativo" : "Inativo"}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={11}
                    initialFiles={formData.files}
                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, files }))}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Steps</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemSteps />
                  </AccordionDetails>
                </Accordion>
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
              Plano criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O plano de ação foi cadastrado com sucesso. Você pode voltar
                para a listagem ou adicionar mais informações a esse plano.
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
