import * as React from 'react';
import {
  Divider, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Box, Tooltip, TextField, Autocomplete, Grid, Switch, Stack, Typography, Checkbox, InputLabel} from '@mui/material';
import { API_QUERY, API_COMMAND } from '../../../config';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompetenciaDados } = location.state || {};
  const [unidades, setUnidades] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeCompetencia, setNomeCompetencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrada');
  const [titulo, setTitulo] = useState('Nova competência');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    unidade: [],
    tribunal: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (CompetenciaDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${CompetenciaDados.nome}`);
      setMensagemFeedback('editada');
      setFormData(prev => ({
        ...prev,
        unidade: CompetenciaDados.unidade?.map(u => u.unidadeId) || []
      }));
      setFormData(prev => ({
        ...prev,
        tribunal: CompetenciaDados.competenciaTribunal?.map(u => u.tribunalId) || []
      }));
      setNomeCompetencia(CompetenciaDados.nome);
      setDescricao(CompetenciaDados.descricao);
      setStatus(CompetenciaDados.ativo || false);
      
    }
  }, [CompetenciaDados]);

  useEffect(() => {
    const initialData = CompetenciaDados
      ? {
        nomeCompetencia: CompetenciaDados.nome || '',
        descricao: CompetenciaDados.descricao || '',
        status: CompetenciaDados.ativo ?? false,
        unidade: CompetenciaDados.unidade?.map(u => u.unidadeId) || [],
        tribunal: CompetenciaDados.tribunal?.map(u => u.tribunalId) || []
      }
      : {
        nomeCompetencia: '',
        descricao: '',
        status: true,
        unidade: [],
        tribunal: []
      };
  
    const currentData = {
      nomeCompetencia: nomeCompetencia ?? (CompetenciaDados?.nome || ''),  
      descricao: descricao ?? (CompetenciaDados?.descricao || ''),
      status: status ?? (CompetenciaDados?.ativo || false),
      unidade: formData.unidade.length || formData.unidade.length === 0
        ? formData.unidade
        : CompetenciaDados?.unidade?.map(u => u.unidadeId) || [],
      tribunal: formData.tribunal.length || formData.tribunal.length === 0
        ? formData.tribunal
        : CompetenciaDados?.tribunal?.map(u => u.tribunalId) || []
    };
  
    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    };
  
    const hasChanged = initialData.nomeCompetencia !== currentData.nomeCompetencia ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status ||
      !arraysAreEqual(initialData.unidade, currentData.unidade, initialData.tribunal, currentData.tribunal);
  
    setHasChanges(hasChanged);
  }, [nomeCompetencia, descricao, status, formData.unidade, unidades, competencias, formData.tribunal, CompetenciaDados]);
  
  
  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Unidade/ListarComboGuid`, setUnidades);
    fetchData(`${API_QUERY}/api/Tribunal/ListarCombo`, setCompetencias);
    window.scrollTo(0, 0);
  }, []);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === 'fase') {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleOpenModal = () => {
    if (hasChanges) {
      setShowChangesNotSavedModal(true);
    } else {
      voltarParaCadastroMenu();
    }
  };

  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.unidade.length === unidades.length) {
        // Deselect all
        setFormData({ ...formData, unidade: [] });
      } else {
        // Select all
        setFormData({ ...formData, unidade: unidades.map(unidade => unidade.id) });
      }
    } else {
      tratarMudancaInputGeral('unidade', newValue.map(item => item.id));
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.tribunal.length === competencias.length) {
        // Deselect all
        setFormData({ ...formData, tribunal: [] });
      } else {
        // Select all
        setFormData({ ...formData, tribunal: competencias.map(tribunal => tribunal.id) });
      }
    } else {
      tratarMudancaInputGeral('tribunal', newValue.map(item => item.id));
    }
  };

  const voltarParaCadastroMenu = () => {
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Competência' } });
  };

  // Função para carregar os dados das APIs
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  const [formValidation, setFormValidation] = useState({
    unidade: true,
    nomeCompetencia: true,
  });

  const fieldNamesMap = {
    unidade: "Unidade",
    nomeCompetencia: 'Nome',
  };

  const allSelected = formData.unidade.length === unidades.length && unidades.length > 0;
  const allSelected2 = formData.tribunal.length === competencias.length && competencias.length > 0;

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      unidade: formData.unidade.length > 0 && !formData.unidade.every(val => val === 0),
      nomeCompetencia: nomeCompetencia.trim().length > 0,
    };

    Object.entries(newValidationState).forEach(([key, value]) => {
      if (!['competencia', 'acao', 'deferida'].includes(key) && !value) {
        foiValidado = false;
        invalidFields.push(fieldNamesMap[key] || key);
      }
    });

    setFormValidation(newValidationState);

    if (!foiValidado) {
      // Removendo duplicatas
      const uniqueInvalidFields = [...new Set(invalidFields)];
      const fieldsMessage = uniqueInvalidFields.map(field => fieldNamesMap[field] || field).join(', ');
      enqueueSnackbar(`Campos inválidos: ${fieldsMessage}`, { variant: 'error' });
    }

    return foiValidado;
  };

  const tratarSubmit = async () => {

    let temErros = false;

    // Primeira validação
    if (!validarForm()) {
      temErros = true;
    }

    if (temErros) {
      return;
    }

    setLoading(true)

    // Verifica se o nome já existe
  try {
    if (requisicao !== 'Editar' || (requisicao === 'Editar' && nomeCompetencia !== CompetenciaDados.nome)) {
      const response = await fetch(`${API_QUERY}/api/Competencia/ExiteNome/${encodeURIComponent(nomeCompetencia)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const nomeExiste = await response.json();
        if (nomeExiste) {
          enqueueSnackbar('Essa competência já foi cadastrada com esse nome.', {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
          setLoading(false);
          return;
        }
      } else {
        throw new Error('Erro ao verificar o nome.');
      }
    }
  } catch (error) {
    enqueueSnackbar('Erro ao verificar o nome.', {
      variant: 'error',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
    });
    setLoading(false);
    return;
  }

    const payload = {
      id: CompetenciaDados ? CompetenciaDados.id : 0,
      competenciaUnidade: formData.unidade.map((unidade) => {
          return { id: 0,  unidadeId: unidade, };
      }),
      competenciaTribunal: formData.tribunal.map((tribunal) => {
          return { id: 0, tribunalId: tribunal, };
      }),
      nome: nomeCompetencia,
      descricao: descricao,
      ativo: status,
  };  

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeCompetencia)) {
        enqueueSnackbar('Nome inválido. Caracteres especiais e números não são permitidos.', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_COMMAND}/api/Competencia/${requisicao}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });    

      if (!response.ok) {
        const errorBody = await response.text();
        try {
          if (response.status === 400) {
            enqueueSnackbar('Não foi possível salvar essa competência.', {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
              }
            });
          }
          setLoading(false);
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText}`);
        } catch {
          setLoading(false);
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`);
        }
      } else {
        enqueueSnackbar(`Competência ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Competência' } });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };


  return (
    <>
      <LoadingOverlay isActive={loading} />
      <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          color: '#1C5297',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: 'normal',
        }}>
          {titulo}
        </span>
      </Box>
      <Grid container spacing={1}>

        <Divider sx={{ width: '100%', marginY: 2, borderBottomWidth: 2, color: '#00000033', marginTop: 1 }} />

        {/* Nome e Status lado a lado */}
        <Grid item xs={7} sx={{ paddingBottom: 5, marginRight: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Nome *</InputLabel>
            <TextField
              onChange={(event) => setNomeCompetencia(event.target.value)}
              fullWidth
              placeholder="Digite o nome da competência"
              value={nomeCompetencia}
              error={!nomeCompetencia && formValidation.nomeCompetencia === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={4}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InputLabel>Status</InputLabel>
              <Tooltip
                title="Caso inative o item, ele não estará disponível dentro do cadastro de um novo processo"
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#1C5297',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 400,
                      padding: '8px 12px',
                      width: 'auto',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#1C5297',
                    },
                  },
                }}
              >
                <IconButton style={{ marginTop: -1 }}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} style={{ marginTop: 0.5 }}>
              <Switch
                checked={status}
                onChange={(event) => setStatus(event.target.checked)}
              />
              <Typography>{status ? "Ativo" : "Inativo"}</Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Unidade */}
        <Grid item xs={8.5} mb={5}>
          <Stack spacing={1}>
            <InputLabel>Unidades *</InputLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[{ id: 'all', nome: 'Selecionar todas' }, ...unidades]}
              getOptionLabel={(option) => option.nome}
              value={formData.unidade.map(id => unidades.find(unidade => unidade.id === id) || id)}
              onChange={handleSelectAll}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <Checkbox
                        checked={option.id === 'all' ? allSelected : selected}
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
                  placeholder={formData.unidade.length > 0 ? "" : "Escreva ou selecione uma ou mais unidades"}
                  error={(formData.unidade.length === 0 || formData.unidade.every(val => val === 0)) && formValidation.unidade === false}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={8.5} mb={5}>
          <Stack spacing={1}>
            <InputLabel>Tribunal</InputLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[{ id: 'all', nome: 'Selecionar todas' }, ...competencias]}
              getOptionLabel={(option) => option.nome}
              value={formData.tribunal.map(id => competencias.find(tribunal => tribunal.id === id) || id)}
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
                  placeholder={formData.tribunal.length > 0 ? "" : "Escreva ou selecione uma ou mais tribunais"}
                  error={(formData.tribunal.length === 0 || formData.tribunal.every(val => val === 0)) && formValidation.tribunal === false}
                />
              )}
            />
          </Stack>
        </Grid>

        {/* Campo de Descrição */}
        <Grid item xs={8.5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para essa competência"
              value={descricao}
            />
          </Stack>
        </Grid>

        <Divider sx={{ width: '100%', marginY: 2, borderBottomWidth: 2, color: '#00000033', marginTop: 6 }} />

        {/* Botões de ação */}
        <Grid item xs={12} mt={5}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginRight: '20px', marginTop: 5 }}>
            <Button
              variant="outlined"
              style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.6)' }}
              onClick={handleOpenModal}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}
              onClick={tratarSubmit}
            >
              Salvar
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Dialog
        open={showChangesNotSavedModal}
        onClose={() => setShowChangesNotSavedModal(false)}
        sx={{
          '& .MuiPaper-root': { 
            width: '547px',
            height: '240px',
            maxWidth: 'none', 
          }
        }}
      >
        <DialogTitle
          sx={{
            background: '#FAAD14CC',
            width: 'auto',
            height: '42px',
            borderRadius: '4px 4px 0px 0px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            justifyContent: 'space-between', 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: '2px',
                color: 'rgba(255, 255, 255, 1)',
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '21px',
                letterSpacing: '0em',
                textAlign: 'left',
                color: 'rgba(255, 255, 255, 1)',
                flexGrow: 1,
              }}
            >
              Alerta
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: 'rgba(255, 255, 255, 1)',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography component="div" style={{ fontWeight: 'bold', marginTop: "35px", color: '#717171' }}>
            Tem certeza que deseja sair sem salvar as alterações?
          </Typography>
          <Typography component="div" style={{ marginTop: '20px' }}>
            Ao realizar essa ação, todas as alterações serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              voltarParaCadastroMenu()
            }}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: '4px',
              background: '#FBBD43',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              textTransform: 'none'
            }}
          >
            Sim, tenho certeza
          </Button>

          <Button
            onClick={() => {
              setShowChangesNotSavedModal(false);
            }}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.40)',
              background: '#FFF',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--label-60, rgba(0, 0, 0, 0.60))'
            }}
          >
            Cancelar
          </Button>

        </DialogActions>
      </Dialog>
      {requisicao === 'Editar' && (
        <AndamentoHistoricoDrawer row={CompetenciaDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
