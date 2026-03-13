/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND } from "../../../config";
import { Fragment, useMemo, useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetCiclos } from "../../../api/ciclosAv";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
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
  getExpandedRowModel,
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
  faTrash,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../../components/third-party/react-table";

// assets
import { PlusOutlined } from "@ant-design/icons";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export const fuzzyFilter = (row, columnId, value) => {
  // Obter o valor da célula na coluna especificada
  let cellValue = row.getValue(columnId);

  // Verificar se o valor da célula e o valor do filtro não são undefined
  if (cellValue === undefined || value === undefined) {
    // Retornar false se algum valor for undefined
    return false;
  }

  // Função para normalizar o texto removendo acentos
  const normalizeText = (text) => {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Converter valores para string, normalizar e realizar a comparação
  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);

  return cellValue.includes(valueStr);
};

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const parseRiskResultValue = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parts = raw.split(" - ");
  if (parts.length < 2) return { name: raw, color: null };

  const colorCandidate = parts[parts.length - 1].trim();
  const name = parts.slice(0, -1).join(" - ").trim();

  if (!name) return null;

  return {
    name,
    color: HEX_COLOR_REGEX.test(colorCandidate) ? colorCandidate : null,
  };
};

const getRiskResultLabel = (value) => parseRiskResultValue(value)?.name ?? null;

const CHIP_TEXT_LIGHT = "#FFFFFF";
const CHIP_TEXT_DARK = "#111827";

const hexToRgb = (hexColor) => {
  if (!HEX_COLOR_REGEX.test(hexColor || "")) return null;
  const normalized =
    hexColor.length === 4
      ? `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`
      : hexColor;

  const intValue = Number.parseInt(normalized.slice(1), 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
};

const channelToLinear = (channel) => {
  const sRgb = channel / 255;
  return sRgb <= 0.03928
    ? sRgb / 12.92
    : Math.pow((sRgb + 0.055) / 1.055, 2.4);
};

const getRelativeLuminance = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;

  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (lumA, lumB) => {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
};

const getReadableChipTextColor = (backgroundHex) => {
  const bgLuminance = getRelativeLuminance(backgroundHex);
  const lightLuminance = getRelativeLuminance(CHIP_TEXT_LIGHT);
  const darkLuminance = getRelativeLuminance(CHIP_TEXT_DARK);

  if (
    bgLuminance == null ||
    lightLuminance == null ||
    darkLuminance == null
  ) {
    return CHIP_TEXT_DARK;
  }

  const lightContrast = getContrastRatio(bgLuminance, lightLuminance);
  const darkContrast = getContrastRatio(bgLuminance, darkLuminance);

  return lightContrast >= darkContrast ? CHIP_TEXT_LIGHT : CHIP_TEXT_DARK;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, processosTotal, isLoading }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Avaliações";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "risk", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [ciclosOptions, setCiclosOptions] = useState([]);
  const [riscosOptions, setRiscosOptions] = useState([]);
  const [resultInherentOptions, setResultInherentOptions] = useState([]);
  const [resultResidualOptions, setResultResidualOptions] = useState([]);
  const [resultPlannedOptions, setResultPlannedOptions] = useState([]);
  const [statusOptions] = useState([
    { label: "Ativo", value: true },
    { label: "Inativo", value: false },
  ]);
  const [assessmentStatusOptions] = useState([
    { label: "Não Iniciado", value: 1 },
    { label: "Em Avaliação", value: 2 },
    { label: "Completa", value: 3 },
    { label: "Finalizado", value: 4 },
    { label: "Finalizado", value: 5 },
  ]);
  const [draftFilters, setDraftFilters] = useState({
    ciclo: [],
    risco: [],
    status: [],
    assessmentStatus: [],
    resultInherent: [],
    resultResidual: [],
    resultPlanned: [],
  });

  // Abre ou fecha o drawer
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const ciclos = [
      ...new Set(data.map((item) => (item.cycle ?? item.name) || null)),
    ].filter(Boolean);

    const riscos = [...new Set(data.map((item) => item.risk || null))].filter(
      Boolean,
    );

    const inherentResults = [
      ...new Set(data.map((item) => getRiskResultLabel(item.resultInherent))),
    ].filter(Boolean);

    const residualResults = [
      ...new Set(data.map((item) => getRiskResultLabel(item.resultResidual))),
    ].filter(Boolean);

    const plannedResults = [
      ...new Set(data.map((item) => getRiskResultLabel(item.resultPlanned))),
    ].filter(Boolean);

    setCiclosOptions(ciclos);
    setRiscosOptions(riscos);
    setResultInherentOptions(inherentResults);
    setResultResidualOptions(residualResults);
    setResultPlannedOptions(plannedResults);
  }, [data]);

  // Aplica os filtros selecionados
  const applyFilters = () => {
    const newFilters = [];

    if (draftFilters.ciclo.length > 0) {
      newFilters.push({ type: "Ciclo", values: draftFilters.ciclo });
    }

    if (draftFilters.risco.length > 0) {
      newFilters.push({ type: "Risco", values: draftFilters.risco });
    }

    if (draftFilters.status.length > 0) {
      newFilters.push({
        type: "Status",
        values: draftFilters.status.map((s) => s.value),
      });
    }

    if (draftFilters.assessmentStatus.length > 0) {
      newFilters.push({
        type: "Status da avaliação",
        values: draftFilters.assessmentStatus.map((s) => s.value),
      });
    }

    if (draftFilters.resultInherent.length > 0) {
      newFilters.push({
        type: "Resultado inerente",
        values: draftFilters.resultInherent,
      });
    }

    if (draftFilters.resultResidual.length > 0) {
      newFilters.push({
        type: "Resultado residual",
        values: draftFilters.resultResidual,
      });
    }

    if (draftFilters.resultPlanned.length > 0) {
      newFilters.push({
        type: "Resultado planejado",
        values: draftFilters.resultPlanned,
      });
    }

    setSelectedFilters(newFilters);
    toggleDrawer();
  };

  // Remove filtro selecionado
  const removeFilter = (index) => {
    setSelectedFilters((prev) => {
      const filterToRemove = prev[index];

      setDraftFilters((prevDraft) => {
        const updatedDraft = { ...prevDraft };

        if (filterToRemove.type === "Ciclo") {
          updatedDraft.ciclo = updatedDraft.ciclo.filter(
            (value) => !filterToRemove.values.includes(value),
          );
        } else if (filterToRemove.type === "Risco") {
          updatedDraft.risco = updatedDraft.risco.filter(
            (value) => !filterToRemove.values.includes(value),
          );
        } else if (filterToRemove.type === "Status") {
          updatedDraft.status = updatedDraft.status.filter(
            (opt) => !filterToRemove.values.includes(opt.value),
          );
        } else if (filterToRemove.type === "Status da avaliação") {
          updatedDraft.assessmentStatus = updatedDraft.assessmentStatus.filter(
            (opt) => !filterToRemove.values.includes(opt.value),
          );
        } else if (filterToRemove.type === "Resultado inerente") {
          updatedDraft.resultInherent = updatedDraft.resultInherent.filter(
            (value) => !filterToRemove.values.includes(value),
          );
        } else if (filterToRemove.type === "Resultado residual") {
          updatedDraft.resultResidual = updatedDraft.resultResidual.filter(
            (value) => !filterToRemove.values.includes(value),
          );
        } else if (filterToRemove.type === "Resultado planejado") {
          updatedDraft.resultPlanned = updatedDraft.resultPlanned.filter(
            (value) => !filterToRemove.values.includes(value),
          );
        }

        return updatedDraft;
      });

      // Remove o filtro da lista de filtros selecionados
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveAllFilters = () => {
    setSelectedFilters([]);
    setGlobalFilter("");
    setDraftFilters({
      ciclo: [],
      risco: [],
      status: [],
      assessmentStatus: [],
      resultInherent: [],
      resultResidual: [],
      resultPlanned: [],
    });
  };

  // Filtra os ciclos com base nos filtros selecionados
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const cycleValue = item.cycle ?? item.name;

      return selectedFilters.every((filter) => {
        if (filter.type === "Ciclo") return filter.values.includes(cycleValue);
        if (filter.type === "Risco") return filter.values.includes(item.risk);
        if (filter.type === "Status") return filter.values.includes(item.active);
        if (filter.type === "Status da avaliação")
          return filter.values.includes(item.assessmentStatus);
        if (filter.type === "Resultado inerente")
          return filter.values.includes(getRiskResultLabel(item.resultInherent));
        if (filter.type === "Resultado residual")
          return filter.values.includes(getRiskResultLabel(item.resultResidual));
        if (filter.type === "Resultado planejado")
          return filter.values.includes(getRiskResultLabel(item.resultPlanned));
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
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
  });

  useEffect(
    () =>
      setColumnVisibility({
        comarca: false,
        instancia: false,
        dataDistribuicao: false,
        orgao: false,
        valorCausa: false,
        acao: false,
        posicaoProcessual: false,
        area: false,
      }),
    [],
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
    }),
  );

  // Função para realizar a marcação de texto
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
          <DebouncedInput
            value={globalFilter ?? ""}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder={`Pesquise pelo risco ou ciclo`}
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
          <div style={verticalDividerStyle}></div>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Inserir o botão aqui */}
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
                    state: { indoPara: "NovaAvaliacaoRisco" },
                  });
                }}
                startIcon={<PlusOutlined />}
                style={{ borderRadius: "20px", height: "32px" }}
              >
                Novo
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
                    .map((v) => {
                      if (filter.type === "Status")
                        return v === true ? "Ativo" : "Inativo";

                      if (filter.type === "Status da avaliação") {
                        const opt = assessmentStatusOptions.find(
                          (o) => o.value === Number(v),
                        );
                        return opt?.label ?? `Status ${v}`;
                      }

                      return v;
                    })
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

      {/* Drawer para filtros */}
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
                Ciclo
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ciclosOptions}
                  value={draftFilters.ciclo}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, ciclo: value }))
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
                  options={riscosOptions}
                  value={draftFilters.risco}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, risco: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Status
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  options={statusOptions}
                  value={draftFilters.status}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, status: value }))
                  }
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Status da avaliação
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  options={assessmentStatusOptions}
                  value={draftFilters.assessmentStatus}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      assessmentStatus: value,
                    }))
                  }
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Resultado inerente
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={resultInherentOptions}
                  value={draftFilters.resultInherent}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      resultInherent: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Resultado residual
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={resultResidualOptions}
                  value={draftFilters.resultResidual}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      resultResidual: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Resultado planejado
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={resultPlannedOptions}
                  value={draftFilters.resultPlanned}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      resultPlanned: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
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
                            <TableRow>
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
                            <EmptyTable msg="Ciclos não encontrados" />
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
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
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
      const response = await fetch(
        `${API_COMMAND}/api/Orgao/${row.original.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        enqueueSnackbar(`Empresa ${row.original.nome} excluído.`, {
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
          `Falha ao excluir o empresa: ${response.status} ${response.statusText} - ${errorBody}`,
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
              navigation(`/avaliacoes/criar`, {
                state: {
                  indoPara: "NovoPlano",
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
                  cursor: "default",
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
            Tem certeza que deseja excluir o empresa "{row.original.nome}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Esse empresa não será mais disponibilizado ao cadastrar um novo
            processo.
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
                  cursor: "default",
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
              Exclusão não permitida
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
            Não é possível excluir o Empresa.
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            O empresa não pode ser excluído pois está vinculado a processos. É
            possível inativar o empresa nas configurações de edição.
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

// Componente principal da página de listagem de registros
const ListagemEmpresa = ({ cicloId }) => {
  const theme = useTheme();
  const navigation = useNavigate();
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const { acoesJudiciais: lists, isLoading } = useGetCiclos(
    formData,
    cicloId,
    processoSelecionadoId,
  );
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handler para atualizar 'formData' e disparar uma nova consulta
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

  // Função para fechar modais
  const handleClose = () => {
    setOpen(!open);
  };

  // Função callback para atualizar formData
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  // helpers (coloque acima do useMemo, dentro do componente)
  const isEmptyDotNetDate = (v) =>
    !v || (typeof v === "string" && v.startsWith("0001-01-01"));

  const formatDateTime = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(d);
  };

  const assessmentStatusMeta = (status) => {
    const statusConfig = {
      1: { label: "Não Iniciado", color: "default" },
      2: { label: "Em Avaliação", color: "warning" },
      3: { label: "Completa", color: "info" },
      4: { label: "Finalizado", color: "success" },
      5: { label: "Finalizado", color: "success" },
    };

    return statusConfig[Number(status)] || {
      label: status || "—",
      color: "default",
    };
  };

  const renderRiskResultChip = (value) => {
    const parsed = parseRiskResultValue(value);

    if (!parsed?.name) {
      return <Typography sx={{ fontSize: "13px" }}>—</Typography>;
    }

    return (
      <Chip
        label={parsed.name}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "6px",
          backgroundColor: parsed.color || "#f3f4f6",
          color: parsed.color ? getReadableChipTextColor(parsed.color) : "#00000099",
        }}
      />
    );
  };

  // Definição das colunas da tabela (baseado no JSON)
  const columns = useMemo(
    () => [
      {
        header: "Risco",
        accessorKey: "risk",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: "13px", cursor: "pointer" }}
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/avaliacoes/criar`, {
                state: {
                  indoPara: "NovoPlano",
                  dadosApi,
                },
              });
            }}
          >
            {row.original.risk ?? "—"}
          </Typography>
        ),
      },

      {
        header: "Status da avaliação",
        accessorKey: "assessmentStatus",
        cell: ({ row }) => {
          const meta = assessmentStatusMeta(row.original.assessmentStatus);

          return (
            <Chip
              label={meta.label}
              color={meta.color}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "11px",
                height: "24px",
                borderRadius: "6px",
              }}
            />
          );
        },
      },

      // ======= Resultados (result*) =======
      {
        header: "Risco Inerente",
        accessorKey: "resultInherent",
        cell: ({ row }) => renderRiskResultChip(row.original.resultInherent),
      },
      {
        header: "Risco Residual",
        accessorKey: "resultResidual",
        cell: ({ row }) => renderRiskResultChip(row.original.resultResidual),
      },
      {
        header: "Risco Planejado",
        accessorKey: "resultPlanned",
        cell: ({ row }) => renderRiskResultChip(row.original.resultPlanned),
      },

      
      {
        header: "Data de criação",
        accessorKey: "date",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatDateTime(row.original.date)}
          </Typography>
        ),
      },

       {
        header: "Conclusão",
        accessorKey: "dateOfConclusion",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {isEmptyDotNetDate(row.original.dateOfConclusion)
              ? "—"
              : formatDateTime(row.original.dateOfConclusion)}
          </Typography>
        ),
      },

      {
        header: "Status (Ativo)",
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
                color:
                  row.original.active === true ? "success.main" : "error.main",
                marginLeft: "4px",
              },
            }}
            icon={
              <span
                style={{
                  backgroundColor:
                    row.original.active === true ? "green" : "red",
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

      // Ações
      {
        header: " ",
        disableSortBy: true,
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

  return (
    <>
      {isInitialLoad && isLoading ? (
        // Exibir indicador de carregamento apenas no carregamento inicial
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
