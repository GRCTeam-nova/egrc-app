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

  // Mocks para campos de seleção/autocomplete
  const mockUnidades = [
    { id: 1, nome: "Litro", valor: "Litro" },
    { id: 2, nome: "kWh", valor: "kWh" },
    { id: 3, nome: "Tonelada", valor: "Tonelada" },
    { id: 4, nome: "Passageiro.km", valor: "Passageiro.km" },
    { id: 5, nome: "kg CO2e/unidade", valor: "kg CO2e/unidade" },
  ];

  const mockFontesOficiais = [
    { id: 1, nome: "IPCC 2006", valor: "IPCC 2006" },
    { id: 2, nome: "MCTI 2023", valor: "MCTI 2023" },
    { id: 3, nome: "MCTI 2022", valor: "MCTI 2022" },
    { id: 4, nome: "ABRIPE 2021", valor: "ABRIPE 2021" },
  ];

  const [formData, setFormData] = useState({
    codigo_fator_emissao: "", // número
    nome_fator_emissao: "", // alpha
    unidade_de: null, // seleção (unidade de origem)
    valor_de: "", // número (valor de origem)
    unidade_para: null, // seleção (unidade da conversão)
    valor_para: "", // número (valor convertido)
    fonte_oficial: null, // alpha / seleção
  });

  // Em caso de edição
  useEffect(() => {
    if (fatorEmissao) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do fator de emissão para edição
      // setFormData com os dados existentes
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
    codigo_fator_emissao: true,
    nome_fator_emissao: true,
    unidade_de: true,
    valor_de: true,
    unidade_para: true,
    valor_para: true,
    fonte_oficial: true,
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
    
    // Validação dos campos obrigatórios (código e nome)
    if (!formData.codigo_fator_emissao.toString().trim()) {
      setFormValidation(prev => ({ ...prev, codigo_fator_emissao: false }));
      missingFields.push("Código do Fator de Emissão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, codigo_fator_emissao: true }));
    }
    
    if (!formData.nome_fator_emissao.trim()) {
      setFormValidation(prev => ({ ...prev, nome_fator_emissao: false }));
      missingFields.push("Nome do Fator de Emissão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, nome_fator_emissao: true }));
    }

    // Validação dos campos de seleção (unidade_de, unidade_para, fonte_oficial)
    if (!formData.unidade_de) {
        setFormValidation(prev => ({ ...prev, unidade_de: false }));
        missingFields.push("Unidade de Origem");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, unidade_de: true }));
    }

    if (!formData.unidade_para) {
        setFormValidation(prev => ({ ...prev, unidade_para: false }));
        missingFields.push("Unidade da Conversão");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, unidade_para: true }));
    }

    if (!formData.fonte_oficial) {
        setFormValidation(prev => ({ ...prev, fonte_oficial: false }));
        missingFields.push("Fonte Oficial");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, fonte_oficial: true }));
    }

    // Validação dos campos numéricos (valor_de, valor_para)
    if (!formData.valor_de.toString().trim() || isNaN(Number(formData.valor_de))) {
        setFormValidation(prev => ({ ...prev, valor_de: false }));
        missingFields.push("Valor de Origem");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, valor_de: true }));
    }

    if (!formData.valor_para.toString().trim() || isNaN(Number(formData.valor_para))) {
        setFormValidation(prev => ({ ...prev, valor_para: false }));
        missingFields.push("Valor Convertido");
        isValid = false;
    } else {
        setFormValidation(prev => ({ ...prev, valor_para: true }));
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
      
      // Simular requisição para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

        {/* Campos do Fator de Emissão */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Código do Fator de Emissão *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.codigo_fator_emissao}
              onChange={(e) => handleInputChange('codigo_fator_emissao', e.target.value)}
              error={!formValidation.codigo_fator_emissao}
              placeholder="Ex: 123"
              helperText={!formValidation.codigo_fator_emissao ? "Campo obrigatório (número)" : "Ex: 123"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Nome do Fator de Emissão *</InputLabel>
            <TextField
              fullWidth
              value={formData.nome_fator_emissao}
              onChange={(e) => handleInputChange('nome_fator_emissao', e.target.value)}
              error={!formValidation.nome_fator_emissao}
              placeholder="Ex: Diesel (combustão móvel)"
              helperText={!formValidation.nome_fator_emissao ? "Campo obrigatório (alpha)" : "Ex: Diesel (combustão móvel)"}
            />
          </Stack>
        </Grid>

        {/* Unidade de Origem (Seleção) */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Unidade de Origem *</InputLabel>
            <Autocomplete
              fullWidth
              options={mockUnidades}
              getOptionLabel={(option) => option.nome || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={formData.unidade_de}
              onChange={(event, newValue) => handleInputChange('unidade_de', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!formValidation.unidade_de}
                  helperText={!formValidation.unidade_de ? "Campo obrigatório (seleção)" : "Selecione a unidade de origem"}
                />
              )}
            />
          </Stack>
        </Grid>

        {/* Valor de Origem (Número) */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Valor de Origem *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.valor_de}
              onChange={(e) => handleInputChange('valor_de', e.target.value)}
              error={!formValidation.valor_de}
              placeholder="Ex: 1"
              helperText={!formValidation.valor_de ? "Campo obrigatório (número)" : "Ex: 1"}
            />
          </Stack>
        </Grid>

        {/* Unidade da Conversão (Seleção) */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Unidade da Conversão *</InputLabel>
            <Autocomplete
              fullWidth
              options={mockUnidades}
              getOptionLabel={(option) => option.nome || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={formData.unidade_para}
              onChange={(event, newValue) => handleInputChange('unidade_para', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!formValidation.unidade_para}
                  helperText={!formValidation.unidade_para ? "Campo obrigatório (seleção)" : "Selecione a unidade da conversão"}
                />
              )}
            />
          </Stack>
        </Grid>

        {/* Valor Convertido (Número) */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Valor Convertido *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.valor_para}
              onChange={(e) => handleInputChange('valor_para', e.target.value)}
              error={!formValidation.valor_para}
              placeholder="Ex: 2.68"
              helperText={!formValidation.valor_para ? "Campo obrigatório (número)" : "Ex: 2.68"}
            />
          </Stack>
        </Grid>

        {/* Fonte Oficial (Seleção/Alpha) */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Fonte Oficial *</InputLabel>
            <Autocomplete
              fullWidth
              options={mockFontesOficiais}
              getOptionLabel={(option) => option.nome || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={formData.fonte_oficial}
              onChange={(event, newValue) => handleInputChange('fonte_oficial', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!formValidation.fonte_oficial}
                  helperText={!formValidation.fonte_oficial ? "Campo obrigatório (seleção/alpha)" : "Selecione ou digite a fonte oficial"}
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
