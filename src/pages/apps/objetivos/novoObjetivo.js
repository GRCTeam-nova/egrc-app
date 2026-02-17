/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Box,
  TextField,
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import { useToken } from "../../../api/TokenContext";
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [grupo, setGrupo] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [controleDados, setControleDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setLoading(true);
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}objective/${dadosApi.idObjective}`,
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
          setGrupo(data.group)
          setDescricao(data.description);
          setStatus(data.active);
          // setFormData((prev) => ({
          //   ...prev,
          //   deficiencia: data.idDeficiencies || null,
          //   ipe: data.idInformationActivities || null,
          //   elemento: data.idControlElementCosos || null,
          //   risco: data.idRisks || null,
          //   ativo: data.idPlatforms || null,
          //   compensadoControle: data.idControlCompensateds || null,
          //   objetivoControle: data.idControlObjectives || null,
          //   processo: data.idProcess || null,
          //   responsavel: data.idResponsible || null,
          //   conta: data.idControlLedgerAccounts || null,
          // }));

          setControleDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false);
        } finally {
          setLoading(false);
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idObjective) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

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
    descricao: true,
  });


  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Referência");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!descricao.trim()) {
      setFormValidation((prev) => ({ ...prev, descricao: false }));
      missingFields.push("Descrição");
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
      url = `${process.env.REACT_APP_API_URL}objective`;
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        description: descricao
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}objective`;
      method = "PUT";
      payload = {
        idObjective: controleDados?.idObjective,
        code: codigo,
        name: nome,
        description: descricao,
        group: grupo,
        active: status
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
        enqueueSnackbar(`Objetivo ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idObjective) {
        // Atualiza o estado para modo de edição
        setControleDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse objetivo.", {
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
              <InputLabel>Referência *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição *</InputLabel>
                  <TextField
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricao}
                    error={!descricao && formValidation.descricao === false}
                  />
                </Stack>
              </Grid>

          {requisicao === "Editar" && (
            <>
              
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Grupo</InputLabel>
                  <TextField
                    onChange={(event) => setGrupo(event.target.value)}
                    fullWidth
                    value={grupo}
                  />
                </Stack>
              </Grid>

              <Grid item xs={1.5} mt={4} ml={4}>
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
              Objetivo criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O objetivo foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse objetivo.
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
