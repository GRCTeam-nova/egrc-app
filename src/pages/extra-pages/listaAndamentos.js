/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Fragment, useMemo, useState, useEffect } from "react";
import { API_QUERY, API_COMMAND } from "../../config";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DescriptionIcon from "@mui/icons-material/Description";
import CustomerModal from "../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../sections/apps/customer/AlertCustomerDelete";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGetAndamentos } from "../../api/andamentos";
import { useLocation } from "react-router-dom";
import FiltrosAndamentosMenu from "../extra-pages/filtrosAndamentos";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { CloseCircleOutlined } from "@ant-design/icons";
import Autocomplete from "@mui/material/Autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {
  faRetweet,
  faUser,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft, faVideo } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import emitter from "./eventEmitter";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ptBR from "date-fns/locale/pt-BR";
import { Backdrop } from "@mui/material";
// project import
import MainCard from "../../components/MainCard";
import AndamentoHistoricoDrawer from "./AndamentoHistoricoDrawer";
import SimpleBar from "../../components/third-party/SimpleBar";
import CheckIcon from "@mui/icons-material/Check";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  Grid,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Drawer,
  InputLabel,
  TextField,
  useMediaQuery,
} from "@mui/material";

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// project-import
import ScrollX from "../../components/ScrollX";
import IconButton from "../../components/@extended/IconButton";
import CustomizedSteppers from "../extra-pages/stepper";
import CircularProgress from "@mui/material/CircularProgress";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../components/third-party/react-table";

// assets
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";

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

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  processosTotal,
  onFormDataChange,
  andamentoIdDetalhes,
  onClearFilters,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState({});
  const [sortedData, setSortedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [andamentoIdDetalhe, setAndamentoIdDetalhe] = useState(
    andamentoIdDetalhes.andamentoIdDetalhes
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [grouping, setGrouping] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    origem: [],
    tipoAndamento: [],
    marco: "",
    dtInicioDataAndamento: null,
    dtFimDataAndamento: null,
    dtInicioPrazo: null,
    dtFimPrazo: null,
    teor: "",
  });
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [dadosOriginais] = useState([]);
  const [origemOptions, setOrigemOptions] = useState([]);
  const [tipoAndamentoOptions, setTipoAndamentoOptions] = useState([]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const buildEndpoint = (filters) => {
    const baseUrl = `${API_QUERY}/api/Andamento/Listar/${processoSelecionadoId}`;
    const params = new URLSearchParams();

    if (filters.origem.length > 0) {
      filters.origem.forEach((item) => params.append("Origem", item.value));
    }

    if (filters.tipoAndamento.length > 0) {
      filters.tipoAndamento.forEach((item) =>
        params.append("TipoAndamento", item.value)
      );
    }

    if (filters.marco !== "") {
      params.append("marco", filters.marco);
    }

    if (filters.dtInicioDataAndamento) {
      params.append(
        "dtInicioDataAndamento",
        filters.dtInicioDataAndamento.toISOString()
      );
    }

    if (filters.dtFimDataAndamento) {
      params.append(
        "dtFimDataAndamento",
        filters.dtFimDataAndamento.toISOString()
      );
    }

    if (filters.dtInicioPrazo) {
      params.append("dtInicioPrazo", filters.dtInicioPrazo.toISOString());
    }

    if (filters.dtFimPrazo) {
      params.append("dtFimPrazo", filters.dtFimPrazo.toISOString());
    }

    if (filters.teor) {
      params.append("teor", filters.teor);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleFilterApply = async (newFilters) => {
    const endpoint = buildEndpoint(newFilters);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      onFormDataChange(data);
      setFilters(newFilters);
      setSortedData(data);
    } catch (error) { }

    setIsDrawerOpen(false);
  };

  const handleRemoveFilter = (filterKey, value) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[filterKey])) {
      newFilters[filterKey] = newFilters[filterKey].filter(
        (item) => item.value !== value
      );
    } else {
      newFilters[filterKey] = filterKey === "marco" ? "" : null;
    }
    handleFilterApply(newFilters);
  };

  const isAnyFilterApplied = () => {
    return (
      filters.origem.length > 0 ||
      filters.tipoAndamento.length > 0 ||
      filters.marco !== "" ||
      filters.dtInicioDataAndamento !== null ||
      filters.dtFimDataAndamento !== null ||
      filters.dtInicioPrazo !== null ||
      filters.dtFimPrazo !== null ||
      filters.teor !== ""
    );
  };

  useEffect(() => {
    const handleAndamentoIdDetalhes = (id) => {
      setAndamentoIdDetalhe(id);
      setExpanded({ [id]: true });

      window.scrollBy({
        top: 300,
        behavior: "smooth",
      });
    };
    emitter.emit("editAndamento", andamentoIdDetalhe, true);
    emitter.on("andamentoIdDetalhes", handleAndamentoIdDetalhes);

    return () => {
      emitter.off("andamentoIdDetalhes", handleAndamentoIdDetalhes);
    };
  }, []);

  useEffect(() => {
    if (
      andamentoIdDetalhe &&
      data.some((row) => row.id === andamentoIdDetalhe)
    ) {
      setExpanded((prevExpanded) => ({
        ...prevExpanded,
        [andamentoIdDetalhe]: true,
      }));
    }
  }, [andamentoIdDetalhe]);

  useEffect(() => {
    if (data.length > 0) {
      let sorted;
      if (
        andamentoIdDetalhe &&
        data.some((row) => row.id === andamentoIdDetalhe)
      ) {
        sorted = [...data];
        const index = sorted.findIndex((row) => row.id === andamentoIdDetalhe);
        const [selectedItem] = sorted.splice(index, 1);
        sorted.unshift(selectedItem);
      } else {
        sorted = data;
      }
      setSortedData(sorted);

      // Definindo opções de origem e tipo de andamento apenas se não houver filtros ativos
      if (!isAnyFilterApplied()) {
        const uniqueOrigemOptions = Array.from(
          new Map(
            data.map((item) => [
              item.origemAndamentoId,
              {
                label: item.nomeOrigemAndamento,
                value: item.origemAndamentoId,
              },
            ])
          ).values()
        ).sort((a, b) => a.label.localeCompare(b.label));

        const uniqueTipoAndamentoOptions = Array.from(
          new Map(
            data.map((item) => [
              item.tipoAndamentoId,
              { label: item.nomeTipoAndamento, value: item.tipoAndamentoId },
            ])
          ).values()
        ).sort((a, b) => a.label.localeCompare(b.label));

        setOrigemOptions(uniqueOrigemOptions);
        setTipoAndamentoOptions(uniqueTipoAndamentoOptions);
      }
    }
  }, [data, andamentoIdDetalhe, dadosOriginais]);

  const handleRemoveAllFilters = () => {
    const clearedFilters = {
      origem: [],
      tipoAndamento: [],
      marco: "",
      dtInicioDataAndamento: null,
      dtFimDataAndamento: null,
      dtInicioPrazo: null,
      dtFimPrazo: null,
      teor: "",
    };
    setFilters(clearedFilters);
    onFormDataChange([]);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  useEffect(() => {
    const handleAndamentoSubmit = (
      nomeOrigemAndamento,
      origemId,
      nomeTipoAndamento,
      tipoAndamentoId
    ) => {
      if (!origemOptions.some((option) => option.value === origemId)) {
        setOrigemOptions((prev) => [
          ...prev,
          { label: nomeOrigemAndamento, value: origemId },
        ]);
      }

      if (
        !tipoAndamentoOptions.some((option) => option.value === tipoAndamentoId)
      ) {
        setTipoAndamentoOptions((prev) => [
          ...prev,
          { label: nomeTipoAndamento, value: tipoAndamentoId },
        ]);
      }
      emitter.emit("updateAndamentos");
    };

    emitter.on("andamentoSubmit", handleAndamentoSubmit);

    return () => {
      emitter.off("andamentoSubmit", handleAndamentoSubmit);
    };
  }, [origemOptions, tipoAndamentoOptions]);

  useEffect(() => {
    if (grouping.length > 0) {
      setPageSize(100);
    } else {
      setPageSize(10);
    }
  }, [grouping]);

  const table = useReactTable({
    data: sortedData,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      expanded,
      columnVisibility,
      grouping,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    getRowCanExpand: () => true,
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
    pageSize: pageSize,
    sortingFns: {
      datetime: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.original[columnId]);
        const dateB = new Date(rowB.original[columnId]);
        return dateA - dateB;
      },
    },
  });

  useEffect(() => {
    setColumnVisibility({
      comarca: false,
      instancia: false,
      dataDistribuicao: false,
      orgao: false,
      valorCausa: false,
      acao: false,
      posicaoProcessual: false,
      area: false,
    });
  }, []);

  useEffect(() => {
    if (needsUpdate) {
      handleFilterApply(filters);
      setNeedsUpdate(false);
    }
  }, [needsUpdate]);

  // Listen for update events
  useEffect(() => {
    const updateHandler = () => {
      setNeedsUpdate(true);
    };

    emitter.on("updateAndamentos", updateHandler);

    return () => {
      emitter.off("updateAndamentos", updateHandler);
    };
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderChip = (label, value, onDelete) => (
    <Chip
      label={
        <Box display="flex" alignItems="center">
          <Typography
            sx={{ color: "#1C5297", fontWeight: 600, marginRight: "4px" }}
          >
            {label}:
          </Typography>
          <Typography sx={{ color: "#1C5297", fontWeight: 400 }}>
            {value}
          </Typography>
        </Box>
      }
      onDelete={onDelete}
      sx={{
        margin: 0.5,
        backgroundColor: "#1C52971A",
        border: "0.7px solid #1C529733",
      }}
    />
  );

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          marginBottom: 3,
          ...(matchDownSM && {
            "& .MuiOutlinedInput-root, & .MuiFormControl-root": {
              width: "100%",
            },
          }),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DebouncedInput
            value={globalFilter ?? ""}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder="Pesquise pelo nome do andamento"
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
            }}
          />
          <Button
            onClick={() => setIsDrawerOpen(true)}
            startIcon={
              <FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />
            }
            style={{
              width: "90px",
              color: "#00000080",
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
          <DrawerNovoAndamento
            andamentoIdDetalhes={andamentoIdDetalhes}
            open={isModalOpen}
            handleClose={handleCloseModal}
          />
        </Stack>

        <FiltrosAndamentosMenu
          open={isDrawerOpen}
          onClose={handleDrawerClose}
          onFilter={handleFilterApply}
          initialFilters={filters}
          origemOptions={origemOptions}
          tipoAndamentoOptions={tipoAndamentoOptions}
        />
      </Stack>

      <Box mb={2}>
        {filters.origem.map((origem) =>
          renderChip("Origem", origem.label, () =>
            handleRemoveFilter("origem", origem.value)
          )
        )}
        {filters.tipoAndamento.map((tipo) =>
          renderChip("Tipo de Andamento", tipo.label, () =>
            handleRemoveFilter("tipoAndamento", tipo.value)
          )
        )}
        {filters.marco &&
          renderChip("Marco", filters.marco === "true" ? "Sim" : "Não", () =>
            handleRemoveFilter("marco", filters.marco)
          )}
        {filters.dtInicioDataAndamento &&
          renderChip(
            "Data do Andamento - Início",
            new Date(filters.dtInicioDataAndamento).toLocaleDateString(),
            () => handleRemoveFilter("dtInicioDataAndamento")
          )}
        {filters.dtFimDataAndamento &&
          renderChip(
            "Data do Andamento - Fim",
            new Date(filters.dtFimDataAndamento).toLocaleDateString(),
            () => handleRemoveFilter("dtFimDataAndamento")
          )}
        {filters.dtInicioPrazo &&
          renderChip(
            "Prazo Judicial - Início",
            new Date(filters.dtInicioPrazo).toLocaleDateString(),
            () => handleRemoveFilter("dtInicioPrazo")
          )}
        {filters.dtFimPrazo &&
          renderChip(
            "Prazo Judicial - Fim",
            new Date(filters.dtFimPrazo).toLocaleDateString(),
            () => handleRemoveFilter("dtFimPrazo")
          )}
        {filters.teor &&
          renderChip("Teor", filters.teor, () => handleRemoveFilter("teor"))}
        {isAnyFilterApplied() && (
          <Chip
            label="Limpar Filtros"
            onClick={handleRemoveAllFilters}
            sx={{
              margin: 0.5,
              backgroundColor: "transparent",
              color: "#1C5297",
              fontWeight: 600,
              border: "none",
            }}
          />
        )}
      </Box>

      <MainCard content={false}>
        <ScrollX>
          <Stack>
            <RowSelection selected={Object.keys(rowSelection).length} />
            <TableContainer>
              <Table>
                <TableHead className="sticky-header">
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
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          {...header.column.columnDef.meta}
                          onClick={header.column.getToggleSortingHandler()}
                          sx={{
                            fontSize: "11px",
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.87)"
                              : "rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {header.column.getCanGroup() && (
                                <Tooltip
                                  title={
                                    header.column.getIsGrouped()
                                      ? "Desagrupar"
                                      : "Agrupar"
                                  }
                                  placement="top"
                                >
                                  <IconButton
                                    color={
                                      header.column.getIsGrouped()
                                        ? "error"
                                        : "primary"
                                    }
                                    onClick={header.column.getToggleGroupingHandler()}
                                    size="small"
                                    sx={{
                                      p: 0,
                                      width: 24,
                                      height: 24,
                                      fontSize: "1rem",
                                      mr: 0.75,
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faLayerGroup}
                                      style={{
                                        color: header.column.getIsGrouped()
                                          ? undefined
                                          : "#1C5297",
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Box>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </Box>
                              {header.column.getCanSort() && (
                                <HeaderSort column={header.column} sort />
                              )}
                            </Stack>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <EmptyTable msg="Dados não encontrados" />
                      </TableCell>
                    </TableRow>
                  ) : (
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
                                fontWeight: 400,
                                backgroundColor: cell.getIsGrouped()
                                  ? theme.palette.primary.lighter
                                  : cell.getIsAggregated()
                                    ? theme.palette.primary.lighter
                                    : cell.getIsPlaceholder()
                                      ? "white"
                                      : "inherit",
                              }}
                            >
                              {cell.getIsGrouped() ? (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                >
                                  <IconButton
                                    color="secondary"
                                    onClick={row.getToggleExpandedHandler()}
                                    size="small"
                                    sx={{ p: 0, width: 24, height: 24 }}
                                  >
                                    {row.getIsExpanded() ? (
                                      <DownOutlined />
                                    ) : (
                                      <RightOutlined />
                                    )}
                                  </IconButton>
                                  <Box>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </Box>{" "}
                                  <Box>({row.subRows.length})</Box>
                                </Stack>
                              ) : cell.getIsAggregated() ? (
                                flexRender(
                                  cell.column.columnDef.aggregatedCell ??
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )
                              ) : cell.getIsPlaceholder() ? null : (
                                flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {row.getIsExpanded() && !row.getIsGrouped() && (
                          <ExpandedRowComponent row={row} />
                        )}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount,
                  initialPageSize: pageSize,
                  totalItems: processosTotal,
                  recordType: "Andamentos",
                }}
              />
            </Box>
          </Stack>
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
  onClearFilters: PropTypes.func,
};

function ActionCell({ row }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    const AndamentosDadosEditar = row.original;
    let verDetalhes = true;
    emitter.emit("editAndamento", AndamentosDadosEditar, verDetalhes);
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
        style={{ color: "#1C5297CC", fontWeight: 900 }}
        onClick={handleEdit}
      >
        <VisibilityIcon sx={{ fontSize: "20px" }} />
      </IconButton>
      <IconButton
        aria-describedby={id}
        color="primary"
        style={{ color: "#1C5297CC", fontWeight: 900 }}
      >
        <DescriptionIcon sx={{ fontSize: "20px" }} />
      </IconButton>
      <IconButton
        aria-describedby={id}
        color="primary"
        onClick={handleClick}
        style={{ color: "#1C5297CC", fontWeight: 900 }}
      >
        <MoreVertIcon sx={{ fontSize: "20px" }} />
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
            startIcon={<EditOutlined />}
            onClick={() => {
              const AndamentosDadosEditar = row.original;
              emitter.emit("editAndamento", AndamentosDadosEditar, false);
              handleClose();
            }}
            color="primary"
          >
            Editar
          </Button>
          <Button
            startIcon={<DeleteOutlined />}
            onClick={() => {
              handleClose();
            }}
            color="error"
          >
            Deletar
          </Button>
        </Stack>
      </Popover>
    </Stack>
  );
}

// ==============================|| LISTAGEM ||============================== //

// Componente de linha expandida
const ExpandedRowComponent = ({ row }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const buttonStyle = {
    marginRight: "10px",
    height: "26px",
    borderRadius: "4px",
    border: "0.6px solid #00000033",
    color: "#717171",
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell colSpan={9}>
          <Box margin={2}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  style={{
                    color: "#717171CC",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Cadastro:{" "}
                  <span style={{ fontWeight: 400, marginLeft: "8px" }}>
                    {row.original.geradoManualmente ? "Manual" : "Automático"}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography
                  variant="body2"
                  style={{
                    color: "#717171CC",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Data de Cadastro:{" "}
                  <span style={{ fontWeight: 400, marginLeft: "8px" }}>
                    {row.original.dataCriacao}
                  </span>
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: -3,
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={
                    <FontAwesomeIcon
                      icon={faClockRotateLeft}
                      style={{ color: "#717171" }}
                    />
                  }
                  style={buttonStyle}
                  onClick={handleDrawerOpen}
                >
                  Histórico
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ marginBottom: 1.5 }}>
                <Typography
                  variant="body2"
                  style={{
                    color: "#717171CC",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Teor:{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      marginLeft: "8px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {row.original.teor}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  style={{
                    width: "100%",
                    height: "46px",
                    background: "#1C52970D",
                    border: "0.6px solid #00000033",
                    justifyContent: "start",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{
                      width: "100%",
                      color: "#1C5297CC",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Avaliar Sentença{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        marginLeft: "8px",
                        color: "#00000099",
                        fontSize: "12px",
                        textDecoration: "underline",
                        textTransform: "lowercase",
                      }}
                    >
                      <span style={{ textTransform: "capitalize" }}>i</span>r
                      para workflow
                    </span>
                  </Box>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  style={{
                    width: "100%",
                    height: "46px",
                    background: "#FAAD140D",
                    border: "0.6px solid #00000033",
                    justifyContent: "start",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{
                      width: "100%",
                      color: "#C08000",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Mandar Mensagem{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        marginLeft: "8px",
                        color: "#00000099",
                        fontSize: "12px",
                        textDecoration: "underline",
                        textTransform: "lowercase",
                      }}
                    >
                      <span style={{ textTransform: "capitalize" }}>i</span>r
                      para workflow
                    </span>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TableCell>
      </TableRow>
      <AndamentoHistoricoDrawer
        row={row}
        open={drawerOpen}
        onClose={handleDrawerClose}
        vindoDe={"Andamentos"}
      />
    </>
  );
};
// Componente principal da página de listagem de registros
const ListagemAndamentos = (andamentoIdDetalhes) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const { andamentos: lists, isLoading } = useGetAndamentos(
    formData,
    processoSelecionadoId
  );
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    // Define a linha a ser expandida com base no ID fornecido inicialmente
    if (andamentoIdDetalhes) {
      setExpandedRowId(andamentoIdDetalhes);
    }
  }, [andamentoIdDetalhes]);

  // Handler para atualizar 'formData' e disparar uma nova consulta
  const refreshAndamentos = () => {
    setFormData((currentData) => ({
      ...currentData,
      refreshCount: currentData.refreshCount + 1,
    }));
  };

  useEffect(() => {
    const refreshHandler = () => {
      refreshAndamentos();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
    };
  }, []);

  // Filtra a lista para incluir somente os clientes com 'marco' como true
  const marcoTrueLists = useMemo(() => {
    if (lists && lists.length) {
      return lists.filter((item) => item.marco === true);
    }
    return [];
  }, [lists]);

  // Função para fechar modais
  const handleClose = () => {
    setOpen(!open);
  };

  // Função callback para atualizar formData
  const handleFormDataChange = (newFormData) => {
    setFilteredData(newFormData);
    setIsFiltered(true);
  };

  // Função para limpar a filtragem
  const handleClearFilter = () => {
    setFilteredData([]);
    setIsFiltered(false);
  };
  // Função para formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Definição das colunas da tabela
  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableGrouping: false,
        aggregatedCell: (cell) => cell.getValue()?.[0],
      },
      {
        header: "Andamento",
        accessorKey: "nomeTipoAndamento",
        cell: ({ row, column }) => {
          const isGrouped = column.getIsGrouped();
          if (isGrouped) {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#1C5297D9",
                  fontWeight: 600,
                }}
              >
                {row.original.nomeTipoAndamento}
              </div>
            );
          }
          const iconeTipoAndamento = row.original.geradoManualmente
            ? faRetweet
            : faUser;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#1C5297D9",
                fontWeight: 600,
              }}
            >
              <FontAwesomeIcon
                icon={iconeTipoAndamento}
                style={{
                  marginRight: "8px",
                  color:
                    iconeTipoAndamento === faUser ? "#1C5297D9" : "#4ECC8F",
                  fontWeight: 900,
                }}
              />
              {row.original.nomeTipoAndamento}
            </div>
          );
        },
      },
      {
        header: "Origem",
        accessorKey: "nomeOrigemAndamento",
        cell: ({ row, column }) => {
          const isGrouped = column.getIsGrouped();
          if (isGrouped) {
            return (
              <div style={{ fontWeight: 600 }}>
                {row.original.nomeOrigemAndamento}
              </div>
            );
          }
          return row.original.nomeOrigemAndamento;
        },
      },
      {
        header: "Dt Andamento",
        accessorKey: "dataAndamento",
        enableGrouping: false,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(
            rowA.original.dataAndamento.split("/").reverse().join("-")
          ).getTime();
          const dateB = new Date(
            rowB.original.dataAndamento.split("/").reverse().join("-")
          ).getTime();
          return dateA - dateB;
        },
        cell: ({ row }) => (
          <div>
            {isFiltered
              ? formatDate(row.original.dataAndamento)
              : row.original.dataAndamento}
          </div>
        ),
      },
      {
        header: "Prazo Judicial",
        accessorKey: "prazoJudicial",
        enableGrouping: false,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(
            rowA.original.prazoJudicial.split("/").reverse().join("-")
          ).getTime();
          const dateB = new Date(
            rowB.original.prazoJudicial.split("/").reverse().join("-")
          ).getTime();
          return dateA - dateB;
        },
        cell: ({ row }) => {
          const today = new Date().getTime();
          const prazoJudicialDate = new Date(
            row.original.prazoJudicial.split("/").reverse().join("-")
          ).getTime();
      
          const isPastDue = today > prazoJudicialDate;
          const textColor = isPastDue ? "red" : "#4ECC8F";
          const iconColor = isPastDue ? "rgba(137, 147, 158, 1)" : "rgba(28, 82, 151, 1)";
          const tooltipTitle = isPastDue
            ? "A audiência online já aconteceu"
            : "Audiência online";
      
          return (
            <div style={{ display: 'flex', alignItems: 'center', color: textColor }}>
              {isFiltered
                ? formatDate(row.original.prazoJudicial)
                : row.original.prazoJudicial}
              {(row.original.temAudiencia && row.original.urlAudiencia) && (
                <Tooltip
                  title={tooltipTitle}
                  placement="top"
                  arrow
                  style={{
                    backgroundColor: 'rgba(28, 82, 151, 1)',
                    color: 'white',
                    fontSize: '12px'
                  }}
                  PopperProps={{
                    modifiers: {
                      arrow: {
                        enabled: true
                      }
                    }
                  }}
                >
                  {isPastDue ? (
                    // Desabilitar o link se a audiência já ocorreu
                    <span
                      style={{ marginLeft: '8px', textDecoration: 'none' }}
                    >
                      <Chip
                        style={{
                          backgroundColor: iconColor,
                          marginLeft: 4,
                          color: 'white',
                          width: '24px',
                          height: '24px',
                          gap: 0,
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        icon={
                          <FontAwesomeIcon
                            icon={faVideo}
                            style={{ color: "white", marginLeft: 18 }}
                          />
                        }
                        label=""
                      />
                    </span>
                  ) : (
                    // Link habilitado se a audiência ainda não ocorreu
                    <a
                      href={row.original.urlAudiencia}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '8px', textDecoration: 'none' }}
                    >
                      <Chip
                        style={{
                          backgroundColor: iconColor,
                          color: 'white',
                          width: '24px',
                          height: '24px',
                          marginLeft: 4,
                          gap: 0,
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        icon={
                          <FontAwesomeIcon
                            icon={faVideo}
                            style={{ color: "white", marginLeft: 18 }}
                          />
                        }
                        label=""
                      />
                    </a>
                  )}
                </Tooltip>
              )}
            </div>
          );
        },
      },      
      {
        header: "Marco",
        enableSorting: true,
        accessorKey: "marco",
        cell: ({ row, column }) => {
          const isGrouped = column.getIsGrouped();
          if (isGrouped) {
            const hasMarco = row.subRows.some(
              (subRow) => subRow.original.marco
            );
            return hasMarco ? (
              <CheckIcon style={{ color: "green" }} />
            ) : (
              <CloseIcon style={{ color: "red", marginBottom: -6 }} />
            );
          }
          return row.original.marco ? (
            <CheckIcon
              style={{
                color: "green",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          ) : null;
        },
      },
      {
        header: " ",
        accessorKey: "temTarefa",
        enableGrouping: false,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.temTarefa ? (
            <Chip
              label="Tarefa Avulsa"
              style={{
                backgroundColor: isDarkMode ? "#1976d2" : "#FAAD1426",
                color: "#C08000",
                fontSize: "13px",
                fontWeight: 600,
                marginRight: "2px",
                borderRadius: "8px",
              }}
            />
          ) : null,
      },
      {
        header: " ",
        accessorKey: "temWorkflow",
        enableGrouping: false,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.temWorkflow ? (
            <Chip
              label="Workflow"
              style={{
                backgroundColor: isDarkMode ? "#1976d2" : "#1E529426",
                color: "#1E5294",
                fontSize: "13px",
                fontWeight: 600,
                marginRight: "2px",
                borderRadius: "8px",
              }}
            />
          ) : null,
      },
      {
        header: " ",
        enableGrouping: false,
        disableSortBy: true,
        cell: ({ row }) => {
          const isExpanded = row.getCanExpand() && row.getIsExpanded();
          const collapseIcon = isExpanded ? (
            <ExpandMoreIcon
              style={{ color: "#1C5297", fontWeight: 900, fontSize: "20px" }}
            />
          ) : (
            <ChevronLeftIcon
              style={{ color: "#1C5297", fontWeight: 900, fontSize: "20px" }}
            />
          );

          const tooltipTitle = isExpanded
            ? "Fechar Detalhes"
            : "Mostrar Detalhes";

          return (
            <Stack
              direction="row"
              alignItems="right"
              justifyContent="right"
              sx={{ marginRight: -2 }}
            >
              <ActionCell row={row} />
              <Tooltip title={tooltipTitle} placement="top">
                <IconButton
                  color="secondary"
                  onClick={row.getToggleExpandedHandler()}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [theme, isDarkMode, isFiltered]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const displayedData = isFiltered ? filteredData.andamentos : lists;

  return (
    <>
      <Box>
        <span
          style={{
            color: "#1C5297",
            fontFamily: "Open Sans, Helvetica, sans-serif",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}
        >
          Andamentos
        </span>
      </Box>

      {marcoTrueLists && marcoTrueLists.length > 0 && (
        <CustomizedSteppers andamentosTimeline={marcoTrueLists} />
      )}

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
        <Box my={4}>
          {displayedData && (
            <>
              <ReactTable
                {...{
                  data: displayedData,
                  expandedRowId: expandedRowId,
                  columns,
                  modalToggler: () => {
                    setCustomerModal(true);
                    setSelectedCustomer(null);
                  },
                  andamentoIdDetalhes,
                  processosTotal,
                  onFormDataChange: handleFormDataChange,
                  isLoading,
                  onClearFilters: handleClearFilter,
                }}
              />
            </>
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

const DrawerNovoAndamento = () => {
  const [formData, setFormData] = useState({
    tipoAndamento: "",
    origem: "",
    tipoAudiencia: "",
    dataAndamento: null,
    prazoJudicial: null,
    teor: "",
    tipoAlerta: [],
    tarefas: [],
    documentos: [],
  });

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const simpleBarRef = useRef(null);
  const [tiposAndamentos, setTiposAndamentos] = useState([]);
  const [tiposAudiencias, setTiposAudiencias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [origens, setOrigem] = useState([]);
  const [prioridades, setPrioridade] = useState([]);
  const [responsaveis, setResponsavel] = useState([]);
  const [erroDataAndamento, setErroDataAndamento] = useState(false);
  const [erroDataAudiencia, setErroDataAudiencia] = useState(false);
  const [erroPrazoJudicial, setErroPrazoJudicial] = useState(false);
  const [erroPrazoTarefa, setErroPrazoTarefa] = useState([]);
  const [exibirModalDetalhes, setExibirModalDetalhes] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mostrarDadosAudiencia, setMostrarDadosAudiencia] = useState(false);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [faseIdIgual, setFaseIdIgual] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationCallback, setConfirmationCallback] = useState(null);
  const [dadosAudiencia, setDadosAudiencia] = useState({
    tipoAudienciaId: "",
    dataAudiencia: null,
    alerta: 0,
    horasAntes: "",
    presencial: true,
    url: "",
  });

  const handleToggle = (editing = false) => {
    if (isFormChanged) {
      setShowConfirmationDialog(true);
      setConfirmationCallback(() => () => {
        setOpen(!open);
        setIsEditing(editing);
        setIsFormChanged(false);
      });
    } else {
      setOpen(!open);
      setIsEditing(editing);
    }
  };

  const handleDialogClose = () => {
    setShowConfirmationDialog(false);
    setFaseIdIgual(false);
  };

  const handleDialogConfirm = () => {
    if (confirmationCallback) {
      confirmationCallback();
    }
    setShowConfirmationDialog(false);
    setConfirmationCallback(null);
  };

  useEffect(() => {
    if (open && !isEditing) {
      setFormData({
        tipoAndamento: "",
        origem: "",
        dataAndamento: null,
        prazoJudicial: null,
        teor: "",
        tipoAlerta: [],
        tarefas: [],
        documentos: [],
      });
      setFiles([]);
      setFormValidation({
        tipoAndamento: true,
        origem: true,
        dataAndamento: true,
        prazoJudicial: true,
        tarefas: [],
        tipoAudiencia: true,
      });
      setErroDataAndamento(false);
      setErroDataAudiencia(false);
      setErroPrazoJudicial(false);
      setErroPrazoTarefa([]);
    }
  }, [open, isEditing]);

  const [tipoAndamentoNome, setTipoAndamentoNome] = useState([]);
  const [tipoAudienciaNome, setTipoAudienciaNome] = useState([]);
  const [tipoAndamentoId, setTipoAndamentoId] = useState([]);
  const [tipoAudienciaId, setTipoAudienciaId] = useState([]);

  const formatTime = (time) => {
    if (!time) return "";
    const hours = String(Math.floor(time)).padStart(2, '0');
    const minutes = "00";
    const seconds = "00";

    return `${hours}:${minutes}:${seconds}`;
  };


  useEffect(() => {
    const handleEditAndamento = async (dados, verDetalhes) => {
      if (dados == null) {
        return;
      }

      if (dados.temAudiencia === true) {
        setMostrarDadosAudiencia(true)
      } else {
        setMostrarDadosAudiencia(false)
      }

      setTipoAndamentoNome(dados.nomeTipoAndamento);
      setTipoAudienciaNome(dados.nomeTipoAudiencia);
      setTipoAndamentoId(dados.tipoAndamentoId);
      setTipoAudienciaId(dados.tipoAudienciaId);

      try {
        const response = await fetch(`${API_QUERY}/api/Andamento/${dados.id}`);
        if (!response.ok) {
          return;
        }
        const andamento = await response.json();
        setExibirModalDetalhes(verDetalhes ?? false);
        setTitulo(verDetalhes ? "Andamento" : "Editar Andamento");
        handleToggle(true);

        let tarefas = andamento.tarefas || [];
        tarefas = tarefas.map((tarefa) => ({
          descricao: tarefa.descricao || "",
          prazoTarefa: tarefa.prazo ? new Date(tarefa.prazo) : null,
          alerta: tarefa.alerta || "",
          tipoAlerta: tarefa.tipoAlerta || "1",
          usuarioId: tarefa.usuarioId || "",
          prioridadeId: tarefa.prioridadeId || "",
          concluida: tarefa.concluida || false,
        }));

        const tipoAlerta = tarefas.map((tarefa) => tarefa.tipoAlerta);

        setFormData({
          andamentoId: andamento.id || "",
          tipoAndamento: andamento.tipoAndamentoId || "",
          origem: andamento.origemAndamentoId || "",
          dataAndamento: andamento.dataAndamento
            ? new Date(andamento.dataAndamento)
            : null,
          prazoJudicial: andamento.prazoJudicial
            ? new Date(andamento.prazoJudicial)
            : "",
          teor: andamento.teor || "",
          tipoAlerta: tipoAlerta,
          tarefas: tarefas,
          documentos: andamento.documentos || [],
        });

        setDadosAudiencia({
          tipoAudienciaId: andamento.audencia.tipoAudienciaId || "",
          alerta: andamento.audencia.alerta !== null && andamento.audencia.alerta !== undefined ? andamento.audencia.alerta : "",
          url: andamento.audencia.url || "",
          presencial: andamento.audencia.presencial,
          horasAntes: andamento.audencia.horasAntes ? parseInt(andamento.audencia.horasAntes.split(":")[0], 10) : "",
          dataAudiencia: andamento.audencia.dataAudiencia ? new Date(andamento.audencia.dataAudiencia) : null,
        })

        setFormValidation({
          tipoAndamento: true,
          origem: true,
          dataAndamento: true,
          prazoJudicial: true,
          tipoAudiencia: true,
          tarefas: tarefas.map(() => ({
            descricao: true,
            usuarioId: true,
          })),
        });
      } catch (error) { }
    };

    emitter.on("editAndamento", handleEditAndamento);
    emitter.on("andamentoIdDetalhes", handleEditAndamento);

    return () => {
      emitter.off("editAndamento", handleEditAndamento);
      emitter.off("andamentoIdDetalhes", handleEditAndamento);
    };
  }, []);

  useEffect(() => {
    const fetchTiposAndamentos = async () => {
      const response = await fetch(
        `${API_QUERY}/api/TipoAndamento/ListarCombo`
      );
      const data = await response.json();

      const existingTipoAndamento = data.find(
        (tipo) => tipo.id === tipoAndamentoId
      );

      if (!existingTipoAndamento) {
        data.push({
          id: tipoAndamentoId,
          nome: tipoAndamentoNome,
        });
      }

      setTiposAndamentos(data);
    };

    const fetchTiposAudiencias = async () => {
      const response = await fetch(
        `${API_QUERY}/api/TipoAudiencia/ListarCombo`
      );
      const data = await response.json();

      const existingTipoAudiencia = data.find(
        (tipo) => tipo.id === tipoAudienciaId
      );

      if (!existingTipoAudiencia) {
        data.push({
          id: tipoAudienciaId,
          nome: tipoAudienciaNome,
        });
      }

      setTiposAudiencias(data);
    };

    const fetchOrigem = async () => {
      const response = await fetch(`${API_QUERY}/api/OrigemAndamento`);
      const data = await response.json();
      setOrigem(data);
    };

    const fetchPrioridade = async () => {
      const response = await fetch(`${API_QUERY}/api/Prioridade`);
      const data = await response.json();
      setPrioridade(data);
    };

    const fetchResponsavel = async () => {
      const response = await fetch(`${API_QUERY}/api/Usuario`);
      const data = await response.json();
      setResponsavel(data);
    };

    if (open) {
      fetchOrigem();
      fetchTiposAndamentos();
      fetchTiposAudiencias();
      fetchPrioridade();
      fetchResponsavel();
    }
  }, [open]);

  const buttonStyle = { marginRight: "10px" };

  const [formValidation, setFormValidation] = useState(() => {
    const baseValidation = {
      tipoAndamento: true,
      origem: true,
      tipoAudiencia: true,
      dataAndamento: true,
      dataAudiencia: true,
      prazoJudicial: true,
      tarefas: [],
    };

    return baseValidation;
  });

  const fieldNamesMap = {
    tipoAndamento: "Tipo de Andamento",
    tipoAudiencia: "Tipo de Audiência",
    origem: "Origem",
    dataAndamento: "Data de Andamento",
    dataAudiencia: "Data de Audiência",
    prazoJudicial: "Prazo Judicial",
    descricao: "Descrição",
    usuarioId: "Responsável",
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      tipoAndamento: !!formData.tipoAndamento,
      origem: !!formData.origem,
      dataAndamento: !!formData.dataAndamento,
      prazoJudicial: !!formData.prazoJudicial,
      tipoAudiencia: mostrarDadosAudiencia ? !!dadosAudiencia.tipoAudienciaId : true,
      dataAudiencia: mostrarDadosAudiencia ? !!dadosAudiencia.dataAudiencia : true,
      tarefas: formData.tarefas.map((tarefa) => ({
        descricao: !!tarefa.descricao,
        usuarioId: !!tarefa.usuarioId,
      })),
    };

    Object.entries(newValidationState).forEach(([key, value]) => {
      if (key === "tarefas") {
        value.forEach((tarefaValidation, index) => {
          Object.entries(tarefaValidation).forEach(
            ([tarefaKey, tarefaValue]) => {
              if (!tarefaValue) {
                foiValidado = false;
                invalidFields.push(
                  `${fieldNamesMap[tarefaKey]} da Tarefa ${index + 1}`
                );
              }
            }
          );
        });
      } else if (!value) {
        foiValidado = false;
        invalidFields.push(fieldNamesMap[key] || key);
      }
    });

    setFormValidation(newValidationState);

    if (!foiValidado) {
      const uniqueInvalidFields = [...new Set(invalidFields)];
      const fieldsMessage = uniqueInvalidFields.join(", ");
      enqueueSnackbar(`Campos inválidos: ${fieldsMessage}`, {
        variant: "error",
      });
    }

    return foiValidado;
  };

  const tratarSubmit = async () => {
    let temErros = false;
    const novoErroPrazoTarefa = [...erroPrazoTarefa];

    if (!validarForm()) {
      temErros = true;
    }

    if (formData.dataAndamento) {
      const dataAndamentoObj = new Date(formData.dataAndamento);
      const anoDataAndamento = dataAndamentoObj.getFullYear();
      if (isNaN(anoDataAndamento) || anoDataAndamento < 1000) {
        enqueueSnackbar(`O campo 'Data de Andamento' está inválido`, {
          variant: "error",
        });
        setErroDataAndamento(true);
        temErros = true;
      }
    }

    if (dadosAudiencia.dataAudiencia) {
      const dataAudienciaObj = new Date(dadosAudiencia.dataAudiencia);
      const anoDataAudiencia = dataAudienciaObj.getFullYear();
      if (isNaN(anoDataAudiencia) || anoDataAudiencia < 1000) {
        enqueueSnackbar(`O campo 'Data e horário de audiência está inválida`, {
          variant: "error",
        });
        setErroDataAudiencia(true);
        temErros = true;
      }
    }

    if (formData.prazoJudicial) {
      const prazoJudicialObj = new Date(formData.prazoJudicial);
      const anoPrazoJudicial = prazoJudicialObj.getFullYear();
      if (isNaN(anoPrazoJudicial) || anoPrazoJudicial < 1000) {
        enqueueSnackbar(`O campo 'Prazo Judicial' está inválido`, {
          variant: "error",
        });
        setErroPrazoJudicial(true);
        temErros = true;
      }
    }

    formData.tarefas.forEach((tarefa, index) => {
      if (tarefa.prazoTarefa) {
        const prazoTarefaObj = new Date(tarefa.prazoTarefa);
        const anoPrazoTarefa = prazoTarefaObj.getFullYear();
        if (isNaN(anoPrazoTarefa) || anoPrazoTarefa < 1000) {
          enqueueSnackbar(
            `O campo 'Prazo Tarefa' da tarefa ${index + 1} está inválido`,
            { variant: "error" }
          );
          novoErroPrazoTarefa[index] = true;
          temErros = true;
        } else {
          novoErroPrazoTarefa[index] = false;
        }
      }
    });

    setErroPrazoTarefa(novoErroPrazoTarefa);

    if (temErros) {
      return;
    }

    const documentos = await Promise.all(
      files.map(async (fileObj) => ({
        nome: fileObj.file.name,
        base64: await toBase64(fileObj.file),
      }))
    );

    const tipoAlertaArray = formData.tarefas.map((tarefa) =>
      parseInt(tarefa.tipoAlerta, 10)
    );

    // Pegar fase do processo
    const response = await fetch(
      `${API_QUERY}/api/Processo/${processoSelecionadoId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Erro na requisição");

    const processoDados = await response.json();

    // Pegar fase do tipo andamento
    const responseAndamento = await fetch(
      `${API_QUERY}/api/TipoAndamento/${formData.tipoAndamento}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!responseAndamento.ok) throw new Error("Erro na requisição");

    const andamentoDados = await responseAndamento.json();

    // Verificar se a faseId do andamento está vazia
    if (!andamentoDados.faseId) {
      await submitAndamento(andamentoDados.faseId, tipoAlertaArray, documentos);
      return;
    }

    if (processoDados.faseId !== andamentoDados.faseId) {
      setFaseIdIgual(true);
      setShowConfirmationDialog(true);
      setConfirmationCallback(() => async () => {
        await submitAndamento(
          andamentoDados.faseId,
          tipoAlertaArray,
          documentos
        );
      });
      return;
    }

    await submitAndamento(andamentoDados.faseId, tipoAlertaArray, documentos);
  };

  const submitAndamento = async (faseId, tipoAlertaArray) => {
    const nomeOrigemAndamento = origens.find(
      (origem) => origem.id === formData.origem
    )?.nome;
    const nomeTipoAndamento = tiposAndamentos.find(
      (tipoAndamento) => tipoAndamento.id === formData.tipoAndamento
    )?.nome;

    const bodyAndamento = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: formData.andamentoId,
        UsuarioId: 5,
        nomeOrigemAndamento,
        nomeTipoAndamento,
        tipoAndamentoId: formData.tipoAndamento,
        origemAndamentoId: formData.origem,
        dataAndamento: formData.dataAndamento,
        prazoJudicial: formData.prazoJudicial,
        teor: formData.teor,
        tipoAlerta: tipoAlertaArray,
        documentos: formData.documentos,
        processoId: processoSelecionadoId,
        tarefas: formData.tarefas.map((tarefa) => ({
          processoId: processoSelecionadoId,
          andamentoId: formData.andamentoId,
          descricao: tarefa.descricao,
          prazo: tarefa.prazoTarefa,
          alerta: tarefa.alerta === "" ? null : tarefa.alerta,
          tipoAlerta: tarefa.tipoAlerta,
          usuarioId: tarefa.usuarioId,
          prioridadeId: tarefa.prioridadeId === "" ? null : tarefa.prioridadeId,
          concluida: tarefa.concluida,
        })),
        ...(mostrarDadosAudiencia && {
          audiencia: {
            tipoAudienciaId: dadosAudiencia.tipoAudienciaId,
            dataAudiencia: dadosAudiencia.dataAudiencia,
            alerta: dadosAudiencia.alerta,
            horasAntes: dadosAudiencia.horasAntes ? formatTime(dadosAudiencia.horasAntes) : null,
            presencial: dadosAudiencia.presencial,
            url: dadosAudiencia.url,
          },
        }),
      }),
    };

    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const tipoEndpoint = isEditing
        ? `${API_COMMAND}/api/Andamento/Editar`
        : `${API_COMMAND}/api/Andamento/Criar`;
      const response = await fetch(tipoEndpoint, {
        ...bodyAndamento,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setFormData({
          tipoAndamento: "",
          origem: "",
          dataAndamento: "",
          prazoJudicial: "",
          teor: "",
          tipoAlerta: [],
          tarefas: [],
          documentos: [],
        });
        setOpen(false);
        setFiles([]);
        setIsFormChanged(false);
        setFaseIdIgual(false);
        setMostrarDadosAudiencia(false)
        emitter.emit("refreshCustomers");
        emitter.emit("updateAndamentos");
        emitter.emit(
          "andamentoSubmit",
          nomeOrigemAndamento,
          formData.origem,
          nomeTipoAndamento,
          formData.tipoAndamento
        );
        setIsLoading(false);
        enqueueSnackbar(
          `Andamento ${isEditing ? "editado" : "cadastrado"} com sucesso.`,
          {
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          }
        );
      } else {
        const errorDetails = data.details || "Detalhes do erro não fornecidos.";
        const errorMessage = `Erro ao ${isEditing ? "editar" : "criar"
          } andamento: ${data.message || "Erro desconhecido"}. ${errorDetails}`;
        setIsLoading(false);
        enqueueSnackbar(
          `Não foi possível ${isEditing ? "editar" : "cadastrar"
          } esse andamento. Tente novamente.`,
          { variant: "error" }
        );
        throw new Error(errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      enqueueSnackbar(
        `Não foi possível ${isEditing ? "editar" : "cadastrar"
        } esse andamento. Tente novamente.`,
        { variant: "error" }
      );
    }
  };

  const handleAddTarefa = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tarefas: [
        ...prevFormData.tarefas,
        {
          descricao: "",
          prazoTarefa: null,
          alerta: "",
          tipoAlerta: "1",
          usuarioId: "",
          prioridadeId: "",
        },
      ],
    }));
    setFormValidation((prevValidation) => ({
      ...prevValidation,
      tarefas: [
        ...prevValidation.tarefas,
        {
          descricao: true,
          usuarioId: true,
        },
      ],
    }));
    setIsFormChanged(true);
  };

  const handleRemoveTarefa = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tarefas: prevFormData.tarefas.filter(
        (_, tarefaIndex) => tarefaIndex !== index
      ),
    }));
    setFormValidation((prevValidation) => ({
      ...prevValidation,
      tarefas: prevValidation.tarefas.filter(
        (_, tarefaIndex) => tarefaIndex !== index
      ),
    }));
    setIsFormChanged(true);
  };

  useEffect(() => {
    if (open && simpleBarRef.current) {
      simpleBarRef.current.recalculate();
    }
  }, [open]);

  const [files, setFiles] = useState([]);

  useEffect(() => {
    const updatedFiles = formData.documentos.map((documento) => ({
      file: new File(
        [new Blob([documento.base64], { type: "application/pdf" })],
        documento.nome,
        { type: "application/pdf" }
      ),
      url: `data:application/pdf;base64,${documento.base64}`,
    }));
    setFiles(updatedFiles);
  }, [formData.documentos]);

  const handleFileChange = async (event) => {
    const newFiles = await Promise.all(
      Array.from(event.target.files).map(async (file) => {
        const base64 = await toBase64(file);
        return { nome: file.name, base64 };
      })
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      documentos: [...prevFormData.documentos, ...newFiles],
    }));
    setIsFormChanged(true);

    // Limpar valor do input após a seleção dos arquivos
    event.target.value = null;
  };

  const handleRemoveFile = (documentoToRemove) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      documentos: prevFormData.documentos.filter(
        (doc) => doc.nome !== documentoToRemove.nome
      ),
    }));
    setIsFormChanged(true);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleInputChange = (event, newValue) => {
    if (!newValue) {
      return;
    }

    setIsFormChanged(true);

    // Lógica para verificar se o tipo de andamento selecionado tem infoAdicional
    if (newValue.infoAdicional) {
      setMostrarDadosAudiencia(newValue.infoAdicional === true);
    } else {
      setMostrarDadosAudiencia(false);
      setDadosAudiencia({
        tipoAudienciaId: "",
        dataAudiencia: null,
        alerta: 0,
        horasAntes: "",
        presencial: true,
        url: "",
      });
    }
  };

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.75 }}
      >
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            setExibirModalDetalhes(false);
            setMostrarDadosAudiencia(false)
            setTitulo("Novo Andamento");
            handleToggle();
            setDadosAudiencia({
              tipoAudienciaId: "",
              alerta: null,
              url: "",
              presencial: true,
              horasAntes: null,
              dataAudiencia: null,
            })
          }}
          startIcon={<PlusOutlined />}
          style={{ borderRadius: "20px", height: "32px" }}
        >
          Novo Andamento
        </Button>
      </Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleToggle}
        PaperProps={{ sx: { width: 670 } }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <MainCard
            title={titulo}
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
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "21.79px",
                        textAlign: "left",
                        color: "#1C5297",
                        marginBottom: "10px",
                      }}
                    >
                      {titulo}
                    </Typography>
                    {exibirModalDetalhes && (
                      <Button
                        variant="outlined"
                        style={{
                          height: "32px",
                        }}
                        onClick={() => {
                          setExibirModalDetalhes(false);
                          enqueueSnackbar(
                            "Edição habilitada. Campos liberados.",
                            { variant: "success" }
                          );
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          style={{ marginRight: "8px" }}
                        />
                        Editar Andamento
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Tipo de andamento *
                      </InputLabel>
                      <Autocomplete
                        disabled={exibirModalDetalhes}
                        options={tiposAndamentos}
                        getOptionLabel={(option) => option.nome}
                        value={
                          tiposAndamentos.find(
                            (tipoAndamento) =>
                              tipoAndamento.id === formData.tipoAndamento
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            tipoAndamento: newValue ? newValue.id : "",
                          }));
                          handleInputChange(event, newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              ...(exibirModalDetalhes && {
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color":
                                    "#36454F !important",
                                  cursor: "not-allowed",
                                },
                              }),
                            }}
                            placeholder="Escreva ou selecione um tipo"
                            error={
                              !formData.tipoAndamento &&
                              formValidation.tipoAndamento === false
                            }
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Origem *
                      </InputLabel>
                      <Autocomplete
                        disabled={exibirModalDetalhes}
                        sx={{ height: "32px" }}
                        options={origens}
                        getOptionLabel={(option) => option.nome}
                        value={
                          origens.find(
                            (origem) => origem.id === formData.origem
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            origem: newValue ? newValue.id : "",
                          }));
                          handleInputChange(event);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              ...(exibirModalDetalhes && {
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color":
                                    "#36454F !important",
                                  cursor: "not-allowed",
                                },
                              }),
                            }}
                            placeholder="Escreva ou selecione a origem"
                            error={
                              !formData.origem &&
                              formValidation.origem === false
                            }
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Data do andamento *
                      </InputLabel>
                      <DatePicker
                        disabled={exibirModalDetalhes}
                        value={formData.dataAndamento}
                        onChange={(newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            dataAndamento: newValue,
                          }));
                          setErroDataAndamento(false);
                          handleInputChange();
                        }}
                        slotProps={{
                          textField: {
                            placeholder: "00/00/0000",
                            error:
                              (!formData.dataAndamento &&
                                formValidation.dataAndamento === false) ||
                              erroDataAndamento === true,
                            sx: {
                              ...(exibirModalDetalhes && {
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color":
                                    "#36454F !important",
                                  cursor: "not-allowed",
                                },
                              }),
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Prazo Judicial *
                      </InputLabel>
                      <DatePicker
                        disabled={exibirModalDetalhes}
                        value={formData.prazoJudicial}
                        onChange={(newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            prazoJudicial: newValue,
                          }));
                          setErroPrazoJudicial(false);
                          handleInputChange();
                        }}
                        slotProps={{
                          textField: {
                            placeholder: "00/00/0000",
                            sx: {
                              ...(exibirModalDetalhes && {
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color":
                                    "#36454F !important",
                                  cursor: "not-allowed",
                                },
                              }),
                            },
                            error:
                              (!formData.prazoJudicial &&
                                formValidation.prazoJudicial === false) ||
                              erroPrazoJudicial === true,
                          },
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{ marginBottom: mostrarDadosAudiencia ? 3 : 0 }}
                  >
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Teor
                      </InputLabel>
                      <TextField
                        disabled={exibirModalDetalhes}
                        sx={{
                          ...(exibirModalDetalhes && {
                            "& .Mui-disabled": {
                              "-webkit-text-fill-color": "#36454F !important",
                              cursor: "not-allowed",
                            },
                          }),
                        }}
                        margin="normal"
                        name="resumo"
                        fullWidth
                        value={formData.teor}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFormData({ ...formData, teor: e.target.value });
                          handleInputChange();
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Inicio - Campos novos para caso tenha audiência */}
                  {mostrarDadosAudiencia && (
                    <Box
                      sx={{
                        backgroundColor: "rgba(28, 82, 151, 0.05)",
                        padding: 3,
                        borderRadius: 1,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h2"
                            style={{
                              fontSize: "16px",
                              fontWeight: 600,
                              lineHeight: "21.79px",
                              textAlign: "left",
                              color: "#1C5297",
                              marginBottom: "10px",
                            }}
                          >
                            Dados da audiência
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Tipo de audiência *
                            </InputLabel>
                            <Autocomplete
                              disabled={exibirModalDetalhes}
                              options={tiposAudiencias}
                              getOptionLabel={(option) => option.nome}
                              value={
                                tiposAudiencias.find(
                                  (tiposAudiencia) =>
                                    tiposAudiencia.id ===
                                    dadosAudiencia.tipoAudienciaId
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                setDadosAudiencia((prev) => ({
                                  ...prev,
                                  tipoAudienciaId: newValue ? newValue.id : "",
                                }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  sx={{
                                    ...(exibirModalDetalhes && {
                                      "& .Mui-disabled": {
                                        "-webkit-text-fill-color":
                                          "#36454F !important",
                                        cursor: "not-allowed",
                                      },
                                    }),
                                  }}
                                  placeholder="Escreva ou selecione um tipo"
                                  error={
                                    !formData.tipoAudiencia &&
                                    formValidation.tipoAudiencia === false
                                  }
                                />
                              )}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={6}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Data e horário da audiência *
                            </InputLabel>
                            <DateTimePicker
                              disabled={exibirModalDetalhes}
                              value={dadosAudiencia.dataAudiencia}
                              slotProps={{
                                textField: {
                                  placeholder: "00/00/0000 - 00:00",
                                  error:
                                    (!dadosAudiencia.dataAudiencia &&
                                      formValidation.dataAudiencia === false) ||
                                    erroDataAudiencia === true,
                                  sx: {
                                    ...(exibirModalDetalhes && {
                                      "& .Mui-disabled": {
                                        "-webkit-text-fill-color":
                                          "#36454F !important",
                                        cursor: "not-allowed",
                                      },
                                    }),
                                  },
                                },

                              }}
                              onChange={(newValue) => {
                                setDadosAudiencia((prev) => ({
                                  ...prev,
                                  dataAudiencia: newValue,
                                }));
                                setErroDataAndamento(false);
                                handleInputChange();
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={2}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Alerta
                            </InputLabel>
                            <TextField
                              disabled={exibirModalDetalhes}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              id="outlined-number"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                min: 0,
                              }}
                              value={dadosAudiencia.horasAntes}
                              onChange={(event) => {
                                const valor = parseInt(event.target.value, 10);
                                if (valor >= 0) {
                                  setDadosAudiencia((prev) => ({
                                    ...prev,
                                    horasAntes: valor,
                                  }));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={4}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              &nbsp;
                            </InputLabel>
                            <Select
                              name="tipo-alerta"
                              disabled={exibirModalDetalhes}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              value={dadosAudiencia.alerta}
                              onChange={(event) => {
                                setDadosAudiencia((prev) => ({
                                  ...prev,
                                  alerta: event.target.value,
                                }));
                              }}
                            >
                              <MenuItem value="0">minuto(s) antes</MenuItem>
                              <MenuItem value="1">hora(s) antes</MenuItem>
                              <MenuItem value="2">dias(s) antes</MenuItem>
                              <MenuItem value="3">semana(s) antes</MenuItem>
                            </Select>
                          </Stack>
                        </Grid>

                        <Grid item xs={5}>
                          <Stack spacing={1}>
                            <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                              Formato *
                            </InputLabel>
                            <RadioGroup
                              row
                              aria-label="position"
                              name="position"
                              value={dadosAudiencia.presencial ? "pro" : "contra"}
                              onChange={(e) => {
                                const isPresencial = e.target.value === "pro";
                                setDadosAudiencia((prev) => ({
                                  ...prev,
                                  presencial: isPresencial,
                                  url: isPresencial ? "" : prev.url, // Limpa o campo de URL se for presencial
                                }));
                              }}
                            >
                              <FormControlLabel
                                value="pro"
                                disabled={exibirModalDetalhes}
                                control={<Radio />}
                                id="proButton"
                                label="Presencial"
                              />
                              <FormControlLabel
                                value="contra"
                                disabled={exibirModalDetalhes}
                                control={<Radio />}
                                label="Virtual"
                              />
                            </RadioGroup>
                          </Stack>
                        </Grid>

                        <Grid item xs={6}>
                          <Stack spacing={1}>
                            <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                              Link da audiência
                            </InputLabel>
                            <TextField
                              disabled={dadosAudiencia.presencial || exibirModalDetalhes}
                              margin="normal"
                              name="descricao"
                              fullWidth
                              placeholder="Cole aqui a URL"
                              value={dadosAudiencia.url}
                              onChange={(e) => {
                                setDadosAudiencia((prev) => ({
                                  ...prev,
                                  url: e.target.value,
                                }));
                              }}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color": "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                            />
                          </Stack>
                        </Grid>

                      </Grid>
                    </Box>
                  )}
                  {/* Fim - Campos novos para caso tenha audiência */}

                  <Grid
                    item
                    xs={12}
                    sx={{ marginTop: mostrarDadosAudiencia ? 3 : 0 }}
                  >
                    <Stack spacing={1}>
                      <Typography
                        variant="h6"
                        component="h2"
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          lineHeight: "21.79px",
                          textAlign: "left",
                          color: "#1C5297",
                        }}
                      >
                        Documentos
                      </Typography>

                      {formData.documentos.map((documento, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 2,
                            p: 1,
                            border: "0.4px solid rgba(0, 0, 0, 0.30)",
                            background: "rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <PictureAsPdfIcon
                            sx={{ mr: 1, color: "#00000080" }}
                          />
                          <Typography variant="subtitle2" noWrap>
                            {documento.nome}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newWindow = window.open();
                                newWindow.document.write(
                                  `<iframe src="data:application/pdf;base64,${documento.base64}" frameborder="0" style="width:100%;height:100%;"></iframe>`
                                );
                              }}
                            >
                              <VisibilityIcon
                                fontSize="small"
                                color="inherit"
                              />
                            </IconButton>

                            <IconButton
                              size="small"
                              component="a"
                              href={`data:application/pdf;base64,${documento.base64}`}
                              download={documento.nome}
                            >
                              <DownloadIcon fontSize="small" color="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(documento)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}

                      <Button
                        variant="contained"
                        component="label"
                        style={{
                          width: "162px",
                          height: "32px",
                          borderRadius: "4px",
                          marginTop: 20,
                          backgroundColor: exibirModalDetalhes
                            ? "#1C529733"
                            : undefined,
                          color: exibirModalDetalhes ? "#FFFFFF" : undefined,
                          cursor: exibirModalDetalhes
                            ? "not-allowed"
                            : "pointer",
                        }}
                        onClick={exibirModalDetalhes ? null : () => { }}
                      >
                        Inserir Documento
                        <input
                          type="file"
                          multiple
                          accept="application/pdf"
                          hidden
                          onChange={handleFileChange}
                          disabled={exibirModalDetalhes}
                        />
                      </Button>
                    </Stack>
                  </Grid>

                  <Divider
                    style={{
                      width: "99%",
                      height: "1.5px",
                      backgroundColor: "#00000040",
                      marginTop: 30,
                    }}
                  />

                  {formData.tarefas.map((tarefa, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid
                        container
                        spacing={2}
                        style={{
                          border: "0.6px solid #00000033",
                          padding: "7px",
                          paddingRight: "14px",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          marginTop: "5px",
                          marginLeft: "0px",
                          width: "99%",
                        }}
                      >
                        <Grid
                          item
                          xs={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h2"
                            style={{
                              fontSize: "16px",
                              fontWeight: 600,
                              lineHeight: "21.79px",
                              color: "#1C5297",
                            }}
                          >
                            Tarefa Avulsa {index + 1}
                          </Typography>
                          {!exibirModalDetalhes && (
                            <IconButton
                              onClick={() => handleRemoveTarefa(index)}
                              style={{
                                color: "#1C5297",
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          )}
                        </Grid>

                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Descrição *
                            </InputLabel>
                            <TextField
                              disabled={exibirModalDetalhes}
                              margin="normal"
                              name="descricao"
                              value={tarefa.descricao}
                              fullWidth
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              onChange={(e) => {
                                const newTarefas = [...formData.tarefas];
                                newTarefas[index].descricao = e.target.value;
                                setFormData({
                                  ...formData,
                                  tarefas: newTarefas,
                                });
                                handleInputChange(e);
                              }}
                              error={
                                !tarefa.descricao &&
                                formValidation.tarefas[index]?.descricao ===
                                false
                              }
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={5}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Prazo Tarefa
                            </InputLabel>
                            <DatePicker
                              disabled={exibirModalDetalhes}
                              value={tarefa.prazoTarefa}
                              onChange={(newValue) => {
                                const newTarefas = [...formData.tarefas];
                                newTarefas[index].prazoTarefa = newValue;
                                setFormData({
                                  ...formData,
                                  tarefas: newTarefas,
                                });
                                setErroPrazoTarefa((prev) => {
                                  const updatedErrors = [...prev];
                                  updatedErrors[index] = false;
                                  return updatedErrors;
                                });
                                handleInputChange();
                              }}
                              slotProps={{
                                textField: {
                                  placeholder: "00/00/0000",
                                  sx: {
                                    ...(exibirModalDetalhes && {
                                      "& .Mui-disabled": {
                                        "-webkit-text-fill-color":
                                          "#36454F !important",
                                        cursor: "not-allowed",
                                      },
                                    }),
                                  },
                                  error: erroPrazoTarefa[index],
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={2.5}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Alerta
                            </InputLabel>
                            <TextField
                              disabled={exibirModalDetalhes}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              id="outlined-number"
                              value={tarefa.alerta}
                              type="number"
                              onChange={(event) => {
                                const newTarefas = [...formData.tarefas];
                                const newValue = parseInt(
                                  event.target.value,
                                  10
                                );
                                if (newValue >= 0 || isNaN(newValue)) {
                                  newTarefas[index].alerta = event.target.value;
                                  setFormData({
                                    ...formData,
                                    tarefas: newTarefas,
                                  });
                                }
                                handleInputChange(event);
                              }}
                              error={
                                (!tarefa.alerta &&
                                  formValidation.tarefas[index]?.alerta ===
                                  false) ||
                                erroPrazoJudicial === true
                              }
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={4.5}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              &nbsp;
                            </InputLabel>
                            <Select
                              name="tipo-alerta"
                              disabled={exibirModalDetalhes}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              value={tarefa.tipoAlerta}
                              onChange={(event) => {
                                const newTarefas = [...formData.tarefas];
                                newTarefas[index].tipoAlerta =
                                  event.target.value;
                                setFormData({
                                  ...formData,
                                  tarefas: newTarefas,
                                });
                                handleInputChange(event);
                              }}
                            >
                              <MenuItem value="0">minuto(s) antes</MenuItem>
                              <MenuItem value="1">hora(s) antes</MenuItem>
                              <MenuItem value="2">dias(s) antes</MenuItem>
                              <MenuItem value="3">semana(s) antes</MenuItem>
                            </Select>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Responsável *
                            </InputLabel>
                            <Autocomplete
                              disabled={exibirModalDetalhes}
                              sx={{
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              options={responsaveis}
                              getOptionLabel={(option) => option.nome}
                              value={
                                responsaveis.find(
                                  (responsavel) =>
                                    responsavel.id === tarefa.usuarioId
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                const newTarefas = [...formData.tarefas];
                                newTarefas[index].usuarioId = newValue
                                  ? newValue.id
                                  : "";
                                setFormData({
                                  ...formData,
                                  tarefas: newTarefas,
                                });
                                handleInputChange(event);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Escreva ou selecione um responsavel"
                                  error={
                                    !tarefa.usuarioId &&
                                    formValidation.tarefas[index]?.usuarioId ===
                                    false
                                  }
                                />
                              )}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Prioridade
                            </InputLabel>
                            <Autocomplete
                              sx={{
                                height: "32px",
                                ...(exibirModalDetalhes && {
                                  "& .Mui-disabled": {
                                    "-webkit-text-fill-color":
                                      "#36454F !important",
                                    cursor: "not-allowed",
                                  },
                                }),
                              }}
                              disabled={exibirModalDetalhes}
                              options={prioridades}
                              getOptionLabel={(option) => option.nome}
                              value={
                                prioridades.find(
                                  (prioridade) =>
                                    prioridade.id === tarefa.prioridadeId
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                const newTarefas = [...formData.tarefas];
                                newTarefas[index].prioridadeId = newValue
                                  ? newValue.id
                                  : "";
                                setFormData({
                                  ...formData,
                                  tarefas: newTarefas,
                                });
                                handleInputChange(event);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Escreva ou selecione a prioridade"
                                  error={
                                    !tarefa.prioridadeId &&
                                    formValidation.tarefas[index]
                                      ?.prioridadeId === false
                                  }
                                />
                              )}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Checkbox
                              checked={tarefa.concluida}
                              onChange={
                                exibirModalDetalhes
                                  ? null
                                  : (event) => {
                                    const newTarefas = [...formData.tarefas];
                                    newTarefas[index].concluida =
                                      event.target.checked;
                                    setFormData({
                                      ...formData,
                                      tarefas: newTarefas,
                                    });
                                    handleInputChange(event);
                                  }
                              }
                              style={{
                                cursor: exibirModalDetalhes
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "12px",
                                fontWeight: 400,
                                textAlign: "left",
                                color: "#717171CC",
                              }}
                            >
                              Marcar tarefa como concluída
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      style={{
                        width: "605px",
                        height: "46px",
                        background: "#1C52970D",
                        border: "0.6px solid #00000033",
                        justifyContent: "start",
                        cursor: exibirModalDetalhes ? "not-allowed" : "pointer",
                      }}
                      onClick={exibirModalDetalhes ? null : handleAddTarefa}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{
                          width: "100%",
                          fontSize: "14px",
                          fontWeight: 400,
                        }}
                      >
                        <AddIcon
                          sx={{
                            marginRight: "8px",
                            fontSize: "14px",
                            fontWeight: 900,
                          }}
                        />
                        Adicionar tarefa avulsa
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: 5,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        style={{
                          ...buttonStyle,
                          fontWeight: 600,
                          padding: "4px 10px",
                          fontSize: "0.875rem",
                        }}
                        onClick={() => {
                          handleToggle();
                        }}
                      >
                        {exibirModalDetalhes ? "Fechar" : "Cancelar"}
                      </Button>
                      {!exibirModalDetalhes && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={tratarSubmit}
                          style={{
                            ...buttonStyle,
                            padding: "6px 12px",
                            fontSize: "1rem",
                            width: "91px",
                            backgroundColor: exibirModalDetalhes
                              ? "#1C529733"
                              : undefined,
                            color: exibirModalDetalhes ? "#FFFFFF" : undefined,
                            cursor: exibirModalDetalhes
                              ? "not-allowed"
                              : "pointer",
                          }}
                          disabled={isLoading}
                        >
                          Salvar
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </SimpleBar>
          </MainCard>
        </LocalizationProvider>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Drawer>
      <Dialog
        open={showConfirmationDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "240px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#FAAD14CC",
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
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
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
              Alerta
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {faseIdIgual ? (
            <>
              <Typography
                component="div"
                style={{
                  fontWeight: "bold",
                  marginTop: "35px",
                  color: "#717171",
                }}
              >
                A fase do processo será alterada.
              </Typography>
              <Typography component="div" style={{ marginTop: "20px" }}>
                Ao realizar essa ação, a fase do processo será alterada para a
                fase atual desse tipo de andamento. Deseja continuar?
              </Typography>
            </>
          ) : (
            <>
              <Typography
                component="div"
                style={{
                  fontWeight: "bold",
                  marginTop: "35px",
                  color: "#717171",
                }}
              >
                Tem certeza que deseja sair sem salvar as alterações?
              </Typography>
              <Typography component="div" style={{ marginTop: "20px" }}>
                Ao realizar essa ação, todas as alterações serão perdidas.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogConfirm}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#FBBD43",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, tenho certeza
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
    </>
  );
};

export default ListagemAndamentos;
