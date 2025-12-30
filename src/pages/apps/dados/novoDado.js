/* eslint-disable react-hooks/exhaustive-deps */
import {API_URL} from "../../../config";
import * as React from 'react';
import {
  Button, Box, TextField, Autocomplete, Grid, Switch, Stack, Typography, Checkbox, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerDados";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [processos, setProcessos] = useState([]);
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState([]);
  const [nomeDado, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sensivel, setSensivel] = useState(false);
  const [tratamento, setTratamento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [empresaDados, setDepartamentosDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    departamentoLateral: [],
    tipoResponsabilidade: [],
    planoAcao: [],
    formatoUnidade: [],
    departamentoSuperior: '',
    processo: [],
    risco: [],
    incidente: [],
    responsavel: '',
    dataInicioOperacao: null,
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchDepartamentosDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}datas/${dadosApi.id}`,
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
          setMensagemFeedback("editado");
          setNome(data.name);
          setCodigo(data.code)
          setDescricao(data.description)
          setSensivel(data.sensitive)
          setTratamento(data.performTreatment)
          // Garante que os valores estão definidos
          setFormData((prev) => ({
            ...prev,
            processo: data.idProcesses || null,
            tipoResponsabilidade: data.idEvaluationGiven || null,
          }));

          setDepartamentosDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.id) {
        fetchDepartamentosDados();
      }
    }
  }, [dadosApi]);


  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}processes`, setProcessos);
    fetchData(`${process.env.REACT_APP_API_URL}datas/evaluation-givens`, setTiposResponsabilidades);
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCompany, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map(item => ({
        id: item.idCompany || item.idLedgerAccount
          || item.idProcess || item.id_responsible
          || item.idDepartment || item.idEvaluationGiven
          || item.idIncident || item.idUnitFormat
          || item.idResponsabilityType,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === 'departamentoSuperior') {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id], // Seleciona o novo processo automaticamente
    }));
  };




  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.processo.length === processos.length) {
        // Deselect all
        setFormData({ ...formData, processo: [] });
      } else {
        // Select all
        setFormData({ ...formData, processo: processos.map(processo => processo.id) });
      }
    } else {
      tratarMudancaInputGeral('processo', newValue.map(item => item.id));
    }
  };



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
    nomeDado: true,
    codigo: true
  });

  const allSelected2 = formData.processo.length === processos.length && processos.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = '';
    let method = '';
    let payload = {};

    const missingFields = [];
    if (!nomeDado.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeDado: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 ? "são obrigatórios e devem estar válidos!" : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, { variant: "error" });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === 'Criar') {
      url = `${process.env.REACT_APP_API_URL}datas`;
      method = 'POST';
      payload = {
        name: nomeDado,
        code: codigo
      };
    } else if (requisicao === 'Editar') {
      url = `${process.env.REACT_APP_API_URL}datas`;
      method = 'PUT';
      payload = {
        idLgpd: empresaDados?.idLgpd,
        active: true,
        name: nomeDado,
        code: codigo,
        sensitive: sensivel,
        performTreatment: tratamento,
        description: descricao,
        idEvaluationGiven: formData.tipoResponsabilidade?.length ? formData.tipoResponsabilidade : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
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
        throw new Error('Não foi possível cadastrar o dado.');
      } else {
        enqueueSnackbar(`Dado ${mensagemFeedback} com sucesso!`, { variant: 'success' });
      }

      if (requisicao === "Criar" && data.data.idLgpd) {
        // Atualiza o estado para modo de edição
        setDepartamentosDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar('Não foi possível cadastrar esse dado.', { variant: 'error' });
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
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
                value={codigo}
                error={!codigo && formValidation.codigo === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nomeDado}
                error={!nomeDado && formValidation.nomeDado === false}
              />
            </Stack>
          </Grid>

          {requisicao === 'Editar' && (
            <>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição</InputLabel>
              <TextField
                onChange={(event) => setDescricao(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricao}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Classificação do dado</InputLabel>
              <Autocomplete
                options={tiposResponsabilidades}
                getOptionLabel={(option) => option.nome}
                value={tiposResponsabilidades.find(tipoResponsabilidade => tipoResponsabilidade.id === formData.tipoResponsabilidade) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    tipoResponsabilidade: newValue ? newValue.id : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    error={!formData.tipoResponsabilidade && formValidation.tipoResponsabilidade === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
            <InputLabel>
                    Processos{" "}
                    <DrawerProcesso
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onProcessCreated={handleProcessCreated}
                    />
                  </InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todas' }, ...processos]}
                getOptionLabel={(option) => option.nome}
                value={formData.processo.map(id => processos.find(processo => processo.id === id) || id)}
                onChange={handleSelectAll2}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelected2 : selected}
                        />
                      </Grid>
                      <Grid item xs>
                        {option.nome}
                      </Grid>
                    </Grid>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={(formData.processo.length === 0 || formData.processo.every(val => val === 0)) && formValidation.processo === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={2}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} style={{ marginTop: 0.5 }}>
                <Switch
                  checked={sensivel}
                  onChange={(event) => setSensivel(event.target.checked)}
                />
                <Typography>{"Sensível"}</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={4} sx={{paddingBottom: 5}}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} style={{ marginTop: 0.5 }}>
                <Switch
                  checked={tratamento}
                  onChange={(event) => setTratamento(event.target.checked)}
                />
                <Typography>{"Realiza Tratamento"}</Typography>
              </Stack>
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
              Dado Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O dado foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse dado.
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
