import React from 'react';
import { useLocation } from 'react-router-dom';
import ListagemTiposAndamentos from './listaTiposAndamentos';
import ListagemAcoesJudiciais from './listaAcoesJudiciais';
import ListagemAssuntosJudiciais from './listaAssuntosJudiciais';
import ListagemAreasJudiciais from './listaAreasJudiciais';
import ListagemOrgaos from './listaOrgaos';
import ListagemFases from './listaFases';
import ListagemPrioridades from './listaPrioridades';
import ListagemTipoDeAudiencias from './listaTipoAudiencia';
import ListagemCompetencias from './listaCompetencias';
import ListagemTribunal from './listaTribunais';
import ListagemTags from './listaTags';
import ListagemTarefas from './listaTarefa';
import ListagemTiposDocumentos from './listaTiposDocumentos';
import ListagemEmpresas from './listaEmpresas';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Cancel from '@mui/icons-material/Cancel';

// material-ui
import {
  Box,
  InputAdornment,
  Tabs, 
  Tab, 
  Typography, 
  TextField,
} from '@mui/material';

import IconButton from '../../../components/@extended/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faArrowUpZA } from '@fortawesome/free-solid-svg-icons';
import ListagemPartes from './listaPartes';

const ConfiguracoesMenu = () => {
  const location = useLocation();
  const defaultTab = location.state?.tab || "Ação Judicial";
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [filter, setFilter] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [lastSelectedLabel, setLastSelectedLabel] = React.useState(defaultTab);
  
  const tabLabels = [
    "Ação Judicial",
    "Área Judicial",
    "Assunto Judicial",
    "Campos extras",
    "Centro de Custo",
    "Competência",
    "Empresa",
    "Fases",
    "Local de Serviço",
    "Motivo",
    "Órgão",
    "Partes",
    "Prioridade",
    "Sub-motivo",
    "Tarefas",
    "Tags",
    "Tipos de Andamento",
    "Tipos de Audiência",
    "Tipos de Documento",
    "Tribunal",
    "Unidade",
    "Workflow",
  ];

  const componentMapping = {
    "Tipos de Andamento": ListagemTiposAndamentos,
    "Ação Judicial": ListagemAcoesJudiciais,
    "Área Judicial": ListagemAreasJudiciais,
    "Assunto Judicial": ListagemAssuntosJudiciais,
    "Órgão": ListagemOrgaos,
    "Fases": ListagemFases,
    "Tipos de Audiência": ListagemTipoDeAudiencias,
    "Competência": ListagemCompetencias,
    "Prioridade": ListagemPrioridades,
    "Tribunal": ListagemTribunal,
    "Tags": ListagemTags,
    "Partes": ListagemPartes,
    "Tarefas": ListagemTarefas,
    "Empresa": ListagemEmpresas,
    "Tipos de Documentos": ListagemTiposDocumentos,
  };

  const carregarComponente = () => {
    const Component = componentMapping[lastSelectedLabel];
    return Component ? <Component /> : <Typography>Em desenvolvimento</Typography>;
  };

  const sortTabs = (tabs) => {
    if (sortOrder === 'asc') {
      return tabs.sort((a, b) => a.localeCompare(b));
    } else {
      return tabs.sort((a, b) => b.localeCompare(a));
    }
  };

  const filteredTabs = sortTabs(tabLabels.filter(label =>
    label.toLowerCase().includes(filter.toLowerCase())
  ));

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
    setLastSelectedLabel(filteredTabs[newValue]);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const newIndex = filteredTabs.indexOf(lastSelectedLabel);
    if (newIndex !== -1) {
      setSelectedTab(newIndex);
    }
  }, [filteredTabs, lastSelectedLabel]);

  const clearFilter = () => {
    setFilter('');
  };

  return (
    <>
      <Box mt={1}>
        <span style={{
          color: '#1C5297',
          fontFamily: 'Open Sans, Helvetica, sans-serif',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: 'normal',
        }}>
          Cadastro
        </span>
      </Box>
      <Box sx={{ display: 'flex', height: 'auto', mt: 5, mb: 10 }}>
        <Box sx={{ borderRight: 1, borderColor: 'divider', width: '20%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
              placeholder='Busque'
              value={filter}
              onChange={handleFilterChange}
              sx={{
                width: '85%',
                '& .MuiInputBase-input': {
                  height: '10px',
                  borderRadius: '8px'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ color: '#254C7D', width: '12.26px' }} />
                  </InputAdornment>
                ),
                endAdornment: filter && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearFilter} size="small">
                      <Cancel fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <IconButton onClick={toggleSortOrder} sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={sortOrder === 'asc' ? faArrowUpAZ : faArrowUpZA} />
            </IconButton>
          </Box>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={selectedTab}
            onChange={handleChangeTab}
            sx={{ borderRight: 1, borderColor: 'divider', '& .MuiTab-root': { alignItems: 'flex-start', borderBottom: 1, borderRadius: 0, borderColor: '#00000033' } }}
          >
            {filteredTabs.map((label, index) => (
              <Tab key={label} label={label} sx={{
                textAlign: 'left',
                color: '#717171CC',
                borderBottom: 2,
                borderColor: selectedTab === index ? 'primary.main' : '#00000033',
                backgroundColor: selectedTab === index ? 'primary.lighter' : null
              }} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, marginTop: '-15px', }}>
        {carregarComponente()}
      </Box>
      </Box>
    </>
  );
};

export default ConfiguracoesMenu;
