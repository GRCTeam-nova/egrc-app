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
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// ==============================|| NOVA MEDIDA ||============================== //
function NovaMedida() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { medidaDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);

  const formatos = [
  { id: 1, nome: "numérico", valor: "numérico" },
  { id: 2, nome: "inteiro", valor: "inteiro" },
  { id: 3, nome: "%", valor: "%" },
  { id: 4, nome: "$$", valor: "$$" },
];

const unidades = [
  { id: 1, nome: "Unidade", valor: "Unidade" },
  { id: 2, nome: "Litro", valor: "Litro" },
  { id: 3, nome: "kg CO₂e/unidade", valor: "kg CO₂e/unidade" },
  { id: 4, nome: "kWh", valor: "kWh" },
  { id: 5, nome: "Tonelada", valor: "Tonelada" },
  { id: 6, nome: "Passageiro.km", valor: "Passageiro.km" },
  { id: 7, nome: "Reais", valor: "Reais" },
  { id: 8, nome: "Dólar", valor: "Dólar" },
  { id: 9, nome: "metros cúbicos", valor: "metros cúbicos" },
  { id: 10, nome: "metros quadrados", valor: "metros quadrados" },
];
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    codigo_medida: "", // código da medida (número, ex: LT)
    nome_medida: "", // nome da medida (alpha, ex: Litro)
    formato: null, // formato dos valores (alpha numérico interio/ % / $$)
    unidade: null, // unidade (select/autocomplete)
  });

  // Em caso de edição
  useEffect(() => {
    if (medidaDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");
      // Aqui você carregaria os dados da medida para edição
      // setFormData com os dados existentes
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
      
      // Simular requisição para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
              getOptionLabel={(option) => option.nome}
              value={formatos.find(f => f.valor === formData.formato) || null}
              onChange={(event, newValue) => {
                handleInputChange('formato', newValue ? newValue.valor : null);
              }}
              isOptionEqualToValue={(option, value) => option.valor === value.valor}
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
              getOptionLabel={(option) => option.nome}
              value={unidades.find(u => u.valor === formData.unidade) || null}
              onChange={(event, newValue) => {
                handleInputChange('unidade', newValue ? newValue.valor : null);
              }}
              isOptionEqualToValue={(option, value) => option.valor === value.valor}
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
