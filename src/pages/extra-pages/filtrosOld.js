import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
  IconButton,
  Button,
  InputLabel,
  Grid,
  Menu,
  Pagination,
  MenuItem,
  Box,
  Stack,
  Autocomplete,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { API_QUERY, API_COMMAND } from '../../../config';
import { CloseCircleOutlined } from "@ant-design/icons";
import FilterListIcon from "@mui/icons-material/FilterAlt";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MainCard from "../../../components/MainCard";
import SimpleBar from "../../../components/third-party/SimpleBar";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import ptBR from "date-fns/locale/pt-BR";

const FiltrosAvancadosMenu = ({ onFormDataChange }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    uf: [],
    orgao: [],
    dataInicio: null,
    dataFim: null,
    cliente: [],
    area: [],
    segmento: [],
    status: [],
    tag: [],
    advogado: [],
    fase: [],
    evento: "",
    usuario: [],
    nomeFiltro: [],
    salvarFiltro: false,
    filtro: [],
  });
  const [ufs, setUfs] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [segmentos, setSegmentos] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [fases, setFases] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltrosSalvos] = useState([]);
  const ordenarFiltros = (filtros) => {
    return filtros.sort((a, b) => a.nome.localeCompare(b.nome));
  };  
  const [drawerTitle, setDrawerTitle] = useState("Filtros Avançados");
  const [openedFromSavedFilters, setOpenedFromSavedFilters] = useState(false);
  const [savedFilterName, setSavedFilterName] = useState("Filtros Salvos");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const simpleBarRef = useRef(null);
  const [isFilterSaved, setIsFilterSaved] = useState(false);

  // Função para carregar os dados das APIs
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData(`${API_QUERY}/api/Uf`, setUfs);
    fetchData(`${API_QUERY}/api/Orgao`, setOrgaos);
    fetchData(`${API_QUERY}/api/Area`, setAreas);
    fetchData(
      `${API_QUERY}/api/Segmento`,
      setSegmentos
    );
    fetchData(
      `${API_QUERY}/api/ProcessoStatus`,
      setStatusOptions
    );
    fetchData(`${API_QUERY}/api/Tag`, setTags);
    fetchData(`${API_QUERY}/api/Fase`, setFases);
    fetchData(`${API_QUERY}/api/Parte`, setClientes);
    fetchData(
      `${API_QUERY}/api/Usuario`,
      setUsuarios
    );
    fetchData(
      "http://10.0.72.13:5020/api/Filtro/ListAsync/0c8e7f9e-bb6f-460a-82fa-1496a95c2a72",
      (novosFiltros) => setFiltrosSalvos(ordenarFiltros(novosFiltros))
    );    
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleToggle = () => {
    setOpen(!open);
    setOpenedFromSavedFilters(false);
    // Se o Drawer está sendo aberto, defina o título para "Filtros Avançados"
    setFormData({
      uf: [],
      orgao: [],
      dataInicio: null,
      dataFim: null,
      cliente: [],
      area: [],
      segmento: [],
      status: [],
      tag: [],
      advogado: [],
      fase: [],
      evento: "",
      usuario: [],
      nomeFiltro: [],
      salvarFiltro: false,
      filtro: [],
    });

    setIsFilterSaved(false);

    if (!open) {
      setDrawerTitle("Filtros Avançados");
    }
  };

  useEffect(() => {
    if (open && simpleBarRef.current) {
      simpleBarRef.current.recalculate();
    }
  }, [open]);

  const handleSaveFilterChange = (event) => {
    setIsFilterSaved(event.target.checked);
    setFormData({ ...formData, salvarFiltro: event.target.checked });
  };

  const buttonStyle = { marginRight: "10px" };

  const handleSubmit = async () => {
    onFormDataChange(formData);
    if (formData.nomeFiltro.length != 0) {
      setSavedFilterName(formData.nomeFiltro);
    } else {
      setSavedFilterName("Filtros Salvos");
    }
    // Indica que um filtro foi aplicado
    setIsFilterApplied(true);

    // Fechar o Drawer após a envio
    setOpen(false);
  };

  // Função para lidar com mudanças no switch dos filtros salvos
  const handleFiltroChange = async (filtroId) => {
    setOpenedFromSavedFilters(true);
    setDrawerTitle("Filtros Salvos");

    setFiltrosSalvos(
      ordenarFiltros(
        filtros.map((f) => ({
          ...f,
          checked: f.id === filtroId,
        }))
      )
    );    

    // Abre o drawer
    setOpen(true);

    try {
      const response = await axios.get(
        `http://10.0.72.13:5000/gateway/filtro/get/${filtroId}`
      );
      const filtroData = response.data;

      // Converte strings de data para objetos Date
      const dataInicio = filtroData.dataDistribuicaoInicio
        ? new Date(filtroData.dataDistribuicaoInicio)
        : null;
      const dataFim = filtroData.dataDistribuicaoFim
        ? new Date(filtroData.dataDistribuicaoFim)
        : null;

      // Atualiza o estado formData para cada campo
      setFormData((prevFormData) => ({
        ...prevFormData,
        uf: filtroData.ufId || [],
        orgao: filtroData.orgaoId || [],
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        cliente: filtroData.partesId || [],
        area: filtroData.areaId || [],
        segmento: filtroData.segmentoId || [],
        status: filtroData.statusId || [],
        tag: filtroData.tagsId || [],
        advogado: filtroData.advogadoId || [],
        fase: filtroData.faseId || [],
        evento: filtroData.evento || "",
        usuario: filtroData.usuarioId || [],
        nomeFiltro: filtroData.nomeFiltro || "",
        salvarFiltro: filtroData.salvarFiltro || false,
        filtro: filtroData.filtroId || [],
      }));
    } catch (error) {
    }
  };

  // Corrigir a função para limpar o filtro selecionado
  const clearSavedFilterSelection = () => {
    // Adicione aqui qualquer lógica adicional necessária para limpar o estado relacionado ao filtro
    const initialFormData = {
      uf: [],
      orgao: [],
      dataInicio: null,
      dataFim: null,
      cliente: [],
      area: [],
      segmento: [],
      status: [],
      tag: [],
      advogado: [],
      fase: [],
      evento: "",
      usuario: [],
      nomeFiltro: [],
      salvarFiltro: false,
      filtro: [],
    };

    // Atualiza o estado local
    setFormData(initialFormData);

    // Atualiza o estado global ou realiza qualquer ação necessária
    onFormDataChange(initialFormData);

    setSavedFilterName("Filtros Salvos");

    setIsFilterApplied(false);

    // Fechar o Drawer após a limpeza
    setOpen(false);
  };

  // Novas variáveis de estado e funções
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClickButton = (event) => {
    fetchData(
      "http://10.0.72.13:5020/api/Filtro/ListAsync/0c8e7f9e-bb6f-460a-82fa-1496a95c2a72",
      (novosFiltros) => setFiltrosSalvos(ordenarFiltros(novosFiltros))
    );
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Cálculo de quantas páginas existem e quais itens devem ser exibidos na página atual
  const count = Math.ceil(filtros.length / itemsPerPage);
  const currentPageItems = filtros.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Função para alterar a página atual
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.75 }}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          onClick={handleToggle}
          style={buttonStyle}
        >
          Mais filtros
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<BookmarkIcon />}
          onClick={handleClickButton}
          style={buttonStyle}
        >
          {savedFilterName}
        </Button>

        <Menu
      anchorEl={anchorEl}
      open={openMenu}
      onClose={handleCloseMenu}
      MenuListProps={{
        "aria-labelledby": "filtros-salvos-button",
      }}
    >
      <Box sx={{ padding: "8px 16px", width: "255px" }}>
        <Autocomplete
          options={filtros}
          getOptionLabel={(option) => option.nome}
          onChange={(event, newValue) => {
            if (newValue) {
              handleFiltroChange(newValue.id);
              handleCloseMenu();
            }
          }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Pesquisar filtro" variant="outlined" />
          )}
        />
      </Box>

      {/* Renderização dos itens da página atual */}
      {currentPageItems.map((filtro) => (
        <MenuItem
          key={filtro.id}
          value={filtro.id}
          onClick={() => {
            handleFiltroChange(filtro.id);
            handleCloseMenu();
          }}
        >
          {filtro.nome}
        </MenuItem>
      ))}

      {/* Renderização da paginação se houver mais de 1 página */}
      {count > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", padding: "8px 16px" }}>
          <Pagination count={count} page={page} onChange={handlePageChange} />
        </Box>
      )}
    </Menu>
        <Button
          variant="outlined"
          color="secondary"
          onClick={clearSavedFilterSelection}
          style={{
            marginLeft: "1px",
            marginRight: "10px",
            display: isFilterApplied ? "inline-block" : "none",
          }} // Alteração aqui
          disabled={!isFilterApplied}
        >
          Limpar Filtro
        </Button>
      </Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleToggle}
        PaperProps={{ sx: { width: 640 } }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <MainCard
            title={drawerTitle}
            sx={{
              border: "none",
              borderRadius: 0,
              height: "100vh",
              "& .MuiCardHeader-root": {
                color: "background.paper",
                bgcolor: "primary.main",
                "& .MuiTypography-root": { fontSize: "1rem" },
              },
            }}
            secondary={
              <IconButton
                shape="rounded"
                size="small"
                onClick={handleToggle}
                sx={{ color: "background.paper" }}
              >
                <CloseCircleOutlined style={{ fontSize: "1.15rem" }} />
              </IconButton>
            }
          >
            <SimpleBar
              ref={simpleBarRef}
              style={{ maxHeight: "calc(100vh - 124px)", paddingRight: "18px" }}
            >
              <Box
                sx={{
                  height: "calc(100vh - 124px)",
                  "& .MuiAccordion-root": {
                    "& .MuiAccordionSummary-root": {
                      bgcolor: "transparent",
                      flexDirection: "row",
                      pl: 1,
                    },
                    "& .MuiAccordionDetails-root": {
                      border: "none",
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                  <InputLabel>UF</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={ufs}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.uf.map((id) =>
                      ufs.find((uf) => uf.id === id)
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das UFs selecionadas
                      handleInputChange(
                        "uf",
                        newValue.map((item) => item.id)
                      );
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
                                // Manipulação do Switch dentro do Autocomplete
                                // Não se esqueça de gerenciar o estado aqui conforme necessário
                              }}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={formData.uf.length > 0 ? "" : "Selecionar"}
                      />
                    )}
                  />
                  <InputLabel>Orgão</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={orgaos}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.orgao.map(
                      (id) => orgaos.find((orgao) => orgao.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "orgao",
                        newValue.map((item) => item.id)
                      );
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
                                // Manipulação do Switch dentro do Autocomplete
                                // Não se esqueça de gerenciar o estado aqui conforme necessário
                              }}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.orgao.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  <InputLabel>Empresa</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={clientes}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.cliente.map(
                      (id) =>
                        clientes.find((cliente) => cliente.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "cliente",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.cliente.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  <InputLabel>Data da Distribuição - Início</InputLabel>
                  <DatePicker
                    value={formData.dataInicio}
                    onChange={(newValue) => {
                      handleInputChange("dataInicio", newValue);
                    }}
                  />

                  <InputLabel>Data da Distribuição - Fim</InputLabel>
                  <DatePicker
                    value={formData.dataFim}
                    onChange={(newValue) => {
                      handleInputChange("dataFim", newValue);
                    }}
                  />
                  <InputLabel>Área</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={areas}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.area.map(
                      (id) => areas.find((area) => area.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "area",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.area.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  <InputLabel>Segmento</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={segmentos}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.segmento.map(
                      (id) =>
                        segmentos.find((segmento) => segmento.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "segmento",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.segmento.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  <InputLabel>Status</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={statusOptions}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.status.map(
                      (id) =>
                        statusOptions.find((status) => status.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "status",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.status.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  <InputLabel>Tag</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={tags}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.tag.map(
                      (id) => tags.find((tag) => tag.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "tag",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.tag.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  {/* <InputLabel>Advogado</InputLabel>
                                    <Autocomplete
                                        multiple
                                        disableCloseOnSelect
                                        options={advogados}
                                        getOptionLabel={(option) => option.nome} // Exibe o nome
                                        value={formData.advogado.map(id => advogados.find(advogado => advogado.id === id) || id)}
                                        onChange={(event, newValue) => {
                                            // Atualize com os IDs das Orgaos selecionadas
                                            handleInputChange('advogado', newValue.map(item => item.id));
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
                                                                // Manipulação do Switch dentro do Autocomplete
                                                                // Não se esqueça de gerenciar o estado aqui conforme necessário
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={formData.advogado.length > 0 ? '' : 'Selecionar'}
                                            />
                                        )} /> */}
                  <InputLabel>Fase</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={fases}
                    getOptionLabel={(option) => option.nome} // Exibe o nome
                    value={formData.fase.map(
                      (id) => fases.find((fase) => fase.id === id) || id
                    )}
                    onChange={(event, newValue) => {
                      // Atualize com os IDs das Orgaos selecionadas
                      handleInputChange(
                        "fase",
                        newValue.map((item) => item.id)
                      );
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
                              onChange={(event) => {}}
                            />
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.fase.length > 0 ? "" : "Selecionar"
                        }
                      />
                    )}
                  />
                  {/* <InputLabel>Evento</InputLabel>
                                <Autocomplete
                                    options={eventos}
                                    value={formData.evento}
                                    onChange={(event, newValue) => handleInputChange('evento', newValue)}
                                    renderInput={(params) => <TextField {...params} placeholder="Selecionar" />}
                                /> */}
                  <Divider />

                  <InputLabel>Deseja salvar esse filtro?</InputLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isFilterSaved}
                        onChange={handleSaveFilterChange}
                      />
                    }
                    label={isFilterSaved ? "Sim" : "Não"}
                    labelPlacement="end"
                  />
                  {isFilterSaved && (
                    <>
                      <InputLabel>Nome do Filtro</InputLabel>
                      <TextField
                        variant="outlined"
                        placeholder="Nome"
                        value={formData.nomeFiltro}
                        disabled={openedFromSavedFilters}
                        onChange={(event) =>
                          handleInputChange("nomeFiltro", event.target.value)
                        }
                      />

                      <InputLabel>Compartilhar filtro com:</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={usuarios}
                        getOptionLabel={(option) => option.nome} // Exibe o nome
                        value={formData.usuario.map(
                          (id) =>
                            usuarios.find((usuario) => usuario.id === id) || id
                        )}
                        onChange={(event, newValue) => {
                          // Atualize com os IDs das UFs selecionadas
                          handleInputChange(
                            "usuario",
                            newValue.map((item) => item.id)
                          );
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
                                  onChange={(event) => {}}
                                />
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={
                              formData.usuario.length > 0 ? "" : "Selecionar"
                            }
                          />
                        )}
                      />
                      <Divider />
                    </>
                  )}

                  {/* Ajuste o gap na Box que contém os botões */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      style={{
                        ...buttonStyle,
                        padding: "4px 10px",
                        fontSize: "0.875rem",
                      }}
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{
                        ...buttonStyle,
                        padding: "6px 12px",
                        fontSize: "1rem",
                      }}
                      onClick={handleSubmit}
                    >
                      Filtrar
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </SimpleBar>
          </MainCard>
        </LocalizationProvider>
      </Drawer>
    </>
  );
};

export default FiltrosAvancadosMenu;
