import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/material';

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from '../../../../assets/images/public/logo-main.png';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = ({ open }) => {
  const theme = useTheme();

  return (
    <DrawerHeaderStyled theme={theme} open={open}>
      <Stack direction="row" spacing={1} alignItems="center">
        { open && <img src={Logo} alt="Logo" /> }
      </Stack>
    </DrawerHeaderStyled>
  );
};


DrawerHeader.propTypes = {
  open: PropTypes.bool
};

export default DrawerHeader;
