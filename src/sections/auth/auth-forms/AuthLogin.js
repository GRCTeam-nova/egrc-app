import { API_URL} from 'config';
import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode"; // npm install jwt-decode

// material-ui
import {
  Paper,
  Alert,
  Button,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Pagination,
  Fade,
  Box,
  Typography,
} from "@mui/material";

// third party
import * as Yup from "yup";
import { Formik } from "formik";

// project import
import useScriptRef from "../../../hooks/useScriptRef";
import useAuth from "../../../hooks/useAuth";
import IconButton from "../../../components/@extended/IconButton";
import AnimateButton from "../../../components/@extended/AnimateButton";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToken } from "../../../api/TokenContext";

// assets
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const AuthLogin = ({ isDemo = false }) => {
  const location = useLocation();
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);
  const [tenants, setTenants] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setToken } = useToken();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Atualiza a barra de progresso a cada 100ms (10s / 100 = 100 passos)
  useEffect(() => {
    // Lógica para verificar o parâmetro de URL
    const params = new URLSearchParams(location.search);
    if (params.get('sessionExpired') === 'true') {
      setShowExpiredAlert(true);
    }

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Após 10 segundos, inicia a transição de saída
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleTenantClick = async (idTenant) => {
    try {
      const selectedTenant = tenants.find((tenantOption) => String(tenantOption.idTenant) === String(idTenant));

      if (selectedTenant) {
        localStorage.setItem('selected_tenant', JSON.stringify(selectedTenant));
      } else {
        localStorage.removeItem('selected_tenant');
      }

      // 1) Pegar token atual
      const currentAccessToken = localStorage.getItem("access_token");
  
      // 2) Solicitar token do tenant selecionado
      const tokenResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}accounts/token`,
        { id_tenant: idTenant },
        {
          headers: {
            Authorization: `Bearer ${currentAccessToken}`,
          },
        }
      );
  
      const newToken = tokenResponse.data.access_token;
      localStorage.setItem("access_token", newToken);
      setToken(newToken);
  
      // 3) Login com o novo token
      const loginResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}accounts/login`,
        {},
        {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        }
      );
  
      const finalToken = loginResponse.data.accessToken;
      localStorage.setItem("access_token", finalToken);
      setToken(finalToken);
  
      const decoded = jwt_decode(finalToken);
      const idUser = decoded.idUser 
      localStorage.setItem("id_user", idUser);

      // 4) Buscar dados do colaborador e salvar nome no localStorage
      const collaboratorResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}collaborators/${idUser}`,
        {
          headers: {
            Authorization: `Bearer ${finalToken}`,
          },
        }
      );
      const username = collaboratorResponse.data.name;
      localStorage.setItem("username", username);

      const email = "info@codedthemes.com";
      const password = "123456";
      await login(email, password);
  
      navigate("/dashboard/resumo");
    } catch (error) {
      console.error("Erro no processo de login:", error);
    }
  };

  // Lógica de paginação: 4 tenants por página
  const tenantsPerPage = 4;
  const totalPages = Math.ceil(tenants.length / tenantsPerPage);
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

 return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden',
      overflowY: { xs: 'auto', md: 'hidden' }
    }}
  >
    {/* —— ESQUERDA (dark) —— */}
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
      <Typography
        sx={{
          typography: { xs: 'h4', md: 'h2' },
          fontWeight: 'bold',
          mb: 2
        }}
      >
        GRCTeam
      </Typography>
      <Typography sx={{ typography: { xs: 'body1', md: 'h6' } }}>
        eGRC - Plataforma integrada e colaborativa de GRC e muito mais.
      </Typography>
    </Box>

    {/* —— DIREITA (light) —— */}
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
      {/* container do form/seleção */}
      <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 400 }, mx: 'auto' }}>
          {tenants.length === 0 ? (
            <>
              <Typography variant="h4" sx={{ mb: 3 }}>
	                Entrar
	              </Typography>
                {showExpiredAlert && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Sua sessão expirou. Por favor, faça login novamente.
                  </Alert>
                )}

              <Formik
                initialValues={{ email: '', password: '', submit: null }}
                validationSchema={Yup.object().shape({
                  email: Yup.string()
                    .email('Deve ser um email válido')
                    .max(255)
                    .required('Email é obrigatório'),
                  password: Yup.string()
                    .max(255)
                    .required('Senha é obrigatória')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                  try {
                    const { data } = await axios.post(
                        `${process.env.REACT_APP_API_URL}accounts/tenants`,
                      values
                    );
                    localStorage.setItem('access_token', data.access_token);
                    setTenants(data.tenants);
                    setStatus({ success: true });
                  } catch (err) {
                    setStatus({ success: false });
                    setErrors({
                      submit:
                        err.response?.status === 400
                          ? 'Login inválido'
                          : err.message
                    });
                  }
                  setSubmitting(false);
                }}
              >
                {({
                  errors,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  touched,
                  values
                }) => (
                  <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="email-login">E-mail</InputLabel>
                          <OutlinedInput
                            fullWidth
                            id="email-login"
                            type="email"
                            value={values.email}
                            name="email"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Digite o email"
                            error={Boolean(touched.email && errors.email)}
                          />
                          {touched.email && errors.email && (
                            <FormHelperText error>
                              {errors.email}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="password-login">Senha</InputLabel>
                          <OutlinedInput
                            fullWidth
                            id="password-login"
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Digite a senha"
                            error={Boolean(touched.password && errors.password)}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <EyeOutlined />
                                  ) : (
                                    <EyeInvisibleOutlined />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                          {touched.password && errors.password && (
                            <FormHelperText error>
                              {errors.password}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sx={{ mt: -1 }}>
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                        >
                          <Typography
                            component={RouterLink}
                            to={
                              isDemo
                                ? '/auth/forgot-password'
                                : '/forgot-password'
                            }
                            sx={{
                              textDecoration: 'none',
                              color: '#262626',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            Esqueceu sua senha?
                          </Typography>
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
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                              backgroundColor: '#0f1117',
                              color: '#fff',
                              ':hover': { backgroundColor: '#14151b' }
                            }}
                          >
                            Entrar
                          </Button>
                        </AnimateButton>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            </>
          ) : (
            <Fade in={true} timeout={600}>
          <Box sx={{ p: 1 }}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
              >
                <Typography variant="h3">
                  Selecione uma opção de acesso
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 4, mt: 1 }}
              >
                <Typography variant="h6">
                  Escolha a opção que melhor se adapta ao seu perfil
                </Typography>
              </Stack>
            </Grid>
            <Grid container spacing={2} justifyContent="center">
              {currentTenants.map((tenant) => (
                <Grid item key={tenant.idTenant}>
                  <AnimateButton>
                    <Button
                      variant="outlined"
                      onClick={() => handleTenantClick(tenant.idTenant)}
                      sx={{
                        textTransform: "none",
                        borderColor: "#854fff",
                        color: "#854fff",
                        "&:hover": {
                          backgroundColor: "#854fff",
                          color: "#fff",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {tenant.name}
                    </Button>
                  </AnimateButton>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Stack>
            )}
            {/* Botão para voltar ao login */}
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setTenants([]);
                  setCurrentPage(1);
                }}
                sx={{
                  textTransform: "none",
                  borderColor: "#854fff",
                  color: "#854fff",
                  "&:hover": {
                    backgroundColor: "#854fff",
                    color: "#fff",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Voltar para Login
              </Button>
            </Stack>
          </Box>
        </Fade>
          )}
        </Box>
    </Box>
  </Box>
);

};

AuthLogin.propTypes = {
  isDemo: PropTypes.bool,
};

export default AuthLogin;


