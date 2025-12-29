import * as React from 'react';
import {
  Accordion, AccordionDetails, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Radio, RadioGroup, Box, Tooltip, InputAdornment, TextField, Autocomplete, AccordionSummary, Grid, Switch, Stack, Typography, FormGroup, FormControlLabel, Checkbox, InputLabel, Select, MenuItem
} from '@mui/material';
import { API_QUERY, API_COMMAND } from '../../../config';
import ErrorIcon from '@mui/icons-material/Error';
import { enqueueSnackbar } from 'notistack';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tipoAndamentosDadosEditar } = location.state || {};
  const [radioDocumento, setRadioDocumento] = useState(null);
  const [radioTarefa, setRadioTarefa] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [responsaveis, setResponsavel] = useState([]);
  const [fases, setFases] = useState([]);
  const [isMarco, setIsMarco] = useState(false);
  const [temAudiencia, setTemAudiencia] = useState(false);
  const [tempoNotificar, setTempoNotificar] = useState(60);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [exigeDocumento, setExigeDocumento] = useState(false);
  const [nomeAndamento, setNomeAndamento] = useState('');
  const [temTarefa, setTemTarefa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Tipos de Andamento');
  const [primeiraExecucao, setPrimeiraExecucao] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    unidade: [],
    responsavel: null,
    fase: ''
  });

  const [expanded, setExpanded] = useState({
    panel4: temTarefa,
    panel6: exigeDocumento,
    panel2: false,  
  });

  // Em caso de edição
  useEffect(() => {
    if (tipoAndamentosDadosEditar) {
      const exigeDoc = tipoAndamentosDadosEditar.exigeDocumento;
      const temTarefa = tipoAndamentosDadosEditar.temTarefa;
      const temFase = tipoAndamentosDadosEditar.faseId;

      setRequisicao('Editar');
      setTitulo(`Editar ${tipoAndamentosDadosEditar.nome}`);
      setMensagemFeedback('editado');
      setRadioDocumento(exigeDoc ? 'sim' : null);
      setRadioTarefa(temTarefa ? 'sim' : null);
      setFormData(prev => ({ ...prev, unidade: tipoAndamentosDadosEditar.unidadeId || [] }));
      setFormData(prev => ({ ...prev, fase: tipoAndamentosDadosEditar.faseId || [] }));
      setNomeAndamento(tipoAndamentosDadosEditar.nome);
      setIsMarco(tipoAndamentosDadosEditar.ehMarco || false);
      setTemAudiencia(tipoAndamentosDadosEditar.temAudiencia || false);
      setExigeDocumento(tipoAndamentosDadosEditar.exigeDocumento || false);
      setTemTarefa(tipoAndamentosDadosEditar.temTarefa || false);

      // Expand panel2 if faseId is present
      if (temFase) {
        setExpanded(prev => ({ ...prev, panel2: true }));
      }
    }
  }, [tipoAndamentosDadosEditar]);

  useEffect(() => {
    if (primeiraExecucao < 2) {
      setExpanded(prev => ({
        ...prev,
        panel4: temTarefa,
        panel6: exigeDocumento,
      }));
      setPrimeiraExecucao(primeiraExecucao + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temTarefa, exigeDocumento]);
  // Fim do caso de edição

  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Unidade`, setUnidades);
    fetchData(`${API_QUERY}/api/Usuario`, setResponsavel);
    fetchData(`${API_QUERY}/api/Fase`, setFases);
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

  const handleChangeDocumento = (event) => {
    setRadioDocumento(event.target.value);
    setExigeDocumento(event.target.value === 'sim');
  };

  const handleChangeTarefa = (event) => {
    setRadioTarefa(event.target.value);
    setTemTarefa(event.target.value === 'sim');
  };

  const handleChangeSelect = (event) => {
    setTempoNotificar(event.target.value);
  };

  const handleOpenModal = () => {
    setShowChangesNotSavedModal(true);
  };

  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tipos de Andamento' } });
  };

  // Função para carregar os dados das APIs
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    if (panel === 'panel6' && !isExpanded) {
      setRadioDocumento(null);
      setExigeDocumento(false);
    }

    if (panel === 'panel2' && !isExpanded) {
      setFormData(prev => ({
        ...prev,
        fase: ''
      }));
    }

    if (panel === 'panel4' && !isExpanded) {
      setRadioTarefa(null);
      setTemTarefa(false);
    }

    if (panel === 'panel1') {
      setIsMarco(!isMarco);
    } else if (panel === 'panel8') {
      setTemAudiencia(!temAudiencia);
    } else {
      setExpanded(prevExpanded => ({
        ...prevExpanded,
        [panel]: isExpanded ? !prevExpanded[panel] : false
      }));
    }
  };

  const [formValidation, setFormValidation] = useState({
    unidade: true,
    nomeAndamento: true,
  });

  const fieldNamesMap = {
    unidade: "Unidade",
    nomeAndamento: 'Nome de Andamento',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      unidade: formData.unidade.length > 0 && !formData.unidade.every(val => val === 0),
      nomeAndamento: nomeAndamento.trim().length > 0,
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
      id: tipoAndamentosDadosEditar ? tipoAndamentosDadosEditar.id : null,
      unidadeId: formData.unidade,
      faseId: formData.fase.length === 0 ? null : formData.fase,
      nome: nomeAndamento,
      exigeDocumento: exigeDocumento,
      temTarefa: temTarefa,
      ehMarco: isMarco,
      temAudiencia: temAudiencia,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeAndamento)) {
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
      const response = await fetch(`${API_COMMAND}/api/TipoAndamento/${requisicao}`, {
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
            enqueueSnackbar('Esse tipo de andamento com esse nome já foi cadastrado.', {
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
        enqueueSnackbar(`Tipo de andamento ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tipos de Andamento' } });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const [checkedValues2, setCheckedValues2] = useState({
    sms: false,
    email: false,
    whatsapp: false,
    notifications: false,
    all: false
  });

  function MudancaCheckboxAlerta(event, type) {
    setCheckedValues2({ ...checkedValues2, [type]: event.target.checked });
  }

  const handleSwitchChange = (panel) => (event) => {
    const isChecked = event.target.checked;
    switch (panel) {
      case 'panel1':
        setIsMarco(isChecked);
        break;
      case 'panel8':
        setTemAudiencia(isChecked); 
        break;
      default:
        // Altera o estado de expanded para outros painéis
        setExpanded(prev => ({
          ...prev,
          [panel]: isChecked
        }));
        break;
    }
  };

  // Função para atualizar o estado dos checkboxes
  const handleSelectAll = (event) => {
    const newChecked = {
      sms: event.target.checked,
      email: event.target.checked,
      whatsapp: event.target.checked,
      notifications: event.target.checked,
      all: event.target.checked
    };
    setCheckedValues2(newChecked);
  };

  const accordionData = [
    {
      id: 'panel1',
      question: 'Esse andamento é um Marco?',
      description: 'Se sim, esse andamento será registrado na linha do tempo do processo e terá um destaque visual na listagem de andamentos dentro do processo.'
    },
    {
      id: 'panel2',
      question: 'Esse tipo de andamento muda a fase do processo?',
      description: 'Se sim, quando o processo receber esse andamento ele mudará automaticamente de fase.',
      content: (
        <>
          <Box
            mt={3}
            mb={3}
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%'
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração da fase processual</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>Esse andamento vai pra qual fase processual?</Typography>

            <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 2 }}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <Autocomplete
                    options={fases}
                    getOptionLabel={(option) => option.nome}
                    value={fases.find(fase => fase.id === formData.fase) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        fase: newValue ? newValue.id : ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params}
                        placeholder="Escreva ou selecione uma fase"
                        error={!formData.fase && formValidation.fase === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )
    },
    {
      id: 'panel3',
      question: 'Cria um compromisso na agenda?',
      description: 'Se sim, um compromisso será criado na agenda do responsável do processo.',
      content: (
        <>
          <Box
            mt={3}
            mb={3}
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%'
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração do compromisso</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>Esse compromisso deve aparecer na agenda do:</Typography>
            <RadioGroup
              row
              aria-label="agenda-criar"
              name="agenda"
              sx={{ marginTop: 2 }}
            >
              <FormControlLabel value="0" control={<Radio />} sx={{ color: '#717171', fontWeight: 400 }} label="Responsável principal do processo" />
              <FormControlLabel value="1" control={<Radio />} sx={{ color: '#717171', fontWeight: 400 }} label="Todos os responsáveis do processo" />
              <FormControlLabel value="2" control={<Radio />} sx={{ color: '#717171', fontWeight: 400 }} label="Grupo de usuário responsável pelo processo" />
            </RadioGroup>
            <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: -2 }}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Notificar um usuário específico?</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={responsaveis.find(responsavel => responsavel.id === formData.responsavel) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        responsavel: newValue ? newValue.id : ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params}
                        placeholder="Escreva ou selecione um responsavel"
                        error={!formData.responsavel && formValidation.responsavel === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={3} sx={{
                paddingBottom: 5
              }}>
                <Stack spacing={1}>
                  <InputLabel>Notificar</InputLabel>
                  <Select
                    value={tempoNotificar}
                    onChange={handleChangeSelect}
                  >
                    <MenuItem value={10}>5 minutos antes</MenuItem>
                    <MenuItem value={20}>10 minutos antes</MenuItem>
                    <MenuItem value={30}>15 minutos antes</MenuItem>
                    <MenuItem value={40}>30 minutos antes</MenuItem>
                    <MenuItem value={50}>1 hora antes</MenuItem>
                    <MenuItem value={60}>1 dia antes</MenuItem>
                  </Select>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )
    },
    {
      id: 'panel4',
      question: 'Pode ter uma tarefa avulsa?',
      description: 'Se sim, na criação de um andamento dentro do processo, será possível criar uma tarefa atrelada.',
      content: (
        <>
          <Box
            mt={3}
            mb={3}
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%'
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração de Tarefa Avulsa</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>É obrigatório ter uma tarefa avulsa nesse andamento?</Typography>
            <RadioGroup
              row
              aria-label="tarefa-avulsa"
              name="tarefaAvulsa"
              onChange={handleChangeTarefa}
              value={radioTarefa}
              style={{ marginTop: 8 }} // Aumento do espaço acima do grupo de rádios
            >
              <FormControlLabel value="sim" control={<Radio />} label="Sim" />
              <FormControlLabel value="nao" control={<Radio />} label="Não" />
            </RadioGroup>
          </Box>
        </>
      )
    },
    {
      id: 'panel5',
      question: 'Inicia workflow?',
      description: 'Se sim, esse tipo de andamento poderá ser uma opção de acionador nas configurações do workflow.',
      content: (
        <>
          <Box
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%',
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração workflow</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>É obrigatório ter um workflow para esse andamento?</Typography>
            <RadioGroup
              row
              aria-label="tarefa-avulsa"
              name="tarefaAvulsa"
              style={{ marginTop: 8 }} // Aumento do espaço acima do grupo de rádios
            >
              <FormControlLabel value="sim" control={<Radio />} label="Sim" />
              <FormControlLabel value="nao" control={<Radio />} label="Não" />
            </RadioGroup>
          </Box>
        </>
      )
    },
    {
      id: 'panel6',
      question: 'Exige documento?',
      description: 'Se sim, será exibido o campo de adicionar documento na criação de um novo andamento no processo.',
      content: (
        <>
          <Box
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%',
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração documento</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>É obrigatório ter um documento para esse andamento?</Typography>
            <RadioGroup
              row
              aria-label="documento-obrigatorio"
              name="documentoObrigatorio"
              style={{ marginTop: 8 }}
              onChange={handleChangeDocumento}
              value={radioDocumento}
            >
              <FormControlLabel value="sim" control={<Radio />} label="Sim" />
              <FormControlLabel value="nao" control={<Radio />} label="Não" />
            </RadioGroup>
          </Box>
        </>
      )
    },
    {
      id: 'panel7',
      question: 'Criar alerta?',
      description: 'Se sim, quando esse andamento for inserido em um processo, uma notificação será automaticamente enviada para o responsável do processo.',
      content: (
        <>
          <Box
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '92%',
            }}
          >
            <Typography sx={{ marginBottom: 2, color: 'primary.main', fontWeight: 600 }}>Configuração alerta</Typography>
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>Como deseja receber esse alerta?</Typography>
            <FormGroup sx={{ marginTop: 2 }}>
              <FormControlLabel control={<Checkbox checked={checkedValues2.sms} onChange={(e) => MudancaCheckboxAlerta(e, 'sms')} />} label="SMS" />
              <FormControlLabel control={<Checkbox checked={checkedValues2.email} onChange={(e) => MudancaCheckboxAlerta(e, 'email')} />} label="E-mail" />
              <FormControlLabel control={<Checkbox checked={checkedValues2.whatsapp} onChange={(e) => MudancaCheckboxAlerta(e, 'whatsapp')} />} label="Whatsapp" />
              <FormControlLabel control={<Checkbox checked={checkedValues2.notifications} onChange={(e) => MudancaCheckboxAlerta(e, 'notifications')} />} label="Pelas notificações do sistema" />
              <FormControlLabel
                control={<Checkbox checked={checkedValues2.all} onChange={handleSelectAll} />}
                label="Todas as opções acima"
              />
            </FormGroup>
          </Box>
        </>
      )
    },
    {
      id: 'panel8',
      question: 'Indica audiência?',
      description: 'Se sim, ao cadastrar esse tipo de andamento, os campos relacionados à audiência serão exibidos automaticamente no andamento.'
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
        {requisicao === 'Editar' && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FontAwesomeIcon icon={faClockRotateLeft} style={{ color: '#1C5297' }} />}
            style={{
              marginRight: '10px',
              height: '26px',
              borderRadius: '4px',
              border: '0.6px solid #1C5297',
              color: '#1C5297'
            }}
            onClick={handleDrawerOpen}
          >
            Histórico
          </Button>
        )}
      </Box>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Stack spacing={1}>
            <InputLabel>Unidades *</InputLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={unidades}
              getOptionLabel={(option) => option.nome}
              sx={{ paddingBottom: 5 }}
              value={formData.unidade.map(id => unidades.find(unidade => unidade.id === id) || id)}
              onChange={(event, newValue) => {
                // Atualize com os IDs das Orgaos selecionadas
                tratarMudancaInputGeral('unidade', newValue.map(item => item.id));
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      {option.nome}
                    </Grid>
                    <Grid item>
                      <Switch
                        checked={selected}
                        onChange={(event) => {

                        }}
                      />
                    </Grid>
                  </Grid>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={formData.unidade.length > 0 ? "" : "Escreva ou selecione uma ou mais unidades"}
                  error={(formData.unidade.length === 0 || formData.unidade.every(val => val === 0)) && formValidation.unidade === false}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {(!formData.unidade && formValidation.unidade === false) && (
                          <InputAdornment position="end">
                            <Tooltip title="Campo obrigatório">
                              <ErrorIcon color="error" />
                            </Tooltip>
                          </InputAdornment>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}

                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={4} sx={{
          paddingBottom: 5,
          marginLeft: 5
        }}>
          <Stack spacing={1}>
            <InputLabel>Nome do andamento *</InputLabel>
            <TextField onChange={(event) => setNomeAndamento(event.target.value)}
              fullWidth
              placeholder="Nome do tipo de andamento"
              value={nomeAndamento}
              error={!nomeAndamento && formValidation.nomeAndamento === false}
            />
          </Stack>
        </Grid>
        {accordionData.map((item, index) => (
          <Grid item xs={12} key={item.id}>
            <Stack spacing={1}>
              <Accordion expanded={!!expanded[item.id]} onChange={(event, isExpanded) => handleChange(item.id)(event, isExpanded)}
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
                        checked={item.id === 'panel1' ? isMarco : item.id === 'panel8' ? temAudiencia : !!expanded[item.id]}
                        onChange={handleSwitchChange(item.id)}
                      />
                      <Typography>
                        {item.id === 'panel1' ? (isMarco ? 'Sim' : 'Não') : item.id === 'panel8' ? (temAudiencia ? 'Sim' : 'Não') : (expanded[item.id] ? 'Sim' : 'Não')}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 2, backgroundColor: 'transparent', borderTop: 'none', marginBottom: 3 }}>
                  <Stack spacing={2}>
                    {item.content || (
                      <>
                        <Typography variant="h5">Lorem ipsum dolor sit amet,</Typography>
                        <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Typography>
                        <Typography>Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Typography>
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Grid>
        ))}
        <Grid item xs={12} mt={5}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginRight: '20px' }}>
            <Button variant="outlined" style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.6)' }} onClick={handleOpenModal}>Cancelar</Button>
            <Button variant="contained" color="primary" style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }} onClick={tratarSubmit}>Salvar</Button>
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
        <AndamentoHistoricoDrawer row={tipoAndamentosDadosEditar} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
