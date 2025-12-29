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
  Card,
  CardContent,
  Divider,
  Chip,
  FormHelperText,
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
import { useToken } from "../../../api/TokenContext";

// Dados mock para os selects
const tiposOds = [
  { id: 1, nome: "Objetivo" },
  { id: 2, nome: "Meta" },
];

// Temas expandidos com categorização
const temas = [
  // Temas Ambientais
  { id: 1, nome: "Sustentabilidade Ambiental", categoria: "Ambiental" },
  { id: 2, nome: "Mudanças Climáticas", categoria: "Ambiental" },
  { id: 3, nome: "Energia Renovável", categoria: "Ambiental" },
  { id: 4, nome: "Conservação da Biodiversidade", categoria: "Ambiental" },
  { id: 5, nome: "Gestão de Recursos Hídricos", categoria: "Ambiental" },
  { id: 6, nome: "Economia Circular", categoria: "Ambiental" },
  { id: 7, nome: "Gestão de Resíduos", categoria: "Ambiental" },
  { id: 8, nome: "Agricultura Sustentável", categoria: "Ambiental" },
  { id: 9, nome: "Oceanos e Vida Marinha", categoria: "Ambiental" },
  { id: 10, nome: "Florestas e Vida Terrestre", categoria: "Ambiental" },
  
  // Temas Sociais
  { id: 11, nome: "Erradicação da Pobreza", categoria: "Social" },
  { id: 12, nome: "Segurança Alimentar", categoria: "Social" },
  { id: 13, nome: "Saúde e Bem-Estar", categoria: "Social" },
  { id: 14, nome: "Educação de Qualidade", categoria: "Social" },
  { id: 15, nome: "Igualdade de Gênero", categoria: "Social" },
  { id: 16, nome: "Direitos Humanos", categoria: "Social" },
  { id: 17, nome: "Diversidade e Inclusão", categoria: "Social" },
  { id: 18, nome: "Trabalho Decente", categoria: "Social" },
  { id: 19, nome: "Redução das Desigualdades", categoria: "Social" },
  { id: 20, nome: "Comunidades Sustentáveis", categoria: "Social" },
  { id: 21, nome: "Responsabilidade Social", categoria: "Social" },
  
  // Temas de Governança
  { id: 22, nome: "Governança Corporativa", categoria: "Governança" },
  { id: 23, nome: "Paz e Justiça", categoria: "Governança" },
  { id: 24, nome: "Instituições Eficazes", categoria: "Governança" },
  { id: 25, nome: "Parcerias Globais", categoria: "Governança" },
  { id: 26, nome: "Transparência e Prestação de Contas", categoria: "Governança" },
  
  // Temas de Inovação e Economia
  { id: 27, nome: "Inovação e Tecnologia", categoria: "Inovação" },
  { id: 28, nome: "Infraestrutura Sustentável", categoria: "Inovação" },
  { id: 29, nome: "Crescimento Econômico Inclusivo", categoria: "Inovação" },
  { id: 30, nome: "Consumo e Produção Responsáveis", categoria: "Inovação" },
  { id: 31, nome: "Cidades Inteligentes", categoria: "Inovação" },
  { id: 32, nome: "Digitalização Sustentável", categoria: "Inovação" },
];

// Lista dos 17 ODS oficiais para validação
const odsOficiais = [
  { codigo: 1, nome: "Erradicação da Pobreza" },
  { codigo: 2, nome: "Fome Zero e Agricultura Sustentável" },
  { codigo: 3, nome: "Saúde e Bem-Estar" },
  { codigo: 4, nome: "Educação de Qualidade" },
  { codigo: 5, nome: "Igualdade de Gênero" },
  { codigo: 6, nome: "Água Potável e Saneamento" },
  { codigo: 7, nome: "Energia Limpa e Acessível" },
  { codigo: 8, nome: "Trabalho Decente e Crescimento Econômico" },
  { codigo: 9, nome: "Indústria, Inovação e Infraestrutura" },
  { codigo: 10, nome: "Redução das Desigualdades" },
  { codigo: 11, nome: "Cidades e Comunidades Sustentáveis" },
  { codigo: 12, nome: "Consumo e Produção Responsáveis" },
  { codigo: 13, nome: "Ação Contra a Mudança Global do Clima" },
  { codigo: 14, nome: "Vida na Água" },
  { codigo: 15, nome: "Vida Terrestre" },
  { codigo: 16, nome: "Paz, Justiça e Instituições Eficazes" },
  { codigo: 17, nome: "Parcerias e Meios de Implementação" },
];

// ==============================|| NOVO ODS ||============================== //
function NovoOds() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { odsDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    // Campos obrigatórios
    codigo_ods: "",
    nome_ods: "",
    tipo_ods: null,
    
    // Campos opcionais
    descricao_ods: "",
    tema: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (odsDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");
      setFormData({
        codigo_ods: odsDados.codigo_ods || "",
        nome_ods: odsDados.nome_ods || "",
        tipo_ods: odsDados.tipo_ods || null,
        descricao_ods: odsDados.descricao_ods || "",
        tema: odsDados.tema || [],
      });
    }
  }, [odsDados]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleMultiSelectChange = (field) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    codigo_ods: true,
    nome_ods: true,
    tipo_ods: true,
    descricao_ods: true,
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

  // Regras de negócio para validação
  const validarCodigoOds = (codigo) => {
    // Deve ser um número
    const numeroOds = parseInt(codigo);
    if (isNaN(numeroOds)) {
      return { valido: false, mensagem: "Código deve ser um número" };
    }
    
    // Deve estar entre 1 e 17 (ODS oficiais)
    if (numeroOds < 1 || numeroOds > 17) {
      return { valido: false, mensagem: "Código deve estar entre 1 e 17 (ODS oficiais)" };
    }
    
    return { valido: true, mensagem: "" };
  };

  const validarNomeOds = (nome, codigo) => {
    // Verificar se o nome corresponde ao código ODS oficial
    const numeroOds = parseInt(codigo);
    if (!isNaN(numeroOds)) {
      const odsOficial = odsOficiais.find(ods => ods.codigo === numeroOds);
      if (odsOficial && nome.trim() !== odsOficial.nome) {
        return { 
          valido: false, 
          mensagem: `Para o ODS ${numeroOds}, o nome deve ser: "${odsOficial.nome}"` 
        };
      }
    }
    
    return { valido: true, mensagem: "" };
  };

  const validarDescricaoOds = (descricao) => {
    // Máximo de 500 caracteres
    if (descricao.length > 500) {
      return { valido: false, mensagem: "Descrição deve ter no máximo 500 caracteres" };
    }
    
    return { valido: true, mensagem: "" };
  };

  // Função para sugerir nome baseado no código
  const sugerirNomePorCodigo = (codigo) => {
    const numeroOds = parseInt(codigo);
    if (!isNaN(numeroOds)) {
      const odsOficial = odsOficiais.find(ods => ods.codigo === numeroOds);
      if (odsOficial) {
        handleInputChange('nome_ods', odsOficial.nome);
      }
    }
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    let hasErrors = false;
    
    // Validar código ODS
    if (!formData.codigo_ods.trim()) {
      setFormValidation(prev => ({ ...prev, codigo_ods: false }));
      missingFields.push("Código ODS");
      hasErrors = true;
    } else {
      const validacaoCodigo = validarCodigoOds(formData.codigo_ods);
      if (!validacaoCodigo.valido) {
        setFormValidation(prev => ({ ...prev, codigo_ods: false }));
        enqueueSnackbar(validacaoCodigo.mensagem, { variant: "error" });
        hasErrors = true;
      } else {
        setFormValidation(prev => ({ ...prev, codigo_ods: true }));
      }
    }
    
    // Validar nome ODS
    if (!formData.nome_ods.trim()) {
      setFormValidation(prev => ({ ...prev, nome_ods: false }));
      missingFields.push("Nome ODS");
      hasErrors = true;
    } else {
      const validacaoNome = validarNomeOds(formData.nome_ods, formData.codigo_ods);
      if (!validacaoNome.valido) {
        setFormValidation(prev => ({ ...prev, nome_ods: false }));
        enqueueSnackbar(validacaoNome.mensagem, { variant: "error" });
        hasErrors = true;
      } else {
        setFormValidation(prev => ({ ...prev, nome_ods: true }));
      }
    }
    
    // Validar tipo ODS
    if (!formData.tipo_ods) {
      setFormValidation(prev => ({ ...prev, tipo_ods: false }));
      missingFields.push("Tipo ODS");
      hasErrors = true;
    } else {
      setFormValidation(prev => ({ ...prev, tipo_ods: true }));
    }
    
    // Validar descrição (se preenchida)
    if (formData.descricao_ods.trim()) {
      const validacaoDescricao = validarDescricaoOds(formData.descricao_ods);
      if (!validacaoDescricao.valido) {
        setFormValidation(prev => ({ ...prev, descricao_ods: false }));
        enqueueSnackbar(validacaoDescricao.mensagem, { variant: "error" });
        hasErrors = true;
      } else {
        setFormValidation(prev => ({ ...prev, descricao_ods: true }));
      }
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 
        ? "são obrigatórios!" 
        : "é obrigatório!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);
      
      // Simular requisição para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      enqueueSnackbar(`ODS ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o ODS.", {
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
              Informações Básicas do ODS
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código ODS *</InputLabel>
              <TextField
                fullWidth
                type="number"
                value={formData.codigo_ods}
                onChange={(e) => {
                  handleInputChange('codigo_ods', e.target.value);
                  // Auto-sugerir nome quando código é alterado
                  if (e.target.value) {
                    sugerirNomePorCodigo(e.target.value);
                  }
                }}
                error={!formValidation.codigo_ods}
                placeholder="Digite o número do ODS (1-17)"
                inputProps={{ min: 1, max: 17 }}
                helperText="Número do ODS oficial (1 a 17). O nome será sugerido automaticamente."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do ODS *</InputLabel>
              <TextField
                fullWidth
                value={formData.nome_ods}
                onChange={(e) => handleInputChange('nome_ods', e.target.value)}
                error={!formValidation.nome_ods}
                placeholder="Nome oficial do ODS"
                helperText="Nome oficial do ODS conforme definido pela ONU. Será sugerido automaticamente ao inserir o código."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do ODS</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricao_ods}
                onChange={(e) => handleInputChange('descricao_ods', e.target.value)}
                error={!formValidation.descricao_ods}
                placeholder="Digite uma descrição detalhada do ODS (máximo 500 caracteres)"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.descricao_ods.length}/500 caracteres. Descrição opcional do objetivo ou meta.`}
              />
            </Stack>
          </Grid>

          {/* Seção: Relacionamentos */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Temas Relacionados
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Temas Conectados ao ODS</InputLabel>
              <Autocomplete
                multiple
                options={temas}
                groupBy={(option) => option.categoria}
                getOptionLabel={(option) => option.nome}
                value={formData.tema}
                onChange={handleMultiSelectChange('tema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os temas relacionados" />
                )}
                renderGroup={(params) => (
                  <li key={params.key}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                        px: 2,
                        py: 1,
                        backgroundColor: 'grey.100'
                      }}
                    >
                      {params.group}
                    </Typography>
                    <ul style={{ padding: 0 }}>{params.children}</ul>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                      sx={{
                        backgroundColor: 
                          option.categoria === 'Ambiental' ? '#e8f5e8' :
                          option.categoria === 'Social' ? '#e3f2fd' :
                          option.categoria === 'Governança' ? '#fff3e0' :
                          '#f3e5f5'
                      }}
                    />
                  ))
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter(option =>
                    option.nome.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.categoria.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
              />
              <FormHelperText>
                Selecione os temas que estão conectados a este ODS. Os temas estão organizados por categoria.
                Múltiplas seleções são permitidas.
              </FormHelperText>
            </Stack>
          </Grid>

          {/* Seção de Resumo */}
          {(formData.codigo_ods || formData.nome_ods || formData.tema.length > 0) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Card sx={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Resumo do ODS
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.codigo_ods && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Código ODS:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ODS {formData.codigo_ods}
                        </Typography>
                      </Grid>
                    )}
                    {formData.nome_ods && (
                      <Grid item xs={12} md={8}>
                        <Typography variant="body2" color="text.secondary">
                          Nome:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formData.nome_ods}
                        </Typography>
                      </Grid>
                    )}
                    {formData.tipo_ods && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Tipo:
                        </Typography>
                        <Chip 
                          label={formData.tipo_ods.nome} 
                          size="small" 
                          color={formData.tipo_ods.nome === 'Objetivo' ? 'primary' : 'secondary'}
                        />
                      </Grid>
                    )}
                    {formData.tema.length > 0 && (
                      <Grid item xs={12} md={8}>
                        <Typography variant="body2" color="text.secondary">
                          Temas Conectados ({formData.tema.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {formData.tema.slice(0, 3).map((tema) => (
                            <Chip
                              key={tema.id}
                              label={tema.nome}
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor: 
                                  tema.categoria === 'Ambiental' ? '#e8f5e8' :
                                  tema.categoria === 'Social' ? '#e3f2fd' :
                                  tema.categoria === 'Governança' ? '#fff3e0' :
                                  '#f3e5f5'
                              }}
                            />
                          ))}
                          {formData.tema.length > 3 && (
                            <Chip
                              label={`+${formData.tema.length - 3} mais`}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>
                      </Grid>
                    )}
                    {formData.descricao_ods && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Descrição:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {formData.descricao_ods.substring(0, 150)}
                          {formData.descricao_ods.length > 150 ? '...' : ''}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
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
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={tratarSubmit}
                startIcon={<CheckCircleOutlineIcon />}
                sx={{ minWidth: "150px" }}
              >
                {requisicao === "Criar" ? "Cadastrar ODS" : "Salvar Alterações"}
              </Button>
              
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: "120px" }}
              >
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Dialog de sucesso */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center", color: "#4caf50" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">ODS Criado com Sucesso!</Typography>
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px", textAlign: "center" }}>
              O ODS foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoOds;

