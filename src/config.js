// Defina manualmente a variável para alternar entre os ambientes, sendo eles 'dev' ou 'hom'
const ambiente = 'hom';

let API_COMMAND, API_QUERY;

if (ambiente === 'dev') {
  API_COMMAND = 'http://10.0.72.13:5030';
  API_QUERY = 'http://10.0.72.13:5020';
} else if (ambiente === 'hom') {
  API_COMMAND = 'http://10.0.72.13:5030';
  API_QUERY = 'http://10.0.72.13:5020';
}
export const API_URL =
  process.env.REACT_APP_API_URL || process.env.EGRC_API_URL_URL || 'https://api.egrc.homologacao.com.br/api/v1/';
export const EGRC_COLLABORA_URL =
  process.env.REACT_APP_EGRC_COLLABORA_URL || process.env.EGRC_COLLABORA_URL || 'https://clbr.egrc.homologacao.com.br';
export { API_COMMAND, API_QUERY };

// ==============================|| CONFIGURAÇÕES DO MANTIS (TEMPLATE) ||============================== //

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';

export const APP_DEFAULT_PATH = '/dashboard/resumo';
export const HORIZONTAL_MAX_ITEM = 7;
export const DRAWER_WIDTH = 250;
export const MINI_DRAWER_WIDTH = 60;

export const NavActionType = {
  FUNCTION: 'function',
  LINK: 'link'
};

export const SimpleLayoutType = {
  SIMPLE: 'simple',
  LANDING: 'landing'
};

export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const MenuOrientation = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

export const ThemeDirection = {
  LTR: 'ltr',
  RTL: 'rtl'
};

// ==============================|| THEME CONFIG ||============================== //

const config = {
  /**
   * The props used for the theme font-style.
   * We provide static below options -
   * `'Inter', sans-serif`
   * `'Poppins', sans-serif`
   * `'Roboto', sans-serif`
   * `'Public Sans', sans-serif` (default)
   */
  fontFamily: `'Public Sans', sans-serif`,

  /**
   * The props used for display menu-items with multi-language.
   * We provide static below languages according to 'react-intl' options - https://www.npmjs.com/package/react-intl
   * 'en' (default)
   * 'fr'
   * 'ro'
   * 'zh'
   */
  i18n: 'en',

  /**
   * the props used for menu orientation (diffrent theme layout).
   * we provide static below options -
   * 'vertical' (default) - MenuOrientation.VERTICAL
   * 'horizontal' - MenuOrientation.HORIZONTAL
   */
  menuOrientation: MenuOrientation.VERTICAL,

  /**
   * the props used for show mini variant drawer
   * the mini variant is recommended for apps sections that need quick selection access alongside content.
   * default - false
   */
  miniDrawer: false,

  /**
   * the props used for theme container.
   * the container centers your content horizontally. It's the most basic layout element.
   * default - true which show container
   * false - will show fluid
   */
  container: true,

  /**
   * the props used for default theme palette mode
   * explore the default theme
   * below theme options -
   * 'light' (default) - ThemeMode.LIGHT
   * 'dark' - ThemeMode.DARK
   */
  mode: ThemeMode.LIGHT,

  /**
   * the props used for theme primary color variants
   * we provide static below options thoe s are already defaine in src/themes/theme -
   * 'default'
   * 'theme1'
   * 'theme2'
   * 'theme3'
   * 'theme4'
   * 'theme5'
   * 'theme6'
   * 'theme7'
   * 'theme8'
   */
  presetColor: 'theme4',

  /**
   * the props used for default theme direction
   * explore the default theme
   * below theme options -
   * 'ltr' (default) - ThemeDirection.LTR
   * 'rtl' - ThemeDirection.RTL
   */
  themeDirection: ThemeDirection.LTR
};

export default config;
