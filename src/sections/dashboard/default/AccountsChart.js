import { 
  Box, 
  Grid} from '@mui/material';

// Import dos Gráficos
import AccountsProcesses from './AccountProcesses'; // <--- NOVO

const AccountsDashboard = () => {


  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AccountsProcesses />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountsDashboard;