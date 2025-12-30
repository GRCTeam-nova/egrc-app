import React, { useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Paper, useTheme, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  List, ListItem, ListItemText, Divider, IconButton, Chip,
  Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // Ícone de Segurança/Controle
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Ícone de Check
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApexCharts from 'apexcharts';
import { useProcessControls } from './useProcessControls';

// Mesmo endpoint de processos
const API_ENDPOINT = `${API_URL}processes/reports/types`;

const ProcessControlChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isOthersModal, setIsOthersModal] = useState(false);
  const [othersList, setOthersList] = useState([]);

  const { data, isLoading, error } = useProcessControls(API_ENDPOINT);

  const { chartData, activeProcesses, othersData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, activeProcesses: [], othersData: [] };
    }

    // 1. Filtra processos com controles
    const allWithControls = data
      .filter(p => p.controls && p.controls.length > 0)
      .sort((a, b) => b.controls.length - a.controls.length);

    // 2. Agrupamento: Top 8 + Outros
    const LIMIT = 8;
    const topProcesses = allWithControls.slice(0, LIMIT);
    const remainingProcesses = allWithControls.slice(LIMIT);

    const labels = topProcesses.map(p => p.name);
    const series = topProcesses.map(p => p.controls.length);

    if (remainingProcesses.length > 0) {
      const othersCount = remainingProcesses.reduce((acc, curr) => acc + curr.controls.length, 0);
      labels.push(`Outros (${remainingProcesses.length} processos)`);
      series.push(othersCount);
    }

    return {
      activeProcesses: topProcesses,
      othersData: remainingProcesses,
      chartData: { labels, series }
    };
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.series.length === 0) return;

    const options = {
      series: chartData.series,
      labels: chartData.labels,
      chart: {
        type: 'donut',
        height: 400,
        fontFamily: 'Roboto, sans-serif',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const index = config.dataPointIndex;
            const isLastSlice = index === activeProcesses.length; 
            
            if (othersData.length > 0 && isLastSlice) {
               setOthersList(othersData);
               setIsOthersModal(true);
               setOpenModal(true);
            } else {
               const proc = activeProcesses[index];
               if (proc) {
                 setSelectedProcess(proc);
                 setIsOthersModal(false);
                 setOpenModal(true);
               }
            }
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: 'Total Controles',
                fontSize: '14px',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                }
              },
              value: {
                fontSize: '22px',
                fontWeight: 700,
                color: theme.palette.text.primary,
              }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'right',
        offsetY: 50,
        height: 300,
        fontSize: '13px',
        markers: { radius: 12 },
        itemMargin: { horizontal: 5, vertical: 5 }
      },
      // Paleta de Verdes (Positivo/Controle)
      colors: [
        '#2e7d32', '#388e3c', '#43a047', '#4caf50', // Verdes Fortes
        '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', // Verdes Claros
        '#90a4ae' // Cinza para "Outros"
      ],
      stroke: { show: false },
      tooltip: {
        y: { formatter: (val) => val + " Controles" }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    const style = document.createElement('style');
    style.innerHTML = `.apexcharts-pie-area { cursor: pointer; }`;
    chartRef.current.appendChild(style);

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [chartData, theme, activeProcesses, othersData]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => {
      setSelectedProcess(null);
      setOthersList([]);
      setIsOthersModal(false);
    }, 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} color="success" /><Typography sx={{ ml: 2 }}>Carregando Controles...</Typography></Box>;
  if (error) return <Alert severity="error">Erro: {error}</Alert>;

  const isEmpty = !chartData || chartData.series.length === 0;

  return (
    <Paper elevation={0} sx={{ p: 0, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header Verde */}
      <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.50', color: 'success.main', display: 'flex' }}>
            <VerifiedUserIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Controles e Efetividade</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Por Processo (Top 8 + Agrupados)</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isEmpty ? (
          <Box sx={{ textAlign: 'center' }}>
             <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
             <Typography variant="body2" color="text.secondary">Nenhum controle vinculado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {/* --- MODAL DE DETALHES --- */}
      <Dialog 
        open={openModal} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth 
        disableRestoreFocus={true}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {isOthersModal ? 'Outros Processos' : selectedProcess?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isOthersModal 
                ? `Expandindo ${othersList.length} processos menores` 
                : `Controles Vinculados (${selectedProcess?.controls.length})`}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          
          {/* LISTA AGRUPADA (Accordion) */}
          {isOthersModal ? (
            <Box sx={{ bgcolor: 'background.paper' }}>
               {othersList.map((proc, index) => (
                 <Accordion key={proc.idProcess || index} elevation={0} sx={{ borderBottom: '1px solid #f0f0f0', '&:before': {display: 'none'} }}>
                    <AccordionSummary 
                       expandIcon={<ExpandMoreIcon />}
                       sx={{ '&:hover': { bgcolor: '#fafafa' } }}
                    >
                       <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{proc.name}</Typography>
                          <Chip 
                             label={`${proc.controls.length} Controle(s)`} 
                             size="small" 
                             color="success" 
                             variant="outlined" 
                             sx={{ height: 20, fontSize: '10px' }}
                          />
                       </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, bgcolor: '#f1f8e9' }}>
                       <List dense>
                          {proc.controls.map((ctrl, cIdx) => (
                             <ListItem key={cIdx} sx={{ pl: 4 }}>
                                <Box sx={{ mr: 1.5, mt: 0.5, color: 'success.dark' }}><CheckCircleIcon fontSize="small" /></Box>
                                <ListItemText 
                                  primary={ctrl.code || 'S/ Cód'} 
                                  secondary={ctrl.name} 
                                  primaryTypographyProps={{fontSize: '12px', fontWeight: 'bold'}}
                                  secondaryTypographyProps={{fontSize: '11px'}}
                                />
                             </ListItem>
                          ))}
                       </List>
                    </AccordionDetails>
                 </Accordion>
               ))}
            </Box>
          ) : (
             /* LISTA SIMPLES */
             <List sx={{ width: '100%' }}>
               {selectedProcess && selectedProcess.controls.map((ctrl, idx) => (
                 <React.Fragment key={ctrl.idControl || idx}>
                   <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                     <Box sx={{ mr: 2, mt: 0.5, color: 'success.main' }}><VerifiedUserIcon /></Box>
                     <ListItemText 
                       primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{ctrl.code || 'Sem Código'}</Typography>}
                       secondary={<Typography variant="body2" color="text.secondary">{ctrl.name}</Typography>}
                     />
                   </ListItem>
                   {idx < selectedProcess.controls.length - 1 && <Divider component="li" variant="inset" />}
                 </React.Fragment>
               ))}
             </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProcessControlChart;