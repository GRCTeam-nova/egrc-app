import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ThemeMode } from '../../../config';
import useConfig from '../../../hooks/useConfig';

const barChartOptions = {
  chart: {
    type: 'bar',
    height: 365,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    // Para visualização semanal, usamos os dias da semana em português.
    categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    title: {
      text: 'Incidentes'
    },
    labels: {
      show: true
    }
  },
  grid: {
    show: true
  }
};

const OccurrenceBarChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();
  const { secondary } = theme.palette.text;
  // Usamos uma cor distinta (ex: vermelho) para representar as ocorrências
  const occurrencesColor = theme.palette.error.main;

  // Mock de dados para ocorrências semanais (ex.: incidentes registrados)
  const [series] = useState([
    {
      name: 'Incidentes',
      data: [3, 7, 5, 10, 6, 8, 4]
    }
  ]);

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [occurrencesColor],
      xaxis: {
        ...prevState.xaxis,
        labels: {
          style: {
            colors: Array(prevState.xaxis.categories.length).fill(secondary)
          }
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, secondary, occurrencesColor]);

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      <ReactApexChart options={options} series={series} type="bar" height={365} />
    </Box>
  );
};

export default OccurrenceBarChart;
