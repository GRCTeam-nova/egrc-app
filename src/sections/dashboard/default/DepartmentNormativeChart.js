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
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ApexCharts from 'apexcharts';
import { useDepartmentNormatives } from './useDepartmentNormatives';

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/departments/reports/normatives";

const DepartmentNormativeChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const { data, isLoading, error } = useDepartmentNormatives(API_ENDPOINT);

  const { chartData, chartHeight, stats, activeDepts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { hidden: 0 }, activeDepts: [] };
    }

    const activeDeptsList = data
      .filter(d => d.normatives && d.normatives.length > 0)
      .sort((a, b) => b.normatives.length - a.normatives.length);

    const totalDepts = data.length;
    const hiddenDepts = totalDepts - activeDeptsList.length;
    
    const dynamicHeight = 350;

    return {
      activeDepts: activeDeptsList,
      chartData: {
        categories: activeDeptsList.map(d => d.name),
        series: [{
          name: 'Normativos',
          data: activeDeptsList.map(d => d.normatives.length)
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
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'end',
          columnWidth: '50%',
          distributed: true,
          dataLabels: {
            position: 'top', // O número fica no topo da barra
          },
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -25, // Empurra para cima (fora da barra)
        style: {
          fontSize: '14px',
          colors: ['#333'], // Cor escura sólida para garantir contraste no fundo branco
          fontWeight: 700,
        },
        // REMOVIDO: background: { ... } que estava causando o problema visual
      },
      colors: ['#009688'], 
      fill: {
        opacity: 1
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          rotate: -45,
          style: { fontSize: '12px', colors: '#64748b' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px', colors: '#64748b' },
          formatter: (val) => val.toFixed(0)
        },
        forceNiceScale: true,
        min: 0
      },
      grid: {
        show: true,
        borderColor: '#f1f5f9',
        strokeDashArray: 3,
        // Padding no topo garantindo que o número não seja cortado
        padding: { 
          top: 30, 
          right: 20, 
          left: 10, 
          bottom: 10 
        }
      },
      legend: { show: false },
      tooltip: {
        theme: 'light',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const value = series[seriesIndex][dataPointIndex];
          const category = w.globals.labels[dataPointIndex];
          return `
            <div style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${category}</div>
              <div style="font-size: 14px; font-weight: 700; color: #009688; margin-bottom: 4px;">
                ${value} <span style="font-weight:400; font-size:12px; color: #333;">Normativos</span>
              </div>
              <div style="font-size: 10px; color: #009688; font-style: italic;">
                Clique para ver lista
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

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} sx={{ color: '#009688' }} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando normativos...</Typography></Box>;
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
      {/* Header */}
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to bottom, #e0f2f1, #fff)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ 
            p: 1, borderRadius: 2, 
            bgcolor: '#b2dfdb', 
            color: '#00695c', 
            display: 'flex' 
          }}>
            <GavelIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
              Normativos Internos
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Regulamentações por área
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhuma norma vinculada.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {stats.hidden > 0 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary">
            <b>{stats.hidden}</b> departamentos sem normas exclusivas.
          </Typography>
        </Box>
      )}

      {/* MODAL DE DETALHES */}
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#009688' }}>
                  {selectedDept.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lista de Normativos ({selectedDept.normatives.length})
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedDept.normatives.map((norm, idx) => (
                  <React.Fragment key={norm.idNormative || idx}>
                    <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                      <Box sx={{ mr: 2, mt: 0.5, color: '#009688' }}>
                         <DescriptionIcon />
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                              {norm.code}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {norm.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {idx < selectedDept.normatives.length - 1 && <Divider component="li" variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796b' }, borderRadius: 2, textTransform: 'none' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default DepartmentNormativeChart;