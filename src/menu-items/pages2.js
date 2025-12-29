// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, SignalCellularAltIcon, CorporateFareIcon, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon };

// Injeta CSS para esconder o item de menu "Editar Cadastro"
const css = `
  [data-url="/apps/processos/editar-cadastro"], a[href="/apps/processos/editar-cadastro"], [data-url="/apps/processos/editar-cadastro"], [data-url="/processos/criar-ligado"], a[href="/apps/processos/editar-processo"] , a[href="/processos/criar-ligado"] {
      display: none;
  }
`;

const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages = {
  id: 'Processos e Fases',
  title: <FormattedMessage id="Dashboard" />,
  type: 'group',
  children: [
    {
      id: 'Dashboard',
      title: <FormattedMessage id="Dashboard" />,
      type: 'collapse',
      icon: icons.SignalCellularAltIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Dashboard" />,
          type: 'item',
          url: '/dashboard/resumo',
          
        },
      ]
    },
    
  ]
};

export default pages;
