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
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// Dados mock para os selects
const tiposImpacto = [
  { id: "real", nome: "Real" },
  { id: "potencial", nome: "Potencial" },
];

const naturezasImpacto = [
  { id: "positivo", nome: "Positivo" },
  { id: "negativo", nome: "Negativo" },
];

const temasMock = [
  { id: 1, nome: "Mudanças Climáticas" },
  { id: 2, nome: "Recursos Hídricos" },
  { id: 3, nome: "Biodiversidade" },
  { id: 4, nome: "Economia Circular" },
  { id: 5, nome: "Direitos Humanos" },
  { id: 6, nome: "Governança Corporativa" },
];

// ==============================|| NOVO IMPACTO ESG ||============================== //
function NovoImpactoEsg() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { impactoDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    // Campos obrigatórios
    codigoImpactoEsg: "",
    nomeImpactoEsg: "",
    tipoImpacto: "",
    naturezaImpacto: "",
    
    // Campos automáticos (readonly)
    temas: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (impactoDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do impacto para edição
      // setFormData com os dados existentes
    }
  }, [impactoDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    codigoImpactoEsg: true,
    nomeImpactoEsg: true,
    tipoImpacto: true,
    naturezaImpacto: true,
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

  const validarCodigoImpacto = (codigo) => {
    // Regra: máximo de 10 caracteres e não pode repetir
    if (codigo.length > 10) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarNomeImpacto = (nome) => {
    // Regra: tamanho médio (max. 200) e não pode repetir
    if (nome.length > 200) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.codigoImpactoEsg.trim() || !validarCodigoImpacto(formData.codigoImpactoEsg)) {
      setFormValidation(prev => ({ ...prev, codigoImpactoEsg: false }));
      missingFields.push("Código do Impacto ESG");
    }
    
    if (!formData.nomeImpactoEsg.trim() || !validarNomeImpacto(formData.nomeImpactoEsg)) {
      setFormValidation(prev => ({ ...prev, nomeImpactoEsg: false }));
      missingFields.push("Nome do Impacto ESG");
    }
    
    if (!formData.tipoImpacto) {
      setFormValidation(prev => ({ ...prev, tipoImpacto: false }));
      missingFields.push("Tipo de Impacto");
    }
    
    if (!formData.naturezaImpacto) {
      setFormValidation(prev => ({ ...prev, naturezaImpacto: false }));
      missingFields.push("Natureza do Impacto");
    }

    if (missingFields.length > 0) {
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
      
      enqueueSnackbar(`Impacto ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o Impacto ESG.", {
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
        <Grid container spacing={3} marginTop={1}>
          
          {/* Seção: Informações Básicas */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Informações Básicas do Impacto ESG
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código do Impacto ESG *</InputLabel>
              <TextField
                fullWidth
                value={formData.codigoImpactoEsg}
                onChange={(e) => handleInputChange("codigoImpactoEsg", e.target.value)}
                error={!formData.codigoImpactoEsg && formValidation.codigoImpactoEsg === false}
                placeholder="Digite o código do impacto (máx. 10 caracteres)"
                inputProps={{ maxLength: 10 }}
                helperText="Máximo de 10 caracteres. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Impacto ESG *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeImpactoEsg}
                onChange={(e) => handleInputChange("nomeImpactoEsg", e.target.value)}
                error={!formData.nomeImpactoEsg && formValidation.nomeImpactoEsg === false}
                placeholder="Digite o nome do impacto"
                inputProps={{ maxLength: 200 }}
                helperText="Tamanho médio (máx. 200 caracteres). Não pode se repetir."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Classificação do Impacto
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Tipo de Impacto *</InputLabel>
              <RadioGroup
                row
                name="tipoImpacto"
                value={formData.tipoImpacto}
                onChange={(e) => handleInputChange("tipoImpacto", e.target.value)}
              >
                {tiposImpacto.map((tipo) => (
                  <FormControlLabel
                    key={tipo.id}
                    value={tipo.id}
                    control={<Radio />}
                    label={tipo.nome}
                  />
                ))}
              </RadioGroup>
              {!formData.tipoImpacto && formValidation.tipoImpacto === false && (
                <Typography color="error" variant="caption">
                  Selecione o tipo de impacto.
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Natureza do Impacto *</InputLabel>
              <RadioGroup
                row
                name="naturezaImpacto"
                value={formData.naturezaImpacto}
                onChange={(e) => handleInputChange("naturezaImpacto", e.target.value)}
              >
                {naturezasImpacto.map((natureza) => (
                  <FormControlLabel
                    key={natureza.id}
                    value={natureza.id}
                    control={<Radio />}
                    label={natureza.nome}
                  />
                ))}
              </RadioGroup>
              {!formData.naturezaImpacto && formValidation.naturezaImpacto === false && (
                <Typography color="error" variant="caption">
                  Selecione a natureza do impacto.
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Seção: Temas Relacionados (Automático) */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Temas Relacionados
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Temas que utilizam este impacto</InputLabel>
              <Autocomplete
                multiple
                options={temasMock}
                getOptionLabel={(option) => option.nome}
                value={formData.temas}
                readOnly // Este campo é automático
                renderInput={(params) => (
                  <TextField {...params} placeholder="Temas relacionados (automático)" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
              <Typography variant="caption" color="textSecondary">
                Este campo é preenchido automaticamente na tela de temas.
              </Typography>
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
            Impacto ESG criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O impacto ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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
      </LocalizationProvider>
    </>
  );
}

export default NovoImpactoEsg;

