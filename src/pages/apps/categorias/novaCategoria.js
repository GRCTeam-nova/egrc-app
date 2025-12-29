/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import {
  Button, Box, TextField, Autocomplete, Grid, Stack, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import LoadingOverlay from '../configuracoes/LoadingOverlay';
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [perfilAnalises, setPerfil] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [codigo] = useState('');
  const [nome, setNome] = useState('');
  const [status] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrada');
  const [categoriaDados, setCategoriasDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    categoria: '',
    processo: [],
    riscoAssociado: [],
    conta: [],
    responsavel: '',
    dataInicioOperacao: null,
  });


  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCategory, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map(item => ({
        id: item.idCategory || item.idLedgerAccount
          || item.idProcess || item.id_responsible
          || item.idCategory || item.idCategory
          || item.idFramework || item.idTreatment
          || item.idStrategicGuideline || item.idFactor
          || item.idIncident || item.idCause
          || item.idImpact || item.idNormative
          || item.idDepartment || item.idKri
          || item.idControl || item.idThreat
          || item.idAnalysisProfile,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/analisys-profile`, setPerfil);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/categories/${dadosApi.idCategory}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de empresas");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setNome(data.name);
          setDescricao(data.description)
          setFormData((prev) => ({
            ...prev,
            perfilAnalise: data.idAnalysisProfile || null
          }));
          setCategoriasDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idCategory) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  // Função para voltar para a listagem
  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation, setFormValidation] = useState({
    descricao: true,
    nome: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = '';
    let method = '';
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!descricao.trim()) {
      setFormValidation((prev) => ({ ...prev, descricao: false }));
      missingFields.push("Descrição");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 ? "são obrigatórios e devem estar válidos!" : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, { variant: "error" });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === 'Criar') {
      url = 'https://api.egrc.homologacao.com.br/api/v1/categories';
      method = 'POST';
      payload = {
        name: nome,
        description: descricao,
      };
    } else if (requisicao === 'Editar') {
      url = `https://api.egrc.homologacao.com.br/api/v1/categories`;
      method = 'PUT';
      payload = {
        idCategory: categoriaDados?.idCategory,
        code: codigo,
        name: nome,
        description: descricao,
        active: status,
        idAnalysisProfile: formData.perfilAnalise
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error('O Código informado já foi cadastrado.');
      } else {
        enqueueSnackbar(`Categoria ${mensagemFeedback} com sucesso!`, { variant: 'success' });
      }

      if (requisicao === "Criar" && data.data.idCategory) {
        // Atualiza o estado para modo de edição
        setCategoriasDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar('Não foi possível cadastrar essa categoria.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição *</InputLabel>
              <TextField
                onChange={(event) => setDescricao(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricao}
                error={!descricao && formValidation.descricao === false}
              />
            </Stack>
          </Grid>

          {requisicao === 'Editar' && (
            <>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Perfil de análise</InputLabel>
              <Autocomplete
                options={perfilAnalises}
                getOptionLabel={(option) => option.nome}
                value={perfilAnalises.find(perfilAnalise => perfilAnalise.id === formData.perfilAnalise) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    perfilAnalise: newValue ? newValue.id : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    error={!formData.perfilAnalise && formValidation.perfilAnalise === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginRight: '20px', marginTop: 5 }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
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
            {/* Ícone de Sucesso */}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {/* Título Centralizado */}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Categoria Criada com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A categoria foi cadastrada com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a essa categoria.
              </DialogContentText>
            </DialogContent>

            {/* Botões */}
            <DialogActions
              sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
            >
              <Button
                onClick={voltarParaListagem}
                variant="outlined"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                  },
                }}
              >
                Voltar para a listagem
              </Button>
              <Button
                onClick={continuarEdicao}
                variant="contained"
                sx={{
                  backgroundColor: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0056b3",
                  },
                }}
                autoFocus
              >
                Adicionar mais informações
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
