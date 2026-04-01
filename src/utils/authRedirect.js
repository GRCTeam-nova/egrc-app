export const AUTH_REDIRECT_REASON = {
  AUTH_REQUIRED: 'auth-required',
  LOGOUT: 'logout'
};

const AUTH_REDIRECT_REASON_KEY = 'egrc_auth_redirect_reason';

export const setAuthRedirectReason = (reason) => {
  window.sessionStorage.setItem(AUTH_REDIRECT_REASON_KEY, reason);
};

export const consumeAuthRedirectReason = () => {
  const reason = window.sessionStorage.getItem(AUTH_REDIRECT_REASON_KEY);

  if (reason) {
    window.sessionStorage.removeItem(AUTH_REDIRECT_REASON_KEY);
  }

  return reason;
};

export const clearAuthRedirectReason = () => {
  window.sessionStorage.removeItem(AUTH_REDIRECT_REASON_KEY);
};
