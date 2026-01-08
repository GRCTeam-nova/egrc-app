/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND } from "../../../config";
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetProcessos } from "../../../api/processos"; // Certifique-se que este hook existe
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import emitter from "../tela2/eventEmitter";
// project import
import MainCard from "../../../components/MainCard";

// material-ui
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Grid,
  Button,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Divider,
  Stack,
  Table,
  InputLabel,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

// project-import
import ScrollX from "../../../components/ScrollX";
import IconButton from "../../../components/@extended/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CloseIcon from '@mui/icons-material/Close';
import Mark from "mark.js";
import {
  faXmark,
  faTrash,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
  SelectColumnVisibility,
} from "../../../components/third-party/react-table"; 
import { useToken } from "../../../api/TokenContext";

// assets
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);

  // 1. Segurança contra nulos
  if (cellValue === undefined || cellValue === null || value === undefined || value === "") {
    return false;
  }

  // 2. Função para limpar texto (remove acentos e converte para minúsculas)
  const normalize = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // 3. Normaliza o valor da Célula
  let cellString = "";
  if (Array.isArray(cellValue)) {
    // Se for array (ex: Empresas), junta tudo numa string só separada por espaço
    cellString = cellValue.map((item) => normalize(item)).join(" ");
  } else {
    cellString = normalize(cellValue);
  }

  // 4. Normaliza o valor da Busca e quebra em palavras
  // Ex: "Empresa  03 " vira ["empresa", "03"]
  const searchTerms = normalize(value).split(" ").filter((term) => term.trim() !== "");

  // 5. Verifica se TODAS as palavras digitadas existem na célula
  // Isso permite achar "Empresa 03" mesmo se no banco estiver "Empresa Teste 03"
  return searchTerms.every((term) => cellString.includes(term));
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, totalRows, isLoading, onApplyFilters, onExportExcel }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Processos";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Opções para os filtros (Processos)
  const [typeOptions, setTypeOptions] = useState([]); // Antes era category
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [kriOptions, setKriOptions] = useState([]); 

  // Opções de Arrays
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [risksOptions, setRisksOptions] = useState([]);
  const [processesBottomsOptions, setProcessesBottomsOptions] = useState([]);
  const [lgpdsOptions, setLgpdsOptions] = useState([]);
  const [deficienciesOptions, setDeficienciesOptions] = useState([]);
  const [ledgerAccountsOptions, setLedgerAccountsOptions] = useState([]);
  const [platformsOptions, setPlatformsOptions] = useState([]);
  const [informationActivitiesOptions, setInformationActivitiesOptions] = useState([]);
  const [controlsOptions, setControlsOptions] = useState([]);
  const [incidentsOptions, setIncidentsOptions] = useState([]);
  const [actionPlansOptions, setActionPlansOptions] = useState([]);
  const [normativesOptions, setNormativesOptions] = useState([]);
  const [departmentsOptions, setDepartmentsOptions] = useState([]);

  const [draftFilters, setDraftFilters] = useState({
    responsible: [],
    type: [],
    kri: [],
    companies: [],
    risks: [],
    processesBottoms: [],
    lgpds: [],
    deficiencies: [],
    ledgerAccounts: [],
    platforms: [],
    informationActivities: [],
    controls: [],
    incidents: [],
    actionPlans: [],
    normatives: [],
    departments: [],
    startDate: null,
    endDate: null,
  });

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const getUniqueValues = (key, isArray = false) => {
      if (!data) return [];
      const values = data.flatMap(item => {
        const value = item[key];
        if (isArray && Array.isArray(value)) {
          return value.filter(v => v !== null && v !== undefined && v !== "");
        }
        return value !== null && value !== undefined && value !== "" ? [value] : [];
      });
      return [...new Set(values)].sort();
    };

    // Campos String
    setTypeOptions(getUniqueValues('type'));
    setResponsibleOptions(getUniqueValues('responsible'));
    setKriOptions(getUniqueValues('kri'));

    // Campos Array
    setCompaniesOptions(getUniqueValues('companies', true));
    setRisksOptions(getUniqueValues('risks', true));
    setProcessesBottomsOptions(getUniqueValues('processesBottoms', true));
    setLgpdsOptions(getUniqueValues('lgpds', true));
    setDeficienciesOptions(getUniqueValues('deficiencies', true));
    setLedgerAccountsOptions(getUniqueValues('ledgerAccounts', true));
    setPlatformsOptions(getUniqueValues('platforms', true));
    setInformationActivitiesOptions(getUniqueValues('informationActivities', true));
    setControlsOptions(getUniqueValues('controls', true));
    setIncidentsOptions(getUniqueValues('incidents', true));
    setActionPlansOptions(getUniqueValues('actionPlans', true));
    setNormativesOptions(getUniqueValues('normatives', true));
    setDepartmentsOptions(getUniqueValues('departments', true));

  }, [data]);

  const applyFilters = () => {
    const newFilters = [];
    
    // Mapeamento de filtros para exibição visual (Chips)
    if (draftFilters.responsible.length > 0) newFilters.push({ type: "Responsável", values: draftFilters.responsible });
    if (draftFilters.type.length > 0) newFilters.push({ type: "Tipo", values: draftFilters.type });
    if (draftFilters.kri.length > 0) newFilters.push({ type: "KRI", values: draftFilters.kri });
    
    // Arrays
    if (draftFilters.companies.length > 0) newFilters.push({ type: "Empresas", values: draftFilters.companies });
    if (draftFilters.risks.length > 0) newFilters.push({ type: "Riscos", values: draftFilters.risks });
    if (draftFilters.processesBottoms.length > 0) newFilters.push({ type: "Subprocessos", values: draftFilters.processesBottoms });
    if (draftFilters.lgpds.length > 0) newFilters.push({ type: "LGPD", values: draftFilters.lgpds });
    if (draftFilters.deficiencies.length > 0) newFilters.push({ type: "Deficiências", values: draftFilters.deficiencies });
    if (draftFilters.ledgerAccounts.length > 0) newFilters.push({ type: "Contas Contábeis", values: draftFilters.ledgerAccounts });
    if (draftFilters.platforms.length > 0) newFilters.push({ type: "Plataformas", values: draftFilters.platforms });
    if (draftFilters.informationActivities.length > 0) newFilters.push({ type: "Atividades de Info", values: draftFilters.informationActivities });
    if (draftFilters.controls.length > 0) newFilters.push({ type: "Controles", values: draftFilters.controls });
    if (draftFilters.incidents.length > 0) newFilters.push({ type: "Incidentes", values: draftFilters.incidents });
    if (draftFilters.actionPlans.length > 0) newFilters.push({ type: "Planos de Ação", values: draftFilters.actionPlans });
    if (draftFilters.normatives.length > 0) newFilters.push({ type: "Normativos", values: draftFilters.normatives });
    if (draftFilters.departments.length > 0) newFilters.push({ type: "Departamentos", values: draftFilters.departments });

    if (draftFilters.startDate) newFilters.push({ type: "Data Inicial", values: [draftFilters.startDate] });
    if (draftFilters.endDate) newFilters.push({ type: "Data Final", values: [draftFilters.endDate] });
    
    setSelectedFilters(newFilters);

    if (onApplyFilters) {
      onApplyFilters({
        StartDate: draftFilters.startDate,
        EndDate: draftFilters.endDate,
      });
    }

    toggleDrawer();
  };

  const removeFilter = (index) => {
    setSelectedFilters((prev) => {
      const filterToRemove = prev[index];
      
      setDraftFilters((prevDraft) => {
        const updatedDraft = { ...prevDraft };
        const filterType = filterToRemove.type;
        
        // Mapa reverso: Nome do Chip -> Chave no State
        const mapTypeToKey = {
          "Responsável": "responsible",
          "Tipo": "type",
          "KRI": "kri",
          "Empresas": "companies",
          "Riscos": "risks",
          "Subprocessos": "processesBottoms",
          "LGPD": "lgpds",
          "Deficiências": "deficiencies",
          "Contas Contábeis": "ledgerAccounts",
          "Plataformas": "platforms",
          "Atividades de Info": "informationActivities",
          "Controles": "controls",
          "Incidentes": "incidents",
          "Planos de Ação": "actionPlans",
          "Normativos": "normatives",
          "Departamentos": "departments"
        };

        const key = mapTypeToKey[filterType];
        if (key) {
           updatedDraft[key] = updatedDraft[key].filter(
            (value) => !filterToRemove.values.includes(value)
          );
        } else if (filterType === "Data Inicial") {
            updatedDraft.startDate = null;
        } else if (filterType === "Data Final") {
            updatedDraft.endDate = null;
        }

        return updatedDraft;
      });
  
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveAllFilters = () => {
    setSelectedFilters([]);
    setGlobalFilter("");
    setDraftFilters({
      responsible: [],
      type: [],
      kri: [],
      companies: [],
      risks: [],
      processesBottoms: [],
      lgpds: [],
      deficiencies: [],
      ledgerAccounts: [],
      platforms: [],
      informationActivities: [],
      controls: [],
      incidents: [],
      actionPlans: [],
      normatives: [],
      departments: [],
      startDate: null,
      endDate: null,
    });
    if (onApplyFilters) {
      onApplyFilters({
        StartDate: null,
        EndDate: null,
      });
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return selectedFilters.every((filter) => {
        const filterType = filter.type;
        const filterValues = filter.values;

        if (filterType === "Data Inicial" || filterType === "Data Final") return true;

        // Filtros String
        if (filterType === "Responsável") return filterValues.includes(item.responsible);
        if (filterType === "Tipo") return filterValues.includes(item.type);
        if (filterType === "KRI") return filterValues.includes(item.kri);

        // Filtros Array
        const arrayFilters = {
          "Empresas": item.companies,
          "Riscos": item.risks,
          "Subprocessos": item.processesBottoms,
          "LGPD": item.lgpds,
          "Deficiências": item.deficiencies,
          "Contas Contábeis": item.ledgerAccounts,
          "Plataformas": item.platforms,
          "Atividades de Info": item.informationActivities,
          "Controles": item.controls,
          "Incidentes": item.incidents,
          "Planos de Ação": item.actionPlans,
          "Normativos": item.normatives,
          "Departamentos": item.departments,
        };

        if (arrayFilters[filterType]) {
          return filterValues.some(val => (arrayFilters[filterType] || []).includes(val));
        }

        return true;
      });
    });
  }, [data, selectedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter, columnVisibility },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
  });

  useEffect(
    () =>
      setColumnVisibility({
        name: true,
        code: true,
        type: true,
        responsible: true,
        kri: false,
        companies: true,
        risks: false,
        processesBottoms: false,
        lgpds: false,
        deficiencies: false,
        ledgerAccounts: false,
        platforms: false,
        informationActivities: false,
        controls: false,
        incidents: false,
        actionPlans: false,
        normatives: false,
        departments: false,
        date: false,
        actions: true 
      }),
    []
  );

  const getAllColumnsFiltered = () => {
    return table.getAllLeafColumns().filter((c) => !["actions"].includes(c.id));
  };
  
  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginRight: "0px",
    marginLeft: "7px",
  };

  useEffect(() => {
    const markInstance = new Mark(tableRef.current);
    if (globalFilter) {
      markInstance.unmark({
        done: () => {
          markInstance.mark(globalFilter);
        },
      });
    } else {
      markInstance.unmark();
    }
  }, [globalFilter, table.getRowModel().rows]);


  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "#F1F1F1E5",
          paddingBottom: 2,
          paddingTop: 2,
          paddingRight: 2,
          paddingLeft: 2,
          marginBottom: 3,
          ...(matchDownSM && {
            "& .MuiOutlinedInput-root, & .MuiFormControl-root": {
              width: "110%",
            },
          }),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: getAllColumnsFiltered,
            }}
          />
          <DebouncedInput
            value={globalFilter ?? ""}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder={`Pesquise pelo nome`}
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
              backgroundColor: "#FFFFFF",
            }}
          />
          <Button
            onClick={() => toggleDrawer(true)}
            startIcon={
              <FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />
            }
            style={{
              width: "90px",
              color: "#00000080",
              backgroundColor: 'white',
              fontSize: "13px",
              marginLeft: 24,
              fontWeight: 400,
              height: "33px",
              borderRadius: "8px",
              border: "0.6px solid #00000040 ",
            }}
          >
            Filtros
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
           <div style={{verticalDividerStyle}}></div>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                ml: 0.75,
              }}
            >
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigation(`/processos/criar`, { state: { indoPara: "NovoProcesso" } });
                }}
                startIcon={<PlusOutlined />}
                style={{ borderRadius: "20px", height: "32px" }}
              >
                Novo
              </Button>
            </Box>
          </Stack>
                <Stack>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                ml: 0.75,
              }}
            >
              <Button
                variant="outlined"
                onClick={onExportExcel}
                startIcon={<DownloadOutlined />}
                disabled={isLoading}
                style={{ borderRadius: "20px", height: "32px" }}
              >
                Exportar Excel
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Stack>

      <Box mb={2}>
        {selectedFilters.map((filter, index) => (
          <Chip
            key={index}
            label={
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{ color: "#1C5297", fontWeight: 600, marginRight: "4px" }}
                >
                  {filter.type}:
                </Typography>
                <Typography sx={{ color: "#1C5297", fontWeight: 400 }}>
                  {filter.values.join(", ")}
                </Typography>
              </Box>
            }
            onDelete={() => removeFilter(index)}
            sx={{
              margin: 0.5,
              backgroundColor: "#1C52971A",
              border: "0.7px solid #1C529733",
            }}
          />
        ))}
        {selectedFilters.length > 0 && (
          <Chip
            label="Limpar Filtros"
            onClick={handleRemoveAllFilters}
            sx={{
              margin: 0.5,
              backgroundColor: "transparent",
              color: "#1C5297",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          />
        )}
      </Box>

      {/* Drawer para filtros */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer} PaperProps={{ sx: { width: 670 } }}>
        <Box sx={{ width: 650, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box component="h2" sx={{ color: '#1C5297', fontWeight: 600, fontSize: '16px' }}>Filtros</Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: '#1C5297', fontSize: '18px' }} />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            {/* Responsável */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Responsável</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={responsibleOptions}
                  value={draftFilters.responsible}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, responsible: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Tipo */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Tipo</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={typeOptions}
                  value={draftFilters.type}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, type: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
            {/* KRI */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>KRI</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={kriOptions}
                  value={draftFilters.kri}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, kri: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Empresas */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Empresas</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={companiesOptions}
                  value={draftFilters.companies}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, companies: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
            {/* Riscos */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Riscos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={risksOptions}
                  value={draftFilters.risks}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, risks: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Subprocessos */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Subprocessos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={processesBottomsOptions}
                  value={draftFilters.processesBottoms}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, processesBottoms: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
            {/* LGPD */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>LGPD</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={lgpdsOptions}
                  value={draftFilters.lgpds}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, lgpds: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Controles */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Controles</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={controlsOptions}
                  value={draftFilters.controls}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, controls: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Deficiências */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Deficiências</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={deficienciesOptions}
                  value={draftFilters.deficiencies}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, deficiencies: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
             {/* Contas Contábeis */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Contas Contábeis</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ledgerAccountsOptions}
                  value={draftFilters.ledgerAccounts}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, ledgerAccounts: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Plataformas */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Plataformas</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={platformsOptions}
                  value={draftFilters.platforms}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, platforms: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Atividades de Informação */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Atividades de Informação</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={informationActivitiesOptions}
                  value={draftFilters.informationActivities}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, informationActivities: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
             {/* Incidentes */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Incidentes</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={incidentsOptions}
                  value={draftFilters.incidents}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, incidents: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Planos de Ação */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Planos de Ação</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={actionPlansOptions}
                  value={draftFilters.actionPlans}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, actionPlans: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Normativos */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Normativos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={normativesOptions}
                  value={draftFilters.normatives}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, normatives: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Departamentos */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Departamentos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={departmentsOptions}
                  value={draftFilters.departments}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, departments: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Data Inicial</InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.startDate || ''}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Data Final</InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.endDate || ''}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={toggleDrawer}>Cancelar</Button>
            <Button variant="contained" onClick={applyFilters}>Aplicar</Button>
          </Stack>
        </Box>
      </Drawer >

      {/* Tabela */}
      <MainCard content={false}>
        <ScrollX>
          <div ref={tableRef}>
            <Stack>
              <RowSelection selected={Object.keys(rowSelection).length} />
              <TableContainer>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        sx={{
                          backgroundColor: isDarkMode ? "#14141" : "#F4F4F4",
                          color: isDarkMode
                            ? "rgba(0, 0, 0, 0.6)"
                            : "rgba(255, 255, 255, 0.87)",
                        }}
                      >
                        {headerGroup.headers.map((header) => {
                          if (
                            header.column.columnDef.meta !== undefined &&
                            header.column.getCanSort()
                          ) {
                            Object.assign(header.column.columnDef.meta, {
                              className:
                                header.column.columnDef.meta.className +
                                " cursor-pointer prevent-select",
                            });
                          }

                          return (
                            <TableCell
                              sx={{
                                fontSize: "11px",
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.87)"
                                  : "rgba(0, 0, 0, 0.6)",
                              }}
                              key={header.id}
                              {...header.column.columnDef.meta}
                              onClick={header.column.getToggleSortingHandler()}
                              {...(header.column.getCanSort() &&
                                header.column.columnDef.meta === undefined && {
                                className: "cursor-pointer prevent-select",
                              })}
                            >
                              {header.isPlaceholder ? null : (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Box>
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                  </Box>
                                  {header.column.getCanSort() && (
                                    <HeaderSort column={header.column} />
                                  )}
                                </Stack>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          sx={{ textAlign: "center" }}
                        >
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : data ? (
                      data.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <Fragment key={row.id}>
                            <TableRow
                              sx={{
                                "&:last-child td": { borderBottom: "none" },
                                backgroundColor: isDarkMode ? "#14141" : "#fff",
                              }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  {...cell.column.columnDef.meta}
                                  sx={{
                                    overflow: "hidden",
                                    color: isDarkMode
                                      ? "rgba(255, 255, 255, 0.87)"
                                      : "rgba(0, 0, 0, 0.65)",
                                    textOverflow: "ellipsis",
                                    fontFamily:
                                      '"Open Sans", Helvetica, sans-serif',
                                    fontSize: "13px",
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                    lineHeight: "normal",
                                  }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          </Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyTable msg="Processos não encontrados" />
                          </TableCell>
                        </TableRow>
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          sx={{ textAlign: "left" }}
                        >
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <TablePagination
                    {...{
                      setPageSize: table.setPageSize,
                      setPageIndex: table.setPageIndex,
                      getState: table.getState,
                      getPageCount: table.getPageCount,
                      totalItems: totalRows,
                      recordType: recordType,
                    }}
                  />
                </Box>
              </>
            </Stack>
          </div>
        </ScrollX>
      </MainCard>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  totalRows: PropTypes.number,
  isLoading: PropTypes.bool,
  onApplyFilters: PropTypes.func,
  onExportExcel: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const handleToggleActive = async () => {
    handleClose(); // Fecha o menu
    const authToken = token || localStorage.getItem("access_token");

    try {
      // 1. GET: Busca os dados completos do processo
      // Precisamos disso pois o PUT exige o objeto completo, não apenas o status
      const responseGet = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/processes/${row.original.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!responseGet.ok) throw new Error("Erro ao buscar dados do processo.");
      const data = await responseGet.json();

      // 2. PREPARAR PAYLOAD: Mapeamento idêntico ao novoProcesso.js
      // O GET retorna objetos (ex: companies: [{idCompany...}]), mas o PUT pede IDs (idCompanies: [1...])
      const payload = {
        idProcess: data.idProcess,
        active: !data.active, // << AQUI ESTÁ A ALTERAÇÃO DO STATUS >>
        name: data.name,
        code: data.code,
        description: data.description,
        files: data.files || [], // Mantém arquivos existentes
        idProcessType: data.idProcessType || null,
        idProcessSuperior: data.idProcessSuperior || null,
        
        // Mapeamentos de Arrays de Objetos para Arrays de IDs
        idCompanies: Array.isArray(data.companies) ? data.companies.map((u) => u.idCompany) : [],
        idDepartments: Array.isArray(data.departments) ? data.departments.map((u) => u.idDepartment) : [],
        idProcessBottoms: Array.isArray(data.processBottoms) ? data.processBottoms.map((u) => u.idProcessBottom) : [],
        
        // Processos Anterior/Posterior (novoProcesso.js envia apenas o primeiro ID ou null)
        idProcessPrevious: Array.isArray(data.idProcessPrevious) && data.idProcessPrevious.length > 0 
            ? data.idProcessPrevious[0].idProcess 
            : null,
        idProcessNext: Array.isArray(data.idProcessNext) && data.idProcessNext.length > 0 
            ? data.idProcessNext[0].idProcess 
            : null,

        // Campos que já vêm como IDs ou null no GET (baseado no novoProcesso.js)
        idLgpds: data.idLgpds || [],
        idKri: data.idKri || null,
        idResponsible: data.idResponsible || null,
        idDeficiencies: data.idDeficiencies || [],
        idIncidents: data.idIncidents || [],
        idActionPlans: data.idActionPlans || [],
        idRisks: data.idRisks || [],
        idLedgerAccounts: data.idLedgerAccounts || [],
      };

      // 3. PUT: Envia a atualização
      const responsePut = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/processes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!responsePut.ok) {
        throw new Error("Erro ao atualizar status do processo.");
      }

      enqueueSnackbar(
        `Processo ${data.active ? "inativado" : "ativado"} com sucesso!`,
        { variant: "success" }
      );
      
      // Atualiza a tabela
      refreshData();

    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao alterar o status do processo.", { variant: "error" });
    } 
  };

  const handleDelete = async () => {
    try {
      // Endpoint ajustado para Processos
      const response = await fetch(
        `${API_COMMAND}/api/Processos/${row.original.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        enqueueSnackbar(`Processo ${row.original.name} excluído.`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
        refreshData();
      } else {
        const errorBody = await response.text();
        throw new Error(
          `Falha ao excluir o processo: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      setOpenErrorDialog(true);
    }

    handleDeleteDialogClose();
  };

  const buttonStyle = {
    borderRadius: 8,
    backgroundColor: "#1C52970D",
    width: "30px",
    height: "30px",
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const isActive = row.original.active !== false;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0}
    >
      <IconButton
        aria-describedby={id}
        color="primary"
        onClick={handleClick}
        style={buttonStyle}
      >
        <MoreVertIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack>
          <Button
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/processos/criar`, {
                state: {
                  indoPara: "NovoProcesso",
                  dadosApi,
                },
              });
              handleClose();
            }}
            color="primary"
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Editar
          </Button>

          {/* Botão de Ativar/Inativar */}
          <Button
            onClick={handleToggleActive}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {isActive ? "Inativar" : "Ativar"}
          </Button>

          {/* <Button
            onClick={() => {
               setOpenDeleteDialog(true);
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Excluir
          </Button> */}
          
        </Stack>
      </Popover>
      
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "290px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#ED5565",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
                "&:hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "white",
                },
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Excluir
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleDeleteDialogClose}
            sx={{
              color: "rgba(255, 255, 255, 1)",
              "&:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "white",
              },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Tem certeza que deseja excluir o processo "{row.original.name}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDelete}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#ED5565",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, excluir
          </Button>
          <Button
            onClick={handleDeleteDialogClose}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "290px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#F69B50",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
                "&:hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "white",
                },
              }}
            >
              <FontAwesomeIcon icon={faExclamation} />
            </IconButton>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Erro na Exclusão
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={() => setOpenErrorDialog(false)}
            sx={{
              color: "rgba(255, 255, 255, 1)",
              "&:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "white",
              },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Não foi possível excluir.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenErrorDialog(false)}
            style={{
              marginTop: "-55px",
              width: "64px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#F69B50",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

// ==============================|| LISTAGEM ||============================== //

// ==============================|| COMPONENTE PRINCIPAL ||============================== //

const ListagemProcessos = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [backendFilters, setBackendFilters] = useState({});
  const {
    acoesJudiciais: resultData,
    isLoading,
  } = useGetProcessos({ ...formData, ...backendFilters }, processoSelecionadoId);

  // Extrai o array 'reportProcesss' do objeto retornado
  const lists = resultData || [];

  const handleBackendFiltersChange = (newFilters) => {
    setBackendFilters(newFilters);
  };
  
  const totalRows = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshOrgaos = () => {
    setFormData((currentData) => ({
      ...currentData,
      refreshCount: currentData.refreshCount + 1,
    }));
  };

  useEffect(() => {
    const refreshHandler = () => {
      refreshOrgaos();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
    };
  }, []);

  const handleClose = () => {
    setOpen(!open);
  };

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleExportExcel = () => {
    setFormData((prev) => ({
      ...prev,
      ...backendFilters,
      GenerateExcel: true,
      refreshCount: prev.refreshCount + 1
    }));
  };

  // Definição das colunas baseada no JSON fornecido
  const columns = useMemo(
    () => [
      {
        header: "Processo",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: '13px', cursor: "pointer", fontWeight: 600, color: theme.palette.primary.main }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/processos/criar`, {
                state: { indoPara: "NovoProcesso", dadosApi },
              });
            }}
          >
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: "Código",
        accessorKey: "code",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.code}</Typography>,
      },
      {
        header: "Tipo",
        accessorKey: "type",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.type}</Typography>,
      },
      {
        header: "Responsável",
        accessorKey: "responsible",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.responsible}</Typography>,
      },
      {
        header: "KRI",
        accessorKey: "kri",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.kri}</Typography>,
      },
      
      // Colunas tipo Array
      {
        header: "Empresas",
        accessorKey: "companies",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.companies || []).join(", ")}</Typography>,
      },
      {
        header: "Riscos",
        accessorKey: "risks",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.risks || []).join(", ")}</Typography>,
      },
      {
        header: "Subprocessos",
        accessorKey: "processesBottoms",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.processesBottoms || []).join(", ")}</Typography>,
      },
      {
        header: "LGPD",
        accessorKey: "lgpds",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.lgpds || []).join(", ")}</Typography>,
      },
      {
        header: "Deficiências",
        accessorKey: "deficiencies",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.deficiencies || []).join(", ")}</Typography>,
      },
      {
        header: "Contas Contábeis",
        accessorKey: "ledgerAccounts",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.ledgerAccounts || []).join(", ")}</Typography>,
      },
      {
        header: "Plataformas",
        accessorKey: "platforms",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.platforms || []).join(", ")}</Typography>,
      },
      {
        header: "Atividades de Info",
        accessorKey: "informationActivities",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.informationActivities || []).join(", ")}</Typography>,
      },
      {
        header: "Controles",
        accessorKey: "controls",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.controls || []).join(", ")}</Typography>,
      },
      {
        header: "Incidentes",
        accessorKey: "incidents",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.incidents || []).join(", ")}</Typography>,
      },
      {
        header: "Planos de Ação",
        accessorKey: "actionPlans",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.actionPlans || []).join(", ")}</Typography>,
      },
      {
        header: "Normativos",
        accessorKey: "normatives",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.normatives || []).join(", ")}</Typography>,
      },
      {
        header: "Departamentos",
        accessorKey: "departments",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.departments || []).join(", ")}</Typography>,
      },
      {
        header: "Data",
        accessorKey: "date",
        cell: ({ row }) => {
          try {
            return <Typography sx={{ fontSize: '13px' }}>{new Date(row.original.date).toLocaleDateString()}</Typography>;
          } catch {
            return <Typography sx={{ fontSize: '13px' }}>—</Typography>;
          }
        },
      },

      // Coluna de ações (não deve aparecer no seletor)
      {
        id: "actions",
        header: " ",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row} refreshData={refreshOrgaos} />,
      },
    ],
    [theme]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  useEffect(() => {
    // Ao finalizar a chamada de relatório, resetamos o flag para evitar novas descargas
    if (!isLoading && formData.GenerateExcel) {
      setFormData((prev) => ({ ...prev, GenerateExcel: false }));
    }
  }, [isLoading, formData.GenerateExcel]);

  return (
    <>
      {isInitialLoad && isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Box>
          {lists && (
            <ReactTable
              {...{
                data: lists,
                columns,
                modalToggler: () => {
                  setCustomerModal(true);
                  setSelectedCustomer(null);
                },
                totalRows,
                onFormDataChange: handleFormDataChange,
                isLoading,
                refreshData: refreshOrgaos,
                onApplyFilters: handleBackendFiltersChange,
                onExportExcel: handleExportExcel,
              }}
            />
          )}
        </Box>
      )}
      <AlertCustomerDelete
        id={customerDeleteId}
        title={customerDeleteId}
        open={open}
        handleClose={handleClose}
      />
      <CustomerModal
        open={customerModal}
        modalToggler={setCustomerModal}
        customer={selectedCustomer}
      />
    </>
  );
};

export default ListagemProcessos;