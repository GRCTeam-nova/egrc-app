// HeatmapMatrix.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Paper, Chip } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

export default function HeatmapMatrix({
  data,
  probabilityCategories,
  impactCategories,
  colorRanges,
  chipsSelections // array: [{ tipo: 'SI', sel:{prob,impact} }, …]
}) {
  const chartRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState({});

  // 1) Gera series para o Apex
  const heatmapData = useMemo(() => (
    impactCategories.map(impact => ({
      name: impact,
      data: probabilityCategories.map(prob => {
        const q = data.heatMapQuadrants.find(q =>
          q.impact === impact && q.probability === prob
        );
        return { x: prob, y: q?.value ?? 0, dataLabel: q?.label ?? '' };
      })
    }))
  ), [data, impactCategories, probabilityCategories]);

  // 2) Opções do gráfico
  const heatmapOptions = useMemo(() => ({
    chart: {
      type: 'heatmap',
      toolbar: { show: true },
      height: 400,
      events: {
        mounted: () => setTimeout(updateLabelPositions, 50),
        updated: () => setTimeout(updateLabelPositions, 50)
      }
    },
    plotOptions: {
      heatmap: { shadeIntensity: 0.5, colorScale: { ranges: colorRanges } }
    },
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex, dataPointIndex, w }) =>
        w.config.series[seriesIndex].data[dataPointIndex].dataLabel || val
    },
    xaxis: { categories: probabilityCategories },
    yaxis: { categories: impactCategories },
    legend: { show: false }
  }), [colorRanges, probabilityCategories, impactCategories]);

  // 3) Captura posições absolutas dos labels
  function updateLabelPositions() {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const positions = {};
    heatmapData.forEach((s, sIdx) => {
      const seriesEl = chartRef.current.querySelector(
        `.apexcharts-series[data\\:realIndex="${sIdx}"]`
      );
      if (!seriesEl) return;
      seriesEl.querySelectorAll('.apexcharts-datalabel').forEach((dl, dIdx) => {
        const r = dl.getBoundingClientRect();
        positions[`${sIdx}_${dIdx}`] = {
          left: r.left - rect.left,
          top: r.top - rect.top,
          width: r.width, height: r.height
        };
      });
    });
    setLabelPositions(positions);
  }

  useEffect(() => {
    const t = setTimeout(updateLabelPositions, 100);
    return () => clearTimeout(t);
  }, [heatmapData]);

  // 4) helper para cor de cada célula
  const getQuadrantColor = (ii, pi) => {
    const v = heatmapData[ii].data[pi].y;
    for (const r of colorRanges) if (v >= r.from && v <= r.to) return r.color;
    return '#000';
  };

  // 5) posicionar cada chip
  const chipsWithPos = chipsSelections.map(({ tipo, sel }) => {
    const pi = probabilityCategories.indexOf(sel.prob);
    const ii = impactCategories.indexOf(sel.impact);
    if (pi < 0 || ii < 0) return null;
    const key = `${ii}_${pi}`;
    const lbl = labelPositions[key];
    if (!lbl) return null;
    return {
      tipo,
      style: {
        position: 'absolute',
        left: lbl.left + lbl.width + 5,
        top: lbl.top + lbl.height/2 - 10
      },
      color: getQuadrantColor(ii, pi)
    };
  }).filter(Boolean);

  return (
    <div style={{ position: 'relative' }} ref={chartRef}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <ReactApexChart
          options={heatmapOptions}
          series={heatmapData}
          type="heatmap"
          height={350}
        />
      </Paper>

      {chipsWithPos.map((c, i) => (
        <Chip
          key={i}
          label={c.tipo}
          size="small"
          sx={{
            ...c.style,
            backgroundColor: 'white',
            color: c.color,
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: 3
          }}
        />
      ))}
    </div>
  );
}
