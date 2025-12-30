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
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApexCharts from 'apexcharts';
import { useDepartmentActionPlans } from './useDepartmentActionPlans';

const API_ENDPOINT = `${process.env.REACT_APP_API_URL}departments/reports/action-plans`;

const getStatusConfig = (status) => {
  switch (status) {
    case 1: return { label: 'Em Andamento', color: 'warning' };
    case 2: return { label: 'Concluído', color: 'success' };
    case 3: return { label: 'Atrasado', color: 'error' };
    default: return { label: `Status ${status}`, color: 'default' };
  }
};

const DepartmentActionPlanChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const { data, isLoading, error } = useDepartmentActionPlans(API_ENDPOINT);

  const { chartData, chartHeight, stats, activeDepts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { hidden: 0 }, activeDepts: [] };
    }

    const activeDeptsList = data
      .filter(d => d.actionPlans && d.actionPlans.length > 0)
      .sort((a, b) => b.actionPlans.length - a.actionPlans.length);

    const totalDepts = data.length;
    const hiddenDepts = totalDepts - activeDeptsList.length;
    const dynamicHeight = Math.max(300, activeDeptsList.length * 55);

    return {
      activeDepts: activeDeptsList,
      chartData: {
        categories: activeDeptsList.map(d => d.name),
        series: [{
          name: 'Planos de Ação',
          data: activeDeptsList.map(d => d.actionPlans.length)
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
          gradientToColors: [theme.palette.secondary.main],
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
      colors: [theme.palette.primary.main],
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
                ${value} <span style="font-weight:400; font-size:12px;">Planos</span>
              </div>
              <div style="font-size: 10px; color: ${theme.palette.primary.main}; font-style: italic;">
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
  }, [chartData, chartHeight, theme, activeDepts]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedDept(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando...</Typography></Box>;
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
      <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(to bottom, #ffffff, #fcfcfc)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main', display: 'flex' }}>
            <AssessmentIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Planos de Ação</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Clique nas barras para detalhar</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhum plano encontrado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

      {stats.hidden > 0 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary">
            <b>{stats.hidden}</b> departamentos sem planos ativos foram ocultados.
          </Typography>
        </Box>
      )}

      {/* CORREÇÃO AQUI: 
        Adicionado disableRestoreFocus={true} para evitar o pulo da tela 
      */}
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {selectedDept.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Listagem de planos vinculados
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedDept.actionPlans.map((plan, idx) => {
                  const statusConfig = getStatusConfig(plan.actionPlanStatus);
                  return (
                    <React.Fragment key={plan.idActionPlan || idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <AssignmentIcon />
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                                {plan.code}
                              </Typography>
                              <Chip 
                                label={statusConfig.label} 
                                color={statusConfig.color} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} 
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {plan.name}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < selectedDept.actionPlans.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                  );
                })}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default DepartmentActionPlanChart;