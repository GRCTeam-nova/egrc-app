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
import ConfirmDialog from './ConfirmDialog';

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { TipoAudienciaDados } = location.state || {};
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeTipoAudiencia, setNomeTipoAudiencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Novo tipo de audiência');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    unidade: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (TipoAudienciaDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${TipoAudienciaDados.nome}`);
      setMensagemFeedback('editado');
      setNomeTipoAudiencia(TipoAudienciaDados.nome);
      setDescricao(TipoAudienciaDados.descricao);
      setStatus(TipoAudienciaDados.ativo || false);

    }
  }, [TipoAudienciaDados]);

  useEffect(() => {
    const initialData = TipoAudienciaDados
      ? {
        nomeTipoAudiencia: TipoAudienciaDados.nome || '',
        descricao: TipoAudienciaDados.descricao || '',
        status: TipoAudienciaDados.ativo ?? false,
      }
      : {
        nomeTipoAudiencia: '',
        descricao: '',
        status: true,
      };
  
    const currentData = {
      nomeTipoAudiencia: nomeTipoAudiencia ?? (TipoAudienciaDados?.nome || ''),  
      descricao: descricao ?? (TipoAudienciaDados?.descricao || ''),
      status: status ?? (TipoAudienciaDados?.ativo || false)
    };
  
    const hasChanged = initialData.nomeTipoAudiencia !== currentData.nomeTipoAudiencia ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status
  
    setHasChanges(hasChanged);
  }, [nomeTipoAudiencia, descricao, status, TipoAudienciaDados]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  
  const handleConfirmExit = () => {
    voltarParaCadastroMenu();
  };

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tipos de Audiência' } });
  };

  const [formValidation, setFormValidation] = useState({
    nomeTipoAudiencia: true,
  });

  const fieldNamesMap = {
    nomeTipoAudiencia: 'Nome de tipo de audiência',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      nomeTipoAudiencia: nomeTipoAudiencia.trim().length > 0,
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
      id: TipoAudienciaDados ? TipoAudienciaDados.id : 0,
      nome: nomeTipoAudiencia,
      descricao: descricao,
      ativo: status,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":_{}|<>0-9\-]/g;
      if (caracteresEspeciais.test(nomeTipoAudiencia)) {
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
      const response = await fetch(`${API_COMMAND}/api/TipoAudiencia/${requisicao}`, {
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
            const errorData = JSON.parse(errorBody);
            if (errorData.message === "Já existe um Tipo Audiência com esse nome.") {
              enqueueSnackbar('Esse tipo de audiência já foi cadastrado com esse nome.', {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                }
              });
            } else {
              enqueueSnackbar('Não foi possível salvar esse tipo de audiência.', {
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
        enqueueSnackbar(`Tipo de audiência ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tipos de Audiência' } });
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
              onChange={(event) => setNomeTipoAudiencia(event.target.value)}
              fullWidth
              placeholder="Nome do tipo de audiência"
              value={nomeTipoAudiencia}
              error={!nomeTipoAudiencia && formValidation.nomeTipoAudiencia === false}
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

        {/* Campo de Descrição */}
        <Grid item xs={8.5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para esse tipo de audiência"
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
      <ConfirmDialog
        open={showChangesNotSavedModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmExit}
      />
      {requisicao === 'Editar' && (
        <AndamentoHistoricoDrawer row={TipoAudienciaDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
