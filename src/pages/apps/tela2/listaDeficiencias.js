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
import { useGetDeficiencias } from "../../../api/deficiencias"; // Atualizado
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
import CloseIcon from "@mui/icons-material/Close";
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
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  const normalizeText = (text) => {
    return (text ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const search = normalizeText(value);

  if (!search) return true;

  const cellValue = row.getValue(columnId);
  const cell = normalizeText(cellValue);

  return cell.includes(search);
};

const defaultVisibility = {
  // visíveis por padrão
  name: true,
  code: true,
  active: true,
  type: true,
  classification: true,

  // começam ocultas
  controls: false,
  ledgerAccounts: false,
  processes: false,
  actionPlans: false,
  tests: false,
  date: false,

  // ações sempre visível
  actions: true,
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  registrosTotal,
  isLoading,
  onApplyFilters,
  onExportExcel,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const STORAGE_KEY = "egrc_table_visibility_deficiencias";
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultVisibility;
    } catch (error) {
      return defaultVisibility;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  const recordType = "Deficiências";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [selectedFilters, setSelectedFilters] = useState([
    { type: "Status", values: ["Ativo"] },
  ]);

  // Opções de Filtro
  const [deficienciasOptions, setDeficienciasOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [controlsOptions, setControlsOptions] = useState([]);
  const [processesOptions, setProcessesOptions] = useState([]);
  const [actionPlansOptions, setActionPlansOptions] = useState([]);

  const [draftFilters, setDraftFilters] = useState({
    status: ["Ativo"],
    deficiencia: [],
    type: [],
    classification: [],
    controls: [],
    processes: [],
    actionPlans: [],
    tests: [],
    ledgerAccounts: [],
    startDate: null,
    endDate: null,
  });

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const isYMD = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const formatDateDashed = (value) => {
    if (!value) return "";
    if (isYMD(value)) {
      const [y, m, d] = value.split("-");
      return `${d}-${m}-${y}`;
    }
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);

    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const parseLocalStart = (ymd) => (ymd ? new Date(`${ymd}T00:00:00`) : null);
  const parseLocalEnd = (ymd) => (ymd ? new Date(`${ymd}T23:59:59.999`) : null);

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

    setDeficienciasOptions(getUniqueValues("name"));
    setTypeOptions(getUniqueValues("type"));
    setClassificationOptions(getUniqueValues("classification"));
    setControlsOptions(getUniqueValues("controls", true));
    setProcessesOptions(getUniqueValues("processes", true));
    setActionPlansOptions(getUniqueValues("actionPlans", true));
  }, [data]);

  const applyFilters = () => {
    const newFilters = [];

    if (draftFilters.status.length > 0) newFilters.push({ type: "Status", values: draftFilters.status });
    if (draftFilters.startDate) newFilters.push({ type: "Data Inicial", values: [draftFilters.startDate] });
    if (draftFilters.endDate) newFilters.push({ type: "Data Final", values: [draftFilters.endDate] });
    if (draftFilters.deficiencia.length > 0) newFilters.push({ type: "Deficiência", values: draftFilters.deficiencia });
    if (draftFilters.type.length > 0) newFilters.push({ type: "Tipo", values: draftFilters.type });
    if (draftFilters.classification.length > 0) newFilters.push({ type: "Classificação", values: draftFilters.classification });
    if (draftFilters.controls.length > 0) newFilters.push({ type: "Controles", values: draftFilters.controls });
    if (draftFilters.processes.length > 0) newFilters.push({ type: "Processos", values: draftFilters.processes });
    if (draftFilters.actionPlans.length > 0) newFilters.push({ type: "Planos de Ação", values: draftFilters.actionPlans });
   
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
        const filterKey = {
          "Status": "status",
          "Deficiência": "deficiencia",
          "Tipo": "type",
          "Classificação": "classification",
          "Controles": "controls",
          "Processos": "processes",
          "Planos de Ação": "actionPlans",
          "Data Inicial": "startDate",
          "Data Final": "endDate",
        }[filterToRemove.type];

        if (filterKey) {
          if (filterKey === "startDate" || filterKey === "endDate") {
            updatedDraft[filterKey] = null;
          } else {
            updatedDraft[filterKey] = updatedDraft[filterKey].filter(
              (value) => !filterToRemove.values.includes(value),
            );
          }
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
      status: [],
      deficiencia: [],
      type: [],
      classification: [],
      controls: [],
      processes: [],
      actionPlans: [],
      tests: [],
      ledgerAccounts: [],
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

        if (filterType === "Status") {
          const showActive = filterValues.includes("Ativo");
          const showInactive = filterValues.includes("Inativo");
          if (showActive && showInactive) return true;
          if (showActive) return item.active === true;
          if (showInactive) return item.active === false;
          return true;
        }

        if (filterType === "Data Inicial") {
          const start = parseLocalStart(filterValues?.[0]);
          if (!start) return true;
          const itemDate = new Date(item.date);
          if (Number.isNaN(itemDate.getTime())) return false;
          return itemDate.getTime() >= start.getTime();
        }

        if (filterType === "Data Final") {
          const end = parseLocalEnd(filterValues?.[0]);
          if (!end) return true;
          const itemDate = new Date(item.date);
          if (Number.isNaN(itemDate.getTime())) return false;
          return itemDate.getTime() <= end.getTime();
        }

        if (filterType === "Deficiência") return filterValues.includes(item.name);
        if (filterType === "Tipo") return filterValues.includes(item.type);
        if (filterType === "Classificação") return filterValues.includes(item.classification);

        const arrayFilters = {
          "Controles": item.controls,
          "Processos": item.processes,
          "Planos de Ação": item.actionPlans,
        };

        if (arrayFilters[filterType]) {
          return filterValues.some((val) =>
            (arrayFilters[filterType] || []).includes(val),
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
  });

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
            "& .MuiOutlinedInput-root, & .MuiFormControl-root": { width: "110%" },
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
            startIcon={<FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />}
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
          <div style={verticalDividerStyle}></div>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.75 }}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigation(`/deficiencias/criar`, {
                    state: { indoPara: "NovaDeficiencia" },
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
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.75 }}>
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
                <Typography sx={{ color: "#1C5297", fontWeight: 600, marginRight: "4px" }}>
                  {filter.type}:
                </Typography>
                <Typography sx={{ color: "#1C5297", fontWeight: 400 }}>
                  {filter.values.map((v) => {
                      if (filter.type === "Data Inicial" || filter.type === "Data Final") return formatDateDashed(v);
                      if (typeof v === "boolean") return v ? "Sim" : "Não";
                      return v;
                    }).join(", ")}
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

      {/* Drawer de Filtros */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ sx: { width: 670 } }}
      >
        <Box sx={{ width: 650, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box component="h2" sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}>
              Filtros
            </Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Status</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={["Ativo", "Inativo"]}
                  value={draftFilters.status}
                  onChange={(event, newValue) => setDraftFilters((prev) => ({ ...prev, status: newValue }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Deficiência</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={deficienciasOptions}
                  value={draftFilters.deficiencia}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, deficiencia: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Tipo</InputLabel>
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

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Classificação</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={classificationOptions}
                  value={draftFilters.classification}
                  onChange={(event, value) => setDraftFilters((prev) => ({ ...prev, classification: value }))}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Controles</InputLabel>
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

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Processos</InputLabel>
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

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Planos de Ação</InputLabel>
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
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Data Inicial</InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.startDate || ""}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Data Final</InputLabel>
              <FormControl fullWidth margin="normal">
                <TextField
                  type="date"
                  value={draftFilters.endDate || ""}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
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
                          color: isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.87)",
                        }}
                      >
                        {headerGroup.headers.map((header) => {
                          if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                            Object.assign(header.column.columnDef.meta, {
                              className: header.column.columnDef.meta.className + " cursor-pointer prevent-select",
                            });
                          }

                          return (
                            <TableCell
                              sx={{
                                fontSize: "11px",
                                color: isDarkMode ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.6)",
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
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                  {header.column.getCanSort() && <HeaderSort column={header.column} />}
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
                        <TableCell colSpan={columns.length} sx={{ textAlign: "center" }}>
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
                                    color: isDarkMode ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.65)",
                                    textOverflow: "ellipsis",
                                    fontFamily: '"Open Sans", Helvetica, sans-serif',
                                    fontSize: "13px",
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                  }}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          </Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyTable msg="Deficiências não encontradas" />
                          </TableCell>
                        </TableRow>
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} sx={{ textAlign: "left" }}>
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
                      totalItems: registrosTotal,
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
  processosTotal: PropTypes.number,
  isLoading: PropTypes.bool,
  onApplyFilters: PropTypes.func,
  onExportExcel: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(row.original.active);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDialogOpen = () => setOpenDialog(true);
  
  const handleDialogClose = () => {
    setOpenDialog(false);
    handleClose();
  };
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const toggleStatus = async () => {
    const idDeficiency = row.original.id;
    const newStatus = status === true ? "Inativo" : "Ativo";

    try {
      const getResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}deficiencies/${idDeficiency}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dadosEndpoint = getResponse.data;
      const dadosAtualizados = {
        ...dadosEndpoint,
        active: newStatus === "Ativo",
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}deficiencies`,
        dadosAtualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStatus(newStatus === "Ativo");
      enqueueSnackbar(`Deficiência ${row.original.name} ${newStatus.toLowerCase()}.`, {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });

      refreshData();
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(`Erro: ${error.response?.data || error.message}`, { variant: "error" });
    }

    handleDialogClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_COMMAND}/api/Deficiencies/${row.original.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        enqueueSnackbar(`Deficiência ${row.original.name} excluída.`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        refreshData();
      } else {
        throw new Error(`Falha ao excluir a deficiência: ${response.status}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      setOpenErrorDialog(true);
    }
    handleDeleteDialogClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <IconButton aria-describedby={id} color="primary" onClick={handleClick} style={{ borderRadius: 8, backgroundColor: "#1C52970D", width: "30px", height: "30px" }}>
        <MoreVertIcon />
      </IconButton>
      <Popover id={id} open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Stack>
          <Button
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/deficiencias/criar`, { state: { indoPara: "NovaDeficiencia", dadosApi } });
              handleClose();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Editar
          </Button>

          <Button
            onClick={() => {
              if (row.original.active === true) handleDialogOpen();
              else toggleStatus();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {row.original.active === true ? "Inativar" : "Ativar"}
          </Button>
          
          <Button onClick={() => setOpenDeleteDialog(true)} style={{ color: "#ED5565", fontWeight: 400 }}>
            Excluir
          </Button>
        </Stack>
      </Popover>

      {/* Modal Inativar */}
      <Dialog open={openDialog} onClose={handleDialogClose} sx={{ "& .MuiPaper-root": { width: "547px", height: "290px", maxWidth: "none" } }}>
        <DialogTitle sx={{ background: "#ED5565", height: "42px", borderRadius: "4px 4px 0px 0px", display: "flex", alignItems: "center", padding: "10px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton aria-label="delete" sx={{ fontSize: "16px", marginRight: "2px", color: "white" }}>
              <FontAwesomeIcon icon={faBan} />
            </IconButton>
            <Typography sx={{ fontSize: "16px", fontWeight: 500, color: "white", flexGrow: 1 }}>Inativar</Typography>
          </div>
          <IconButton aria-label="close" onClick={handleDialogClose} sx={{ color: "white" }}>
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}>
            Tem certeza que deseja inativar a deficiência "{row.original.name}"?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px", color: "#717171" }}>
            Ao inativar, essa deficiência não aparecerá mais no cadastro manual.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleStatus} style={{ marginTop: "-55px", width: "162px", height: "32px", borderRadius: "4px", background: "#ED5565", fontSize: "13px", fontWeight: 600, color: "#fff", textTransform: "none" }}>
            Sim, inativar
          </Button>
          <Button onClick={handleDialogClose} style={{ marginTop: "-55px", width: "91px", height: "32px", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.40)", background: "#FFF", fontSize: "13px", fontWeight: 600, color: "rgba(0, 0, 0, 0.60)" }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Excluir */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose} sx={{ "& .MuiPaper-root": { width: "547px", height: "290px", maxWidth: "none" } }}>
        <DialogTitle sx={{ background: "#ED5565", height: "42px", borderRadius: "4px 4px 0px 0px", display: "flex", alignItems: "center", padding: "10px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton aria-label="delete" sx={{ fontSize: "16px", marginRight: "2px", color: "white" }}>
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
            <Typography sx={{ fontSize: "16px", fontWeight: 500, color: "white", flexGrow: 1 }}>Excluir</Typography>
          </div>
          <IconButton aria-label="close" onClick={handleDeleteDialogClose} sx={{ color: "white" }}>
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}>
            Tem certeza que deseja excluir a deficiência "{row.original.name}"?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px", color: "#717171" }}>
            Essa deficiência não será mais disponibilizada nos processos onde estava associada.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} style={{ marginTop: "-55px", width: "162px", height: "32px", borderRadius: "4px", background: "#ED5565", fontSize: "13px", fontWeight: 600, color: "#fff", textTransform: "none" }}>
            Sim, excluir
          </Button>
          <Button onClick={handleDeleteDialogClose} style={{ marginTop: "-55px", width: "91px", height: "32px", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.40)", background: "#FFF", fontSize: "13px", fontWeight: 600, color: "rgba(0, 0, 0, 0.60)" }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Erro Exclusão */}
      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)} sx={{ "& .MuiPaper-root": { width: "547px", height: "290px", maxWidth: "none" } }}>
        <DialogTitle sx={{ background: "#F69B50", height: "42px", borderRadius: "4px 4px 0px 0px", display: "flex", alignItems: "center", padding: "10px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton aria-label="alert" sx={{ fontSize: "16px", marginRight: "2px", color: "white" }}>
              <FontAwesomeIcon icon={faExclamation} />
            </IconButton>
            <Typography sx={{ fontSize: "16px", fontWeight: 500, color: "white", flexGrow: 1 }}>Exclusão não permitida</Typography>
          </div>
          <IconButton aria-label="close" onClick={() => setOpenErrorDialog(false)} sx={{ color: "white" }}>
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}>
            Não é possível excluir a Deficiência.
          </Typography>
          <Typography component="div" style={{ marginTop: "20px", color: "#717171" }}>
            A deficiência não pode ser excluída pois está vinculada a outros registros (processos, planos de ação, etc.). Tente inativá-la nas configurações de edição.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)} style={{ marginTop: "-55px", width: "64px", height: "32px", borderRadius: "4px", background: "#F69B50", fontSize: "13px", fontWeight: 600, color: "#fff", textTransform: "none" }}>
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

// ==============================|| LISTAGEM PRINCIPAL ||============================== //

const ListagemDeficiencia = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [backendFilters, setBackendFilters] = useState({});
  const { deficiencias: lists, isLoading } = useGetDeficiencias({ ...formData, ...backendFilters }, processoSelecionadoId);

  const handleBackendFiltersChange = (newFilters) => setBackendFilters(newFilters);
  const registrosTotal = lists ? lists.length : 0;
  
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshData = () => {
    setFormData((currentData) => ({ ...currentData, refreshCount: currentData.refreshCount + 1 }));
  };

  useEffect(() => {
    emitter.on("refreshCustomers", refreshData);
    return () => emitter.off("refreshCustomers", refreshData);
  }, []);

  const handleClose = () => setOpen(!open);
  const handleFormDataChange = (newFormData) => setFormData(newFormData);

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
        header: "Código",
        accessorKey: "code",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{row.original.code}</Typography>,
      },
      {
        header: "Deficiência",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: "13px", cursor: "pointer", fontWeight: 600, color: theme.palette.primary.main }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/deficiencias/criar`, { state: { indoPara: "NovaDeficiencia", dadosApi } });
            }}
          >
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: "Tipo",
        accessorKey: "type",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{row.original.type || "—"}</Typography>,
      },
      {
        header: "Classificação",
        accessorKey: "classification",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{row.original.classification || "—"}</Typography>,
      },
      {
        header: "Controles",
        accessorKey: "controls",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{(row.original.controls || []).join(", ")}</Typography>,
      },
      {
        header: "Processos",
        accessorKey: "processes",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{(row.original.processes || []).join(", ")}</Typography>,
      },
      {
        header: "Planos de Ação",
        accessorKey: "actionPlans",
        cell: ({ row }) => <Typography sx={{ fontSize: "13px" }}>{(row.original.actionPlans || []).join(", ")}</Typography>,
      },
      {
        header: "Data de criação",
        accessorKey: "date",
        cell: ({ row }) => {
          try {
            return <Typography sx={{ fontSize: "13px" }}>{new Date(row.original.date).toLocaleDateString()}</Typography>;
          } catch {
            return <Typography sx={{ fontSize: "13px" }}>—</Typography>;
          }
        },
      },
      {
        header: "Status",
        accessorKey: "active",
        cell: ({ row }) => (
          <Chip
            label={row.original.active === true ? "Ativo" : "Inativo"}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
            }}
            icon={
              <span
                style={{
                  backgroundColor: row.original.active === true ? "green" : "red",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "-6px",
                  marginLeft: "2px",
                }}
              />
            }
          />
        ),
      },
      {
        id: "actions",
        header: " ",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row} refreshData={refreshData} />,
      },
    ],
    [theme, navigation]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) setIsInitialLoad(false);
  }, [isLoading, isInitialLoad]);

  useEffect(() => {
    if (!isLoading && formData.GenerateExcel) {
      setFormData((prev) => ({ ...prev, GenerateExcel: false }));
    }
  }, [isLoading, formData.GenerateExcel]);

  return (
    <>
      {isInitialLoad && isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
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
                registrosTotal,
                onFormDataChange: handleFormDataChange,
                isLoading,
                refreshData,
                onApplyFilters: handleBackendFiltersChange,
                onExportExcel: handleExportExcel,
              }}
            />
          )}
        </Box>
      )}
      <AlertCustomerDelete id={customerDeleteId} title={customerDeleteId} open={open} handleClose={handleClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} customer={selectedCustomer} />
    </>
  );
};

export default ListagemDeficiencia;