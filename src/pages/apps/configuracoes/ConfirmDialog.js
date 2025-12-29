import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

const ConfirmDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiPaper-root': {
          width: '547px',
          height: '240px',
          maxWidth: 'none',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: '#FAAD14CC',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            aria-label="alert"
            sx={{ fontSize: "16px", marginRight: '2px', color: 'rgba(255, 255, 255, 1)' }}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </IconButton>
          <Typography
            variant="body1"
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 1)',
              flexGrow: 1,
            }}
          >
            Alerta
          </Typography>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'rgba(255, 255, 255, 1)' }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography component="div" style={{ fontWeight: 'bold', marginTop: "35px", color: '#717171' }}>
          Tem certeza que deseja sair sem salvar as alterações?
        </Typography>
        <Typography component="div" style={{ marginTop: '20px' }}>
          Ao realizar essa ação, todas as alterações serão perdidas.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onConfirm}
          color="primary"
          autoFocus
          style={{
            marginTop: "-55px",
            width: "162px",
            height: "32px",
            background: '#FBBD43',
            fontSize: '13px',
            fontWeight: 600,
            color: '#fff',
            textTransform: 'none'
          }}
        >
          Sim, tenho certeza
        </Button>
        <Button
          onClick={onClose}
          style={{
            marginTop: "-55px",
            width: "91px",
            height: "32px",
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.40)',
            background: '#FFF',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.60)',
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
