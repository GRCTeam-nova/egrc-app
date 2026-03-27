/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// ==============================|| NOVA DIMENSÃO ||============================== //
function NovaDimensao() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);

  const [dimensaoDados, setDimensaoDados] = useState(location.state?.dimensaoDados || null);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    id: "",
    dimensionCode: "",
    dimensionName: "",
    active: true
  });

  // Fetch data if accessed directly by ID
  useEffect(() => {
    const fetchDimensaoData = async () => {
      if (id && !dimensaoDados && token) {
        try {
          setLoading(true);
          const res = await axios.get(`https://api.egrc.homologacao.com.br/api/v1/Dimension`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Find the specific dimension in the list
          const item = Array.isArray(res.data) ? res.data.find(d => d.id === id || d.dimensionCode === id) : null;
          if (item) {
            setDimensaoDados(item);
          } else {
            enqueueSnackbar("Dimensão não encontrada", { variant: "error" });
          }
        } catch (error) {
          console.error("Erro ao buscar dados da dimensão:", error);
          enqueueSnackbar("Não foi possível carregar os dados da dimensão", { variant: "error" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDimensaoData();
  }, [id, token]);

  // Handle edit mode
  useEffect(() => {
    if (dimensaoDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");
      setFormData({
        id: dimensaoDados.id || "",
        dimensionCode: dimensaoDados.dimensionCode || "",
        dimensionName: dimensaoDados.dimensionName || "",
        active: dimensaoDados.active !== undefined ? dimensaoDados.active : true
      });
    }
  }, [dimensaoDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    dimensionCode: true,
    dimensionName: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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

  const tratarSubmit = async () => {
    const missingFields = [];
    let isValid = true;
    
    if (!formData.dimensionCode?.toString().trim()) {
      setFormValidation(prev => ({ ...prev, dimensionCode: false }));
      missingFields.push("Código da Dimensão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, dimensionCode: true }));
    }
    
    if (!formData.dimensionName?.toString().trim()) {
      setFormValidation(prev => ({ ...prev, dimensionName: false }));
      missingFields.push("Nome da Dimensão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, dimensionName: true }));
    }

    if (!isValid) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 
        ? "são obrigatórios e devem estar válidos!" 
        : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      const payload = requisicao === "Criar" 
        ? { dimensionCode: formData.dimensionCode, dimensionName: formData.dimensionName }
        : { 
            id: formData.id, 
            dimensionCode: formData.dimensionCode, 
            dimensionName: formData.dimensionName, 
            active: formData.active 
          };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (requisicao === "Criar") {
        await axios.post("https://api.egrc.homologacao.com.br/api/v1/Dimension", payload, config);
      } else {
        await axios.put("https://api.egrc.homologacao.com.br/api/v1/Dimension", payload, config);
      }
      
      enqueueSnackbar(`Dimensão ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaListagem();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível salvar a dimensão.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <Grid container spacing={3} marginTop={1}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1C5297', fontWeight: 600 }}>
            {requisicao === "Criar" ? "Nova Dimensão" : "Editar Dimensão"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 600, fontSize: '13px' }}>Código da Dimensão *</InputLabel>
            <TextField
              fullWidth
              value={formData.dimensionCode}
              onChange={(e) => handleInputChange('dimensionCode', e.target.value)}
              error={!formValidation.dimensionCode}
              disabled={requisicao === "Editar"}
              placeholder="Ex: LOC"
              helperText={!formValidation.dimensionCode ? "Campo obrigatório" : "Identificador curto"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 600, fontSize: '13px' }}>Nome da Dimensão *</InputLabel>
            <TextField
              fullWidth
              value={formData.dimensionName}
              onChange={(e) => handleInputChange('dimensionName', e.target.value)}
              error={!formValidation.dimensionName}
              placeholder="Ex: Localização"
              helperText={!formValidation.dimensionName ? "Campo obrigatório" : "Nome detalhado"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={tratarSubmit}
              disabled={requisicao === "Editar" ? !hasChanges : !(formData.dimensionCode?.trim() && formData.dimensionName?.trim())}
              sx={{ minWidth: 120, borderRadius: '8px', textTransform: 'none' }}
            >
              {requisicao === "Criar" ? "Criar" : "Atualizar"}
            </Button>
            <Button
              variant="outlined"
              onClick={voltarParaCadastroMenu}
              sx={{ minWidth: 120, borderRadius: '8px', textTransform: 'none' }}
            >
              Cancelar
            </Button>
          </Box>
        </Grid>
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
        <Box display="flex" justifyContent="center" mt={2}>
          <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
        </Box>

        <DialogTitle
          sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
        >
          Dimensão criada com sucesso!
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
            A dimensão foi criada com sucesso. Você pode continuar editando ou voltar para a listagem.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button
            onClick={continuarEdicao}
            variant="outlined"
            sx={{ minWidth: "120px", textTransform: 'none' }}
          >
            Continuar Editando
          </Button>
          <Button
            onClick={voltarParaListagem}
            variant="contained"
            sx={{ minWidth: "120px", textTransform: 'none' }}
          >
            Voltar para Listagem
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NovaDimensao;
