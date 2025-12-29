import * as React from 'react';
import {
  Divider, DialogTitle, Dialog, IconButton, DialogActions, DialogContent, Button, Box, Tooltip, TextField, Autocomplete, Grid, Switch, Stack, Typography, Checkbox, InputLabel
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
  const { TribunalDados } = location.state || {};
  const [ufs, setUfs] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeTribunal, setNomeTribunal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Novos Tribunais');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    uf: [],
    orgao: [],
  });

  // Em caso de edição
  useEffect(() => {
    if (TribunalDados) {
      setRequisicao('Editar');
      setTitulo(`Editar ${TribunalDados.nome}`);
      setMensagemFeedback('editado');
      setFormData(prev => ({
        ...prev,
        uf: TribunalDados.tribunalUF?.map(u => u.ufId) || []
      }));
      setFormData(prev => ({
        ...prev,
        orgao: TribunalDados.orgaoTribunal?.map(u => u.orgaoId) || []
      }));
      setNomeTribunal(TribunalDados.nome);
      setDescricao(TribunalDados.descricao);
      setStatus(TribunalDados.ativo || false);

    }
  }, [TribunalDados]);

  useEffect(() => {
    const initialData = TribunalDados
      ? {
        nomeTribunal: TribunalDados.nome || '',
        descricao: TribunalDados.descricao || '',
        status: TribunalDados.ativo ?? false,
        uf: TribunalDados.uf?.map(u => u.ufId) || [],
        orgao: TribunalDados.orgao?.map(u => u.orgaoId) || []
      }
      : {
        nomeTribunal: '',
        descricao: '',
        status: true,
        uf: [],
        orgao: []
      };

    const currentData = {
      nomeTribunal: nomeTribunal ?? (TribunalDados?.nome || ''),
      descricao: descricao ?? (TribunalDados?.descricao || ''),
      status: status ?? (TribunalDados?.ativo || false),
      uf: formData.uf.length || formData.uf.length === 0
        ? formData.uf
        : TribunalDados?.uf?.map(u => u.unidadeId) || [],
      orgao: formData.orgao.length || formData.orgao.length === 0
        ? formData.orgao
        : TribunalDados?.orgao?.map(u => u.areaId) || []
    };

    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    };

    const hasChanged = initialData.nomeTribunal !== currentData.nomeTribunal ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status ||
      !arraysAreEqual(initialData.uf, currentData.uf, initialData.orgao, currentData.orgao);

    setHasChanges(hasChanged);
  }, [nomeTribunal, descricao, status, formData.uf, ufs, orgaos, formData.orgao, TribunalDados]);


  // Preencher Autocompletes com opções vindas da API
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
          default: nomeCompleto = uf.nome; // Caso algum estado esteja fora da lista, mantém o nome original
        }
        return { ...uf, nome: nomeCompleto };
      });
  
      setUfs(estadosCompletos);
    });
  
    fetchData(`${API_QUERY}/api/Orgao/ListarCombo`, setOrgaos);
    window.scrollTo(0, 0);
  }, []);
  

  const tratarMudancaInputGeral = (field, value) => {
    setFormData({ ...formData, [field]: value })
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
      if (formData.uf.length === ufs.length) {
        // Deselect all
        setFormData({ ...formData, uf: [] });
      } else {
        // Select all
        setFormData({ ...formData, uf: ufs.map(uf => uf.id) });
      }
    } else {
      tratarMudancaInputGeral('uf', newValue.map(item => item.id));
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.orgao.length === orgaos.length) {
        // Deselect all
        setFormData({ ...formData, orgao: [] });
      } else {
        // Select all
        setFormData({ ...formData, orgao: orgaos.map(orgao => orgao.id) });
      }
    } else {
      tratarMudancaInputGeral('orgao', newValue.map(item => item.id));
    }
  };

  const voltarParaCadastroMenu = () => {
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tribunal' } });
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
    nomeTribunal: true,
    uf: true,
    orgao: true,
  });

  const fieldNamesMap = {
    nomeTribunal: 'Nome de Órgão',
    uf: "UF",
    orgao: "Órgão",
  };

  const allSelected = formData.uf.length === ufs.length && ufs.length > 0;
  const allSelected2 = formData.orgao.length === orgaos.length && orgaos.length > 0;

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      uf: formData.uf.length > 0 && !formData.uf.every(val => val === 0),
      orgao: formData.orgao.length > 0 && !formData.orgao.every(val => val === 0),
      nomeTribunal: nomeTribunal.trim().length > 0,
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
      if (requisicao !== 'Editar' || (requisicao === 'Editar' && nomeTribunal !== TribunalDados.nome)) {
        const response = await fetch(`${API_QUERY}/api/Tribunal/ExiteNome/${encodeURIComponent(nomeTribunal)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const nomeExiste = await response.json();
          if (nomeExiste) {
            enqueueSnackbar('Esse tribunal já foi cadastrado com esse nome.', {
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
      id: TribunalDados ? TribunalDados.id : 0,
      tribunalUF: formData.uf.map((uf) => {
        return { id: 0, ufId: uf, };
      }),
      orgaoTribunal: formData.orgao.map((orgao) => {
        return { id: 0, orgaoId: orgao, };
      }),
      nome: nomeTribunal,
      descricao: descricao,
      ativo: status,
    };

    // Realiza a requisição POST
    try {
      const caracteresEspeciais = /[!@#$%&*()_,.?":{}|<>0-9-]/g;
      if (caracteresEspeciais.test(nomeTribunal)) {
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
      const response = await fetch(`${API_COMMAND}/api/Tribunal/${requisicao}`, {
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
            enqueueSnackbar('Não foi possível salvar esse tribunal.', {
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
        enqueueSnackbar(`Tribunal ${mensagemFeedback} com sucesso.`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Tribunal' } });
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
              onChange={(event) => setNomeTribunal(event.target.value)}
              fullWidth
              placeholder="Digite o nome do tribunal"
              value={nomeTribunal}
              error={!nomeTribunal && formValidation.nomeTribunal === false}
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

        {/* uf */}
        <Grid item xs={8.5} mb={5}>
          <Stack spacing={1}>
            <InputLabel>Unidade Federativa *</InputLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[{ id: 'all', nome: 'Selecionar todas' }, ...ufs]}
              getOptionLabel={(option) => option.nome}
              value={formData.uf.map(id => ufs.find(uf => uf.id === id) || id)}
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
                  placeholder={formData.uf.length > 0 ? "" : "Escreva ou selecione uma ou mais unidades federativas"}
                  error={(formData.uf.length === 0 || formData.uf.every(val => val === 0)) && formValidation.uf === false}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={8.5} mb={5}>
          <Stack spacing={1}>
            <InputLabel>Órgão *</InputLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[{ id: 'all', nome: 'Selecionar todas' }, ...orgaos]}
              getOptionLabel={(option) => option.nome}
              value={formData.orgao.map(id => orgaos.find(orgao => orgao.id === id) || id)}
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
                  placeholder={formData.orgao.length > 0 ? "" : "Escreva ou selecione um ou mais órgãos"}
                  error={(formData.orgao.length === 0 || formData.orgao.every(val => val === 0)) && formValidation.orgao === false}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={8.5} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              onChange={(event) => setDescricao(event.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Adicione uma descrição para esse tribunal"
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
        <AndamentoHistoricoDrawer row={TribunalDados} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
