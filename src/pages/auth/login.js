// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from '../../hooks/useAuth';
import AuthWrapper from '../../sections/auth/AuthWrapper';
import AuthLogin from '../../sections/auth/auth-forms/AuthLogin';

// ================================|| LOGIN ||================================ //

const Login = () => {
  const { isLoggedIn } = useAuth();

  return (
    <AuthLogin isDemo={isLoggedIn} />
  );
};

export default Login;
