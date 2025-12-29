import * as React from 'react';
import {
  DialogTitle, Dialog, Switch, Slider, RadioGroup, Radio, FormControlLabel, Chip, IconButton, DialogActions, DialogContent, Button, Box, TextField, Autocomplete, Grid, Stack, Typography, Checkbox, InputLabel
} from '@mui/material';
import { API_QUERY } from '../../../config';
import { useNavigate } from 'react-router';
import { faPlus, faMinus, faTrash, faCircleInfo, faList, faBuildingUser, faUserTie } from '@fortawesome/free-solid-svg-icons';
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
  const [open3, setOpen3] = useState(false);
  const [open5, setOpen5] = useState(false);
  const [open6, setOpen6] = useState(false);
  const [responsaveis, setResponsaveis] = useState([{ id: Date.now(), percent: 100 }]);

  const [auxiliares, setAuxiliares] = useState([{ id: Date.now(), percent: 0 }]);

  const [distributionMode, setDistributionMode] = useState('equal'); // "equal" ou "manual"

  // Atualiza a porcentagem de cada responsável
  const handleUpdatePercent = (id, newPercent) => {
    setResponsaveis((prev) =>
      prev.map((resp) =>
        resp.id === id
          ? { ...resp, percent: Math.max(0, Math.min(newPercent, 100)) }
          : resp
      )
    );
  };


  // Alterna o modo de distribuição
  const handleDistributionModeChange = (event) => {
    const mode = event.target.value;
    setDistributionMode(mode);

    if (mode === 'equal') {
      const updatedResponsaveis = distributeEqual(responsaveis);
      setResponsaveis(updatedResponsaveis);
    }
  };

  const handleAddAuxiliar = () => {
    setAuxiliares((prev) => [...prev, { id: Date.now(), percent: 0 }]);
  };


  const handleRemoveResponsavel = (id) => {
    setResponsaveis((prev) => prev.filter((responsavel) => responsavel.id !== id));
  };

  const handleRemoveAuxiliar = (id) => {
    setAuxiliares((prev) => prev.filter((auxiliar) => auxiliar.id !== id));
  };


  // Adiciona novo responsável
  const handleAddResponsavel = () => {
    setResponsaveis((prev) => {
      const updated = [
        ...prev,
        { id: Date.now(), percent: distributionMode === 'equal' ? 0 : 0 },
      ];

      if (distributionMode === 'equal') {
        return distributeEqual(updated);
      }
      return updated;
    });
  };

  // Distribui a porcentagem igualmente entre os responsáveis
  const distributeEqual = (updatedResponsaveis) => {
    const totalResponsaveis = updatedResponsaveis.length;
    const equalPercent = 100 / totalResponsaveis;
    return updatedResponsaveis.map((resp) => ({
      ...resp,
      percent: parseFloat(equalPercent.toFixed(2)),
    }));
  };

  // Garante que o único responsável inicial mantenha 100% ao carregar
  useEffect(() => {
    if (responsaveis.length === 1 && distributionMode === 'equal') {
      setResponsaveis([{ ...responsaveis[0], percent: 100 }]);
    }
  }, [responsaveis, distributionMode]);

  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [unidades, setUnidades] = useState([]);
  const [responsaveisOptions, setResponsaveisOptions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [acoes, setAcoes] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [ufs, setUfs] = useState([]);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = useState(false);
  const [nomeOrgao, setNomeOrgao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [titulo, setTitulo] = useState('Nova rotina');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    unidade: [],
    area: [],
    acao: [],
    assunto: [],
    orgao: [],
    prioridade: [],
    uf: []
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setRequisicao('Editar');
      setTitulo(`Editar ${dadosApi.nome}`);
      setMensagemFeedback('editada');
      setFormData(prev => ({
        ...prev,
        unidade: dadosApi.unidade?.map(u => u.unidadeId) || []
      }));
      setFormData(prev => ({
        ...prev,
        area: dadosApi.areaOrgao?.map(u => u.areaId) || []
      }));
      setNomeOrgao(dadosApi.nome);
      setDescricao(dadosApi.descricao);
      setStatus(dadosApi.ativo || false);

    }
  }, [dadosApi]);

  useEffect(() => {
    const initialData = dadosApi
      ? {
        nomeOrgao: dadosApi.nome || '',
        descricao: dadosApi.descricao || '',
        status: dadosApi.ativo ?? false,
        unidade: dadosApi.unidade?.map(u => u.unidadeId) || [],
        area: dadosApi.area?.map(u => u.areaId) || []
      }
      : {
        nomeOrgao: '',
        descricao: '',
        status: true,
        unidade: [],
        area: []
      };

    const currentData = {
      nomeOrgao: nomeOrgao ?? (dadosApi?.nome || ''),
      descricao: descricao ?? (dadosApi?.descricao || ''),
      status: status ?? (dadosApi?.ativo || false),
      unidade: formData.unidade.length || formData.unidade.length === 0
        ? formData.unidade
        : dadosApi?.unidade?.map(u => u.unidadeId) || [],
      area: formData.area.length || formData.area.length === 0
        ? formData.area
        : dadosApi?.area?.map(u => u.areaId) || []
    };

    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => value === arr2[index]);
    };

    const hasChanged = initialData.nomeOrgao !== currentData.nomeOrgao ||
      initialData.descricao !== currentData.descricao ||
      initialData.status !== currentData.status ||
      !arraysAreEqual(initialData.unidade, currentData.unidade, initialData.area, currentData.area);

    setHasChanges(hasChanged);
  }, [nomeOrgao, descricao, status, formData.unidade, unidades, areas, formData.area, dadosApi]);


  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Unidade/ListarComboGuid`, setUnidades);
    fetchData(`${API_QUERY}/api/Area/ListarCombo?ativo=true`, setAreas);
    fetchData(`${API_QUERY}/api/Acao/ListarCombo?ativo=true`, setAcoes);
    fetchData(`${API_QUERY}/api/Assunto/ListarCombo?ativo=true`, setAssuntos);
    fetchData(`${API_QUERY}/api/Orgao/ListarCombo?ativo=true`, setOrgaos);
    fetchData(`${API_QUERY}/api/Prioridade/ListarCombo?ativo=true`, setPrioridades);
    fetchData(`${API_QUERY}/api/Uf`, setUfs);
    fetchData(`${API_QUERY}/api/Usuario`, setResponsaveisOptions);
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


  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSelectUnit = (event, newValue) => {
    if (newValue) {
      tratarMudancaInputGeral('unidade', [newValue.id]);
    } else {
      tratarMudancaInputGeral('unidade', []);
    }
  };

  const handleSelectUnit2 = (event, newValue) => {
    if (newValue) {
      tratarMudancaInputGeral('area', [newValue.id]);
    } else {
      tratarMudancaInputGeral('area', []);
    }
  };

  const handleSelectUnit3 = (event, newValue) => {
    if (newValue) {
      tratarMudancaInputGeral('assunto', [newValue.id]);
    } else {
      tratarMudancaInputGeral('assunto', []);
    }
  };

  const handleSelectUnit4 = (event, newValue) => {
    if (newValue) {
      tratarMudancaInputGeral('uf', [newValue.id]);
    } else {
      tratarMudancaInputGeral('uf', []);
    }
  };

  const handleSelectAll3 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.acao.length === acoes.length) {
        // Deselect all
        setFormData({ ...formData, acao: [] });
      } else {
        // Select all
        setFormData({ ...formData, acao: acoes.map(acao => acao.id) });
      }
    } else {
      tratarMudancaInputGeral('acao', newValue.map(item => item.id));
    }
  };

  const handleSelectAll5 = (event, newValue) => {
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

  const handleSelectAll6 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.prioridade.length === prioridades.length) {
        // Deselect all
        setFormData({ ...formData, prioridade: [] });
      } else {
        // Select all
        setFormData({ ...formData, prioridade: prioridades.map(prioridade => prioridade.id) });
      }
    } else {
      tratarMudancaInputGeral('prioridade', newValue.map(item => item.id));
    }
  };


  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
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
    nomeOrgao: true,
  });


  const allSelected3 = formData.acao.length === acoes.length && acoes.length > 0;
  const allSelected5 = formData.orgao.length === orgaos.length && orgaos.length > 0;
  const allSelected6 = formData.prioridade.length === prioridades.length && prioridades.length > 0;



  const [expandedChips, setExpandedChips] = useState({});

  const handleExpandChip = (chipName) => {
    setExpandedChips((prev) => ({
      ...prev,
      [chipName]: !prev[chipName],
    }));
  };

  const [faixaValor, setFaixaValor] = useState([0, 1000000]);
  const [textFieldValue, setTextFieldValue] = useState(['R$ 0,00', 'R$ 1.000.000,00']);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const parseCurrency = (value) => {
    // Remove a formatação (R$, pontos, vírgulas) e converte para número
    return parseFloat(value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
  };

  const handleFaixaValorChange = (event, newValue) => {
    setFaixaValor(newValue);
    setTextFieldValue([formatCurrency(newValue[0]), formatCurrency(newValue[1])]);
  };

  const handleTextFieldChange = (index, value) => {
    const parsedValue = parseCurrency(value); // Converte o valor formatado em número
    const newTextFieldValue = [...textFieldValue];
    const newFaixaValor = [...faixaValor];

    newTextFieldValue[index] = value; // Atualiza o valor visível no TextField
    setTextFieldValue(newTextFieldValue);

    // Atualiza o estado do slider apenas se o valor for válido
    if (!isNaN(parsedValue)) {
      newFaixaValor[index] = parsedValue;
      if (newFaixaValor[0] > newFaixaValor[1]) {
        newFaixaValor[index === 0 ? 1 : 0] = parsedValue;
      }
      setFaixaValor(newFaixaValor);
    }
  };

  const handleTextFieldBlur = (index) => {
    const newTextFieldValue = [...textFieldValue];
    const newFaixaValor = [...faixaValor];

    // Reaplica a formatação ao sair do campo
    newTextFieldValue[index] = formatCurrency(faixaValor[index]);
    newFaixaValor[index] = faixaValor[index]; // Garante a sincronização

    setTextFieldValue(newTextFieldValue);
    setFaixaValor(newFaixaValor);
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

      <Grid container spacing={2}>
        {/* Título da nova grid */}
        <Grid item xs={12}>
          <Box sx={{ boxShadow: '0px 4px 15px 0px rgba(51, 105, 142, 0.1)', padding: '16px', backgroundColor: '#f9f9f9' }}>
            {/* Conteúdo da Box de Responsáveis */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(77, 77, 77, 1)', fontSize: '16px' }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{color:'rgba(171, 190, 209, 1)',fontSize: '16px', marginRight: 10}} />
                Informações da rotina
              </Typography>
              <Chip
                label="Obrigatório"
                sx={{
                  backgroundColor: 'rgba(245, 247, 250, 1)',
                  border: '1px solid rgba(171, 190, 209, 1)',
                  color: 'rgba(77, 77, 77, 1)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
            </Box>

            {/* Nome e Status lado a lado */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Nome da rotina</InputLabel>
                  <TextField
                    onChange={(event) => setNomeOrgao(event.target.value)}
                    fullWidth
                    placeholder="Digite o nome"
                    value={nomeOrgao}
                    error={!nomeOrgao && formValidation.nomeOrgao === false}
                  />
                </Stack>
              </Grid>

              {/* Unidade */}
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Unidade</InputLabel>
                  <Autocomplete
                    options={unidades}
                    getOptionLabel={(option) => option.nome}
                    value={unidades.find((unidade) => unidade.id === formData.unidade[0]) || null}
                    onChange={handleSelectUnit}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={formData.unidade.length > 0 ? "" : "Selecione uma unidade"}
                        error={(formData.unidade.length === 0 || formData.unidade.every(val => val === 0)) && formValidation.unidade === false}
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>


      </Grid>
      <Grid container spacing={2} sx={{ marginTop: 4 }}>
        {/* Título da nova grid */}
        <Grid item xs={12}>
          <Box sx={{ boxShadow: '0px 4px 15px 0px rgba(51, 105, 142, 0.1)', padding: '16px', backgroundColor: '#f9f9f9' }}>
            {/* Conteúdo da Box de Responsáveis */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(77, 77, 77, 1)', fontSize: '16px' }}>
              <FontAwesomeIcon icon={faList} style={{color:'rgba(171, 190, 209, 1)',fontSize: '16px', marginRight: 10}} />
                Critérios
              </Typography>
              <Chip
                label="Obrigatório"
                sx={{
                  backgroundColor: 'rgba(245, 247, 250, 1)',
                  border: '1px solid rgba(171, 190, 209, 1)',
                  color: 'rgba(77, 77, 77, 1)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
            </Box>

            {/* Texto explicativo */}
            <Typography variant="body2" sx={{ marginBottom: 2, color: '#717171' }}>
              Adicione pelo menos 1 dos critérios da lista abaixo.
            </Typography>


            {/* Chips posicionadas verticalmente */}
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                {[
                  'Ação',
                  'Área Judicial',
                  'Assunto',
                  'Faixa de Valor da Causa',
                  'Órgão',
                  'Parte',
                  'Prioridade',
                  'UF ou Região',
                ].map((criterio) => (
                  <div
                    key={criterio}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: '16px',
                    }}
                  >
                    {/* Div Retangular Compacta/Expandida */}
                    <div
                      style={{
                        backgroundColor: 'rgba(238, 245, 252, 1)',
                        padding: '16px',
                        borderRadius: expandedChips[criterio] ? '8px 0 0 8px' : '8px 8px 8px 8px',
                        cursor: 'pointer',
                        width: '240px',
                        border: expandedChips[criterio]
                          ? '1px solid rgba(171, 190, 209, 1)'
                          : '1px solid rgba(171, 190, 209, 1)',
                        borderRight: expandedChips[criterio] ? 'none' : '1px solid rgba(171, 190, 209, 1)',
                        minHeight: expandedChips[criterio] ? 'auto' : '100%',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => handleExpandChip(criterio)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        {/* Título */}
                        <span style={{ fontWeight: '600', color: '#1C5297' }}>{criterio}</span>

                        {/* Chip com ícone */}
                        <Chip
                          label={
                            expandedChips[criterio] ? (
                              <FontAwesomeIcon icon={faMinus} />
                            ) : (
                              <FontAwesomeIcon icon={faPlus} />
                            )
                          }
                          sx={{
                            backgroundColor: '#1C5297',
                            color: '#fff',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#174c87',
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Div para Conteúdo Expandido */}
                    {expandedChips[criterio] && (
                      <div
                        style={{
                          marginLeft: -16,
                          width: '400px',
                          border: expandedChips[criterio]
                            ? '1px solid rgba(171, 190, 209, 1)'
                            : '1px solid rgba(171, 190, 209, 1)',
                          borderLeft: expandedChips[criterio] ? 'none' : '1px solid rgba(171, 190, 209, 1)',
                          padding: '16px',
                          backgroundColor: 'rgba(238, 245, 252, 1)',
                          borderRadius: '0 8px 8px 0',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#1C5297',
                            marginBottom: 2,
                          }}
                        >
                          {criterio === 'Ação' && 'Ação'}
                          {criterio === 'Faixa de Valor da Causa' && 'Selecione a Faixa de Valor (R$):'}
                          {criterio !== 'Ação' && criterio !== 'Faixa de Valor da Causa' && `${criterio}:`}
                        </Typography>
                        {criterio === 'Ação' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            multiple
                            disableCloseOnSelect
                            options={[{ id: "all", nome: "Selecionar todas" }, ...acoes]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.acao.map((id) => acoes.find((acao) => acao.id === id) || id)}
                            onChange={handleSelectAll3}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            limitTags={2}
                            open={open3}
                            onOpen={() => setOpen3(true)}
                            onClose={() => setOpen3(false)}
                            renderOption={(props, option, { selected }) => (
                              <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox checked={option.id === "all" ? allSelected3 : selected} />
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
                                placeholder={formData.acao.length > 0 ? "" : "Selecione o tipo de ação"}
                                error={(formData.acao.length === 0 || formData.acao.every((val) => val === 0)) && formValidation.area === false}
                                onClick={() => setOpen3(true)} // Abre o menu ao clicar
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
                        )}
                        {criterio === 'Área Judicial' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            options={areas}
                            getOptionLabel={(option) => option.nome}
                            value={areas.find((area) => area.id === formData.area[0]) || null}
                            onChange={handleSelectUnit2}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option) => (
                              <li {...props}>
                                {option.nome}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={formData.area.length > 0 ? "" : "Selecione uma área"}
                                error={(formData.area.length === 0 || formData.area.every(val => val === 0)) && formValidation.area === false}
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
                        )}
                        {criterio === 'Assunto' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            options={assuntos}
                            getOptionLabel={(option) => option.nome}
                            value={assuntos.find((assunto) => assunto.id === formData.assunto[0]) || null}
                            onChange={handleSelectUnit3}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option) => (
                              <li {...props}>
                                {option.nome}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={formData.assunto.length > 0 ? "" : "Selecione um assunto"}
                                error={(formData.assunto.length === 0 || formData.assunto.every(val => val === 0)) && formValidation.assunto === false}
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
                        )}
                        {criterio === 'Órgão' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            multiple
                            disableCloseOnSelect
                            options={[{ id: "all", nome: "Selecionar todos" }, ...orgaos]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.orgao.map((id) => orgaos.find((orgao) => orgao.id === id) || id)}
                            onChange={handleSelectAll5}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            limitTags={2}
                            open={open5}
                            onOpen={() => setOpen5(true)}
                            onClose={() => setOpen5(false)}
                            renderOption={(props, option, { selected }) => (
                              <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox checked={option.id === "all" ? allSelected5 : selected} />
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
                                placeholder={formData.orgao.length > 0 ? "" : "Digite ou selecione a órgão"}
                                error={(formData.orgao.length === 0 || formData.orgao.every((val) => val === 0)) && formValidation.orgao === false}
                                onClick={() => setOpen5(true)}
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
                        )}
                        {criterio === 'Faixa de Valor da Causa' && (
                          <>
                            <Slider
                              value={faixaValor}
                              onChange={handleFaixaValorChange}
                              valueLabelDisplay="on"
                              min={0}
                              max={100000000}
                              step={1}
                              marks={[
                                { value: 0, label: '0' },
                                { value: 100000000, label: '100m' },
                              ]}
                              valueLabelFormat={formatCurrency}
                              sx={{
                                marginTop: 5,
                                color: '#1C5297',
                                width: '100%',
                              }}
                            />
                            <Typography
                              sx={{
                                marginTop: 2,
                                color: '#1C5297',
                              }}
                            >
                              Ou digite o valor mínimo e máximo
                            </Typography>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <TextField
                                placeholder="Valor mínimo"
                                variant="outlined"
                                size="small"
                                value={textFieldValue[0]}
                                onChange={(e) => handleTextFieldChange(0, e.target.value)}
                                onBlur={() => handleTextFieldBlur(0)}
                                sx={{ width: '48%', backgroundColor: '#fff' }}
                              />
                              <TextField
                                placeholder="Valor máximo"
                                variant="outlined"
                                size="small"
                                value={textFieldValue[1]}
                                onChange={(e) => handleTextFieldChange(1, e.target.value)}
                                onBlur={() => handleTextFieldBlur(1)}
                                sx={{ width: '48%', backgroundColor: '#fff' }}
                              />
                            </div>
                          </>
                        )}
                        {criterio === 'Parte' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 400,
                                color: 'rgba(33, 33, 33, 1)',
                              }}
                            >
                              Distribuir diferentes causas de um mesmo cliente para o mesmo responsável?
                            </Typography>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Switch
                                checked={formData.distribuirMesmaCausa} // Estado para controlar o Switch
                                onChange={(e) => setFormData({ ...formData, distribuirMesmaCausa: e.target.checked })}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 400,
                                  color: 'rgba(33, 33, 33, 1)',
                                }}
                              >
                                {formData.distribuirMesmaCausa ? 'Sim' : 'Não'}
                              </Typography>
                            </div>
                          </div>
                        )}

                        {criterio === 'Prioridade' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            multiple
                            disableCloseOnSelect
                            options={[{ id: "all", nome: "Selecionar todos" }, ...prioridades]}
                            getOptionLabel={(option) => option.nome}
                            value={formData.prioridade.map((id) => prioridades.find((prioridade) => prioridade.id === id) || id)}
                            onChange={handleSelectAll6}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            limitTags={2}
                            open={open6}
                            onOpen={() => setOpen6(true)}
                            onClose={() => setOpen6(false)}
                            renderOption={(props, option, { selected }) => (
                              <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <Checkbox checked={option.id === "all" ? allSelected6 : selected} />
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
                                placeholder={formData.prioridade.length > 0 ? "" : "Digite ou selecione a prioridade"}
                                error={(formData.prioridade.length === 0 || formData.prioridade.every((val) => val === 0)) && formValidation.prioridade === false}
                                onClick={() => setOpen6(true)}
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
                        )}
                        {criterio === 'UF ou Região' && (
                          <Autocomplete
                            id="size-small-outlined-multi"
                            size="small"
                            options={ufs}
                            getOptionLabel={(option) => option.nome}
                            value={ufs.find((uf) => uf.id === formData.uf[0]) || null}
                            onChange={handleSelectUnit4}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option) => (
                              <li {...props}>
                                {option.nome}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={formData.uf.length > 0 ? "" : "Selecione uma uf"}
                                error={(formData.uf.length === 0 || formData.uf.every(val => val === 0)) && formValidation.uf === false}
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
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </Stack>

            </Grid>
          </Box>
        </Grid>


      </Grid>
      <Grid container spacing={2} sx={{ marginTop: 4 }}>
        {/* Box de Responsáveis */}
        <Grid item xs={6}>
          <Box sx={{ boxShadow: '0px 4px 15px 0px rgba(51, 105, 142, 0.1)', padding: '16px', backgroundColor: '#f9f9f9' }}>
            {/* Conteúdo da Box de Responsáveis */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(77, 77, 77, 1)', fontSize: '16px' }}>
              <FontAwesomeIcon icon={faBuildingUser} style={{color:'rgba(171, 190, 209, 1)',fontSize: '16px', marginRight: 10}} />
              Responsável(is) pelos processos
              </Typography>
              <Chip
                label="Obrigatório"
                sx={{
                  backgroundColor: 'rgba(245, 247, 250, 1)',
                  border: '1px solid rgba(171, 190, 209, 1)',
                  color: 'rgba(77, 77, 77, 1)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
            </Box>

            {/* Texto explicativo */}
            <Typography variant="body2" sx={{ marginBottom: 2, color: '#717171' }}>
              Selecione quantos responsáveis desejar abaixo. Depois, defina como deverá ser a distribuição proporcional dos processos, caso haja mais de 1 responsável.
            </Typography>

            <Box
              sx={{
                backgroundColor: 'rgba(238, 245, 252, 1)',
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid rgba(171, 190, 209, 1)',
                display: 'flex',
                height: '50px',
                marginBottom: 3,
              }}
            >
              <RadioGroup
                value={distributionMode}
                onChange={handleDistributionModeChange}
                row
                sx={{ marginTop: -1.5 }}
              >
                <FormControlLabel
                  value="equal"
                  control={<Radio />}
                  label="Distribuir por igual"
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio />}
                  label="Preencher manualmente"
                />
              </RadioGroup>
            </Box>
            {responsaveis.map((responsavel) => (
              <Grid container spacing={2} key={responsavel.id} sx={{ marginBottom: 2 }}>
                {/* Seleção de Responsáveis */}
                <Grid item xs={6}>
                  <InputLabel sx={{ marginBottom: 0.5 }}>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveisOptions}
                    getOptionLabel={(option) => option.nome || ''}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Selecione" />
                    )}
                    sx={{ width: '100%' }}
                  />
                </Grid>

                {/* Campo de Porcentagem */}
                <Grid item xs={4} mt={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() =>
                        distributionMode === 'manual' &&
                        handleUpdatePercent(responsavel.id, responsavel.percent - 1)
                      }
                      disabled={distributionMode === 'equal'}
                      sx={{
                        '&:hover': { backgroundColor: 'transparent' }, // Remove o hover
                        color: 'rgba(28, 82, 151, 1)', // Define a cor vermelha
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </IconButton>

                    <TextField
                      value={`${responsavel.percent}%`}
                      onChange={(e) => {
                        const value = parseInt(e.target.value.replace('%', ''), 10);
                        if (!isNaN(value)) {
                          handleUpdatePercent(responsavel.id, value);
                        }
                      }}
                      inputProps={{
                        style: { textAlign: 'center' },
                        disabled: distributionMode === 'equal',
                      }}
                      sx={{ width: '80px' }}
                    />

                    <IconButton
                      onClick={() =>
                        distributionMode === 'manual' &&
                        handleUpdatePercent(responsavel.id, responsavel.percent + 1)
                      }
                      disabled={distributionMode === 'equal'}
                      sx={{
                        '&:hover': { backgroundColor: 'transparent' }, // Remove o hover
                        color: 'rgba(28, 82, 151, 1)', // Define a cor vermelha
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={2} mt={3.5}>
                  {responsaveis.indexOf(responsavel) > 0 && (
                    <IconButton
                      onClick={() => handleRemoveResponsavel(responsavel.id)}
                      sx={{ color: 'rgba(200, 0, 0, 0.8)' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  )}
                </Grid>

              </Grid>
            ))}
            <Box
              onClick={handleAddResponsavel}
              sx={{
                width: '240px',
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(238, 245, 252, 1)',
                padding: '8px',
                border: '1px solid rgba(171, 190, 209, 1)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddResponsavel();
                }}
                sx={{ marginRight: 8, color: 'rgba(33, 33, 33, 1)', textTransform: 'none', fontWeight: 400 }}
              >
                Adicionar outro
              </Button>
              <Chip
                label={<FontAwesomeIcon icon={faPlus} />}
                sx={{
                  backgroundColor: '#1C5297',
                  color: '#fff',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#174c87',
                  },
                }}
              />
            </Box>

          </Box>
        </Grid>


        {/* Box de Auxiliares */}
        <Grid item xs={6}>
          <Box sx={{ boxShadow: '0px 4px 15px 0px rgba(51, 105, 142, 0.1)', padding: '16px', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(77, 77, 77, 1)', fontSize: '16px' }}>
              <FontAwesomeIcon icon={faUserTie} style={{color:'rgba(171, 190, 209, 1)',fontSize: '16px', marginRight: 10}} />
              Auxiliar(es)
              </Typography>
            <Typography variant="body2" sx={{ marginTop: 2 , marginBottom: 2, color: '#717171' }}>
              O auxiliar poderá consultar e acompanhar os processos desta rotina, mas não será responsável por eles. Escolha quantos auxiliares preferir abaixo.
            </Typography>
            {auxiliares.map((auxiliar) => (
              <Grid container spacing={2} key={auxiliar.id} sx={{ marginBottom: 2 }}>
                {/* Seleção de Auxiliares */}
                <Grid item xs={10}>
                  <InputLabel>Auxiliar</InputLabel>
                  <Autocomplete
                    options={responsaveisOptions} // Substitua por sua lista de auxiliares, se aplicável
                    getOptionLabel={(option) => option.nome || ''}
                    renderInput={(params) => <TextField {...params} placeholder="Selecione auxiliar" />}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Grid>

                <Grid item xs={2} mt={3.5}>
                  {auxiliares.indexOf(auxiliar) > 0 && (
                    <IconButton
                      onClick={() => handleRemoveAuxiliar(auxiliar.id)}
                      sx={{ color: 'rgba(200, 0, 0, 0.8)' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  )}
                </Grid>

              </Grid>
            ))}
            <Box
              onClick={handleAddAuxiliar}
              sx={{
                width: '240px',
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(238, 245, 252, 1)',
                padding: '8px',
                border: '1px solid rgba(171, 190, 209, 1)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddAuxiliar();
                }}
                sx={{ marginRight: 8, color: 'rgba(33, 33, 33, 1)', textTransform: 'none', fontWeight: 400 }}
              >
                Adicionar outro
              </Button>
              <Chip
                label={<FontAwesomeIcon icon={faPlus} />}
                sx={{
                  backgroundColor: '#1C5297',
                  color: '#fff',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#174c87',
                  },
                }}
              />
            </Box>

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
        <AndamentoHistoricoDrawer row={dadosApi} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
