/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import {
  Button, Box, TextField, Autocomplete, Grid, Switch, Stack, Typography, Checkbox, InputLabel
} from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import LoadingOverlay from './LoadingOverlay';
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from 'react-router-dom';
import AndamentoHistoricoDrawer from '../../extra-pages/AndamentoHistoricoDrawer';
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [categorias, setCategorias] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [diretrizes, setDiretrizes] = useState([]);
  const [fatores, setFatores] = useState([]);
  const [riscoAssociados, setRiscoAssociados] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [causas, setCausas] = useState([]);
  const [impactos, setImpactos] = useState([]);
  const [normativas, setNormativas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [kris, setKris] = useState([]);
  const [controles, setControles] = useState([]);
  const [ameacas, setAmeacas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [descricaoTratamento, setDescricaoTratamento] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [responsaveis, setResponsavel] = useState([]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [riscoDados, setRiscoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    categoria: '',
    processo: [],
    riscoAssociado: [],
    conta: [],
    responsavel: '',
    dataInicioOperacao: null,
  });


  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idRisk, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map(item => ({
        id: item.idRisk || item.idLedgerAccount
          || item.idProcess || item.id_responsible
          || item.idCategory || item.idRisk
          || item.idFramework || item.idTreatment
          || item.idStrategicGuideline || item.idFactor
          || item.idIncident || item.idCause
          || item.idImpact || item.idNormative
          || item.idDepartment || item.idKri
          || item.idControl || item.idThreat,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/categories`, setCategorias);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/departments`, setDepartamentos);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks`, setRiscoAssociados);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/frameworks`, setFrameworks);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/treatments`, setTratamentos);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/strategic-guidelines`, setDiretrizes);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/factors`, setFatores);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/causes`, setCausas);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/impacts`, setImpactos);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/kris`, setKris);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/risks/threats`, setAmeacas);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/normatives`, setNormativas);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/controls`, setControles);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/processes`, setProcessos);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/incidents`, setIncidentes);
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`, setResponsavel);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/risks/${dadosApi.idRisk}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de empresas");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNome(data.name);
          setCodigo(data.code)
          setDescricao(data.description)
          setDescricaoTratamento(data.treatmentDescription)
          setFormData((prev) => ({
            ...prev,
            causa: Array.isArray(data.causes)
              ? data.causes.map((u) => u.idCause)
              : [],
            departamento: Array.isArray(data.departments)
              ? data.departments.map((u) => u.idDepartment)
              : [],
            fator: Array.isArray(data.factors)
              ? data.factors.map((u) => u.idFactor)
              : [],
            impacto: Array.isArray(data.impacts)
              ? data.impacts.map((u) => u.idImpact)
              : [],
            incidente: Array.isArray(data.incidents)
              ? data.incidents.map((u) => u.idIncident)
              : [],
            kri: Array.isArray(data.krises)
              ? data.krises.map((u) => u.idKri)
              : [],
            normativa: Array.isArray(data.normatives)
              ? data.normatives.map((u) => u.idNormative)
              : [],
            riscoAssociado: Array.isArray(data.riskAssociates)
              ? data.riskAssociates.map((u) => u.idRiskAssociate)
              : [],
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            categoria: data.idCategory || null,
            controle: data.idControls || null,
            framework: data.idFramework || null,
            processo: data.idProcesses || null,
            responsavel: data.idResponsible || null,
            risco: data.idRisk || null,
            ameaca: data.idThreats || null,
            tratamento: data.idTreatment || null
          }));

          setFormData((prev) => ({
            ...prev,
            dataInicioOperacao: data.date
              ? new Date(data.date)
              : null,
          }));

          setRiscoDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idRisk) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const [nomeArquivo, setNomeArquivo] = useState('');

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNomeArquivo(file.name); // Armazena o nome do arquivo no estado
    }
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === 'categoria') {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.riscoAssociado.length === riscoAssociados.length) {
        // Deselect all
        setFormData({ ...formData, riscoAssociado: [] });
      } else {
        // Select all
        setFormData({ ...formData, riscoAssociado: riscoAssociados.map(riscoAssociado => riscoAssociado.id) });
      }
    } else {
      tratarMudancaInputGeral('riscoAssociado', newValue.map(item => item.id));
    }
  };

  const handleSelectAllCausas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.causa.length === causas.length) {
        // Deselect all
        setFormData({ ...formData, causa: [] });
      } else {
        // Select all
        setFormData({ ...formData, causa: causas.map(causa => causa.id) });
      }
    } else {
      tratarMudancaInputGeral('causa', newValue.map(item => item.id));
    }
  };

  const handleSelectAllImpactos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.impacto.length === impactos.length) {
        // Deselect all
        setFormData({ ...formData, impacto: [] });
      } else {
        // Select all
        setFormData({ ...formData, impacto: impactos.map(impacto => impacto.id) });
      }
    } else {
      tratarMudancaInputGeral('impacto', newValue.map(item => item.id));
    }
  };

  const handleSelectAllNormativas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.normativa.length === normativas.length) {
        // Deselect all
        setFormData({ ...formData, normativa: [] });
      } else {
        // Select all
        setFormData({ ...formData, normativa: normativas.map(normativa => normativa.id) });
      }
    } else {
      tratarMudancaInputGeral('normativa', newValue.map(item => item.id));
    }
  };

  const handleSelectAllDepartamentos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.departamento.length === departamentos.length) {
        // Deselect all
        setFormData({ ...formData, departamento: [] });
      } else {
        // Select all
        setFormData({ ...formData, departamento: departamentos.map(departamento => departamento.id) });
      }
    } else {
      tratarMudancaInputGeral('departamento', newValue.map(item => item.id));
    }
  };

  const handleSelectAllControles = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.controle.length === controles.length) {
        // Deselect all
        setFormData({ ...formData, controle: [] });
      } else {
        // Select all
        setFormData({ ...formData, controle: controles.map(controle => controle.id) });
      }
    } else {
      tratarMudancaInputGeral('controle', newValue.map(item => item.id));
    }
  };

  const handleSelectAllKris = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.kri.length === kris.length) {
        // Deselect all
        setFormData({ ...formData, kri: [] });
      } else {
        // Select all
        setFormData({ ...formData, kri: kris.map(kri => kri.id) });
      }
    } else {
      tratarMudancaInputGeral('kri', newValue.map(item => item.id));
    }
  };

  const handleSelectAllIncidentes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.incidente.length === incidentes.length) {
        // Deselect all
        setFormData({ ...formData, incidente: [] });
      } else {
        // Select all
        setFormData({ ...formData, incidente: incidentes.map(incidente => incidente.id) });
      }
    } else {
      tratarMudancaInputGeral('incidente', newValue.map(item => item.id));
    }
  };

  const handleSelectAllDiretrizes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.diretriz.length === diretrizes.length) {
        // Deselect all
        setFormData({ ...formData, diretriz: [] });
      } else {
        // Select all
        setFormData({ ...formData, diretriz: diretrizes.map(diretriz => diretriz.id) });
      }
    } else {
      tratarMudancaInputGeral('diretriz', newValue.map(item => item.id));
    }
  };

  const handleSelectAllAmeacas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.ameaca.length === ameacas.length) {
        // Deselect all
        setFormData({ ...formData, ameaca: [] });
      } else {
        // Select all
        setFormData({ ...formData, ameaca: ameacas.map(ameaca => ameaca.id) });
      }
    } else {
      tratarMudancaInputGeral('ameaca', newValue.map(item => item.id));
    }
  };

  const handleSelectAllFatores = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.fator.length === fatores.length) {
        // Deselect all
        setFormData({ ...formData, fator: [] });
      } else {
        // Select all
        setFormData({ ...formData, fator: fatores.map(fator => fator.id) });
      }
    } else {
      tratarMudancaInputGeral('fator', newValue.map(item => item.id));
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.processo.length === processos.length) {
        // Deselect all
        setFormData({ ...formData, processo: [] });
      } else {
        // Select all
        setFormData({ ...formData, processo: processos.map(processo => processo.id) });
      }
    } else {
      tratarMudancaInputGeral('processo', newValue.map(item => item.id));
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const [formValidation, setFormValidation] = useState({
    empresaInferior: true,
    nome: true,
  });

  const allSelected = formData.riscoAssociado.length === riscoAssociados.length && riscoAssociados.length > 0;
  const allSelected2 = formData.processo.length === processos.length && processos.length > 0;
  const allSelectedDiretrizes = formData.diretriz.length === diretrizes.length && diretrizes.length > 0;
  const allSelectedFatores = formData.fator.length === fatores.length && fatores.length > 0;
  const allSelectedIncidente = formData.incidente.length === incidentes.length && incidentes.length > 0;
  const allSelectedCausas = formData.causa.length === causas.length && causas.length > 0;
  const allSelectedImpactos = formData.impacto.length === impactos.length && impactos.length > 0;
  const allSelectedNormativas = formData.normativa.length === normativas.length && normativas.length > 0;
  const allSelectedDepartamentos = formData.departamento.length === departamentos.length && departamentos.length > 0;
  const allSelectedKris = formData.kri.length === kris.length && kris.length > 0;
  const allSelectedControles = formData.controle.length === controles.length && controles.length > 0;
  const allSelectedAmeacas = formData.ameaca.length === ameacas.length && ameacas.length > 0;

  const tratarSubmit = async () => {
    let url = '';
    let method = '';
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 ? "são obrigatórios e devem estar válidos!" : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, { variant: "error" });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === 'Criar') {
      url = 'https://api.egrc.homologacao.com.br/api/v1/risks';
      method = 'POST';
      payload = {
        code: codigo,
        name: nome
      };
    } else if (requisicao === 'Editar') {
      url = `https://api.egrc.homologacao.com.br/api/v1/risks`;
      method = 'PUT';
      payload = {
        idRisk: riscoDados?.idRisk,
        code: codigo,
        name: nome,
        description: descricao,
        treatmentDescription: descricaoTratamento,
        date: formData.dataInicioOperacao?.toISOString(),
        idResponsible: formData.responsavel,
        active: status,
        idCategory: formData.categoria,
        idFramework: formData.framework,
        idTreatment: formData.tratamento,
        idRiskAssociates: formData.riscoAssociado,
        idStrategicGuidelines: formData.diretriz,
        idFactors: formData.fator,
        idIncidents: formData.incidente,
        idCauses: formData.causa,
        idImpacts: formData.impacto,
        idNormatives: formData.normativa,
        idDepartments: formData.departamento,
        idKrises: formData.kri,
        idProcesses: formData.processo,
        idControls: formData.controle,
        idThreats: formData.ameaca
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('O Código informado já foi cadastrado.');
      } else {
        enqueueSnackbar(`Risco ${mensagemFeedback} com sucesso!`, { variant: 'success' });
      }

      // Caso seja uma criação, faz o PUT imediatamente
      if (requisicao === 'Criar') {
        const result = await response.json();
        const putPayload = {
          idRisk: result.data.idRisk,
          code: codigo,
          name: nome,
          description: descricao,
          treatmentDescription: descricaoTratamento,
          date: formData.dataInicioOperacao?.toISOString() || null,
          idResponsible: formData.responsavel,
          active: status,
          idCategory: formData.categoria,
          idFramework: formData.framework || null,
          idTreatment: formData.tratamento || null,
          idRiskAssociates: formData.riscoAssociado,
          idStrategicGuidelines: formData.diretriz,
          idFactors: formData.fator,
          idIncidents: formData.incidente,
          idCauses: formData.causa,
          idImpacts: formData.impacto,
          idNormatives: formData.normativa,
          idDepartments: formData.departamento,
          idKrises: formData.kri,
          idProcesses: formData.processo,
          idControls: formData.controle,
          idThreats: formData.ameaca
        };

        const putResponse = await fetch(`https://api.egrc.homologacao.com.br/api/v1/risks`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(putPayload),
        });

        if (!putResponse.ok) {
          throw new Error('Erro ao atualizar os campos opcionais da empresa');
        }
      }

      voltarParaCadastroMenu();
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar('Não foi possível cadastrar esse risco.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
                placeholder="Código do risco"
                value={codigo}
                error={!codigo && formValidation.codigo === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>
                Data de identificação
              </InputLabel>
              <DatePicker
                value={formData.dataInicioOperacao || null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    dataInicioOperacao: newValue,
                  }));
                }}
                slotProps={{
                  textField: {
                    placeholder: "00/00/0000",
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição</InputLabel>
              <TextField
                onChange={(event) => setDescricao(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricao}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Categoria</InputLabel>
              <Autocomplete
                options={categorias}
                getOptionLabel={(option) => option.nome}
                value={categorias.find(categoria => categoria.id === formData.categoria) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    categoria: newValue ? newValue.id : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    error={!formData.categoria && formValidation.categoria === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Risco Associado</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...riscoAssociados]}
                getOptionLabel={(option) => option.nome}
                value={formData.riscoAssociado.map(id => riscoAssociados.find(riscoAssociado => riscoAssociado.id === id) || id)}
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
                    error={(formData.riscoAssociado.length === 0 || formData.riscoAssociado.every(val => val === 0)) && formValidation.riscoAssociado === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Frameworks</InputLabel>
              <Autocomplete
                options={frameworks}
                getOptionLabel={(option) => option.nome}
                value={frameworks.find(framework => framework.id === formData.framework) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    framework: newValue ? newValue.id : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    error={!formData.framework && formValidation.framework === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tratamento</InputLabel>
              <Autocomplete
                options={tratamentos}
                getOptionLabel={(option) => option.nome}
                value={tratamentos.find(tratamento => tratamento.id === formData.tratamento) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    tratamento: newValue ? newValue.id : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    error={!formData.tratamento && formValidation.tratamento === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição do tratamento</InputLabel>
              <TextField
                onChange={(event) => setDescricaoTratamento(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricaoTratamento}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Diretrizes estratégicas</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...diretrizes]}
                getOptionLabel={(option) => option.nome}
                value={formData.diretriz.map(id => diretrizes.find(diretriz => diretriz.id === id) || id)}
                onChange={handleSelectAllDiretrizes}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedDiretrizes : selected}
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
                    error={(formData.diretriz.length === 0 || formData.diretriz.every(val => val === 0)) && formValidation.diretriz === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Fatores</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...fatores]}
                getOptionLabel={(option) => option.nome}
                value={formData.fator.map(id => fatores.find(fator => fator.id === id) || id)}
                onChange={handleSelectAllFatores}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedFatores : selected}
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
                    error={(formData.fator.length === 0 || formData.fator.every(val => val === 0)) && formValidation.fator === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Incidentes</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...incidentes]}
                getOptionLabel={(option) => option.nome}
                value={formData.incidente.map(id => incidentes.find(incidente => incidente.id === id) || id)}
                onChange={handleSelectAllIncidentes}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedIncidente : selected}
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
                    error={(formData.incidente.length === 0 || formData.incidente.every(val => val === 0)) && formValidation.incidente === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Causas</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...causas]}
                getOptionLabel={(option) => option.nome}
                value={formData.causa.map(id => causas.find(causa => causa.id === id) || id)}
                onChange={handleSelectAllCausas}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedCausas : selected}
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
                    error={(formData.causa.length === 0 || formData.causa.every(val => val === 0)) && formValidation.causa === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Impactos</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...impactos]}
                getOptionLabel={(option) => option.nome}
                value={formData.impacto.map(id => impactos.find(impacto => impacto.id === id) || id)}
                onChange={handleSelectAllImpactos}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedImpactos : selected}
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
                    error={(formData.impacto.length === 0 || formData.impacto.every(val => val === 0)) && formValidation.impacto === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Normativas</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todas' }, ...normativas]}
                getOptionLabel={(option) => option.nome}
                value={formData.normativa.map(id => normativas.find(normativa => normativa.id === id) || id)}
                onChange={handleSelectAllNormativas}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedNormativas : selected}
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
                    error={(formData.normativa.length === 0 || formData.normativa.every(val => val === 0)) && formValidation.normativa === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Departamentos</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...departamentos]}
                getOptionLabel={(option) => option.nome}
                value={formData.departamento.map(id => departamentos.find(departamento => departamento.id === id) || id)}
                onChange={handleSelectAllDepartamentos}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedDepartamentos : selected}
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
                    error={(formData.departamento.length === 0 || formData.departamento.every(val => val === 0)) && formValidation.departamento === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Kri</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...kris]}
                getOptionLabel={(option) => option.nome}
                value={formData.kri.map(id => kris.find(kri => kri.id === id) || id)}
                onChange={handleSelectAllKris}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedKris : selected}
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
                    error={(formData.kri.length === 0 || formData.kri.every(val => val === 0)) && formValidation.kri === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Processos</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todas' }, ...processos]}
                getOptionLabel={(option) => option.nome}
                value={formData.processo.map(id => processos.find(processo => processo.id === id) || id)}
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
                    error={(formData.processo.length === 0 || formData.processo.every(val => val === 0)) && formValidation.processo === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Controles</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todos' }, ...controles]}
                getOptionLabel={(option) => option.nome}
                value={formData.controle.map(id => controles.find(controle => controle.id === id) || id)}
                onChange={handleSelectAllControles}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedControles : selected}
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
                    error={(formData.controle.length === 0 || formData.controle.every(val => val === 0)) && formValidation.controle === false}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} mb={5}>
            <Stack spacing={1}>
              <InputLabel>Ameaças</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[{ id: 'all', nome: 'Selecionar todas' }, ...ameacas]}
                getOptionLabel={(option) => option.nome}
                value={formData.ameaca.map(id => ameacas.find(ameaca => ameaca.id === id) || id)}
                onChange={handleSelectAllAmeacas}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={option.id === 'all' ? allSelectedAmeacas : selected}
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
                    error={(formData.ameaca.length === 0 || formData.ameaca.every(val => val === 0)) && formValidation.ameaca === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Responsável</InputLabel>
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
                    error={!formData.responsavel && formValidation.responsavel === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Anexo</InputLabel>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  component="label"
                  sx={{ width: '150px', height: '36px', fontSize: '12px' }}
                >
                  Inserir Arquivo
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                <TextField
                  fullWidth
                  value={nomeArquivo}
                  placeholder="Nenhum arquivo selecionado"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ marginLeft: 1 }} 
                />
              </Stack>
            </Stack>
          </Grid>


          <Grid item xs={4}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} style={{ marginTop: 37.5, marginLeft: 37.5 }}>
                <Switch
                  checked={status}
                  onChange={(event) => setStatus(event.target.checked)}
                />
                <Typography>{status ? "Ativo" : "Inativo"}</Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginRight: '20px', marginTop: 5 }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>

        </Grid>
      </LocalizationProvider>
      {requisicao === 'Editar' && (
        <AndamentoHistoricoDrawer row={dadosApi} open={drawerOpen} onClose={handleDrawerClose} vindoDe={'Tipo de Andamentos'} />
      )}
    </>
  );
}

export default ColumnsLayouts;
