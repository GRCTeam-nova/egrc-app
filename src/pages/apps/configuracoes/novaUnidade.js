import * as React from 'react';
import {
  Accordion, AccordionDetails, List, ListItem, Popover, MenuList, ListItemText, ListItemSecondaryAction, ListItemIcon, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Box, Tooltip, TextField, Autocomplete, AccordionSummary, Grid, Switch, Stack, Typography, InputLabel, MenuItem
} from '@mui/material';
import { API_QUERY, API_COMMAND } from '../../../config';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark, faCircleInfo, faPenToSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';
import semRegistro from '../../../assets/images/SemRegistros.png';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tipoAndamentosDadosEditar } = location.state || {};
  const [nomeOrgao, setNomeOrgao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sigla, setSigla] = useState('');
  const [motivos, setMotivos] = useState([]);
  const [copiarUnidade, setCopiarUnidade] = useState(false);
  const [novoMotivo, setNovoMotivo] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMotivo, setEditMotivo] = useState("");
  const [statusRegistros, setStatusRegistros] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [status, setStatus] = useState(true);
  const [fases, setFases] = useState([]);
  const [isMarco, setIsMarco] = useState(false);
  const [temAudiencia, setTemAudiencia] = useState(false);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [exigeDocumento, setExigeDocumento] = useState(false);
  const [nomeAndamento, setNomeAndamento] = useState('');
  const [temTarefa, setTemTarefa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Nova Unidade');
  const [primeiraExecucao, setPrimeiraExecucao] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    unidade: [],
    responsavel: null,
    fase: ''
  });

  useEffect(() => {
    if (tipoAndamentosDadosEditar) {
      setNomeOrgao(tipoAndamentosDadosEditar.nome)
      setSigla(tipoAndamentosDadosEditar.codigo)
      setDescricao(tipoAndamentosDadosEditar.descricao)
      setStatus(tipoAndamentosDadosEditar.ativo)
      setCopiarUnidade(tipoAndamentosDadosEditar.copiarParametro)

      const motivosAtivos =
        tipoAndamentosDadosEditar.segmento?.map((segmento) =>
          segmento.ativo ? "Ativo" : "Inativo"
        ) || [];
      setMotivos(tipoAndamentosDadosEditar.segmento || []);
      setStatusRegistros(motivosAtivos);
    }
  }, [tipoAndamentosDadosEditar]);

  const [expanded, setExpanded] = useState({
    panel4: temTarefa,
    panel6: exigeDocumento,
    panel2: false,
  });

  // Em caso de edição
  useEffect(() => {
    if (tipoAndamentosDadosEditar) {
      const temFase = tipoAndamentosDadosEditar.faseId;

      setRequisicao('Editar');
      setTitulo(`Editar ${tipoAndamentosDadosEditar.nome}`);
      setMensagemFeedback('editado');
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
    fetchData(`${API_QUERY}/api/TipoDocumento/ListarCombo?ativo=true`, setFases);
    window.scrollTo(0, 0);
  }, []);

  const handleOpenModal = () => {
    setShowChangesNotSavedModal(true);
  };

  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Unidade' } });
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
      setExigeDocumento(false);
    }

    if (panel === 'panel2' && !isExpanded) {
      setFormData(prev => ({
        ...prev,
        fase: ''
      }));
    }

    if (panel === 'panel4' && !isExpanded) {
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
    nomeOrgao: true,
    sigla: true,
  });

  const fieldNamesMap = {
    nomeOrgao: "Nome",
    sigla: 'Sigla',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      nomeOrgao: nomeOrgao.trim().length > 0,
      sigla: sigla.trim().length > 0,
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

    try {
      if (requisicao !== 'Editar' || (requisicao === 'Editar' && nomeOrgao !== tipoAndamentosDadosEditar.nome)) {
        const response = await fetch(`${API_QUERY}/api/Unidade/ExisteNome/${encodeURIComponent(nomeOrgao)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const nomeExiste = await response.json();
          if (nomeExiste) {
            enqueueSnackbar('Esse órgão já foi cadastrado com esse nome.', {
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

    if (motivos.length === 0) {
      enqueueSnackbar("Você precisa adicionar pelo menos um segmento.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      setLoading(false);
      return;
    }

    const segmentos = motivos.map((motivo, index) => ({
      id: motivo.id || 0,
      nome: motivo.nome,
      ativo: statusRegistros[index] === "Ativo",
      unidadeId: 0
    }));

    setLoading(true)
    const payload = {
      id: tipoAndamentosDadosEditar ? tipoAndamentosDadosEditar.id : 0,
      nome: nomeOrgao,
      codigo: sigla,
      descricao: descricao,
      copiarParametro: copiarUnidade,
      ativo: status,
      segmentos
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeOrgao)) {
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
      const response = await fetch(`${API_COMMAND}/api/Unidade/${requisicao}`, {
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
        enqueueSnackbar(`Unidade ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Unidade' } });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSwitchChange = (panel) => (event) => {
    const isChecked = event.target.checked;
    switch (panel) {
      case 'panel1':
        setIsMarco(isChecked);
        break;
      case 'panel2':
        setCopiarUnidade(isChecked);
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

  const handleExcluirRegistro = (index) => {
    const motivo = motivos[index];
  
    if (motivo.pasta && motivo.pasta.length > 0) {
      enqueueSnackbar(
        "Este segmento não pode ser excluído porque possui pastas vinculadas.",
        { variant: "error" }
      );
      return;
    }
  
    setMotivos((prevMotivos) => prevMotivos.filter((_, i) => i !== index));
    setStatusRegistros((prevStatus) =>
      prevStatus.filter((_, i) => i !== index)
    );
    handleClose(); // Fecha o popover
  };  

  const isNomeDuplicado = (nome) => {
    return motivos.some(
      (motivo) => motivo.nome.toLowerCase() === nome.toLowerCase()
    );
  };

  const handleAdicionarMotivo = () => {
    if (!novoMotivo.trim()) {
      enqueueSnackbar("O motivo não pode estar vazio.", { variant: "error" });
      return;
    }

    if (isNomeDuplicado(novoMotivo)) {
      enqueueSnackbar("Já existe um motivo com esse nome.", {
        variant: "error",
      });
      return;
    }

    if (editIndex !== null) {
      // Atualizar um motivo existente
      const updatedMotivos = [...motivos];
      updatedMotivos[editIndex] = {
        ...updatedMotivos[editIndex],
        nome: novoMotivo,
      };
      setMotivos(updatedMotivos);
      setEditIndex(null); // Finalizar edição
    } else {
      // Adicionar novo motivo
      setMotivos([...motivos, { id: 0, nome: novoMotivo, ativo: true }]);
    }

    setNovoMotivo(""); // Limpar campo de entrada
  };

  const handleSaveEdit = () => {
    if (!editMotivo.trim()) {
      enqueueSnackbar("O motivo não pode estar vazio.", { variant: "error" });
      return;
    }

    if (isNomeDuplicado(editMotivo)) {
      enqueueSnackbar("Já existe um motivo com esse nome.", {
        variant: "error",
      });
      return;
    }

    if (editIndex !== null) {
      const updatedMotivos = [...motivos];
      updatedMotivos[editIndex] = {
        ...updatedMotivos[editIndex], // Preserva as outras propriedades do motivo
        nome: editMotivo, // Atualiza apenas o campo `nome`
      };
      setMotivos(updatedMotivos);
      setEditIndex(null);
      setEditModalOpen(false);
      setEditMotivo("");
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setEditMotivo(""); // Limpar o campo ao fechar o modal
    setEditIndex(null); // Limpar o índice de edição
  };

  // Função para abrir o diálogo de exclusão
  const handleOpenDeleteDialog = (index) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
    handleClosePopover();
  };

  // Função para confirmar a exclusão
  const handleConfirmDelete = () => {
    handleExcluirRegistro(deleteIndex);
    setShowDeleteDialog(false);
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (motivos && motivos.length > 0) {
      const novosStatus = motivos.map((motivo, index) => {
        // Mantém o status existente ou define "Ativo/Inativo" com base no campo `ativo` do motivo
        return statusRegistros[index] || (motivo.ativo ? "Ativo" : "Inativo");
      });
      setStatusRegistros(novosStatus);
    } else {
      setStatusRegistros([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motivos]);

  const handleToggleStatus = (index) => {
    if (statusRegistros[index] === "Ativo") {
      setShowConfirmDialog(true);
      setCurrentIndex(index);
      handleClosePopover();
    } else {
      toggleStatus(index);
      handleClosePopover();
    }
  };

  const toggleStatus = (index) => {
    setStatusRegistros((prevStatus) =>
      prevStatus.map((status, i) =>
        i === index ? (status === "Ativo" ? "Inativo" : "Ativo") : status
      )
    );
    setShowConfirmDialog(false); // Fecha o dialog caso tenha sido exibido
  };

  const handleConfirmInactivation = () => {
    toggleStatus(currentIndex);
  };

  const handleCancelInactivation = () => {
    setShowConfirmDialog(false);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentIndex(null);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditMotivo(motivos[index].nome);
    setEditModalOpen(true);
    handleClosePopover();
  };

  const accordionData = [
    {
      id: 'panel2',
      question: 'Copiar cadastros de outra Unidade?',
      description: 'É possível copiar os cadastros de outra unidade. Apenas uma unidade pode ser selecionada.',
      content: (
        <>
          <Box
            mt={3}
            mb={3}
            p={2}
            sx={{
              border: '0.6px solid #1C529733',
              borderRadius: '4px',
              width: '100%'
            }}
          >
            <Typography component="span" variant="body2" sx={{ marginBottom: 1, fontWeight: 600, color: '#00000080' }}>Unidade *</Typography>
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <Stack spacing={1}>
                  <Autocomplete
                    id="size-small-outlined-multi"
                    size="small"
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
                    sx={{
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        p: 1
                      },
                      '& .MuiAutocomplete-tag': {
                        bgcolor: 'primary.lighter',
                        border: '1px solid',
                        borderRadius: 1,
                        height: 32,
                        pl: 1.5,
                        pr: 1.5,
                        lineHeight: '32px',
                        borderColor: 'primary.light',
                        '& .MuiChip-label': {
                          paddingLeft: 0,
                          paddingRight: 0
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'primary.main',
                          ml: 1,
                          mr: -0.75,
                          '&:hover': {
                            color: 'primary.dark'
                          }
                        }
                      }
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )
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
        <Grid item xs={6} sx={{ paddingBottom: 5, marginRight: 2 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Nome *</InputLabel>
            <TextField
              onChange={(event) => setNomeOrgao(event.target.value)}
              fullWidth
              placeholder="Digite o nome para a Unidade"
              value={nomeOrgao}
              error={!nomeOrgao && formValidation.nomeOrgao === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={1.5} sx={{ paddingBottom: 5, marginRight: 4, marginTop: -1.7 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Sigla *</InputLabel>
              <Tooltip
                title="Sugestão: insira as três primeiras consoantes da unidade."
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#1C5297',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 400,
                      padding: '12px 16px',
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
                <IconButton size="small" sx={{ marginLeft: 1, fontSize: '11px' }}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              onChange={(event) => {
                const value = event.target.value.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, '');
                setSigla(value);
              }}
              fullWidth
              placeholder="Digite a sigla"
              value={sigla}
              error={!sigla && formValidation.sigla === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={4} sx={{ marginTop: -0.5 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} >
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Status</InputLabel>
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
                <IconButton style={{ marginTop: -1, fontSize: '11px' }}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} style={{ marginTop: 3.5 }}>
              <Switch
                checked={status}
                onChange={(event) => setStatus(event.target.checked)}
              />
              <Typography>{status ? "Ativo" : "Inativo"}</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={10} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para a unidade"
              value={descricao}
            />
          </Stack>
        </Grid>
        {accordionData.map((item, index) => (
          <Grid item xs={10} key={item.id} mt={3.5} mb={3.5}>
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
        <Grid item xs={10} mt={5}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: 1,
              position: "relative",
              padding: 2,
              pt: 4, // Padding top adicional para evitar sobreposição do Typography
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                position: "absolute",
                top: "-12px",
                left: "16px",
                background: "#fff",
                padding: "0 8px",
                color: "rgba(28, 82, 151, 1)",
              }}
            >
              Segmento
            </Typography>
            <Typography
              variant="body1"
              color="rgba(77, 77, 77, 1)"
              fontWeight={400}
              fontSize={'12px'}
              gutterBottom
              marginBottom={5}
            >
              Adicione segmentos para definir o(s) local(is) de serviço dessa unidade. Dessa forma, os processos dessa unidade poderão ser gerenciados por localização.
            </Typography>
            <InputLabel sx={{ mb: 1 }}>Nome</InputLabel>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={novoMotivo}
                onChange={(e) => setNovoMotivo(e.target.value)}
                placeholder="Digite o segmento"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdicionarMotivo}
              >
                {editIndex !== null ? "Atualizar" : "Adicionar"}
              </Button>
            </Box>
            {motivos.length === 0 ? (
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 4,
                }}
              >
                <img
                  src={semRegistro}
                  alt="Sem registros"
                  style={{ maxWidth: "300px", height: "auto" }}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(244, 244, 244, 1)",
                      padding: 2,
                      height: "42px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ marginTop: -0.5 }}
                      gutterBottom
                    >
                      Segmento
                    </Typography>
                  </Box>
                  <List>
                    {motivos.map((motivo, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {/* Nome do motivo */}
                        <ListItemText primary={motivo.nome} />

                        {/* Status dinâmico com texto e cor */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mr: 5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              backgroundColor:
                                statusRegistros[index] === "Ativo"
                                  ? "green"
                                  : "red",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {statusRegistros[index]}
                          </Typography>
                        </Box>

                        {/* Botão de ação */}
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClick(event, index)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Popover
                            open={open && currentIndex === index}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <MenuList>
                              <MenuItem
                                onClick={() => handleEditClick(currentIndex)}
                              >
                                <ListItemIcon>
                                  <EditIcon
                                    sx={{
                                      color: "rgba(77, 77, 77, 1)",
                                      fontWeight: 400,
                                      fontSize: "20px",
                                    }}
                                  />
                                </ListItemIcon>
                                Editar
                              </MenuItem>
                              {motivos[currentIndex]?.id !== 0 && (
                                <MenuItem
                                  onClick={() =>
                                    handleToggleStatus(currentIndex)
                                  }
                                >
                                  <ListItemIcon>
                                    {statusRegistros[currentIndex] ===
                                      "Ativo" ? (
                                      <BlockIcon
                                        sx={{
                                          color: "rgba(77, 77, 77, 1)",
                                          fontWeight: 400,
                                          fontSize: "20px",
                                        }}
                                      />
                                    ) : (
                                      <CheckCircleIcon
                                        sx={{
                                          color: "rgba(77, 77, 77, 1)",
                                          fontWeight: 400,
                                          fontSize: "20px",
                                        }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  {statusRegistros[currentIndex] === "Ativo"
                                    ? "Inativar"
                                    : "Ativar"}
                                </MenuItem>
                              )}
                              <MenuItem
                                onClick={() =>
                                  handleOpenDeleteDialog(currentIndex)
                                }
                              >
                                <ListItemIcon>
                                  <DeleteIcon
                                    sx={{
                                      color: "rgba(170, 5, 5, 1)",
                                      fontWeight: 400,
                                      fontSize: "20px",
                                    }}
                                  />
                                </ListItemIcon>
                                <span style={{ color: "rgba(170, 5, 5, 1)" }}>
                                  Excluir
                                </span>
                              </MenuItem>
                            </MenuList>
                          </Popover>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} mt={5}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginRight: '20px' }}>
            <Button variant="outlined" style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.6)' }} onClick={handleOpenModal}>Cancelar</Button>
            <Button variant="contained" color="primary" style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }} onClick={tratarSubmit}>Salvar</Button>
          </Box>
        </Grid>
      </Grid>
      <Dialog
        open={editModalOpen}
        onClose={handleModalClose}
        maxWidth="xs"
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
            background: 'rgba(28, 82, 151, 1)',
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
              <FontAwesomeIcon icon={faPenToSquare} />
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
              Editar Segmento
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              color: 'rgba(255, 255, 255, 1)',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: 'bold', marginTop: "35px", color: '#717171' }}>
            <InputLabel sx={{ mb: 1 }}>Nome do segmento</InputLabel>
          </Typography>
          <Typography component="div" style={{ marginTop: '20px' }}>
            <TextField
              fullWidth
              variant="outlined"
              value={editMotivo}
              onChange={(e) => setEditMotivo(e.target.value)}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelInactivation}
        maxWidth="xs"
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
            background: 'rgba(255, 224, 161, 1)',
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
                color: 'rgba(97, 52, 0, 1)',
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
                color: 'rgba(97, 52, 0, 1)',
                flexGrow: 1,
              }}
            >
              Alerta
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCancelInactivation}
            sx={{
              color: 'rgba(97, 52, 0, 1)',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: 'bold', marginTop: "35px", color: '#717171' }}>
            Inativar segmento
          </Typography>
          <Typography component="div" style={{ marginTop: '20px' }}>
            Se este segmento ficar inativo, não será mais possível cadastrar novos processos nele. Tem certeza de que deseja inativar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelInactivation} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmInactivation}
            color="primary"
            variant="contained"
          >
            Sim, inativar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="xs"
        sx={{
          '& .MuiPaper-root': {
            width: '547px',
            height: '240px',
            maxWidth: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'rgba(170, 5, 5, 1)',
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
                fontSize: '16px',
                marginRight: '2px',
                color: 'rgba(255, 255, 255, 1)',
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '21px',
                color: 'rgba(255, 255, 255, 1)',
                flexGrow: 1,
              }}
            >
              Excluir segmento
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCancelDelete}
            sx={{
              color: 'rgba(255, 255, 255, 1)',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: 'bold', marginTop: '35px', color: '#717171' }}>
            Esta ação é irreversível
          </Typography>
          <Typography component="div" style={{ marginTop: '20px' }}>
            Caso precise deste segmento no futuro, será necessário criar um novo. Tem certeza de que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            variant="contained"
            style={{ background: 'rgba(170, 5, 5, 1)', color: '#fff' }}
          >
            Sim, excluir
          </Button>
        </DialogActions>
      </Dialog>
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
