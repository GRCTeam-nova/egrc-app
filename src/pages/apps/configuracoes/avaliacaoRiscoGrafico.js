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

function HeatmapAvaliacaoRisco({
  data,
  nivel,
  avgInherent,
  avgResidual,
  avgPlanned,
  initialOverlay = {},
  onOverlayChange,
  disableOverlay = false,
}) {
  // Extrai categorias e faixas de cor direto de `data`
  const totalProb = data?.heatMapProbabilities.length || 0;
  const totalImpact = data?.heatMapImpacts.length || 0;
  const orderedProbabilities = Array(totalProb).fill("");
  const orderedImpacts = Array(totalImpact).fill("");

  const [justificativa, setJustificativa] = useState("");

  (data?.heatMapQuadrants || []).forEach((q) => {
    const [r, c] = q.coordinate.split(":").map(Number);
    if (r === 0 && c < totalProb) orderedProbabilities[c] = q.probability;
    if (c === 0 && r < totalImpact) orderedImpacts[r] = q.impact;
  });
  for (let i = 0; i < totalProb; i++) {
    orderedProbabilities[i] =
      orderedProbabilities[i] ||
      data.heatMapProbabilities[i]?.name ||
      `Probabilidade${i + 1}`;
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
      name: r.name, // ❗️ esse campo faz o nome aparecer na legenda
    })) || []; // :contentReference[oaicite:0]{index=0}

  // base chips (vindo do pai)
  const [baseI, setBaseI] = useState({ prob: null, impact: null });
  const [baseR, setBaseR] = useState({ prob: null, impact: null });
  const [baseP, setBaseP] = useState({ prob: null, impact: null });

  // chips sobrepor (selecionados pelo usuário)
  const [si, setSi] = useState({ prob: null, impact: null });
  const [sr, setSr] = useState({ prob: null, impact: null });
  const [sp, setSp] = useState({ prob: null, impact: null });

  useEffect(() => {
    if (avgInherent) {
      const [r1, c1] = avgInherent.split(":").map(Number);
      const r = r1 - 1;
      const c = c1 - 1;
      if (
        r >= 0 &&
        r < impactCategories.length &&
        c >= 0 &&
        c < probabilityCategories.length
      ) {
        setBaseI({
          impact: impactCategories[r],
          prob: probabilityCategories[c],
        });
      }
    }
  }, [avgInherent, impactCategories, probabilityCategories]);

  useEffect(() => {
    if (avgResidual) {
      const [r1, c1] = avgResidual.split(":").map(Number);
      const r = r1 - 1;
      const c = c1 - 1;
      if (
        r >= 0 &&
        r < impactCategories.length &&
        c >= 0 &&
        c < probabilityCategories.length
      ) {
        setBaseR({
          impact: impactCategories[r],
          prob: probabilityCategories[c],
        });
      }
    }
  }, [avgResidual, impactCategories, probabilityCategories]);

  useEffect(() => {
    if (avgPlanned) {
      const [r1, c1] = avgPlanned.split(":").map(Number);
      const r = r1 - 1;
      const c = c1 - 1;
      if (
        r >= 0 &&
        r < impactCategories.length &&
        c >= 0 &&
        c < probabilityCategories.length
      ) {
        setBaseP({
          impact: impactCategories[r],
          prob: probabilityCategories[c],
        });
      }
    }
  }, [avgPlanned, impactCategories, probabilityCategories]);

  // no topo do componente:
  const [initialized, setInitialized] = useState(false);

  // depois:
  useEffect(() => {
    if (!initialized && initialOverlay.inherent) {
      setSi({
        prob: initialOverlay.inherent.probId,
        impact: initialOverlay.inherent.impactId,
      });
      setSr({
        prob: initialOverlay.residual.probId,
        impact: initialOverlay.residual.impactId,
      });
      setSp({
        prob: initialOverlay.planned.probId,
        impact: initialOverlay.planned.impactId,
      });
      setJustificativa(initialOverlay.justification || "");
      setInitialized(true);
    }
  }, [initialOverlay, initialized]);

  // Notify parent on changes
  useEffect(() => {
    if (typeof onOverlayChange === "function") {
      const computeCoordinate = (sel) => {
        const pi = probabilityCategories.indexOf(sel.prob);
        const ii = impactCategories.indexOf(sel.impact);
        return pi >= 0 && ii >= 0 ? `${ii + 1}:${pi + 1}` : "";
      };
      onOverlayChange({
        inherent: {
          probId: si.prob,
          impactId: si.impact,
          coordinate: computeCoordinate(si),
        },
        residual: {
          probId: sr.prob,
          impactId: sr.impact,
          coordinate: computeCoordinate(sr),
        },
        planned: {
          probId: sp.prob,
          impactId: sp.impact,
          coordinate: computeCoordinate(sp),
        },
        justification: justificativa,
      });
    }
  }, [
    si,
    sr,
    sp,
    justificativa,
    onOverlayChange,
    probabilityCategories,
    impactCategories,
  ]);

  // Update base chips when avg coords change
  useEffect(() => {
    const setBase = (avg, setter) => {
      if (!avg) return;
      const [r1, c1] = avg.split(":").map(Number);
      const r = r1 - 1;
      const c = c1 - 1;
      if (
        r >= 0 &&
        r < impactCategories.length &&
        c >= 0 &&
        c < probabilityCategories.length
      ) {
        setter({ impact: impactCategories[r], prob: probabilityCategories[c] });
      }
    };
    setBase(avgInherent, setBaseI);
    setBase(avgResidual, setBaseR);
    setBase(avgPlanned, setBaseP);
  }, [
    avgInherent,
    avgResidual,
    avgPlanned,
    impactCategories,
    probabilityCategories,
  ]);

  const [loading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const chartContainerRef = useRef(null);
  const labelUpdateTimersRef = useRef([]);
  const scheduleUpdateLabelPositions = () => {
    // O ApexCharts nem sempre injeta os dataLabels imediatamente ao montar/atualizar.
    // Rodar algumas vezes evita o cenário em que as 'bolinhas' somem após alternar o Sobrepor.
    labelUpdateTimersRef.current.forEach((t) => clearTimeout(t));
    labelUpdateTimersRef.current = [0, 80, 180, 350, 600].map((ms) =>
      setTimeout(updateLabelPositions, ms)
    );
  };

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
          mounted: () => scheduleUpdateLabelPositions(),
          updated: () => scheduleUpdateLabelPositions(),
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
    scheduleUpdateLabelPositions();
    const onResize = () => scheduleUpdateLabelPositions();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      labelUpdateTimersRef.current.forEach((t) => clearTimeout(t));
      labelUpdateTimersRef.current = [];
    };
  }, [heatmapData, si, sr, sp]);

  const getChipPosition = (sel) => {
    if (!sel.prob || !sel.impact) return null;
    const pi = probabilityCategories.indexOf(sel.prob);
    const ii = impactCategories.indexOf(sel.impact);
    if (pi < 0 || ii < 0) return null;
    const key = `${ii}_${pi}`;
    const lbl = labelPositions[key];
    if (!lbl) return null;
    return {
      quadrantKey: key,
      left: lbl.left + lbl.width + 5,
      top: lbl.top + lbl.height / 2,
    };
  };

  const getQuadrantColor = (ii, pi) => {
    const cell = heatmapData[ii]?.data[pi];
    if (!cell) return "#000";
    const v = cell.y;
    for (const r of colorRanges) if (v >= r.from && v <= r.to) return r.color;
    return "#000";
  };

  const baseChips = [
    { tipo: "I", pos: getChipPosition(baseI) },
    { tipo: "R", pos: getChipPosition(baseR) },
    { tipo: "P", pos: getChipPosition(baseP) },
  ].filter((c) => c.pos);
  const sobreporChips = [
    { tipo: "SI", pos: getChipPosition(si) },
    { tipo: "SR", pos: getChipPosition(sr) },
    { tipo: "SP", pos: getChipPosition(sp) },
  ].filter((c) => c.pos);
  const chipsData = [...baseChips, ...sobreporChips];

  const groupedChips = {};
  chipsData.forEach((c) => {
    groupedChips[c.pos.quadrantKey] ||= [];
    groupedChips[c.pos.quadrantKey].push(c);
  });
  // Componente de legenda customizada
  const renderCustomLegend = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px', gap: '20px' }}>
      {colorRanges.map((range, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: range.color, 
              borderRadius: '2px',
              border: '1px solid #ccc'
            }} 
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {range.name} ({range.from}-{range.to})
          </span>
        </div>
      ))}
    </div>
  );

  // Render da seção de inputs sobrepostos com controle por nível
  const renderSobrepostoSection = () => (
    <Grid container spacing={1} marginTop={2}>
      {/* Probabilidade e Impacto Inerente */}
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Probabilidade Sobreposto Inerente</InputLabel>
          <Autocomplete
            disabled={disableOverlay}
            options={probabilityCategories}
            value={si.prob}
            onChange={(_, v) => setSi({ ...si, prob: v })}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
          />
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Impacto Sobreposto Inerente</InputLabel>
          <Autocomplete
            disabled={disableOverlay}
            options={impactCategories}
            value={si.impact}
            onChange={(_, v) => setSi({ ...si, impact: v })}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
          />
        </Stack>
      </Grid>

      {/* Residual, apenas se nivel >= 2 */}
      {nivel >= 2 && (
        <>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Probabilidade Sobreposta Residual</InputLabel>
              <Autocomplete
                disabled={disableOverlay}
                options={probabilityCategories}
                value={sr.prob}
                onChange={(_, v) => setSr({ ...sr, prob: v })}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Impacto Sobreposto Residual</InputLabel>
              <Autocomplete
                disabled={disableOverlay}
                options={impactCategories}
                value={sr.impact}
                onChange={(_, v) => setSr({ ...sr, impact: v })}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Stack>
          </Grid>
        </>
      )}

      {/* Planejada, apenas se nivel >= 3 */}
      {nivel >= 3 && (
        <>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Probabilidade Sobreposta Planejada</InputLabel>
              <Autocomplete
                disabled={disableOverlay}
                options={probabilityCategories}
                value={sp.prob}
                onChange={(_, v) => setSp({ ...sp, prob: v })}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6} sx={{ pb: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Impacto Sobreposto Planejada</InputLabel>
              <Autocomplete
                disabled={disableOverlay}
                options={impactCategories}
                value={sp.impact}
                onChange={(_, v) => setSp({ ...sp, impact: v })}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Stack>
          </Grid>
        </>
      )}

      {/* Justificativa, sempre visível */}
      <Grid item xs={12} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Justificativa</InputLabel>
          <TextField
            disabled={disableOverlay}
            onChange={(e) => setJustificativa(e.target.value)}
            fullWidth
            multiline
            rows={4}
            value={justificativa}
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

export default HeatmapAvaliacaoRisco;
