// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, LoginOutlined, WarningAmberIcon, PhoneOutlined, RocketOutlined, BalanceIcon, SettingsIcon };

// Injeta CSS para esconder o item de menu "Editar Cadastro"
const css = `
  [data-url="/apps/processos/editar-cadastro"], a[href="/apps/processos/editar-cadastro"], [data-url="/apps/processos/editar-cadastro"], [data-url="/processos/criar-ligado"], a[href="/apps/processos/editar-processo"] , a[href="/processos/criar-ligado"], , a[href="/apps/processos/novo-assunto-judicial"], [data-url="/apps/processos/novo-assunto-judicial"] {
      display: none;
  }
`;

const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages = {
  id: 'Configurações e Parametrização',
  title: <FormattedMessage id="Configurações" />,
  type: 'group',
  children: [
    {
      id: 'Configurações',
      title: <FormattedMessage id="Configurações" />,
      type: 'collapse',
      icon: icons.SettingsIcon,
      children: [
        {
          id: 'customer-list5464',
          title: <FormattedMessage id="Colaboradores" />,
          type: 'item',
          url: '/riscos/lista',
          
        },
        {
          id: 'customer-list3342',
          title: <FormattedMessage id="Perfi" />,
          type: 'item',
          url: '/ciclos/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list1463',
          title: <FormattedMessage id="Acesso" />,
          type: 'item',
          url: '/avaliacoes/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list43545',
          title: <FormattedMessage id="Logs" />,
          type: 'item',
          url: '/indices/lista',
          // Este item será escondido pelo CSS injetado acima
        },
      ]
    },
    
  ]
};

export default pages;
