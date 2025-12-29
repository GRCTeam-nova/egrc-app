// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, AssessmentIcon, BookmarkIcon, CorporateFareIcon, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon };

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
  title: <FormattedMessage id="Empresas" />,
  type: 'group',
  children: [
    {
      id: 'Empresas',
      title: <FormattedMessage id="Normativos" />,
      type: 'collapse',
      icon: icons.BookmarkIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Normativos" />,
          type: 'item',
          url: '/normativas/lista',
          
        },
      ]
    },
    
  ]
};

export default pages;
