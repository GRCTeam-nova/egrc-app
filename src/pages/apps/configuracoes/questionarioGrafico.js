import React, { useRef, useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Autocomplete,
  TextField,
  Chip,
  InputLabel,
  Stack,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ptBR from "date-fns/locale/pt-BR";
import ReactApexChart from "react-apexcharts";
import LoadingOverlay from "./LoadingOverlay";

function HeatmapQuiz() {
  const [quantidadeNiveisProbabiliade] = useState(4);
  const [quantidadeNiveisImpacto] = useState(4);
  const [justificativa, setJustificativa] = useState("");
  const [loading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  // Estados para os campos de sobreposto:
  const [si, setSi] = useState({ prob: null, impact: null });
  const [sr, setSr] = useState({ prob: null, impact: null });
  const [sp, setSp] = useState({ prob: null, impact: null });

  // Labels para o heatmap e autocompletes
  const [probLabels, setProbLabels] = useState([]);
  const [impactLabels, setImpactLabels] = useState([]);

  // Dados do Heatmap
  const [heatmapData, setHeatmapData] = useState([]);

  // Referência do container do gráfico
  const chartContainerRef = useRef(null);

  // Posições (bounding boxes) de cada data label
  // Ex.: labelPositions["impactIndex_probIndex"] = { left, top, width, height }
  const [labelPositions, setLabelPositions] = useState({});

  // =============== FUNÇÃO: MONTAR DADOS DO HEATMAP ===============
  const mergeHeatmapData = (
    prob,
    impact,
    oldData,
    probLabels,
    impactLabels
  ) => {
    const newData = [];
    for (let i = 0; i < impact; i++) {
      const oldRow = oldData[i];
      const rowName = impactLabels[i] || oldRow?.name || `Impacto${i + 1}`;
      const rowData = [];

      for (let j = 0; j < prob; j++) {
        const oldCell = oldRow?.data[j];
        const xValue = probLabels[j] || oldCell?.x || `Probabilidade${j + 1}`;
        const yValue = oldCell ? oldCell.y : (i + 1) * (j + 1);
        const dataLabelValue = oldCell
          ? oldCell.dataLabel
          : String((i + 1) * (j + 1));

        rowData.push({
          x: xValue,
          y: yValue,
          dataLabel: dataLabelValue,
        });
      }

      newData.push({
        name: rowName,
        data: rowData,
      });
    }
    return newData;
  };

  // =============== APEX OPTIONS ===============
  const apexChartEvents = {
    mounted: () => {
      setTimeout(() => {
        updateLabelPositions();
      }, 50);
    },
    updated: () => {
      setTimeout(() => {
        updateLabelPositions();
      }, 50);
    },
  };

  const [heatmapOptions] = useState({
    chart: {
      type: "heatmap",
      toolbar: { show: true },
      height: 400,
      events: apexChartEvents,
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 3, color: "#3dc223" },
            { from: 4, to: 7, color: "#ccc61b" },
            { from: 8, to: 50, color: "#cc1b1b" },
          ],
        },
      },
    },
    grid: {
      padding: { top: 10, right: 15, bottom: 10, left: 15 },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, { seriesIndex, dataPointIndex, w }) {
        const currentSeries = w.config.series[seriesIndex];
        const label = currentSeries?.data[dataPointIndex]?.dataLabel;
        return label ? label : val;
      },
      style: { colors: ["#000000"], fontSize: "12px" },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          const label =
            w.config.series[seriesIndex].data[dataPointIndex].dataLabel;
          return label ? label : val;
        },
      },
    },
    xaxis: {
      title: { text: "Probabilidade" },
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      title: { text: "Impacto" },
      labels: { style: { fontSize: "12px" } },
    },
    legend: { show: false },
    annotations: { points: [] },
  });

  // =============== ATUALIZA HEATMAPDATA QUANDO LABELS MUDAM ===============
  useEffect(() => {
    const prob = Number(quantidadeNiveisProbabiliade);
    const impact = Number(quantidadeNiveisImpacto);
    setHeatmapData((oldData) =>
      mergeHeatmapData(prob, impact, oldData, probLabels, impactLabels)
    );
  }, [
    quantidadeNiveisProbabiliade,
    quantidadeNiveisImpacto,
    probLabels,
    impactLabels,
  ]);

  useEffect(() => {
    const prob = Number(quantidadeNiveisProbabiliade);
    setProbLabels((current) => {
      const newArr = [...current];
      while (newArr.length < prob) {
        newArr.push(`Probabilidade${newArr.length + 1}`);
      }
      return newArr.slice(0, prob);
    });
  }, [quantidadeNiveisProbabiliade]);

  useEffect(() => {
    const impact = Number(quantidadeNiveisImpacto);
    setImpactLabels((current) => {
      const newArr = [...current];
      while (newArr.length < impact) {
        newArr.push(`Impacto${newArr.length + 1}`);
      }
      return newArr.slice(0, impact);
    });
  }, [quantidadeNiveisImpacto]);

  // =============== LER POSIÇÃO DOS TEXTOS NO DOM DO APEXCHARTS ===============
  const updateLabelPositions = () => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const positions = {};

    heatmapData.forEach((_, seriesIndex) => {
      const seriesEl = container.querySelector(
        `.apexcharts-series[data\\:realIndex="${seriesIndex}"]`
      );
      if (!seriesEl) return;

      const dataLabelEls = seriesEl.querySelectorAll(".apexcharts-datalabel");
      dataLabelEls.forEach((dlEl, dataPointIndex) => {
        const dlRect = dlEl.getBoundingClientRect();
        const left = dlRect.left - containerRect.left;
        const top = dlRect.top - containerRect.top;
        const width = dlRect.width;
        const height = dlRect.height;
        // Ex.: "1_2" = impactIndex 1, probIndex 2
        positions[`${seriesIndex}_${dataPointIndex}`] = {
          left,
          top,
          width,
          height,
        };
      });
    });

    setLabelPositions(positions);
  };

  // Recalcula sempre que heatmapData ou seleções mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      updateLabelPositions();
    }, 100);
    return () => clearTimeout(timer);
  }, [heatmapData, si, sr, sp]);

  // =============== FUNÇÃO QUE OBTÉM POSIÇÃO E QUADRANTE ===============
  const getChipPosition = (selection) => {
    if (!selection.prob || !selection.impact) return null;

    const probIndex = probLabels.findIndex((p) => p === selection.prob);
    const impactIndex = impactLabels.findIndex((i) => i === selection.impact);

    if (probIndex < 0 || impactIndex < 0) return null;

    const key = `${impactIndex}_${probIndex}`;
    const labelRect = labelPositions[key];
    if (!labelRect) return null;

    // Offset horizontal para não colar no número
    const offsetX = 5;

    return {
      quadrantKey: key, // Para agrupar chips do mesmo quadrante
      left: labelRect.left + labelRect.width + offsetX,
      top: labelRect.top + labelRect.height / 2, // meio vertical
    };
  };

  // =============== FUNÇÃO QUE RETORNA A COR DO QUADRANTE ===============
  const getQuadrantColor = (impactIndex, probIndex) => {
    const cell = heatmapData[impactIndex]?.data[probIndex];
    if (!cell) return "#000";
    const value = cell.y;
    const ranges = heatmapOptions.plotOptions.heatmap.colorScale.ranges;
    for (const range of ranges) {
      if (value >= range.from && value <= range.to) {
        return range.color;
      }
    }
    return "#000";
  };

  // =============== SEÇÃO DE INPUT (SI, SR, SP) ===============
  const renderSobrepostoSection = () => {
    return (
      <Grid container spacing={1}>
        {/* Sobreposto Inerente (SI) */}
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Probabilidade inerente</InputLabel>
            <Autocomplete
              options={probLabels}
              value={si.prob}
              onChange={(event, newValue) => setSi({ ...si, prob: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Impacto inerente</InputLabel>
            <Autocomplete
              options={impactLabels}
              value={si.impact}
              onChange={(event, newValue) => setSi({ ...si, impact: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>

        {/* Sobreposto Residual (SR) */}
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Probabilidade residual</InputLabel>
            <Autocomplete
              options={probLabels}
              value={sr.prob}
              onChange={(event, newValue) => setSr({ ...sr, prob: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Impacto residual</InputLabel>
            <Autocomplete
              options={impactLabels}
              value={sr.impact}
              onChange={(event, newValue) => setSr({ ...sr, impact: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>

        {/* Sobreposto Planejada (SP) */}
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Probabilidade planejada</InputLabel>
            <Autocomplete
              options={probLabels}
              value={sp.prob}
              onChange={(event, newValue) => setSp({ ...sp, prob: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Impacto planejada</InputLabel>
            <Autocomplete
              options={impactLabels}
              value={sp.impact}
              onChange={(event, newValue) => setSp({ ...sp, impact: newValue })}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sx={{ paddingBottom: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Justificativa inerente</InputLabel>
            <TextField
              onChange={(event) => setJustificativa(event.target.value)}
              fullWidth
              multiline
              rows={4}
              value={justificativa}
            />
          </Stack>
        </Grid>
      </Grid>
    );
  };

  // =============== PREPARA LISTA DE CHIPS PARA RENDERIZAR ===============
  // Se o usuário colocar SI, SR e SP no mesmo quadrante, aparecerão lado a lado.
  const chipsData = [
    { tipo: "SI", pos: getChipPosition(si) },
    { tipo: "SR", pos: getChipPosition(sr) },
    { tipo: "SP", pos: getChipPosition(sp) },
  ].filter((item) => item.pos);

  // Agrupamos por quadrantKey para saber quais chips estão no mesmo quadrante
  const groupedChips = {};
  chipsData.forEach((c) => {
    const qk = c.pos.quadrantKey;
    if (!groupedChips[qk]) {
      groupedChips[qk] = [];
    }
    groupedChips[qk].push(c);
  });

  // =============== RENDER PRINCIPAL ===============
  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2} marginTop={-2}>
          <Grid item xs={12}>
            {renderSobrepostoSection()}
          </Grid>
          {heatmapData.length > 0 && (
            <>
              <Grid item xs={12}>
                {/* Container com position: relative para posicionar os Chips */}
                <div style={{ position: "relative" }} ref={chartContainerRef}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <ReactApexChart
                      options={heatmapOptions}
                      series={heatmapData}
                      type="heatmap"
                      height={350}
                    />
                  </Paper>

                  {/* Renderização dos Chips, agrupados por quadrante */}
                  {Object.keys(groupedChips).map((quadrantKey) => {
                    const chipsNoQuadrante = groupedChips[quadrantKey];
                    // Obter os índices do quadrante
                    const [impactIndex, probIndex] = quadrantKey
                      .split("_")
                      .map(Number);
                    // Obtém a cor do quadrante a partir do valor da célula
                    const chipColor = getQuadrantColor(impactIndex, probIndex);
                    return chipsNoQuadrante.map((item, index) => {
                      const { tipo, pos } = item;
                      // Offset para cada chip adicional no mesmo quadrante
                      const horizontalOffset = 35 * index;
                      return (
                        <Chip
                          key={`${tipo}-${quadrantKey}-${index}`}
                          label={tipo}
                          size="small"
                          sx={{
                            position: "absolute",
                            left: pos.left + horizontalOffset,
                            top: pos.top,
                            transform: "translate(0, -50%)",
                            backgroundColor: chipColor,
                            color: "#fff",
                            fontWeight: "bold",
                            borderRadius: "16px",
                            boxShadow: 3,
                            border: "1px solid #fff",
                          }}
                        />
                      );
                    });
                  })}
                </div>
              </Grid>
            </>
          )}
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default HeatmapQuiz;
