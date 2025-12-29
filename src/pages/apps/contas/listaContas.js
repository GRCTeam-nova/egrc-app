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
import { useGetContas } from "../../../api/contas";
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
import { useToken } from "../../../api/TokenContext";

// assets
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// ==============================|| FUZZY FILTER DEFINITIVO ||============================== //
export const fuzzyFilter = (row, columnId, value) => {
  // 1. Tenta obter o valor diretamente dos dados originais (Bypassa a view da tabela)
  // Isso garante que o filtro funcione mesmo em colunas ocultas ou Arrays
  let cellValue = row.original ? row.original[columnId] : undefined;

  // 2. Se não achou no original, tenta pelo método padrão (fallback)
  if (cellValue === undefined) {
    cellValue = row.getValue(columnId);
  }

  // 3. Verificação de segurança
  if (cellValue === undefined || cellValue === null || value === undefined || value === "") {
    return false;
  }

  // 4. Função para normalizar texto (remove acentos, caixa baixa)
  const normalize = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // 5. Prepara o texto da célula para busca
  let cellString = "";
  
  if (Array.isArray(cellValue)) {
    // Se for array (ex: Empresas), junta todos os itens numa única string
    // Ex: ["Empresa A", "Empresa B"] vira "empresa a empresa b"
    cellString = cellValue.map((item) => normalize(item)).join(" ");
  } else {
    // Se for texto/número
    cellString = normalize(cellValue);
  }

  // 6. Prepara o termo de busca (quebra por espaços)
  // Ex: "Conta  002" vira ["conta", "002"]
  const searchTerms = normalize(value).split(" ").filter((term) => term.trim() !== "");

  // 7. Verifica se TODAS as palavras pesquisadas existem na célula (mesmo fora de ordem)
  return searchTerms.every((term) => cellString.includes(term));
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, totalRows, isLoading, onApplyFilters, onExportExcel }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Contas";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Opções para os filtros (Baseado no JSON reportLedgerAccounts)
  const [typeOptions, setTypeOptions] = useState([]);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  
  // Opções de Arrays
  const [ledgerAccountCompaniesOptions, setLedgerAccountCompaniesOptions] = useState([]);
  const [ledgerAccountBottomsOptions, setLedgerAccountBottomsOptions] = useState([]);
  const [assertionsOptions, setAssertionsOptions] = useState([]);
  const [controlsOptions, setControlsOptions] = useState([]);
  const [deficienciesOptions, setDeficienciesOptions] = useState([]);
  const [processesOptions, setProcessesOptions] = useState([]);

  const [draftFilters, setDraftFilters] = useState({
    responsible: [],
    type: [],
    ledgerAccountCompanies: [],
    ledgerAccountBottoms: [],
    assertions: [],
    controls: [],
    deficiencies: [],
    processes: [],
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

    // Campos Array
    setLedgerAccountCompaniesOptions(getUniqueValues('ledgerAccountCompanies', true));
    setLedgerAccountBottomsOptions(getUniqueValues('ledgerAccountBottoms', true));
    setAssertionsOptions(getUniqueValues('assertions', true));
    setControlsOptions(getUniqueValues('controls', true));
    setDeficienciesOptions(getUniqueValues('deficiencies', true));
    setProcessesOptions(getUniqueValues('processes', true));

  }, [data]);

  const applyFilters = () => {
    const newFilters = [];
    
    // Filtros Simples
    if (draftFilters.responsible.length > 0) newFilters.push({ type: "Responsável", values: draftFilters.responsible });
    if (draftFilters.type.length > 0) newFilters.push({ type: "Tipo", values: draftFilters.type });
    
    // Filtros Array
    if (draftFilters.ledgerAccountCompanies.length > 0) newFilters.push({ type: "Empresas", values: draftFilters.ledgerAccountCompanies });
    if (draftFilters.ledgerAccountBottoms.length > 0) newFilters.push({ type: "Subcontas", values: draftFilters.ledgerAccountBottoms });
    if (draftFilters.assertions.length > 0) newFilters.push({ type: "Asserções", values: draftFilters.assertions });
    if (draftFilters.controls.length > 0) newFilters.push({ type: "Controles", values: draftFilters.controls });
    if (draftFilters.deficiencies.length > 0) newFilters.push({ type: "Deficiências", values: draftFilters.deficiencies });
    if (draftFilters.processes.length > 0) newFilters.push({ type: "Processos", values: draftFilters.processes });

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
        
        const mapTypeToKey = {
          "Responsável": "responsible",
          "Tipo": "type",
          "Empresas": "ledgerAccountCompanies",
          "Subcontas": "ledgerAccountBottoms",
          "Asserções": "assertions",
          "Controles": "controls",
          "Deficiências": "deficiencies",
          "Processos": "processes",
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
      ledgerAccountCompanies: [],
      ledgerAccountBottoms: [],
      assertions: [],
      controls: [],
      deficiencies: [],
      processes: [],
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
        if (filterType === "Tipo") return filterValues.includes(item.type);

        const arrayFilters = {
          "Empresas": item.ledgerAccountCompanies,
          "Subcontas": item.ledgerAccountBottoms,
          "Asserções": item.assertions,
          "Controles": item.controls,
          "Deficiências": item.deficiencies,
          "Processos": item.processes,
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
        ledgerAccountCompanies: true,
        
        // Colunas ocultas por padrão
        ledgerAccountBottoms: false,
        assertions: false,
        controls: false,
        deficiencies: false,
        processes: false,
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
                  navigation(`/contas/criar`, { state: { indoPara: "NovaConta" } });
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

            {/* Empresas */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Empresas</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ledgerAccountCompaniesOptions}
                  value={draftFilters.ledgerAccountCompanies}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, ledgerAccountCompanies: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            
            {/* Subcontas */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Subcontas</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ledgerAccountBottomsOptions}
                  value={draftFilters.ledgerAccountBottoms}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, ledgerAccountBottoms: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Asserções */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Asserções</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={assertionsOptions}
                  value={draftFilters.assertions}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, assertions: value }))}
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
            
             {/* Processos */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Processos</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={processesOptions}
                  value={draftFilters.processes}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, processes: value }))}
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
                            <EmptyTable msg="Contas não encontradas" />
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

  const handleDelete = async () => {
    try {
      // Ajuste o endpoint conforme a API de Contas
      const response = await fetch(
        `${API_COMMAND}/api/Contas/${row.original.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        enqueueSnackbar(`Conta ${row.original.name} excluída.`, {
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
          `Falha ao excluir a conta: ${response.status} ${response.statusText} - ${errorBody}`
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
              navigation(`/contas/criar`, {
                state: {
                  indoPara: "NovaConta",
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
            Tem certeza que deseja excluir a conta "{row.original.name}"?
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
  } = useGetContas({ ...formData, ...backendFilters }, processoSelecionadoId);

  // Extrai o array 'reportLedgerAccounts' do objeto retornado
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
        header: "Conta",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: '13px', cursor: "pointer", fontWeight: 600, color: theme.palette.primary.main }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/contas/criar`, {
                state: { indoPara: "NovaConta", dadosApi },
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
      
      // Colunas tipo Array
      {
        header: "Empresas",
        accessorKey: "ledgerAccountCompanies",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.ledgerAccountCompanies || []).join(", ")}</Typography>,
      },
      {
        header: "Subcontas",
        accessorKey: "ledgerAccountBottoms",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.ledgerAccountBottoms || []).join(", ")}</Typography>,
      },
      {
        header: "Asserções",
        accessorKey: "assertions",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.assertions || []).join(", ")}</Typography>,
      },
      {
        header: "Controles",
        accessorKey: "controls",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.controls || []).join(", ")}</Typography>,
      },
      {
        header: "Deficiências",
        accessorKey: "deficiencies",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.deficiencies || []).join(", ")}</Typography>,
      },
      {
        header: "Processos",
        accessorKey: "processes",
        cell: ({ row }) => <Typography sx={{ fontSize: '13px' }}>{(row.original.processes || []).join(", ")}</Typography>,
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