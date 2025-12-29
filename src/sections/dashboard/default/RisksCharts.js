import { 
  Box, 
  Grid,
} from '@mui/material';

// Import dos Gráficos
import RiskAnalysisDashboard from './RiskAnalysisDashboard';

const RiskDashboard = () => {

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RiskAnalysisDashboard />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskDashboard;