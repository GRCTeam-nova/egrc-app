import * as React from 'react';
import {
  Autocomplete, Divider, IconButton, Button, Box, Tooltip, TextField, Grid, Switch, Stack, Typography, InputLabel
} from '@mui/material';
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
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [emailParte, setEmailParte] = useState('');
  const [emailParteRepresentante, setEmailParteRepresentante] = useState('');
  const [telefoneParteRepresentante, setTelefoneParteRepresentante] = useState('');
  const [cnpjParte, setCnpjParte] = useState('');
  const [numeroParteRepresentante, setNumeroParteRepresentante] = useState('');
  const [orgaoEmissorParteRepresentante, setOrgaoEmissorParteRepresentante] = useState('');
  const [cepParte, setCepParte] = useState('');
  const [ufs, setUfs] = useState([]);
  const [ufsRepresentante, setUfsRepresentante] = useState([]);
  const [bairroParte, setBairroParte] = useState('');
  const [enderecoParte, setEnderecoParte] = useState('');
  const [numeroEnderecoParte, setNumeroEnderecoParte] = useState('');
  const [complementoEnderecoParte, setComplementoEnderecoParte] = useState('');
  const [observacaoParte, setObservacaoParte] = useState('');
  const [observacaoParteRepresentante, setObservacaoParteRepresentante] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [nomeParteRepresentante, setParteRepresentante] = useState('');
  const [cpfParteRepresentante, setCpfParteRepresentante] = useState('');
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Nova parte');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [adicionarRepresentante, setAdicionarRepresentante] = useState(false);
  const desabilitarCamposRepresentante = !adicionarRepresentante;
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    uf: [],
    ufRepresentante: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (ParteDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${ParteDados.nome}`);
      setMensagemFeedback('editado');
      setRazaoSocial(ParteDados.nome);
      setDescricao(ParteDados.descricao);
      setStatus(ParteDados.ativo || false);
    }
  }, [ParteDados]);

  useEffect(() => {
    const initialData = ParteDados
      ? {
        razaoSocial: ParteDados.nome || '',
        descricao: ParteDados.descricao || '',
        status: ParteDados.ativo ?? false,
      }
      : {
        razaoSocial: '',
        descricao: '',
        status: true,
      };

    const currentData = {
      razaoSocial: razaoSocial ?? (ParteDados?.nome || ''),
      descricao: descricao ?? (ParteDados?.descricao || ''),
      status: status ?? (ParteDados?.ativo || false)
    };

    const hasChanged = initialData.razaoSocial !== currentData.razaoSocial ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status

    setHasChanges(hasChanged);
  }, [razaoSocial, descricao, status, ParteDados]);

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
      setUfsRepresentante(estadosCompletos);
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

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "uf" || field === "ufRepresentante") {
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      setFormData({ ...formData, [field]: value })
    }
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

  const [formValidation, setFormValidation] = useState({
    razaoSocial: true,
  });

  const fieldNamesMap = {
    razaoSocial: 'Nome',
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      razaoSocial: razaoSocial.trim().length > 0,
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
      id: ParteDados ? ParteDados.id : 0,
      nome: razaoSocial,
      descricao: descricao,
      ativo: status,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":_{}|<>0-9-]/g;
      if (caracteresEspeciais.test(razaoSocial)) {
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

        <Grid item xs={4} sx={{ paddingBottom: 5, marginRight: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Razão social *</InputLabel>
            <TextField
              onChange={(event) => setRazaoSocial(event.target.value)}
              fullWidth
              placeholder="Razão social"
              value={razaoSocial}
              error={!razaoSocial && formValidation.razaoSocial === false}
            />
          </Stack>
        </Grid>

        <Grid item xs={2}>
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

        <Grid item xs={5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Nome fantasia</InputLabel>
            <TextField
              onChange={(event) => setNomeFantasia(event.target.value)}
              fullWidth
              placeholder="Nome fantasia"
              value={nomeFantasia}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>CNPJ</InputLabel>
            <TextField
              onChange={(event) => setCnpjParte(event.target.value)}
              fullWidth
              placeholder="00.000.000/0000-00"
              value={cnpjParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Email</InputLabel>
            <TextField
              onChange={(event) => setEmailParte(event.target.value)}
              fullWidth
              placeholder="Email"
              value={emailParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>CEP</InputLabel>
            <TextField
              onChange={(event) => setCepParte(event.target.value)}
              fullWidth
              placeholder="00000-000"
              value={cepParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>UF</InputLabel>
            <Autocomplete
              options={ufs}
              getOptionLabel={(option) => option.nome}
              value={ufs.find((uf) => uf.id === formData.uf) || null}
              onChange={(event, newValue) => {
                tratarMudancaInputGeral("uf", newValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      {option.nome}
                    </Grid>
                  </Grid>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={formData.uf && formData.uf.length > 0 ? "" : "Selecione a UF"}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Município</InputLabel>
            <Autocomplete
              options={ufs}
              getOptionLabel={(option) => option.nome}
              value={ufs.find((uf) => uf.id === formData.uf) || null}
              onChange={(event, newValue) => {
                tratarMudancaInputGeral("uf", newValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      {option.nome}
                    </Grid>
                  </Grid>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={formData.uf && formData.uf.length > 0 ? "" : "Selecione a UF"}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Bairro</InputLabel>
            <TextField
              onChange={(event) => setBairroParte(event.target.value)}
              fullWidth
              placeholder="Digite o bairro"
              value={bairroParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Endereço</InputLabel>
            <TextField
              onChange={(event) => setEnderecoParte(event.target.value)}
              fullWidth
              placeholder="Ex: Rua Almirante Barbosa"
              value={enderecoParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Número</InputLabel>
            <TextField
              onChange={(event) => setNumeroEnderecoParte(event.target.value)}
              fullWidth
              placeholder="0000"
              value={numeroEnderecoParte}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Complemento</InputLabel>
            <TextField
              onChange={(event) => setComplementoEnderecoParte(event.target.value)}
              fullWidth
              placeholder="Complemento"
              value={complementoEnderecoParte}
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

        <Grid item xs={4} mb={2}>
          <Typography variant="h6" sx={{
            color: 'rgba(27, 20, 100, 0.8)',
            marginTop: '20px',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal'
          }} gutterBottom>
            Adicionar representante legal?
          </Typography>
        </Grid>

        <Grid item xs={4} sx={{marginTop: 2.5, marginLeft: -17}}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={adicionarRepresentante}
              onChange={(event) => setAdicionarRepresentante(event.target.checked)}
            />
            <Typography>{adicionarRepresentante ? 'Sim' : 'Não'}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Nome *</InputLabel>
            <TextField
              onChange={(event) => setParteRepresentante(event.target.value)}
              fullWidth
              placeholder="Nome"
              value={nomeParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>CPF</InputLabel>
            <TextField
              onChange={(event) => setCpfParteRepresentante(event.target.value)}
              fullWidth
              placeholder="000.000.000-00"
              value={cpfParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Email</InputLabel>
            <TextField
              onChange={(event) => setEmailParteRepresentante(event.target.value)}
              fullWidth
              placeholder="Email"
              value={emailParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Telefone</InputLabel>
            <TextField
              onChange={(event) => setTelefoneParteRepresentante(event.target.value)}
              fullWidth
              placeholder="(00) 0000-0000"
              value={telefoneParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Número de identificação</InputLabel>
            <TextField
              onChange={(event) => setNumeroParteRepresentante(event.target.value)}
              fullWidth
              placeholder="Número de identificação"
              value={numeroParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Órgão emissor</InputLabel>
            <TextField
              onChange={(event) => setOrgaoEmissorParteRepresentante(event.target.value)}
              fullWidth
              placeholder="Órgão"
              value={orgaoEmissorParteRepresentante}
              disabled={desabilitarCamposRepresentante}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>UF</InputLabel>
            <Autocomplete
              options={ufsRepresentante}
              getOptionLabel={(option) => option.nome}
              value={ufsRepresentante.find((uf) => uf.id === formData.ufRepresentante) || null}
              onChange={(event, newValue) => {
                tratarMudancaInputGeral("ufRepresentante", newValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      {option.nome}
                    </Grid>
                  </Grid>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={formData.ufRepresentante && formData.ufRepresentante.length > 0 ? "" : "Selecione a UF"}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Observação</InputLabel>
            <TextField
              onChange={(event) => setObservacaoParteRepresentante(event.target.value)}
              fullWidth
              placeholder="Digite aqui..."
              value={observacaoParteRepresentante}
              disabled={desabilitarCamposRepresentante}
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
