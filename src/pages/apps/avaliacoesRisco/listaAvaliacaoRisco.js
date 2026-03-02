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
// Importação ajustada para o novo hook de avaliações (crie este arquivo conforme necessário)
import { useGetAvaliacoes } from "../../../api/avaliacaoRisco"; 
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
import {
  faXmark,
  faTrash,
  faExclamation,
  faBan, // <- NOVO
  faCheck, // <- NOVO
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

import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);

  if (
    cellValue === undefined ||
    cellValue === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const normalize = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  let cellString = "";
  if (Array.isArray(cellValue)) {
    cellString = cellValue.map((item) => normalize(item)).join(" ");
  } else {
    cellString = normalize(cellValue);
  }

  const searchTerms = normalize(value)
    .split(" ")
    .filter((term) => term.trim() !== "");

  return searchTerms.every((term) => cellString.includes(term));
};

const defaultVisibility = {
  cycle: true,
  risk: true,
  responsible: true,
  status: true,
  dateOfConclusion: true,
  inherent: false,
  residual: false,
  planned: false,
  quizCount: true,
  active: true,
  actions: true,
};

function ReactTable({
  data,
  columns,
  totalRows,
  isLoading,
  onApplyFilters,
  onExportExcel,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const STORAGE_KEY = "egrc_table_visibility_avaliacoes";

  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultVisibility;
    } catch (error) {
      console.error("Erro ao carregar visibilidade das colunas", error);
      return defaultVisibility;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  const recordType = "Avaliações";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "cycle", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    { type: "Status do Registro", values: ["Ativo"] },
  ]);

  const [cycleOptions, setCycleOptions] = useState([]);
  const [riskOptions, setRiskOptions] = useState([]);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const [draftFilters, setDraftFilters] = useState({
    activeStatus: ["Ativo"],
    cycle: [],
    risk: [],
    responsible: [],
    status: [],
    startDate: null,
    endDate: null,
  });

  const statusTranslation = {
    "Completed": "Completa",
    "Finished": "Finalizado",
    "InAssessment": "Em Avaliação",
    "NotStarted": "Não Iniciado"
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const getUniqueValues = (key, isArray = false) => {
      if (!data) return [];
      const values = data.flatMap((item) => {
        const value = item[key];
        if (isArray && Array.isArray(value)) {
          return value.filter((v) => v !== null && v !== undefined && v !== "");
        }
        return value !== null && value !== undefined && value !== ""
          ? [value]
          : [];
      });
      return [...new Set(values)].sort();
    };

    setCycleOptions(getUniqueValues("cycle"));
    setRiskOptions(getUniqueValues("risk"));
    setResponsibleOptions(getUniqueValues("responsible"));
    const rawStatusOptions = getUniqueValues("status");
    setStatusOptions(rawStatusOptions.map(status => statusTranslation[status] || status));
  }, [data]);

  const applyFilters = () => {
    const newFilters = [];

    if (draftFilters.activeStatus.length > 0) {
      newFilters.push({ type: "Status do Registro", values: draftFilters.activeStatus });
    }
    if (draftFilters.cycle.length > 0)
      newFilters.push({ type: "Ciclo", values: draftFilters.cycle });
    if (draftFilters.risk.length > 0)
      newFilters.push({ type: "Risco", values: draftFilters.risk });
    if (draftFilters.responsible.length > 0)
      newFilters.push({ type: "Responsável", values: draftFilters.responsible });
    if (draftFilters.status.length > 0)
      newFilters.push({ type: "Status da Avaliação", values: draftFilters.status });

    if (draftFilters.startDate)
      newFilters.push({ type: "Data Inicial", values: [draftFilters.startDate] });
    if (draftFilters.endDate)
      newFilters.push({ type: "Data Final", values: [draftFilters.endDate] });

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
          "Status do Registro": "activeStatus",
          "Ciclo": "cycle",
          "Risco": "risk",
          "Responsável": "responsible",
          "Status da Avaliação": "status",
        };

        const key = mapTypeToKey[filterType];
        if (key) {
          updatedDraft[key] = updatedDraft[key].filter(
            (value) => !filterToRemove.values.includes(value),
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
      activeStatus: [],
      cycle: [],
      risk: [],
      responsible: [],
      status: [],
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

        // 1. Lógica do Ativar/Inativar (Status do Registro)
        if (filterType === "Status do Registro") {
          const showActive = filterValues.includes("Ativo");
          const showInactive = filterValues.includes("Inativo");

          if (showActive && showInactive) return true;
          if (showActive) return item.active === true;
          if (showInactive) return item.active === false;

          return true;
        }

        // 2. Filtros padrões
        if (filterType === "Ciclo") return filterValues.includes(item.cycle);
        if (filterType === "Risco") return filterValues.includes(item.risk);
        if (filterType === "Responsável") return filterValues.includes(item.responsible);
        
        // 3. Nossa nova lógica com a tradução do Status da Avaliação
        if (filterType === "Status da Avaliação") {
          // Traduz o status da API para comparar com o valor em PT-BR selecionado no filtro
          const itemStatusPt = statusTranslation[item.status] || item.status;
          return filterValues.includes(itemStatusPt);
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
            placeholder={`Pesquise pelo ciclo`}
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
          <div style={{ ...verticalDividerStyle }}></div>
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
                  navigation(`/avaliacoes/criar`, {
                    state: { indoPara: "NovaAvaliacao" },
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
                Status do Registro
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={["Ativo", "Inativo"]}
                  value={draftFilters.activeStatus}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, activeStatus: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Ciclo
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={cycleOptions}
                  value={draftFilters.cycle}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, cycle: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Risco
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={riskOptions}
                  value={draftFilters.risk}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, risk: value }))
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
                Status da Avaliação
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={statusOptions}
                  value={draftFilters.status}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, status: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Data de Conclusão Inicial
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
                Data de Conclusão Final
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
                                      header.getContext(),
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
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          </Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyTable msg="Avaliações não encontradas" />
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
  // 1. Novo estado para o modal de Ativar/Inativar
  const [openToggleDialog, setOpenToggleDialog] = useState(false); 

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

  const handleToggleDialogClose = () => {
    setOpenToggleDialog(false);
    handleClose();
  };

  const handleToggleActive = async () => {
    handleToggleDialogClose(); // Fecha o modal após confirmar
    const authToken = token || localStorage.getItem("access_token");

    try {
      const responseGet = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/assessments/${row.original.id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (!responseGet.ok) throw new Error("Erro ao buscar dados da avaliação.");
      const data = await responseGet.json();

      // 2. Adicionado o isList: true conforme solicitado
      const payload = {
        ...data,
        active: !data.active,
        isList: true, 
      };

      const responsePut = await fetch(
        `https://api.egrc.homologacao.com.br/api/v1/assessments`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!responsePut.ok) {
        throw new Error("Erro ao atualizar status da avaliação.");
      }

      enqueueSnackbar(
        `Avaliação ${data.active ? "inativada" : "ativada"} com sucesso!`,
        { variant: "success" },
      );

      refreshData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao alterar o status da avaliação.", {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_COMMAND}/api/v1/assessments/${row.original.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        enqueueSnackbar(`Avaliação ${row.original.cycle} excluída.`, {
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
          `Falha ao excluir a avaliação: ${response.status} ${response.statusText} - ${errorBody}`,
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
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <IconButton aria-describedby={id} color="primary" onClick={handleClick} style={buttonStyle}>
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
              navigation(`/avaliacoes/criar`, {
                state: {
                  indoPara: "NovaAvaliacao",
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

          {/* 3. Botão agora abre o modal em vez de chamar a API direto */}
          <Button 
            onClick={() => {
              setOpenToggleDialog(true);
              handleClose();
            }} 
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {isActive ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>

      {/* --- MODAL DE CONFIRMAÇÃO DE ATIVAR/INATIVAR --- */}
      <Dialog
        open={openToggleDialog} // Usando a variável de estado que criamos
        onClose={handleToggleDialogClose} // Usando a nossa função de fechar
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
            background: isActive ? "#ED5565" : "#1C5297", // Vermelho para inativar, Azul para ativar
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
              aria-label="status-icon"
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
              <FontAwesomeIcon icon={isActive ? faBan : faCheck} />
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
              {isActive ? "Inativar" : "Ativar"}
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleToggleDialogClose}
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
            Tem certeza que deseja {isActive ? "inativar" : "ativar"} essa avaliação?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            {isActive
              ? "Ao inativar, essa avaliação não aparecerá mais no cadastro manual."
              : "Ao ativar, essa avaliação voltará a ficar disponível no sistema."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleToggleActive} // Usando a nossa função que bate na API
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: isActive ? "#ED5565" : "#1C5297",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, {isActive ? "inativar" : "ativar"}
          </Button>
          <Button
            onClick={handleToggleDialogClose}
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

      {/* --- MODAL DE EXCLUSÃO (MANTIDO IGUAL) --- */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        sx={{
          "& .MuiPaper-root": { width: "547px", height: "290px", maxWidth: "none" },
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
                "&:hover": { backgroundColor: "transparent", boxShadow: "none", color: "white" },
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
              "&:hover": { backgroundColor: "transparent", boxShadow: "none", color: "white" },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}>
            Tem certeza que deseja excluir a avaliação "{row.original.cycle}"?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px", color: "#717171" }}>
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

      {/* --- MODAL DE ERRO (MANTIDO IGUAL) --- */}
      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        sx={{
          "& .MuiPaper-root": { width: "547px", height: "290px", maxWidth: "none" },
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
                "&:hover": { backgroundColor: "transparent", boxShadow: "none", color: "white" },
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
              "&:hover": { backgroundColor: "transparent", boxShadow: "none", color: "white" },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}>
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

const ListagemAvaliacoes = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { avaliacaoSelecionadaId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [backendFilters, setBackendFilters] = useState({});
  const { acoesJudiciais: resultData, isLoading } = useGetAvaliacoes(
    { ...formData, ...backendFilters },
    avaliacaoSelecionadaId,
  );

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
      refreshCount: prev.refreshCount + 1,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Ciclo",
        accessorKey: "cycle",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/avaliacoes/criar`, {
                state: { indoPara: "NovaAvaliacao", dadosApi },
              });
            }}
          >
            {row.original.cycle}
          </Typography>
        ),
      },
      {
        header: "Risco",
        accessorKey: "risk",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.risk}</Typography>
        ),
      },
      {
        header: "Responsável",
        accessorKey: "responsible",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.responsible}</Typography>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const statusValue = row.original.status;

          // Dicionário para traduzir e definir as cores de cada status
          const statusConfig = {
            "Completed": { label: "Completa", color: "info" },
            "Finished": { label: "Finalizado", color: "success" },
            "InAssessment": { label: "Em Avaliação", color: "warning" },
            "NotStarted": { label: "Não Iniciado", color: "default" }
          };

          // Fallback caso venha algum status vazio ou diferente da API
          const currentConfig = statusConfig[statusValue] || { 
            label: statusValue || "—", 
            color: "default" 
          };

          return (
            <Chip
              label={currentConfig.label}
              color={currentConfig.color}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "11px", // Ajustado para combinar com o padrão da sua tabela
                height: "24px",
                borderRadius: "6px" // Um leve arredondamento para ficar elegante
              }}
            />
          );
        },
      },
      {
        header: "Data de Conclusão",
        accessorKey: "dateOfConclusion",
        cell: ({ row }) => {
          try {
            const dateStr = row.original.dateOfConclusion;
            if (!dateStr || dateStr.startsWith('0001-01-01')) {
              return <Typography sx={{ fontSize: "13px" }}>—</Typography>;
            }
            return (
              <Typography sx={{ fontSize: "13px" }}>
                {new Date(dateStr).toLocaleDateString()}
              </Typography>
            );
          } catch {
            return <Typography sx={{ fontSize: "13px" }}>—</Typography>;
          }
        },
      },
      {
        header: "Risco Inerente",
        accessorKey: "inherent",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.inherent || "—"}</Typography>
        ),
      },
      {
        header: "Risco Residual",
        accessorKey: "residual",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.residual || "—"}</Typography>
        ),
      },
      {
        header: "Risco Planejado",
        accessorKey: "planned",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.planned || "—"}</Typography>
        ),
      },
      {
        header: "Qtd. Questionários",
        accessorKey: "quizCount",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.quizCount}</Typography>
        ),
      },
      {
        header: "Status do Registro",
        accessorKey: "active",
        cell: ({ row }) => (
          <Chip
            label={row.original.active === true ? "Ativo" : "Inativo"}
            color={row.original.active === true ? "success" : "error"}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
              "& .MuiChip-icon": {
                color: row.original.active === true ? "success.main" : "error.main",
                marginLeft: "4px",
              },
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
        cell: ({ row }) => <ActionCell row={row} refreshData={refreshOrgaos} />,
      },
    ],
    [theme, navigation],
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

export default ListagemAvaliacoes;