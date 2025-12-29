import {
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
import DrawerDepartamentos from "../configuracoes/novoDepartamentoDrawerAtivos";
import DrawerProcessos from "../configuracoes/novoProcessoDrawerAtivos";
import DrawerIpe from "../configuracoes/novoIpeDrawerAtivo";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [departamentos, setDepartamentos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [nomeAtivo, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [ativoDados, setAtivoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    departamento: [],
    tipoResponsabilidade: [],
    planoAcao: [],
    formatoUnidade: [],
    atividade: [],
    processo: [],
    ambiente: [],
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
            `https://api.egrc.homologacao.com.br/api/v1/actives/${dadosApi.id}`,
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
          setFormData((prev) => ({
            ...prev,
            ambiente: Array.isArray(data.environments)
              ? data.environments.map((u) => u.idEnvironment)
              : [],
            processo: Array.isArray(data.processes)
              ? data.processes.map((u) => u.idProcess)
              : [],
            atividade: data.idInformationActivities || null,
            tipoResponsabilidade: data.idPlatformType || null,
            departamento: data.idDepartments || null,
          }));

          setAtivoDados(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dadosApi]);

  useEffect(() => {
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/departments`,
      setDepartamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/actives/information-activities`,
      setAtividades
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/actives/environments`,
      setAmbientes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/actives/types`,
      setTiposResponsabilidades
    );
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          item.idDepartment ||
          item.idPlatform ||
          item.idRisk ||
          item.idIncident ||
          item.idUnitFormat ||
          item.idResponsabilityType ||
          item.idInformationActivity ||
          item.idPlatformType ||
          item.idEnvironment,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
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
    if (field === "fase") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleIpeCreated = (newIpe) => {
    setAtividades((prevIpes) => [...prevIpes, newIpe]);
    setFormData((prev) => ({
      ...prev,
      atividade: [...prev.atividade, newIpe.id],
    }));
  };

  const handleSelectAllIpes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.atividade.length === atividades.length) {
        // Deselect all
        setFormData({ ...formData, atividade: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          atividade: atividades.map((atividade) => atividade.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "atividade",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectDepartamentos = (event, newValue) => {
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

  const handleSelectAllAmbiente = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ambiente.length === ambientes.length) {
        // Deselect all
        setFormData({ ...formData, ambiente: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          ambiente: ambientes.map((ambiente) => ambiente.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "ambiente",
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
    nomeAtivo: true,
    codigo: true,
  });

  const allSelected =
    formData.departamento.length === departamentos.length &&
    departamentos.length > 0;
  const allSelectedAmbientes =
    formData.ambiente.length === ambientes.length && ambientes.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedAtividades =
    formData.atividade.length === atividades.length && atividades.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeAtivo.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeAtivo: false }));
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

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/actives";
      method = "POST";
      payload = {
        name: nomeAtivo,
        code: codigo,
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/actives`;
      method = "PUT";
      payload = {
        idPlatform: ativoDados?.idPlatform,
        active: true,
        name: nomeAtivo,
        code: codigo,
        description: descricao,
        idPlatformType: formData.tipoResponsabilidade || null,
        idInformationActivities: formData.atividade?.length
          ? formData.atividade
          : null,
        idEnvironments: formData.ambiente?.length ? formData.ambiente : null,
        idDepartments: formData.departamento?.length
          ? formData.departamento
          : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
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
        throw new Error("Não foi possível cadastrar o Ativo.");
      } else {
        enqueueSnackbar(`Ativo ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idPlatform) {
        // Atualiza o estado para modo de edição
        setAtivoDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse ativo.", {
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
                placeholder="Código do ativo"
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
                value={nomeAtivo}
                error={!nomeAtivo && formValidation.nomeAtivo === false}
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
                  <InputLabel>Tipo de Ativo</InputLabel>
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

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Atividades associadas{" "}
                    <DrawerIpe
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onIpeCreated={handleIpeCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...atividades,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.atividade.map(
                      (id) =>
                        atividades.find((atividade) => atividade.id === id) ||
                        id
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
                                  ? allSelectedAtividades
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
                          (formData.atividade.length === 0 ||
                            formData.atividade.every((val) => val === 0)) &&
                          formValidation.atividade === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
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
                      { id: "all", nome: "Selecionar todas" },
                      ...departamentos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamento.map(
                      (id) =>
                        departamentos.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectDepartamentos}
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
                          (formData.departamento.length === 0 ||
                            formData.departamento.every((val) => val === 0)) &&
                          formValidation.departamentoInferior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Ambientes</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...ambientes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.ambiente.map(
                      (id) =>
                        ambientes.find((ambiente) => ambiente.id === id) || id
                    )}
                    onChange={handleSelectAllAmbiente}
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
                                  ? allSelectedAmbientes
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
                          (formData.ambiente.length === 0 ||
                            formData.ambiente.every((val) => val === 0)) &&
                          formValidation.ambiente === false
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
                    <DrawerProcessos
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
              Ativo Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O ativo foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse ativo.
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
