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

// ==============================|| NOVA DIMENSÃO ||============================== //
function NovaDimensao() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dimensaoDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);

  const tiposDimensao = [
  { id: 1, nome: "Local", valor: "local" },
  { id: 2, nome: "Moeda", valor: "moeda" },
  { id: 3, nome: "Fonte", valor: "fonte" },
  { id: 4, nome: "Setor", valor: "setor" },
  { id: 5, nome: "Região", valor: "regiao" },
];
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    tipo_dimensao: null, // tipo da dimensão (select/autocomplete)
    nome_dimensao: "", // nome da dimensão (alpha, ex: São Paulo)
  });

  // Em caso de edição
  useEffect(() => {
    if (dimensaoDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");
      // Aqui você carregaria os dados da dimensão para edição
      // setFormData com os dados existentes
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
    tipo_dimensao: true,
    nome_dimensao: true,
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
    
    if (!formData.tipo_dimensao) {
      setFormValidation(prev => ({ ...prev, tipo_dimensao: false }));
      missingFields.push("Tipo da Dimensão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, tipo_dimensao: true }));
    }
    
    if (!formData.nome_dimensao.trim()) {
      setFormValidation(prev => ({ ...prev, nome_dimensao: false }));
      missingFields.push("Nome da Dimensão");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, nome_dimensao: true }));
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
      
      enqueueSnackbar(`Dimensão ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
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
          <Typography variant="h4" gutterBottom>
            {requisicao === "Criar" ? "Nova Dimensão" : "Editar Dimensão"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {/* Campos da Dimensão */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Tipo da Dimensão *</InputLabel>
            <Autocomplete
              options={tiposDimensao}
              getOptionLabel={(option) => option.nome}
              value={tiposDimensao.find(t => t.valor === formData.tipo_dimensao) || null}
              onChange={(event, newValue) => {
                handleInputChange('tipo_dimensao', newValue ? newValue.valor : null);
              }}
              isOptionEqualToValue={(option, value) => option.valor === value.valor}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  error={!formValidation.tipo_dimensao}
                  helperText={!formValidation.tipo_dimensao ? "Campo obrigatório" : "Ex: Local, Moeda, Fonte"}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Nome da Dimensão *</InputLabel>
            <TextField
              fullWidth
              value={formData.nome_dimensao}
              onChange={(e) => handleInputChange('nome_dimensao', e.target.value)}
              error={!formValidation.nome_dimensao}
              placeholder="Ex: São Paulo, Dólar, Energia Solar"
              helperText={!formValidation.nome_dimensao ? "Campo obrigatório" : "Ex: São Paulo, Dólar, Energia Solar"}
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

export default NovaDimensao;
