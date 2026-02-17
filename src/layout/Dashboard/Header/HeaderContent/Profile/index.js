import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  ButtonBase,
  CardContent,
  ClickAwayListener,
  Grid,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
  Divider
} from '@mui/material';

// project import
import MainCard from '../../../../../components/MainCard';
import Transitions from '../../../../../components/@extended/Transitions';
import ProfileTab from './ProfileTab';

// assets
import { LogoutOutlined } from '@ant-design/icons';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = () => {
    // Remova os dados do usuário e o token do localStorage
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const iconBackColorOpen = 'grey.300';
  const usernameFromLocalStorage = localStorage.getItem('username');
  
  // Se você quiser mostrar apenas as iniciais:
  const initials = usernameFromLocalStorage ? usernameFromLocalStorage.slice(0, 2).toUpperCase() : "JD"; // "JD" é um fallback

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75, marginRight: 'auto' }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' },
          transition: 'all 0.2s ease-in-out'
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          sx={{ p: 0.5, marginLeft: 'auto' }}
        >
          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1C52971A', color: '#1C5297', fontSize: '0.9rem', fontWeight: 600 }}>
            {initials}
          </Avatar>
        </Stack>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            {open && (
              <Paper
                sx={{
                  boxShadow: theme.customShadows.z1,
                  width: 290,
                  minWidth: 240,
                  maxWidth: 290,
                  borderRadius: 2, // Borda mais arredondada para ar premium
                  overflow: 'hidden',
                  [theme.breakpoints.down('md')]: {
                    maxWidth: 250
                  }
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3, pb: 2 }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 40, height: 40, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                              {initials}
                            </Avatar>
                            <Stack>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {usernameFromLocalStorage || "John Doe"}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <IconButton size="medium" color="error" onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'error.lighter' } }}>
                            <LogoutOutlined />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                    
                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {open && (
                      <Box sx={{ p: 1 }}>
                        <ProfileTab handleLogout={handleLogout} />
                      </Box>
                    )}
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            )}
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;