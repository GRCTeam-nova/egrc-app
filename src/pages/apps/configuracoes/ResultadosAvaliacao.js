import React, { useMemo } from "react";
import { Grid, Paper, Typography, Box, Divider } from "@mui/material";

/**
 * Componente para exibir os resultados consolidados da avaliação.
 * Versão Corrigida: Trata nomes de range vazios e coordenadas instáveis.
 */
const ResultadosAvaliacao = ({
  heatmapData,
  nivel,
  inherentCoords,
  residualCoords,
  plannedCoords,
}) => {
  
  // Função auxiliar para encontrar o Range
  const getRiskResult = (coords) => {
    // Validação básica
    if (!coords || !heatmapData || !heatmapData.heatMapQuadrants) return null;

    const [rStr, cStr] = coords.split(":");
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);

    if (isNaN(r) || isNaN(c)) return null;

    // Lógica de busca de quadrante (Tenta Base-1 primeiro, depois Base-0)
    let quadrant = null;
    let targetCoord = "";

    // TENTATIVA 1: Assumir que a entrada é Base-1 (ex: "4:4") e o JSON é Base-0 ("3:3")
    targetCoord = `${r - 1}:${c - 1}`;
    quadrant = heatmapData.heatMapQuadrants.find(q => q.coordinate === targetCoord);

    // TENTATIVA 2: Se não achou, tenta Base-0 direta (ex: "4:4" busca "4:4")
    if (!quadrant) {
      targetCoord = `${r}:${c}`;
      quadrant = heatmapData.heatMapQuadrants.find(q => q.coordinate === targetCoord);
    }

    // Se ainda não achou, retorna null (vai exibir "Não avaliado")
    if (!quadrant) return null;

    // Encontrar o Range correspondente ao valor do quadrante
    const range = heatmapData.heatMapRanges?.find(
      (rng) => quadrant.value >= rng.start && quadrant.value <= rng.end
    );

    // CORREÇÃO DO NOME VAZIO: Se range.name vier vazio do backend, criamos um label genérico
    let rangeName = range?.name;
    if (!rangeName || rangeName.trim() === "") {
        rangeName = `Nível ${quadrant.value}`; // Ex: "Nível 6"
    }

    return {
      value: quadrant.value,
      name: rangeName,
      color: range?.color || "#e0e0e0",
      description: `Coord: ${targetCoord}`,
    };
  };

  const resultInherent = useMemo(() => getRiskResult(inherentCoords), [inherentCoords, heatmapData]);
  const resultResidual = useMemo(() => getRiskResult(residualCoords), [residualCoords, heatmapData]);
  const resultPlanned = useMemo(() => getRiskResult(plannedCoords), [plannedCoords, heatmapData]);

  if (!heatmapData) return null;

  // Lógica de colunas baseada no nível
  const showResidual = Array.isArray(nivel) ? nivel.includes(2) : nivel >= 2;
  const showPlanned = Array.isArray(nivel) ? nivel.includes(3) : nivel >= 3;

  let gridCols = 12;
  if (showResidual && showPlanned) gridCols = 4;
  else if (showResidual) gridCols = 6;

  const ResultCard = ({ title, data }) => {
    // Se data for null, significa que não achou o quadrante ou a coordenada estava vazia
    if (!data)
      return (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: "100%",
            bgcolor: "#f9fafb",
            border: "1px dashed #ccc",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "120px"
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Aguardando dados...
          </Typography>
        </Paper>
      );

    return (
      <Paper
        elevation={0}
        sx={{
          p: 0,
          height: "100%",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "120px"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            bgcolor: data.color,
          }}
        />

        <Box sx={{ p: 2, pl: 3 }}>
          <Typography
            variant="overline"
            color="textSecondary"
            sx={{ fontWeight: 600, letterSpacing: 1.2 }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              mt: 1,
              mb: 1,
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, color: "#1a1a1a" }}
            >
              {data.name}
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.6 }}>
              ({data.value})
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: data.color,
              }}
            />
             <Typography variant="caption" color="textSecondary">
               Calculado via Matriz
             </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ mb: 4, mt: 2 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: "#374151" }}
      >
        Resultado da Avaliação
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={gridCols}>
          <ResultCard title="RISCO INERENTE" data={resultInherent} />
        </Grid>

        {showResidual && (
          <Grid item xs={12} md={gridCols}>
            <ResultCard title="RISCO RESIDUAL" data={resultResidual} />
          </Grid>
        )}

        {showPlanned && (
          <Grid item xs={12} md={gridCols}>
            <ResultCard title="RISCO PLANEJADO" data={resultPlanned} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ResultadosAvaliacao;