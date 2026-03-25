import PropTypes from "prop-types";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// project import
import useAuth from "../../hooks/useAuth";
import { savePostLoginRedirect } from "../authRedirect";

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      const redirectPath = location.pathname + location.search;

      savePostLoginRedirect(redirectPath);

      navigate("/login", {
        state: {
          from: redirectPath,
        },
        replace: true,
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default AuthGuard;
