import PropTypes from 'prop-types';

// material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from '../../../components/@extended/Avatar';
import { PopupTransition } from '../../../components/@extended/Transitions';

import { deleteCustomer } from '../../../api/customer';
import { openSnackbar } from '../../../api/snackbar';

// assets
import { DeleteFilled } from '@ant-design/icons';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertCustomerDelete({ id, open, handleClose }) {
  const deletehandler = async () => {
    await deleteCustomer(id).then(() => {
      openSnackbar({
        open: true,
        message: 'Customer deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      });
      handleClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              Você tem certeza?
            </Typography>
            <Typography align="center">
              Ao deletar o 
              
              registro, tudo relacionado a ele será deletado.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancelar
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deletehandler} autoFocus>
              Deletar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertCustomerDelete.propTypes = {
  id: PropTypes.any,
  title: PropTypes.any,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
