import { Box, Grid } from '@mui/material';

// Import dos Gráficos
import DataProcessChart from './DataProcessChart';
import DataDepartmentChart from './DataDepartmentChart'; // <--- NOVO IMPORT

const DataDashboard = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      <Grid container spacing={3}>
        
        {/* Gráfico 1: Visão por Processo */}
        <Grid item xs={12} md={6}>
           <DataProcessChart />
        </Grid>

        {/* Gráfico 2: Visão por Departamento */}
        <Grid item xs={12} md={6}>
           <DataDepartmentChart />
        </Grid>

      </Grid>
    </Box>
  );
};

export default DataDashboard;