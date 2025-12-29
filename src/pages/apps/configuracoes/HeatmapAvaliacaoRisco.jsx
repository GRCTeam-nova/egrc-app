// HeatmapAvaliacaoRisco.jsx (componente “pai”)
import React, { useState, useMemo } from 'react';
import { Grid} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

import HeatmapOverlayControls from './HeatmapOverlayControls';
import HeatmapMatrix from './HeatmapMatrix';

export default function HeatmapAvaliacaoRisco({ data, nivel }) {
  // 1) Prepara categorias e ranges (igual ao seu original)
  const { probabilityCategories, impactCategories, colorRanges } = useMemo(() => {
    const totalProb = data?.heatMapProbabilities.length || 0;
    const totalImp  = data?.heatMapImpacts.length    || 0;
    const probs = Array(totalProb).fill('');
    const imps  = Array(totalImp ).fill('');
    (data.heatMapQuadrants || []).forEach(q => {
      const [r,c] = q.coordinate.split(':').map(Number);
      if (r===0 && c<totalProb) probs[c] = q.probability;
      if (c===0 && r< totalImp ) imps[r]  = q.impact;
    });
    for (let i=0;i<totalProb;i++)
      probs[i] = probs[i] || data.heatMapProbabilities[i]?.name;
    for (let i=0;i<totalImp;i++)
      imps[i]  = imps[i]  || data.heatMapImpacts[i]?.name;
    const ranges = data?.heatMapRanges.map(r=>({
      from: r.start, to: r.end, color: r.color
    })) || [];
    return {
      probabilityCategories: probs,
      impactCategories: imps,
      colorRanges: ranges
    };
  }, [data]);

  // 2) Estado dos sobrepostos
  const [si, setSi] = useState({prob:null,impact:null});
  const [sr, setSr] = useState({prob:null,impact:null});
  const [sp, setSp] = useState({prob:null,impact:null});
  const [justificativa, setJustificativa] = useState('');

  // 3) Monta o array de chips que devem aparecer
  const chipsSelections = useMemo(() => {
    const arr = [{ tipo:'SI', sel:si }];
    if (nivel>=2) arr.push({ tipo:'SR', sel:sr });
    if (nivel>=3) arr.push({ tipo:'SP', sel:sp });
    return arr.filter(c => c.sel.prob && c.sel.impact);
  }, [si,sr,sp,nivel]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <HeatmapOverlayControls
            probabilityCategories={probabilityCategories}
            impactCategories={impactCategories}
            nivel={nivel}
            si={si} setSi={setSi}
            sr={sr} setSr={setSr}
            sp={sp} setSp={setSp}
            justificativa={justificativa}
            setJustificativa={setJustificativa}
          />
        </Grid>
        {probabilityCategories.length > 0 && (
          <Grid item xs={12}>
            <HeatmapMatrix
              data={data}
              probabilityCategories={probabilityCategories}
              impactCategories={impactCategories}
              colorRanges={colorRanges}
              chipsSelections={chipsSelections}
            />
          </Grid>
        )}
      </Grid>
    </LocalizationProvider>
  );
}
