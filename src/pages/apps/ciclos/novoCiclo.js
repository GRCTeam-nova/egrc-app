/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from "config";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Switch,
  Stack,
  Typography,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ListaCiclosAvaliacoes from "../ciclos/listaCiclosAvaliacao";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [tiposConsolidacoes, setTiposConsolidacoes] = useState([]);
  const [ciclosAnteriores, setCiclosAnteiores] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState(true);
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [cicloDados, setCicloDados] = useState(null);
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
    tipoConsolidacao: "",
    processo: [],
    cicloAnterior: [],
    conta: [],
    responsavel: "",
    dataBase: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCycle, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idCycle ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idCycle ||
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
    setTiposConsolidacoes([
      { id: 1, nome: "Media" },
      { id: 2, nome: "Pior avaliação" },
    ]);
    fetchData(`${process.env.REACT_APP_API_URL}cycles`, setCiclosAnteiores);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setLoading(true)
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}cycles/${dadosApi.idCycle}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
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
          setStatus(data.active);
          setFormData((prev) => ({
            ...prev,
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
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            tipoConsolidacao: data.typeConsolidation || null,
            controle: data.idControls || null,
            framework: data.idFramework || null,
            processo: data.idProcesses || null,
            responsavel: data.idResponsible || null,
            cicloAnterior: data.idPreviousCycle || null,
            ameaca: data.idThreats || null,
            tratamento: data.idTreatment || null,
          }));

          setFormData((prev) => ({
            ...prev,
            dataBase: data.baseDate ? new Date(data.baseDate) : null,
          }));

          setCicloDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false)
        } finally {
          setLoading(false)
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idCycle) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nome);

    // Verifica e remove o departamento superior se necessário
    const superiorSelecionada = ciclosAnteriores.find(
      (ciclo) => ciclo.id === formData.cicloAnterior,
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        cicloAnterior: null,
      }));
    }
  }, [nome, ciclosAnteriores, formData.cicloAnterior]);

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
    if (formData.dataBase === null) {
      setFormValidation((prev) => ({ ...prev, dataBase: false }));
      missingFields.push("Data base");
    }
    if (formData.tipoConsolidacao === "") {
      setFormValidation((prev) => ({ ...prev, tipoConsolidacao: false }));
      missingFields.push("Tipo de consolidação");
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
      url = `${process.env.REACT_APP_API_URL}cycles`;
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        baseDate: formData.dataBase?.toISOString(),
        typeConsolidation: formData.tipoConsolidacao,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}cycles`;
      method = "PUT";
      payload = {
        idCycle: cicloDados?.idCycle,
        code: codigo,
        name: nome,
        description: descricao,
        baseDate: formData.dataBase?.toISOString(),
        active: status,
        typeConsolidation: formData.tipoConsolidacao,
        idPreviousCycle: formData.cicloAnterior?.length
          ? formData.cicloAnterior
          : null,
      };
    }

    try {
      setLoading(true);

      // Realiza a requisição (POST ou PUT)
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Verifica se a resposta não foi bem-sucedida e tenta extrair mensagem de erro, se possível
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Se não houver corpo na resposta, ignora
        }
        throw new Error(
          errorData.message || "O Código informado já foi cadastrado.",
        );
      }

      // Se for edição e o status for 204 (No Content), não há corpo para processar
      if (requisicao === "Editar" && response.status === 204) {
        enqueueSnackbar(`Ciclo ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
        voltarParaCadastroMenu();
      } else {
        const data = await response.json();
        enqueueSnackbar(`Ciclo ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
        if (requisicao === "Criar" && data.data.idCycle) {
          // Atualiza o estado para modo de edição
          setCicloDados(data.data);
          setSuccessDialogOpen(true);
        } else {
          voltarParaCadastroMenu();
        }
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse ciclo.", {
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
                placeholder="Código do ciclo"
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
              <InputLabel>Data base *</InputLabel>
              <DatePicker
                error={!formData.dataBase && formValidation.dataBase === false}
                value={formData.dataBase || null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    dataBase: newValue,
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
              <InputLabel>Tipo de Consolidação *</InputLabel>
              <Autocomplete
                options={tiposConsolidacoes}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposConsolidacoes.find(
                    (tipoConsolidacao) =>
                      tipoConsolidacao.id === formData.tipoConsolidacao,
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoConsolidacao: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoConsolidacao &&
                      formValidation.tipoConsolidacao === false
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
                  <InputLabel>Ciclo Anterior</InputLabel>
                  <Autocomplete
                    options={ciclosAnteriores.filter((ciclo) => {
                      // IDs dos departamentos já selecionados nos outros campos:
                      const selectedInferior = formData.cicloAnterior || [];
                      const selectedIds = [...selectedInferior];

                      // Se for o valor atual selecionado, não filtra
                      if (formData.cicloAnterior === ciclo.id) return true;

                      // Exclui se já estiver selecionado em outro campo ou se o nome for igual ao nome do departamento atual
                      return (
                        !selectedIds.includes(ciclo.id) &&
                        formatarNome(ciclo.nome) !== formatarNome(nome)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      ciclosAnteriores.find(
                        (cicloAnterior) =>
                          cicloAnterior.id === formData.cicloAnterior,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        cicloAnterior: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.cicloAnterior &&
                          formValidation.cicloAnterior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 37.5, marginLeft: 37.5 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>{status ? "Ativo" : "Inativo"}</Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* <Grid item xs={12} sx={{ paddingBottom: 5 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Avaliações</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ListagemAvaliacoes />
            </AccordionDetails>
          </Accordion>
        </Grid> */}

              {cicloDados?.idCycle && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Avaliações</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      <ListaCiclosAvaliacoes cicloId={cicloDados.idCycle} />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
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
                marginTop: 10,
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
              Ciclo Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O ciclo foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse ciclo.
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
