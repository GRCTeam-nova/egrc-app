// third-party
import { FormattedMessage } from 'react-intl';

import BalanceIcon from '@mui/icons-material/Balance';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CreateIcon from '@mui/icons-material/Create';
import PublicIcon from '@mui/icons-material/Public';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = { PublicIcon, DollarOutlined, AssessmentIcon, CreateIcon, BookmarkIcon, CorporateFareIcon, LoginOutlined, PhoneOutlined, RocketOutlined, BalanceIcon };

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
  title: <FormattedMessage id="ESG" />,
  type: 'group',
  children: [
    {
      id: 'Empresas',
      title: <FormattedMessage id="Perfil ESG" />,
      type: 'collapse',
      icon: icons.PublicIcon,
      children: [
        {
          id: 'customer-list278',
          title: <FormattedMessage id="ODS" />,
          type: 'item',
          url: '/ods/lista',
          
        },
        {
          id: 'customer-list2345',
          title: <FormattedMessage id="Temas" />,
          type: 'item',
          url: '/tema/lista',
          
        },
        {
          id: 'customer-list24345',
          title: <FormattedMessage id="Grupo temas" />,
          type: 'item',
          url: '/grupoTemas/lista',
          
        },
        {
          id: 'customer-list25345',
          title: <FormattedMessage id="Impacto ESG" />,
          type: 'item',
          url: '/impactoEsg/lista',
          
        },
        {
          id: 'customer-list',
          title: <FormattedMessage id="Perfil ESG" />,
          type: 'item',
          url: '/esg/lista',
          
        },
        {
          id: 'customer-list2',
          title: <FormattedMessage id="Ciclo priorização" />,
          type: 'item',
          url: '/priorizacao/lista',
          
        },
        {
          id: 'customer-list3',
          title: <FormattedMessage id="Indicadores" />,
          type: 'item',
          url: '/indicadores/lista',
          
        },
        {
          id: 'customer-list4',
          title: <FormattedMessage id="Métrica com coleta" />,
          type: 'item',
          url: '/coleta/lista',
          
        },
        {
          id: 'customer-list4',
          title: <FormattedMessage id="Gestão de coleta" />,
          type: 'item',
          url: '/gestaoColeta/lista',
          
        },
        {
          id: 'customer-list34',
          title: <FormattedMessage id="Padrões e frameworks" />,
          type: 'item',
          url: '/padroesFrameworks/lista',
          
        },
        {
          id: 'customer-list344',
          title: <FormattedMessage id="Medidas" />,
          type: 'item',
          url: '/medida/lista',
          
        },
        {
          id: 'customer-list3445',
          title: <FormattedMessage id="Dimensões" />,
          type: 'item',
          url: '/dimensao/lista',
          
        },
        {
          id: 'customer-list34645',
          title: <FormattedMessage id="Fonte de dados" />,
          type: 'item',
          url: '/fonteDeDados/lista',
          
        },
        {
          id: 'customer-list346645',
          title: <FormattedMessage id="Fatores de emissão" />,
          type: 'item',
          url: '/fatoresEmissao/lista',
          
        },
      ]
    },
    
  ]
};

export default pages;
