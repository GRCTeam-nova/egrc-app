import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import { APP_DEFAULT_PATH } from '../../config';
import useAuth from '../../hooks/useAuth';
import { AUTH_REDIRECT_REASON } from '../authRedirect';

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthRedirect = location.state?.reason === AUTH_REDIRECT_REASON.AUTH_REQUIRED;

    if (isLoggedIn && !isAuthRedirect) {
      navigate(APP_DEFAULT_PATH, { replace: true });
    }
  }, [isLoggedIn, location.state, navigate]);

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
