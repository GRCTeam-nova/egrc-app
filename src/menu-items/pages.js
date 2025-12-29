// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, CorporateFareIcon, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon };

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
      title: <FormattedMessage id="Governança" />,
      type: 'collapse',
      icon: icons.CorporateFareIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Empresas" />,
          type: 'item',
          url: '/empresas/lista',
          
        },
        {
          id: 'customer-list2',
          title: <FormattedMessage id="Departamentos" />,
          type: 'item',
          url: '/departamentos/lista',
          
        },
        {
          id: 'customer-list3',
          title: <FormattedMessage id="Processos" />,
          type: 'item',
          url: '/processos/lista',
        },
        {
          id: 'customer-list4',
          title: <FormattedMessage id="Dados" />,
          type: 'item',
          url: '/dados/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list5',
          title: <FormattedMessage id="Contas" />,
          type: 'item',
          url: '/contas/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        {
          id: 'customer-list6',
          title: <FormattedMessage id="Ativos" />,
          type: 'item',
          url: '/ativos/lista',
          // Este item será escondido pelo CSS injetado acima
        },
        
      ]
    },
    
  ]
};

export default pages;
