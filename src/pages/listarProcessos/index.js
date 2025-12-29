import { Grid, Typography } from '@mui/material';

// project import
import AnalyticEcommerce2 from '../../components/cards/statistics/AnalyticEcommerce2';

const DashboardDefault2 = () => {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={{ xs: 1, sm: 2.5 }}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography 
          variant="h5" 
          sx={{
            color: "#1C5297",
            fontFamily: '"Open Sans-Light", Helvetica',
            fontSize: "18px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal"
          }}>
          Fases
        </Typography>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Conhecimento2" count="1000" />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Recursal" count="600" />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Liminar" count="400" />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Cumprimento de sentença" count="240" />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Instrutória" count="800" />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <AnalyticEcommerce2 title="Arquivados" count="100" />
      </Grid>
    </Grid>
  );
};

export default DashboardDefault2;
