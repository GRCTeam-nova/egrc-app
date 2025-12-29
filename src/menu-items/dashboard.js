// assets
import WindowIcon from '@mui/icons-material/Window';
import GroupsIcon from '@mui/icons-material/Groups';
import BalanceIcon from '@mui/icons-material/Balance';

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Painel de Acesso',
  type: 'group',
  children: [
    {
      id: 'painel',
      title: 'Painel',
      type: 'item',
      url: '/dashboard/resumo',
      icon: WindowIcon,
      breadcrumbs: false,
      style: {
        fontFamily: '"Open Sans-Regular", Helvetica',
        fontWeight: 400,
        color: '#1c447c',
        fontSize: '13px',
        letterSpacing: '0',
      },
    },
    {
      id: 'configuracoes',
      title: 'Processos',
      type: 'item',
      url: '/listar-processo',
      icon: BalanceIcon,  // Alteração do ícone aqui
      breadcrumbs: false,
      style: {
        fontFamily: '"Open Sans-Regular", Helvetica',
        fontWeight: 400,
        color: '#1c447c',
        fontSize: '13px',
        letterSpacing: '0',
      },
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      type: 'item',
      url: 'http://10.0.72.13:19000',
      href: 'http://10.0.72.13:19000',
      icon: GroupsIcon,
      breadcrumbs: false,
      style: {
        fontFamily: '"Open Sans-Regular", Helvetica',
        fontWeight: 400,
        color: '#1c447c',
        fontSize: '13px',
        letterSpacing: '0',
      },
    },
  ]
};

export default dashboard;
