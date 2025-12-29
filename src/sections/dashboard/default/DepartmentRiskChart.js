import React, { useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  useTheme, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Ícone de Alerta
import GppBadIcon from '@mui/icons-material/GppBad'; // Ícone de Risco
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ApexCharts from 'apexcharts';
import { useDepartmentRisks } from './useDepartmentRisks';

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/departments/reports/risks";

const DepartmentRiskChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  // Estado do Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Hook de Dados
  const { data, isLoading, error } = useDepartmentRisks(API_ENDPOINT);

  // Processamento dos dados
  const { chartData, chartHeight, stats, activeDepts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { hidden: 0 }, activeDepts: [] };
    }

    // 1. Filtra apenas departamentos com riscos (> 0) e Ordena
    const activeDeptsList = data
      .filter(d => d.risks && d.risks.length > 0)
      .sort((a, b) => b.risks.length - a.risks.length);

    const totalDepts = data.length;
    const hiddenDepts = totalDepts - activeDeptsList.length;

    // 2. Altura dinâmica para evitar esmagamento das barras
    const dynamicHeight = Math.max(300, activeDeptsList.length * 55);

    return {
      activeDepts: activeDeptsList,
      chartData: {
        categories: activeDeptsList.map(d => d.name),
        series: [{
          name: 'Quantidade de Riscos',
          data: activeDeptsList.map(d => d.risks.length)
        }]
      },
      chartHeight: dynamicHeight,
      stats: { hidden: hiddenDepts }
    };
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.categories.length === 0) return;

    const options = {
      series: chartData.series,
      chart: {
        type: 'bar',
        height: chartHeight,
        fontFamily: 'Roboto, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        // Interatividade: Clique na barra
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const index = config.dataPointIndex;
            const dept = activeDepts[index];
            if (dept) {
              setSelectedDept(dept);
              setOpenModal(true);
            }
          }
        }
      },
      // REMOVE A LEGENDA ABAIXO DO GRÁFICO
      legend: { 
        show: false 
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          horizontal: true,
          barHeight: '60%',
          distributed: true, // Permite gradiente por barra se necessário
        }
      },
      // Visual de "Alerta" (Laranja -> Vermelho)
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: [theme.palette.error.main], // Finaliza em Vermelho
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: { colors: ['#fff'], fontSize: '12px', fontWeight: 'bold' },
        formatter: (val) => val,
        offsetX: 0,
        dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.5 }
      },
      // Cor base inicial (Laranja)
      colors: [theme.palette.warning.main],
      xaxis: {
        categories: chartData.categories,
        labels: { style: { fontSize: '12px', colors: '#64748b' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          maxWidth: 180,
          style: { fontSize: '13px', fontWeight: 500, colors: '#334155', cursor: 'pointer' }
        }
      },
      grid: {
        show: true,
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        padding: { top: 0, right: 20, bottom: 0, left: 10 }
      },
      tooltip: {
        theme: 'light',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const value = series[seriesIndex][dataPointIndex];
          const category = w.globals.labels[dataPointIndex];
          // Cor vermelha no texto para ênfase
          return `
            <div style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${category}</div>
              <div style="font-size: 14px; font-weight: 700; color: #d32f2f; margin-bottom: 4px;">
                ${value} <span style="font-weight:400; font-size:12px; color: #333;">Riscos</span>
              </div>
              <div style="font-size: 10px; color: #d32f2f; font-style: italic;">
                Clique para detalhar
              </div>
            </div>
          `;
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    // Cursor pointer CSS
    const style = document.createElement('style');
    style.innerHTML = `.apexcharts-bar-area { cursor: pointer; }`;
    chartRef.current.appendChild(style);

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [chartData, chartHeight, theme, activeDepts]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedDept(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} color="error" /><Typography variant="body2" sx={{ ml: 2 }}>Mapeando riscos...</Typography></Box>;
  if (error) return <Alert severity="error">Erro: {error}</Alert>;

  const isEmpty = !chartData || chartData.categories.length === 0;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column',
        border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: '#fff'
      }}
    >
      {/* Header Diferenciado (Tons de Vermelho Claro) */}
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to bottom, #fff5f5, #fff)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ 
            p: 1, borderRadius: 2, 
            bgcolor: 'error.50', 
            color: 'error.main', 
            display: 'flex' 
          }}>
            <GppBadIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
              Riscos Corporativos
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Volume de exposição por área
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhum risco mapeado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {stats.hidden > 0 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary">
            <b>{stats.hidden}</b> departamentos sem riscos identificados.
          </Typography>
        </Box>
      )}

      {/* MODAL DE DETALHES (Com disableRestoreFocus) */}
      <Dialog 
        open={openModal} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus={true}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedDept && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {selectedDept.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lista de Riscos ({selectedDept.risks.length})
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedDept.risks.map((risk, idx) => (
                  <React.Fragment key={risk.idRisk || idx}>
                    <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                      <Box sx={{ mr: 2, mt: 0.5, color: 'warning.main' }}>
                         <WarningAmberIcon />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                            {risk.code}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {risk.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {idx < selectedDept.risks.length - 1 && <Divider component="li" variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default DepartmentRiskChart;