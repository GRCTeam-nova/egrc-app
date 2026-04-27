/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from 'config';
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  IconButton,
  Popover,
  CircularProgress
} from "@mui/material";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useToken } from "../../../api/TokenContext";
import MainCard from "../../../components/MainCard";
import ScrollX from "../../../components/ScrollX";
import { PlusOutlined } from "@ant-design/icons";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { TablePagination } from "../../../components/third-party/react-table";

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
        sdgCode: row.original.sdgCode,
        sdgName: row.original.sdgName,
        sdgDescription: row.original.sdgDescription,
        themeIds: row.original.themeIds || [],
        active: !row.original.active
      };
      await axios.put(`${API_URL}SDG`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar(`Status alterado com sucesso!`, { variant: "success" });
      refreshData();
    } catch (error) {
      enqueueSnackbar(`Erro ao alterar status: ${error.message}`, { variant: "error" });
    }
    handleClose();
  };


  return (
    <>
      <IconButton onClick={handleClick} size="small"><MoreVertIcon /></IconButton>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Stack sx={{ p: 1 }}>
          <Button onClick={() => {
            navigation(`/ods/editar/${row.original.sdgCode || row.original.id}`, { 
              state: { 
                odsDados: row.original,
                dadosApi: { ...row.original, nome: row.original.sdgName } 
              } 
            });
            handleClose();
          }} sx={{ textTransform: 'none', color: 'text.secondary' }}>Editar</Button>
          <Button onClick={toggleStatus} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {row.original.active ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

const ListagemODS = () => {
  const navigation = useNavigate();
  const { token } = useToken();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}SDG`, {
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
      header: "Código ODS",
      accessorKey: "sdgCode",
    },
    {
      header: "Nome do ODS",
      accessorKey: "sdgName",
      cell: ({ row }) => (
        <Typography
          onClick={() => navigation(`/ods/editar/${row.original.sdgCode || row.original.id}`, { 
            state: { 
              odsDados: row.original,
              dadosApi: { ...row.original, nome: row.original.sdgName } 
            } 
          })}
          sx={{ cursor: "pointer", color: "#1C5297", fontWeight: 500 }}
        >
          {row.original.sdgName}
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ color: '#1C5297', fontWeight: 600 }}>ODS</Typography>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigation("/ods/criar")}
          sx={{ borderRadius: "20px" }}
        >
          Novo
        </Button>
      </Stack>

      <MainCard content={false}>
        <ScrollX>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} sx={{ backgroundColor: "#F4F4F4" }}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
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
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box p={2}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                totalItems: data.length,
                recordType: "ODS",
              }}
            />
          </Box>
        </ScrollX>
      </MainCard>
    </Box>
  );
};

export default ListagemODS;
