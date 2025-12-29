import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ThemeMode } from '../../../config';
import useConfig from '../../../hooks/useConfig';
import { Box, Typography } from '@mui/material';

const DataCharts = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const { secondary } = theme.palette.text;
  const line = theme.palette.divider;

  // Categorias de exemplo para processos e departamentos
  const processCategories = ['Processo A', 'Processo B', 'Processo C'];
  const departmentCategories = ['Depto X', 'Depto Y', 'Depto Z'];

  // Séries de exemplo
  const processSeries = [
    { name: 'Classificação', data: [30, 45, 20] },
    { name: 'Sensível', data: [10, 15, 5] },
    { name: 'Realiza Tratamento', data: [5, 8, 3] }
  ];

  const departmentSeries = [
    { name: 'Classificação', data: [25, 35, 40] },
    { name: 'Sensível', data: [8, 12, 10] },
    { name: 'Realiza Tratamento', data: [4, 6, 7] }
  ];

  // Configurações comuns para ambos os gráficos
  const baseOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%' }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.success.main],
    xaxis: {
      labels: { style: { colors: Array(processCategories.length).fill(secondary) } },
      axisBorder: { show: true, color: line }
    },
    yaxis: {
      labels: { style: { colors: [secondary] } }
    },
    grid: { borderColor: line },
    theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dados por Processo
      </Typography>
      <ReactApexChart
        options={{
          ...baseOptions,
          xaxis: { ...baseOptions.xaxis, categories: processCategories }
        }}
        series={processSeries}
        type="bar"
        height={350}
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Dados por Departamento
      </Typography>
      <ReactApexChart
        options={{
          ...baseOptions,
          xaxis: { ...baseOptions.xaxis, categories: departmentCategories }
        }}
        series={departmentSeries}
        type="bar"
        height={350}
      />
    </Box>
  );
};

DataCharts.propTypes = {};

export default DataCharts;
