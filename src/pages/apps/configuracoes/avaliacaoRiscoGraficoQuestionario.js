import React, { useRef, useState, useEffect, useMemo } from "react";
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

function HeatmapAvaliacaoRiscoQuestionario({
  data,
  nivel,
  si,
  sr,
  sp,
  setSi,
  setSr,
  setSp,
  onCoordChange,
  justificativa,
  onJustificativaChange,
  disabledFields = false        
}) {
  const totalProb = data?.heatMapProbabilities.length || 0;
  const totalImpact = data?.heatMapImpacts.length || 0;

  // Nomes para exibição
  const orderedProbabilities = Array(totalProb).fill("");
  const orderedImpacts = Array(totalImpact).fill("");
  (data?.heatMapQuadrants || []).forEach((q) => {
    const [r, c] = q.coordinate.split(":").map(Number);
    if (r === 0 && c < totalProb) orderedProbabilities[c] = q.probability;
    if (c === 0 && r < totalImpact) orderedImpacts[r] = q.impact;
  });
  for (let i = 0; i < totalProb; i++) {
    orderedProbabilities[i] =
      orderedProbabilities[i] || data.heatMapProbabilities[i]?.name || `Probabilidade${i + 1}`;
  }
  for (let i = 0; i < totalImpact; i++) {
    orderedImpacts[i] =
      orderedImpacts[i] || data.heatMapImpacts[i]?.name || `Impacto${i + 1}`;
  }

  const probabilityCategories = orderedProbabilities;
  const impactCategories = orderedImpacts;

  const colorRanges =
    data?.heatMapRanges.map((r) => ({
      from: r.start,
      to: r.end,
      color: r.color,
      name: r.name,
    })) || [];

  const [loading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const chartContainerRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState({});

  const heatmapData = useMemo(
    () =>
      impactCategories.map((impact) => ({
        name: impact,
        data: probabilityCategories.map((prob) => {
          const quadrant = data?.heatMapQuadrants.find(
            (q) => q.impact === impact && q.probability === prob
          );
          return {
            x: prob,
            y: quadrant?.value ?? 0,
            dataLabel: quadrant?.label ?? "",
          };
        }),
      })),
    [data, impactCategories, probabilityCategories]
  );

  const heatmapOptions = useMemo(
    () => ({
      chart: {
        type: "heatmap",
        toolbar: { show: true },
        height: 400,
        events: {
          mounted: () => setTimeout(updateLabelPositions, 50),
          updated: () => setTimeout(updateLabelPositions, 50),
        },
      },
      plotOptions: {
        heatmap: { shadeIntensity: 0.5, colorScale: { ranges: colorRanges } },
      },
      grid: { padding: { top: 10, right: 15, bottom: 10, left: 15 } },
      dataLabels: {
        enabled: true,
        formatter: (val, { seriesIndex, dataPointIndex, w }) =>
          w.config.series[seriesIndex].data[dataPointIndex].dataLabel || val,
        style: { colors: ["#000"], fontSize: "12px" },
      },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex, dataPointIndex, w }) =>
            w.config.series[seriesIndex].data[dataPointIndex].dataLabel || val,
        },
      },
      xaxis: {
        categories: probabilityCategories,
        title: { text: "Probabilidade" },
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        categories: impactCategories,
        title: { text: "Impacto" },
        labels: { style: { fontSize: "12px" } },
      },
      legend: {
        show: false // Desabilitamos a legenda automática pois vamos criar uma customizada
      },
    }),
    [colorRanges, probabilityCategories, impactCategories]
  );

  function updateLabelPositions() {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const positions = {};
    heatmapData.forEach((series, sIdx) => {
      const seriesEl = chartContainerRef.current.querySelector(
        `.apexcharts-series[data\\:realIndex="${sIdx}"]`
      );
      if (!seriesEl) return;
      seriesEl
        .querySelectorAll(".apexcharts-datalabel")
        .forEach((dlEl, dIdx) => {
          const r = dlEl.getBoundingClientRect();
          positions[`${sIdx}_${dIdx}`] = {
            left: r.left - rect.left,
            top: r.top - rect.top,
            width: r.width,
            height: r.height,
          };
        });
    });
    setLabelPositions(positions);
  }

  useEffect(() => {
    const t = setTimeout(updateLabelPositions, 100);
    return () => clearTimeout(t);
  }, [heatmapData, si, sr, sp]);

  // Ao alterar seleção, mapear name->id e armazenar
  const handleSelectProb = (type, name) => {
    const obj = data.heatMapProbabilities.find((p) => p.name === name);
    const id = obj?.idHeatMapProbability || null;
    if (type === "inherent") setSi((prev) => ({ ...prev, prob: id }));
    if (type === "residual") setSr((prev) => ({ ...prev, prob: id }));
    if (type === "planned") setSp((prev) => ({ ...prev, prob: id }));
  };

  const handleSelectImp = (type, name) => {
    const obj = data.heatMapImpacts.find((i) => i.name === name);
    const id = obj?.idHeatMapImpact || null;
    if (type === "inherent") setSi((prev) => ({ ...prev, impact: id }));
    if (type === "residual") setSr((prev) => ({ ...prev, impact: id }));
    if (type === "planned") setSp((prev) => ({ ...prev, impact: id }));
  };

  // Disparar onCoordChange usando id->name para achar índices
  useEffect(() => {
    if (si.prob && si.impact) {
      const impName = data.heatMapImpacts.find((i) => i.idHeatMapImpact === si.impact)?.name;
      const probName = data.heatMapProbabilities.find((p) => p.idHeatMapProbability === si.prob)?.name;
      const ii = impactCategories.indexOf(impName);
      const pi = probabilityCategories.indexOf(probName);
      if (ii >= 0 && pi >= 0) onCoordChange("inherent", `${ii + 1}:${pi + 1}`);
    }
  }, [si, impactCategories, probabilityCategories, data.heatMapImpacts, data.heatMapProbabilities, onCoordChange]);

  useEffect(() => {
    if (sr.prob && sr.impact) {
      const impName = data.heatMapImpacts.find((i) => i.idHeatMapImpact === sr.impact)?.name;
      const probName = data.heatMapProbabilities.find((p) => p.idHeatMapProbability === sr.prob)?.name;
      const ii = impactCategories.indexOf(impName);
      const pi = probabilityCategories.indexOf(probName);
      if (ii >= 0 && pi >= 0) onCoordChange("residual", `${ii + 1}:${pi + 1}`);
    }
  }, [sr, impactCategories, probabilityCategories, data.heatMapImpacts, data.heatMapProbabilities, onCoordChange]);

  useEffect(() => {
    if (sp.prob && sp.impact) {
      const impName = data.heatMapImpacts.find((i) => i.idHeatMapImpact === sp.impact)?.name;
      const probName = data.heatMapProbabilities.find((p) => p.idHeatMapProbability === sp.prob)?.name;
      const ii = impactCategories.indexOf(impName);
      const pi = probabilityCategories.indexOf(probName);
      if (ii >= 0 && pi >= 0) onCoordChange("planned", `${ii + 1}:${pi + 1}`);
    }
  }, [sp, impactCategories, probabilityCategories, data.heatMapImpacts, data.heatMapProbabilities, onCoordChange]);

  // Helper para valor exibido no Autocomplete
  const getProbNameById = (id) => data.heatMapProbabilities.find((p) => p.idHeatMapProbability === id)?.name || "";
  const getImpNameById = (id) => data.heatMapImpacts.find((i) => i.idHeatMapImpact === id)?.name || "";

  const getChipPosition = (sel) => {
    if (!sel.prob || !sel.impact) return null;
    const probName = getProbNameById(sel.prob);
    const impName = getImpNameById(sel.impact);
    const pi = probabilityCategories.indexOf(probName);
    const ii = impactCategories.indexOf(impName);
    if (pi < 0 || ii < 0) return null;
    const key = `${ii}_${pi}`;
    const lbl = labelPositions[key];
    if (!lbl) return null;
    return { quadrantKey: key, left: lbl.left + lbl.width + 5, top: lbl.top + lbl.height / 2 };
  };

  const getQuadrantColor = (ii, pi) => {
    const cell = heatmapData[ii]?.data[pi];
    if (!cell) return "#000";
    const v = cell.y;
    for (const r of colorRanges) if (v >= r.from && v <= r.to) return r.color;
    return "#000";
  };

  const chipsData = [
    { tipo: "I", pos: getChipPosition(si) },
    { tipo: "R", pos: getChipPosition(sr) },
    { tipo: "P", pos: getChipPosition(sp) },
  ].filter((c) => c.pos);
  const groupedChips = {};
  chipsData.forEach((c) => {
    groupedChips[c.pos.quadrantKey] ||= [];
    groupedChips[c.pos.quadrantKey].push(c);
  });

  // Componente de legenda customizada
  const renderCustomLegend = () => {
    if (!colorRanges || colorRanges.length === 0) return null;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '16px', 
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {colorRanges.map((range, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            minWidth: 'fit-content'
          }}>
            <div 
              style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: range.color, 
                borderRadius: '2px',
                border: '1px solid #ccc',
                flexShrink: 0
              }} 
            />
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              whiteSpace: 'nowrap'
            }}>
              {range.name} ({range.from}-{range.to})
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderSobrepostoSection = () => (
    <Grid container spacing={1} marginTop={2}>
      {/* Inerente */}
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Probabilidade Inerente *</InputLabel>
          <Autocomplete
            options={probabilityCategories}
            value={getProbNameById(si.prob)}
            disabled={disabledFields}
            onChange={(_, v) => handleSelectProb("inherent", v)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Impacto Inerente *</InputLabel>
          <Autocomplete
            options={impactCategories}
            disabled={disabledFields}
            value={getImpNameById(si.impact)}
            onChange={(_, v) => handleSelectImp("inherent", v)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>

      {/* Residual */}
      {nivel >= 2 && (
        <>  
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Probabilidade Residual *</InputLabel>
              <Autocomplete
                options={probabilityCategories}
                disabled={disabledFields}
                value={getProbNameById(sr.prob)}
                onChange={(_, v) => handleSelectProb("residual", v)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Impacto Residual *</InputLabel>
              <Autocomplete
              disabled={disabledFields}
                options={impactCategories}
                value={getImpNameById(sr.impact)}
                onChange={(_, v) => handleSelectImp("residual", v)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
        </>
      )}

      {/* Planejada */}
      {nivel >= 3 && (
        <>  
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Probabilidade Planejada *</InputLabel>
              <Autocomplete
              disabled={disabledFields}
                options={probabilityCategories}
                value={getProbNameById(sp.prob)}
                onChange={(_, v) => handleSelectProb("planned", v)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Impacto Planejada *</InputLabel>
              <Autocomplete
              disabled={disabledFields}
                options={impactCategories}
                value={getImpNameById(sp.impact)}
                onChange={(_, v) => handleSelectImp("planned", v)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
        </>
      )}

      {/* Justificativa */}
      <Grid item xs={12} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Justificativa *</InputLabel>
          <TextField
            fullWidth
            disabled={disabledFields}
            multiline
            rows={4}
            value={justificativa}                      // ← valor vindo do pai
            onChange={e => onJustificativaChange(e.target.value)}  // ← notifica o pai
          />
        </Stack>
      </Grid>
    </Grid>
  );

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2} marginTop={-2}>
          <Grid item xs={12}>
            {renderSobrepostoSection()}
          </Grid>

          {heatmapData.length > 0 && (
            <Grid item xs={12}>
              <div style={{ position: "relative" }} ref={chartContainerRef}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <ReactApexChart
                    options={heatmapOptions}
                    series={heatmapData}
                    type="heatmap"
                    height={350}
                  />
                  {renderCustomLegend()}
                </Paper>
                {Object.entries(groupedChips).map(([qk, chips]) => {
                  const [ii, pi] = qk.split("_").map(Number);
                  const baseColor = getQuadrantColor(ii, pi);
                  return chips.map((item, idx) => (
                    <Chip
                      key={`${item.tipo}-${qk}-${idx}`}
                      label={item.tipo}
                      size="small"
                      sx={{
                        position: "absolute",
                        left: item.pos.left + 35 * idx,
                        top: item.pos.top,
                        transform: "translate(0, -50%)",
                        backgroundColor: "white",
                        color: "#00050a",
                        fontWeight: "bold",
                        borderRadius: "16px",
                        boxShadow: 3,
                        border: "1px solid #fff",
                      }}
                    />
                  ));
                })}
              </div>
            </Grid>
          )}
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default HeatmapAvaliacaoRiscoQuestionario;
