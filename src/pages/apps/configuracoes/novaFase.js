import * as React from 'react';
import {
  Divider, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Box, Tooltip, TextField, Autocomplete, AccordionSummary, Grid, Switch, Stack, Typography, Checkbox, InputLabel, Accordion,
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
  const { FaseDados } = location.state || {};
  const [unidades, setUnidades] = useState([]);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeFase, setNomeFase] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrada');
  const [titulo, setTitulo] = useState('Nova Fase');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isMarco, setIsMarco] = useState(false)


  const [formData, setFormData] = useState({
    unidade: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (FaseDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${FaseDados.nome}`);
      setMensagemFeedback('editada');
      setFormData(prev => ({
        ...prev,
        unidade: FaseDados.unidade?.map(u => u.unidadeId) || []
      }));
      setNomeFase(FaseDados.nome);
      setDescricao(FaseDados.descricao);
      setStatus(FaseDados.ativo || false);
      setIsMarco(FaseDados.dashFase || false);


    }
  }, [FaseDados]);

  useEffect(() => {
    const initialData = FaseDados
      ? {
        nomeFase: FaseDados.nome || '',
        descricao: FaseDados.descricao || '',
        status: FaseDados.ativo ?? false,
        unidade: FaseDados.unidade?.map(u => u.unidadeId) || []
      }
      : {
        nomeFase: '',
        descricao: '',
        status: true,
        unidade: []
      };

    const currentData = {
      nomeFase: nomeFase ?? (FaseDados?.nome || ''),
      descricao: descricao ?? (FaseDados?.descricao || ''),
      status: status ?? (FaseDados?.ativo || false),
      unidade: formData.unidade.length || formData.unidade.length === 0
        ? formData.unidade
        : FaseDados?.unidade?.map(u => u.unidadeId) || []
    };

    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    };

    const hasChanged = initialData.nomeFase !== currentData.nomeFase ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status ||
      !arraysAreEqual(initialData.unidade, currentData.unidade);

    setHasChanges(hasChanged);
  }, [nomeFase, descricao, status, formData.unidade, unidades, FaseDados]);


  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Unidade/ListarComboGuid`, setUnidades);
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

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Fases' } });
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
    nomeFase: true,
  });

  const fieldNamesMap = {
    unidade: "Unidade",
    nomeFase: 'Nome de fase',
  };

  const allSelected = formData.unidade.length === unidades.length && unidades.length > 0;

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      unidade: formData.unidade.length > 0 && !formData.unidade.every(val => val === 0),
      nomeFase: nomeFase.trim().length > 0,
    };

    Object.entries(newValidationState).forEach(([key, value]) => {
      if (!['competencia', 'Fase', 'deferida'].includes(key) && !value) {
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
      if (requisicao !== 'Editar' || (requisicao === 'Editar' && nomeFase !== FaseDados.nome)) {
        const response = await fetch(`${API_QUERY}/api/Fase/ExiteNome/${encodeURIComponent(nomeFase)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const nomeExiste = await response.json();
          if (nomeExiste) {
            enqueueSnackbar('Essa ação já foi cadastrada com esse nome.', {
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
      id: FaseDados ? FaseDados.id : 0,
      faseUnidade: formData.unidade.map((unidade) => {
        return { id: 0, unidadeId: unidade, };
      }),
      nome: nomeFase,
      descricao: descricao,
      ativo: status,
      dashFase: isMarco, 
      cor: "",
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%^&*()_,.?":{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeFase)) {
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
      const response = await fetch(`${API_COMMAND}/api/Fase/${requisicao}`, {
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
        } catch {
          setLoading(false);
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`);
        }
      } else {
        enqueueSnackbar(`Nova Fase ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Fases' } });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };


  const handleChange = (panel) => (event, isExpanded) => {


    if (panel === 'panel1') {
      setIsMarco(!isMarco);

    };
  };

  const handleSwitchChange = (panel) => (event) => {
    const isChecked = event.target.checked;

    switch (panel) {
      case 'panel1':
        setIsMarco(isChecked); // Atualiza o estado do switch
        break;
      default:
        break;
    }
  };



  const accordionData = [
    {
      id: 'panel1',
      question: 'Criar um Totalizador para essa fase?',
      description: 'O totalizador é uma contagem automática dos processos que estão em determinada fase. Ao criar o totalizador para essa fase, ele aparecerá na tela da listagem de processos.'
    },

  ];

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
              onChange={(event) => setNomeFase(event.target.value)}
              fullWidth
              placeholder="Digite o nome da fase"
              value={nomeFase}
              error={!nomeFase && formValidation.nomeFase === false}
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


        {/* Campo de Descrição */}



        <Grid item xs={8.5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para essa fase"
              value={descricao}
            />
          </Stack>
        </Grid>

        {accordionData.map((item, index) => (
          <Grid item xs={12} key={item.id}>
            <Stack spacing={1}>
              <Accordion onChange={(event, isExpanded) => handleChange(item.id)(event, isExpanded)}
                sx={{
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  borderLeft: 'none',
                  borderTop: index !== 0 ? 'none' : '',
                  borderRight: 'none',
                }}>
                <AccordionSummary
                  aria-controls={`${item.id}d-content`}
                  id={`${item.id}d-header`}
                  sx={{
                    '.MuiAccordionSummary-expandIconWrapper': { display: 'none' },
                    py: 2,
                    borderTop: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
                    <Stack direction="column" spacing={1} alignItems="flex-start">
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '14px', color: '#00000080' }}>{item.question}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '13px', color: '#717171CC' }}>{item.description}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch
                        checked={item.id === 'panel1' ? isMarco : false}
                        onChange={() => handleSwitchChange(item.id)}
                      />
                      <Typography>
                        {item.id === 'panel1' ? (isMarco ? 'Sim' : 'Não') : ''}
                      </Typography>

                    </Stack>
                  </Stack>
                </AccordionSummary>
              </Accordion>
            </Stack>
          </Grid>
        ))}

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
        <AndamentoHistoricoDrawer row={FaseDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
