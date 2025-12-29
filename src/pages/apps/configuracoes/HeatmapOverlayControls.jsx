// HeatmapOverlayControls.jsx
import React from 'react';
import { Grid, InputLabel, Stack, Autocomplete, TextField } from '@mui/material';

export default function HeatmapOverlayControls({
  probabilityCategories,
  impactCategories,
  nivel,
  si, setSi,
  sr, setSr,
  sp, setSp,
  justificativa, setJustificativa
}) {
  return (
    <Grid container spacing={1} marginTop={2}>
      {/* Inerente (SI) */}
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Probabilidade Inerente</InputLabel>
          <Autocomplete
            options={probabilityCategories}
            value={si.prob}
            onChange={(_, v) => setSi({ ...si, prob: v })}
            renderInput={params => <TextField {...params} variant="outlined" />}
          />
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Impacto Inerente</InputLabel>
          <Autocomplete
            options={impactCategories}
            value={si.impact}
            onChange={(_, v) => setSi({ ...si, impact: v })}
            renderInput={params => <TextField {...params} variant="outlined" />}
          />
        </Stack>
      </Grid>

      {/* Residual (SR), nível ≥ 2 */}
      {nivel >= 2 && <>
        <Grid item xs={6} sx={{ pb: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Probabilidade Residual</InputLabel>
            <Autocomplete
              options={probabilityCategories}
              value={sr.prob}
              onChange={(_, v) => setSr({ ...sr, prob: v })}
              renderInput={params => <TextField {...params} variant="outlined" />}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ pb: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Impacto Residual</InputLabel>
            <Autocomplete
              options={impactCategories}
              value={sr.impact}
              onChange={(_, v) => setSr({ ...sr, impact: v })}
              renderInput={params => <TextField {...params} variant="outlined" />}
            />
          </Stack>
        </Grid>
      </>}

      {/* Planejada (SP), nível ≥ 3 */}
      {nivel >= 3 && <>
        <Grid item xs={6} sx={{ pb: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Probabilidade Planejada</InputLabel>
            <Autocomplete
              options={probabilityCategories}
              value={sp.prob}
              onChange={(_, v) => setSp({ ...sp, prob: v })}
              renderInput={params => <TextField {...params} variant="outlined" />}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ pb: 5 }}>
          <Stack spacing={1}>
            <InputLabel>Impacto Planejada</InputLabel>
            <Autocomplete
              options={impactCategories}
              value={sp.impact}
              onChange={(_, v) => setSp({ ...sp, impact: v })}
              renderInput={params => <TextField {...params} variant="outlined" />}
            />
          </Stack>
        </Grid>
      </>}

      {/* Justificativa */}
      <Grid item xs={12} sx={{ pb: 5 }}>
        <Stack spacing={1}>
          <InputLabel>Justificativa</InputLabel>
          <TextField
            fullWidth multiline rows={4}
            value={justificativa}
            onChange={e => setJustificativa(e.target.value)}
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
