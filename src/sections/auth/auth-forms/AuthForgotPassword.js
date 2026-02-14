import { useNavigate } from 'react-router-dom';

// material-ui
import { Button, FormHelperText, Grid, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from '../../../hooks/useScriptRef';
import AnimateButton from '../../../components/@extended/AnimateButton';
import { openSnackbar } from '../../../api/snackbar';

// ============================|| FORGOT PASSWORD (API) ||============================ //

const FORGOT_PASSWORD_URL = 'https://api.egrc.homologacao.com.br/api/v1/collaborators/forgot-password';

async function requestForgotPassword(email) {
  const res = await fetch(FORGOT_PASSWORD_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  if (res.ok) return;

  // tenta extrair mensagem do backend (sem depender do formato exato)
  let message = 'Não foi possível solicitar a recuperação de senha.';
  try {
    const data = await res.json();
    message =
      data?.message ||
      data?.title ||
      (typeof data === 'string' ? data : message);
  } catch (_) {
    // pode não ser JSON
    try {
      const text = await res.text();
      if (text) message = text;
    } catch (_) {
      // ignore
    }
  }

  throw new Error(message);
}

const AuthForgotPassword = () => {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await requestForgotPassword(values.email);

            setStatus({ success: true });
            setSubmitting(false);

            openSnackbar({
              open: true,
              message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
              variant: 'alert',
              alert: { color: 'success' }
            });

            setTimeout(() => {
              navigate('/check-mail', { replace: true });
            }, 1500);
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err?.message || 'Falha ao solicitar recuperação de senha.' });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-forgot">Email</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-forgot"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Digite o email cadastrado"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-forgot">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mb: -2 }}>
                <Typography variant="caption">Não se esqueça de verificar a caixa de SPAM.</Typography>
              </Grid>

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: '#854fff',
                      ':hover': { backgroundColor: '#7143d9' }
                    }}
                  >
                    Recuperar Senha
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForgotPassword;
