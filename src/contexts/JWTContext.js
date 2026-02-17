import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

import jwtDecode from 'jwt-decode';

import { LOGIN, LOGOUT } from '../contexts/auth-reducer/actions';
import authReducer from '../contexts/auth-reducer/auth';

import Loader from '../components/Loader';
import axios from '../utils/axios';

const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};


const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Dentro de JWTContext.js, no seu useEffect inicial:

useEffect(() => {
  const init = async () => {
    try {
      // 1. Identificamos se a rota atual é de recuperação/segurança
      const currentPath = window.location.pathname;
      const isAuthRecoveryRoute = 
        currentPath.includes('/reset-password') || 
        currentPath.includes('/forgot-password') || 
        currentPath.includes('/check-mail') ||
        currentPath.includes('/primeiro-acesso');

      const serviceToken = window.localStorage.getItem('access_token');

      // 2. Só tentamos buscar os dados do usuário se houver token E não for rota de recuperação
      if (serviceToken && verifyToken(serviceToken) && !isAuthRecoveryRoute) {
        setSession(serviceToken);
        const idUser = localStorage.getItem('id_user');
        
        let user = null;
        
        if(idUser) {
           const response = await axios.get(`/collaborators/${idUser}`); 
           user = response.data;
        } else {
           const response = await axios.get('/api/account/me');
           user = response.data.user;
        }

        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user
          }
        });
      } else {
        // 3. Se for rota de recuperação, garantimos que não haja "sujeira" da sessão anterior
        if (isAuthRecoveryRoute) {
           setSession(null); 
        }
        dispatch({ type: LOGOUT });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: LOGOUT });
    }
  };

  init();
}, []);

  const directLogin = (token, userData) => {
    setSession(token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: userData
      }
    });
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('id_user');
    localStorage.removeItem('username');
    dispatch({ type: LOGOUT });
  };

  const register = async () => {}; 
  const resetPassword = async () => {};
  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider 
      value={{ 
        ...state, 
        login: directLogin,
        logout, 
        register, 
        resetPassword, 
        updateProfile 
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
