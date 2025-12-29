import { 
  Box, 
  Grid,
} from '@mui/material';

// Import dos Gráficos
import AssetsProcessChart from './ActiveProcessChart';
import AssetsDepartmentChart from './ActiveDepartmentChart';

const ActiveDashboard = () => {

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AssetsProcessChart />
        </Grid>
        <Grid item xs={12}>
          <AssetsDepartmentChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActiveDashboard;