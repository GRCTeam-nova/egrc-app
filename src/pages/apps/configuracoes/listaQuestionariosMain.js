/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
// import { enqueueSnackbar } from "notistack";
import { useGetQuestionarios } from "../../../api/questionariosMain"; // Ajuste o caminho se necessário
// import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainCard from "../../../components/MainCard";

import { useTheme } from "@mui/material/styles";

import {
  Box,
  Grid,
  Button,
  FormControl,
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
import { faFilter } from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
  SelectColumnVisibility,
} from "../../../components/third-party/react-table";

import { PlusOutlined } from "@ant-design/icons";

// Funções auxiliares
const getCicloFromName = (name) => {
  if (!name) return "";
  const parts = name.split(" - ");
  return parts[0] || name;
};

const getRiscoFromName = (name) => {
  if (!name) return "-";
  const parts = name.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : "-";
};

// Função de filtro global
export const fuzzyFilter = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);
  if (cellValue === undefined || cellValue === null || value === undefined || value === "") {
    return false;
  }
  const normalize = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };
  const cellString = normalize(cellValue);
  const searchTerms = normalize(value).split(" ").filter((term) => term.trim() !== "");
  return searchTerms.every((term) => cellString.includes(term));
};

const defaultVisibility = {
  ciclo: true,
  risco: true,
  code: true,
  respondent: true,
  actions: true,
};

function ReactTable({
  data,
  columns,
  totalRows,
  isLoading,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const STORAGE_KEY = "egrc_table_visibility_questionarios";

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

  const recordType = "Questionários";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "code", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const navigation = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // -- ESTADOS PARA OPÇÕES DOS FILTROS --
  const [cicloOptions, setCicloOptions] = useState([]);
  const [riscoOptions, setRiscoOptions] = useState([]);
  const [respondentOptions, setRespondentOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);

  // -- FILTROS APLICADOS --
  const [selectedFilters, setSelectedFilters] = useState([]);

  // -- FILTROS RASCUNHO (NO DRAWER) --
  const [draftFilters, setDraftFilters] = useState({
    ciclo: [],
    risco: [],
    respondent: [],
    code: []
  });

  // Estado para controlar se o filtro inicial já foi aplicado
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);

  // 1. Popula as opções dos filtros dinamicamente
  // 2. Aplica o filtro inicial do usuário logado (apenas uma vez)
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Extração das opções
    const uniqueCiclos = new Set();
    const uniqueRiscos = new Set();
    const uniqueRespondents = new Set();
    const uniqueCodes = new Set();

    data.forEach(item => {
        const c = getCicloFromName(item.name);
        if (c) uniqueCiclos.add(c);

        const r = getRiscoFromName(item.name);
        if (r && r !== "-") uniqueRiscos.add(r);

        if (item.respondent) uniqueRespondents.add(item.respondent);
        if (item.code) uniqueCodes.add(item.code);
    });

    setCicloOptions([...uniqueCiclos].sort());
    setRiscoOptions([...uniqueRiscos].sort());
    setRespondentOptions([...uniqueRespondents].sort());
    setCodeOptions([...uniqueCodes].sort());

    // --- LÓGICA DO FILTRO INICIAL (DEFAULT) ---
    if (!initialFilterApplied) {
        const currentUserId = localStorage.getItem("id_user");
        
        if (currentUserId) {
            // Tentamos encontrar o NOME do usuário na lista baseado no ID
            // pois o filtro visual funciona por NOME (respondent), não por ID.
            const userRow = data.find(d => d.idRespondent === currentUserId);
            
            if (userRow && userRow.respondent) {
                const userName = userRow.respondent;
                
                // Define o filtro inicial
                setSelectedFilters([
                    { type: "Respondente", values: [userName] }
                ]);
                
                // Sincroniza o rascunho do drawer
                setDraftFilters(prev => ({ ...prev, respondent: [userName] }));
            }
        }
        
        // Marca como aplicado para não sobrescrever se o usuário limpar depois
        setInitialFilterApplied(true);
    }

  }, [data, initialFilterApplied]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const applyFilters = () => {
    const newFilters = [];
    
    if (draftFilters.ciclo.length > 0) {
      newFilters.push({ type: "Ciclo", values: draftFilters.ciclo });
    }
    if (draftFilters.risco.length > 0) {
      newFilters.push({ type: "Risco", values: draftFilters.risco });
    }
    if (draftFilters.respondent.length > 0) {
      newFilters.push({ type: "Respondente", values: draftFilters.respondent });
    }
    if (draftFilters.code.length > 0) {
      newFilters.push({ type: "Código", values: draftFilters.code });
    }

    setSelectedFilters(newFilters);
    toggleDrawer();
  };

  const removeFilter = (index) => {
    setSelectedFilters((prev) => {
      const filterToRemove = prev[index];
      setDraftFilters((prevDraft) => {
        const updatedDraft = { ...prevDraft };
        
        const typeToKey = {
            "Ciclo": "ciclo",
            "Risco": "risco",
            "Respondente": "respondent",
            "Código": "code"
        };

        const key = typeToKey[filterToRemove.type];
        if (key) {
             updatedDraft[key] = updatedDraft[key].filter(
                (value) => !filterToRemove.values.includes(value)
            );
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
      ciclo: [],
      risco: [],
      respondent: [],
      code: []
    });
  };

  // --- LÓGICA DE FILTRAGEM ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      
      // NOTA: Removemos a trava de segurança rígida do ID.
      // Agora dependemos apenas dos selectedFilters visuais.

      return selectedFilters.every((filter) => {
        const filterType = filter.type;
        const filterValues = filter.values;

        if (filterType === "Ciclo") {
            const itemCiclo = getCicloFromName(item.name);
            return filterValues.includes(itemCiclo);
        }

        if (filterType === "Risco") {
            const itemRisco = getRiscoFromName(item.name);
            return filterValues.includes(itemRisco);
        }

        if (filterType === "Respondente") {
            return filterValues.includes(item.respondent);
        }

        if (filterType === "Código") {
            return filterValues.includes(item.code);
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
          padding: 2,
          marginBottom: 3,
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
            placeholder={`Pesquise...`}
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
            <Box sx={{ display: "flex", alignItems: "center", ml: 0.75 }}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigation(`/questionarios/criar`);
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
                <Typography sx={{ color: "#1C5297", fontWeight: 600, marginRight: "4px" }}>
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

      {/* DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ width: 380, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box component="h2" sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}>
              Filtros
            </Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            
             {/* Filtro Ciclo */}
             <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Ciclo</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={cicloOptions}
                  value={draftFilters.ciclo}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, ciclo: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Filtro Risco */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Risco</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={riscoOptions}
                  value={draftFilters.risco}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, risco: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Filtro Respondente */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Respondente</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={respondentOptions}
                  value={draftFilters.respondent}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, respondent: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Filtro Código */}
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>Código</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={codeOptions}
                  value={draftFilters.code}
                  onChange={(event, value) =>
                    setDraftFilters((prev) => ({ ...prev, code: value }))
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

          </Grid>

          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={toggleDrawer}>Cancelar</Button>
            <Button variant="contained" onClick={applyFilters}>Aplicar</Button>
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
                        }}
                      >
                        {headerGroup.headers.map((header) => (
                          <TableCell
                            key={header.id}
                            sx={{
                              fontSize: "11px",
                              color: isDarkMode ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.6)",
                              cursor: header.column.getCanSort() ? "pointer" : "default",
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} />}
                            </Stack>
                          </TableCell>
                        ))}
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
                    ) : data && data.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} sx={{ backgroundColor: isDarkMode ? "#14141" : "#fff" }}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} sx={{ fontSize: "13px" }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <EmptyTable msg="Você não possui questionários pendentes" />
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
                    totalItems: totalRows,
                    recordType: recordType,
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
  totalRows: PropTypes.number,
  isLoading: PropTypes.bool,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Obtem o usuário logado para verificar permissão
  const currentUserId = localStorage.getItem("id_user");
  const isOwner = row.original.idRespondent === currentUserId;

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Se não for o dono, não mostra nada (ou pode mostrar um ícone desativado/cadeado se preferir)
  if (!isOwner) {
    return <Box sx={{ width: 40, height: 40 }} />;
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <IconButton aria-describedby={id} color="primary" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Stack>
          <Button
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/questionarios/editar`, { // Ajuste rota
                state: { dadosApi },
              });
              handleClose();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Editar
          </Button>
        </Stack>
      </Popover>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

const ListagemQuestionarios = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  
  const [refreshCount, setRefreshCount] = useState(0);

  const { questionarios: resultData, isLoading } = useGetQuestionarios({ refreshCount });

  const lists = resultData || [];
  const totalRows = lists.length; 

  const refreshData = () => {
    setRefreshCount((prev) => prev + 1);
  };

  const columns = useMemo(
    () => [
      // 1. Coluna Ciclo
      {
        id: "ciclo",
        header: "Ciclo",
        accessorFn: (row) => getCicloFromName(row.name),
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: theme.palette.primary.main }}>
            {getValue()}
          </Typography>
        ),
      },
      // 2. Coluna Risco
      {
        id: "risco",
        header: "Risco",
        accessorFn: (row) => getRiscoFromName(row.name),
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "13px" }}>{getValue()}</Typography>
        ),
      },
      // 3. Código
      {
        header: "Código",
        accessorKey: "code",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>{row.original.code}</Typography>
        ),
      },
      // 4. Respondente
      {
        header: "Respondente",
        accessorKey: "respondent",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.respondent || "—"}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: " ",
        cell: ({ row }) => <ActionCell row={row} refreshData={refreshData} />,
      },
    ],
    [theme, navigation]
  );

  return (
    <Box>
        <ReactTable
            data={lists}
            columns={columns}
            totalRows={totalRows}
            isLoading={isLoading}
        />
    </Box>
  );
};

export default ListagemQuestionarios;