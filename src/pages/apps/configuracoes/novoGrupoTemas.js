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
const temasMock = [
  { id: 1, nome: "Mudanças Climáticas" },
  { id: 2, nome: "Recursos Hídricos" },
  { id: 3, nome: "Biodiversidade" },
  { id: 4, nome: "Economia Circular" },
  { id: 5, nome: "Direitos Humanos" },
  { id: 6, nome: "Governança Corporativa" },
];

const indicadoresMock = [
  { id: 1, nome: "Indicador de Emissões GEE" },
  { id: 2, nome: "Indicador de Consumo de Água" },
  { id: 3, nome: "Indicador de Geração de Resíduos" },
  { id: 4, nome: "Indicador de Diversidade" },
  { id: 5, nome: "Indicador de Segurança do Trabalho" },
  { id: 6, nome: "Indicador de Governança" },
];

// ==============================|| NOVO GRUPO TEMAS ||============================== //
function NovoGrupoTemas() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { grupoTemaDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    // Campos obrigatórios
    nomeGrupo: "",
    descricaoGrupo: "",
    
    // Campos automáticos (readonly)
    temaEsg: [],
    indicadorGruposTemas: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (grupoTemaDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do grupo de temas para edição
      // setFormData com os dados existentes
    }
  }, [grupoTemaDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    nomeGrupo: true,
    descricaoGrupo: true,
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

  const validarNomeGrupo = (nome) => {
    // Regra: tamanho curto (max. 50) e não pode repetir
    if (nome.length > 50) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarDescricaoGrupo = (descricao) => {
    // Regra: tamanho longo (max. 500)
    if (descricao.length > 500) {
      return false;
    }
    return true;
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.nomeGrupo.trim() || !validarNomeGrupo(formData.nomeGrupo)) {
      setFormValidation(prev => ({ ...prev, nomeGrupo: false }));
      missingFields.push("Nome do Grupo");
    }
    
    if (!formData.descricaoGrupo.trim() || !validarDescricaoGrupo(formData.descricaoGrupo)) {
      setFormValidation(prev => ({ ...prev, descricaoGrupo: false }));
      missingFields.push("Descrição do Grupo");
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
      
      enqueueSnackbar(`Grupo de Temas ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o Grupo de Temas.", {
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
              Informações Básicas do Grupo de Temas
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Grupo *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeGrupo}
                onChange={(e) => handleInputChange("nomeGrupo", e.target.value)}
                error={!formData.nomeGrupo && formValidation.nomeGrupo === false}
                placeholder="Digite o nome do grupo (máx. 50 caracteres)"
                inputProps={{ maxLength: 50 }}
                helperText="Máximo de 50 caracteres. Não pode se repetir."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Grupo *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricaoGrupo}
                onChange={(e) => handleInputChange("descricaoGrupo", e.target.value)}
                error={!formData.descricaoGrupo && formValidation.descricaoGrupo === false}
                placeholder="Digite a descrição detalhada do grupo"
                inputProps={{ maxLength: 500 }}
                helperText="Máximo de 500 caracteres."
              />
            </Stack>
          </Grid>

          {/* Seção: Temas e Indicadores Relacionados (Automático) */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Temas e Indicadores Relacionados
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Temas do Grupo</InputLabel>
              <Autocomplete
                multiple
                options={temasMock}
                getOptionLabel={(option) => option.nome}
                value={formData.temaEsg}
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

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Indicadores do Grupo de Temas</InputLabel>
              <Autocomplete
                multiple
                options={indicadoresMock}
                getOptionLabel={(option) => option.nome}
                value={formData.indicadorGruposTemas}
                readOnly // Este campo é automático
                renderInput={(params) => (
                  <TextField {...params} placeholder="Indicadores relacionados (automático)" />
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
                Este campo é preenchido automaticamente na tela de indicadores.
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
            Grupo de Temas criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O grupo de temas foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoGrupoTemas;

