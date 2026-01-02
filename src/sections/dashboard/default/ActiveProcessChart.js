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
  IconButton,
  Chip
} from '@mui/material';
import DeviceHubIcon from '@mui/icons-material/DeviceHub'; 
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import CancelIcon from '@mui/icons-material/Cancel'; 
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApexCharts from 'apexcharts';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";
import {API_URL} from "../../../config";

const API_ENDPOINT = `${API_URL}actives/reports`;

// 2. Hook para buscar dados
const useActivesReports = (url, token) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
        setIsLoading(false);
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("Não autorizado (Token inválido ou expirado)");
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const json = await response.json();
        setData(json.reportPlatforms || []); 
      } catch (err) {
        console.error("Erro no fetch:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, token]);

  return { data, isLoading, error };
};

const AssetsProcessChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const { token } = useToken(); 
  const { data, isLoading, error } = useActivesReports(API_ENDPOINT, token);

  // Lógica de Processamento
  const { chartData, chartHeight, processDetails } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, processDetails: {} };
    }

    const procMap = {};

    data.forEach(asset => {
        const processes = (asset.processes && asset.processes.length > 0) 
            ? asset.processes 
            : ['Sem Processo Vinculado'];

        processes.forEach(procName => {
            if (!procMap[procName]) {
                procMap[procName] = {
                    name: procName,
                    count: 0,
                    activeItemsCount: 0,
                    items: []
                };
            }

            procMap[procName].count += 1;
            if (asset.active) procMap[procName].activeItemsCount += 1;
            procMap[procName].items.push(asset);
        });
    });

    const sortedProcs = Object.values(procMap).sort((a, b) => b.count - a.count);
    
    const categories = sortedProcs.map(p => p.name);
    const seriesData = sortedProcs.map(p => p.count);

    const dynamicHeight = Math.max(350, categories.length * 50);

    return {
      chartData: {
        categories,
        series: [{
          name: 'Ativos de Suporte',
          data: seriesData
        }]
      },
      chartHeight: dynamicHeight,
      processDetails: procMap
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
        animations: { enabled: true },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const index = config.dataPointIndex;
            const categoryName = chartData.categories[index];
            const details = processDetails[categoryName];
            
            if (details) {
              setSelectedProcess(details);
              setOpenModal(true);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          barHeight: '60%',
          distributed: true, 
        }
      },
      // --- ALTERAÇÃO AQUI: REMOVE A LEGENDA/ÍNDICE ---
      legend: {
        show: false 
      },
      // -----------------------------------------------
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#00897b'], 
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      colors: ['#26a69a'], 
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: { colors: ['#fff'], fontSize: '12px', fontWeight: 'bold' },
        formatter: (val) => val,
        offsetX: 0
      },
      xaxis: {
        categories: chartData.categories,
        labels: { style: { fontSize: '12px', colors: '#64748b' } },
      },
      yaxis: {
        labels: {
          maxWidth: 180,
          style: { fontSize: '13px', fontWeight: 500, colors: '#334155', cursor: 'pointer' }
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } }   
      },
      tooltip: {
        theme: 'light',
        y: {
            formatter: (val) => `${val} Ativos`
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
  }, [chartData, chartHeight, processDetails]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedProcess(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando vínculos de ativos...</Typography></Box>;
  if (error) return <Alert severity="error">Erro ao carregar: {error}</Alert>;

  const isEmpty = !chartData || chartData.categories.length === 0;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column',
        border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: '#fff'
      }}
    >
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to right, #ffffff, #e0f2f1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#e0f2f1', color: '#00897b', display: 'flex' }}>
            <DeviceHubIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Ativos por Processo</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Dependência Tecnológica
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhum vínculo de processo encontrado nos ativos.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

       {!isEmpty && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
             <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
             <Typography variant="caption" color="text.secondary">
                Ativos sem processo vinculado são agrupados automaticamente.
             </Typography>
        </Box>
       )}

      <Dialog 
        open={openModal} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus={true} 
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedProcess && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
                  {selectedProcess.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Suportado por {selectedProcess.count} Ativos ({selectedProcess.activeItemsCount} operacionais)
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedProcess.items.map((asset, idx) => (
                    <React.Fragment key={asset.id || idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <DeveloperBoardIcon color="action" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {asset.name || asset.code}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    icon={asset.active ? <CheckCircleIcon style={{ fontSize: 14 }} /> : <CancelIcon style={{ fontSize: 14 }} />}
                                    label={asset.active ? "Operacional" : "Inativo"} 
                                    size="small" 
                                    color={asset.active ? "success" : "error"} 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 24 }}
                                />
                                {asset.platformType && (
                                    <Chip 
                                        label={asset.platformType} 
                                        size="small" 
                                        sx={{ fontSize: '0.7rem', height: 24, bgcolor: '#f5f5f5', color: '#616161' }}
                                    />
                                )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < selectedProcess.items.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#00897b' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default AssetsProcessChart;