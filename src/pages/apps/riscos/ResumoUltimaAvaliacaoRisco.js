import PropTypes from "prop-types";
import { Box, Grid, Paper, Typography } from "@mui/material";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const parseRiskResultValue = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parts = raw.split(" - ");
  if (parts.length < 2) return { name: raw, color: null };

  const colorCandidate = parts[parts.length - 1].trim();
  const name = parts.slice(0, -1).join(" - ").trim();

  if (!name) return null;

  return {
    name,
    color: HEX_COLOR_REGEX.test(colorCandidate) ? colorCandidate : null,
  };
};

const formatConclusionDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
};

const ResultCard = ({ title, value }) => {
  const parsed = parseRiskResultValue(value);

  if (!parsed?.name) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        height: "100%",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          bgcolor: parsed.color || "#d1d5db",
        }}
      />

      <Box sx={{ p: 2, pl: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 1.2 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{
            mt: 1,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          {parsed.name}
        </Typography>
      </Box>
    </Paper>
  );
};

const ResumoUltimaAvaliacaoRisco = ({ assessment }) => {
  if (!assessment) return null;

  const cards = [
    { title: "RISCO INERENTE", value: assessment.resultInherent },
    { title: "RISCO RESIDUAL", value: assessment.resultResidual },
    { title: "RISCO PLANEJADO", value: assessment.resultPlanned },
  ].filter((item) => parseRiskResultValue(item.value)?.name);

  if (cards.length === 0) return null;

  const gridCols = cards.length === 1 ? 12 : cards.length === 2 ? 6 : 4;

  return (
    <Box sx={{ mb: 3, mt: 1 }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, color: "#374151" }}
      >
        Resultado da Ultima Avaliacao Concluida
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ciclo: {assessment.cycle || "-"} | Conclusao:{" "}
        {formatConclusionDate(assessment.dateOfConclusion)}
      </Typography>

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} md={gridCols} key={card.title}>
            <ResultCard title={card.title} value={card.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

ResultCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
};

ResumoUltimaAvaliacaoRisco.propTypes = {
  assessment: PropTypes.shape({
    cycle: PropTypes.string,
    dateOfConclusion: PropTypes.string,
    resultInherent: PropTypes.string,
    resultResidual: PropTypes.string,
    resultPlanned: PropTypes.string,
  }),
};

export default ResumoUltimaAvaliacaoRisco;
