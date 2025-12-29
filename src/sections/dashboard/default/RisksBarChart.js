import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ThemeMode } from '../../../config';
import useConfig from '../../../hooks/useConfig';

const areaChartOptions = {
  chart: {
    height: 450,
    type: 'area',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  grid: {
    strokeDashArray: 0
  }
};

const IncomeAreaChart = ({ slot }) => {
  const theme = useTheme();
  const { mode } = useConfig();

  const { secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      // Definindo cores distintas para cada série:
      // Incidentes: vermelho (error.main)
      // Riscos Críticos: laranja (warning.main)
      colors: [theme.palette.error.main, theme.palette.warning.main],
      xaxis: {
        categories:
          slot === 'month'
            ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        labels: {
          style: {
            colors: Array(slot === 'month' ? 12 : 7).fill(secondary)
          }
        },
        axisBorder: {
          show: true,
          color: line
        },
        tickAmount: slot === 'month' ? 11 : 7
      },
      yaxis: {
        labels: {
          style: {
            colors: [secondary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, secondary, line, theme, slot]);

  // Dados fictícios baseados em modelos de mercado para controle de riscos
  const [series, setSeries] = useState([
    {
      name: 'Incidentes (Ex: Vazamento, Incêndio, Intrusão)',
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: 'Riscos Críticos (Identificados)',
      data: [0, 0, 0, 0, 0, 0, 0]
    }
  ]);

  useEffect(() => {
    if (slot === 'month') {
      setSeries([
        {
          name: 'Incidentes (Ex: Vazamento, Incêndio, Intrusão)',
          // Valores mensais exemplificativos para incidentes registrados
          data: [8, 12, 5, 15, 10, 20, 18, 12, 25, 20, 17, 14]
        },
        {
          name: 'Riscos Críticos (Identificados)',
          // Valores mensais exemplificativos para riscos críticos identificados
          data: [2, 1, 3, 4, 2, 5, 3, 2, 4, 3, 2, 1]
        }
      ]);
    } else {
      setSeries([
        {
          name: 'Incidentes (Ex: Vazamento, Incêndio, Intrusão)',
          // Valores semanais exemplificativos para incidentes registrados
          data: [3, 7, 5, 10, 6, 8, 4]
        },
        {
          name: 'Riscos Críticos (Identificados)',
          // Valores semanais exemplificativos para riscos críticos identificados
          data: [1, 0, 2, 3, 1, 2, 1]
        }
      ]);
    }
  }, [slot]);

  return <ReactApexChart options={options} series={series} type="area" height={450} />;
};

IncomeAreaChart.propTypes = {
  slot: PropTypes.string
};

export default IncomeAreaChart;
