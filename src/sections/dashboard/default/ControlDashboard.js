import { 
  Box, 
  Grid,
} from '@mui/material';

// Import dos Gráficos
import ControlAnalysisDashboard from './ControlAnalysisDashboard';

const ControlDashboard = () => {

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ControlAnalysisDashboard />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ControlDashboard;