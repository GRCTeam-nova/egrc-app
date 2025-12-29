import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Paper, Typography, Box } from '@mui/material';

const NormativesChart = ({ rawData }) => {
    const chartData = useMemo(() => {
        if (!rawData) return { series: [], options: {} };

        const deptCounts = {};
        
        // Conta processos por departamento
        rawData.forEach(proc => {
            if (proc.departaments) {
                proc.departaments.forEach(dept => {
                    deptCounts[dept.name] = (deptCounts[dept.name] || 0) + 1;
                });
            }
        });

        const labels = Object.keys(deptCounts);
        const values = Object.values(deptCounts);

        return {
            series: [{ name: 'Normativos/Processos', data: values }],
            options: {
                chart: { type: 'bar', height: 350 },
                xaxis: { categories: labels, title: { text: 'Departamentos' } },
                colors: ['#5c6bc0'],
                title: { text: 'Volume por Departamento' }
            }
        };
    }, [rawData]);

    return (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6">Normativos por Departamento</Typography>
            <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={300} />
        </Paper>
    );
};

export default NormativesChart;