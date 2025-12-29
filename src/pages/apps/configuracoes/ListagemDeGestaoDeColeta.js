import { useState, useMemo } from "react";
import {
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableSortLabel,
  Button,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

// ====================================================================================
// DADOS MOCK PARA GESTÃO DE COLETA
// ====================================================================================
const coletasMock = [
  {
    id: 101,
    ciclo_coleta: "ESG 2024",
    codigo_metrica: "AMB001",
    nome_metrica: "Consumo de Água",
    periodo_referencia_coleta: "MEN202401",
    status_coleta_periodo: "coleta em andamento",
    data_limite_coleta: new Date(2024, 1, 15), // 15 de fevereiro
    responsavel: "Eduardo",
  },
  {
    id: 102,
    ciclo_coleta: "ESG 2024",
    codigo_metrica: "SOC005",
    nome_metrica: "Treinamento de Colaboradores",
    periodo_referencia_coleta: "TRI202401",
    status_coleta_periodo: "coleta não iniciada",
    data_limite_coleta: new Date(2024, 3, 30), // 30 de abril
    responsavel: "Fernando",
  },
  {
    id: 103,
    ciclo_coleta: "ESG 2023",
    codigo_metrica: "GOV002",
    nome_metrica: "Reunião do Conselho",
    periodo_referencia_coleta: "ANU2023",
    status_coleta_periodo: "concluída",
    data_limite_coleta: new Date(2023, 11, 31),
    responsavel: "Fabricio",
  },
  {
    id: 104,
    ciclo_coleta: "ESG 2024",
    codigo_metrica: "AMB002",
    nome_metrica: "Emissão de Carbono",
    periodo_referencia_coleta: "MEN202401",
    status_coleta_periodo: "em revisão",
    data_limite_coleta: new Date(2024, 1, 29), // 29 de fevereiro
    responsavel: "Lídia",
  },
];

// Funções Auxiliares para extrair opções de filtro
const getUniqueOptions = (key) => [
  "Todos",
  ...new Set(coletasMock.map((coleta) => coleta[key])),
];

const statusOptions = getUniqueOptions("status_coleta_periodo");
const cicloOptions = getUniqueOptions("ciclo_coleta");

// ====================================================================================

export function ListagemDeGestaoDeColeta() {
	  const navigate = useNavigate();
	
	  const handleAddColeta = () => {
	    navigate("/detalheColeta/criar"); // Assumindo que esta é a rota para criar uma nova coleta
	  };

  const [filters, setFilters] = useState({
    ciclo: "Todos",
    status: "Todos",
    metrica: "",
  });
  const [orderBy, setOrderBy] = useState("data_limite_coleta");
  const [order, setOrder] = useState("asc"); // 'asc' ou 'desc'

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewDetails = (coletaId) => {
    navigate(`/detalheColeta/criar`, { state: { coletaId } });
  };

  // Lógica de Filtragem e Ordenação
  const filteredAndSortedColetas = useMemo(() => {
    let filteredList = coletasMock.filter((coleta) => {
      // Filtro por Ciclo
      if (filters.ciclo !== "Todos" && coleta.ciclo_coleta !== filters.ciclo) {
        return false;
      }
      // Filtro por Status
      if (
        filters.status !== "Todos" &&
        coleta.status_coleta_periodo !== filters.status
      ) {
        return false;
      }
      // Filtro por Métrica (Nome ou Código)
      if (filters.metrica) {
        const metricaLower = filters.metrica.toLowerCase();
        if (
          !coleta.nome_metrica.toLowerCase().includes(metricaLower) &&
          !coleta.codigo_metrica.toLowerCase().includes(metricaLower)
        ) {
          return false;
        }
      }
      return true;
    });

    // Lógica de Ordenação
    const comparator = (a, b) => {
      if (
        orderBy === "nome_metrica" ||
        orderBy === "periodo_referencia_coleta"
      ) {
        const aValue = a[orderBy].toLowerCase();
        const bValue = b[orderBy].toLowerCase();
        if (bValue < aValue) return order === "asc" ? -1 : 1;
        if (bValue > aValue) return order === "asc" ? 1 : -1;
        return 0;
      } else if (orderBy === "data_limite_coleta") {
        const aTime = a[orderBy].getTime();
        const bTime = b[orderBy].getTime();
        if (bTime < aTime) return order === "asc" ? -1 : 1;
        if (bTime > aTime) return order === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    };

    filteredList.sort(comparator);
    return filteredList;
  }, [filters, orderBy, order]);

  const getStatusColor = (status) => {
    switch (status) {
      case "coleta em andamento":
        return "warning.dark";
      case "concluída":
        return "success.dark";
      case "em revisão":
        return "info.dark";
      case "coleta não iniciada":
        return "error.dark";
      default:
        return "text.primary";
    }
  };

  const headCells = [
    { id: "nome_metrica", label: "Métrica" },
    { id: "periodo_referencia_coleta", label: "Período" },
    { id: "status_coleta_periodo", label: "Status" },
    { id: "data_limite_coleta", label: "Prazo" },
    { id: "responsavel", label: "Responsável" },
    { id: "acao", label: "Ação", disableSort: true },
  ];

	  return (
	    <Grid item xs={12} sx={{ mt: 3 }}>
	      <Stack
	        direction="row"
	        justifyContent="space-between"
	        alignItems="center"
	        mb={2}
	      >
	        <Typography variant="h4" component="h1">
	          Gestão de Coletas
	        </Typography>
	        <Button
	          variant="contained"
	          color="primary"
	          onClick={handleAddColeta}
	        >
	          Adicionar Coleta
	        </Button>
	      </Stack>
	      {/* Seção de Filtros */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="ciclo-label">Ciclo de Coleta</InputLabel>
              <Select
                labelId="ciclo-label"
                id="ciclo-select"
                name="ciclo"
                value={filters.ciclo}
                label="Ciclo de Coleta"
                onChange={handleFilterChange}
              >
                {cicloOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar Métrica (Nome ou Código)"
              name="metrica"
              value={filters.metrica}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de Coletas */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de gestão de coleta">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.disableSort ? (
                    <Typography variant="subtitle1" fontWeight="bold">
                      {headCell.label}
                    </Typography>
                  ) : (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {headCell.label}
                      </Typography>
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedColetas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhuma coleta encontrada com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedColetas.map((coleta) => (
                <TableRow
                  key={coleta.id}
                  hover
                  onClick={() => handleViewDetails(coleta.id)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell component="th" scope="row">
                    <Stack>
                      <Typography variant="body1" fontWeight="bold">
                        {coleta.nome_metrica}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {coleta.codigo_metrica} - {coleta.ciclo_coleta}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{coleta.periodo_referencia_coleta}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: "capitalize",
                        color: getStatusColor(coleta.status_coleta_periodo),
                        fontWeight: "bold",
                      }}
                    >
                      {coleta.status_coleta_periodo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(coleta.data_limite_coleta, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Stack>
                      <Typography variant="body1" fontWeight="bold">
                        {coleta.responsavel}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="end"
                      aria-label="detalhes"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que o clique na linha seja acionado
                        handleViewDetails(coleta.id);
                      }}
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}

export default ListagemDeGestaoDeColeta;
