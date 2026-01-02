import { API_URL} from 'config';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  CircularProgress
} from '@mui/material';

// project imports
import MainCard from '../../../components/MainCard';
import { ThemeMode } from '../../../config';

// assets
import {
  UserOutlined,
  CreditCardOutlined,
  LockOutlined,
  TwitterOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

// ==============================|| USER PROFILE - NEW LAYOUT ||============================== //

const UserDetails = ({ onClose }) => {
  const theme = useTheme();
  
  // Estados
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Personal Info, 1: Payment, etc.

  // Busca de Dados da API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('id_user');
        const token = localStorage.getItem('access_token');

        if (!userId) {
          console.error("ID do usuário não encontrado no localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}collaborators/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Erro ao buscar dados do colaborador:", response.status);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return <Typography sx={{ p: 3 }}>Usuário não encontrado.</Typography>;
  }

  // Tratamento de Dados para o Layout
  const names = userData.name ? userData.name.split(' ') : ['', ''];
  const firstName = names[0];
  const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
  
  // Formata data de expiração para usar nos inputs de data (placeholder)
  const expirationDate = userData.accessExpirationDate ? new Date(userData.accessExpirationDate) : new Date();
  const expDay = expirationDate.getDate();
  const expMonth = expirationDate.toLocaleString('pt-BR', { month: 'long' }); // Nome do mês
  const expYear = expirationDate.getFullYear();

  return (
    <Box sx={{ maxWidth: '100%', p: 2 }}>
      
      {/* 1. Top Banner */}
      <Card sx={{ mb: 3, bgcolor: 'primary.lighter', border: 'none', boxShadow: 'none' }}>
        <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                        Perfil do Colaborador
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Visualize as informações detalhadas do usuário.
                    </Typography>
                </Box>
                {/* Círculo de porcentagem visual (Mock) */}
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={60} sx={{ color: 'white' }} />
                    <CircularProgress variant="determinate" value={75} size={60} sx={{ color: 'primary.main', position: 'absolute', left: 0 }} />
                    <Box
                        sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" component="div" color="text.secondary">
                        Active
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        
        {/* 2. Left Sidebar (Profile Card & Navigation) */}
        <Grid item xs={12} md={4} lg={3}>
          <MainCard content={false} sx={{ height: '100%' }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                    alt={userData.name}
                    src={null} // API não retorna foto
                    sx={{ width: 100, height: 100, mb: 2, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 0 0 2px #eee' }}
                />
                <Typography variant="h5">{userData.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {userData.code} | {userData.active ? 'Ativo' : 'Inativo'}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <TwitterOutlined style={{ color: '#1DA1F2', fontSize: '1.2rem' }} />
                    <FacebookOutlined style={{ color: '#4267B2', fontSize: '1.2rem' }} />
                    <LinkedinOutlined style={{ color: '#0077B5', fontSize: '1.2rem' }} />
                </Stack>

                <Divider sx={{ width: '100%', mb: 2 }} />
                
                <Stack direction="row" justifyContent="space-around" width="100%" sx={{ mb: 1 }}>
                    <Box>
                        <Typography variant="h6">0</Typography>
                        <Typography variant="caption" color="textSecondary">Posts</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6">0</Typography>
                        <Typography variant="caption" color="textSecondary">Projetos</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6">0</Typography>
                        <Typography variant="caption" color="textSecondary">Membros</Typography>
                    </Box>
                </Stack>
            </Box>
            
            <Divider />

            {/* Vertical Navigation */}
            <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
              <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
                <ListItemIcon><UserOutlined /></ListItemIcon>
                <ListItemText primary="Informações Pessoais" />
              </ListItemButton>
              <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
                <ListItemIcon><CreditCardOutlined /></ListItemIcon>
                <ListItemText primary="Pagamento" />
              </ListItemButton>
              <ListItemButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
                <ListItemIcon><LockOutlined /></ListItemIcon>
                <ListItemText primary="Segurança" />
              </ListItemButton>
            </List>
          </MainCard>
        </Grid>

        {/* 3. Right Content (Form Details) */}
        <Grid item xs={12} md={8} lg={9}>
          <MainCard title="Informações Pessoais">
            <Grid container spacing={3}>
                
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Primeiro Nome</Typography>
                    <TextField fullWidth defaultValue={firstName} InputProps={{ readOnly: true }} />
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Sobrenome</Typography>
                    <TextField fullWidth defaultValue={lastName} InputProps={{ readOnly: true }} />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Endereço de Email</Typography>
                    <TextField 
                        fullWidth 
                        defaultValue={userData.email} 
                        InputProps={{ 
                            readOnly: true,
                            startAdornment: <InputAdornment position="start"><MailOutlined /></InputAdornment>
                        }} 
                    />
                </Grid>

                {/* Date Fields (Adapted to show Expiration Date since API doesn't give Birth Date) */}
                <Grid item xs={12}>
                     <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Validade do Acesso (Dia / Mês / Ano)</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField fullWidth defaultValue={expDay} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth defaultValue={expMonth} sx={{ textTransform: 'capitalize' }} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth defaultValue={expYear} />
                        </Grid>
                     </Grid>
                </Grid>

                {/* Phone Number (Mocked layout) */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Telefone</Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField sx={{ width: 80 }} defaultValue="+55" />
                        <TextField fullWidth placeholder="Não informado" InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined /></InputAdornment>}} />
                    </Stack>
                </Grid>

                {/* Designation / Code */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Cargo / Designação</Typography>
                    <TextField fullWidth defaultValue={userData.code || "Colaborador"} InputProps={{ readOnly: true }} />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>Endereço</Typography>
                    <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Address Rows (Mocked as per image) */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Endereço 01</Typography>
                    <TextField 
                        fullWidth 
                        placeholder="Não informado pela API" 
                        InputProps={{ startAdornment: <InputAdornment position="start"><EnvironmentOutlined /></InputAdornment> }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Endereço 02</Typography>
                    <TextField fullWidth placeholder="-" />
                </Grid>
            </Grid>
            
            {/* Action Buttons */}
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
                {onClose && <Button variant="outlined" onClick={onClose} color="error">Fechar</Button>}
                <Button variant="contained">Salvar Alterações</Button>
            </Stack>

          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

UserDetails.propTypes = {
  onClose: PropTypes.func
};

export default UserDetails;