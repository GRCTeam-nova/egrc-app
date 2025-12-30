/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND, EGRC_COLLABORA_URL } from "../../../config";
import { Fragment, useMemo, useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetNormativos } from "../../../api/libreArquivos";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import emitter from "./eventEmitter";
// project import
import MainCard from "../../../components/MainCard";

// material-ui
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  Switch,
  DialogContent,
  DialogTitle,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  Grid,
  Paper,
  IconButton as MuiIconButton,
  Card,
  CardContent,
  Fade,
  Zoom,
  Alert,
  LinearProgress,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
  TextField,
  Tabs, // Adicionado para a funcionalidade de tabs
  Tab, // Adicionado para a funcionalidade de tabs
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
import Mark from "mark.js";
import {
  faXmark,
  faBan,
  faTrash,
  faExclamation,
  faEye,
  faFile,
  faFileExcel,
  faFileWord,
  faFilePowerpoint,
  faFileCode,
  faFilePdf,
  faExpand,
  faCompress,
  faDownload,
  faRefresh,
  faTimes,
  faUpload,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../../components/third-party/react-table";
import axios from "axios";
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
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Converter valores para string, normalizar e realizar a comparação
  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);

  return cellValue.includes(valueStr);
};

// Função para obter ícone baseado na extensão do arquivo
const getFileIcon = (extension) => {
  const ext = extension.toLowerCase();
  switch (ext) {
    case ".xlsx":
    case ".xls":
    case ".csv":
      return faFileExcel;
    case ".docx":
    case ".doc":
      return faFileWord;
    case ".pptx":
    case ".ppt":
      return faFilePowerpoint;
    case ".pdf":
      return faFilePdf;
    case ".js":
    case ".ts":
    case ".jsx":
    case ".tsx":
    case ".html":
    case ".css":
      return faFileCode;
    default:
      return faFile;
  }
};

// Função para obter cor baseada na extensão do arquivo
const getFileColor = (extension) => {
  const ext = extension.toLowerCase();
  switch (ext) {
    case ".xlsx":
    case ".xls":
    case ".csv":
      return "#1D6F42"; // Verde Excel
    case ".docx":
    case ".doc":
      return "#2B579A"; // Azul Word
    case ".pptx":
    case ".ppt":
      return "#D24726"; // Laranja PowerPoint
    case ".pdf":
      return "#DC3545"; // Vermelho PDF
    case ".js":
    case ".ts":
    case ".jsx":
    case ".tsx":
      return "#F7DF1E"; // Amarelo JavaScript
    case ".html":
      return "#E34F26"; // Laranja HTML
    case ".css":
      return "#1572B6"; // Azul CSS
    default:
      return "#6C757D"; // Cinza padrão
  }
};

// ==============================|| MODAL DE UPLOAD ||============================== //

function UploadModal({ open, onClose, onUploadSuccess }) {
  const theme = useTheme();
  const { token } = useToken();
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // dentro de UploadModal
  const [fileInputKey, setFileInputKey] = useState(0);

  const resetFileInput = () => {
    setSelectedFile(null);
    // opcional: limpar o nome se você só o preenche quando vem do arquivo
    // setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = null;
    // força o remount do input (garante o onChange com o mesmo arquivo)
    setFileInputKey((k) => k + 1);
  };

  const getTenantId = () => {
    const tenantRaw = localStorage.getItem("selected_tenant") || "";
    try {
      const tenantObj = JSON.parse(tenantRaw);
      return tenantObj?.idTenant || "";
    } catch (e) {
      console.error("Erro ao parsear tenant:", e);
      return "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!fileName || !selectedFile) {
      enqueueSnackbar("Por favor, preencha o nome e selecione um arquivo.", {
        variant: "warning",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return;
    }

    setUploading(true);

    try {
      const idContainer = getTenantId();

      const formData = new FormData();
      formData.append("Name", fileName);
      formData.append("IdContainer", idContainer);
      formData.append("Files", selectedFile);

      const response = await axios.post(
        `${API_URL}files/integration`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      enqueueSnackbar("Arquivo enviado com sucesso!", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      // Resetar o formulário
      setFileName("");
      resetFileInput();
      setUploading(false);

      // Chamar callback de sucesso e fechar modal
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      enqueueSnackbar(
        `Erro ao enviar arquivo: ${
          error.response?.data?.message || error.message
        }`,
        {
          variant: "error",
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        }
      );
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFileName("");
      resetFileInput();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 19px",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <FontAwesomeIcon icon={faCloudUploadAlt} size="lg" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Novo Arquivo
          </Typography>
        </Stack>
        <MuiIconButton
          onClick={handleClose}
          disabled={uploading}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </MuiIconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "22px 14px" }}>
        <Stack spacing={2}>
          <TextField
            autoFocus
            margin="dense"
            id="fileName"
            label="Nome do Arquivo"
            type="text"
            fullWidth
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${
                dragActive ? theme.palette.primary.main : theme.palette.divider
              }`,
              borderRadius: 2,
              padding: 3,
              textAlign: "center",
              backgroundColor: dragActive
                ? `${theme.palette.primary.main}10`
                : "transparent",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              key={fileInputKey}
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {selectedFile ? (
              <Stack spacing={1} alignItems="center">
                <FontAwesomeIcon
                  icon={getFileIcon(
                    selectedFile.name.substring(
                      selectedFile.name.lastIndexOf(".")
                    )
                  )}
                  style={{
                    fontSize: "32px",
                    color: getFileColor(
                      selectedFile.name.substring(
                        selectedFile.name.lastIndexOf(".")
                      )
                    ),
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1} alignItems="center">
                <FontAwesomeIcon
                  icon={faCloudUploadAlt}
                  style={{
                    fontSize: "32px",
                    color: theme.palette.primary.main,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Arraste um arquivo aqui ou clique para selecionar
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Formatos suportados: PDF, DOCX, XLSX, PPTX, etc.
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Indicador de progresso */}
          {uploading && (
            <Box>
              <LinearProgress
                sx={{
                  borderRadius: 1,
                  height: 6,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Enviando arquivo...
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "16px 24px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={uploading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          disabled={uploading || !fileName || !selectedFile}
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faUpload} />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            "&:hover": {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[8],
            },
            transition: "all 0.3s ease",
          }}
        >
          {uploading ? "Enviando..." : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UploadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploadSuccess: PropTypes.func,
};

// ==============================|| ACTION CELL - MANTIDA ORIGINAL ||============================== //

function ActionCell({
  row,
  refreshData,
  onFileSelect,
  selectedFileIds,
  onCloseViewer,
}) {
  const navigation = useNavigate();
  const { token } = useToken();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(row.original.active);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

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

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const toggleStatus = async () => {
    const idProcess = row.original.idNormative;
    const newStatus = status === true ? "Inativo" : "Ativo";

    try {
      // Buscar os dados do departamento pelo ID
      const getResponse = await axios.get(
        `${API_URL}normatives/${idProcess}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dadosEndpoint = getResponse.data;

      // Definir o novo status do campo "active"
      const dadosAtualizados = {
        ...dadosEndpoint,
        active: newStatus === "Ativo",
      };

      // Enviar os dados atualizados via PUT
      await axios.put(
        `${API_URL}normatives`,
        dadosAtualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Atualizar o estado e exibir mensagem de sucesso
      setStatus(newStatus);
      const message = `Normativa ${
        row.original.name
      } ${newStatus.toLowerCase()}.`;

      enqueueSnackbar(message, {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      refreshData();
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(`Erro: ${error.response?.data || error.message}`, {
        variant: "error",
      });
    }

    handleDialogClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}normatives/${row.original.idNormative}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        enqueueSnackbar("Arquivo deletado com sucesso!", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
        refreshData();
        handleDeleteDialogClose();
      } else {
        const data = await response.json();
        if (data.message && data.message.includes("vinculado")) {
          setOpenErrorDialog(true);
        } else {
          throw new Error(data.message || "Erro ao deletar");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(`Erro ao deletar: ${error.message}`, {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }
  };

  const handleOpenFile = () => {
    onFileSelect(row.original);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "basic-menu" : undefined;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="flex-end"
    >
      <Tooltip title="Abrir arquivo">
        <MuiIconButton
          size="small"
          onClick={handleOpenFile}
          sx={{
            color: theme.palette.success.main,
            "&:hover": {
              backgroundColor: `${theme.palette.success.main}20`,
              transform: "scale(1.15)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <FontAwesomeIcon icon={faEye} />
        </MuiIconButton>
      </Tooltip>

      <Tooltip title="Mais opções">
        <MuiIconButton
          id={id}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          size="small"
          sx={{
            color: theme.palette.info.main,
            "&:hover": {
              backgroundColor: `${theme.palette.info.main}20`,
              transform: "scale(1.15)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <MoreVertIcon />
        </MuiIconButton>
      </Tooltip>

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
        <Box sx={{ p: 1 }}>
          <Button
            onClick={handleDialogOpen}
            fullWidth
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: `${theme.palette.primary.main}20`,
              },
            }}
          >
            <FontAwesomeIcon
              icon={faExclamation}
              style={{ marginRight: "8px" }}
            />
            Alterar Status
          </Button>
          <Button
            onClick={() => setOpenDeleteDialog(true)}
            fullWidth
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: theme.palette.error.main,
              "&:hover": {
                backgroundColor: `${theme.palette.error.main}20`,
              },
            }}
          >
            <FontAwesomeIcon icon={faTrash} style={{ marginRight: "8px" }} />
            Deletar
          </Button>
        </Box>
      </Popover>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirmar alteração de status</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja alterar o status de "{row.original.name}"
            para {status === true ? "Inativo" : "Ativo"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={toggleStatus} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar "{row.original.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 19px",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FontAwesomeIcon icon={faExclamation} size="lg" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Erro
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setOpenErrorDialog(false)}
            sx={{
              backgroundColor: "transparent",
              boxShadow: "none",
              color: "white",
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
  onFileSelect: PropTypes.func,
  selectedFileIds: PropTypes.array,
  onCloseViewer: PropTypes.func,
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  processosTotal,
  isLoading,
  onFileSelect,
  selectedFileIds,
  refreshData,
  modalToggler,
  onFormDataChange,
  onCloseViewer,
  onOpenUploadModal,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Arquivos";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "nome", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [isInactiveFilter, setIsInactiveFilter] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigation = useNavigate();

  const handleFilterClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "status-filter-popover" : undefined;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (isActiveFilter && item.active) return true;
      if (isInactiveFilter && !item.active) return true;
      return false;
    });
  }, [data, isActiveFilter, isInactiveFilter]);

  // Adicionar coluna de ícone e modificar coluna de ações
  const enhancedColumns = useMemo(() => {
    return [
      {
        id: "fileIcon",
        header: "",
        cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getFileIcon(row.original.extension)}
              style={{
                color: getFileColor(row.original.extension),
                fontSize: "18px",
              }}
            />
          </Box>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 50,
      },
      ...columns.map((col) => {
        if (col.cell && col.cell.toString().includes("ActionCell")) {
          return {
            ...col,
            cell: ({ row }) => (
              <ActionCell
                row={row}
                refreshData={refreshData}
                onFileSelect={onFileSelect}
                selectedFileIds={selectedFileIds}
                onCloseViewer={onCloseViewer}
              />
            ),
          };
        }
        return col;
      }),
    ];
  }, [columns, refreshData, onFileSelect, selectedFileIds, onCloseViewer]);

  const table = useReactTable({
    data: filteredData,
    columns: enhancedColumns,
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

  // Função para realizar a marcação de texto
  useEffect(() => {
    const markInstance = new Mark(tableRef.current);

    if (globalFilter) {
      markInstance.unmark({
        done: () => {
          markInstance.mark(globalFilter, {
            className: "highlight-search",
          });
        },
      });
    } else {
      markInstance.unmark();
    }
  }, [globalFilter, table.getRowModel().rows]);

  return (
    <>
      <style>
        {`
          .highlight-search {
            background-color: #ffeb3b !important;
            color: #000 !important;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
          }
        `}
      </style>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          paddingBottom: 2,
          paddingTop: 2,
          paddingRight: 2,
          paddingLeft: 2,
          marginBottom: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
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
            placeholder={`🔍 Pesquise pelo nome do arquivo...`}
            style={{
              width: "350px",
              height: "40px",
              borderRadius: "20px",
              border: `2px solid ${theme.palette.primary.main}30`,
              backgroundColor: "#FFFFFF",
              paddingLeft: "16px",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          />
          {globalFilter && (
            <Chip
              label={`${table.getFilteredRowModel().rows.length} resultado(s)`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <div style={verticalDividerStyle}></div>

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
                  onOpenUploadModal();
                }}
                startIcon={<PlusOutlined />}
                sx={{
                  borderRadius: "25px",
                  height: "40px",
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Novo Arquivo
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <MainCard content={false} sx={{ overflow: "hidden" }}>
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
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                          "& .MuiTableCell-head": {
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          },
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
                              key={header.id}
                              {...{
                                colSpan: header.colSpan,
                                style: {
                                  width:
                                    header.getSize() === 150
                                      ? "auto"
                                      : header.getSize(),
                                },
                              }}
                            >
                              {header.isPlaceholder ? null : (
                                <HeaderSort
                                  column={header.column}
                                  title={
                                    typeof header.column.columnDef.header ===
                                    "string"
                                      ? header.column.columnDef.header
                                      : "#"
                                  }
                                />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <Fragment key={row.id}>
                        <TableRow
                          sx={{
                            backgroundColor: row.getIsSelected()
                              ? `${theme.palette.primary.main}15`
                              : "inherit",
                            "&:hover": {
                              backgroundColor: `${theme.palette.primary.main}10`,
                            },
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              {...{
                                style: {
                                  width:
                                    cell.column.columnDef.size === 150
                                      ? "auto"
                                      : cell.column.columnDef.size,
                                },
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {table.getRowModel().rows.length === 0 && (
                <EmptyTable msg="Nenhum arquivo encontrado" />
              )}

              <TablePagination
                {...{
                  setPageIndex: table.setPageIndex,
                  setPageSize: table.setPageSize,
                  getState: table.getState,
                  getPageCount: table.getPageCount,
                  recordType,
                }}
              />
            </Stack>
          </div>
        </ScrollX>
      </MainCard>
    </>
  );
}

ReactTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  processosTotal: PropTypes.number,
  isLoading: PropTypes.bool,
  onFileSelect: PropTypes.func,
  selectedFileIds: PropTypes.array,
  refreshData: PropTypes.func,
  modalToggler: PropTypes.func,
  onFormDataChange: PropTypes.func,
  renderRowSubComponent: PropTypes.any,
  onCloseViewer: PropTypes.func,
  onOpenUploadModal: PropTypes.func,
};

// ==============================|| COMPONENTE DE VISUALIZADOR COM TABS ||============================== //

// === SUBSTITUTE O FileViewer PELO CÓDIGO ABAIXO ===
function FileViewer({
  openedFiles,
  activeTabId,
  onTabChange,
  onCloseTab,
  onRefreshTab,
  isFullscreen,
  onToggleFullscreen,
}) {
  const theme = useTheme();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const moreOpen = Boolean(moreAnchor);
  const handleOpenMore = (e) => setMoreAnchor(e.currentTarget);
  const handleCloseMore = () => setMoreAnchor(null);

  // --- Hook para medir largura disponível da área das Abas ---
  const measureRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    if (!measureRef.current) return;
    const ro = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width || 0)
    );
    ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, []);

  // --- “Medição” aproximada das larguras de cada aba (sem tocar no DOM) ---
  // Usamos uma estimativa estável: base + fator pelo tamanho do nome (com limite superior)
  // Isso é suficiente para decidir o que cabe e é leve/robusto.
  const estimateTabWidth = (file) => {
    const labelLen = (file?.name || "").length;
    // base 110 + ~4.8px/char, clamp a 220. Somar ícone + botão fechar + paddings.
    return Math.min(220, 110 + labelLen * 4.8);
  };

  // --- Split: o que cabe em viewport -> visível; o resto vai para "Mais (N)" ---
  const { visibleTabs, overflowTabs } = useMemo(() => {
    if (!openedFiles?.length) return { visibleTabs: [], overflowTabs: [] };

    // Reservas de layout:
    // - Fade da direita (18px)
    // - Margens internas (8px)
    // - Botões de scroll do MUI Tabs já respeitam espaço, mas consideramos uma folguinha
    const RESERVED = 26;
    const available = Math.max(0, containerWidth - RESERVED);

    // priorize manter a aba ativa visível: leve-a para frente no cálculo
    const list = [...openedFiles];
    const activeIndex = list.findIndex((f) => f.id === activeTabId);
    if (activeIndex > 0) {
      const [active] = list.splice(activeIndex, 1);
      list.unshift(active);
    }

    let acc = 0;
    const fit = [];
    const rest = [];
    for (const f of list) {
      const w = estimateTabWidth(f);
      if (acc + w <= available || fit.length === 0) {
        fit.push(f);
        acc += w;
      } else {
        rest.push(f);
      }
    }

    // para manter a ordem visual original, remontamos pelos ids escolhidos
    const fitIds = new Set(fit.map((f) => f.id));
    const restIds = new Set(rest.map((f) => f.id));
    return {
      visibleTabs: openedFiles.filter((f) => fitIds.has(f.id)),
      overflowTabs: openedFiles.filter((f) => restIds.has(f.id)),
    };
  }, [openedFiles, activeTabId, containerWidth]);

  if (!openedFiles?.length) return null;
  const activeFile = openedFiles.find((f) => f.id === activeTabId);

  return (
    <Zoom in={true} timeout={300}>
      <MainCard
        title={
          // HEADER em grid: 1fr (abas) | auto (ações). Ações têm z-index mais alto.
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: 1,
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* ÁREA DAS ABAS */}
            <Box
              ref={measureRef}
              sx={{ position: "relative", minWidth: 0, overflow: "hidden" }}
            >
              <Tabs
                value={activeTabId}
                onChange={(e, v) => onTabChange(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  overflow: "hidden",
                  minHeight: 40,
                  "& .MuiTabs-indicator": {
                    backgroundColor: theme.palette.primary.main,
                    height: 3,
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    minWidth: "auto",
                    padding: "6px 12px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: "4px 4px 0 0",
                    },
                    "&.Mui-selected": {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                  },
                  "& .MuiTabs-scrollButtons": { flexShrink: 0 },
                }}
              >
                {visibleTabs.map((file) => (
                  <Tab
                    key={file.id}
                    value={file.id}
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ maxWidth: 200 }}
                      >
                        <FontAwesomeIcon
                          icon={getFileIcon(file.extension)}
                          style={{
                            color: getFileColor(file.extension),
                            fontSize: 14,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </Typography>
                        <MuiIconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(file.id);
                          }}
                          sx={{
                            p: "2px",
                            ml: "4px !important",
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              color: theme.palette.error.main,
                              backgroundColor: `${theme.palette.error.main}10`,
                            },
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faTimes}
                            style={{ fontSize: 12 }}
                          />
                        </MuiIconButton>
                      </Stack>
                    }
                    sx={{
                      borderRight: `1px solid ${theme.palette.divider}`,
                      "&:last-child": { borderRight: "none" },
                    }}
                  />
                ))}
              </Tabs>

              {/* Fade à direita (visual, não bloqueia clique nas ações) */}
              <Box
                sx={{
                  pointerEvents: "none",
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 18,
                  background: `linear-gradient(to right, transparent, ${theme.palette.background.paper})`,
                }}
              />
            </Box>

            {/* AÇÕES + "MAIS (N)" — zIndex alto para NUNCA sumir */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                pl: 1,
                flexShrink: 0,
                position: "relative",
                zIndex: 2,
                background: theme.palette.background.paper,
              }}
            >
              {!!overflowTabs.length && (
                <>
                  <Tooltip title="Mais abas">
                    <MuiIconButton
                      onClick={handleOpenMore}
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          backgroundColor: `${theme.palette.action.hover}`,
                          transform: "scale(1.06)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Reaproveitando o ícone que você já usa no projeto */}
                      <MoreVertIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        ({overflowTabs.length})
                      </Typography>
                    </MuiIconButton>
                  </Tooltip>

                  <Popover
                    open={moreOpen}
                    anchorEl={moreAnchor}
                    onClose={handleCloseMore}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{ sx: { minWidth: 320 } }}
                  >
                    <Box sx={{ px: 2, py: 1, opacity: 0.8 }}>
                      <Typography variant="caption">Abas adicionais</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ maxHeight: 360, overflowY: "auto", py: 0.5 }}>
                      {overflowTabs.map((file) => (
                        <Stack
                          key={file.id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            px: 1.5,
                            py: 1,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                          onClick={() => {
                            handleCloseMore();
                            onTabChange(file.id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={getFileIcon(file.extension)}
                            style={{
                              color: getFileColor(file.extension),
                              fontSize: 13,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </Typography>
                          <MuiIconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseTab(file.id);
                            }}
                            sx={{
                              p: "2px",
                              color: theme.palette.text.secondary,
                              "&:hover": {
                                color: theme.palette.error.main,
                                backgroundColor: `${theme.palette.error.main}10`,
                              },
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              style={{ fontSize: 12 }}
                            />
                          </MuiIconButton>
                        </Stack>
                      ))}
                    </Box>
                  </Popover>
                </>
              )}

              <Tooltip title="Recarregar">
                <MuiIconButton
                  onClick={() => onRefreshTab(activeTabId)}
                  size="small"
                  sx={{
                    color: theme.palette.info.main,
                    "&:hover": {
                      backgroundColor: `${theme.palette.info.main}20`,
                      transform: "scale(1.08)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <FontAwesomeIcon icon={faRefresh} />
                </MuiIconButton>
              </Tooltip>

              <Tooltip
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                <MuiIconButton
                  onClick={onToggleFullscreen}
                  size="small"
                  sx={{
                    color: theme.palette.warning.main,
                    "&:hover": {
                      backgroundColor: `${theme.palette.warning.main}20`,
                      transform: "scale(1.08)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <FontAwesomeIcon
                    icon={isFullscreen ? faCompress : faExpand}
                  />
                </MuiIconButton>
              </Tooltip>
            </Stack>
          </Box>
        }
        content={false}
        sx={{
          height: isFullscreen ? "95vh" : "80vh",
          transition: "all 0.3s ease",
          border: `2px solid ${theme.palette.primary.main}30`,
        }}
      >
        <Box
          sx={{
            height: isFullscreen ? "calc(95vh - 80px)" : "calc(80vh - 80px)",
            p: 0,
            position: "relative",
          }}
        >
          {activeFile?.loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="body2" color="text.secondary">
                Carregando documento...
              </Typography>
            </Box>
          ) : activeFile?.error ? (
            <Alert
              severity="error"
              sx={{ m: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => onRefreshTab(activeTabId)}
                >
                  Tentar novamente
                </Button>
              }
            >
              Erro de conexão. Verifique se o tenant ID e o token de acesso
              estão configurados corretamente.
            </Alert>
          ) : (
            <iframe
              src={activeFile?.iframeUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={activeFile?.name}
            />
          )}
        </Box>
      </MainCard>
    </Zoom>
  );
}

FileViewer.propTypes = {
  openedFiles: PropTypes.array.isRequired,
  activeTabId: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired,
  onRefreshTab: PropTypes.func.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired,
};

// ==============================|| COMPONENTE PRINCIPAL FINAL ||============================== //

const LibreOfficeViewerFinal = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigation = useNavigate();
  const { processoSelecionadoId } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const {
    acoesJudiciais: lists,
    isLoading,
    refetch,
  } = useGetNormativos(formData, processoSelecionadoId);
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Estados para o visualizador com múltiplas abas
  const [openedFiles, setOpenedFiles] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Obter tenant e token do localStorage
  const getTenantId = () => {
    const tenantRaw = localStorage.getItem("selected_tenant") || "";
    try {
      const tenantObj = JSON.parse(tenantRaw);
      return tenantObj?.idTenant || "";
    } catch (e) {
      console.error("Erro ao parsear tenant:", e);
      return "";
    }
  };

  const getAccessToken = () => {
    return localStorage.getItem("access_token") || "";
  };

  // Função para construir a URL do iframe com tratamento de erro
  const buildIframeUrl = (file) => {
    const tenantId = getTenantId();
    const token = getAccessToken();

    if (!tenantId || !token) {
      console.error("Tenant ID ou token não encontrados");
      return null;
    }

    // Extrair as duas últimas partes do caminho da URL para formar o fileName correto
    const pathParts = file.idFile.split("/");
    const fileName = pathParts.slice(-2).join("/");

    const wopiSrc = `${EGRC_COLLABORA_URL}/wopi/files/${fileName}?access_token=${token}`;
    const encodedWopiSrc = encodeURIComponent(wopiSrc);

    return `${EGRC_COLLABORA_URL}/browser/5aa2ead294/cool.html?WOPISrc=${encodedWopiSrc}`;
  };

  // Função chamada quando um arquivo é selecionado
  const handleFileSelect = (file) => {
    const fileId = file.idFile;

    // Verificar se o arquivo já está aberto
    const existingFile = openedFiles.find((f) => f.id === fileId);

    if (existingFile) {
      // Se já está aberto, apenas mude para a aba
      setActiveTabId(fileId);
    } else {
      // Se não está aberto, adicione uma nova aba
      const iframeUrl = buildIframeUrl(file);

      const newFile = {
        id: fileId,
        name: file.name,
        extension: file.extension,
        path: file.path,
        iframeUrl: iframeUrl,
        loading: true,
        error: !iframeUrl,
        originalFile: file,
      };

      setOpenedFiles([...openedFiles, newFile]);
      setActiveTabId(fileId);

      // Simular carregamento
      setTimeout(() => {
        setOpenedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, loading: false } : f))
        );
      }, 2000);
    }
  };

  // Função para fechar uma aba
  const handleCloseTab = (fileId) => {
    const newOpenedFiles = openedFiles.filter((f) => f.id !== fileId);
    setOpenedFiles(newOpenedFiles);

    // Se a aba fechada era a ativa, mude para outra
    if (activeTabId === fileId && newOpenedFiles.length > 0) {
      setActiveTabId(newOpenedFiles[newOpenedFiles.length - 1].id);
    } else if (newOpenedFiles.length === 0) {
      setActiveTabId(null);
    }
  };

  // Função para recarregar uma aba
  const handleRefreshTab = (fileId) => {
    setOpenedFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, loading: true };
        }
        return f;
      })
    );

    // Simular carregamento
    setTimeout(() => {
      setOpenedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, loading: false } : f))
      );
    }, 2000);
  };

  // Função para alternar tela cheia
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handlers para o modal de upload
  const handleOpenUploadModal = () => {
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadSuccess = () => {
    refreshOrgaos();
  };

  // Definição das colunas da tabela (mantida original)
  const columns = useMemo(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
      },
      {
        header: " ",
        disableSortBy: true,
        cell: ({ row }) => (
          <ActionCell
            row={row}
            refreshData={refreshOrgaos}
            onFileSelect={handleFileSelect}
            selectedFileIds={openedFiles.map((f) => f.id)}
            onCloseViewer={() => {}}
          />
        ),
      },
    ],
    [theme, openedFiles]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Início
          </Link>
          <Link underline="hover" color="inherit" href="/arquivos">
            Arquivos
          </Link>
          <Typography color="text.primary">LibreOffice Viewer</Typography>
        </Breadcrumbs>
      </Box>

      {/* Modal de Upload */}
      <UploadModal
        open={uploadModalOpen}
        onClose={handleCloseUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />

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
        <Grid container spacing={3}>
          {/* Listagem de arquivos */}
          <Grid
            item
            xs={12}
            lg={openedFiles.length > 0 ? (isFullscreen ? 0 : 6) : 12}
          >
            <Fade in={!isFullscreen} timeout={300}>
              <Box sx={{ display: isFullscreen ? "none" : "block" }}>
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
                      onFileSelect: handleFileSelect,
                      selectedFileIds: openedFiles.map((f) => f.id),
                      onCloseViewer: () => {},
                      onOpenUploadModal: handleOpenUploadModal,
                    }}
                  />
                )}
              </Box>
            </Fade>
          </Grid>

          {/* Visualizador de arquivo com abas */}
          {openedFiles.length > 0 && (
            <Grid item xs={12} lg={isFullscreen ? 12 : 6}>
              <FileViewer
                openedFiles={openedFiles}
                activeTabId={activeTabId}
                onTabChange={setActiveTabId}
                onCloseTab={handleCloseTab}
                onRefreshTab={handleRefreshTab}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </Grid>
          )}
        </Grid>
      )}

      <CustomerModal
        open={customerModal}
        modalToggler={() => {
          setCustomerModal(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
      <AlertCustomerDelete
        id={customerDeleteId}
        title={customerDeleteId}
        open={open}
        handleClose={handleClose}
      />
    </Box>
  );
};

export default LibreOfficeViewerFinal;
