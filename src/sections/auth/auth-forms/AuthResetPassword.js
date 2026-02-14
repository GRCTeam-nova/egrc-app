import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useAuth from '../../../hooks/useAuth';
import useScriptRef from '../../../hooks/useScriptRef';
import IconButton from '../../../components/@extended/IconButton';
import AnimateButton from '../../../components/@extended/AnimateButton';

import { strengthColor, strengthIndicator } from '../../../utils/password-strength';
import { openSnackbar } from '../../../api/snackbar';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

// ============================|| RESETAR SENHA ||============================ //

const RESET_PASSWORD_URL = 'https://api.egrc.homologacao.com.br/api/v1/accounts/reset-password';

const translateStrengthLabel = (label) => {
  const map = {
    Poor: 'Muito fraca',
    Weak: 'Fraca',
    Normal: 'Média',
    Good: 'Boa',
    Strong: 'Forte'
  };

  return map[label] || label;
};

const AuthResetPassword = () => {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn } = useAuth();

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const { emailFromUrl, tokenFromUrl } = useMemo(() => {
    const params = new URLSearchParams(location.search);

    const email = params.get('email') || '';
    // IMPORTANTE:
    // URLSearchParams costuma interpretar "+" como espaço.
    // Como seu token vem no email com "+" literal (sem %2B),
    // recuperamos substituindo espaços por "+".
    const rawToken = params.get('token') || '';
    const token = rawToken ? rawToken.replace(/ /g, '+') : '';

    return { emailFromUrl: email, tokenFromUrl: token };
  }, [location.search]);

  const missingRequiredParams = !emailFromUrl || !tokenFromUrl;

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    const computed = strengthColor(temp);
    setLevel(
      computed
        ? {
            ...computed,
            label: translateStrengthLabel(computed.label)
          }
        : computed
    );
  };

  useEffect(() => {
    changePassword('');
  }, []);

  useEffect(() => {
    if (missingRequiredParams) {
      openSnackbar({
        open: true,
        message: 'Link inválido ou incompleto. Verifique se você abriu o link correto enviado por e-mail.',
        variant: 'alert',
        alert: { color: 'warning' }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingRequiredParams]);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        password: '',
        confirmPassword: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string().max(255).required('A nova senha é obrigatória.'),
        confirmPassword: Yup.string()
          .required('A confirmação de senha é obrigatória.')
          .test('confirmPassword', 'As senhas não conferem.', (confirmPassword, yup) => yup.parent.password === confirmPassword)
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          if (missingRequiredParams) {
            throw new Error('Link inválido: token ou e-mail ausente.');
          }

          const payload = {
            email: emailFromUrl,
            token: tokenFromUrl,
            password: values.password
          };

          const res = await fetch(RESET_PASSWORD_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          // tenta extrair uma mensagem útil do backend
          let errorText = 'Não foi possível redefinir a senha. Tente novamente.';
          if (!res.ok) {
            try {
              const data = await res.json();
              // heurísticas comuns: message / title / errors...
              errorText =
                data?.message ||
                data?.title ||
                (typeof data === 'string' ? data : null) ||
                errorText;
            } catch {
              try {
                const text = await res.text();
                if (text) errorText = text;
              } catch {
                // ignore
              }
            }
            throw new Error(errorText);
          }

          if (scriptedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);

            openSnackbar({
              open: true,
              message: 'Senha redefinida com sucesso! Você será redirecionado para o login.',
              variant: 'alert',
              alert: { color: 'success' }
            });

            setTimeout(() => {
              navigate(isLoggedIn ? '/login' : '/login', { replace: true });
            }, 1500);
          }
        } catch (err) {
          console.error(err);
          if (scriptedRef.current) {
            setStatus({ success: false });
            setErrors({ submit: err?.message || 'Erro ao redefinir senha.' });
            setSubmitting(false);

            openSnackbar({
              open: true,
              message: err?.message || 'Erro ao redefinir senha.',
              variant: 'alert',
              alert: { color: 'error' }
            });
          }
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Email (do link) */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="email-reset">E-mail</InputLabel>
                <OutlinedInput
                  fullWidth
                  id="email-reset"
                  type="email"
                  value={emailFromUrl || ''}
                  name="email"
                  disabled
                  placeholder="E-mail do link"
                />
              </Stack>
              {missingRequiredParams && (
                <FormHelperText error id="helper-text-email-reset">
                  Não foi possível identificar e-mail/token no link. Solicite um novo e-mail de redefinição.
                </FormHelperText>
              )}
            </Grid>

            {/* Nova senha */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-reset">Nova senha</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  id="password-reset"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={(e) => {
                    handleChange(e);
                    changePassword(e.target.value);
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="alternar visibilidade da senha"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                  placeholder="Digite a nova senha"
                />
              </Stack>
              {touched.password && errors.password && (
                <FormHelperText error id="helper-text-password-reset">
                  {errors.password}
                </FormHelperText>
              )}

              <FormControl fullWidth sx={{ mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" fontSize="0.75rem">
                      {level?.label}
                    </Typography>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>

            {/* Confirmar senha */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="confirm-password-reset">Confirmar nova senha</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  id="confirm-password-reset"
                  type="password"
                  value={values.confirmPassword}
                  name="confirmPassword"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Confirme a nova senha"
                />
              </Stack>
              {touched.confirmPassword && errors.confirmPassword && (
                <FormHelperText error id="helper-text-confirm-password-reset">
                  {errors.confirmPassword}
                </FormHelperText>
              )}
            </Grid>

            {errors.submit && (
              <Grid item xs={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}

            <Grid item xs={12}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting || missingRequiredParams}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Redefinir senha
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

export default AuthResetPassword;
