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
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { API_URL } from "../../../config";

// Dados mock para os selects
const tiposImpacto = [
  { id: 1, nome: "Real" },
  { id: 2, nome: "Potencial" },
];

const naturezasImpacto = [
  { id: 1, nome: "Positivo" },
  { id: 2, nome: "Negativo" },
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
  
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;
  const [formData, setFormData] = useState({
    id: "",
    impactCode: "",
    impactESGName: "",
    impactType: "",
    impactNature: "",
    active: true,
    temas: [],
  });

  // Em caso de edição
  useEffect(() => {
    const fetchImpact = async () => {
      if (id || impactoDados) {
        setRequisicao("Editar");
        setMensagemFeedback("editado");
        
        try {
          setLoading(true);
          const impactId = id || impactoDados?.id;
          const res = await axios.get(`${API_URL}ESGImpact/${impactId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const d = res.data;
          setFormData({
            id: d.id,
            impactCode: d.impactCode || "",
            impactESGName: d.impactESGName || "",
            impactType: d.impactType || "",
            impactNature: d.impactNature || "",
            active: d.active ?? true,
            temas: d.themes || d.temas || [], // Supondo que a API possa retornar temas vinculados
          });
        } catch (error) {
          console.error("Erro ao buscar impacto:", error);
          enqueueSnackbar("Não foi possível carregar os dados do impacto.", { variant: "error" });
        } finally {
          setLoading(false);
        }
      } else {
        setRequisicao("Criar");
        setMensagemFeedback("cadastrado");
      }
    };

    if (token) {
      fetchImpact();
    }
  }, [id, impactoDados, token]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    impactCode: true,
    impactESGName: true,
    impactType: true,
    impactNature: true,
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
    
    if (!formData.impactCode.trim() || !validarCodigoImpacto(formData.impactCode)) {
      setFormValidation(prev => ({ ...prev, impactCode: false }));
      missingFields.push("Código do Impacto ESG");
    }
    
    if (!formData.impactESGName.trim() || !validarNomeImpacto(formData.impactESGName)) {
      setFormValidation(prev => ({ ...prev, impactESGName: false }));
      missingFields.push("Nome do Impacto ESG");
    }
    
    if (!formData.impactType) {
      setFormValidation(prev => ({ ...prev, impactType: false }));
      missingFields.push("Tipo de Impacto");
    }
    
    if (!formData.impactNature) {
      setFormValidation(prev => ({ ...prev, impactNature: false }));
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
      
      const payload = {
        impactCode: formData.impactCode,
        impactESGName: formData.impactESGName,
        impactType: Number(formData.impactType),
        impactNature: Number(formData.impactNature),
        active: formData.active
      };

      if (requisicao === "Editar") {
        payload.id = formData.id;
        await axios.put(`${API_URL}ESGImpact`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}ESGImpact`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
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
                value={formData.impactCode}
                onChange={(e) => handleInputChange("impactCode", e.target.value)}
                error={!formData.impactCode && formValidation.impactCode === false}
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
                value={formData.impactESGName}
                onChange={(e) => handleInputChange("impactESGName", e.target.value)}
                error={!formData.impactESGName && formValidation.impactESGName === false}
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
                name="impactType"
                value={formData.impactType}
                onChange={(e) => handleInputChange("impactType", Number(e.target.value))}
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
              {!formData.impactType && formValidation.impactType === false && (
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
                name="impactNature"
                value={formData.impactNature}
                onChange={(e) => handleInputChange("impactNature", Number(e.target.value))}
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
              {!formData.impactNature && formValidation.impactNature === false && (
                <Typography color="error" variant="caption">
                  Selecione a natureza do impacto.
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Seção: Temas Relacionados (Apenas na edição se houver dados) */}
          {requisicao === "Editar" && formData.temas && formData.temas.length > 0 && (
            <>
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
                    options={formData.temas}
                    getOptionLabel={(option) => option.themeName || option.nome || option.tema || ""}
                    value={formData.temas}
                    readOnly
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Temas relacionados" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.themeName || option.nome || option.tema || ""}
                          {...getTagProps({ index })}
                          key={option.id || index}
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
            </>
          )}

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

