// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AssessmentIcon from '@mui/icons-material/Assessment';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { DollarOutlined, AssessmentIcon, CorporateFareIcon, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon };

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
      title: <FormattedMessage id="Controles" />,
      type: 'collapse',
      icon: icons.AssessmentIcon,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Controles" />,
          type: 'item',
          url: '/controles/lista',
          
        },
        {
          id: 'customer-list2',
          title: <FormattedMessage id="Informação da atividade" />,
          type: 'item',
          url: '/ipes/lista',
          
        },
        {
          id: 'customer-list3',
          title: <FormattedMessage id="Objetivos de controle" />,
          type: 'item',
          url: '/objetivos/lista',
          
        },
        {
          id: 'customer-list4',
          title: <FormattedMessage id="Projetos" />,
          type: 'item',
          url: '/projetos/lista',
          
        },
        {
          id: 'customer-list4',
          title: <FormattedMessage id="Testes" />,
          type: 'item',
          url: '/testes/lista',
          
        },
      ]
    },
    
  ]
};

export default pages;
