import { API_URL} from 'config';
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
import DomainIcon from '@mui/icons-material/Domain'; // Ícone de Departamento
import RouterIcon from '@mui/icons-material/Router'; // Ícone de Ativo/Equipamento
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import CancelIcon from '@mui/icons-material/Cancel'; 
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApexCharts from 'apexcharts';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";

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

const AssetsDepartmentChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const { token } = useToken(); 
  const { data, isLoading, error } = useActivesReports(API_ENDPOINT, token);

  // Lógica de Processamento: Agrupar Ativos por DEPARTAMENTO
  const { chartData, chartHeight, deptDetails } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, deptDetails: {} };
    }

    const deptMap = {};

    data.forEach(asset => {
        // Verifica se o ativo tem departamentos vinculados
        const departments = (asset.departments && asset.departments.length > 0) 
            ? asset.departments 
            : ['Sem Departamento Vinculado'];

        departments.forEach(deptName => {
            if (!deptMap[deptName]) {
                deptMap[deptName] = {
                    name: deptName,
                    count: 0,
                    activeItemsCount: 0,
                    items: []
                };
            }

            deptMap[deptName].count += 1;
            if (asset.active) deptMap[deptName].activeItemsCount += 1;
            
            deptMap[deptName].items.push(asset);
        });
    });

    // Ordenar por quantidade (decrescente)
    const sortedDepts = Object.values(deptMap).sort((a, b) => b.count - a.count);
    
    const categories = sortedDepts.map(d => d.name);
    const seriesData = sortedDepts.map(d => d.count);

    const dynamicHeight = Math.max(350, categories.length * 50);

    return {
      chartData: {
        categories,
        series: [{
          name: 'Ativos Utilizados',
          data: seriesData
        }]
      },
      chartHeight: dynamicHeight,
      deptDetails: deptMap
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
            const details = deptDetails[categoryName];
            
            if (details) {
              setSelectedDept(details);
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
      legend: {
        show: false 
      },
      // Cores: Deep Purple para Departamento
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#512da8'], // Roxo mais escuro
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      colors: ['#673ab7'], // Deep Purple Base
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
  }, [chartData, chartHeight, deptDetails]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedDept(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando ativos por departamento...</Typography></Box>;
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
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to right, #ffffff, #ede7f6)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#ede7f6', color: '#673ab7', display: 'flex' }}>
            <DomainIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Ativos por Departamento</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Distribuição Setorial de Ativos
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhum vínculo de departamento encontrado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

       {!isEmpty && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
             <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
             <Typography variant="caption" color="text.secondary">
                Ativos sem departamento são agrupados automaticamente.
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
        {selectedDept && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#512da8' }}>
                  {selectedDept.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Responsável por {selectedDept.count} Ativos ({selectedDept.activeItemsCount} operacionais)
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedDept.items.map((asset, idx) => (
                    <React.Fragment key={asset.id || idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <RouterIcon color="action" />
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
                      {idx < selectedDept.items.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#673ab7' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default AssetsDepartmentChart;