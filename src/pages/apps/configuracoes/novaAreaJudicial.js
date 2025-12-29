import * as React from 'react';
import {
  Accordion, AccordionDetails, Divider, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Radio, RadioGroup, Box, Tooltip, InputAdornment, TextField, Autocomplete, AccordionSummary, Grid, Switch, Stack, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
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
  const { AreaJudicialDados } = location.state || {};
  const [unidades, setUnidades] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeArea, setAreaAao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrada');
  const [titulo, setTitulo] = useState('Nova área judicial');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    unidade: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (AreaJudicialDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${AreaJudicialDados.nome}`);
      setMensagemFeedback('editada');
      setFormData(prev => ({
        ...prev,
        unidade: AreaJudicialDados.unidade?.map(u => u.unidadeId) || []
      }));
      setAreaAao(AreaJudicialDados.nome);
      setDescricao(AreaJudicialDados.descricao);
      setStatus(AreaJudicialDados.ativo || false);

    }
  }, [AreaJudicialDados]);

  useEffect(() => {
    const initialData = AreaJudicialDados
      ? {
        nomeArea: AreaJudicialDados.nome || '',
        descricao: AreaJudicialDados.descricao || '',
        status: AreaJudicialDados.ativo ?? false,
        unidade: AreaJudicialDados.unidade?.map(u => u.unidadeId) || []
      }
      : {
        nomeArea: '',
        descricao: '',
        status: true,
        unidade: []
      };
  
    const currentData = {
      nomeArea: nomeArea ?? (AreaJudicialDados?.nome || ''),  
      descricao: descricao ?? (AreaJudicialDados?.descricao || ''),
      status: status ?? (AreaJudicialDados?.ativo || false),
      unidade: formData.unidade.length || formData.unidade.length === 0
        ? formData.unidade
        : AreaJudicialDados?.unidade?.map(u => u.unidadeId) || []
    };
  
    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    };
  
    const hasChanged = initialData.nomeArea !== currentData.nomeArea ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status ||
      !arraysAreEqual(initialData.unidade, currentData.unidade);
  
    setHasChanges(hasChanged);
  }, [nomeArea, descricao, status, formData.unidade, unidades, AreaJudicialDados]);
  

  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Unidade/ListarComboGuid`, setUnidades);
    window.scrollTo(0, 0);
  }, []);

  const tratarMudancaInputGeral = (field, value) => {
    setFormData({ ...formData, [field]: value });
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

  const handleSelectAll = (event, newValue, field) => {
    const allSelected = field === 'unidade'
      ? formData.unidade.length === unidades.length
      : formData.area.length === areas.length;

    const options = field === 'unidade' ? unidades : areas;

    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (allSelected) {
        // Deselect all
        setFormData({ ...formData, [field]: [] });
      } else {
        // Select all
        setFormData({ ...formData, [field]: options.map(option => option.id) });
      }
    } else {
      tratarMudancaInputGeral(field, newValue.map(item => item.id));
    }
  };

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Área Judicial' } });
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
    nomeArea: true,
  });

  const fieldNamesMap = {
    unidade: "Unidade",
    nomeArea: 'Nome de Área',
  };

  const allSelected = formData.unidade.length === unidades.length && unidades.length > 0;

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      unidade: formData.unidade.length > 0 && !formData.unidade.every(val => val === 0),
      nomeArea: nomeArea.trim().length > 0,
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

    const payload = {
      id: AreaJudicialDados ? AreaJudicialDados.id : 0,
      servicoId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      unidade: formData.unidade.map((unidade) => {
        return { id: 0, area: "null", areaId: AreaJudicialDados ? AreaJudicialDados.id : 0, unidadeId: unidade, };
      }),
      nome: nomeArea,
      descricao: descricao,
      ativo: status,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9\-]/g;
      if (caracteresEspeciais.test(nomeArea)) {
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
      const response = await fetch(`${API_COMMAND}/api/Area/${requisicao}`, {
        method: requisicao === 'Editar' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        try {
          if (response.status === 400) {
            const errorData = JSON.parse(errorBody);
            if (errorData.message === "Já Existe uma Area com esse nome.") {
              enqueueSnackbar('Essa área já foi cadastrada com esse nome.', {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                }
              });
            } else {
              enqueueSnackbar('Não foi possível salvar essa ação.', {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                }
              });
            }
            setLoading(false);
            throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText}`);
          }
        } catch {
          setLoading(false);
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`);
        }
      } else {
        enqueueSnackbar(`Área judicial ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Área Judicial' } });
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
              onChange={(event) => setAreaAao(event.target.value)}
              fullWidth
              placeholder="Nome da área"
              value={nomeArea}
              error={!nomeArea && formValidation.nomeArea === false}
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
              onChange={(event, newValue) => handleSelectAll(event, newValue, 'unidade')}
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

        {/* Campo de Descrição */}
        <Grid item xs={8.5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para essa área judicial"
              value={descricao}
            />
          </Stack>
        </Grid>

        <Divider sx={{ width: '100%', marginY: 2, borderBottomWidth: 2, color: '#00000033', marginTop: 6 }} />

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
          '& .MuiPaper-root': { // Este seletor atinge o Paper component que Dialog usa internamente para seu layout
            width: '547px',
            height: '240px',
            maxWidth: 'none', // Isso garante que o Dialog não tente se ajustar além do width especificado
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
            justifyContent: 'space-between', // Ajustado para distribuir o espaço entre os elementos
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}> {/* Agrupa o ícone de lixeira e o texto */}
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
          {/* Botão para fechar o modal */}
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
              // Ação para "Cancelar" (manter o modal de edição aberto)
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
        <AndamentoHistoricoDrawer row={AreaJudicialDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
