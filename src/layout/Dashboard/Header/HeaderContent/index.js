import React, {  } from 'react';
import { Box, useMediaQuery, Button, IconButton, Typography, Dialog } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { ArrowBack } from '@mui/icons-material';
import ConfirmDialog from '../../../../pages/apps/configuracoes/ConfirmDialog';

// Importações do projeto
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Notification from './Notification';
import FullScreen from './FullScreen';
import Customization from './Customization';
import MobileSection from './MobileSection';
import { useLocation } from 'react-router-dom';
import useConfig from '../../../../hooks/useConfig';
import DrawerHeader from '../../../../layout/Dashboard/Drawer/DrawerHeader';

import { MenuOrientation } from '../../../../config';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
// Importe os ícones FontAwesome que você usará
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

// Componente HeaderContent
const HeaderContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] = React.useState(false);
  const { indoPara } = location.state || {};
  const { menuOrientation } = useConfig();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const navigation = useNavigate();
  // Verifica se a URL contém "novo-" ou "nova-" para exibir o botão de voltar
  const shouldShowBackButton = /\/novo-|\/nova-/i.test(location.pathname);

  const voltarParaResumoProcesso = () => {
    // Fecha o dialog primeiro
    setShowChangesNotSavedModal(false);
    // Em seguida, executa a navegação para voltar
    navigate(-1);
  };

  const cancelRemoveUser = () => {
    // Implemente a lógica para cancelar a ação de remover o usuário
    setShowChangesNotSavedModal(false);
  };

  const voltarParaCadastroMenu = () => {
    setShowChangesNotSavedModal(false);
  
    const tabsMap = {
      'NovoTipoAndamento': 'Tipos de Andamento',
      'NovaAcaoJudicial': 'Ação Judicial',
      'NovaAreaJudicial': 'Área Judicial',
      'NovoAssuntoJudicial': 'Assunto Judicial',
      'NovoOrgao': 'Órgão',
      'NovoTipoAudiencia': 'Tipos de Audiência',
      'NovaCompetencia': 'Competência',
      'NovaPrioridade': 'Prioridade',
      'NovoTribunal': 'Tribunal',
      'NovaFase': 'Fases',
      'NovaParte': 'Partes',
      'NovaPessoaJuridica': 'Partes',
      'NovaTag': 'Tags',
      'NovoAdvogado': 'Partes',
    };
  
    const targetTab = tabsMap[indoPara] || 'Ação Judicial'; 
    navigate('/apps/processos/configuracoes-menu', { state: { tab: targetTab } });
  };
  

  const handleConfirmExit = () => {
    voltarParaCadastroMenu();
  };


  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {shouldShowBackButton && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => navigate(-1)}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8,
              },
            }}
          >
            Voltar para listagem
          </Button>
        </Box>
      )}
      {indoPara === 'EditarProcesso' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => setShowChangesNotSavedModal(true)} // Modificado para exibir o dialog

            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white', // Define a cor de fundo para branco
              color: 'rgba(0, 0, 0, 0.6)', // Define a cor do texto
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white', // Mantém a cor de fundo como branco também no hover
                opacity: 0.8 // Opção para dar uma leve distinção ao passar o mouse
              }
            }}
          >
            Voltar para o processo
          </Button>
        </Box>
      )}
      {indoPara === 'EditarCadastro' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={(e) => {
              e.stopPropagation();
              navigation(`/empresas/lista`);
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para a listagem
          </Button>
        </Box>
      )}
      {indoPara === 'NovoTipoAndamento' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={(e) => {
              e.stopPropagation();
              navigation(`/apps/processos/configuracoes-menu`, { state: { tab: 'Tipos de Andamento' } });
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaAcaoJudicial' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaAreaJudicial' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovoAssuntoJudicial' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovoTipoAudiencia' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovoOrgao' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaPrioridade' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovoTribunal' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaCompetencia' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaParte' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaPessoaJuridica' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}

      {indoPara === 'NovaAudiencia' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}

      {indoPara === 'NovaFase' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovaTag' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}
      {indoPara === 'NovoAdvogado' && (
        <Box sx={{ mx: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack sx={{ color: '#a7b1c2', fontSize: '17px !important' }} />}
            onClick={() => {
              if (window.hasChanges) {
                setShowChangesNotSavedModal(true);
              } else {
                voltarParaCadastroMenu();
              }
            }}
            sx={{
              width: '205px',
              height: '32px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0em',
              textAlign: 'left',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
                opacity: 0.8
              }
            }}
          >
            Voltar para cadastros
          </Button>
        </Box>
      )}

      {/* ConfirmDialog separado */}
      <ConfirmDialog
        open={showChangesNotSavedModal}
        onClose={() => setShowChangesNotSavedModal(false)}
        onConfirm={handleConfirmExit}
      />
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      {/* <Notification />
      <Message /> */}
      {!downLG && <FullScreen />}
      <Customization />

      {/* Dropdown para seleção de unidade */}

      {!downLG && <Profile />}
      {downLG && <MobileSection />}
      {indoPara !== 'NovaAcaoJudicial' && indoPara !== 'NovaAreaJudicial' && indoPara !== 'NovoAssuntoJudicial' && (
        <Dialog
          open={showChangesNotSavedModal}
          onClose={() => setShowChangesNotSavedModal(false)}
          sx={{
            '& .MuiPaper-root': {
              width: '547px',
              height: '240px',
              maxWidth: 'none',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: '#FAAD14CC',
              width: 'auto',
              height: '42px',
              borderRadius: '4px 4px 0px 0px',
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IconButton aria-label="delete" sx={{ fontSize: '16px', marginRight: '2px', color: 'rgba(255, 255, 255, 1)' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Open Sans", Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '21px',
                  letterSpacing: '0em',
                  textAlign: 'left',
                  color: 'rgba(255, 255, 255, 1)',
                  flexGrow: 1,
                }}
              >
                Alerta
              </Typography>
            </div>
            <IconButton
              aria-label="close"
              onClick={cancelRemoveUser}
              sx={{
                color: 'rgba(255, 255, 255, 1)',
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Typography component="div" style={{ fontWeight: 'bold', marginTop: '35px', color: '#717171' }}>
              Tem certeza que deseja sair sem salvar as alterações?
            </Typography>
            <Typography component="div" style={{ marginTop: '20px' }}>
              Ao realizar essa ação, todas as alterações serão perdidas.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => voltarParaResumoProcesso()}
              color="primary"
              autoFocus
              style={{
                marginTop: '-55px',
                width: '162px',
                height: '32px',
                padding: '8px 16px',
                borderRadius: '4px',
                background: '#FBBD43',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                textTransform: 'none',
              }}
            >
              Sim, tenho certeza
            </Button>

            <Button
              onClick={() => {
                setShowChangesNotSavedModal(false);
              }}
              style={{
                marginTop: '-55px',
                padding: '8px 16px',
                width: '91px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.40)',
                background: '#FFF',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--label-60, rgba(0, 0, 0, 0.60))',
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </>
  );
};

export default HeaderContent;
