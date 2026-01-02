const DEFAULTS = {
  EGRC_API_URL_URL: 'https://api.egrc.homologacao.com.br/api/v1/',
  EGRC_COLLABORA_URL: 'https://clbr.egrc.homologacao.com.br',
  MAPBOX_ACCESS_TOKEN: '',
  BASE_NAME: '',
  GOOGLE_MAPS_API_KEY: '',
  LO_BASE_URL: 'https://clbr.egrc.homologacao.com.br'
};

function readWindowEnv() {
  if (typeof window === 'undefined') return {};
  return window.__ENV__ || {};
}

export function getRuntimeEnv(key) {
  const winEnv = readWindowEnv();
  const value = winEnv[key];

  if (typeof value === 'string' && value.length > 0) return value;
  return DEFAULTS[key];
}

export function getApiBaseUrl() {
  return getRuntimeEnv('EGRC_API_URL_URL');
}

export function getCollaboraUrl() {
  return getRuntimeEnv('EGRC_COLLABORA_URL');
}

export function getMapboxAccessToken() {
  return getRuntimeEnv('MAPBOX_ACCESS_TOKEN');
}

export function getBaseName() {
  return getRuntimeEnv('BASE_NAME');
}

export function getGoogleMapsApiKey() {
  return getRuntimeEnv('GOOGLE_MAPS_API_KEY');
}

export function getLibreOfficeBaseUrl() {
  return getRuntimeEnv('LO_BASE_URL');
}
