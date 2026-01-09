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
import { useGetRiscos } from "../../../api/riscos";
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
  FormControlLabel,
  Checkbox,
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
  faBan,
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
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// assets
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  let cellValue = row.getValue(columnId);

  // CORREÇÃO: Verifica se é undefined OU null antes de prosseguir
  if (cellValue === undefined || cellValue === null || value === undefined) return false;

  const normalizeText = (text) => {
    // Segurança adicional: se por acaso o texto for null, retorna string vazia
    if (text === null || text === undefined) return "";

    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);
  return cellValue.includes(valueStr);
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, totalRows, isLoading, onApplyFilters, onExportExcel }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Riscos";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Opções para os filtros
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [treatmentOptions, setTreatmentOptions] = useState([]);
  
  // Opções de Arrays
  const [processOptions, setProcessOptions] = useState([]);
  const [controlsOptions, setControlsOptions] = useState([]);
  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [normativesOptions, setNormativesOptions] = useState([]);
  const [factorsOptions, setFactorsOptions] = useState([]);
  const [incidentsOptions, setIncidentsOptions] = useState([]);
  const [causesOptions, setCausesOptions] = useState([]);
  const [impactsOptions, setImpactsOptions] = useState([]);
  const [krisOptions, setKrisOptions] = useState([]);
  const [threatsOptions, setThreatsOptions] = useState([]);
  const [frameworksOptions, setFrameworksOptions] = useState([]);
  const [actionPlansOptions, setActionPlansOptions] = useState([]); // Novo

  const [draftFilters, setDraftFilters] = useState({
    name: [], 
    responsible: [],
    category: [],
    treatment: [],
    process: [],
    controls: [],
    departments: [],
    normatives: [],
    factors: [],
    incidents: [],
    causes: [],
    impacts: [],
    kris: [],
    threats: [],
    frameworks: [],
    actionPlans: [], // Novo
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
    setCategoryOptions(getUniqueValues('category'));
    setResponsibleOptions(getUniqueValues('responsible'));
    setTreatmentOptions(getUniqueValues('treatment'));

    // Campos Array
    setProcessOptions(getUniqueValues('process', true));
    setControlsOptions(getUniqueValues('controls', true));
    setDepartmentsOptions(getUniqueValues('departments', true));
    setNormativesOptions(getUniqueValues('normatives', true));
    setFactorsOptions(getUniqueValues('factors', true));
    setIncidentsOptions(getUniqueValues('incidents', true));
    setCausesOptions(getUniqueValues('causes', true));
    setImpactsOptions(getUniqueValues('impacts', true));
    setKrisOptions(getUniqueValues('kris', true));
    setThreatsOptions(getUniqueValues('threats', true));
    setFrameworksOptions(getUniqueValues('frameworks', true));
    setActionPlansOptions(getUniqueValues('actionPlans', true)); // Novo
  }, [data]);

  const applyFilters = () => {
    const newFilters = [];
    
    // Mapeamento de filtros para exibição
    if (draftFilters.responsible.length > 0) newFilters.push({ type: "Responsável", values: draftFilters.responsible });
    if (draftFilters.category.length > 0) newFilters.push({ type: "Categoria", values: draftFilters.category });
    if (draftFilters.treatment.length > 0) newFilters.push({ type: "Tratamento", values: draftFilters.treatment });
    
    // Arrays
    if (draftFilters.process.length > 0) newFilters.push({ type: "Processos", values: draftFilters.process });
    if (draftFilters.controls.length > 0) newFilters.push({ type: "Controles", values: draftFilters.controls });
    if (draftFilters.departments.length > 0) newFilters.push({ type: "Departamentos", values: draftFilters.departments });
    if (draftFilters.normatives.length > 0) newFilters.push({ type: "Normativos", values: draftFilters.normatives });
    if (draftFilters.factors.length > 0) newFilters.push({ type: "Fatores", values: draftFilters.factors });
    if (draftFilters.incidents.length > 0) newFilters.push({ type: "Incidentes", values: draftFilters.incidents });
    if (draftFilters.causes.length > 0) newFilters.push({ type: "Causas", values: draftFilters.causes });
    if (draftFilters.impacts.length > 0) newFilters.push({ type: "Impactos", values: draftFilters.impacts });
    if (draftFilters.kris.length > 0) newFilters.push({ type: "KRIs", values: draftFilters.kris });
    if (draftFilters.threats.length > 0) newFilters.push({ type: "Ameaças", values: draftFilters.threats });
    if (draftFilters.frameworks.length > 0) newFilters.push({ type: "Frameworks", values: draftFilters.frameworks });
    if (draftFilters.actionPlans.length > 0) newFilters.push({ type: "Planos de Ação", values: draftFilters.actionPlans }); // Novo

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
        
        // Mapa reverso atualizado
        const mapTypeToKey = {
          "Responsável": "responsible",
          "Categoria": "category",
          "Tratamento": "treatment",
          "Processos": "process",
          "Controles": "controls",
          "Departamentos": "departments",
          "Normativos": "normatives",
          "Fatores": "factors",
          "Incidentes": "incidents",
          "Causas": "causes",
          "Impactos": "impacts",
          "KRIs": "kris",
          "Ameaças": "threats",
          "Frameworks": "frameworks",
          "Planos de Ação": "actionPlans", // Novo
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
      category: [],
      treatment: [],
      process: [],
      controls: [],
      departments: [],
      normatives: [],
      factors: [],
      incidents: [],
      causes: [],
      impacts: [],
      kris: [],
      threats: [],
      frameworks: [],
      actionPlans: [], // Novo
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

        if (filterType === "Responsável") return filterValues.includes(item.responsible);
        if (filterType === "Categoria") return filterValues.includes(item.category);
        if (filterType === "Tratamento") return filterValues.includes(item.treatment);

        const arrayFilters = {
          "Processos": item.process,
          "Controles": item.controls,
          "Departamentos": item.departments,
          "Normativos": item.normatives,
          "Fatores": item.factors,
          "Incidentes": item.incidents,
          "Causas": item.causes,
          "Impactos": item.impacts,
          "KRIs": item.kris,
          "Ameaças": item.threats,
          "Frameworks": item.frameworks,
          "Planos de Ação": item.actionPlans, // Novo
        };

        if (arrayFilters[filterType]) {
          return filterValues.some(val => (arrayFilters[filterType] || []).includes(val));
        }

        return true;
      });
    });
  }, [data, selectedFilters]);

  // Restante do código da tabela (useReactTable, useEffect de visibilidade, etc)...
  // ... (código existente da tabela omitido para brevidade até o Drawer)

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
        category: true,
        responsible: true,
        treatment: true,
        process: false,
        controls: false,
        departments: false,
        normatives: false,
        factors: false,
        incidents: false,
        causes: false,
        impacts: false,
        kris: false,
        threats: false,
        frameworks: false,
        date: false,
        actionPlans: false, // Novo (Opcional, se houver coluna para isso)
        actions: true 
      }),
    []
  );

  const getAllColumnsFiltered = () => {
    return table.getAllLeafColumns().filter((c) => !["actions"].includes(c.id));
  };
  
  // Style config (mantido do original)
  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginRight: "0px",
    marginLeft: "7px",
  };

  // Mark.js effect (mantido do original)
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
                  navigation(`/riscos/criar`, { state: { indoPara: "NovoRisco" } });
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

            {/* Categoria */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Categoria</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={categoryOptions}
                  value={draftFilters.category}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, category: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Tratamento */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Tratamento</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={treatmentOptions}
                  value={draftFilters.treatment}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, treatment: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Processos */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Processos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={processOptions}
                  value={draftFilters.process}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, process: value }))}
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

            {/* Fatores */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Fatores</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={factorsOptions}
                  value={draftFilters.factors}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, factors: value }))}
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

            {/* Causas */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Causas</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={causesOptions}
                  value={draftFilters.causes}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, causes: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Impactos */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Impactos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={impactsOptions}
                  value={draftFilters.impacts}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, impacts: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* KRIs */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>KRIs</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={krisOptions}
                  value={draftFilters.kris}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, kris: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Ameaças */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Ameaças</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={threatsOptions}
                  value={draftFilters.threats}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, threats: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Frameworks */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Frameworks</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={frameworksOptions}
                  value={draftFilters.frameworks}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, frameworks: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

             {/* Planos de Ação (NOVO) */}
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
                            <EmptyTable msg="Riscos não encontrados" />
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
  const [loadingStatus, setLoadingStatus] = useState(false); // Loading state

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // --- NOVA LÓGICA: ATIVAR/INATIVAR ---
  const handleToggleActive = async () => {
    handleClose(); // Fecha o menu
    setLoadingStatus(true);
    const authToken = token || localStorage.getItem("access_token");

    try {
      // 1. GET: Busca os dados completos do risco
      const responseGet = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/risks/${row.original.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!responseGet.ok) throw new Error("Erro ao buscar dados do risco.");
      const data = await responseGet.json();

      // 2. PREPARAR PAYLOAD: Mapeamento baseado no novoRisco.js
      // Arrays de Objetos -> Arrays de IDs
      // Arrays de IDs diretos -> Mantém
      
      const payload = {
        idRisk: data.idRisk,
        active: !data.active, // << INVERTE O STATUS >>
        
        // Campos simples
        code: data.code,
        name: data.name,
        description: data.description,
        treatmentDescription: data.treatmentDescription,
        date: data.date ? data.date : null, // A API costuma aceitar o formato ISO que já vem
        idResponsible: data.idResponsible || null,
        idCategory: data.idCategory || null,
        idTreatment: data.idTreatment || null,

        // Campos que já vêm como Array de IDs no GET (baseado no novoRisco.js)
        idActionPlans: Array.isArray(data.idActionPlans) ? data.idActionPlans : [],
        idControls: Array.isArray(data.idControls) ? data.idControls : [],
        idFrameworks: Array.isArray(data.idFrameworks) ? data.idFrameworks : [],
        idProcesses: Array.isArray(data.idProcesses) ? data.idProcesses : [],
        idThreats: Array.isArray(data.idThreats) ? data.idThreats : [],

        // Campos que vêm como Array de Objetos e precisam de Map para IDs
        idCauses: Array.isArray(data.causes) ? data.causes.map((u) => u.idCause) : [],
        idDepartments: Array.isArray(data.departments) ? data.departments.map((u) => u.idDepartment) : [],
        idFactors: Array.isArray(data.factors) ? data.factors.map((u) => u.idFactor) : [],
        idImpacts: Array.isArray(data.impacts) ? data.impacts.map((u) => u.idImpact) : [],
        idIncidents: Array.isArray(data.incidents) ? data.incidents.map((u) => u.idIncident) : [],
        idKrises: Array.isArray(data.krises) ? data.krises.map((u) => u.idKri) : [],
        idNormatives: Array.isArray(data.normatives) ? data.normatives.map((u) => u.idNormative) : [],
        idRiskAssociates: Array.isArray(data.riskAssociates) ? data.riskAssociates.map((u) => u.idRiskAssociate) : [],
        idStrategicGuidelines: Array.isArray(data.strategicGuidelines) ? data.strategicGuidelines.map((u) => u.idStrategicGuideline) : [],

        // Arquivos (mantém strings ou extrai path)
        files: Array.isArray(data.files) ? data.files.map(f => (typeof f === 'string' ? f : f.path)) : [],
      };

      // 3. PUT: Envia a atualização
      const responsePut = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/risks`,
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
        throw new Error("Erro ao atualizar status do risco.");
      }

      enqueueSnackbar(
        `Risco ${data.active ? "inativado" : "ativado"} com sucesso!`,
        { variant: "success" }
      );
      
      refreshData();

    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao alterar o status do risco.", { variant: "error" });
    } finally {
      setLoadingStatus(false);
    }
  };
  // -------------------------------------

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_COMMAND}/api/Riscos/${row.original.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        enqueueSnackbar(`Risco ${row.original.name} excluído.`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        refreshData();
      } else {
        const errorBody = await response.text();
        throw new Error(
          `Falha ao excluir o risco: ${response.status} ${response.statusText} - ${errorBody}`
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
  
  // Verifica status atual para texto do botão (assume true se undefined)
  const isActive = row.original.active !== false;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0}
    >
      {loadingStatus ? (
        <CircularProgress size={20} />
      ) : (
        <IconButton
          aria-describedby={id}
          color="primary"
          onClick={handleClick}
          style={buttonStyle}
        >
          <MoreVertIcon />
        </IconButton>
      )}

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
              navigation(`/riscos/criar`, {
                state: {
                  indoPara: "NovoRisco",
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

          {/* Botão Ativar/Inativar */}
          <Button
            onClick={handleToggleActive}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {isActive ? "Inativar" : "Ativar"}
          </Button>

          {/* Botão Excluir (Descomente se necessário) */}
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
            Tem certeza que deseja excluir o risco "{row.original.name}"?
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

const ListagemEmpresa = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [backendFilters, setBackendFilters] = useState({});
  const {
    acoesJudiciais: resultData,
    isLoading,
  } = useGetRiscos({ ...formData, ...backendFilters }, processoSelecionadoId);

  // Extrai o array 'reportRisks' do objeto retornado
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
        header: "Risco",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: '13px', cursor: "pointer", fontWeight: 600, color: theme.palette.primary.main }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/riscos/criar`, {
                state: { indoPara: "NovoRisco", dadosApi },
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
        header: "Responsável",
        accessorKey: "responsible",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.responsible}</Typography>,
      },
      {
        header: "Categoria",
        accessorKey: "category",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.category}</Typography>,
      },
      {
        header: "Tratamento",
        accessorKey: "treatment",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{row.original.treatment}</Typography>,
      },
      
      // Colunas tipo Array
      {
        header: "Processos",
        accessorKey: "process",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.process || []).join(", ")}</Typography>,
      },
      {
        header: "Controles",
        accessorKey: "controls",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.controls || []).join(", ")}</Typography>,
      },
      {
        header: "Departamentos",
        accessorKey: "departments",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.departments || []).join(", ")}</Typography>,
      },
      {
        header: "Normativos",
        accessorKey: "normatives",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.normatives || []).join(", ")}</Typography>,
      },
      {
        header: "Fatores",
        accessorKey: "factors",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.factors || []).join(", ")}</Typography>,
      },
      {
        header: "Incidentes",
        accessorKey: "incidents",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.incidents || []).join(", ")}</Typography>,
      },
      {
        header: "Causas",
        accessorKey: "causes",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.causes || []).join(", ")}</Typography>,
      },
      {
        header: "Impactos",
        accessorKey: "impacts",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.impacts || []).join(", ")}</Typography>,
      },
      {
        header: "KRIs",
        accessorKey: "kris",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.kris || []).join(", ")}</Typography>,
      },
      {
        header: "Ameaças",
        accessorKey: "threats",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.threats || []).join(", ")}</Typography>,
      },
      {
        header: "Frameworks",
        accessorKey: "frameworks",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.frameworks || []).join(", ")}</Typography>,
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

export default ListagemEmpresa;