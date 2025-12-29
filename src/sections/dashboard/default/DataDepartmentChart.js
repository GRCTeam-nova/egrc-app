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
  Chip,
  Tooltip as MuiTooltip
} from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain'; // Ícone de Departamento
import StorageIcon from '@mui/icons-material/Storage'; // Ícone de Dados
import GppGoodIcon from '@mui/icons-material/GppGood'; // Ícone de Tratamento/Segurança
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Ícone de Sensível
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApexCharts from 'apexcharts';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";

// Novo Endpoint de Dados
const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/datas/reports";

const useDataReports = (url, token) => {
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
        // O json retorna { reportLgpds: [...] }
        setData(json.reportLgpds || []); 
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

const DataDepartmentChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { token } = useToken(); 
  const { data, isLoading, error } = useDataReports(API_ENDPOINT, token);

  // Lógica de Processamento: Agrupar Dados por Departamento
  const { chartData, chartHeight, stats, departmentDetails } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, chartHeight: 350, stats: { total: 0 }, departmentDetails: {} };
    }

    const deptMap = {};

    data.forEach(item => {
        // Se o array de departamentos for vazio ou null, classificamos como "Sem Departamento"
        const depts = (item.departments && item.departments.length > 0) 
            ? item.departments 
            : ['Sem Departamento'];

        depts.forEach(deptName => {
            if (!deptMap[deptName]) {
                deptMap[deptName] = {
                    name: deptName,
                    total: 0,
                    sensitiveCount: 0,
                    treatmentCount: 0,
                    items: []
                };
            }

            deptMap[deptName].total += 1;
            if (item.sensitive) deptMap[deptName].sensitiveCount += 1;
            if (item.performTreatment) deptMap[deptName].treatmentCount += 1;
            
            deptMap[deptName].items.push(item);
        });
    });

    // Ordenar departamentos por volume total de dados
    const sortedDepts = Object.values(deptMap).sort((a, b) => b.total - a.total);
    const categories = sortedDepts.map(d => d.name);

    // Preparar séries para o gráfico (Total, Sensíveis, Tratamento)
    const series = [
        {
            name: 'Total de Dados',
            data: sortedDepts.map(d => d.total)
        },
        {
            name: 'Dados Sensíveis',
            data: sortedDepts.map(d => d.sensitiveCount)
        },
        {
            name: 'Realizam Tratamento',
            data: sortedDepts.map(d => d.treatmentCount)
        }
    ];

    const dynamicHeight = Math.max(350, categories.length * 90); // Altura maior pois são 3 barras por item

    return {
        chartData: { categories, series },
        chartHeight: dynamicHeight,
        stats: { total: data.length },
        departmentDetails: deptMap
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
            const deptDetails = departmentDetails[categoryName];
            
            if (deptDetails) {
              setSelectedDepartment(deptDetails);
              setOpenModal(true);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '75%', // Barras mais grossas para acomodar o grupo
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        }
      },
      dataLabels: {
        enabled: true,
        offsetX: 20,
        style: { colors: ['#333'], fontSize: '11px' },
        formatter: (val) => val > 0 ? val : ''
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff']
      },
      // Cores: 
      // 1. Total (Azul/Cinza)
      // 2. Sensível (Laranja/Alerta)
      // 3. Tratamento (Verde/Sucesso)
      colors: ['#94a3b8', '#f59e0b', '#10b981'], 
      xaxis: {
        categories: chartData.categories,
        labels: { style: { fontSize: '12px', colors: '#64748b' } },
      },
      yaxis: {
        labels: {
          maxWidth: 160,
          style: { fontSize: '13px', fontWeight: 600, colors: '#334155' }
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } }   
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40
      },
      tooltip: {
        theme: 'light',
        y: {
            formatter: function (val) {
                return val;
            }
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
  }, [chartData, chartHeight, departmentDetails]);

  const handleClose = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedDepartment(null), 200);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 2 }}>Carregando dados LGPD...</Typography></Box>;
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
            <DomainIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Características por Departamento</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Volume, Sensibilidade e Tratamento
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2, mt: 2 }}>
        {isEmpty ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nenhum dado encontrado.</Typography>
          </Box>
        ) : (
          <div ref={chartRef} style={{ width: '100%' }} />
        )}
      </Box>

        {/* Legenda Informativa Rodapé */}
       {!isEmpty && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <Typography variant="caption" color="text.secondary">Sensíveis</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                <Typography variant="caption" color="text.secondary">Com Tratamento</Typography>
             </Box>
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
        {selectedDepartment && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedDepartment.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Listando {selectedDepartment.items.length} dados vinculados
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedDepartment.items.map((dataItem, idx) => (
                    <React.Fragment key={dataItem.id || idx}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                        <Box sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }}>
                           <StorageIcon color="action" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {dataItem.name || dataItem.code}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {/* Chip de Sensível */}
                                {dataItem.sensitive && (
                                    <Chip 
                                        icon={<WarningAmberIcon style={{ fontSize: 16 }} />} 
                                        label="Sensível" 
                                        size="small" 
                                        color="warning" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 24 }}
                                    />
                                )}
                                {/* Chip de Tratamento */}
                                {dataItem.performTreatment && (
                                    <Chip 
                                        icon={<GppGoodIcon style={{ fontSize: 16 }} />} 
                                        label="Tratamento Realizado" 
                                        size="small" 
                                        color="success" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 24 }}
                                    />
                                )}
                                {/* Chip Genérico se não tiver flags */}
                                {!dataItem.sensitive && !dataItem.performTreatment && (
                                    <Chip 
                                        label="Dado Comum" 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 24, color: 'text.secondary' }}
                                    />
                                )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < selectedDepartment.items.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'text.primary' }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default DataDepartmentChart;