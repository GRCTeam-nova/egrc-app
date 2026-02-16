/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
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
import DrawerProcesso from "./novoProcessoDrawerDeficiencias";
import DrawerControle from "./novoControleDrawerDeficiencias";
import DrawerPlanos from "./novoPlanoDrawerDeficiencias";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [planosAcoes, setPlanoAcao] = useState([]);
  const [controles, setControles] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [causaRaiz, setCausaRaiz] = useState("");
  const [recomendacao, setRecomendacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [deficienciaDados, setDeficienciaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [classificacaoDeficiencias, setClassificacaoDeficiencias] = useState(
    []
  );
  const [tipoDeficiencias, setTipoDeficiencias] = useState([]);
  const [statuss] = useState([
    { id: 1, nome: "Ativa" },
    { id: 2, nome: "solucionada" },
  ]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    statusNorma: "",
    status: "",
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
    tipoDeficiencia: "",
    processo: [],
    normaOrigem: [],
    conta: [],
    responsavel: "",
    data: null,
    dataPrevistaSolucao: null,
    dataSolucao: null,
    vigenciaInicial: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idDeficiency, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idDeficiency ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idFramework ||
          item.idTreatment ||
          item.idDeficiencyClassification ||
          item.idDeficiencyType ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idCompany ||
          item.idDepartment ||
          item.idActionPlan ||
          item.idKri ||
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
      `https://api.egrc.homologacao.com.br/api/v1/deficiencies/types`,
      setTipoDeficiencias
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/deficiencies/classifications`,
      setClassificacaoDeficiencias
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
      `https://api.egrc.homologacao.com.br/api/v1/action-plans`,
      setPlanoAcao
    );
    window.scrollTo(0, 0);
  }, []);

  const handlePlanCreated = (newPlan) => {
    setPlanoAcao((prevPlans) => [...prevPlans, newPlan]);
    setFormData((prev) => ({
      ...prev,
      planoAcao: [...prev.planoAcao, newPlan.id],
    }));
  };

  const handleControlCreated = (newControle) => {
    setControles((prevControles) => [...prevControles, newControle]);
    setFormData((prev) => ({
      ...prev,
      controle: [...prev.controle, newControle.id],
    }));
  };

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            // Corrigido para garantir que pega do ID corretamente
            `https://api.egrc.homologacao.com.br/api/v1/deficiencies/${dadosApi.id || dadosApi.idDeficiency}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados da deficiência");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setNome(data.name);
          setCodigo(data.code);
          setCausaRaiz(data.rootCause);
          setRecomendacao(data.recommendation);
          setDescricao(data.description);
          setFormData((prev) => ({
            ...prev,
            planoAcao: data.idActionPlans || null,
            status: data.deficiencyStatus || null,
            tipoDeficiencia: data.idDeficiencyType || null,
            controle: data.idControls || null,
            processo: data.idProcesses || null,
            classificacaoDeficiencia: data.idDeficiencyClassification || null,
          }));

          setFormData((prev) => ({
            ...prev,
            data: data.date ? new Date(data.date) : null,
            dataPrevistaSolucao: data.expectedDate
              ? new Date(data.expectedDate)
              : null,
            dataSolucao: data.completionDate
              ? new Date(data.completionDate)
              : null,
          }));
          setDeficienciaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      // CORREÇÃO: Agora verifica por `id` ou `idDeficiency`
      if (dadosApi.id || dadosApi.idDeficiency) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "tipoDeficiencia") {
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAllControles = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.controle.length === controles.length) {
        setFormData({ ...formData, controle: [] });
      } else {
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

  const handleSelectAllPlanoAcao = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.planoAcao.length === planosAcoes.length) {
        setFormData({ ...formData, planoAcao: [] });
      } else {
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

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) {
        setFormData({ ...formData, processo: [] });
      } else {
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

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation, setFormValidation] = useState({
    codigo: true,
    nome: true,
  });

  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedPlanoAcao =
    formData.planoAcao.length === planosAcoes.length && planosAcoes.length > 0;
  const allSelectedControles =
    formData.controle.length === controles.length && controles.length > 0;

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
      return; 
    }

    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/deficiencies";
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/deficiencies`;
      method = "PUT";
      payload = {
        // CORREÇÃO no payload: Garantir que puxamos a string correta do id
        idDeficiency: deficienciaDados?.idDeficiency || deficienciaDados?.id,
        code: codigo,
        name: nome,
        description: descricao,
        date: formData.data?.toISOString(),
        rootCause: causaRaiz,
        recommendation: recomendacao,
        expectedDate: formData.dataPrevistaSolucao?.toISOString(),
        completionDate: formData.dataSolucao?.toISOString(),
        deficiencyStatus: formData.status ? formData.status : 0,
        idDeficiencyClassification: formData.classificacaoDeficiencia,
        idDeficiencyType: formData.tipoDeficiencia,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idControls: formData.controle?.length ? formData.controle : null,
        idActionPlans: formData.planoAcao?.length ? formData.planoAcao : null,
        active: true,      
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
        throw new Error("O Código informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Deficiência ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data && (data.data.idDeficiency || data.data.id)) {
        setDeficienciaDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar/editar essa deficiência.", {
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

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Causa raiz</InputLabel>
                  <TextField
                    onChange={(event) => setCausaRaiz(event.target.value)}
                    fullWidth
                    value={causaRaiz}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Recomendação</InputLabel>
                  <TextField
                    onChange={(event) => setRecomendacao(event.target.value)}
                    fullWidth
                    value={recomendacao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Classificação da deficiência</InputLabel>
                  <Autocomplete
                    options={classificacaoDeficiencias}
                    getOptionLabel={(option) => option.nome}
                    value={
                      classificacaoDeficiencias.find(
                        (classificacaoDeficiencia) =>
                          classificacaoDeficiencia.id ===
                          formData.classificacaoDeficiencia
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        classificacaoDeficiencia: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.classificacaoDeficiencia &&
                          formValidation.classificacaoDeficiencia === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da deficiência</InputLabel>
                  <Autocomplete
                    options={tipoDeficiencias}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tipoDeficiencias.find(
                        (tipoDeficiencia) =>
                          tipoDeficiencia.id === formData.tipoDeficiencia
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoDeficiencia: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoDeficiencia &&
                          formValidation.tipoDeficiencia === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Status</InputLabel>
                  <Autocomplete
                    options={statuss}
                    getOptionLabel={(option) => option.nome}
                    value={
                      statuss.find((item) => item.id === formData.status) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        status: newValue ? newValue.id : "",
                        // Se o status for Remediada (id 4), limpa os campos de datas
                        dataPrevistaSolucao:
                          newValue && newValue.id === 4
                            ? null
                            : prev.dataPrevistaSolucao,
                        dataSolucao:
                          newValue && newValue.id === 4
                            ? null
                            : prev.dataSolucao,
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {formData.status !== 4 && (
                <>
                  <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                    <Stack spacing={1}>
                      <InputLabel>Data prevista da solução</InputLabel>
                      <DatePicker
                        value={formData.dataPrevistaSolucao || null}
                        onChange={(newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataPrevistaSolucao: newValue,
                          }))
                        }
                        slotProps={{
                          textField: { placeholder: "00/00/0000" },
                        }}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                    <Stack spacing={1}>
                      <InputLabel>Data da solução</InputLabel>
                      <DatePicker
                        value={formData.dataSolucao || null}
                        onChange={(newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSolucao: newValue,
                          }))
                        }
                        slotProps={{
                          textField: { placeholder: "00/00/0000" },
                        }}
                      />
                    </Stack>
                  </Grid>
                </>
              )}

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
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...controles,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.controle.map(
                      (id) =>
                        controles.find((controle) => controle.id === id) || id
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
                                option.id === "all"
                                  ? allSelectedControles
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
                            formData.controle.every((val) => val === 0)) &&
                          formValidation.controle === false
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
              Deficiência criada com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A deficiência foi cadastrada com sucesso. Você pode voltar para
                a listagem ou adicionar mais informações a essa deficiência.
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