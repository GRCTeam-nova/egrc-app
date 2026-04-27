/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from 'config';
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
  Autocomplete,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// ==============================|| NOVO FATOR DE EMISSÃO ESG ||============================== //
function NovoFatorEmissaoESG() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { fatorEmissao } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [unidades, setUnidades] = useState([]);
  const [fontes, setFontes] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    emissionFactorESGCode: "",
    emissionFactorESGName: "",
    originUnitId: null,
    originValue: "",
    convertedUnitId: null,
    dataSourceId: null,
    convertedOriginValue: "",
    emissionFactorESGDescription: "",
    active: true
  });

  // Em caso de edição
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [resUnits, resSources] = await Promise.all([
          axios.get("https://api.egrc.homologacao.com.br/api/v1/Measure/enums", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}DataSource`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUnidades(resUnits.data?.units || []);
        setFontes(resSources.data || []);
      } catch (e) {
        console.error("Erro ao buscar dados auxiliares:", e);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (fatorEmissao) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      setFormData({
        id: fatorEmissao.id || "",
        emissionFactorESGCode: fatorEmissao.emissionFactorESGCode || "",
        emissionFactorESGName: fatorEmissao.emissionFactorESGName || "",
        originUnitId: fatorEmissao.originUnitId || null,
        originValue: fatorEmissao.originValue ?? "",
        convertedUnitId: fatorEmissao.convertedUnitId || null,
        dataSourceId: fatorEmissao.dataSourceId || null,
        convertedOriginValue: fatorEmissao.convertedOriginValue ?? "",
        emissionFactorESGDescription: fatorEmissao.emissionFactorESGDescription || "",
        active: fatorEmissao.active ?? true
      });
    }
  }, [fatorEmissao]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    emissionFactorESGCode: true,
    emissionFactorESGName: true,
    originUnitId: true,
    originValue: true,
    convertedUnitId: true,
    dataSourceId: true,
    convertedOriginValue: true,
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
    
    if (!formData.emissionFactorESGCode) {
      setFormValidation(prev => ({ ...prev, emissionFactorESGCode: false }));
      missingFields.push("Código");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, emissionFactorESGCode: true }));
    }
    
    if (!formData.emissionFactorESGName?.trim()) {
      setFormValidation(prev => ({ ...prev, emissionFactorESGName: false }));
      missingFields.push("Nome");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, emissionFactorESGName: true }));
    }

    if (!formData.originUnitId) {
        setFormValidation(prev => ({ ...prev, originUnitId: false }));
        missingFields.push("Unidade de Origem");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, originUnitId: true }));
    }

    if (!formData.convertedUnitId) {
        setFormValidation(prev => ({ ...prev, convertedUnitId: false }));
        missingFields.push("Unidade da Conversão");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, convertedUnitId: true }));
    }

    if (!formData.dataSourceId) {
        setFormValidation(prev => ({ ...prev, dataSourceId: false }));
        missingFields.push("Fonte de Dados");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, dataSourceId: true }));
    }

    if (formData.originValue === "" || isNaN(Number(formData.originValue))) {
        setFormValidation(prev => ({ ...prev, originValue: false }));
        missingFields.push("Valor de Origem");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, originValue: true }));
    }

    if (formData.convertedOriginValue === "" || isNaN(Number(formData.convertedOriginValue))) {
        setFormValidation(prev => ({ ...prev, convertedOriginValue: false }));
        missingFields.push("Valor Convertido");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, convertedOriginValue: true }));
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
        emissionFactorESGCode: formData.emissionFactorESGCode,
        emissionFactorESGName: formData.emissionFactorESGName,
        originUnitId: formData.originUnitId,
        originValue: Number(formData.originValue),
        convertedUnitId: formData.convertedUnitId,
        dataSourceId: formData.dataSourceId,
        convertedOriginValue: Number(formData.convertedOriginValue),
        emissionFactorESGDescription: formData.emissionFactorESGDescription
      };

      const url = `${API_URL}EmissionFactorESG`;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (requisicao === "Criar") {
        await axios.post(url, payload, config);
      } else {
        await axios.put(url, { ...payload, id: formData.id, active: formData.active }, config);
      }
      
      enqueueSnackbar(`Fator de Emissão ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o fator de emissão.", {
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
            {requisicao === "Criar" ? "Novo Fator de Emissão ESG" : "Editar Fator de Emissão ESG"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Código do Fator de Emissão *</InputLabel>
            <TextField
              fullWidth
              value={formData.emissionFactorESGCode}
              onChange={(e) => handleInputChange('emissionFactorESGCode', e.target.value)}
              error={!formValidation.emissionFactorESGCode}
              placeholder="Ex: 123"
              disabled={requisicao === "Editar"}
              helperText="Ex: 123"
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Nome do Fator de Emissão *</InputLabel>
            <TextField
              fullWidth
              value={formData.emissionFactorESGName}
              onChange={(e) => handleInputChange('emissionFactorESGName', e.target.value)}
              error={!formValidation.emissionFactorESGName}
              placeholder="Ex: Diesel (combustão móvel)"
              helperText="Ex: Diesel (combustão móvel)"
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Unidade de Origem *</InputLabel>
            <Autocomplete
              options={unidades}
              getOptionLabel={(option) => option.name || ""}
              value={unidades.find(u => u.id === formData.originUnitId) || null}
              onChange={(event, newValue) => handleInputChange('originUnitId', newValue ? newValue.id : null)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.originUnitId} 
                  placeholder="Selecione a unidade de origem"
                  helperText="Selecione a unidade de origem"
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Valor de Origem *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.originValue}
              onChange={(e) => handleInputChange('originValue', e.target.value)}
              error={!formValidation.originValue}
              placeholder="Ex: 1"
              helperText="Ex: 1"
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Unidade da Conversão *</InputLabel>
            <Autocomplete
              options={unidades}
              getOptionLabel={(option) => option.name || ""}
              value={unidades.find(u => u.id === formData.convertedUnitId) || null}
              onChange={(event, newValue) => handleInputChange('convertedUnitId', newValue ? newValue.id : null)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.convertedUnitId} 
                  placeholder="Selecione a unidade da conversão"
                  helperText="Selecione a unidade da conversão"
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Valor Convertido *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.convertedOriginValue}
              onChange={(e) => handleInputChange('convertedOriginValue', e.target.value)}
              error={!formValidation.convertedOriginValue}
              placeholder="Ex: 2.68"
              helperText="Ex: 2.68"
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Fonte Oficial *</InputLabel>
            <Autocomplete
              options={fontes}
              getOptionLabel={(option) => option.dataSourceName || ""}
              value={fontes.find(f => f.id === formData.dataSourceId) || null}
              onChange={(event, newValue) => handleInputChange('dataSourceId', newValue ? newValue.id : null)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.dataSourceId} 
                  placeholder="Selecione ou digite a fonte oficial"
                  helperText="Selecione ou digite a fonte oficial"
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.emissionFactorESGDescription}
              onChange={(e) => handleInputChange('emissionFactorESGDescription', e.target.value)}
              placeholder="Descrição do fator de emissão"
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
          Fator de Emissão criado com sucesso!
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
            O fator de emissão foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoFatorEmissaoESG;
