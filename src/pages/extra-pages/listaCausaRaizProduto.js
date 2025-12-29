/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import axios from "axios";
import { Fragment, useMemo, useState, useEffect } from "react";
import { API_QUERY, API_COMMAND } from "../../config";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomerModal from "../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../sections/apps/customer/AlertCustomerDelete";
import { useGetDocumentos } from "../../api/causaRaizProduto";
import { useLocation } from "react-router-dom";
import FiltrosAndamentosMenu from "./filtrosAndamentos";
import { useDropzone } from "react-dropzone";
import { CloseCircleOutlined } from "@ant-design/icons";
import Autocomplete from "@mui/material/Autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import emitter from "./eventEmitter";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ptBR from "date-fns/locale/pt-BR";
import { Backdrop } from "@mui/material";
// project import
import MainCard from "../../components/MainCard";
import SimpleBar from "../../components/third-party/SimpleBar";

import {
  faTrash,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import {
  PlusOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";

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
  Popover,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
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
import CircularProgress from "@mui/material/CircularProgress";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../components/third-party/react-table";

import DeleteIcon from "@mui/icons-material/Delete";

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
  const [isModalDocumentosOpen, setIsModalDocumentosOpen] = useState(false);

  const [filters, setFilters] = useState({
    origem: [],
    tipoDocumento: [],
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

    if (filters.tipoDocumento.length > 0) {
      filters.tipoDocumento.forEach((item) =>
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
      filters.tipoDocumento.length > 0 ||
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

      // Definindo opções de origem e tipo de documento apenas se não houver filtros ativos
      // if (!isAnyFilterApplied()) {
      //   const uniqueOrigemOptions = Array.from(
      //     new Map(
      //       data.map((item) => [
      //         item.origemAndamentoId,
      //         {
      //           label: item.nomeOrigemAndamento,
      //           value: item.origemAndamentoId,
      //         },
      //       ])
      //     ).values()
      //   ).sort((a, b) => a.label.localeCompare(b.label));

      //   // const uniqueTipoAndamentoOptions = Array.from(
      //   //   new Map(
      //   //     data.map((item) => [
      //   //       item.tipoDocumentoId,
      //   //       { label: item.nomeTipoAndamento, value: item.tipoDocumentoId },
      //   //     ])
      //   //   ).values()
      //   // ).sort((a, b) => a.label.localeCompare(b.label));

      //   setOrigemOptions(uniqueOrigemOptions);
      //   setTipoAndamentoOptions(uniqueTipoAndamentoOptions);
      // }
    }
  }, [data, andamentoIdDetalhe, dadosOriginais]);

  const handleRemoveAllFilters = () => {
    const clearedFilters = {
      origem: [],
      tipoDocumento: [],
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
      tipoDocumentoId
    ) => {
      if (!origemOptions.some((option) => option.value === origemId)) {
        setOrigemOptions((prev) => [
          ...prev,
          { label: nomeOrigemAndamento, value: origemId },
        ]);
      }

      if (
        !tipoAndamentoOptions.some((option) => option.value === tipoDocumentoId)
      ) {
        setTipoAndamentoOptions((prev) => [
          ...prev,
          { label: nomeTipoAndamento, value: tipoDocumentoId },
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
            placeholder="Busque pelo nome do produto ou código"
            style={{
              width: "550px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
            }}
          />
          {/* <Button
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
          </Button> */}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <DrawerNovoDocumento
            andamentoIdDetalhes={andamentoIdDetalhes}
            open={isModalOpen}
            handleClose={handleCloseModal}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
        </Stack>

        <ModalAdicionarDocumentos
          open={isModalDocumentosOpen}
          handleClose={() => setIsModalDocumentosOpen(false)}
        />

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
        {filters.tipoDocumento.map((tipo) =>
          renderChip("Tipo de Andamento", tipo.label, () =>
            handleRemoveFilter("tipoDocumento", tipo.value)
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
              <Table size="small" sx={{
                borderSpacing: '0 1px', // Espaçamento entre as linhas
                borderCollapse: 'separate', // Importante para permitir espaçamento
              }}>
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
                        <TableRow
                          sx={{
                            '&:not(:last-child)': {
                              marginBottom: '8px', // Espaçamento entre linhas
                            },
                            backgroundColor: isDarkMode ? '#14141A' : '#FFFFFF',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)', // Opcional: sombra para destacar as linhas
                            borderRadius: '4px', // Opcional: bordas arredondadas
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              {...cell.column.columnDef.meta}
                              sx={{
                                overflow: 'hidden',
                                color: isDarkMode
                                  ? 'rgba(255, 255, 255, 0.87)'
                                  : 'rgba(0, 0, 0, 0.65)',
                                textOverflow: 'ellipsis',
                                fontFamily: '"Open Sans", Helvetica, sans-serif',
                                fontSize: '13px',
                                fontWeight: 400,
                                backgroundColor: cell.getIsGrouped()
                                  ? theme.palette.primary.lighter
                                  : cell.getIsAggregated()
                                    ? theme.palette.primary.lighter
                                    : cell.getIsPlaceholder()
                                      ? 'white'
                                      : 'inherit',
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
                                  </Box>{' '}
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
                  recordType: "Produtos",
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
  refreshData: PropTypes.func
};


function ActionCell({ row, refreshData }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_COMMAND}/api/Documento/${row.original.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        enqueueSnackbar(`Documento ${row.original.nome} excluído.`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
        emitter.emit("refreshCustomers");
      } else {
        const errorBody = await response.text();
        throw new Error(
          `Falha ao excluir o documento: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }
    } catch (error) {
      console.error("Erro:", error);
    }
    setIsDeleting(false);
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
        disabled={isDeleting}
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
              const AndamentosDadosEditar = row.original;
              emitter.emit("editAndamento", AndamentosDadosEditar, false);
              handleClose();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
            disabled={isDeleting}
          >
            Editar
          </Button>
          <Button onClick={handleDeleteDialogOpen} color="error">
            Excluir
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
            Tem certeza que deseja excluir o documento "{row.original.nome}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Esse documento será excluído do Processo.
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
            disabled={isDeleting} // Desabilita o botão durante a exclusão
            startIcon={isDeleting ? <CircularProgress size={20} style={{ color: 'white' }} /> : null} // Adiciona o spinner
          >
            {isDeleting ? "Excluindo..." : "Sim, excluir"}
          </Button>
          <Button onClick={handleDeleteDialogClose} disabled={isDeleting}
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
            Não é possível excluir esse documento.
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            O documento não pode ser excluído pois está vinculado a processos. É
            possível inativar o documento nas configurações de edição.
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

// ==============================|| LISTAGEM ||============================== //

// Componente principal da página de listagem de registros
const ListagemCausaRaizEmpresas = (andamentoIdDetalhes) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const { causaRaizEmpresas: lists, isLoading, refetch } = useGetDocumentos(
    formData,
    processoSelecionadoId,
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
    setFilteredData(newFormData);
    setIsFiltered(true);
  };

  // Função para limpar a filtragem
  const handleClearFilter = () => {
    setFilteredData([]);
    setIsFiltered(false);
  };

  // Definição das colunas da tabela
  const formatDateToBrazilian = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const columns = useMemo(
    () => [
      {
        header: "Nome",
        accessorKey: "nome",
        enableGrouping: true,
      },
      {
        header: "Código",
        accessorKey: "codigo",
      },
      {
        header: "Empresa",
        accessorKey: "empresa",
      },
      {
        header: "Adicionado Em",
        accessorKey: "adicionadoEm",
      },
      {
        header: "Via",
        accessorKey: "via",
      },
      {
        header: " ",
        enableGrouping: false,
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack
              direction="row"
              alignItems="right"
              justifyContent="right"
              sx={{ marginRight: -2 }}
            >
              <ActionCell row={row} refreshData={refreshOrgaos} />
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

  const displayedData = isFiltered ? filteredData.documentos : lists;

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        style={{ position: 'relative' }}
      >
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
          Produtos
        </span>

        <Box
          flex="1"
          borderBottom="1px dotted rgba(171, 190, 209, 1)"
          margin="0 8px"
          style={{ marginTop: '16px', height: '0px' }}
        ></Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined style={{ fontWeight: 'bold' }} />}
          style={{
            fontSize: '12px',
            color: 'rgba(28, 82, 151, 1)',
            fontWeight: 600,
            height: '32px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px dotted rgba(171, 190, 209, 1)',
            borderRadius: '4px',
            marginTop: '-10px'
          }}
        >
          Adicionar produto
        </Button>
      </Box>

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
                  refreshData: refreshOrgaos,
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

const DrawerNovoDocumento = () => {

  const [areas, setAreas] = useState([]);
  const [titulo, setTitulo] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    tipoDocumento: "",
    descricao: "",
    area: [],
  });


  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const simpleBarRef = useRef(null);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [exibirModalDetalhes, setExibirModalDetalhes] = useState(false);
  const [mostrarDadosAudiencia, setMostrarDadosAudiencia] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [faseIdIgual, setFaseIdIgual] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationCallback, setConfirmationCallback] = useState(null);
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData(`${API_QUERY}/api/Tag`, setAreas);
  }, []);

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
        tipoDocumento: "",
        origem: "",
        dataAndamento: null,
        prazoJudicial: null,
        descricao: "",
        tipoAlerta: [],
        tarefas: [],
        documentos: [],
      });
      setFormValidation({
        tipoDocumento: true,
        origem: true,
        dataAndamento: true,
        prazoJudicial: true,
        tarefas: [],
        tipoAudiencia: true,
      });
    }
  }, [open, isEditing]);

  useEffect(() => {
    const handleEditAndamento = async (dados, verDetalhes) => {
      if (dados == null) {
        return;
      }

      try {
        const response = await fetch(`${API_QUERY}/api/Documento/${dados.id}`);
        if (!response.ok) {
          return;
        }
        const documento = await response.json();
        setExibirModalDetalhes(verDetalhes ?? false);
        handleToggle(true);
        if (documento && documento.nome) {
          // Remove os últimos 4 caracteres
          const nomeSemExtensao = documento.nome.slice(0, -4);
          setTitulo(nomeSemExtensao);
        }
        setFormData({
          nome: documento.nome || "",
          id: documento.id || "",
          documentoId: documento.id || "",
          tipoDocumento: documento.tipoDocumentoId || "",
          area: documento.tag?.map((tag) => tag.tagId) || "",
          descricao: documento.descricao || ""
        });

        setFormValidation({
          tipoDocumento: true,
          origem: true,
          dataAndamento: true,
          prazoJudicial: true,
          tipoAudiencia: true,
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
    const fetchTiposDocumentos = async () => {
      const response = await fetch(
        `${API_QUERY}/api/TipoDocumento/ListarCombo`
      );
      const data = await response.json();
      setTiposDocumentos(data);
    };

    if (open) {
      fetchTiposDocumentos();
    }
  }, [open]);

  const buttonStyle = { marginRight: "10px" };

  const [formValidation, setFormValidation] = useState(() => {
    const baseValidation = {
      tipoDocumento: true,
      origem: true,
      tipoAudiencia: true,
      dataAndamento: true,
      dataAudiencia: true,
      prazoJudicial: true,
      tarefas: [],
    };

    return baseValidation;
  });

  const tratarMudancaInputGeral = (field, value) => {
    if (field === 'fase') {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.area.length === areas.length) {
        // Deselect all
        setFormData({ ...formData, area: [] });
      } else {
        // Select all
        setFormData({ ...formData, area: areas.map(area => area.id) });
      }
    } else {
      tratarMudancaInputGeral('area', newValue.map(item => item.id));
    }
  };

  const allSelected2 = formData.area.length === areas.length && areas.length > 0;

  const tratarSubmit = async (dados) => {

    const bodyAndamento = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: formData.id,
        nome: formData.nome,
        tipoDocumentoId: formData.tipoDocumento,
        tagDocumento: formData.area.map((area) => {
          return { id: 0, tagId: area, };
        }),
        descricao: formData.descricao,
      }),
    };

    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const tipoEndpoint = isEditing
        ? `${API_COMMAND}/api/Documento/Editar`
        : `${API_COMMAND}/api/Documento/Editar`;
      const response = await fetch(tipoEndpoint, {
        ...bodyAndamento,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        console.log(bodyAndamento)
        setFormData({
          nome: "",
          id: "",
          documentoId: "",
          tipoDocumento: "",
          area: [],
          descricao: ""
        });
        setOpen(false);
        setIsFormChanged(false);
        setFaseIdIgual(false);
        setMostrarDadosAudiencia(false);
        setIsLoading(false);
        enqueueSnackbar(
          `Documento ${isEditing ? "editado" : "cadastrado"} com sucesso.`,
          {
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          }
        );
        emitter.emit("refreshCustomers");
      } else {
        const errorDetails = data.details || "Detalhes do erro não fornecidos.";
        const errorMessage = `Erro ao ${isEditing ? "editar" : "criar"
          } documento: ${data.message || "Erro desconhecido"}. ${errorDetails}`;
        setIsLoading(false);
        enqueueSnackbar(
          `Não foi possível ${isEditing ? "editar" : "cadastrar"
          } esse documento. Tente novamente.`, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      enqueueSnackbar(
        `Não foi possível ${isEditing ? "editar" : "cadastrar"
        } esse documento. Tente novamente.`, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }
  };

  useEffect(() => {
    if (open && simpleBarRef.current) {
      simpleBarRef.current.recalculate();
    }
  }, [open]);

  const handleInputChange = (event, newValue) => {
    if (!newValue) {
      return;
    }

    setIsFormChanged(true);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleToggle}
        PaperProps={{ sx: { width: 670 } }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <MainCard
            title='Editar Documento'
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
                      Documento: {titulo}
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
                        Editar Documento
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Tipo de documento *
                      </InputLabel>
                      <Autocomplete
                        disabled={exibirModalDetalhes}
                        options={tiposDocumentos}
                        getOptionLabel={(option) => option.nome}
                        value={
                          tiposDocumentos.find(
                            (tipoDocumento) =>
                              tipoDocumento.id === formData.tipoDocumento
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            tipoDocumento: newValue ? newValue.id : "",
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
                              !formData.tipoDocumento &&
                              formValidation.tipoDocumento === false
                            }
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Tags</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[{ id: 'all', nome: 'Selecionar todas' }, ...areas]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.area.map(id => areas.find(area => area.id === id) || id)}
                        onChange={handleSelectAll2}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <Checkbox
                                  checked={option.id === 'all' ? allSelected2 : selected}
                                />
                              </Grid>
                              <Grid item xs>
                                {option.nome}
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={formData.area.length > 0 ? "" : "Escreva ou selecione uma ou mais tags"}
                            error={(formData.area.length === 0 || formData.area.every(val => val === 0)) && formValidation.area === false}
                          />
                        )}
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
                        Descrição
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
                        value={formData.descricao}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFormData({ ...formData, descricao: e.target.value });
                          handleInputChange();
                        }}
                      />
                    </Stack>
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
                fase atual desse tipo de documento. Deseja continuar?
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

const ModalAdicionarDocumentos = ({ open, handleClose }) => {
  const [documentos, setDocumentos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    unidade: [],
    tag: [],
  });

  const handleInputChange = (event, newValue) => {
    if (!newValue) {
      return;
    }
  };

  // Limpar os campos ao abrir o modal
  useEffect(() => {
    if (open) {
      setFormData({
        tipoDocumento: "",
        unidade: [],
        tag: [],
      });
      setDocumentos([]);
      setFormValidation({
        tipoDocumento: true,
        unidade: false,
      });
    }
  }, [open]);

  const [formValidation, setFormValidation] = useState({
    unidade: false,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) { }
  };

  useEffect(() => {
    fetchData(`${API_QUERY}/api/TipoDocumento/ListarCombo`, setUnidades);
    fetchData(`${API_QUERY}/api/Tag/ListarCombo?ativo=true`, setTags);
  }, []);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "fase") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === 'all') {
      if (formData.tag.length === tags.length) {
        // Deselect all
        setFormData({ ...formData, tag: [] });
      } else {
        // Select all
        setFormData({ ...formData, tag: tags.map(tag => tag.id) });
      }
    } else {
      tratarMudancaInputGeral('tag', newValue.map(item => item.id));
    }
  };

  const allSelected =
    formData.unidade.length === unidades.length && unidades.length > 0;

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const validarForm = () => {
    let foiValidado = true;
    const invalidFields = [];

    // Validação de tipoDocumento
    if (!formData.tipoDocumento) {
      foiValidado = false;
      invalidFields.push("Tipo de Documento");
    }

    setFormValidation({
      tipoDocumento: !!formData.tipoDocumento,
    });

    if (!foiValidado) {
      enqueueSnackbar(`O campo 'Tipo Documento' é obrigatório.`, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }

    return foiValidado;
  };

  const handleAddDocument = async () => {
    if (!validarForm()) return;

    try {
      const payload = await Promise.all(
        documentos.map(async (documento) => ({
          processoId: processoSelecionadoId,
          nome: documento.nome,
          descricao: documento.descricao,
          tipoDocumentoId: formData.tipoDocumento,
          usuarioVinculacaoId: 1,
          cdDestinoDocumento: "PROCS",
          tagDocumento: formData.tag.map((tag) => ({ id: 0, tagId: tag })),
          base64: await fileToBase64(documento.file),
        }))
      );

      setIsDeleting(true);
      setIsLoading(true);
      const response = await fetch(`${API_COMMAND}/api/Documento/Criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload[0]),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar documento");
      }

      enqueueSnackbar("Documento cadastrado com sucesso.", {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
      handleClose();
      setIsDeleting(false);
      setIsLoading(false);
      emitter.emit("refreshCustomers");
    } catch (error) {
      enqueueSnackbar("Erro ao adicionar documentos", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
      console.error("Erro ao adicionar documentos:", error);
      setIsLoading(false);
      setIsDeleting(false);
    }
  };

  // Função para lidar com o drop de arquivos
  const onDrop = (acceptedFiles) => {
    const arquivosPDF = acceptedFiles.filter((file) => file.type === "application/pdf"); // Filtra apenas PDFs

    if (arquivosPDF.length !== acceptedFiles.length) {
      enqueueSnackbar("Apenas arquivos PDF são permitidos.", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }

    const novosDocumentos = arquivosPDF.map((file) => ({
      nome: file.name,
      tipoDocumento: "",
      descricao: "",
      tags: [],
      file, // Armazena o arquivo original para conversão em base64
    }));

    setDocumentos((prevDocumentos) => [...prevDocumentos, ...novosDocumentos]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "application/pdf", // Define aceitação de PDFs (mesmo que seja ignorado, será tratado no filtro manual)
  });


  const handleRemoverDocumento = (index) => {
    const novosDocumentos = documentos.filter((_, i) => i !== index);
    setDocumentos(novosDocumentos);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "rgba(28, 82, 151, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ccc",
          padding: "6px 24px",
          marginBottom: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ marginRight: "8px", fontSize: '15px', color: "#fff" }} />
          <Typography variant="h6" component="div" style={{ color: "#fff" }}>
            Documento
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "15px" }} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Drag and Drop Container */}
          <Grid item xs={12}>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #1C5297",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: isDragActive ? "#f0f0f0" : "#fff",
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Solte os arquivos aqui...</p>
              ) : (
                <p>
                  Arraste e solte arquivos aqui, ou clique para selecionar os
                  arquivos
                </p>
              )}
            </Box>
          </Grid>

          {/* Tabela de Documentos Adicionados */}
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo Documento</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentos.map((documento, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          fontSize: "12px",
                          whiteSpace: "nowrap", // Garante que o texto não quebre
                          width: "auto", // Ajusta ao tamanho do conteúdo
                          maxWidth: "150px", // Limita o tamanho máximo se necessário
                          overflow: "hidden", // Esconde o conteúdo excedente
                          textOverflow: "ellipsis", // Adiciona "..." caso o texto seja muito longo
                        }}
                      >
                        {documento.nome}
                      </TableCell>

                      <TableCell>
                        <Autocomplete
                          options={unidades}
                          getOptionLabel={(option) => option.nome}
                          value={
                            unidades.find(
                              (tipoDocumento) =>
                                tipoDocumento.id === formData.tipoDocumento
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            setFormData((prev) => ({
                              ...prev,
                              tipoDocumento: newValue ? newValue.id : "",
                            }));
                            handleInputChange(event, newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Escreva ou selecione um tipo"

                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={documento.descricao}
                          onChange={(e) => {
                            const updatedDocumentos = [...documentos];
                            updatedDocumentos[index].descricao = e.target.value;
                            setDocumentos(updatedDocumentos);
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          multiple
                          disableCloseOnSelect
                          options={[{ id: 'all', nome: 'Selecionar todas' }, ...tags]}
                          getOptionLabel={(option) => option.nome}
                          value={formData.tag.map(id => tags.find(tag => tag.id === id) || id)}
                          onChange={handleSelectAll2}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item>
                                  <Checkbox
                                    checked={option.id === 'all' ? allSelected : selected}
                                  />
                                </Grid>
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={formData.tag.length > 0 ? "" : "Escreva ou selecione uma ou mais unidades"}
                              error={(formData.tag.length === 0 || formData.tag.every(val => val === 0)) && formValidation.tag === false}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "50px", // Define um tamanho fixo adequado ao ícone
                          textAlign: "center", // Centraliza o ícone
                          padding: "0", // Remove o preenchimento extra
                        }}
                      >
                        <IconButton onClick={() => handleRemoverDocumento(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <DialogActions>
        <Button
          onClick={handleClose}
          style={{
            marginTop: "-55px",
            padding: "8px 16px",
            width: "120px",
            height: "32px",
            borderRadius: "4px",
            border: "1px solid rgba(0, 0, 0, 0.40)",
            background: "#FFF",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            opacity: isDeleting || documentos.length === 0 ? 0.5 : 1, // Ajusta opacidade
            cursor: isDeleting || documentos.length === 0 ? "not-allowed" : "pointer", // Ajusta o cursor
          }}
          disabled={isDeleting || documentos.length === 0} // Desabilita o botão se não houver documentos
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAddDocument}
          color="primary"
          autoFocus
          style={{
            marginTop: "-55px",
            width: "120px",
            height: "32px",
            padding: "8px 16px",
            borderRadius: "4px",
            background: isDeleting || documentos.length === 0 ? "rgba(28, 82, 151, 0.6)" : "rgba(28, 82, 151, 1)", // Ajusta o fundo
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            textTransform: "none",
            opacity: isDeleting || documentos.length === 0 ? 0.5 : 1, // Ajusta opacidade
            cursor: isDeleting || documentos.length === 0 ? "not-allowed" : "pointer", // Ajusta o cursor
          }}
          disabled={isDeleting || documentos.length === 0} // Desabilita o botão se não houver documentos
          startIcon={isDeleting ? <CircularProgress size={20} style={{ color: 'white' }} /> : null} // Adiciona o spinner
        >
          {isDeleting ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>

    </Dialog>
  );
};

export default ListagemCausaRaizEmpresas;
