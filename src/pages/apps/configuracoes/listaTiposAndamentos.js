/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_QUERY, API_COMMAND } from '../../../config';
import { Fragment, useMemo, useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useGetTiposAndamentos } from "../../../api/tiposAndamentos";
import { useLocation } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import Autocomplete from "@mui/material/Autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import emitter from "./eventEmitter";
import ptBR from "date-fns/locale/pt-BR";
// project import
import MainCard from "../../../components/MainCard";
import SimpleBar from "../../../components/third-party/SimpleBar";
import CheckIcon from "@mui/icons-material/Check";

// material-ui
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// project-import
import ScrollX from "../../../components/ScrollX";
import IconButton from "../../../components/@extended/IconButton";
import CustomizedSteppers from "../../extra-pages/stepper";
import CircularProgress from "@mui/material/CircularProgress";
import Mark from "mark.js";
import { faXmark, faBan } from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../../components/third-party/react-table"; import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// assets
import { PlusOutlined } from "@ant-design/icons";

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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Converter valores para string, normalizar e realizar a comparação
  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);
  
  return cellValue.includes(valueStr);
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, processosTotal, isLoading }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recordType = "Tipos de Andamentos";
  const tableRef = useRef(null);

  const [sorting, setSorting] = useState([
    {
      id: "pasta",
      desc: true,
    },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
    },
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
      // @ts-ignore
      key: columns.columnDef.accessorKey,
    })
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
            placeholder={`Pesquise pelo nome`}
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
              backgroundColor: "#FFFFFF",
            }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <div style={verticalDividerStyle}></div>
          <Stack direction="row" spacing={2} alignItems="center">
            <DrawerNovoAndamento
              open={isModalOpen}
              handleClose={handleCloseModal}
            />
          </Stack>
        </Stack>
      </Stack>
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
                        table.getRowModel().rows.map((row, index) => (
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
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            {row.getIsExpanded() && (
                              <ExpandedRowComponent row={row} />
                            )}
                          </Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyTable msg="Dados não encontrados" />
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
  const [status, setStatus] = useState(row.original.ativo);
  const [openDialog, setOpenDialog] = useState(false);

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

  const toggleStatus = async () => {
    const newStatus = status === "Ativo" ? "Inativo" : "Ativo";
    const payload = {
      id: row.original.id,
      compromissoDestino: row.original.compromissoDestino,
      criarAlerta: row.original.criarAlerta,
      criarCompromisso: row.original.criarCompromisso,
      documentoObrigatorio: row.original.documentoObrigatorio,
      ehMarco: row.original.ehMarco,
      exigeDocumento: row.original.exigeDocumento,
      iniciaWorkflow: row.original.iniciaWorkflow,
      nome: row.original.nome,
      objUnidadeId: row.original.objUnidadeId,
      stringUnidadeId: row.original.stringUnidadeId,
      tarefaObrigatoria: row.original.tarefaObrigatoria,
      temCampoExtra: row.original.temCampoExtra,
      temTarefa: row.original.temTarefa,
      tipoNotificacao: row.original.tipoNotificacao,
      unidadeId: row.original.unidadeId,
      workflowObrigatorio: row.original.workflowObrigatorio,
      ativo: newStatus === "Ativo",
    };

    try {
      const response = await fetch(
        `${API_COMMAND}/api/TipoAndamento/Editar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setStatus(newStatus);
        if (newStatus === "Inativo") {
          enqueueSnackbar(`Tipo de andamento ${row.original.nome} inativado.`, {
            variant: "success",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
        } else {
          enqueueSnackbar(`Tipo de andamento ${row.original.nome} ativado.`, {
            variant: "success",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
        }
        refreshData();
      } else {
        const errorBody = await response.text();
        try {
          const errorData = JSON.parse(errorBody);
          throw new Error(
            `Falha ao enviar o formulário: ${response.status} ${
              response.statusText
            } - ${JSON.stringify(errorData)}`
          );
        } catch {
          throw new Error(
            `Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`
          );
        }
      }
    } catch (error) {
    }
    handleClose();
    handleDialogClose();
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
            // startIcon={<EditOutlined style={{ fontSize: '0.8em' }} />}
            onClick={() => {
              const tipoAndamentosDadosEditar = row.original;
              navigation(`/apps/processos/novo-tipo-andamento`, {
                state: {
                  indoPara: "NovoTipoAndamento",
                  tipoAndamentosDadosEditar,
                },
              });
              handleClose();
            }}
            color="primary"
          >
            Editar
          </Button>
          <Button
            onClick={() => {
              if (status === "Ativo") handleDialogOpen();
              else toggleStatus();
            }}
            color={status === "Ativo" ? "error" : "success"}
            // startIcon={
            //   status === "Ativo" ? (
            //     <FontAwesomeIcon icon={faBan} style={{ fontSize: '0.8em' }} />
            //   ) : (
            //     <FontAwesomeIcon icon={faCheck} style={{ fontSize: '1em' }} />
            //   )
            // }
          >
            {status === "Ativo" ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>
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
            Tem certeza que deseja inativar o andamento "{row.original.nome}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Ao inativar, esse tipo de andamento não aparecerá mais no cadastro
            manual do andamento, nem na linha do tempo. Além disso, ele não será
            mais um acionador de workflow.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleStatus}
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
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

// ==============================|| LISTAGEM ||============================== //
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const date = new Date(dateString);

  // Verifica se a data é válida
  if (isNaN(date.getTime())) {
    return "Data não disponível"; // Retorna um valor padrão se a data for inválida
  }

  // Tenta formatar a data
  try {
    return date.toLocaleDateString("pt-BR", options);
  } catch (error) {
    return "Erro de formatação"; 
  }
};

// Componente de linha expandida
const ExpandedRowComponent = ({ row }) => {
  const buttonStyle = {
    marginRight: "10px",
    height: "26px",
    borderRadius: "4px",
    border: "0.6px solid #00000033",
    color: "#717171",
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
                    {formatDate(row.original.dataCriacao)}
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
                >
                  Histórico
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FontAwesomeIcon icon={faEye} />}
                  style={buttonStyle}
                >
                  Ver Detalhes
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
    </>
  );
};
// Componente principal da página de listagem de registros
const ListagemTiposAndamentos = () => {
  const theme = useTheme();
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const {
    tiposAndamento: lists,
    isLoading,
    refetch,
  } = useGetTiposAndamentos(formData, processoSelecionadoId);
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    setFormData(newFormData);
  };

  // Definição das colunas da tabela
  const columns = useMemo(
    () => [
      {
        header: "Tipo de Andamento",
        accessorKey: "nome",
      },
      {
        header: "Unidade",
        accessorFn: (row) => {
          // Esta função agora é usada apenas para propósitos de filtragem, então mantemos a separação por vírgula
          if (
            Array.isArray(row.stringUnidadeId) &&
            row.stringUnidadeId.length
          ) {
            return row.stringUnidadeId.map((unidade) => unidade).join(", ");
          } else {
            return " ";
          }
        },
        cell: ({ row }) => {
          // Acessando diretamente os dados originais da linha para maior confiabilidade
          const stringUnidadeId = row.original.stringUnidadeId;

          // Verifica se clientes é um array não vazio
          if (Array.isArray(stringUnidadeId) && stringUnidadeId.length > 0) {
            // Retorna os nomes dos clientes, cada um em uma nova linha
            return (
              <>
                {stringUnidadeId.map((unidade, index) => (
                  <div key={index}>{unidade}</div>
                ))}
              </>
            );
          } else {
            // Retorna um valor padrão ou nada se não houver clientes
            return <div></div>; // Ou 'Nenhum cliente', ou simplesmente null, dependendo da preferência
          }
        },
      },
      {
        header: "Marco",
        accessorKey: "ehMarco",
        cell: ({ row }) => {
          return row.original.ehMarco ? (
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
        header: "Status",
        accessorKey: "ativo",
        cell: ({ row }) => (
          <Chip
            label={row.original.ativo === "Ativo" ? "Ativo" : "Inativo"}
            color={row.original.ativo === "Ativo" ? "success" : "error"}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
              "& .MuiChip-icon": {
                color:
                  row.original.ativo === "Ativo"
                    ? "success.main"
                    : "error.main",
                marginLeft: "4px",
              },
            }}
            icon={
              <span
                style={{
                  backgroundColor:
                    row.original.ativo === "Ativo" ? "green" : "red",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "-6px",
                  marginLeft: "9px",
                }}
              />
            }
          />
        ),
      },
      {
        header: " ",
        disableSortBy: true,
        cell: ({ row }) => (
          <ActionCell row={row} refreshData={refreshAndamentos} />
        ), // Passa refreshData
      },
    ],
    [theme]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

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
          Tipos de Andamentos
        </span>
      </Box>

      {marcoTrueLists && marcoTrueLists.length > 0 && (
        <CustomizedSteppers andamentosTimeline={marcoTrueLists} />
      )}

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
        <Box my={4}>
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
                refreshData: refreshAndamentos,
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

const DrawerNovoAndamento = ({ handleClose }) => {
  // Inicializa o estado do formulário com os dados da pasta ou valores padrão
  const [formData, setFormData] = useState({
    tipoAndamento: "",
    origem: "",
    dataAndamento: "",
    prazoJudicial: "",
    teor: "",
    // Campos tarefa avulsa
    descricaoTarefa: "",
    prazoTarefa: null,
    alerta: "",
    responsavel: "",
    prioridade: "",
  });

  const [showExtraFields, setShowExtraFields] = useState(false);
  const [open, setOpen] = useState(false);
  const simpleBarRef = useRef(null);
  const [tiposAndamentos, setTiposAndamentos] = useState([]);
  const [origens, setOrigem] = useState([]);
  const [erroDataAndamento, setErroDataAndamento] = useState(false);
  const [erroPrazoJudicial, setErroPrazoJudicial] = useState(false);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const navigation = useNavigate();

  useEffect(() => {
    // Função para buscar segmentos
    const fetchTiposAndamentos = async () => {
      const response = await fetch(
        `${API_QUERY}/api/TipoAndamento/ListarCombo`
      );
      const data = await response.json();
      setTiposAndamentos(data);
    };

    // Função para buscar unidades
    const fetchOrigem = async () => {
      const response = await fetch(
        `${API_QUERY}/api/OrigemAndamento`
      );
      const data = await response.json();
      setOrigem(data);
    };

    if (open) {
      fetchOrigem();
      fetchTiposAndamentos();
    }
  }, [open]);

  const buttonStyle = { marginRight: "10px" };

  const [formValidation, setFormValidation] = useState({
    tipoAndamento: true,
    origem: true,
    dataAndamento: true,
    prazoJudicial: true,
  });

  const fieldNamesMap = {
    tipoAndamento: "Tipo de Andamento",
    origem: "Origem",
    dataAndamento: "Data de Andamento",
    prazoJudicial: "Prazo Judicial",
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];

    const newValidationState = {
      tipoAndamento: !!formData.tipoAndamento,
      origem: !!formData.origem,
      dataAndamento: !!formData.dataAndamento,
      prazoJudicial: !!formData.prazoJudicial,
    };

    Object.entries(newValidationState).forEach(([key, value]) => {
      if (!["competencia", "acao", "deferida"].includes(key) && !value) {
        foiValidado = false;
        invalidFields.push(fieldNamesMap[key] || key); // Utiliza o mapeamento para obter o nome amigável
      }
    });

    setFormValidation(newValidationState);

    if (!foiValidado) {
      // Removendo duplicatas
      const uniqueInvalidFields = [...new Set(invalidFields)];
      const fieldsMessage = uniqueInvalidFields
        .map((field) => fieldNamesMap[field] || field)
        .join(", ");
      enqueueSnackbar(`Campos inválidos: ${fieldsMessage}`, {
        variant: "error",
      });
    }

    return foiValidado;
  };

  const tratarSubmit = async () => {
    let temErros = false;

    if (!validarForm()) {
      temErros = true;
    }

    // Validação Dt Andamento: Ano de data não pode ser inferior a 1000
    if (formData.dataAndamento) {
      const dataAndamentoObj = new Date(formData.dataAndamento);
      const anoDataAndamento = dataAndamentoObj.getFullYear();
      // Verifica se o ano é NaN ou menor que 1000
      if (isNaN(anoDataAndamento) || anoDataAndamento < 1000) {
        enqueueSnackbar(`O campo 'Data de Andamento' está inválido`, {
          variant: "error",
        });
        setErroDataAndamento(true);
        temErros = true;
      }
    }

    // Validação Prazo Judicial: Ano de data não pode ser inferior a 1000
    if (formData.prazoJudicial) {
      const prazoJudicialObj = new Date(formData.prazoJudicial);
      const anoPrazoJudicial = prazoJudicialObj.getFullYear();
      // Verifica se o ano é NaN ou menor que 1000
      if (isNaN(anoPrazoJudicial) || anoPrazoJudicial < 1000) {
        enqueueSnackbar(`O campo 'Prazo Judicial' está inválido`, {
          variant: "error",
        });
        setErroDataAndamento(true);
        temErros = true;
      }
    }

    if (temErros) {
      return;
    }

    // Processar os documentos para base64
    const documentos = await Promise.all(
      files.map(async (fileObj) => ({
        nome: fileObj.file.name,
        base64: await toBase64(fileObj.file),
      }))
    );

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoAndamentoId: formData.tipoAndamento,
        origemAndamentoId: formData.origem,
        data: formData.dataAndamento,
        prazoJudicial: formData.prazoJudicial,
        teor: formData.teor,
        documentos: documentos,
        processoId: processoSelecionadoId,
      }),
    };

    try {
      const response = await fetch(
        `${API_COMMAND}/api/Andamento/Criar`,
        requestOptions
      );
      const data = await response.json();
      if (response.ok) {
        setFormData({
          tipoAndamento: "",
          origem: "",
          dataAndamento: "",
          prazoJudicial: "",
          teor: "",
        });
        setOpen(false);
        emitter.emit("refreshCustomers");
        enqueueSnackbar("Andamento cadastrado com sucesso.", {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      } else {
        const errorDetails = data.details || "Detalhes do erro não fornecidos.";
        const errorMessage = `Erro ao criar andamento: ${
          data.message || "Erro desconhecido"
        }. ${errorDetails}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    setShowExtraFields(false);
  };

  const handleToggleExtraFields = () => {
    setShowExtraFields(!showExtraFields); // Alternar visibilidade dos campos extras
  };

  useEffect(() => {
    if (open && simpleBarRef.current) {
      simpleBarRef.current.recalculate();
    }
  }, [open]);

  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => {
      const url = URL.createObjectURL(file);
      return { file, url };
    });
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (fileToRemove) => {
    URL.revokeObjectURL(fileToRemove.url); // Liberar memória
    setFiles(files.filter((file) => file.file.name !== fileToRemove.file.name));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Split para remover o prefixo data URL
      reader.onerror = (error) => reject(error);
    });

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.75 }}
      >
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            navigation(`/apps/processos/novo-tipo-andamento`, {
              state: { indoPara: "NovoTipoAndamento" },
            });
          }}
          startIcon={<PlusOutlined />}
          style={{ borderRadius: "20px", height: "32px" }}
        >
          Novo
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
            title="Novo Andamento"
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
                  <Grid item xs={12}>
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
                      Novo Andamento
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Tipo de andamento *
                      </InputLabel>
                      <Autocomplete
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
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
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
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
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
                        onChange={(newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            dataAndamento: newValue,
                          }));
                          setErroDataAndamento(false);
                        }}
                        slotProps={{
                          textField: {
                            placeholder: "00/00/0000",
                            error:
                              (!formData.dataAndamento &&
                                formValidation.dataAndamento === false) ||
                              erroDataAndamento === true,
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
                        onChange={(newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            prazoJudicial: newValue,
                          }));
                          setErroPrazoJudicial(false);
                        }}
                        slotProps={{
                          textField: {
                            placeholder: "00/00/0000",
                            error:
                              (!formData.prazoJudicial &&
                                formValidation.prazoJudicial === false) ||
                              erroPrazoJudicial === true,
                          },
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                        Teor
                      </InputLabel>
                      <TextField
                        margin="normal"
                        name="resumo"
                        fullWidth
                        multiline
                        rows={3}
                        onChange={(e) =>
                          setFormData({ ...formData, teor: e.target.value })
                        } // Atualiza o estado
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sx={{ marginTop: 0.5 }}>
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

                      {files.map((fileObj, index) => (
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
                            {fileObj.file.name}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              component="a"
                              href={fileObj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <VisibilityIcon
                                fontSize="small"
                                color="inherit"
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              component="a"
                              href={fileObj.url}
                              download={fileObj.file.name}
                            >
                              <DownloadIcon fontSize="small" color="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(fileObj)}
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
                        }}
                      >
                        Inserir Documento
                        <input
                          type="file"
                          multiple
                          accept="application/pdf"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                    </Stack>
                  </Grid>

                  <Divider
                    style={{
                      width: "100%",
                      height: "1.5px",
                      backgroundColor: "#00000040",
                      marginTop: 30,
                    }}
                  />

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      style={{
                        width: "584px",
                        height: "46px",
                        background: "#1C52970D",
                        border: "0.6px solid #00000033",
                        justifyContent: "start",
                      }}
                      onClick={handleToggleExtraFields}
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
                    {showExtraFields && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
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
                              marginTop: "25px",
                            }}
                          >
                            Tarefa Avulsa
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Descrição
                            </InputLabel>
                            <TextField
                              margin="normal"
                              name="descricao"
                              fullWidth
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  descricaoTarefa: e.target.value,
                                })
                              } // Atualiza o estado
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={5}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Prazo Tarefa *
                            </InputLabel>
                            <DatePicker
                              onChange={(newValue) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  prazoTarefa: newValue,
                                }));
                                setErroPrazoJudicial(false);
                              }}
                              slotProps={{
                                textField: {
                                  placeholder: "00/00/0000",
                                  error:
                                    (!formData.prazoTarefa &&
                                      formValidation.prazoTarefa === false) ||
                                    erroPrazoJudicial === true,
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
                              Alerta *
                            </InputLabel>
                            <Autocomplete
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
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder=""
                                  error={
                                    !formData.origem &&
                                    formValidation.origem === false
                                  }
                                />
                              )}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={4.5}>
                          <Stack spacing={1}>
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              *
                            </InputLabel>
                            <DatePicker
                              onChange={(newValue) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  prazoJudicial: newValue,
                                }));
                                setErroPrazoJudicial(false);
                              }}
                              slotProps={{
                                textField: {
                                  placeholder: "hora(s) antes",
                                  error:
                                    (!formData.prazoJudicial &&
                                      formValidation.prazoJudicial === false) ||
                                    erroPrazoJudicial === true,
                                },
                              }}
                            />
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
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
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
                            <InputLabel
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Prioridade *
                            </InputLabel>
                            <Autocomplete
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
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
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
                        <Grid item xs={12}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Checkbox />
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
                    )}
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
                        onClick={tratarSubmit}
                        style={{
                          ...buttonStyle,
                          padding: "6px 12px",
                          fontSize: "1rem",
                          width: "91px",
                        }}
                      >
                        Salvar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </SimpleBar>
          </MainCard>
        </LocalizationProvider>
      </Drawer>
    </>
  );
};

export default ListagemTiposAndamentos;
