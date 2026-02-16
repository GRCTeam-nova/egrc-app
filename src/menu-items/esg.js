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
          id: '546543565',
          title: <FormattedMessage id="ODS" />,
          type: 'item',
          url: '/ods/lista',
          
        },
        {
          id: '45466576',
          title: <FormattedMessage id="Temas" />,
          type: 'item',
          url: '/tema/lista',
          
        },
        {
          id: '45678976543',
          title: <FormattedMessage id="Grupo temas" />,
          type: 'item',
          url: '/grupoTemas/lista',
          
        },
        {
          id: '45467654',
          title: <FormattedMessage id="Impacto ESG" />,
          type: 'item',
          url: '/impactoEsg/lista',
          
        },
        {
          id: '3456786',
          title: <FormattedMessage id="Perfil ESG" />,
          type: 'item',
          url: '/esg/lista',
          
        },
        {
          id: '9876543',
          title: <FormattedMessage id="Ciclo priorização" />,
          type: 'item',
          url: '/priorizacao/lista',
          
        },
        {
          id: '345467',
          title: <FormattedMessage id="Indicadores" />,
          type: 'item',
          url: '/indicadores/lista',
          
        },
        {
          id: '098765554768',
          title: <FormattedMessage id="Métrica com coleta" />,
          type: 'item',
          url: '/coleta/lista',
          
        },
        {
          id: '324567887654',
          title: <FormattedMessage id="Gestão de coleta" />,
          type: 'item',
          url: '/gestaoColeta/lista',
          
        },
        {
          id: '55786754652',
          title: <FormattedMessage id="Padrões e frameworks" />,
          type: 'item',
          url: '/padroesFrameworks/lista',
          
        },
        {
          id: '345657898',
          title: <FormattedMessage id="Medidas" />,
          type: 'item',
          url: '/medida/lista',
          
        },
        {
          id: '3243567897',
          title: <FormattedMessage id="Dimensões" />,
          type: 'item',
          url: '/dimensao/lista',
          
        },
        {
          id: '345685765343',
          title: <FormattedMessage id="Fonte de dados" />,
          type: 'item',
          url: '/fonteDeDados/lista',
          
        },
        {
          id: '4356786654',
          title: <FormattedMessage id="Fatores de emissão" />,
          type: 'item',
          url: '/fatoresEmissao/lista',
          
        },
      ]
    },
    
  ]
};

export default pages;
