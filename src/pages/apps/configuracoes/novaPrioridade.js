import * as React from 'react';
import {
  Divider, DialogTitle, InputAdornment, Popover, Dialog, FormControl, MenuItem, Select, IconButton, DialogActions, DialogContent, Button, Box, Tooltip, TextField, Grid, Switch, Stack, Typography, InputLabel
} from '@mui/material';
import { API_QUERY, API_COMMAND } from '../../../config';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { SketchPicker } from 'react-color';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { PrioridadeDados } = location.state || {};
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomePrioridade, setNomePrioridade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrada');
  const [titulo, setTitulo] = useState('Nova prioridade');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [nivelPrioridade, setNivelPrioridade] = useState(1);
  const [color, setColor] = useState({ r: 61, g: 111, b: 176, a: 1 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    }

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  // Em caso de edição
  useEffect(() => {
    if (PrioridadeDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${PrioridadeDados.nome}`);
      setMensagemFeedback('editada');
      setNomePrioridade(PrioridadeDados.nome);
      setNivelPrioridade(PrioridadeDados.nivel);
      setColor(PrioridadeDados.cor);
      setDescricao(PrioridadeDados.descricao);
      setStatus(PrioridadeDados.ativo || false);
      let corInicial;
      if (typeof PrioridadeDados.cor === 'string') {
        corInicial = hexToRgbA(PrioridadeDados.cor);
      } else if (typeof PrioridadeDados.cor === 'object') {
        corInicial = PrioridadeDados.cor;
      } else {
        corInicial = { r: 61, g: 111, b: 176, a: 1 };
      }
      setColor(corInicial);
    }
  }, [PrioridadeDados]);

  useEffect(() => {
    const initialData = PrioridadeDados
      ? {
        nomePrioridade: PrioridadeDados.nome || '',
        descricao: PrioridadeDados.descricao || '',
        status: PrioridadeDados.ativo ?? false,
        unidade: PrioridadeDados.unidade?.map(u => u.unidadeId) || [],
        area: PrioridadeDados.area?.map(u => u.areaId) || []
      }
      : {
        nomePrioridade: '',
        descricao: '',
        status: true,
        unidade: [],
        area: []
      };

    const currentData = {
      nomePrioridade: nomePrioridade ?? (PrioridadeDados?.nome || ''),
      descricao: descricao ?? (PrioridadeDados?.descricao || ''),
      status: status ?? (PrioridadeDados?.ativo || false),
    };

    const hasChanged = initialData.nomePrioridade !== currentData.nomePrioridade ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status

    setHasChanges(hasChanged);
  }, [nomePrioridade, descricao, status, PrioridadeDados]);

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

  const hexToRgbA = (hex) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return {
        r: (c >> 16) & 255,
        g: (c >> 8) & 255,
        b: c & 255,
        a: 1,
      };
    }
    throw new Error('Cor hexadecimal inválida');
  };


  const rgbToHex = (r, g, b) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  const colorHex = rgbToHex(color.r, color.g, color.b);

  const voltarParaCadastroMenu = () => {
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Prioridade' } });
  };

  const [formValidation, setFormValidation] = useState({
    nomePrioridade: true,
  });

  const fieldNamesMap = {
    nomePrioridade: 'Nome da Prioridade',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      nomePrioridade: nomePrioridade.trim().length > 0,
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
       if (requisicao !== 'Editar' || (requisicao === 'Editar' && nomePrioridade !== PrioridadeDados.nome)) {
         const response = await fetch(`${API_QUERY}/api/Prioridade/ExiteNome/${encodeURIComponent(nomePrioridade)}`, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
           },
         });

         if (response.ok) {
           const nomeExiste = await response.json();
           if (nomeExiste) {
             enqueueSnackbar('Essa prioridade já foi cadastrada com esse nome.', {
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
      id: PrioridadeDados ? PrioridadeDados.id : 0,
      nivel: nivelPrioridade,
      cor: colorHex,
      nome: nomePrioridade,
      descricao: descricao,
      ativo: status,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9\-]/g;
      if (caracteresEspeciais.test(nomePrioridade)) {
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
      const response = await fetch(`${API_COMMAND}/api/Prioridade/${requisicao}`, {
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
            enqueueSnackbar('Não foi possível salvar essa prioridade.', {
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
        enqueueSnackbar(`Prioridade ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Prioridade' } });
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

        <Grid item xs={6} sx={{ paddingBottom: 5, marginRight: 2 }}>
          <Stack spacing={1}>
            <InputLabel>Nome *</InputLabel>
            <TextField
              onChange={(event) => setNomePrioridade(event.target.value)}
              fullWidth
              placeholder="Digite o nome da prioridade"
              value={nomePrioridade}
              error={!nomePrioridade && formValidation.nomePrioridade === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={2} sx={{ paddingBottom: 5, marginRight: 2 }}>
          <Stack spacing={1}>
            <InputLabel>Nível de Prioridade</InputLabel>
            <Box display="flex" alignItems="center">
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  sx={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  value={nivelPrioridade}
                  onChange={(event) => setNivelPrioridade(event.target.value)}
                >
                  {[...Array(5).keys()].map((num) => (
                    <MenuItem key={num + 1} value={num + 1}>
                      {num + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                onClick={(event) => {
                  setAnchorEl(anchorEl ? null : event.currentTarget);
                }}
                sx={{
                  width: 55,
                }}
                value=""
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start" style={{ pointerEvents: 'none' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 15,
                            height: 15,
                            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                            border: '1px solid #ccc',
                          }}
                        />
                        <ArrowDropDownIcon style={{ fontSize: 20, marginLeft: 2 }} />
                      </div>
                    </InputAdornment>
                  ),
                  sx: {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                }}
              />

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <SketchPicker
                  color={color}
                  onChange={(newColor) => setColor(newColor.rgb)}
                  disableAlpha
                />
              </Popover>

            </Box>
          </Stack>
        </Grid>

        <Grid item xs={2}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InputLabel>Status</InputLabel>
              <Tooltip title="Caso inative o item, ele não estará disponível dentro do cadastro de um novo processo" placement="top" arrow>
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
              placeholder="Adicione uma descrição para essa prioridade"
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
        <AndamentoHistoricoDrawer row={PrioridadeDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
