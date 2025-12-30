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
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import DrawerDepartamento from "../configuracoes/novoDepartamentoDrawerIncidentes";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerIncidentes";
import DrawerRisco from "../configuracoes/novoRiscoDrawerIncidentes";
import { NumericFormat } from "react-number-format";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [valor, setValor] = useState("");
  // --- NOVO STATE ---
  const [valorRecuperado, setValorRecuperado] = useState(""); 
  // ------------------
  const [tiposIncidentes, setTipoIncidentes] = useState([]);
  const [riscos, setRiscoAssociados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [causaIncidente, setCausaIncidente] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [baseOrigem, setBaseOrigem] = useState("");
  const [outrasInformacoes, setOutrasInformacoes] = useState("");
  const [status] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [incidenteDados, setIncidenteDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    tipoIncidente: "",
    processo: [],
    risco: [],
    conta: [],
    responsavel: "",
    dataIndice: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idIncident, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idIncident ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.idRisk ||
          item.idCategory ||
          item.idIncident ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idIncidentType,
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
      `${process.env.REACT_APP_API_URL}incidents/types`,
      setTipoIncidentes
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}departments`,
      setDepartamentos
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}risks`,
      setRiscoAssociados
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}incidents/${dadosApi.idIncident}`,
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
          setValor(data.value);
          // --- SETAR VALOR RECUPERADO NA EDIÇÃO ---
          setValorRecuperado(data.recoveredValue);
          // ----------------------------------------
          setCausaIncidente(data.cause);
          setOutrasInformacoes(data.information);
          setBaseOrigem(data.origin);
          setFormData((prev) => ({
            ...prev,
            causa: Array.isArray(data.causes)
              ? data.causes.map((u) => u.idCause)
              : [],
            departamento: data.idDepartments,
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
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            tipoIncidente: data.idIncidentType || null,
            controle: data.idControls || null,
            framework: data.idFramework || null,
            processo: data.idProcesses || null,
            responsavel: data.idResponsible || null,
            risco: data.idRisks || null,
            ameaca: data.idThreats || null,
            tratamento: data.idTreatment || null,
          }));

          setFormData((prev) => ({
            ...prev,
            dataIndice: data.date ? new Date(data.date) : null,
          }));

          setIncidenteDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idIncident) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "tipoIncidente") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
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

  const handleRiskCreated = (newRisco) => {
    setRiscoAssociados((prevRiscos) => [...prevRiscos, newRisco]);
    setFormData((prev) => ({
      ...prev,
      risco: [...prev.risco, newRisco.id],
    }));
  };

  const handleSelectAll = (event, newValue) => {
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
    empresaInferior: true,
    nome: true,
    dataIndice: true,
    tiposIncidentes: true,
  });

  const allSelected =
    formData.risco.length === riscos.length && riscos.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
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
    if (!formData.dataIndice) {
      setFormValidation((prev) => ({ ...prev, dataIndice: false }));
      missingFields.push("Data");
    }
    if (!formData.tipoIncidente) {
      setFormValidation((prev) => ({ ...prev, tipoIncidente: false }));
      missingFields.push("Tipo do Incidente");
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
      url = `${process.env.REACT_APP_API_URL}incidents`;
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        date: formData.dataIndice ? formData.dataIndice.toISOString() : null,
        idIncidentType:
          formData.tipoIncidente && formData.tipoIncidente !== ""
            ? formData.tipoIncidente
            : null,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}incidents`;
      method = "PUT";
      payload = {
        idIncident: incidenteDados?.idIncident,
        code: codigo,
        name: nome,
        description: descricao,
        date: formData.dataIndice ? formData.dataIndice.toISOString() : null,
        active: status,
        value: valor,
        // --- ENVIO DO VALOR RECUPERADO ---
        recoveredValue: valorRecuperado, 
        // ---------------------------------
        cause: causaIncidente,
        information: outrasInformacoes,
        origin: baseOrigem,
        idIncidentType:
          formData.tipoIncidente && formData.tipoIncidente !== ""
            ? formData.tipoIncidente
            : null,
        idDepartments: formData.departamento?.length
          ? formData.departamento
          : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idRisks: formData.risco?.length ? formData.risco : null,
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
        enqueueSnackbar(`Incidente ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idIncident) {
        // Atualiza o estado para modo de edição
        setIncidenteDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse incidente.", {
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
              <InputLabel>Data *</InputLabel>
              <DatePicker
                value={formData.dataIndice || null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    dataIndice: newValue,
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
              <InputLabel>Tipo do Incidente *</InputLabel>
              <Autocomplete
                options={tiposIncidentes}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposIncidentes.find(
                    (tipoIncidente) =>
                      tipoIncidente.id === formData.tipoIncidente
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoIncidente: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoIncidente &&
                      formValidation.tipoIncidente === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Valor</InputLabel>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    value={
                      valor !== "" && !isNaN(Number(valor))
                        ? Number(valor).toFixed(2).replace(".", ",")
                        : ""
                    }
                    onValueChange={(values) => {
                      setValor(values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={true} 
                    inputProps={{ inputMode: "decimal" }}
                  />
                </Stack>
              </Grid>

              {/* --- NOVO CAMPO VALOR RECUPERADO --- */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Valor Recuperado</InputLabel>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    value={
                      valorRecuperado !== "" && !isNaN(Number(valorRecuperado))
                        ? Number(valorRecuperado).toFixed(2).replace(".", ",")
                        : ""
                    }
                    onValueChange={(values) => {
                      setValorRecuperado(values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={true}
                    inputProps={{ inputMode: "decimal" }}
                  />
                </Stack>
              </Grid>
              {/* ----------------------------------- */}

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
                  <InputLabel>Causa do Incidente</InputLabel>
                  <TextField
                    onChange={(event) => setCausaIncidente(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={causaIncidente}
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
                    Departamentos afetados{" "}
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
                  <InputLabel>Base de origem</InputLabel>
                  <TextField
                    onChange={(event) => setBaseOrigem(event.target.value)}
                    fullWidth
                    value={baseOrigem}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Outras informações</InputLabel>
                  <TextField
                    onChange={(event) =>
                      setOutrasInformacoes(event.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    value={outrasInformacoes}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-1}>
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
              Incidente Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O incidente foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse incidente.
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