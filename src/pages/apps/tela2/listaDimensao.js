/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import { enqueueSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainCard from "../../../components/MainCard";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
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
  CircularProgress,
  Drawer,
  Autocomplete,
  TextField,
  IconButton
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
import CloseIcon from '@mui/icons-material/Close';
import Mark from "mark.js";
import {
  faTrash,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  TablePagination,
} from "../../../components/third-party/react-table";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { PlusOutlined } from "@ant-design/icons";

export const fuzzyFilter = (row, columnId, value) => {
  let cellValue = row.getValue(columnId);
  if (cellValue === undefined || value === undefined) return false;
  const normalizeText = (text) => text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);
  return cellValue.includes(valueStr);
};

function ReactTable({ data, columns, processosTotal, isLoading, refreshData }) {
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "dimensionName", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [statusOptions] = useState([
    { label: "Ativo", value: true },
    { label: "Inativo", value: false },
  ]);
  const [draftFilters, setDraftFilters] = useState({ status: [] });

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const applyFilters = () => {
    const newFilters = [];
    if (draftFilters.status.length > 0) {
      newFilters.push({ type: "Status", values: draftFilters.status.map((s) => s.value) });
    }
    setSelectedFilters(newFilters);
    toggleDrawer();
  };

  const removeFilter = (index) => {
    setSelectedFilters((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveAllFilters = () => {
    setSelectedFilters([]);
    setGlobalFilter("");
    setDraftFilters({ status: [] });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return selectedFilters.every((filter) => {
        if (filter.type === "Status") return filter.values.includes(item.active);
        return true;
      });
    });
  }, [data, selectedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
  });

  useEffect(() => {
    const markInstance = new Mark(tableRef.current);
    if (globalFilter) {
      markInstance.unmark({ done: () => { markInstance.mark(globalFilter); } });
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
          p: 2,
          mb: 3,
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
          <Button
            onClick={toggleDrawer}
            startIcon={<FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />}
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

        <Button
          variant="contained"
          onClick={() => navigation(`/dimensao/criar`)}
          startIcon={<PlusOutlined />}
          style={{ borderRadius: "20px", height: "32px" }}
        >
          Novo
        </Button>
      </Stack>

      <Box mb={2}>
        {selectedFilters.map((filter, index) => (
          <Chip
            key={index}
            label={`${filter.type}: ${filter.values.map(v => v ? 'Ativo' : 'Inativo').join(', ')}`}
            onDelete={() => removeFilter(index)}
            sx={{ margin: 0.5, backgroundColor: "#1C52971A" }}
          />
        ))}
        {selectedFilters.length > 0 && (
          <Button onClick={handleRemoveAllFilters} sx={{ fontSize: '12px' }}>Limpar Filtros</Button>
        )}
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer} PaperProps={{ sx: { width: 400 } }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filtros</Typography>
            <IconButton onClick={toggleDrawer}><CloseIcon /></IconButton>
          </Stack>
          <Autocomplete
            multiple
            options={statusOptions}
            getOptionLabel={(option) => option.label}
            value={draftFilters.status}
            onChange={(e, v) => setDraftFilters({ ...draftFilters, status: v })}
            renderInput={(params) => <TextField {...params} label="Status" />}
          />
          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={toggleDrawer}>Cancelar</Button>
            <Button variant="contained" onClick={applyFilters}>Aplicar</Button>
          </Stack>
        </Box>
      </Drawer>

      <MainCard content={false}>
        <ScrollX>
          <div ref={tableRef}>
            <TableContainer>
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} sx={{ backgroundColor: "#F4F4F4" }}>
                      {headerGroup.headers.map((header) => (
                        <TableCell key={header.id} sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={columns.length} align="center"><CircularProgress /></TableCell></TableRow>
                  ) : filteredData.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} sx={{ fontSize: "13px" }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={columns.length}><EmptyTable msg="Nenhum dado encontrado" /></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                setPageSize={table.setPageSize}
                setPageIndex={table.setPageIndex}
                getState={table.getState}
                getPageCount={table.getPageCount}
                totalItems={processosTotal}
                recordType="Dimensões"
              />
            </Box>
          </div>
        </ScrollX>
      </MainCard>
    </>
  );
}

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const toggleStatus = async () => {
    try {
      const payload = {
        id: row.original.id,
        dimensionCode: row.original.dimensionCode,
        dimensionName: row.original.dimensionName,
        active: !row.original.active
      };
      await axios.put(`https://api.egrc.homologacao.com.br/api/v1/Dimension`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar(`Status alterado com sucesso!`, { variant: "success" });
      refreshData();
    } catch (error) {
      enqueueSnackbar(`Erro ao alterar status: ${error.message}`, { variant: "error" });
    }
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://api.egrc.homologacao.com.br/api/v1/Dimension/${row.original.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar(`Excluído com sucesso!`, { variant: "success" });
      refreshData();
    } catch (error) {
      enqueueSnackbar(`Erro ao excluir: ${error.message}`, { variant: "error" });
    }
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small"><MoreVertIcon /></IconButton>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Stack sx={{ p: 1 }}>
          <Button onClick={() => {
            navigation(`/dimensao/editar/${row.original.dimensionCode || row.original.id}`, { state: { dimensaoDados: row.original } });
            handleClose();
          }} sx={{ textTransform: 'none', color: 'text.secondary' }}>Editar</Button>
          <Button startIcon={<FontAwesomeIcon icon={faTrash} />} onClick={() => {
            if (window.confirm("Deseja realmente excluir?")) handleDelete();
          }} color="error" sx={{ textTransform: 'none' }}>Excluir</Button>
          <Button onClick={toggleStatus} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {row.original.active ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

const ListagemDimensao = () => {
  const navigation = useNavigate();
  const { token } = useToken();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get("https://api.egrc.homologacao.com.br/api/v1/Dimension", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      enqueueSnackbar("Erro ao carregar dados", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const columns = useMemo(() => [
    {
      header: "Código",
      accessorKey: "dimensionCode",
    },
    {
      header: "Nome da Dimensão",
      accessorKey: "dimensionName",
      cell: ({ row }) => (
        <Typography
          onClick={() => navigation(`/dimensao/editar/${row.original.dimensionCode || row.original.id}`, { state: { dimensaoDados: row.original } })}
          sx={{ cursor: "pointer", color: "#1C5297", fontWeight: 500 }}
        >
          {row.original.dimensionName}
        </Typography>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: ({ row }) => (
        <Chip 
          label={row.original.active ? "Ativo" : "Inativo"} 
          color={row.original.active ? "success" : "default"} 
          variant="outlined" 
          size="small"
        />
      ),
    },
    {
      header: "Ações",
      cell: ({ row }) => <ActionCell row={row} refreshData={fetchData} />,
    },
  ], []);

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2, color: '#1C5297', fontWeight: 600 }}>Dimensões</Typography>
      <ReactTable data={data} columns={columns} processosTotal={data.length} isLoading={isLoading} refreshData={fetchData} />
    </Box>
  );
};

export default ListagemDimensao;
