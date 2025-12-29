import React, { useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Paper, useTheme, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  List, ListItem, ListItemText, Divider, IconButton, Chip,
  Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Ícone para o Accordion
import ApexCharts from 'apexcharts';
import { useProcessRisks } from './useProcessRisks';

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/processes/reports/types";

const ProcessRiskChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isOthersModal, setIsOthersModal] = useState(false);
  const [othersList, setOthersList] = useState([]);

  const { data, isLoading, error } = useProcessRisks(API_ENDPOINT);

  const { chartData, activeProcesses, othersData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, activeProcesses: [], othersData: [] };
    }

    const allRisky = data
      .filter(p => p.risks && p.risks.length > 0)
      .sort((a, b) => b.risks.length - a.risks.length);

    // Top 8 + Outros
    const LIMIT = 8;
    const topProcesses = allRisky.slice(0, LIMIT);
    const remainingProcesses = allRisky.slice(LIMIT);

    const labels = topProcesses.map(p => p.name);
    const series = topProcesses.map(p => p.risks.length);

    if (remainingProcesses.length > 0) {
      const othersCount = remainingProcesses.reduce((acc, curr) => acc + curr.risks.length, 0);
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
            // Se o índice for igual ao tamanho dos processos principais, clicou no "Outros"
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
                label: 'Total de Riscos',
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
      colors: [
        '#d32f2f', '#e53935', '#f44336', '#ef5350', 
        '#ff7043', '#ff8a65', '#ffab91', '#ffccbc', 
        '#90a4ae' 
      ],
      stroke: { show: false },
      tooltip: {
        y: { formatter: (val) => val + " Riscos" }
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

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} color="error" /><Typography sx={{ ml: 2 }}>Carregando Riscos...</Typography></Box>;
  if (error) return <Alert severity="error">Erro: {error}</Alert>;

  const isEmpty = !chartData || chartData.series.length === 0;

  return (
    <Paper elevation={0} sx={{ p: 0, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: '#fff' }}>
      <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'error.50', color: 'error.main', display: 'flex' }}>
            <GppBadIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Distribuição de Riscos</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Por Processo (Top 8 + Agrupados)</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isEmpty ? (
          <Box sx={{ textAlign: 'center' }}>
             <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
             <Typography variant="body2" color="text.secondary">Nenhum risco vinculado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {/* --- MODAL HÍBRIDO (Único ou Múltiplos) --- */}
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
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {isOthersModal ? 'Processos Agrupados' : selectedProcess?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isOthersModal 
                ? `Expandindo ${othersList.length} processos menores` 
                : `Riscos Vinculados (${selectedProcess?.risks.length})`}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          
          {/* CENÁRIO 1: Lista Agrupada (Outros) com Accordion */}
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
                             label={`${proc.risks.length} Risco(s)`} 
                             size="small" 
                             color="error" 
                             variant="outlined" 
                             sx={{ height: 20, fontSize: '10px' }}
                          />
                       </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, bgcolor: '#fff5f5' }}>
                       <List dense>
                          {proc.risks.map((risk, rIdx) => (
                             <ListItem key={rIdx} sx={{ pl: 4 }}>
                                <Box sx={{ mr: 1.5, mt: 0.5, color: 'warning.dark' }}><WarningAmberIcon fontSize="small" /></Box>
                                <ListItemText 
                                  primary={risk.code} 
                                  secondary={risk.name} 
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
             /* CENÁRIO 2: Processo Único (Lista Simples) */
             <List sx={{ width: '100%' }}>
               {selectedProcess && selectedProcess.risks.map((risk, idx) => (
                 <React.Fragment key={risk.idRisk || idx}>
                   <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                     <Box sx={{ mr: 2, mt: 0.5, color: 'warning.main' }}><WarningAmberIcon /></Box>
                     <ListItemText 
                       primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{risk.code}</Typography>}
                       secondary={<Typography variant="body2" color="text.secondary">{risk.name}</Typography>}
                     />
                   </ListItem>
                   {idx < selectedProcess.risks.length - 1 && <Divider component="li" variant="inset" />}
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

export default ProcessRiskChart;