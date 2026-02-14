import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Grid,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// project import
import useAuth from '../../hooks/useAuth';
import AnimateButton from '../../components/@extended/AnimateButton';
import AuthWrapper from '../../sections/auth/AuthWrapper';

// ================================|| CHECK MAIL ||================================ //

const CheckMail = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoggedIn } = useAuth();

  return (
    <AuthWrapper>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            {/* Faixa superior “decorativa” */}
            <Box
              sx={{
                height: 8,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              }}
            />

            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack spacing={2.25} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: theme.palette.action.hover
                  }}
                >
                  <MailOutlineIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                </Box>

                <Box>
                  <Typography
                    variant={matchDownSM ? 'h4' : 'h3'}
                    sx={{ fontWeight: 700, letterSpacing: -0.3 }}
                  >
                    Confira seu e-mail
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Enviamos as instruções para redefinir sua senha para o seu e-mail.
                  </Typography>
                </Box>

                <Alert
                  severity="info"
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 2
                  }}
                >
                  Se não encontrar a mensagem, verifique <b>Spam</b> / <b>Lixo eletrônico</b> e aguarde alguns minutos.
                </Alert>

                <AnimateButton style={{ width: '100%' }}>
                  <Button
                    component={Link}
                    to={isLoggedIn ? '/auth/login' : '/login'}
                    disableElevation
                    fullWidth
                  
                    size="large"
                    type="button"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, py: 1.25, textTransform: 'none' }}
                  >
                    Voltar para o login
                  </Button>
                </AnimateButton>

                <Typography variant="caption" color="text.secondary">
                  Dica: procure por palavras como “redefinir senha” ou o nome do sistema na busca do seu e-mail.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default CheckMail;
