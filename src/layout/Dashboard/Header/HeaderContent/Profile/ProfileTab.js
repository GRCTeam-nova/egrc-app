import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// assets
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    // Busca o id_user salvo no localStorage
    const userId = localStorage.getItem('id_user');

    if (userId) {
      // Redireciona enviando a estrutura exata que o novoColaborador.js espera (dadosApi)
      navigate('/colaboradores/criar', {
        state: {
          dadosApi: { idCollaborator: userId },
          indoPara: "EditarPerfil"
        }
      });
    } else {
      console.warn("ID do usuário não encontrado no localStorage.");
      // Opcional: Adicionar um alerta (enqueueSnackbar) avisando que o ID não foi encontrado
    }
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton 
        onClick={handleEditClick}
        sx={{
          borderRadius: 1.5,
          mb: 0.5,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'primary.lighter', // Fundo azul claro ao passar o mouse
            color: 'primary.main',      // Ícone e texto azuis
            '& .MuiListItemIcon-root': { color: 'primary.main' }
          }
        }}
      >
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Editar Meu Perfil</Typography>} 
        />
      </ListItemButton>

      <ListItemButton 
        onClick={handleLogout}
        sx={{
          borderRadius: 1.5,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'error.lighter', // Fundo vermelho claro para perigo (logout)
            color: 'error.main',
            '& .MuiListItemIcon-root': { color: 'error.main' }
          }
        }}
      >
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Sair do Sistema</Typography>} 
        />
      </ListItemButton>
    </List>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func.isRequired
};

export default ProfileTab;