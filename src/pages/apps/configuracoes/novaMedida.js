/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Autocomplete,
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

// ==============================|| NOVA MEDIDA ||============================== //
function NovaMedida() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [medidaDados, setMedidaDados] = useState(location.state?.medidaDados || null);
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch data if accessed directly by ID
  useEffect(() => {
    const fetchMeasureData = async () => {
      if (id && !medidaDados && token) {
        try {
          setLoading(true);
          const res = await axios.get(`https://api.egrc.homologacao.com.br/api/v1/Measure`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const measures = Array.isArray(res.data) ? res.data : [];
          const item = measures.find(m => m.id === id || m.measureCode === id);
          if (item) {
            setMedidaDados(item);
          } else {
            enqueueSnackbar("Medida não encontrada", { variant: "error" });
          }
        } catch (error) {
          console.error("Erro ao buscar dados da medida:", error);
          enqueueSnackbar("Não foi possível carregar os dados da medida", { variant: "error" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMeasureData();
  }, [id, token]);

  const [formatos, setFormatos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    id: "",
    codigo_medida: "",
    nome_medida: "", 
    formato: null, 
    unidade: null,
    active: true
  });

  useEffect(() => {
    const fetchEnums = async () => {
      if (!token) return;
      try {
        const response = await axios.get("https://api.egrc.homologacao.com.br/api/v1/Measure/enums", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // The API returns an object with "formats" and "units" directly
        const data = response.data || {};
        
        setFormatos(data.formats || []);
        setUnidades(data.units || []);
      } catch (error) {
        console.error("Erro ao buscar enums da medida:", error);
      }
    };
    fetchEnums();
  }, [token]);

  // Em caso de edição
  useEffect(() => {
    if (medidaDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");
      setFormData({
        id: medidaDados.id || "",
        codigo_medida: medidaDados.measureCode || "",
        nome_medida: medidaDados.measureName || "",
        formato: medidaDados.measureFormatId || null,
        unidade: medidaDados.measureUnitId || null,
        active: medidaDados.active !== undefined ? medidaDados.active : true
      });
    }
  }, [medidaDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    codigo_medida: true,
    nome_medida: true,
    formato: true,
    unidade: true,
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
    
    if (!formData.codigo_medida.trim()) {
      setFormValidation(prev => ({ ...prev, codigo_medida: false }));
      missingFields.push("Código da Medida");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, codigo_medida: true }));
    }
    
    if (!formData.nome_medida.trim()) {
      setFormValidation(prev => ({ ...prev, nome_medida: false }));
      missingFields.push("Nome da Medida");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, nome_medida: true }));
    }

    if (!formData.formato) {
      setFormValidation(prev => ({ ...prev, formato: false }));
      missingFields.push("Formato");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, formato: true }));
    }

    if (!formData.unidade) {
      setFormValidation(prev => ({ ...prev, unidade: false }));
      missingFields.push("Unidade");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, unidade: true }));
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
      
      const payload = {
        measureCode: formData.codigo_medida,
        measureName: formData.nome_medida,
        measureFormatId: formData.formato,
        measureUnitId: formData.unidade
      };

      if (requisicao === "Criar") {
        await axios.post("https://api.egrc.homologacao.com.br/api/v1/Measure", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        payload.id = formData.id;
        payload.active = formData.active;
        await axios.put("https://api.egrc.homologacao.com.br/api/v1/Measure", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      enqueueSnackbar(`Medida ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar a medida.", {
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
          <Typography variant="h4" gutterBottom>
            {requisicao === "Criar" ? "Nova Medida" : "Editar Medida"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {/* Campos da Medida */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Código da Medida *</InputLabel>
            <TextField
              fullWidth
              value={formData.codigo_medida}
              onChange={(e) => handleInputChange('codigo_medida', e.target.value)}
              disabled={requisicao === "Editar"}
              error={!formValidation.codigo_medida}
              placeholder="Ex: LT"
              helperText={!formValidation.codigo_medida ? "Campo obrigatório" : "Ex: LT"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Nome da Medida *</InputLabel>
            <TextField
              fullWidth
              value={formData.nome_medida}
              onChange={(e) => handleInputChange('nome_medida', e.target.value)}
              error={!formValidation.nome_medida}
              placeholder="Ex: Litro"
              helperText={!formValidation.nome_medida ? "Campo obrigatório" : "Ex: Litro"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Formato *</InputLabel>
            <Autocomplete
              options={formatos}
              getOptionLabel={(option) => option.name || ""}
              value={formatos.find(f => f.id === formData.formato) || null}
              onChange={(event, newValue) => {
                handleInputChange('formato', newValue ? newValue.id : null);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.formato}
                  helperText={!formValidation.formato ? "Campo obrigatório" : "Formato dos valores da medida"}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Unidade *</InputLabel>
            <Autocomplete
              options={unidades}
              getOptionLabel={(option) => option.name || ""}
              value={unidades.find(u => u.id === formData.unidade) || null}
              onChange={(event, newValue) => {
                handleInputChange('unidade', newValue ? newValue.id : null);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.unidade}
                  helperText={!formValidation.unidade ? "Campo obrigatório" : "Unidade de medida"}
                />
              )}
            />
          </Stack>
        </Grid>

        {/* Botões de ação */}
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
              disabled={requisicao === "Editar" ? !hasChanges : !(formData.codigo_medida?.trim() && formData.nome_medida?.trim() && formData.formato && formData.unidade)}
              sx={{ minWidth: 120 }}
            >
              {requisicao === "Criar" ? "Criar" : "Atualizar"}
            </Button>
            <Button
              variant="outlined"
              onClick={voltarParaCadastroMenu}
              sx={{ minWidth: 120 }}
            >
              Cancelar
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog de Sucesso */}
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
          Medida criada com sucesso!
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
            A medida foi criada com sucesso. Você pode continuar editando ou voltar para a listagem.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button
            onClick={continuarEdicao}
            variant="outlined"
            sx={{ minWidth: "120px" }}
          >
            Continuar Editando
          </Button>
          <Button
            onClick={voltarParaListagem}
            variant="contained"
            sx={{ minWidth: "120px" }}
          >
            Voltar para Listagem
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NovaMedida;
