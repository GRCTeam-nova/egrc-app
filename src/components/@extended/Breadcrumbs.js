import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Divider, Grid, Typography, Box } from "@mui/material";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";

// project import
import MainCard from "../../components/MainCard";
import { ThemeDirection } from "../../config";
import { buildBreadcrumbPath } from "../../pages/components-overview/breadcrumbsConfig";

// assets
import { HomeOutlined, HomeFilled, RightOutlined } from "@ant-design/icons";

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
  const navigate = useNavigate();

  const iconSX = {
    marginRight:
      theme.direction === ThemeDirection.RTL ? "0" : theme.spacing(0.75),
    marginLeft:
      theme.direction === ThemeDirection.RTL ? theme.spacing(0.75) : "0",
    marginTop: `-${theme.spacing(0.25)}`,
    width: "1rem",
    height: "1rem",
    color: "inherit",
  };

  // Flag de edição e dados iniciais
  const isEdit = !!(location.state && location.state.dadosApi);
  const dadosApi = location.state?.dadosApi || {};

  const [recordName, setRecordName] = useState(
    dadosApi.name || dadosApi.nome || dadosApi.titulo || "",
  );

  // Quando o usuário muda de rota, reseta o nome para o novo contexto e SALVA NA MEMÓRIA
  useEffect(() => {
    const nameFromState =
      location.state?.dadosApi?.name ||
      location.state?.dadosApi?.nome ||
      location.state?.dadosApi?.titulo ||
      "";
    setRecordName(nameFromState);

    if (nameFromState) {
      sessionStorage.setItem(`breadcrumb_${location.pathname}`, nameFromState);
    } else {
      sessionStorage.removeItem(`breadcrumb_${location.pathname}`);
    }
  }, [location.pathname, location.state]);

  // Fica escutando as telas de cadastro.
  useEffect(() => {
    const handleUpdateName = (event) => {
      if (event.detail) {
        setRecordName(event.detail);
        sessionStorage.setItem(`breadcrumb_${location.pathname}`, event.detail);
      }
    };

    window.addEventListener("updateBreadcrumbName", handleUpdateName);
    return () =>
      window.removeEventListener("updateBreadcrumbName", handleUpdateName);
  }, [location.pathname]);

  const breadcrumbItems = buildBreadcrumbPath(location.pathname, {
    isEdit,
    recordName,
  });

  // Estilos padronizados para os links (Efeito Pill/Botão)
  const linkItemStyles = {
    textDecoration: "none",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: "rgba(28, 82, 151, 0.08)", // Fundo sutil primário
      transform: "translateY(-1px)", // Levanta 1px no hover
    },
    "&:active": {
      transform: "translateY(0)", // Retorna ao clicar
    },
  };

  // Separador moderno
  const SeparatorIcon = separator || RightOutlined;
  const separatorElement = (
    <SeparatorIcon
      style={{
        fontSize: "0.65rem",
        color: theme.palette.text.disabled,
        marginTop: 2,
      }}
    />
  );

  const breadcrumbElements = [];

  // Home sempre primeiro
  breadcrumbElements.push(
    <Typography
      key="home"
      component={Link}
      to="/dashboard/resumo"
      sx={linkItemStyles}
    >
      {icons && <HomeOutlined style={iconSX} />}
      {icon && !icons && <HomeFilled style={iconSX} />}
      {(!icon || icons) && "Início"}
    </Typography>,
  );

  breadcrumbItems.forEach((item, index) => {
    if (item.isLink) {
      const shouldNavigateBack =
        item.path === "/avaliacoes/criar" || item.path === "/testes/criar";

      if (shouldNavigateBack) {
        breadcrumbElements.push(
          <Typography
            key={item.path}
            onClick={() => navigate(-1)}
            sx={{ ...linkItemStyles, cursor: "pointer" }}
          >
            {item.title}
          </Typography>,
        );
      } else {
        breadcrumbElements.push(
          <Typography
            key={item.path}
            component={Link}
            to={item.path}
            sx={linkItemStyles}
          >
            {item.title}
          </Typography>,
        );
      }
    } else {
      // ESTILO DA PÁGINA ATUAL (Badge Effect)
      breadcrumbElements.push(
        <Box
          key={item.path}
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(28, 82, 151, 0.06)",
            border: "1px solid rgba(28, 82, 151, 0.15)",
            padding: "4px 12px",
            borderRadius: "20px", // Borda bem arredondada tipo badge
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#1C5297",
              letterSpacing: "0.2px",
            }}
          >
            {item.title}
          </Typography>
        </Box>,
      );
    }
  });

  if (breadcrumbItems.length === 0) return null;

  return (
    <MainCard
      border={card}
      sx={
        card === false
          ? { mb: 3, bgcolor: "transparent", ...sx }
          : { mb: 3, ...sx }
      }
      {...others}
      content={card}
      shadow="none"
    >
      <Grid
        container
        direction={rightAlign ? "row" : "column"}
        justifyContent={rightAlign ? "space-between" : "flex-start"}
        alignItems={rightAlign ? "center" : "flex-start"}
        spacing={1}
      >
        <Grid item sx={{ marginTop: 2 }}>
          {/* Box com animação de entrada (Fade in e Slide down) */}
          <Box
            sx={{
              animation: "fadeSlideDown 0.4s ease-out forwards",
              "@keyframes fadeSlideDown": {
                "0%": { opacity: 0, transform: "translateY(-10px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <MuiBreadcrumbs
              aria-label="breadcrumb"
              maxItems={maxItems || 8}
              separator={separatorElement}
              sx={{
                "& .MuiBreadcrumbs-separator": {
                  marginLeft: "4px",
                  marginRight: "4px",
                },
              }}
            >
              {breadcrumbElements}
            </MuiBreadcrumbs>
          </Box>
        </Grid>
      </Grid>
      {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
    </MainCard>
  );
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
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default Breadcrumbs;
