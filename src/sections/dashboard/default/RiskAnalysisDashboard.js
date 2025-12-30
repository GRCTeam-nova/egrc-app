import { API_URL} from 'config';
import { useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Paper, useTheme, 
  Grid, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination} from '@mui/material';

// Ícones
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import ApexCharts from 'apexcharts';

// --- CONFIGURAÇÕES ---
const API_ENDPOINT = `${process.env.REACT_APP_API_URL}risks/reports/all`; // Endpoint Sugerido

// Função auxiliar de status
const getStatusConfig = (active) => {
  return active 
    ? { label: 'Ativo', color: 'success', icon: <CheckCircleIcon fontSize="small" /> }
    : { label: 'Inativo', color: 'error', icon: <CancelIcon fontSize="small" /> };
};

// --- HOOK DE DADOS ---
const useRiskData = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando o JSON fornecido no prompt
    const mockData = [
       { "idRisk": "9c44d18f", "code": "11", "name": "11", "active": true, "category": "categoria 001", "incidents": 0, "controls": 0, "assessments": [ { "cycle": "Ciclo 17/09", "quizes": [{ "name": "Q1" }] }, { "cycle": "Tester", "quizes": [{ "name": "Q2" }] } ] },
       { "idRisk": "5c5d1e49", "code": "12", "name": "12", "active": true, "category": "Risco de Meio Ambiente", "incidents": 0, "controls": 0, "assessments": [] },
       { "idRisk": "2f0dc5d6", "code": "222", "name": "22", "active": true, "category": "Categoria 2307", "incidents": 0, "controls": 0, "assessments": [ { "cycle": "Teste terça", "quizes": [{},{}] }, { "cycle": "Ciclo 17/09", "quizes": [{}] } ] },
       { "idRisk": "f00d7ca4", "code": "R001d", "name": "as", "active": true, "category": "categoria 001", "incidents": 0, "controls": 0, "assessments": [ { "cycle": "Tester", "quizes": [{},{}] }, { "cycle": "Teste terça", "quizes": [] } ] },
       { "idRisk": "22de2c90", "code": "R 1709", "name": "Risco 17/09", "active": true, "category": "categoria 001", "incidents": 1, "controls": 2, "assessments": [] },
       { "idRisk": "47276909", "code": "002", "name": "TT", "active": true, "category": "categoria 001", "incidents": 17, "controls": 18, "assessments": [ { "cycle": "Tester", "quizes": [{},{}] } ] },
       // ... adicionei uma amostra representativa dos seus dados para a lógica funcionar
       { "idRisk": "d3c09122", "code": "R.1908", "name": "Risco inatividade", "active": false, "category": "Operacional", "incidents": 1, "controls": 1, "assessments": [{ "cycle": "Ciclo 17/09", "quizes": [] }] } 
    ];

    // Simula delay de rede
    setTimeout(() => {
      // Na implementação real, usar fetch(url)...
      setData(mockData); 
      setIsLoading(false);
    }, 800);
  }, [url]);

  return { data, isLoading };
};

// --- COMPONENTE TABELA DE RISCOS ---
const RiskTable = ({ rows }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Risco</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Incidentes</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Controles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
               const status = getStatusConfig(row.active);
               return (
                <TableRow key={row.idRisk} hover>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={status.label} 
                      color={status.color} 
                      size="small" 
                      variant="outlined" 
                      icon={status.icon}
                    />
                  </TableCell>
                  <TableCell align="center">{row.incidents}</TableCell>
                  <TableCell align="center">{row.controls}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas:"
      />
    </Box>
  );
};

// --- COMPONENTE PRINCIPAL ---
const RiskAnalysisDashboard = () => {
  const theme = useTheme();
  
  // Referências para os gráficos
  const riskChartRef = useRef(null);
  const quizChartRef = useRef(null);
  const riskChartInstance = useRef(null);
  const quizChartInstance = useRef(null);

  const { data, isLoading, error } = useRiskData(API_ENDPOINT);

  // --- PROCESSAMENTO DOS DADOS (Memoized) ---
  const processedData = useMemo(() => {
    if (!data) return { cyclesData: [], quizData: [], tableData: [] };

    // 1. Dados para Tabela (Simples clone)
    const tableData = [...data];

    // Estruturas auxiliares para agregação
    const cycleMap = {}; // { 'NomeCiclo': { active: 0, inactive: 0, quizes: 0 } }

    data.forEach(risk => {
      // Se o risco não tem assessments, ele não entra nos gráficos de ciclo
      if (risk.assessments && risk.assessments.length > 0) {
        risk.assessments.forEach(assessment => {
          const cycleName = assessment.cycle || "Sem Ciclo";
          
          if (!cycleMap[cycleName]) {
            cycleMap[cycleName] = { name: cycleName, activeRisks: 0, inactiveRisks: 0, quizCount: 0 };
          }

          // Contagem de Riscos por Status x Ciclo
          if (risk.active) {
            cycleMap[cycleName].activeRisks += 1;
          } else {
            cycleMap[cycleName].inactiveRisks += 1;
          }

          // Contagem de Questionários x Ciclo
          if (assessment.quizes) {
            cycleMap[cycleName].quizCount += assessment.quizes.length;
          }
        });
      }
    });

    const aggregated = Object.values(cycleMap);
    
    // Preparar arrays para os gráficos
    const categories = aggregated.map(i => i.name);
    
    // Gráfico 1: Riscos
    const seriesRiskActive = aggregated.map(i => i.activeRisks);
    const seriesRiskInactive = aggregated.map(i => i.inactiveRisks);

    // Gráfico 2: Questionários
    const seriesQuiz = aggregated.map(i => i.quizCount);

    return {
      tableData,
      chartCategories: categories,
      riskSeries: [
        { name: 'Riscos Ativos', data: seriesRiskActive },
        { name: 'Riscos Inativos', data: seriesRiskInactive }
      ],
      quizSeries: [
        { name: 'Questionários', data: seriesQuiz }
      ]
    };
  }, [data]);

  // --- RENDERIZAÇÃO DOS GRÁFICOS ---
  useEffect(() => {
    if (isLoading || !processedData.chartCategories.length) return;

    // 1. Configuração do Gráfico: Riscos x Status x Ciclo
    const riskOptions = {
      series: processedData.riskSeries,
      chart: {
        type: 'bar',
        height: 300,
        stacked: true,
        toolbar: { show: false },
        fontFamily: 'Roboto, sans-serif'
      },
      colors: [theme.palette.success.main, theme.palette.error.main],
      plotOptions: {
        bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: processedData.chartCategories,
        labels: { style: { fontSize: '12px' } }
      },
      legend: { position: 'top' },
      grid: { borderColor: '#f1f1f1' },
      tooltip: { theme: 'light' }
    };

    // 2. Configuração do Gráfico: Questionários x Ciclo
    const quizOptions = {
      series: processedData.quizSeries,
      chart: {
        type: 'area', // Area chart para diferenciar visualmente
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Roboto, sans-serif'
      },
      colors: [theme.palette.primary.main],
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100] }
      },
      dataLabels: { enabled: true },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: processedData.chartCategories,
        labels: { style: { fontSize: '12px' } }
      },
      grid: { borderColor: '#f1f1f1' },
      tooltip: { theme: 'light' }
    };

    // Renderizar Chart 1
    if (riskChartRef.current) {
      if (riskChartInstance.current) riskChartInstance.current.destroy();
      riskChartInstance.current = new ApexCharts(riskChartRef.current, riskOptions);
      riskChartInstance.current.render();
    }

    // Renderizar Chart 2
    if (quizChartRef.current) {
      if (quizChartInstance.current) quizChartInstance.current.destroy();
      quizChartInstance.current = new ApexCharts(quizChartRef.current, quizOptions);
      quizChartInstance.current.render();
    }

    return () => {
      if (riskChartInstance.current) riskChartInstance.current.destroy();
      if (quizChartInstance.current) quizChartInstance.current.destroy();
    };
  }, [processedData, isLoading, theme]);


  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      
      {/* --- SEÇÃO 1: GRÁFICOS --- */}
      <Grid container spacing={3}>
        
        {/* Gráfico de Riscos por Ciclo */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon color="action" />
              <Typography variant="subtitle1" fontWeight="bold">Riscos por Ciclo e Status</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
               {processedData.chartCategories.length > 0 ? (
                 <div ref={riskChartRef} />
               ) : (
                 <Typography variant="body2" sx={{p:4, textAlign:'center'}}>Sem dados de ciclo.</Typography>
               )}
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Questionários por Ciclo */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">Volume de Questionários por Ciclo</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {processedData.chartCategories.length > 0 ? (
                 <div ref={quizChartRef} />
               ) : (
                 <Typography variant="body2" sx={{p:4, textAlign:'center'}}>Sem dados de questionários.</Typography>
               )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* --- SEÇÃO 2: TABELA GERAL --- */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, pb: 2, background: 'linear-gradient(to right, #fff, #f9fafb)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main', display: 'flex' }}>
              <WarningAmberIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Matriz de Riscos e Criticidades</Typography>
              <Typography variant="caption" color="text.secondary">
                Visão detalhada de incidentes e controles por risco
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ p: 0 }}>
          <RiskTable rows={processedData.tableData} />
        </Box>
      </Paper>

    </Box>
  );
};

export default RiskAnalysisDashboard;