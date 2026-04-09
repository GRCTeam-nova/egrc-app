
// material-ui
import {  Stack, Typography } from '@mui/material';

import packageJson from '../../../package.json';

const Footer = () => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 16px 0px', mt: 'auto' }}>
    <Typography variant="caption">&copy; Copyright e-Xyon - Versão {packageJson.version}</Typography>
    
  </Stack>
);

export default Footer;
