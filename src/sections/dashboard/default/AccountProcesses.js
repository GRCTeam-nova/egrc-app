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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Ícone de Conta
import SettingsIcon from '@mui/icons-material/Settings'; // Ícone de Processo
import StarIcon from '@mui/icons-material/Star'; // Ícone de Relevância
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApexCharts from 'apexcharts';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/ledger-accounts/reports";

// 2. Hook para buscar dados de Contas
const useLedgerReports = (url, token) => {
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
        setData(json.reportLedgerAccounts || []); 
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

const ProcessLedgerChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const { token } = useToken(); 
  const { data, isLoading, error } = useLedgerReports(API_ENDPOINT, token);

  // Lógica de Processamento: Contas vs Processos
  const { chartData, chartHeight, stats, activeAccounts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { hidden: 0 }, activeAccounts: [] };
    }

    // Filtra contas que possuem processos vinculados
    const activeList = data
      .filter(acc => acc.processes && acc.processes.length > 0)
      .sort((a, b) => b.processes.length - a.processes.length);

    const totalAccounts = data.length;
    const hiddenAccounts = totalAccounts - activeList.length;
    
    // Altura dinâmica
    const dynamicHeight = Math.max(350, activeList.length * 60);

    // Definição de Cores baseada na Relevância
    const colors = activeList.map(acc => 
        acc.isRelevant ? theme.palette.primary.main : '#94a3b8' // Azul se relevante, Cinza se não
    );

    return {
      activeAccounts: activeList,
      chartData: {
        categories: activeList.map(acc => acc.name || acc.code || "Sem Nome"),
        series: [{
          name: 'Processos Vinculados',
          data: activeList.map(acc => acc.processes.length)
        }],
        colors: colors
      },
      chartHeight: dynamicHeight,
      stats: { hidden: hiddenAccounts }
    };
  }, [data, theme]);

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
            const account = activeAccounts[index];
            if (account) {
              setSelectedAccount(account);
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
          distributed: true, // Importante para permitir cores individuais por barra
        }
      },
      colors: chartData.colors, // Aplica o array de cores (Azul/Cinza)
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
          style: { fontSize: '13px', fontWeight: 500, colors: '#334155' }
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } }   
      },
      legend: {
        show: false // Ocultamos a legenda padrão pois usamos cores distribuídas manualmente
      },
      tooltip: {
        theme: 'light',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const value = series[seriesIndex][dataPointIndex];
            const category = w.globals.labels[dataPointIndex];
            // Recupera a conta original para checar relevância no tooltip
            // Nota: activeAccounts está no escopo do componente, cuidado ao usar em callbacks de biblioteca externa se houver stale closure.
            // Para segurança, vamos confiar que a cor indica.
            const color = w.config.colors[dataPointIndex];
            const isRelevant = color === theme.palette.primary.main;

            return `
              <div style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${category}</div>
                <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                  ${value} <span style="font-weight:400; font-size:12px;">Processos</span>
                </div>
                <div style="font-size: 10px; color: ${isRelevant ? theme.palette.primary.main : '#94a3b8'}; font-weight: 600;">
                  ${isRelevant ? '★ Conta Relevante' : 'Conta Não Relevante'}
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
  }, [chartData, chartHeight, theme, activeAccounts]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedAccount(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando contas...</Typography></Box>;
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
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main', display: 'flex' }}>
            <AccountBalanceWalletIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Processos por Conta Contábil</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Impacto em processos e Relevância
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhuma conta com processos vinculados.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

       {/* Legenda Customizada */}
       {!isEmpty && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'primary.main' }} />
                <Typography variant="caption" color="text.secondary">Conta Relevante</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#94a3b8' }} />
                <Typography variant="caption" color="text.secondary">Não Relevante</Typography>
             </Box>
             {stats.hidden > 0 && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">{stats.hidden} contas vazias ocultas</Typography>
                </Box>
             )}
        </Box>
       )}

      {/* Modal de Detalhes */}
      <Dialog 
        open={openModal} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus={true} 
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedAccount && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: selectedAccount.isRelevant ? 'primary.main' : 'text.secondary' }}>
                    {selectedAccount.name || selectedAccount.code}
                    </Typography>
                    {selectedAccount.isRelevant && <StarIcon fontSize="small" color="primary" />}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                    {selectedAccount.type} • {selectedAccount.active ? 'Ativa' : 'Inativa'}
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                {/* Cabeçalho do Modal com Status */}
                <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderBottom: '1px solid #eee', display: 'flex', gap: 1 }}>
                     <Chip 
                        label={selectedAccount.isRelevant ? "Relevante" : "Não Relevante"} 
                        color={selectedAccount.isRelevant ? "primary" : "default"} 
                        size="small" 
                        variant={selectedAccount.isRelevant ? "filled" : "outlined"}
                        icon={selectedAccount.isRelevant ? <StarIcon /> : <StarBorderIcon />}
                     />
                     <Chip 
                        label={`${selectedAccount.processes.length} Processos`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ bgcolor: '#fff' }}
                     />
                </Box>

              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedAccount.processes.map((procName, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <SettingsIcon color="action" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {procName}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Processo vinculado
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < selectedAccount.processes.length - 1 && <Divider component="li" variant="inset" />}
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

export default ProcessLedgerChart;