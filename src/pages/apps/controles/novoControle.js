/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetControles } from "../../../api/controles";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import emitter from "../tela2/eventEmitter";
import MainCard from "../../../components/MainCard";

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

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import ScrollX from "../../../components/ScrollX";
import IconButton from "../../../components/@extended/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import Mark from "mark.js";
import { faXmark, faBan } from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
  SelectColumnVisibility,
} from "../../../components/third-party/react-table";
import { useToken } from "../../../api/TokenContext";

import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  let cellValue = row.getValue(columnId);
  if (cellValue === undefined || value === undefined) return false;

  const normalizeText = (text) => {
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

function ReactTable({
  data,
  columns,
  processosTotal,
  isLoading,
  onApplyFilters,
  onExportExcel,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Controles";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [controlesOptions, setControlesOptions] = useState([]);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [processOptions, setProcessOptions] = useState([]);
  const [executionOptions, setExecutionOptions] = useState([]);
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [risksOptions, setRisksOptions] = useState([]);
  const [platformsOptions, setPlatformsOptions] = useState([]);
  const [informationActivitiesOptions, setInformationActivitiesOptions] =
    useState([]);
  const [assertionsOptions, setAssertionsOptions] = useState([]);
  const [cvarsOptions, setCvarsOptions] = useState([]);
  const [deficienciesOptions, setDeficienciesOptions] = useState([]);
  const [ledgerAccountsOptions, setLedgerAccountsOptions] = useState([]);
  const [elementCososOptions, setElementCososOptions] = useState([]);
  const [draftFilters, setDraftFilters] = useState({
    controle: [],
    responsible: [],
    type: [],
    process: [],
    execution: [],
    classification: [],
    risks: [],
    platforms: [],
    informationActivities: [],
    assertions: [],
    cvars: [],
    deficiencies: [],
    ledgerAccounts: [],
    elementCosos: [],
    startDate: null,
    endDate: null,
    hasRisks: false,
  });

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const getUniqueValues = (key, isArray = false) => {
      const values = data.flatMap((item) => {
        const value = item[key];
        if (isArray && Array.isArray(value)) {
          return value.filter((v) => v !== null && v !== undefined);
        }
        return value !== null && value !== undefined ? [value] : [];
      });
      return [...new Set(values)].sort();
    };

    setControlesOptions(getUniqueValues("name"));
    setResponsibleOptions(getUniqueValues("responsible"));
    setTypeOptions(getUniqueValues("type"));
    setProcessOptions(getUniqueValues("process"));
    setExecutionOptions(getUniqueValues("execution"));
    setClassificationOptions(getUniqueValues("classification"));
    setRisksOptions(getUniqueValues("risks", true));
    setPlatformsOptions(getUniqueValues("platforms", true));
    setInformationActivitiesOptions(
      getUniqueValues("informationActivities", true)
    );
    setAssertionsOptions(getUniqueValues("assertions", true));
    setCvarsOptions(getUniqueValues("cvars", true));
    setDeficienciesOptions(getUniqueValues("deficiencies", true));
    setLedgerAccountsOptions(getUniqueValues("ledgerAccounts", true));
    setElementCososOptions(getUniqueValues("elementCosos", true));
  }, [data]);

  const applyFilters = () => {
    const newFilters = [];
    if (draftFilters.controle.length > 0)
      newFilters.push({ type: "Controle", values: draftFilters.controle });
    if (draftFilters.responsible.length > 0)
      newFilters.push({
        type: "Responsável",
        values: draftFilters.responsible,
      });
    if (draftFilters.type.length > 0)
      newFilters.push({ type: "Tipo", values: draftFilters.type });
    if (draftFilters.process.length > 0)
      newFilters.push({ type: "Processo", values: draftFilters.process });
    if (draftFilters.execution.length > 0)
      newFilters.push({ type: "Execução", values: draftFilters.execution });
    if (draftFilters.classification.length > 0)
      newFilters.push({
        type: "Classificação",
        values: draftFilters.classification,
      });
    if (draftFilters.risks.length > 0)
      newFilters.push({ type: "Riscos", values: draftFilters.risks });
    if (draftFilters.platforms.length > 0)
      newFilters.push({ type: "Plataformas", values: draftFilters.platforms });
    if (draftFilters.informationActivities.length > 0)
      newFilters.push({
        type: "Atividades de Informação",
        values: draftFilters.informationActivities,
      });
    if (draftFilters.assertions.length > 0)
      newFilters.push({ type: "Asserções", values: draftFilters.assertions });
    if (draftFilters.cvars.length > 0)
      newFilters.push({ type: "CVARs", values: draftFilters.cvars });
    if (draftFilters.deficiencies.length > 0)
      newFilters.push({
        type: "Deficiências",
        values: draftFilters.deficiencies,
      });
    if (draftFilters.ledgerAccounts.length > 0)
      newFilters.push({
        type: "Contas Contábeis",
        values: draftFilters.ledgerAccounts,
      });
    if (draftFilters.elementCosos.length > 0)
      newFilters.push({
        type: "Elementos COSO",
        values: draftFilters.elementCosos,
      });
    setSelectedFilters(newFilters);

    if (draftFilters.startDate)
      newFilters.push({
        type: "Data Inicial",
        values: [draftFilters.startDate],
      });
    if (draftFilters.endDate)
      newFilters.push({ type: "Data Final", values: [draftFilters.endDate] });
    if (draftFilters.hasRisks)
      newFilters.push({ type: "Com Riscos", values: [draftFilters.hasRisks] });

    if (onApplyFilters) {
      onApplyFilters({
        StartDate: draftFilters.startDate,
        EndDate: draftFilters.endDate,
        HasRisks: draftFilters.hasRisks,
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
        const filterKey = {
          Controle: "controle",
          Responsável: "responsible",
          Tipo: "type",
          Processo: "process",
          Execução: "execution",
          Classificação: "classification",
          Riscos: "risks",
          Plataformas: "platforms",
          "Atividades de Informação": "informationActivities",
          Asserções: "assertions",
          CVARs: "cvars",
          Deficiências: "deficiencies",
          "Contas Contábeis": "ledgerAccounts",
          "Elementos COSO": "elementCosos",
        }[filterType];

        if (filterKey) {
          updatedDraft[filterKey] = updatedDraft[filterKey].filter(
            (value) => !filterToRemove.values.includes(value)
          );
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
      controle: [],
      responsible: [],
      type: [],
      process: [],
      execution: [],
      classification: [],
      risks: [],
      platforms: [],
      informationActivities: [],
      assertions: [],
      cvars: [],
      deficiencies: [],
      ledgerAccounts: [],
      elementCosos: [],
      startDate: null,
      endDate: null,
      hasRisks: false,
    });
    if (onApplyFilters) {
      onApplyFilters({
        StartDate: null,
        EndDate: null,
        HasRisks: false,
      });
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return selectedFilters.every((filter) => {
        const filterType = filter.type;
        const filterValues = filter.values;

        if (filterType === "Controle") return filterValues.includes(item.name);
        if (filterType === "Responsável")
          return filterValues.includes(item.responsible);
        if (filterType === "Tipo") return filterValues.includes(item.type);
        if (filterType === "Processo")
          return filterValues.includes(item.process);
        if (filterType === "Execução")
          return filterValues.includes(item.execution);
        if (filterType === "Classificação")
          return filterValues.includes(item.classification);

        const arrayFilters = {
          Riscos: item.risks,
          Plataformas: item.platforms,
          "Atividades de Informação": item.informationActivities,
          Asserções: item.assertions,
          CVARs: item.cvars,
          Deficiências: item.deficiencies,
          "Contas Contábeis": item.ledgerAccounts,
          "Elementos COSO": item.elementCosos,
        };

        if (arrayFilters[filterType]) {
          return filterValues.some((val) =>
            (arrayFilters[filterType] || []).includes(val)
          );
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
        responsible: true,
        type: true,
        process: true,
        execution: true,
        classification: true,

        risks: false,
        platforms: false,
        informationActivities: false,
        assertions: false,
        cvars: false,
        deficiencies: false,
        ledgerAccounts: false,
        elementCosos: false,
        frequency: false,
        meaningfulness: false,
        preventiveDetective: false,
        revisionControl: false,
        objectives: false,
        causes: false,
        impacts: false,
        date: false,
        actions: true,
      }),
    []
  );

  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginRight: "0px",
    marginLeft: "7px",
  };

  let headers = [];
  table.getVisibleLeafColumns().map((columns) =>
    headers.push({
      label:
        typeof columns.columnDef.header === "string"
          ? columns.columnDef.header
          : "#",
      key: columns.columnDef.accessorKey,
    })
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, table.getRowModel().rows]);

  const getAllColumnsFiltered = () => {
    return table.getAllLeafColumns().filter((c) => !["actions"].includes(c.id));
  };

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
              getToggleAllColumnsVisibilityHandler:
                table.getToggleAllColumnsVisibilityHandler,
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
              backgroundColor: "white",
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
          <div style={{ verticalDividerStyle }}></div>
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
                  navigation(`/controles/criar`, {
                    state: { indoPara: "NovoControle" },
                  });
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
                  {filter.values
                    .map((v) =>
                      v === true ? "Controle" : v === false ? "Inativo" : v
                    )
                    .join(", ")}
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

      {}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ sx: { width: 670 } }}
      >
        <Box sx={{ width: 650, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box
              component="h2"
              sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}
            >
              Filtros
            </Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Controle
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={controlesOptions}
                  value={draftFilters.controle}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, controle: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Responsável
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={responsibleOptions}
                  value={draftFilters.responsible}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, responsible: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Tipo
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={typeOptions}
                  value={draftFilters.type}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, type: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Processo
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={processOptions}
                  value={draftFilters.process}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, process: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Execução
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={executionOptions}
                  value={draftFilters.execution}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, execution: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Classificação
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={classificationOptions}
                  value={draftFilters.classification}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      classification: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Riscos
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={risksOptions}
                  value={draftFilters.risks}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, risks: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Plataformas
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={platformsOptions}
                  value={draftFilters.platforms}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, platforms: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Atividades de Informação
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={informationActivitiesOptions}
                  value={draftFilters.informationActivities}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      informationActivities: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Asserções
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={assertionsOptions}
                  value={draftFilters.assertions}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, assertions: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                CVARs
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={cvarsOptions}
                  value={draftFilters.cvars}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, cvars: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Deficiências
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={deficienciesOptions}
                  value={draftFilters.deficiencies}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      deficiencies: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Contas Contábeis
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ledgerAccountsOptions}
                  value={draftFilters.ledgerAccounts}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      ledgerAccounts: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Elementos COSO
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={elementCososOptions}
                  value={draftFilters.elementCosos}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      elementCosos: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Data Inicial
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.startDate || ""}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Data Final
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.endDate || ""}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draftFilters.hasRisks}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        hasRisks: e.target.checked,
                      }))
                    }
                    name="hasRisks"
                    color="primary"
                  />
                }
                label="Apenas Controles com Riscos"
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={toggleDrawer}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={applyFilters}>
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Drawer>

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
                            <EmptyTable msg="Controles não encontrados" />
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
                      totalItems: processosTotal,
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
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  modalToggler: PropTypes.func,
  renderRowSubComponent: PropTypes.any,
  refreshData: PropTypes.func,
  onExportExcel: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    handleClose();
  };

  const handleToggleActive = async () => {
    handleClose();
    if (openDialog) setOpenDialog(false);

    setLoadingStatus(true);
    const authToken = token || localStorage.getItem("access_token");

    try {
      const responseGet = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/controls/${row.original.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!responseGet.ok) throw new Error("Erro ao buscar dados do controle.");
      const data = await responseGet.json();

      const payload = {
        idControl: data.idControl,
        active: !data.active,

        code: data.code,
        name: data.name,
        description: data.description,
        preventiveDetective: data.preventiveDetective,
        revisionControl: data.revisionControl,
        meaningfulness: data.meaningfulness,
        frequency: data.frequency || 0,

        idResponsible: data.idResponsible || null,
        idControlType: data.idControlType || null,
        idProcess: data.idProcess || null,
        idControlExecution: data.idControlExecution || null,
        idClassification: data.idClassification || null,

        idPlatforms: data.idPlatforms || [],
        idRisks: data.idRisks || [],
        idInformationActivities: data.idInformationActivities || [],
        idAssertions: data.idAssertions || [],
        idCvars: data.idCvars || [],
        idDeficiencies: data.idDeficiencies || [],
        idControlCompensatings: data.idControlCompensatings || [],
        idControlCompensateds: data.idControlCompensateds || [],
        idControlLedgerAccounts: data.idControlLedgerAccounts || [],
        idControlElementCosos: data.idControlElementCosos || [],
        idControlObjectives: data.idControlObjectives || [],

        files: Array.isArray(data.files)
          ? data.files.map((f) => (typeof f === "string" ? f : f.path))
          : [],
      };

      const responsePut = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/controls`,
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
        throw new Error("Erro ao atualizar status do controle.");
      }

      enqueueSnackbar(
        `Controle ${data.active ? "inativado" : "ativado"} com sucesso!`,
        { variant: "success" }
      );

      refreshData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Erro ao alterar o status: ${error.message}`, {
        variant: "error",
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
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
              navigation(`/controles/criar`, {
                state: {
                  indoPara: "NovoControle",
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

          <Button
            onClick={() => {
              if (isActive) handleDialogOpen();
              else handleToggleActive();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {isActive ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>

      {}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
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
                  cursor: "default",
                },
              }}
            >
              <FontAwesomeIcon icon={faBan} />
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
              Inativar
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
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
            Tem certeza que deseja inativar o controle "{row.original.name}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Ao inativar, esse controle não aparecerá mais no cadastro manual.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleToggleActive}
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
            Sim, inativar
          </Button>
          <Button
            onClick={handleDialogClose}
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

      {}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        {}
      </Dialog>
      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        {}
      </Dialog>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

const ListagemControles = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [backendFilters, setBackendFilters] = useState({});
  const { acoesJudiciais: lists, isLoading } = useGetControles(
    { ...formData, ...backendFilters },
    processoSelecionadoId
  );

  const handleBackendFiltersChange = (newFilters) => {
    setBackendFilters(newFilters);
  };
  const processosTotal = lists ? lists.length : 0;
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
      refreshCount: prev.refreshCount + 1,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Controles",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: "13px", cursor: "pointer" }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/controles/criar`, {
                state: { indoPara: "NovoControle", dadosApi },
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
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.code}</Typography>
        ),
      },
      {
        header: "Responsável",
        accessorKey: "responsible",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.responsible}
          </Typography>
        ),
      },
      {
        header: "Tipo",
        accessorKey: "type",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.type}</Typography>
        ),
      },
      {
        header: "Processo",
        accessorKey: "process",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.process}
          </Typography>
        ),
      },
      {
        header: "Execução",
        accessorKey: "execution",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.execution}
          </Typography>
        ),
      },
      {
        header: "Classificação",
        accessorKey: "classification",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.classification}
          </Typography>
        ),
      },

      {
        header: "Significância",
        accessorKey: "meaningfulness",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.meaningfulness ? "Sim" : "Não"}
          </Typography>
        ),
      },
      {
        header: "Preventivo/Detectivo",
        accessorKey: "preventiveDetective",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.preventiveDetective ? "Sim" : "Não"}
          </Typography>
        ),
      },
      {
        header: "Controle de Revisão",
        accessorKey: "revisionControl",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.revisionControl ? "Sim" : "Não"}
          </Typography>
        ),
      },
      {
        header: "Frequência",
        accessorKey: "frequency",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.frequency}
          </Typography>
        ),
      },
      {
        header: "Riscos",
        accessorKey: "risks",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.risks || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Plataformas",
        accessorKey: "platforms",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.platforms || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Atividades de Informação",
        accessorKey: "informationActivities",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.informationActivities || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Asserções",
        accessorKey: "assertions",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.assertions || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "CVARs",
        accessorKey: "cvars",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.cvars || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Deficiências",
        accessorKey: "deficiencies",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.deficiencies || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Contas Contábeis",
        accessorKey: "ledgerAccounts",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.ledgerAccounts || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Elementos COSO",
        accessorKey: "elementCosos",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.elementCosos || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Objetivos",
        accessorKey: "objectives",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.objectives || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Causas",
        accessorKey: "causes",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.causes || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Impactos",
        accessorKey: "impacts",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {(row.original.impacts || []).join(", ")}
          </Typography>
        ),
      },
      {
        header: "Data",
        accessorKey: "date",
        cell: ({ row }) => {
          try {
            return (
              <Typography sx={{ fontSize: "13px" }}>
                {new Date(row.original.date).toLocaleDateString()}
              </Typography>
            );
          } catch {
            return <Typography sx={{ fontSize: "13px" }}>—</Typography>;
          }
        },
      },

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
                processosTotal,
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

export default ListagemControles;
