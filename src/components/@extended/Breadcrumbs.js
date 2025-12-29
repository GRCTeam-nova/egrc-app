import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project import
import MainCard from '../../components/MainCard';
import { ThemeDirection } from '../../config';
import { buildBreadcrumbPath } from '../../pages/components-overview/breadcrumbsConfig';

// assets
import { HomeOutlined, HomeFilled } from '@ant-design/icons';

// ==============================|| BREADCRUMBS ||============================== //

const Breadcrumbs = ({
  card = false,
  custom = false,
  divider = false,
  heading,
  icon,
  icons,
  links,
  maxItems,
  rightAlign,
  separator,
  title = true,
  titleBottom = true,
  sx,
  ...others
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate(); // Importar useNavigate
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  const iconSX = {
    marginRight: theme.direction === ThemeDirection.RTL ? '0' : theme.spacing(0.75),
    marginLeft: theme.direction === ThemeDirection.RTL ? theme.spacing(0.75) : '0',
    marginTop: `-${theme.spacing(0.25)}`,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  useEffect(() => {
    const items = buildBreadcrumbPath(location.pathname);
    setBreadcrumbItems(items);
  }, [location.pathname]);

  // item separator
  const SeparatorIcon = separator;
  const separatorIcon = separator ? <SeparatorIcon style={{ fontSize: '0.75rem', marginTop: 2 }} /> : '/';

  // Construir os itens do breadcrumb
  const breadcrumbElements = [];

  // Home sempre primeiro
  breadcrumbElements.push(
    <Typography 
      key="home"
      component={Link} 
      to="/dashboard/resumo" 
      color="textSecondary" 
      variant="h6" 
      sx={{ textDecoration: 'none' }}
    >
      {icons && <HomeOutlined style={iconSX} />}
      {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
      {(!icon || icons) && 'Home'}
    </Typography>
  );

  // Adicionar itens do breadcrumb
  breadcrumbItems.forEach((item, index) => {
    if (item.isLink) {
      // Rotas que devem usar navigate(-1)
      const shouldNavigateBack = item.path === '/avaliacoes/criar' || item.path === '/testes/criar';

      if (shouldNavigateBack) {
        breadcrumbElements.push(
          <Typography 
            key={item.path}
            onClick={() => navigate(-1)} // Usar navigate(-1) para estas rotas
            color="textSecondary" 
            variant="h6" 
            sx={{ textDecoration: 'none', cursor: 'pointer' }} // Adicionar cursor pointer para indicar clicável
          >
            {item.title}
          </Typography>
        );
      } else {
        breadcrumbElements.push(
          <Typography 
            key={item.path}
            component={Link} 
            to={item.path} 
            color="textSecondary" 
            variant="h6" 
            sx={{ textDecoration: 'none' }}
          >
            {item.title}
          </Typography>
        );
      }
    } else {
      breadcrumbElements.push(
        <Typography 
          key={item.path}
          variant="subtitle1" 
          color="#1C5297" 
          style={{ fontSize: '16px' }}
        >
          {item.title}
        </Typography>
      );
    }
  });

  // Se não há itens de breadcrumb (rota não mapeada), não exibir nada
  if (breadcrumbItems.length === 0) {
    return null;
  }

  // Prepare breadcrumbs structure
  let breadcrumbContent = (
    <MainCard
      border={card}
      sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
      {...others}
      content={card}
      shadow="none"
    >
      <Grid
        container
        direction={rightAlign ? 'row' : 'column'}
        justifyContent={rightAlign ? 'space-between' : 'flex-start'}
        alignItems={rightAlign ? 'center' : 'flex-start'}
        spacing={1}
      >
        <Grid item sx={{ marginTop: 2 }}>
          <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
            {breadcrumbElements}
          </MuiBreadcrumbs>
        </Grid>
      </Grid>
      {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
    </MainCard>
  );

  return breadcrumbContent;
};

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  divider: PropTypes.bool,
  custom: PropTypes.bool,
  heading: PropTypes.string,
  icon: PropTypes.bool,
  icons: PropTypes.bool,
  links: PropTypes.array,
  maxItems: PropTypes.number,
  rightAlign: PropTypes.bool,
  separator: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  title: PropTypes.bool,
  titleBottom: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

export default Breadcrumbs;

