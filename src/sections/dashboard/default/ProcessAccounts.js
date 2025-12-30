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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Ícone de Banco/Contabilidade
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Ícone de Extrato/Conta
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ApexCharts from 'apexcharts';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";

const API_ENDPOINT = `${process.env.REACT_APP_API_URL}processes/reports`;

// 2. Hook interno para buscar dados
const useProcessReports = (url, token) => {
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
        setData(json.reportProcesss || []); 
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

const LedgerAccountProcessChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const { token } = useToken(); 
  const { data, isLoading, error } = useProcessReports(API_ENDPOINT, token);

  // Lógica de processamento das Contas Contábeis
  const { chartData, chartHeight, stats, activeProcesses } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { hidden: 0 }, activeProcesses: [] };
    }

    // Filtra apenas processos que possuem dados na lista 'ledgerAccounts'
    const activeList = data
      .filter(p => p.ledgerAccounts && p.ledgerAccounts.length > 0)
      .sort((a, b) => b.ledgerAccounts.length - a.ledgerAccounts.length);

    const totalProcesses = data.length;
    const hiddenProcesses = totalProcesses - activeList.length;
    
    // Altura dinâmica
    const dynamicHeight = Math.max(300, activeList.length * 55);

    return {
      activeProcesses: activeList,
      chartData: {
        categories: activeList.map(p => p.name || p.code || "Sem Nome"),
        series: [{
          name: 'Contas Contábeis',
          data: activeList.map(p => p.ledgerAccounts.length)
        }]
      },
      chartHeight: dynamicHeight,
      stats: { hidden: hiddenProcesses }
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
            const process = activeProcesses[index];
            if (process) {
              setSelectedProcess(process);
              setOpenModal(true);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          horizontal: true,
          barHeight: '60%',
          distributed: true,
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: [theme.palette.success.light], // Gradiente Verde
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
      // Usando Success (Verde) para representar Finanças/Contábil
      colors: [theme.palette.success.main], 
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
          return `
            <div style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${category}</div>
              <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                ${value} <span style="font-weight:400; font-size:12px;">Contas</span>
              </div>
              <div style="font-size: 10px; color: ${theme.palette.success.main}; font-style: italic;">
                Clique para ver detalhes
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
  }, [chartData, chartHeight, theme, activeProcesses]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedProcess(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando contas contábeis...</Typography></Box>;
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
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to bottom, #ffffff, #fcfcfc)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.50', color: 'success.main', display: 'flex' }}>
            <AccountBalanceIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Contas por Processo</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Clique para ver as contas vinculadas</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhuma conta contábil vinculada encontrada.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {stats.hidden > 0 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary">
            <b>{stats.hidden}</b> processos sem contas contábeis foram ocultados.
          </Typography>
        </Box>
      )}

      {/* Modal de Detalhes (Contas) */}
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {selectedProcess.name || selectedProcess.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contas Contábeis ({selectedProcess.ledgerAccounts.length})
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedProcess.ledgerAccounts.map((contaName, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <ReceiptLongIcon color="success" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {contaName}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                                <Chip label="Conta Contábil" size="small" variant="outlined" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < selectedProcess.ledgerAccounts.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" color="success" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default LedgerAccountProcessChart;