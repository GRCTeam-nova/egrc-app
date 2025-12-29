import { useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Accordion, AccordionDetails, AccordionSummary, Box, Drawer, Stack, Typography } from '@mui/material';

// importação do projeto
import ThemeLayout from './ThemeLayout';
import DefaultThemeMode from './ThemeMode';
import ColorScheme from './ColorScheme';
import ThemeWidth from './ThemeWidth';
import ThemeFont from './ThemeFont';
import ThemeMenuLayout from './ThemeMenuLayout';
import MainCard from '../../../../../components/MainCard';
import IconButton from '../../../../../components/@extended/IconButton';
import AnimateButton from '../../../../../components/@extended/AnimateButton';
import SimpleBar from '../../../../../components/third-party/SimpleBar';
import useConfig from '../../../../../hooks/useConfig';
import { ThemeMode } from '../../../../../config';

// ativos
import {
  LayoutOutlined,
  HighlightOutlined,
  BorderInnerOutlined,
  BgColorsOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  FontColorsOutlined
} from '@ant-design/icons';

// ==============================|| CABEÇALHO CONTEÚDO - CUSTOMIZAÇÃO ||============================== //

const Customization = () => {
  const theme = useTheme();
  const { container, fontFamily, mode, presetColor, miniDrawer, themeDirection, menuOrientation } = useConfig();

  // eslint-disable-next-line
  const themeLayout = useMemo(() => <ThemeLayout />, [miniDrawer, themeDirection]);
  // eslint-disable-next-line
  const themeMenuLayout = useMemo(() => <ThemeMenuLayout />, [menuOrientation]);
  // eslint-disable-next-line
  const themeMode = useMemo(() => <DefaultThemeMode />, [mode]);
  // eslint-disable-next-line
  const themeColor = useMemo(() => <ColorScheme />, [presetColor]);
  // eslint-disable-next-line
  const themeWidth = useMemo(() => <ThemeWidth />, [container]);
  // eslint-disable-next-line
  const themeFont = useMemo(() => <ThemeFont />, [fontFamily]);

  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          color="secondary"
          variant="light"
          sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
          onClick={handleToggle}
          aria-label="alternar configurações"
        >
          <AnimateButton type="rotate">
            <SettingOutlined />
          </AnimateButton>
        </IconButton>
      </Box>
      <Drawer
        sx={{
          zIndex: 2001
        }}
        anchor="right"
        onClose={handleToggle}
        open={open}
        PaperProps={{
          sx: {
            width: 340
          }
        }}
      >
        {open && (
          <MainCard
            title="Customização do Sistema"
            sx={{
              border: 'none',
              borderRadius: 0,
              height: '100vh',
              '& .MuiCardHeader-root': { color: 'background.paper', bgcolor: 'primary.main', '& .MuiTypography-root': { fontSize: '1rem' } }
            }}
            content={false}
            secondary={
              <IconButton shape="rounded" size="small" onClick={handleToggle} sx={{ color: 'background.paper' }}>
                <CloseCircleOutlined style={{ fontSize: '1.15rem' }} />
              </IconButton>
            }
          >
            <SimpleBar
              sx={{
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              <Box
                sx={{
                  height: 'calc(100vh - 64px)',
                  '& .MuiAccordion-root': {
                    borderColor: theme.palette.divider,
                    '& .MuiAccordionSummary-root': {
                      bgcolor: 'transparent',
                      flexDirection: 'row',
                      pl: 1
                    },
                    '& .MuiAccordionDetails-root': {
                      border: 'none'
                    },
                    '& .Mui-expanded': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                {/* <Accordion defaultExpanded sx={{ borderTop: 'none' }}>
                  <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <LayoutOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Layout do Tema
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha seu layout
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeLayout}</AccordionDetails>
                </Accordion> */}
                {/* <Accordion defaultExpanded>
                  <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <BorderInnerOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Orientação do Menu
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha a orientação vertical ou horizontal do menu
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeMenuLayout}</AccordionDetails>
                </Accordion> */}
                {/* <Accordion defaultExpanded>
                  <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <HighlightOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Modo do Tema
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha entre o modo claro ou escuro
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeMode}</AccordionDetails>
                </Accordion> */}
                <Accordion defaultExpanded>
                  <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <BgColorsOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Esquema de Cores
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha a cor primária do seu tema
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeColor}</AccordionDetails>
                </Accordion>
                {/* <Accordion defaultExpanded>
                  <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <BorderInnerOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Largura do Layout
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha entre o layout fluido ou com contêiner
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeWidth}</AccordionDetails>
                </Accordion> */}
                <Accordion defaultExpanded sx={{ borderBottom: 'none' }}>
                  <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconButton
                        disableRipple
                        color="primary"
                        sx={{ bgcolor: 'primary.lighter' }}
                        onClick={handleToggle}
                        aria-label="alternar configurações"
                      >
                        <FontColorsOutlined />
                      </IconButton>
                      <Stack>
                        <Typography variant="subtitle1" color="textPrimary">
                          Família de Fontes
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Escolha sua família de fontes.
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>{themeFont}</AccordionDetails>
                </Accordion>
              </Box>
            </SimpleBar>
          </MainCard>
        )}
      </Drawer>
    </>
  );
};

export default Customization;
