import * as React from 'react';
import {
  Autocomplete, Divider, IconButton, Button, Box, Tooltip, TextField, Grid, Switch, Stack, Typography, InputLabel
} from '@mui/material';
import InputMask from 'react-input-mask';
import { API_COMMAND, API_QUERY } from '../../../config';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';
import ConfirmDialog from './ConfirmDialog';

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ParteDados } = location.state || {};
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeAdvogado, setNomeSocial] = useState('');
  const [numeroOab, setNumeroOab] = useState('');
  const [emailParte, setEmailParte] = useState('');
  const [cpfAdvogado, setCpfParte] = useState('');
  const [ufs, setUfs] = useState([]);
  const [observacaoParte, setObservacaoParte] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('CriarAdvogado');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Nova parte');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [ufId, setUfId] = useState(null);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  // Em caso de edição
  useEffect(() => {
    if (ParteDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${ParteDados.nome}`);
      setMensagemFeedback('editado');
      setNomeSocial(ParteDados.nome);
      setDescricao(ParteDados.descricao);
      setStatus(ParteDados.ativo || false);
    }
  }, [ParteDados]);

  useEffect(() => {
    const initialData = ParteDados
      ? {
        nomeAdvogado: ParteDados.nome || '',
        descricao: ParteDados.descricao || '',
        status: ParteDados.ativo ?? false,
      }
      : {
        nomeAdvogado: '',
        descricao: '',
        status: true,
      };

    const currentData = {
      nomeAdvogado: nomeAdvogado ?? (ParteDados?.nome || ''),
      descricao: descricao ?? (ParteDados?.descricao || ''),
      status: status ?? (ParteDados?.ativo || false)
    };

    const hasChanged = initialData.nomeAdvogado !== currentData.nomeAdvogado ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status

    setHasChanges(hasChanged);
  }, [nomeAdvogado, descricao, status, ParteDados]);

  useEffect(() => {
    fetchData(`${API_QUERY}/api/Uf`, (data) => {
      const estadosCompletos = data.map(uf => {
        let nomeCompleto;
        switch (uf.nome) {
          case 'AC': nomeCompleto = 'Acre (AC)'; break;
          case 'AL': nomeCompleto = 'Alagoas (AL)'; break;
          case 'AM': nomeCompleto = 'Amazonas (AM)'; break;
          case 'AP': nomeCompleto = 'Amapá (AP)'; break;
          case 'BA': nomeCompleto = 'Bahia (BA)'; break;
          case 'CE': nomeCompleto = 'Ceará (CE)'; break;
          case 'DF': nomeCompleto = 'Distrito Federal (DF)'; break;
          case 'ES': nomeCompleto = 'Espírito Santo (ES)'; break;
          case 'GO': nomeCompleto = 'Goiás (GO)'; break;
          case 'MA': nomeCompleto = 'Maranhão (MA)'; break;
          case 'MG': nomeCompleto = 'Minas Gerais (MG)'; break;
          case 'MS': nomeCompleto = 'Mato Grosso do Sul (MS)'; break;
          case 'MT': nomeCompleto = 'Mato Grosso (MT)'; break;
          case 'PA': nomeCompleto = 'Pará (PA)'; break;
          case 'PB': nomeCompleto = 'Paraíba (PB)'; break;
          case 'PE': nomeCompleto = 'Pernambuco (PE)'; break;
          case 'PI': nomeCompleto = 'Piauí (PI)'; break;
          case 'PR': nomeCompleto = 'Paraná (PR)'; break;
          case 'RJ': nomeCompleto = 'Rio de Janeiro (RJ)'; break;
          case 'RN': nomeCompleto = 'Rio Grande do Norte (RN)'; break;
          case 'RO': nomeCompleto = 'Rondônia (RO)'; break;
          case 'RR': nomeCompleto = 'Roraima (RR)'; break;
          case 'RS': nomeCompleto = 'Rio Grande do Sul (RS)'; break;
          case 'SC': nomeCompleto = 'Santa Catarina (SC)'; break;
          case 'SE': nomeCompleto = 'Sergipe (SE)'; break;
          case 'SP': nomeCompleto = 'São Paulo (SP)'; break;
          case 'TO': nomeCompleto = 'Tocantins (TO)'; break;
          default: nomeCompleto = uf.nome;
        }
        return { ...uf, nome: nomeCompleto };
      });

      setUfs(estadosCompletos);
    });
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

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Partes' } });
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || regex.test(email);
  };

  const handleEmailBlur = () => {
    if (!validarEmail(emailParte)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const [formValidation, setFormValidation] = useState({
    nomeAdvogado: true,
  });

  const fieldNamesMap = {
    nomeAdvogado: 'Nome',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      nomeAdvogado: nomeAdvogado.trim().length > 0,
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

    if (!validarEmail(emailParte)) {
      enqueueSnackbar('Email inválido. Por favor, insira um email válido.', {
        variant: 'error',
      });
      return;
    }

    setLoading(true)

    const payload = {
      nome: nomeAdvogado,
      observacoes: observacaoParte,
      email: emailParte,
      cpf: cpfAdvogado.replace(/\D/g, ''),
      numOAB: numeroOab,
      ufId: ufId,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":_{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeAdvogado)) {
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
      const response = await fetch(`${API_COMMAND}/api/Parte/${requisicao}`, {
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
            if (errorData.message === "Já existe um Advogado com esse nome.") {
              enqueueSnackbar('Esse advogado já foi cadastrado com esse nome.', {
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
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Partes' } });
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

        <Grid item xs={4} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Nome *</InputLabel>
            <TextField
              onChange={(event) => setNomeSocial(event.target.value)}
              fullWidth
              placeholder="Nome"
              value={nomeAdvogado}
              error={!nomeAdvogado && formValidation.nomeAdvogado === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={1} sx={{ marginLeft: 5, marginRight: 7 }}>
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

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Número de inscrição na OAB</InputLabel>
            <TextField
              onChange={(event) => {
                setNumeroOab(event.target.value);
              }}
              fullWidth
              placeholder="Inscrição OAB"
              value={numeroOab}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>UF</InputLabel>
            <Autocomplete
              options={ufs}
              getOptionLabel={(option) => option.nome}
              value={ufs.find((uf) => uf.id === ufId) || null} 
              onChange={(event, newValue) => {
                setUfId(newValue ? newValue.id : null);
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Selecione a UF" />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>CPF</InputLabel>
            <InputMask
              mask="999.999.999-99"
              value={cpfAdvogado}
              onChange={(event) => setCpfParte(event.target.value)}
            >
              {(inputProps) => <TextField {...inputProps} fullWidth placeholder="000.000.000-00" />}
            </InputMask>
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Email</InputLabel>
            <TextField
              onChange={(event) => setEmailParte(event.target.value)}
              onBlur={handleEmailBlur} 
              fullWidth
              placeholder="Email"
              value={emailParte}
              error={emailError}
              helperText={emailError ? 'Email inválido' : ''}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Observação</InputLabel>
            <TextField
              onChange={(event) => setObservacaoParte(event.target.value)}
              fullWidth
              placeholder="Digite aqui..."
              value={observacaoParte}
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
        <AndamentoHistoricoDrawer row={ParteDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
