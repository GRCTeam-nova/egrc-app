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
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
// ==============================|| NOVA FONTE DE DADOS ||============================== //
function NovaFonteDeDados() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { fonteDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const tiposFonte = [
  { id: 1, nome: "Sistema", valor: "sistema" },
  { id: 2, nome: "Documento", valor: "documento" },
  { id: 3, nome: "Medidor", valor: "medidor" },
  { id: 4, nome: "Relatório", valor: "relatorio" },
];

  const [formData, setFormData] = useState({
    codigo_fonte_dados: "", // código da fonte de dados (número, ex: LT)
    nome_fonte_dados: "", // nome da fonte de dados (alpha, ex: Litro)
  });

  // Em caso de edição
  useEffect(() => {
    if (fonteDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");
      // Aqui você carregaria os dados da fonte de dados para edição
      // setFormData com os dados existentes
    }
  }, [fonteDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    codigo_fonte_dados: true,
    nome_fonte_dados: true,
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
    
    if (!formData.codigo_fonte_dados.trim()) {
      setFormValidation(prev => ({ ...prev, codigo_fonte_dados: false }));
      missingFields.push("Código da Fonte de Dados");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, codigo_fonte_dados: true }));
    }
    
    if (!formData.nome_fonte_dados.trim()) {
      setFormValidation(prev => ({ ...prev, nome_fonte_dados: false }));
      missingFields.push("Nome da Fonte de Dados");
      isValid = false;
    } else {
      setFormValidation(prev => ({ ...prev, nome_fonte_dados: true }));
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
      
      enqueueSnackbar(`Fonte de Dados ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar a fonte de dados.", {
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
            {requisicao === "Criar" ? "Nova Fonte de Dados" : "Editar Fonte de Dados"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {/* Campos da Fonte de Dados */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Código da Fonte de Dados *</InputLabel>
            <TextField
              fullWidth
              value={formData.codigo_fonte_dados}
              onChange={(e) => handleInputChange('codigo_fonte_dados', e.target.value)}
              error={!formValidation.codigo_fonte_dados}
              placeholder="Ex: LT"
              helperText={!formValidation.codigo_fonte_dados ? "Campo obrigatório" : "Ex: LT"}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Nome da Fonte de Dados *</InputLabel>
            <TextField
              fullWidth
              value={formData.nome_fonte_dados}
              onChange={(e) => handleInputChange('nome_fonte_dados', e.target.value)}
              error={!formValidation.nome_fonte_dados}
              placeholder="Ex: Sistema ambiental"
              helperText={!formValidation.nome_fonte_dados ? "Campo obrigatório" : "Ex: Sistema ambiental"}
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
          Fonte de Dados criada com sucesso!
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
            A fonte de dados foi criada com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovaFonteDeDados;
