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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
import DrawerAtivo from "../configuracoes/novoAtivoDrawerIpes";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerControles";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [tiposInformacao, setTipoInformacoes] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricaoInformacao, setDescricaoInformacao] = useState("");
  const [descricaoGeracao, setDescricaoGeracao] = useState("");
  const [descricaoAcuracidade, setDescricaoAcuracidade] = useState("");
  const [descricaoCompletude, setDescricaoCompletude] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [localInformacao, setLocalInformacao] = useState("");
  const [financeira, setFinanceira] = useState(false);
  const [critica, setCritica] = useState(false);
  const [editavel, setEditavel] = useState(false);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    ativo: [],
    ipe: [],
    compensadoControle: [],
    compensaControle: [],
    objetivoControle: [],
    kri: [],
    elemento: [],
    carv: [],
    plano: [],
    deficiencia: [],
    ameaca: [],
    normativa: [],
    assertion: [],
    departamento: [],
    categoria: "",
    frequencia: "",
    execucao: "",
    classificacao: "",
    tipoInformacao: "",
    processo: [],
    risco: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idControl, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idControl ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idControl ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idInformationType ||
          item.idNormative ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idObjective ||
          item.idLedgerAccount ||
          item.idInformationActivity ||
          item.idAssertion ||
          item.idRisk ||
          item.idDeficiency ||
          item.idPlatform,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/actives`, setAtivos);
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/ipe/types`,
      setTipoInformacoes
    );
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/ipe/${dadosApi.idInformationActivity}`,
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
          setDescricaoInformacao(data.description);
          setDescricaoAcuracidade(data.generationAccuracy);
          setDescricaoCompletude(data.generationCompleteness);
          setDescricaoGeracao(data.generationDescription);
          setLocalInformacao(data.location)
          setFinanceira(data.financialInformation)
          setCritica(data.criticize)
          setEditavel(data.editable)
          setStatus(data.active)
          setFormData((prev) => ({
            ...prev,
            ativo: Array.isArray(data.platforms)
              ? data.platforms.map((u) => u.idPlatform)
              : [],
            processo: data.idProcesses || null,
            tipoInformacao: data.idInformationType || null,
          }));
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idInformationActivity) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };


  const handleActiveCreated = (newAtivo) => {
    setAtivos((prevAtivos) => [...prevAtivos, newAtivo]);
    setFormData((prev) => ({
      ...prev,
      ativo: [...prev.ativo, newAtivo.id],
    }));
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);

    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };
  const handleSelectAllAtivos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ativo.length === ativos.length) {
        // Deselect all
        setFormData({ ...formData, ativo: [] });
      } else {
        // Select all
        setFormData({ ...formData, ativo: ativos.map((ativo) => ativo.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "ativo",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllProcessos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) {
        // Deselect all
        setFormData({ ...formData, processo: [] });
      } else {
        // Select all
        setFormData({ ...formData, processo: processos.map((processo) => processo.id) });
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
    empresaInferior: true,
    nome: true,
  });

  
  const allSelectedAtivos = formData.ativo.length === ativos.length && ativos.length > 0;
  const allSelectedProcessos = formData.processo.length === processos.length && processos.length > 0;

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

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/ipe";
      method = "POST";
      payload = {
        code: codigo,
        name: nome
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/ipe`;
      method = "PUT";
      payload = {
        idInformationActivity: dadosApi?.idInformationActivity,
        code: codigo,
        name: nome,
        description: descricaoInformacao,
        location: localInformacao,
        financialInformation: financeira,
        criticize: critica,
        editable: editavel,
        generationDescription: descricaoGeracao,
        generationAccuracy: descricaoAcuracidade,
        generationCompleteness: descricaoCompletude,
        active: status,
        idInformationType: formData.tipoInformacao ? formData.tipoInformacao : null,
        idProcesses: formData.processo,
        idPlatforms: formData.ativo,
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
        enqueueSnackbar(`IPE ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idInformationActivity) {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse ipe.", {
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
              
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da informação</InputLabel>
                  <Autocomplete
                    options={tiposInformacao}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposInformacao.find(
                        (tipoInformacao) =>
                          tipoInformacao.id === formData.tipoInformacao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoInformacao: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoInformacao &&
                          formValidation.tipoInformacao === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Local da informação</InputLabel>
              <TextField
                onChange={(event) => setLocalInformacao(event.target.value)}
                fullWidth
                value={localInformacao}
              />
            </Stack>
          </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da informação</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoInformacao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoInformacao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da geração</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoGeracao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoGeracao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da acuracidade</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoAcuracidade(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoAcuracidade}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da completude</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoCompletude(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoCompletude}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Ativo{" "}
                    <DrawerAtivo
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onActiveCreated={handleActiveCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...ativos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.ativo.map(
                      (id) => ativos.find((ativo) => ativo.id === id) || id
                    )}
                    onChange={handleSelectAllAtivos}
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
                                  ? allSelectedAtivos
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
                          (formData.ativo.length === 0 ||
                            formData.ativo.every((val) => val === 0)) &&
                          formValidation.ativo === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                Processos {" "}
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
                      { id: "all", nome: "Selecionar todos" },
                      ...processos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processo.map(
                      (id) => processos.find((processo) => processo.id === id) || id
                    )}
                    onChange={handleSelectAllProcessos}
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
                                  ? allSelectedProcessos
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
                            formData.processo.every((val) => val === 0)) &&
                          formValidation.processo === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={1.5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={financeira}
                      onChange={(event) => setFinanceira(event.target.checked)}
                    />
                    <Typography>Financeira</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={critica}
                      onChange={(event) => setCritica(event.target.checked)}
                    />
                    <Typography>Critíca</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5} mb={5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={editavel}
                      onChange={(event) => setEditavel(event.target.checked)}
                    />
                    <Typography>Editável</Typography>
                  </Stack>
                </Stack>
              </Grid>
              
              <Grid item xs={1.5} mb={5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>Ativo</Typography>
                  </Stack>
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
              IPE criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O IPE foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse IPE.
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
