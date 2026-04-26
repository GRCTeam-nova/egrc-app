/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Mark from "mark.js";
import { enqueueSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useGetDepartamentos } from "../../../api/departamentos";
import { useToken } from "../../../api/TokenContext";
import IconButton from "../../../components/@extended/IconButton";
import MainCard from "../../../components/MainCard";
import ScrollX from "../../../components/ScrollX";
import {
  DebouncedInput,
  EmptyTable,
  HeaderSort,
  RowSelection,
  SelectColumnVisibility,
  TablePagination,
} from "../../../components/third-party/react-table";
import emitter from "../tela2/eventEmitter";

const COLUMN_VISIBILITY_STORAGE_KEY = "egrc_table_visibility_departamentos";

const defaultVisibility = {
  code: true,
  name: true,
  type: true,
  unit: true,
  active: true,
  actions: true,
};

const tableStatusOptions = ["Ativo", "Inativo"];

const getDepartmentId = (department) =>
  department?.idDepartment ?? department?.id ?? null;

const normalizeText = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const formatFieldValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const getStatusLabel = (active) => (active ? "Ativo" : "Inativo");

const normalizeDepartmentRelationIds = (items, idKey) =>
  Array.isArray(items)
    ? [...new Set(items.map((item) => item?.[idKey]).filter(Boolean))]
    : [];

const normalizeUploadedFiles = (files) =>
  Array.isArray(files)
    ? files.map((file) => {
        if (typeof file === "string") return file;
        if (file?.path) return file.path;
        return file;
      })
    : [];

const buildDepartmentUpdatePayload = (departmentData, nextActive) => ({
  idDepartment: departmentData.idDepartment,
  active: nextActive,
  name: departmentData.name,
  code: departmentData.code,
  temporary: departmentData.temporary ?? false,
  collegiate: departmentData.collegiate ?? false,
  description: departmentData.description ?? "",
  files: normalizeUploadedFiles(departmentData.files),
  idNormatives: departmentData.idNormatives ?? [],
  idLgpds: departmentData.idLgpds ?? [],
  idResponsible: departmentData.idResponsible ?? null,
  idDepartmentSuperior: departmentData.idDepartmentSuperior ?? null,
  idDepartmentBottoms: normalizeDepartmentRelationIds(
    departmentData.departmentBottoms,
    "idDepartmentBottom",
  ),
  idDepartmentSides: normalizeDepartmentRelationIds(
    departmentData.departmentSides,
    "idDepartmentSide",
  ),
  idIncidents: departmentData.idIncidents ?? [],
  idUnitFormat: departmentData.idUnitFormat ?? null,
  idRisks: departmentData.idRisks ?? [],
  idResponsabilityType: departmentData.idResponsabilityType ?? null,
  idProcesses: departmentData.idProcesses ?? [],
  idActionPlans: departmentData.idActionPlans ?? [],
});

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

  const cellString = normalizeText(cellValue);
  const searchTerms = normalizeText(value)
    .split(" ")
    .filter((term) => term.trim() !== "");

  return searchTerms.every((term) => cellString.includes(term));
};

function ReactTable({ data, columns, isLoading, onExportExcel }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const navigation = useNavigate();
  const tableRef = useRef(null);
  const recordType = "Departamentos";

  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultVisibility;
    } catch (error) {
      console.error("Erro ao carregar visibilidade das colunas", error);
      return defaultVisibility;
    }
  });
  const [sorting, setSorting] = useState([{ id: "name", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    { type: "Status", values: ["Ativo"] },
  ]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [draftFilters, setDraftFilters] = useState({
    code: [],
    department: [],
    type: [],
    unit: [],
    status: ["Ativo"],
  });

  useEffect(() => {
    localStorage.setItem(
      COLUMN_VISIBILITY_STORAGE_KEY,
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  useEffect(() => {
    const getUniqueValues = (values) =>
      [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))]
        .sort((left, right) => String(left).localeCompare(String(right)));

    setCodeOptions(getUniqueValues((data || []).map((item) => item.code)));
    setDepartmentOptions(getUniqueValues((data || []).map((item) => item.name)));
    setTypeOptions(getUniqueValues((data || []).map((item) => item.type)));
    setUnitOptions(getUniqueValues((data || []).map((item) => item.unit)));
  }, [data]);

  const toggleDrawer = () => {
    setDrawerOpen((current) => !current);
  };

  const applyFilters = () => {
    const nextFilters = [];

    if (draftFilters.code.length > 0) {
      nextFilters.push({ type: "Codigo", values: draftFilters.code });
    }
    if (draftFilters.department.length > 0) {
      nextFilters.push({
        type: "Departamento",
        values: draftFilters.department,
      });
    }
    if (draftFilters.type.length > 0) {
      nextFilters.push({ type: "Tipo", values: draftFilters.type });
    }
    if (draftFilters.unit.length > 0) {
      nextFilters.push({ type: "Unidade", values: draftFilters.unit });
    }
    if (draftFilters.status.length > 0) {
      nextFilters.push({ type: "Status", values: draftFilters.status });
    }

    setSelectedFilters(nextFilters);
    toggleDrawer();
  };

  const removeFilter = (index) => {
    setSelectedFilters((currentFilters) => {
      const filterToRemove = currentFilters[index];
      const filterKeyMap = {
        Codigo: "code",
        Departamento: "department",
        Tipo: "type",
        Unidade: "unit",
        Status: "status",
      };
      const filterKey = filterKeyMap[filterToRemove.type];

      setDraftFilters((currentDraft) => ({
        ...currentDraft,
        [filterKey]: currentDraft[filterKey].filter(
          (value) => !filterToRemove.values.includes(value),
        ),
      }));

      return currentFilters.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleRemoveAllFilters = () => {
    setSelectedFilters([]);
    setGlobalFilter("");
    setDraftFilters({
      code: [],
      department: [],
      type: [],
      unit: [],
      status: [],
    });
  };

  const filteredData = useMemo(
    () =>
      (data || []).filter((item) =>
        selectedFilters.every((filter) => {
          if (filter.type === "Codigo") return filter.values.includes(item.code);
          if (filter.type === "Departamento")
            return filter.values.includes(item.name);
          if (filter.type === "Tipo") return filter.values.includes(item.type);
          if (filter.type === "Unidade") return filter.values.includes(item.unit);
          if (filter.type === "Status") {
            const showActive = filter.values.includes("Ativo");
            const showInactive = filter.values.includes("Inativo");
            if (showActive && showInactive) return true;
            if (showActive) return item.active === true;
            if (showInactive) return item.active === false;
          }
          return true;
        }),
      ),
    [data, selectedFilters],
  );

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

  const getAllColumnsFiltered = () =>
    table
      .getAllLeafColumns()
      .filter((column) => !["actions", "select"].includes(column.id));

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

  const visibleColumnCount =
    table.getVisibleLeafColumns().length || columns.length || 1;

  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginLeft: "7px",
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
            placeholder="Pesquise por codigo, departamento, etc..."
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
              backgroundColor: "#FFFFFF",
            }}
          />
          <Button
            onClick={toggleDrawer}
            startIcon={
              <FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />
            }
            style={{
              width: "90px",
              color: "#00000080",
              backgroundColor: "#FFFFFF",
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
          <div style={verticalDividerStyle} />
          <Button
            variant="contained"
            onClick={() =>
              navigation(`/departamentos/criar`, {
                state: { indoPara: "NovoDepartamento" },
              })
            }
            startIcon={<PlusOutlined />}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Novo
          </Button>
          <Button
            variant="outlined"
            onClick={onExportExcel}
            startIcon={<DownloadOutlined />}
            disabled={isLoading}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Exportar Excel
          </Button>
        </Stack>
      </Stack>
      <Box mb={2}>
        {selectedFilters.map((filter, index) => (
          <Chip
            key={`${filter.type}-${index}`}
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
                Codigo
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={codeOptions}
                  value={draftFilters.code}
                  onChange={(_, value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      code: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Departamento
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={departmentOptions}
                  value={draftFilters.department}
                  onChange={(_, value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      department: value,
                    }))
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
                  onChange={(_, value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      type: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                Unidade
              </InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={unitOptions}
                  value={draftFilters.unit}
                  onChange={(_, value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      unit: value,
                    }))
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
                  disableCloseOnSelect
                  options={tableStatusOptions}
                  value={draftFilters.status}
                  onChange={(_, value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      status: value,
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
                              className: `${
                                header.column.columnDef.meta.className || ""
                              } cursor-pointer prevent-select`,
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
                          colSpan={visibleColumnCount}
                          sx={{ textAlign: "center" }}
                        >
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length > 0 ? (
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
                        <TableCell colSpan={visibleColumnCount}>
                          <EmptyTable msg="Dados nao encontrados" />
                        </TableCell>
                      </TableRow>
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
                    totalItems: filteredData.length,
                    recordType,
                  }}
                />
              </Box>
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
  isLoading: PropTypes.bool,
  onExportExcel: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState(Boolean(row.original.active));

  const normalizedDepartment = {
    ...row.original,
    idDepartment: getDepartmentId(row.original),
  };

  useEffect(() => {
    setStatus(Boolean(row.original.active));
  }, [row.original.active]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleStatus = async () => {
    handleClose();
    setOpenDialog(false);

    const departmentId = normalizedDepartment.idDepartment;
    const authToken = token || localStorage.getItem("access_token");
    const nextActive = !Boolean(status);

    try {
      const getResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}departments/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const payload = buildDepartmentUpdatePayload(
        getResponse.data,
        nextActive,
      );

      await axios.put(`${process.env.REACT_APP_API_URL}departments`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      enqueueSnackbar(
        `Departamento ${normalizedDepartment.name} ${
          nextActive ? "ativado" : "inativado"
        } com sucesso.`,
        {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );

      setStatus(nextActive);
      refreshData();
    } catch (error) {
      console.error("Erro ao atualizar departamento", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          error.response?.data ||
          "Erro ao alterar o status do departamento.",
        {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
    }
  };

  const buttonStyle = {
    borderRadius: 8,
    backgroundColor: "#1C52970D",
    width: "30px",
    height: "30px",
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "department-action-popover" : undefined;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <IconButton
        aria-describedby={popoverId}
        color="primary"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        style={buttonStyle}
      >
        <MoreVertIcon />
      </IconButton>

      <Popover
        id={popoverId}
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
              navigation("/departamentos/criar", {
                state: {
                  indoPara: "NovoDepartamento",
                  dadosApi: normalizedDepartment,
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
              if (status) {
                setOpenDialog(true);
              } else {
                handleToggleStatus();
              }
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {status ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
              aria-label="status"
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
            onClick={() => setOpenDialog(false)}
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
            Tem certeza que deseja inativar o departamento "{normalizedDepartment.name}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Ao inativar, esse departamento nao aparecera mais no cadastro manual.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleToggleStatus}
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
              color: "#FFFFFF",
              textTransform: "none",
            }}
          >
            Sim, inativar
          </Button>
          <Button
            onClick={() => setOpenDialog(false)}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(0, 0, 0, 0.60)",
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

const ListagemDepartamentos = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { acoesJudiciais: resultData, isLoading } = useGetDepartamentos(formData);

  const lists = useMemo(
    () =>
      (resultData || []).map((department) => ({
        ...department,
        idDepartment: getDepartmentId(department),
      })),
    [resultData],
  );

  const refreshDepartments = () => {
    setFormData((current) => ({
      ...current,
      refreshCount: current.refreshCount + 1,
    }));
  };

  useEffect(() => {
    const refreshHandler = () => {
      refreshDepartments();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, isLoading]);

  useEffect(() => {
    if (!isLoading && formData.GenerateExcel) {
      setFormData((current) => {
        if (!current.GenerateExcel) return current;
        const { GenerateExcel, ...nextState } = current;
        return nextState;
      });
    }
  }, [formData.GenerateExcel, isLoading]);

  const handleExportExcel = () => {
    setFormData((current) => ({
      ...current,
      GenerateExcel: true,
      refreshCount: current.refreshCount + 1,
    }));
  };

  const handleOpenDepartment = (department) => {
    navigation("/departamentos/criar", {
      state: {
        indoPara: "NovoDepartamento",
        dadosApi: {
          ...department,
          idDepartment: getDepartmentId(department),
        },
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Codigo",
        accessorKey: "code",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
            onClick={() => handleOpenDepartment(row.original)}
          >
            {row.original.code || "-"}
          </Typography>
        ),
      },
      {
        header: "Departamento",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
            onClick={() => handleOpenDepartment(row.original)}
          >
            {row.original.name || "-"}
          </Typography>
        ),
      },
      {
        header: "Tipo",
        accessorKey: "type",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.type)}
          </Typography>
        ),
      },
      {
        header: "Unidade",
        accessorKey: "unit",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.unit)}
          </Typography>
        ),
      },
      {
        header: "Status",
        accessorFn: (row) => getStatusLabel(row.active),
        id: "active",
        cell: ({ row }) => (
          <Chip
            label={getStatusLabel(row.original.active)}
            color={row.original.active ? "success" : "error"}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
              "& .MuiChip-icon": {
                color: row.original.active ? "success.main" : "error.main",
                marginLeft: "4px",
              },
            }}
            icon={
              <span
                style={{
                  backgroundColor: row.original.active ? "green" : "red",
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
        header: " ",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionCell row={row} refreshData={refreshDepartments} />
        ),
      },
    ],
    [theme],
  );

  return isInitialLoad && isLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Box>
      <ReactTable
        data={lists}
        columns={columns}
        isLoading={isLoading}
        onExportExcel={handleExportExcel}
      />
    </Box>
  );
};

export default ListagemDepartamentos;
