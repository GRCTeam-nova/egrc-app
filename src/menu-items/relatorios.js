// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon, SettingsIcon, AnalyticsIcon };

// Injeta CSS para esconder o item de menu "Editar Cadastro"
// const css = `
//   [data-url="/apps/processos/editar-cadastro"], a[href="/apps/processos/editar-cadastro"], [data-url="/apps/processos/editar-cadastro"], [data-url="/processos/criar-ligado"], a[href="/apps/processos/editar-processo"] , a[href="/processos/criar-ligado"], , a[href="/apps/processos/novo-assunto-judicial"], [data-url="/apps/processos/novo-assunto-judicial"] {
//       display: none;
//   }
// `;

const style = document.createElement('style');
style.type = 'text/css';
// style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// ==============================|| MENU ITEMS - PAGES ||============================== //

const relatorios = {
  id: 'Relatórios',
  title: <FormattedMessage id="Relatórios" />,
  type: 'group',
  children: [
    {
      id: 'Relatórios',
      title: <FormattedMessage id="Relatórios" />,
      type: 'collapse',
      icon: icons.AnalyticsIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Relatório Gerencial" />,
          type: 'item',
          target: "_blank",
          url: 'http://10.0.72.13:4000/realms/NovoGestor_DEV/protocol/openid-connect/auth?response_type=code&state=&client_id=LoginAuthentication&scope=profile&redirect_uri=http://10.0.72.13:3300/api/keycloak/auth',
          
        },
        // {
        //   id: 'customer-list3',
        //   title: <FormattedMessage id="Parâmetros" />,
        //   type: 'item',
        //   url: '/apps/processos/configuracoes-parametros',
        //   // Este item será escondido pelo CSS injetado acima
        // },
        // {
        //   id: 'customer-list4',
        //   title: <FormattedMessage id="Editar Processo" />,
        //   type: 'item',
        //   url: '/apps/processos/editar-processo',
        //   // Este item será escondido pelo CSS injetado acima
        // },
      ]
    },
    
  ]
};

export default relatorios;
