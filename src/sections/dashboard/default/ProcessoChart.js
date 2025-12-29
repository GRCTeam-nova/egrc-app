// src/sections/dashboard/ProcessDashboard.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import useConfig from '../../../hooks/useConfig';
import { ThemeMode } from '../../../config';

// Exemplo de processos e departamentos
const processes   = ['Processo A', 'Processo B', 'Processo C', 'Processo D'];
const departments = ['Financeiro', 'RH', 'TEC', 'Marketing'];

/**
 * 1) Fluxo de Processo (Treemap) – hierarquia por nível e departamento
 */
const ProcessFlowChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series, setSeries]   = useState([]);

  useEffect(() => {
    // Exemplo de dados hierárquicos: x = "Processo – Nível", y = valor
    setSeries([{
      data: [
        { x: 'Processo A – Nível 1', y: 10 },
        { x: 'Processo A – Nível 2', y: 7  },
        { x: 'Processo B – Nível 1', y: 8  },
        { x: 'Processo B – Nível 2', y: 12 },
        // ...
      ]
    }]);

    setOptions({
      chart: { type: 'treemap', toolbar: { show: false } },
      plotOptions: {
        treemap: {
          distributed: true
        }
      },
      legend: { show: false },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [mode]);

  return (
    <Card>
      <CardHeader title="Fluxo de Processos" subheader="hierarquia de níveis" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="treemap" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 2) Fluxo Completo de Processos (Treemap Multi-Série)
 */
const ProcessFlowFullChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series, setSeries]   = useState([]);

  useEffect(() => {
    // Dois níveis de agrupamento: séries para cada processo
    setSeries([
      {
        name: 'Processo A',
        data: [
          { x: 'Nível 1', y: 10 },
          { x: 'Nível 2', y: 7  },
        ]
      },
      {
        name: 'Processo B',
        data: [
          { x: 'Nível 1', y: 8  },
          { x: 'Nível 2', y: 12 },
        ]
      }
      // ...
    ]);

    setOptions({
      chart: { type: 'treemap', toolbar: { show: false } },
      plotOptions: { treemap: { enableShades: false } },
      legend: { position: 'bottom' },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [mode]);

  return (
    <Card>
      <CardHeader title="Fluxo Completo de Processos" subheader="todos os níveis" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="treemap" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 3) Riscos por Criticidade – por processo (Stacked Bar)
 */
const ProcessRisksChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series] = useState([
    { name: 'Crítico', data: [3, 2, 4, 1] },
    { name: 'Alto',    data: [5, 3, 6, 2] },
    { name: 'Médio',   data: [7, 5, 8, 6] },
    { name: 'Baixo',   data: [9, 7, 10, 8] }
  ]);

  useEffect(() => {
    setOptions({
      chart: { type: 'bar', stacked: true, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: processes,
        labels: { style: { colors: Array(processes.length).fill(theme.palette.text.secondary) } },
        axisBorder: { color: theme.palette.divider }
      },
      yaxis: { labels: { style: { colors: [theme.palette.text.secondary] } } },
      grid: { borderColor: theme.palette.divider },
      colors: [
        theme.palette.error.dark, theme.palette.error.light,
        theme.palette.warning.main, theme.palette.info.main
      ],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' },
      legend: { position: 'top' }
    });
  }, [theme, mode]);

  return (
    <Card>
      <CardHeader title="Riscos por Criticidade" subheader="por processo" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 4) Controles por Efetividade – por processo (Barra agrupada)
 */
const ProcessControlsChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series] = useState([
    { name: 'Alta Efetividade',   data: [5, 4, 6, 3] },
    { name: 'Média Efetividade',  data: [3, 2, 4, 2] },
    { name: 'Baixa Efetividade',  data: [2, 1, 2, 1] },
  ]);

  useEffect(() => {
    setOptions({
      chart: { type: 'bar', stacked: false, toolbar: { show: false } },
      plotOptions:{ bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: processes,
        labels: { style: { colors: Array(processes.length).fill(theme.palette.text.secondary) } },
        axisBorder: { color: theme.palette.divider }
      },
      yaxis: { labels: { style: { colors: [theme.palette.text.secondary] } } },
      grid: { borderColor: theme.palette.divider },
      colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [theme, mode]);

  return (
    <Card>
      <CardHeader title="Controles por Efetividade" subheader="por processo" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 5) Normativos por Departamento (Barra simples)
 */
const DepartmentNormativosChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series] = useState([{ name: 'Normativos', data: [5, 7, 6, 4] }]);

  useEffect(() => {
    setOptions({
      chart: { type: 'bar', toolbar: { show: false } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: departments,
        labels: { style: { colors: Array(departments.length).fill(theme.palette.text.secondary) } },
        axisBorder: { color: theme.palette.divider }
      },
      yaxis: { labels: { style: { colors: [theme.palette.text.secondary] } } },
      grid: { borderColor: theme.palette.divider },
      colors: [theme.palette.success.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [theme, mode]);

  return (
    <Card>
      <CardHeader title="Normativos" subheader="por departamento" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 6) Dados & Classificação por Processo (Stacked Bar)
 */
const ProcessDataClassificationChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series] = useState([
    { name: 'Público',   data: [15, 12, 14, 10] },
    { name: 'Interno',   data: [8,  7,  9,  6]  },
    { name: 'Restrito',  data: [4,  3,  5,  2]  }
  ]);

  useEffect(() => {
    setOptions({
      chart: { type: 'bar', stacked: true, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: processes,
        labels: { style: { colors: Array(processes.length).fill(theme.palette.text.secondary) } },
        axisBorder: { color: theme.palette.divider }
      },
      yaxis: { labels: { style: { colors: [theme.palette.text.secondary] } } },
      grid: { borderColor: theme.palette.divider },
      colors: [theme.palette.info.main, theme.palette.warning.main, theme.palette.error.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' },
      legend: { position: 'top' }
    });
  }, [theme, mode]);

  return (
    <Card>
      <CardHeader title="Dados & Classificação" subheader="por processo" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * 7) Contas por Departamento (Barra simples)
 */
const DepartmentAccountsChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const [options, setOptions] = useState({});
  const [series]   = useState([{ name: 'Contas Relevantes', data: [12, 9, 11, 7] }]);

  useEffect(() => {
    setOptions({
      chart: { type: 'bar', toolbar: { show: false } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: departments,
        labels: { style: { colors: Array(departments.length).fill(theme.palette.text.secondary) } },
        axisBorder: { color: theme.palette.divider }
      },
      yaxis: { labels: { style: { colors: [theme.palette.text.secondary] } } },
      grid: { borderColor: theme.palette.divider },
      colors: [theme.palette.primary.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [theme, mode]);

  return (
    <Card>
      <CardHeader title="Contas" subheader="por departamento" />
      <CardContent>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  );
};

/**
 * Componente principal que agrupa todos os gráficos
 */
const ProcessDashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}><ProcessFlowChart               /></Grid>
    <Grid item xs={12} md={6}><ProcessFlowFullChart           /></Grid>
    <Grid item xs={12} md={6}><ProcessRisksChart              /></Grid>
    <Grid item xs={12} md={6}><ProcessControlsChart           /></Grid>
    <Grid item xs={12} md={6}><DepartmentNormativosChart      /></Grid>
    <Grid item xs={12} md={6}><ProcessDataClassificationChart /></Grid>
    <Grid item xs={12} md={6}><DepartmentAccountsChart        /></Grid>
  </Grid>
);

export default ProcessDashboard;
