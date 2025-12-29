/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Switch,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Dados mock para os selects
const ciclosPriorizacao = [
  { id: 1, nome: "Ciclo 2024" },
  { id: 2, nome: "Ciclo 2025" },
  { id: 3, nome: "Ciclo 2026" },
];

const niveisAvaliacao = [
  { id: 1, nome: "1" },
  { id: 2, nome: "2" },
  { id: 3, nome: "3" },
  { id: 4, nome: "4" },
  { id: 5, nome: "5" },
  { id: 6, nome: "6" },
  { id: 7, nome: "7" },
  { id: 8, nome: "8" },
  { id: 9, nome: "9" },
  { id: 10, nome: "10" },
];

const coresDisponiveis = [
  { id: 1, nome: "Vermelho", valor: "#FF0000" },
  { id: 2, nome: "Verde", valor: "#00FF00" },
  { id: 3, nome: "Azul", valor: "#0000FF" },
  { id: 4, nome: "Amarelo", valor: "#FFFF00" },
  { id: 5, nome: "Laranja", valor: "#FFA500" },
  { id: 6, nome: "Roxo", valor: "#800080" },
  { id: 7, nome: "Rosa", valor: "#FFC0CB" },
  { id: 8, nome: "Cinza", valor: "#808080" },
];

// ==============================|| PERFIL ESG ||============================== //
function NovoPerfilEsg() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { perfilDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [perfilEsgDados, setPerfilEsgDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    nomePerfilCiclo: "",
    cicloPriorizacao: [],
    qtdNiveisAvaliacao: null,
    abrangencia: false,
    urgencia: false,
    partesInteressadas: false,
    piClientes: false,
    piFornecedores: false,
    piOngsAssociacoes: false,
    piSociedade: false,
    piConselheiros: false,
    piColaboradores: false,
    piReguladores: false,
    piInvestidores: false,
    // Níveis de probabilidade
    niveisProbabilidade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de intensidade
    niveisIntensidade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de abrangência
    niveisAbrangencia: [
      { nome: "Local", valor: 1, cor: null },
      { nome: "Regional", valor: 2, cor: null },
      { nome: "Nacional", valor: 3, cor: null },
      { nome: "Internacional", valor: 4, cor: null },
      { nome: "Global", valor: 5, cor: null },
    ],
    // Níveis de urgência/prioridade
    niveisPrioridade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de importância das partes interessadas
    niveisImportanciaPI: [
      { nome: "Baixa", valor: 1, cor: null },
      { nome: "Média", valor: 2, cor: null },
      { nome: "Alta", valor: 3, cor: null },
      { nome: "Crítica", valor: 4, cor: null },
      { nome: "Essencial", valor: 5, cor: null },
    ],
  });

  // Em caso de edição
  useEffect(() => {
    if (perfilDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      // Aqui você carregaria os dados do perfil para edição
      // setFormData com os dados existentes
    }
  }, [perfilDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
    setHasChanges(true);
  };

  const handleSelectAllCiclos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.cicloPriorizacao.length === ciclosPriorizacao.length) {
        handleInputChange("cicloPriorizacao", []);
      } else {
        handleInputChange("cicloPriorizacao", ciclosPriorizacao.map(ciclo => ciclo.id));
      }
    } else {
      handleInputChange("cicloPriorizacao", newValue.map(item => item.id));
    }
  };

  const updateNivelArray = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    setHasChanges(true);
  };

  const adjustNiveisQuantity = (quantidade) => {
    const createDefaultNiveis = (count, type) => {
      const defaultNames = {
        probabilidade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
        intensidade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
        abrangencia: ["Local", "Regional", "Nacional", "Internacional", "Global"],
        prioridade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
        importanciaPI: ["Baixa", "Média", "Alta", "Crítica", "Essencial"]
      };
      
      return Array.from({ length: count }, (_, i) => ({
        nome: defaultNames[type]?.[i] || `Nível ${i + 1}`,
        valor: i + 1,
        cor: null
      }));
    };

    setFormData(prev => ({
      ...prev,
      qtdNiveisAvaliacao: quantidade,
      niveisProbabilidade: createDefaultNiveis(quantidade, 'probabilidade'),
      niveisIntensidade: createDefaultNiveis(quantidade, 'intensidade'),
      niveisAbrangencia: createDefaultNiveis(quantidade, 'abrangencia'),
      niveisPrioridade: createDefaultNiveis(quantidade, 'prioridade'),
      niveisImportanciaPI: createDefaultNiveis(quantidade, 'importanciaPI'),
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    nomePerfilCiclo: true,
    qtdNiveisAvaliacao: true,
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
    
    if (!formData.nomePerfilCiclo.trim()) {
      setFormValidation(prev => ({ ...prev, nomePerfilCiclo: false }));
      missingFields.push("Nome do Perfil do Ciclo");
    }
    
    if (!formData.qtdNiveisAvaliacao) {
      setFormValidation(prev => ({ ...prev, qtdNiveisAvaliacao: false }));
      missingFields.push("Quantidade de Níveis de Avaliação");
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
      
      enqueueSnackbar(`Perfil ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o perfil ESG.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelectedCiclos = formData.cicloPriorizacao.length === ciclosPriorizacao.length && ciclosPriorizacao.length > 0;

  const renderNiveisSection = (title, arrayName, isOptional = false, enabled = true) => {
    if (isOptional && !enabled) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          {formData[arrayName].map((nivel, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <TextField
                  label="Nome do Nível"
                  fullWidth
                  value={nivel.nome}
                  onChange={(e) => updateNivelArray(arrayName, index, 'nome', e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Valor"
                  type="number"
                  fullWidth
                  value={nivel.valor}
                  onChange={(e) => updateNivelArray(arrayName, index, 'valor', parseInt(e.target.value))}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  options={coresDisponiveis}
                  getOptionLabel={(option) => option.nome}
                  value={coresDisponiveis.find(cor => cor.id === nivel.cor) || null}
                  onChange={(event, newValue) => {
                    updateNivelArray(arrayName, index, 'cor', newValue ? newValue.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cor do Nível" />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: option.valor,
                          marginRight: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                      {option.nome}
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={3} marginTop={1}>
          {/* Campos básicos */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Perfil do Ciclo *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomePerfilCiclo}
                onChange={(e) => handleInputChange('nomePerfilCiclo', e.target.value)}
                error={!formData.nomePerfilCiclo && formValidation.nomePerfilCiclo === false}
                placeholder="Digite o nome do perfil do ciclo"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...ciclosPriorizacao,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.cicloPriorizacao.map(
                  (id) => ciclosPriorizacao.find((ciclo) => ciclo.id === id) || id
                )}
                onChange={handleSelectAllCiclos}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === "all" ? allSelectedCiclos : selected}
                        />
                      </Grid>
                      <Grid item xs>
                        {option.nome}
                      </Grid>
                    </Grid>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Quantidade de Níveis para Avaliação *</InputLabel>
              <Autocomplete
                options={niveisAvaliacao}
                getOptionLabel={(option) => option.nome}
                value={niveisAvaliacao.find(nivel => nivel.id === formData.qtdNiveisAvaliacao) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    adjustNiveisQuantity(parseInt(newValue.nome));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.qtdNiveisAvaliacao && formValidation.qtdNiveisAvaliacao === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Switches para opções */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Configurações de Avaliação
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.abrangencia}
                      onChange={handleSwitchChange('abrangencia')}
                    />
                  }
                  label="Abrangência"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.urgencia}
                      onChange={handleSwitchChange('urgencia')}
                    />
                  }
                  label="Urgência"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.partesInteressadas}
                      onChange={handleSwitchChange('partesInteressadas')}
                    />
                  }
                  label="Partes Interessadas"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Partes Interessadas - só aparece se o switch estiver ativo */}
          {formData.partesInteressadas && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tipos de Partes Interessadas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piClientes}
                            onChange={handleSwitchChange('piClientes')}
                          />
                        }
                        label="Clientes"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piFornecedores}
                            onChange={handleSwitchChange('piFornecedores')}
                          />
                        }
                        label="Fornecedores"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piOngsAssociacoes}
                            onChange={handleSwitchChange('piOngsAssociacoes')}
                          />
                        }
                        label="ONGs/Associações"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piSociedade}
                            onChange={handleSwitchChange('piSociedade')}
                          />
                        }
                        label="Sociedade"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piConselheiros}
                            onChange={handleSwitchChange('piConselheiros')}
                          />
                        }
                        label="Conselheiros"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piColaboradores}
                            onChange={handleSwitchChange('piColaboradores')}
                          />
                        }
                        label="Colaboradores"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piReguladores}
                            onChange={handleSwitchChange('piReguladores')}
                          />
                        }
                        label="Reguladores"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.piInvestidores}
                            onChange={handleSwitchChange('piInvestidores')}
                          />
                        }
                        label="Investidores"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Seções de Níveis */}
          {formData.qtdNiveisAvaliacao && (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Definição dos Níveis
              </Typography>
              
              {renderNiveisSection("Níveis de Probabilidade", "niveisProbabilidade")}
              {renderNiveisSection("Níveis de Intensidade", "niveisIntensidade")}
              {renderNiveisSection("Níveis de Abrangência", "niveisAbrangencia", true, formData.abrangencia)}
              {renderNiveisSection("Níveis de Urgência/Prioridade", "niveisPrioridade", true, formData.urgencia)}
              {renderNiveisSection("Níveis de Importância das Partes Interessadas", "niveisImportanciaPI", true, formData.partesInteressadas)}
            </Grid>
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
            Perfil ESG criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O perfil ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoPerfilEsg;

