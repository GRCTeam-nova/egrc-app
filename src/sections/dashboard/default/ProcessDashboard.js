import { Box, Grid } from "@mui/material";

// Import dos Gráficos
import ProcessRiskChart from "./ProcessRiskChart"; // <--- NOVO IMPORT
import ProcessControlChart from "./ProcessControlChart";
import ProcessNormativeChart from "./NormativeProcessChart";
import ProcessLgpdChart from "./LgpdProcessChart";
import ProcessAccountChart from "./ProcessAccounts";

const ProcessDashboard = () => {
  return (
    <Box sx={{ p: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Grid container spacing={3}>
        {/* Linha 1: Fluxo Hierárquico (Topo) */}
        {/* <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Fluxo Hierárquico</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Visão estrutural dos macroprocessos. Clique nos nós para ver detalhes.
                    </Typography>
                </Box>
                <ProcessFlowChart />
            </Paper>
        </Grid> */}

        {/* Linha 2: Riscos e (Espaço Futuro) */}
        <Grid item xs={12} md={6}>
          {/* Novo Gráfico de Riscos por Processo */}
          <ProcessRiskChart />
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Substitui o Paper vazio pelo gráfico */}
          <ProcessControlChart />
        </Grid>
        <Grid item xs={12} md={12}>
          {/* Substitui o Paper vazio pelo gráfico */}
          <ProcessNormativeChart />
        </Grid>
        <Grid item xs={12} md={12}>
          {/* Substitui o Paper vazio pelo gráfico */}
          <ProcessLgpdChart />
        </Grid>
        <Grid item xs={12} md={12}>
          {/* Substitui o Paper vazio pelo gráfico */}
          <ProcessAccountChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProcessDashboard;
