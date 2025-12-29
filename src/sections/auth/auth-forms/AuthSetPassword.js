import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// material-ui
import {
  Box,
  Button,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  InputAdornment,
  FormHelperText,
  Alert,
  Fade
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import IconButton from '../../../components/@extended/IconButton';
import AnimateButton from '../../../components/@extended/AnimateButton';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const AuthSetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Armazena os parâmetros vindos do link do e-mail
  const [urlParams, setUrlParams] = useState({ token: '', email: '', idUser: '' });
  const [errorMessage, setErrorMessage] = useState('');

  // Ao carregar, captura token e email da URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');
    const idUser = query.get('id');

    if (!token) {
      setErrorMessage('Link inválido ou expirado. Verifique o e-mail recebido.');
    }

    setUrlParams({ 
        token: token || '', 
        email: email || '',
        idUser: idUser || ''
    });
  }, [location]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}
    >
      {/* —— LADO ESQUERDO (Identidade Visual) —— */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          bgcolor: '#202533',
          color: '#fff',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 2, sm: 6 }
        }}
      >
        <Typography sx={{ typography: { xs: 'h4', md: 'h2' }, fontWeight: 'bold', mb: 2 }}>
          GRCTeam
        </Typography>
        <Typography sx={{ typography: { xs: 'body1', md: 'h6' } }}>
          Defina sua senha de acesso com segurança.
        </Typography>
      </Box>

      {/* —— LADO DIREITO (Formulário) —— */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 0 }
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Fade in={true}>
            <Box>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Criar Nova Senha
              </Typography>

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorMessage}
                </Alert>
              )}

              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: '',
                  submit: null
                }}
                validationSchema={Yup.object().shape({
                  password: Yup.string()
                    .max(255)
                    .required('A senha é obrigatória')
                    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
                  confirmPassword: Yup.string()
                    .required('Confirme a senha')
                    .oneOf([Yup.ref('password'), null], 'As senhas não conferem')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                  try {
                    // Chamada ao endpoint que o backend mencionou no áudio
                    // O endpoint final exato deve ser confirmado com ele, mas a estrutura é essa:
                    await axios.post(
                      'https://api.egrc.homologacao.com.br/api/v1/accounts/reset-password',
                      {
                        token: urlParams.token,
                        email: urlParams.email, // ou idUser dependendo do backend
                        password: values.password,
                        confirmPassword: values.confirmPassword
                      }
                    );

                    setStatus({ success: true });
                    setSubmitting(false);
                    
                    alert('Senha definida com sucesso!');
                    navigate('/auth/login'); // Redireciona para o login

                  } catch (err) {
                    setStatus({ success: false });
                    setErrors({ submit: err.response?.data?.message || err.message });
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                  <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      
                      {/* Senha */}
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="password-set">Nova Senha</InputLabel>
                          <OutlinedInput
                            fullWidth
                            error={Boolean(touched.password && errors.password)}
                            id="password-set"
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Digite a nova senha"
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                >
                                  {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                          {touched.password && errors.password && (
                            <FormHelperText error>{errors.password}</FormHelperText>
                          )}
                        </Stack>
                      </Grid>

                      {/* Confirmar Senha */}
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="confirm-password-set">Confirmar Senha</InputLabel>
                          <OutlinedInput
                            fullWidth
                            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                            id="confirm-password-set"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={values.confirmPassword}
                            name="confirmPassword"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Repita a senha"
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowConfirmPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                          {touched.confirmPassword && errors.confirmPassword && (
                            <FormHelperText error>{errors.confirmPassword}</FormHelperText>
                          )}
                        </Stack>
                      </Grid>

                      {errors.submit && (
                        <Grid item xs={12}>
                          <Alert severity="error">{errors.submit}</Alert>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <AnimateButton>
                          <Button
                            disableElevation
                            disabled={isSubmitting || !urlParams.token} // Bloqueia se não tiver token
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            sx={{
                              backgroundColor: '#0f1117',
                              color: '#fff',
                              ':hover': { backgroundColor: '#14151b' }
                            }}
                          >
                            Redefinir Senha
                          </Button>
                        </AnimateButton>
                      </Grid>

                      <Grid item xs={12}>
                         <Stack direction="row" justifyContent="center">
                            <Typography component={RouterLink} to="/auth/login" variant="body1" sx={{ textDecoration: 'none', color: '#1890ff' }}>
                               Voltar para Login
                            </Typography>
                         </Stack>
                      </Grid>

                    </Grid>
                  </form>
                )}
              </Formik>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthSetPassword;