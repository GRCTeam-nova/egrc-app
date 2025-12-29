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
  title: <FormattedMessage id="Processos" />,
  type: 'group',
  children: [
    {
      id: 'Processos',
      title: <FormattedMessage id="Riscos" />,
      type: 'collapse',
      icon: icons.WarningAmberIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Riscos" />,
          type: 'item',
          url: '/riscos/lista',
          
        },
        {
          id: 'customer-list3',
          title: <FormattedMessage id="Ciclos de avaliação" />,
          type: 'item',
          url: '/ciclos/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list13',
          title: <FormattedMessage id="Avaliação de risco" />,
          type: 'item',
          url: '/avaliacoes/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list5',
          title: <FormattedMessage id="Índice" />,
          type: 'item',
          url: '/indices/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        
        {
          id: 'customer-list7',
          title: <FormattedMessage id="Incidentes" />,
          type: 'item',
          url: '/incidentes/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list8',
          title: <FormattedMessage id="Categorias" />,
          type: 'item',
          url: '/categorias/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list9',
          title: <FormattedMessage id="Perfil de análise" />,
          type: 'item',
          url: '/perfis/lista',
          // Este item será escondido pelo CSS injetado acima
        },
      ]
    },
    
  ]
};

export default pages;
