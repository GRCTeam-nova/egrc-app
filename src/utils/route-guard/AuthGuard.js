import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import useAuth from '../../hooks/useAuth';
import { AUTH_REDIRECT_REASON, consumeAuthRedirectReason } from '../authRedirect';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      const redirectReason = consumeAuthRedirectReason();

      if (redirectReason === AUTH_REDIRECT_REASON.LOGOUT) {
        navigate('/login', {
          state: {
            reason: AUTH_REDIRECT_REASON.LOGOUT
          },
          replace: true
        });
        return;
      }

      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          reason: AUTH_REDIRECT_REASON.AUTH_REQUIRED
        },
        replace: true
      });
    }
  }, [isLoggedIn, location.pathname, location.search, navigate]);

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
