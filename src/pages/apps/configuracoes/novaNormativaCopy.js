/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Switch,
  Typography,
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
import { DatePicker } from "@mui/x-date-pickers";
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
import DrawerEmpresa from "./novaEmpresaDrawerNormativos";
import DrawerDepartamento from "./novoDepartamentoDrawerNormativas";
import DrawerProcesso from "./novoProcessoDrawerNormativa";
import FileUploader from "./FileUploader";
import DrawerPlanos from "./novoPlanoDrawerNormativa";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [normaDestinos, setNormaDestino] = useState([]);
  const [empresas, setEmpresa] = useState([]);
  const [normaOrigens, setNormaOrigem] = useState([]);
  const [planosAcoes, setPlanoAcao] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [conclusaoRevisao, setConclusaoRevisao] = useState("");
  const [motivoRevogacao, setMotivoRevogacao] = useState("");
  const [diasDaRevisao, setDiasDaRevisao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [aprovadores, setAprovador] = useState([]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [normativaDados, setNormativaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [statusNormas] = useState([{ id: 1, nome: "Elaboração" }]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [ambientes] = useState([
    { id: 1, nome: "Interno" },
    { id: 2, nome: "Externo" },
  ]);
  const [reguladores, setReguladores] = useState([]);
  const [tipoNormas, setTipoNormas] = useState([]);
  const [riscoNormas] = useState([
    { id: 1, nome: "Alto" },
    { id: 2, nome: "Médio" },
    { id: 3, nome: "Baixo" },
  ]);
  const [periodicidadeRevisoes] = useState([
    { id: 1, nome: "Semestral" },
    { id: 2, nome: "Anual" },
    { id: 3, nome: "Bienal" },
  ]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    statusNorma: "",
    tipoNorma: "",
    riscoNorma: "",
    periodicidadeRevisao: "",
    empresaInferior: [],
    normaDestino: [],
    empresa: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    planoAcao: [],
    files: [],
    departamento: [],
    regulador: "",
    processo: [],
    normaOrigem: [],
    conta: [],
    responsavel: "",
    aprovador: [],
    dataPublicacao: null,
    dataCadastro: new Date(),
    vigenciaInicial: null,
    ultimaRevisao: null,
    dataLimiteRevisao: null,
    dataRevogacao: null,
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
          item.idRisk ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idActionPlan ||
          item.idCompany ||
          item.idDepartment ||
          item.idCollaborator ||
          item.idNormativeType ||
          item.idKri ||
          item.idRegulatory ||
          item.idControl ||
          item.idThreat,
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
      `https://api.egrc.homologacao.com.br/api/v1/departments`,
      setDepartamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives/types`,
      setTipoNormas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives/regulatories`,
      setReguladores
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives`,
      setNormaOrigem
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives`,
      setNormaDestino
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/companies`,
      setEmpresa
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/action-plans`,
      setPlanoAcao
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setResponsavel
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setAprovador
    );
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/normatives/${dadosApi.idNormative}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          if (!response.ok) {
            throw new Error("Erro ao buscar os dados da normativa");
          }
  
          const data = await response.json();
  
          setRequisicao("Editar");
          setMensagemFeedback("editada");
  
          // Atualiza os campos simples
          setNome(data.name);
          setCodigo(data.code);
          setDescricao(data.description);
          // Observe que o endpoint retorna "conclusion" e não "treatmentDescription"
          setConclusaoRevisao(data.conclusion);
          setDiasDaRevisao(data.daysRevision);
          setMotivoRevogacao(data.revocationReason);
          setStatus(data.active);
  
          // Atualiza os campos de data e outros campos do formData
          setFormData((prev) => ({
            ...prev,
            dataCadastro: data.registerDate ? new Date(data.registerDate) : prev.dataCadastro,
            dataPublicacao: data.publishDate ? new Date(data.publishDate) : null,
            vigenciaInicial: data.initialVigency ? new Date(data.initialVigency) : null,
            ultimaRevisao: data.lastRevision ? new Date(data.lastRevision) : null,
            dataLimiteRevisao: data.limitDateRevision ? new Date(data.limitDateRevision) : null,
            dataRevogacao: data.revocationDate ? new Date(data.revocationDate) : null,
            periodicidadeRevisao: data.frequencyRevision,
            statusNorma: data.normativeStatus,
            riscoNorma: data.normativeRisk,
            tipoNorma: data.idNormativeType,
            regulador: data.idRegulatory,
            responsavel: data.idResponsible,
            // Preenche os arrays com os IDs retornados
            normaOrigem: data.idOrigins,
            normaDestino: data.idDestinies,
            planoAcao: data.idActionPlans,
            aprovador: data.idApprovers,
            empresa: data.idCompanies,
            departamento: data.idDepartments,
            processo: data.idProcess,
            files: data.files || [],
          }));
  
          setNormativaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };
  
      if (dadosApi.idNormative) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, token]);
  

  const handleCompanyCreated = (newEmpresa) => {
    setEmpresa((prevEmpresas) => [...prevEmpresas, newEmpresa]);
    setFormData((prev) => ({
      ...prev,
      empresa: [...prev.empresa, newEmpresa.id],
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

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "regulador") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normaOrigem.length === normaOrigens.length) {
        // Deselect all
        setFormData({ ...formData, normaOrigem: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          normaOrigem: normaOrigens.map((normaOrigem) => normaOrigem.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "normaOrigem",
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

  const handleSelectAllAprovadores = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.aprovador.length === aprovadores.length) {
        // Deselect all
        setFormData({ ...formData, aprovador: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          aprovador: aprovadores.map((aprovador) => aprovador.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "aprovador",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllNormaDestinos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normaDestino.length === normaDestinos.length) {
        // Deselect all
        setFormData({ ...formData, normaDestino: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          normaDestino: normaDestinos.map((normaDestino) => normaDestino.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "normaDestino",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllEmpresas = (event, newValue) => {
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
    nome: true,
  });

  const allSelected =
    formData.normaOrigem.length === normaOrigens.length &&
    normaOrigens.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedDiretrizes =
    formData.normaDestino.length === normaDestinos.length &&
    normaDestinos.length > 0;
  const allSelectedEmpresas =
    formData.empresa.length === empresas.length && empresas.length > 0;
  const allSelectedPlanoAcao =
    formData.planoAcao.length === planosAcoes.length && planosAcoes.length > 0;
  const allSelectedAprovadores =
    formData.aprovador.length === aprovadores.length && aprovadores.length > 0;

  const allSelectedDepartamentos =
    formData.departamento.length === departamentos.length &&
    departamentos.length > 0;

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

    if (deletedFiles.length > 0) {
      const deletedFilesPayload = deletedFiles.map((file) => file.name);

      await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          containerFolder: 6,
          files: deletedFilesPayload,
        },
      });
    }

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File)
    );

    let uploadFilesResult = { files: [] };
    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", 6);

      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? dadosApi?.idNormative : ""
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
      uploadFilesResult = uploadResponse.data;
    }

    // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
    const finalFiles = [...existingFiles, ...uploadFilesResult.files];

    // Transforma cada item para que o payload contenha somente a URL (string)
    const finalFilesPayload = finalFiles.map((file) => {
      if (typeof file === "string") return file;
      if (file.path) return file.path;
      return file;
    });

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/normatives";
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
      method = "PUT";
      payload = {
        idNormative: normativaDados.idNormative,
        code: codigo,
        name: nome,
        description: descricao,
        registerDate: formData.dataCadastro,
        //normativeInternType: formData.tipoNorma,
        publishDate: formData.dataPublicacao,
        initialVigency: formData.vigenciaInicial,
        lastRevision: formData.ultimaRevisao,
        conclusion: conclusaoRevisao,
        frequencyRevision: formData.periodicidadeRevisao,
        limitDateRevision: formData.dataLimiteRevisao,
        daysRevision: diasDaRevisao,
        revocationDate: formData.dataRevogacao,
        revocationReason: motivoRevogacao,
        normativeStatus: formData.statusNorma,
        normativeRisk: formData.riscoNorma,
        active: status,
        idNormativeType: formData.tipoNorma,
        idRegulatory: formData.regulador,
        idResponsible: formData.responsavel,
        idOrigins: formData.normaOrigem,
        idDestinies: formData.normaDestino,
        idActionPlans: formData.planoAcao,
        idApprovers: formData.aprovador,
        idCompanies: formData.empresa,
        idDepartments: formData.departamento,
        idProcesses: formData.processo,
        files: finalFilesPayload,
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

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      let companyId;
      if (requisicao === "Editar" && response.status === 204) {
        companyId = normativaDados?.idNormative;
        enqueueSnackbar(`Normativa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      } else {
        const data = await response.json();
        companyId = data.data.idNormative;
        enqueueSnackbar(`Normativa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      // Se for criação, atualiza o estado e exibe o diálogo de sucesso;
      // Se for edição, volta para a listagem.
      if (requisicao === "Criar") {
        setNormativaDados((prev) => ({ ...prev, idNormative: companyId }));
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa normativa.", {
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

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de cadastro</InputLabel>
                  <DatePicker
                    disabled
                    value={formData.dataCadastro || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataCadastro: newValue,
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

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de publicação</InputLabel>
                  <DatePicker
                    value={formData.dataPublicacao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataPublicacao: newValue,
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

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Ambiente</InputLabel>
                  <Autocomplete
                    options={ambientes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      ambientes.find(
                        (ambiente) => ambiente.id === formData.ambiente
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        ambiente: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.ambiente &&
                          formValidation.ambiente === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Regulador</InputLabel>
                  <Autocomplete
                    options={reguladores}
                    getOptionLabel={(option) => option.nome}
                    value={
                      reguladores.find(
                        (regulador) => regulador.id === formData.regulador
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        regulador: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.regulador &&
                          formValidation.regulador === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Norma de origem</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...normaOrigens,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.normaOrigem.map(
                      (id) =>
                        normaOrigens.find(
                          (normaOrigem) => normaOrigem.id === id
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
                          (formData.normaOrigem.length === 0 ||
                            formData.normaOrigem.every((val) => val === 0)) &&
                          formValidation.normaOrigem === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Norma de destino</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...normaDestinos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.normaDestino.map(
                      (id) =>
                        normaDestinos.find(
                          (normaDestino) => normaDestino.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllNormaDestinos}
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
                          (formData.normaDestino.length === 0 ||
                            formData.normaDestino.every((val) => val === 0)) &&
                          formValidation.normaDestino === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Empresas{" "}
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
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...empresas,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.empresa.map(
                      (id) =>
                        empresas.find((empresa) => empresa.id === id) || id
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
                          (formData.empresa.length === 0 ||
                            formData.empresa.every((val) => val === 0)) &&
                          formValidation.empresa === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Vigência inicial</InputLabel>
                  <DatePicker
                    value={formData.vigenciaInicial || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        vigenciaInicial: newValue,
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Última revisão</InputLabel>
                  <DatePicker
                    value={formData.ultimaRevisao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        ultimaRevisao: newValue,
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

              <Grid item xs={4}>
                <Stack spacing={1}>
                  <InputLabel>Status da norma</InputLabel>
                  <Autocomplete
                    options={statusNormas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      statusNormas.find(
                        (item) => item.id === formData.statusNorma
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        statusNorma: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da norma</InputLabel>
                  <Autocomplete
                    options={tipoNormas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tipoNormas.find(
                        (item) => item.id === formData.tipoNorma
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoNorma: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Risco da norma</InputLabel>
                  <Autocomplete
                    options={riscoNormas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      riscoNormas.find(
                        (item) => item.id === formData.riscoNorma
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        riscoNorma: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Conclusão da revisão</InputLabel>
                  <TextField
                    onChange={(event) =>
                      setConclusaoRevisao(event.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    value={conclusaoRevisao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Periodicidade da revisão</InputLabel>
                  <Autocomplete
                    options={periodicidadeRevisoes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      periodicidadeRevisoes.find(
                        (item) => item.id === formData.periodicidadeRevisao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        periodicidadeRevisao: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data limite da revisão</InputLabel>
                  <DatePicker
                    value={formData.dataLimiteRevisao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataLimiteRevisao: newValue,
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

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Dias da revisão</InputLabel>
                  <TextField
                    onChange={(event) => setDiasDaRevisao(event.target.value)}
                    fullWidth
                    value={diasDaRevisao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data da revogação</InputLabel>
                  <DatePicker
                    value={formData.dataRevogacao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataRevogacao: newValue,
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

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Motivo da revogação</InputLabel>
                  <TextField
                    onChange={(event) => setMotivoRevogacao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={motivoRevogacao}
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
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
                    value={formData.aprovador.map(
                      (id) =>
                        aprovadores.find((aprovador) => aprovador.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllAprovadores}
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
                                  ? allSelectedAprovadores
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
                          (formData.aprovador.length === 0 ||
                            formData.aprovador.every((val) => val === 0)) &&
                          formValidation.aprovador === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 0.5 }}
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
              Normativa Criada com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A normativa foi cadastrada com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a essa normativa.
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
