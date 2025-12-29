import {
  Tooltip,
  Paper,
  Grid,
  Stack,
  Typography,
  IconButton,
  Button,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { API_QUERY, API_COMMAND } from '../../../config';
import BalanceIcon from "@mui/icons-material/Balance";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import CustomerListPage from "../../extra-pages/listaAndamentos";
import DocumentosListPage from "../../extra-pages/listaDocumentos";
import TarefasListPage from "../../extra-pages/listaTarefas";
import Autocomplete from "@mui/material/Autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Tab } from "@mui/material";
import ResponsibleCard from "./ResponsavelTimeline";
import ListItemButton from "@mui/material/ListItemButton";
import DownOutlined from "@mui/icons-material/ArrowDropDown";
import UpOutlined from "@mui/icons-material/ArrowDropUp";
import Collapse from "@mui/material/Collapse";
import { useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useNavigate } from "react-router";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useGetMenuMaster } from "../../../api/menu";
import { enqueueSnackbar } from "notistack";
import CircleIcon from "@mui/icons-material/Circle";
import eventEmitter from "./eventEmitter";
import "../../apps/configuracoes/LoadingOverlay.css";

const ProcessDetailsPage = () => {
  const navigate = useNavigate();
  const navigation = useNavigate();
  const location = useLocation();
  const { processoSelecionadoId, numeroProcessoSelecionado } = location.state || {};
  const { menuMaster } = useGetMenuMaster();
  const [reloadData, setReloadData] = useState(false);
  const [value, setValue] = useState(0);
  const [isMarginBottomDisabled, setIsMarginBottomDisabled] = useState(false);
  const [isPastaCollapsed, setIsPastaCollapsed] = useState(false);
  const [openChild, setOpenChild] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [open, setOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPastaData, setSelectedPastaData] = useState(null);
  const [dadosPasta, setDadosPasta] = useState(null);
  const [arvoreProcessos, setArvoreProcessos] = useState(null);
  const [processosOrdenados, setProcessosOrdenados] = useState([]);
  const [totalAndamentos, setTotalAndamentos] = useState(null);
  const [andamentoIdDetalhes, setAndamentoIdDetalhes] = useState(null);

  const handleDataUpdated = () => setReloadData(true);

  useEffect(() => {
    setSelectedProcess("Processo 1");
    if (location.state?.vindoDe === "EdicaoCadastro") {
      enqueueSnackbar("Processo cadastrado com sucesso.", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }

    if (
      location.state?.vindoDe === "EdicaoProcesso" &&
      location.state?.cadastrado
    ) {
      enqueueSnackbar("Processo editado com sucesso.", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      navigate(location.pathname, {
        state: { ...location.state, vindoDe: undefined, cadastrado: false },
        replace: true,
      });
    }
  }, [location.pathname, location.state, navigate]);

  const handleClick = (processo) =>
    setOpen(open === processo.numero ? null : processo.numero);

  const handleChildClick = (subProcesso) =>
    setOpenChild(openChild === subProcesso.numero ? null : subProcesso.numero);

  const handleEditButtonClick = (pastaData) => {
    setSelectedPastaData(pastaData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const togglePastaCollapse = () => {
    setIsPastaCollapsed(!isPastaCollapsed);
    setIsMarginBottomDisabled(!isMarginBottomDisabled);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setAndamentoIdDetalhes(null);
  };

  const transformarDadosProcessos = (arvoreProcessos) => {
    return arvoreProcessos.processos.map((processo, index) => ({
      numero: `Processo ${index + 1}`,
      descricao: processo.numero,
      idProcesso: processo.id,
      subProcessos: [],
    }));
  };

  const carregarDadosPasta = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_QUERY}/api/Pasta/Resumo/${location.state?.pastaId}`
      );
      if (!response.ok)
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      const data = await response.json();
      setDadosPasta(data);
      if (data.arvoreProcessos) setArvoreProcessos(data.arvoreProcessos);
    } catch (error) {
      console.error(error);
    }
  }, [location.state?.pastaId]);

  useEffect(() => {
    carregarDadosPasta();
  }, [carregarDadosPasta, location.state?.pastaId]);

  useEffect(() => {
    if (reloadData) {
      carregarDadosPasta();
      setReloadData(false);
    }
  }, [carregarDadosPasta, reloadData]);

  useEffect(() => {
    if (arvoreProcessos) {
      const dadosTransformados = transformarDadosProcessos(arvoreProcessos);
      setProcessosOrdenados(dadosTransformados);
    }
  }, [arvoreProcessos]);

  const calculateMarginBottom = () => {
    if (isPastaCollapsed) return 3.5;
    const baseMargin = isMarginBottomDisabled ? 0 : 30;
    const additionalMarginPerProcess = 6;
    const numberOfProcesses = processosOrdenados
      ? processosOrdenados.length
      : 0;
    const additionalMargin = additionalMarginPerProcess * numberOfProcesses;
    return baseMargin + additionalMargin;
  };

  const marginBottom = calculateMarginBottom();

  useEffect(() => {
    const obterQtdAndamentos = async () => {
      try {
        const response = await fetch(
          `${API_QUERY}/api/Andamento/Listar/${processoSelecionadoId}`
        );
        if (!response.ok)
          throw new Error(`Erro ao buscar dados: ${response.status}`);
        const data = await response.json();
        if (
          data.andamentos &&
          Array.isArray(data.andamentos) &&
          data.andamentos.length > 0
        ) {
          const total = data.andamentos.length;
          setTotalAndamentos(total > 0 ? total : null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    obterQtdAndamentos();
  }, [processoSelecionadoId]);


  useEffect(() => {
    const handleNavigateToAndamentos = (id) => {
      setAndamentoIdDetalhes(id);
      setValue(3);
    };

    eventEmitter.on("navigateToAndamentos", handleNavigateToAndamentos);

    return () => {
      eventEmitter.removeListener(
        "navigateToAndamentos",
        handleNavigateToAndamentos
      );
    };
  }, []);

  if (!dadosPasta) {
    return (
      <div className="overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Box sx={{ marginLeft: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid
          item
          xs={12}
          sm={6}
          md={8}
          lg={9}
          display="flex"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              overflow: "hidden",
              color: "rgba(113, 113, 113, 0.9)",
              textOverflow: "ellipsis",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: "normal",
              marginLeft: -1.5,
            }}
          >
            Processo
          </Typography>

          <Typography
            sx={{
              mx: 1,
            }}
          >
            -
          </Typography>

          <Typography
            variant="h6"
            sx={{
              overflow: "hidden",
              color: "#1C5297",
              textOverflow: "ellipsis",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
            }}
          >
            {numeroProcessoSelecionado}
          </Typography>
          <BalanceIcon
            sx={{
              marginLeft: "10px",
              overflow: "hidden",
              color: "#98B3C3",
              textOverflow: "ellipsis",
              fontFamily: "Font Awesome 5 Free",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 900,
              lineHeight: "normal",
            }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          textAlign="right"
          sx={{
            ...(menuMaster.isDashboardDrawerOpened && {
              paddingLeft: "0 !important",
            }),
          }}
        >
          <Box display="inline-block" sx={{ marginRight: 2 }}>
            <Chip
              label={dadosPasta.ativo ? "Ativo" : "Inativo"}
              color={dadosPasta.ativo ? "success" : "error"}
              sx={{
                color: "white",
                height: "36px",
                "& .MuiChip-icon": {
                  color: "white",
                  marginLeft: "4px",
                },
              }}
              icon={
                <span
                  style={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    marginRight: "-6px",
                    marginLeft: "9px",
                  }}
                />
              }
            />
          </Box>

          <Box display="inline-block" sx={{ marginRight: 2 }}>
            <Button
              startIcon={<FolderIcon />}
              sx={{
                height: "36px",
                padding: "0 15px",
                border: "0.6px solid rgba(0, 0, 0, 0.2)",
              }}
            >
              Encerrar
            </Button>
          </Box>
          <Box display="inline-block">
            <IconButton
              sx={{
                color: "#1C5297",
                borderRadius: "4px",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                border: "0.6px solid rgba(0, 0, 0, 0.20)",
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        rowSpacing={0}
        alignItems="center"
        sx={{
          height: "46px",
          marginTop: 2,
          marginBottom: marginBottom,
          borderRadius: "4px",
          backgroundColor: "rgba(28, 82, 151, 0.05)",
          transition: "margin-bottom 0.3s ease",
          borderTop: "1px solid rgba(0, 0, 0, 0.2)",
          borderLeft: "0.6px solid rgba(0, 0, 0, 0.2)",
          borderRight: "0.6px solid rgba(0, 0, 0, 0.2)",
          borderBottom: "0.6px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "none",
        }}
      >
        <Grid
          item
          xs={6}
          display="flex"
          alignItems="center"
          sx={{
            paddingTop: "0 !important",
            marginTop: isMarginBottomDisabled ? 0 : "5px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginRight: 2,
              overflow: "hidden",
              color: "#1C5297",
              textOverflow: "ellipsis",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            Pasta {dadosPasta.nomePasta}
          </Typography>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigation(`/processos/criar-ligado`, {
                state: {
                  indoPara: "EditarProcesso",
                  pastaId: dadosPasta.id,
                  pastaNumero: dadosPasta.nomePasta,
                  processoSelecionadoId,
                  numeroProcessoSelecionado,
                  segmentoId: dadosPasta.segmentoId,
                },
              });
            }}
            variant="contained"
            startIcon={
              <Box
                sx={{ color: "#1C5297", display: "flex", alignItems: "center" }}
              >
                <AddIcon fontSize="small" />
              </Box>
            }
            sx={{
              height: "28px",
              borderRadius: "4px",
              border: "0.6px solid rgba(0, 0, 0, 0.20)",
              background: "#FFF",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                background: "#FFF",
              },
            }}
          >
            <Typography
              sx={{
                color: "#1C5297",
                fontFamily: "Open Sans-Light, Helvetica",
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Novo processo
            </Typography>
          </Button>
        </Grid>
        <Grid
          item
          xs={6}
          textAlign="right"
          sx={{
            paddingTop: "0 !important",
            marginTop: isMarginBottomDisabled ? 0 : "5px",
          }}
        >
          <Chip
            label={dadosPasta.ativo ? "Ativa" : "Inativa"}
            color={dadosPasta.ativo ? "success" : "error"}
            sx={{
              backgroundColor: "white",
              color: dadosPasta.ativo ? "success.main" : "error.main",
              height: "28px",
              "& .MuiChip-icon": {
                color: dadosPasta.ativo ? "success.main" : "error.main",
                marginLeft: "4px",
              },
            }}
            icon={
              <span
                style={{
                  backgroundColor: dadosPasta.ativo ? "green" : "red",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "-6px",
                  marginLeft: "9px",
                }}
              />
            }
          />
          <Tooltip title="Editar Pasta">
            <IconButton
              onClick={() => handleEditButtonClick(dadosPasta)}
              sx={{
                marginRight: 1,
                marginLeft: 1,
                height: "28px",
                backgroundColor: "white",
                borderRadius: "4px",
                border: "0.6px solid rgba(0, 0, 0, 0.20)",
              }}
            >
              <FontAwesomeIcon
                icon={faPenToSquare}
                style={{ color: "rgba(28, 82, 151, 0.90)" }}
              />
            </IconButton>
          </Tooltip>
          <IconButton
            sx={{
              marginRight: 1,
              height: "28px",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "0.6px solid rgba(0, 0, 0, 0.20)",
            }}
          >
            <FontAwesomeIcon
              icon={faFileInvoice}
              style={{ color: "rgba(28, 82, 151, 0.90)" }}
            />
          </IconButton>
          <IconButton
            onClick={togglePastaCollapse}
            sx={{
              marginRight: 1,
            }}
          >
            <FontAwesomeIcon
              icon={isPastaCollapsed ? faChevronUp : faChevronDown}
              style={{ color: "rgba(28, 82, 151, 0.90)" }}
            />
          </IconButton>
        </Grid>

        <EditFolderModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          pastaData={selectedPastaData}
          onDataUpdated={handleDataUpdated}
        />

        {!isPastaCollapsed && (
          <Paper
            sx={{
              flexGrow: 1,
              width: "100%",
              padding: 2,
              marginTop: "6.5px",
              borderTop: "none",
              borderLeft: "1px solid rgba(0, 0, 0, 0.2)",
              borderRight: "1px solid rgba(0, 0, 0, 0.2)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
              boxShadow: "none"
            }}
          >
            <Grid container spacing={6}>
              <Grid item xs={12} sm={4}>
                <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                  Unidade:
                </Typography>
                <Typography component="span">
                  {dadosPasta.nomeUnidade}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                  Segmento:
                </Typography>
                <Typography component="span">
                  {dadosPasta.nomeSegmento}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                  Cód. de referência:
                </Typography>
                <Typography component="span">
                  {dadosPasta.codigoReferenciaPasta}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                  Resumo da pasta:
                </Typography>
                <Typography component="span">
                  {dadosPasta.resumoPasta}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <Typography
                    component="span"
                    sx={{ fontWeight: "bold", mr: 1, marginTop: "10px" }}
                  >
                    Processo:
                  </Typography>

                  <div style={{ marginTop: "-7px", width: "100%" }}>
                    <List sx={{ p: 0 }}>
                      {processosOrdenados.map((processo) => (
                        <React.Fragment key={processo.numero}>
                          <ListItem disablePadding divider>
                            <ListItemButton
                              onClick={() => handleClick(processo)}
                            >
                              <ListItemIcon>
                                <Radio
                                  checked={selectedProcess === processo.numero}
                                  value={processo.numero}
                                  onClick={(event) => event.stopPropagation()}
                                  checkedIcon={
                                    <CheckCircleIcon
                                      style={{ fontSize: 18, color: "green" }}
                                    />
                                  }
                                  icon={
                                    <CircleIcon
                                      style={{ fontSize: 16, color: "#1C5297" }}
                                    />
                                  }
                                  sx={{
                                    "& .MuiSvgIcon-root": { fontSize: 16 },
                                    "&:hover": {
                                      backgroundColor: "transparent",
                                    },
                                    "&.Mui-checked:hover": {
                                      backgroundColor: "transparent",
                                    },
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={processo.descricao}
                                primaryTypographyProps={{
                                  style: { color: "#1C5297", fontWeight: 600 },
                                }}
                              />

                              <Tooltip title="Adicionar Apenso">
                                <IconButton
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigation(
                                      `/processos/criar-ligado`,
                                      {
                                        state: {
                                          indoPara: "EditarProcesso",
                                          processoPaiDados: processo.descricao,
                                          processoPaiId: processo.idProcesso,
                                          pastaId: dadosPasta.id,
                                          processoSelecionadoId,
                                          numeroProcessoSelecionado,
                                        },
                                      }
                                    );
                                  }}
                                  style={{ color: "#1C5297" }}
                                >
                                  <AddIcon style={{ fontSize: "18px" }} />
                                </IconButton>
                              </Tooltip>
                            </ListItemButton>
                          </ListItem>
                          <Collapse
                            in={open === processo.numero}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List
                              component="div"
                              disablePadding
                              sx={{ bgcolor: "secondary.100" }}
                            >
                              {processo.subProcessos.map(
                                (subProcesso, index) => (
                                  <React.Fragment key={index}>
                                    <ListItemButton
                                      sx={{ pl: 5 }}
                                      onClick={() =>
                                        handleChildClick(subProcesso)
                                      }
                                    >
                                      <ListItemText
                                        primary={subProcesso.descricao}
                                        primaryTypographyProps={{
                                          style: {
                                            color: "#717185",
                                            fontWeight: 600,
                                          },
                                        }}
                                      />
                                      {subProcesso.subProcessos &&
                                        (openChild === subProcesso.numero ? (
                                          <DownOutlined
                                            style={{
                                              fontSize: "18px",
                                              color: "#1C5297",
                                            }}
                                          />
                                        ) : (
                                          <UpOutlined
                                            style={{
                                              fontSize: "18px",
                                              color: "#1C5297",
                                            }}
                                          />
                                        ))}
                                      <Tooltip title="Adicionar Apenso">
                                        <IconButton
                                          onClick={(event) =>
                                            event.stopPropagation()
                                          }
                                          style={{ color: "#1C5297" }}
                                        >
                                          <AddIcon
                                            style={{ fontSize: "18px" }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigation(
                                                `/processos/criar-ligado`,
                                                {
                                                  state: {
                                                    indoPara: "EditarProcesso",
                                                    processoPaiDados:
                                                      dadosPasta,
                                                  },
                                                }
                                              );
                                            }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    </ListItemButton>
                                    {subProcesso.subProcessos && (
                                      <Collapse
                                        in={openChild === subProcesso.numero}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <List
                                          component="div"
                                          disablePadding
                                          sx={{ bgcolor: "secondary.lighter" }}
                                        >
                                          {subProcesso.subProcessos.map(
                                            (deepSubProcesso, deepIndex) => (
                                              <ListItemButton
                                                key={deepIndex}
                                                sx={{ pl: 7 }}
                                              >
                                                <ListItemText
                                                  primary={
                                                    deepSubProcesso.descricao
                                                  }
                                                  primaryTypographyProps={{
                                                    style: {
                                                      color: "#717185",
                                                      fontWeight: 600,
                                                    },
                                                  }}
                                                />
                                                <Tooltip title="Adicionar Apenso">
                                                  <IconButton
                                                    onClick={(event) =>
                                                      event.stopPropagation()
                                                    }
                                                    style={{ color: "#1C5297" }}
                                                  >
                                                    <AddIcon
                                                      style={{
                                                        fontSize: "18px",
                                                      }}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigation(
                                                          `/processos/criar-ligado`,
                                                          {
                                                            state: {
                                                              indoPara:
                                                                "EditarProcesso",
                                                              processoPaiDados:
                                                                dadosPasta,
                                                            },
                                                          }
                                                        );
                                                      }}
                                                    />
                                                  </IconButton>
                                                </Tooltip>
                                              </ListItemButton>
                                            )
                                          )}
                                        </List>
                                      </Collapse>
                                    )}
                                  </React.Fragment>
                                )
                              )}
                            </List>
                          </Collapse>
                        </React.Fragment>
                      ))}
                    </List>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Grid>

      <Box
        sx={{
          borderBottom: "0.6px solid #00000040",
          marginTop: 2,
          marginLeft: -3,
          ".MuiTabs-flexContainer": {
            justifyContent: "flex-start",
          },
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          aria-label="scrollable force tabs example"
          sx={{
            ".MuiTab-root": {
              ...(menuMaster.isDashboardDrawerOpened
                ? {
                  fontSize: "12.5px",
                }
                : {
                  fontSize: "14px",
                }),
            },
            ".MuiTabs-scrollButtons.Mui-disabled": {
              display: "none",
            },
          }}
        >
          <Tab label="Resumo do Processo" />
          <Tab label="Dados do Processo" />
          <Tab label="Motivadores" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Andamentos
                {totalAndamentos && (
                  <Chip
                    label={`${totalAndamentos}`}
                    size="small"
                    sx={{
                      backgroundColor: "#ED556526",
                      color: "#ED5565",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginLeft: "4px",
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Tarefas
                {totalAndamentos && (
                  <Chip
                    label={`${totalAndamentos}`}
                    size="small"
                    sx={{
                      backgroundColor: "#ED556526",
                      color: "#ED5565",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginLeft: "4px",
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab label="Workflow" />
          <Tab label="Documentos" />
          <Tab label="Risco" />
          <Tab label="Financeiro" />
          <Tab label="Observações" />
          {/* Adicione mais Tab para mais abas conforme necessário */}
        </Tabs>
      </Box>
      {value === 0 && (
        <Box sx={{ position: "relative", minHeight: "700px", marginTop: 4 }}>
          <Grid container spacing={2} sx={{ marginTop: 0 }}>
            <Grid
              item
              xs={12}
              md={9.5}
              sx={{
                marginTop: "-30px",
                marginLeft: "-40px",
                maxWidth: menuMaster.isDashboardDrawerOpened
                  ? "76% !important"
                  : "78% !important",
                "@media (max-width:1200px)": {
                  maxWidth: "70% !important",
                },
                "@media (max-width:820px)": {
                  maxWidth: "65% !important",
                },
              }}
            >
              <ProcessSummary dadosPasta={dadosPasta} />
            </Grid>
          </Grid>

          <ResponsibleCard />
        </Box>
      )}
      {value === 3 && (
        <Box sx={{ position: "relative", minHeight: "700px", marginTop: 4 }}>
          <Grid container spacing={2} sx={{ marginTop: 0 }}>
            <Grid item xs={12.2} sx={{ marginLeft: -2 }}>
              <CustomerListPage andamentoIdDetalhes={andamentoIdDetalhes} />
            </Grid>
          </Grid>
        </Box>
      )}
      {value === 4 && (
        <Box sx={{ position: "relative", minHeight: "700px", marginTop: 4 }}>
          <Grid container spacing={2} sx={{ marginTop: 0 }}>
            <Grid item xs={12.2} sx={{ marginLeft: -2 }}>
              <TarefasListPage andamentoIdDetalhes={andamentoIdDetalhes} />
            </Grid>
          </Grid>
        </Box>
      )}
      {value === 6 && (
        <Box sx={{ position: "relative", minHeight: "700px", marginTop: 4 }}>
          <Grid container spacing={2} sx={{ marginTop: 0 }}>
            <Grid item xs={12.2} sx={{ marginLeft: -2 }}>
              <DocumentosListPage andamentoIdDetalhes={andamentoIdDetalhes} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

const ProcessSummary = (props) => {
  const { dadosPasta } = props;
  const pastaId = dadosPasta.id;
  const navigation = useNavigate();
  const location = useLocation();
  const { processoSelecionadoId, numeroProcessoSelecionado } = location.state || {};
  const [dadosProcesso, setDadosProcesso] = useState(null);

  const hexToRGBA = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const formatarDataBrasileiro = (dataISO) => {
    if (!dataISO) return "N/A";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_QUERY}/api/Processo/Resumo/${processoSelecionadoId}`
        );
        const data = response.data;

        const trataCampoVazio = (valor) => (valor === "" || valor === null ? "N/A" : valor);
        const formataValorReais = (valor) =>
          Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

        const dadosTratados = {
          ...data,
          numeroProcesso: trataCampoVazio(data.numeroProcesso),
          resumoFatos: trataCampoVazio(data.resumoFatos),
          pedido: trataCampoVazio(data.pedido),
          dataCadstro: formatarDataBrasileiro(data.dataCadstro),
          uf: trataCampoVazio(data.uf),
          tags: data.tags.length > 0 ? data.tags : [{ nome: "N/A", cor: "#000" }],
          comarca: trataCampoVazio(data.comarca),
          orgao: trataCampoVazio(data.orgao),
          instancia: trataCampoVazio(data.instancia),
          valorCausa: data.valorCausa ? formataValorReais(data.valorCausa) : "N/A",
          dataAudiencia: formatarDataBrasileiro(data.dataAudiencia),
          dataFatoGerador: formatarDataBrasileiro(data.dataFatoGerador),
          dataDistribuicao: formatarDataBrasileiro(data.dataDistribuicao),
          partes: data.partes.map((parte) => ({
            nome: trataCampoVazio(parte.nome),
            qualificacao: trataCampoVazio(parte.qualificacao),
            polo: trataCampoVazio(parte.polo),
            oab: trataCampoVazio(parte.oab),
            advogado: trataCampoVazio(parte.advogado || "N/A"),
            tipoParteDescricao: parte.tipoParte === 1 ? "Empresa/Cliente"
                              : parte.tipoParte === 2 ? "Parte Adversa"
                              : parte.tipoParte === 3 ? "Advogado Adverso"
                              : "Desconhecido"
          })),
        };
        setDadosProcesso(dadosTratados);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [processoSelecionadoId]);

  if (!dadosProcesso) {
    return <Typography sx={{ marginLeft: 10 }}></Typography>;
  }

  return (
    <Paper sx={{ padding: 2, margin: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 0.5 }}>
        <span
          style={{ fontWeight: "bold", color: "#1C5297", fontSize: "16px" }}
        >
          Resumo do Processo -
        </span>
        <span style={{ marginLeft: "5px", color: "#1C5297", fontSize: "14px" }}>
          {dadosProcesso.numeroProcesso}
        </span>
        <span>
          <Tooltip title="Editar Processo">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                navigation(`/apps/processos/editar-processo`, {
                  state: {
                    indoPara: "EditarProcesso",
                    processoId: processoSelecionadoId,
                    dadosProcesso: dadosProcesso,
                    pastaId: pastaId,
                    numeroProcesso: numeroProcessoSelecionado,
                    processoSelecionadoId,
                    numeroProcessoSelecionado,
                  },
                });
              }}
              sx={{
                marginRight: 1,
                marginLeft: 1,
                marginTop: "-4.5px",
                height: "28px",
                backgroundColor: "white",
              }}
            >
              <FontAwesomeIcon
                icon={faPenToSquare}
                style={{ color: "rgba(28, 82, 151, 0.90)" }}
              />
            </IconButton>
          </Tooltip>
        </span>
      </Typography>
      <Typography
        sx={{ color: "rgba(0, 0, 0, 0.43)", fontSize: "12px", marginBottom: 2 }}
      >
        Cadastrado em: {dadosProcesso.dataCadstro}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            color="#1C5297"
            sx={{ fontWeight: "bold", fontSize: "14px" }}
          >
            Dados Iniciais
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Tags:
          </Typography>
          {dadosProcesso.tags[0].nome !== "N/A" ? (
            dadosProcesso.tags.map((tag, index) =>
              tag.ativo ? (
                <Chip
                  key={index}
                  label={tag.nome}
                  style={{
                    height: "20px",
                    backgroundColor: hexToRGBA(tag.cor, 0.4),
                    color: "rgba(0, 0, 0, 0.87)",
                    fontSize: "12px",
                    marginRight: "4px",
                    borderRadius: "8px",
                  }}
                />
              ) : null
            )
          ) : (
            <Typography component="span">N/A</Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Prioridade:
          </Typography>
          <Typography component="span" sx={{ color: "green", fontWeight: 400 }}>
            {dadosProcesso.prioridade}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Tutela:
          </Typography>
          <Typography component="span">
            {dadosProcesso.possuiTutela ? "Sim" : "Não"}
          </Typography>
          {dadosProcesso.deferida && (
            <Chip
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {" "}
                  <span
                    style={{ color: "rgba(0, 0, 0, 0.5)", fontWeight: 400 }}
                  >
                    {" "}
                    Deferido:
                  </span>
                  <AccessTimeIcon
                    style={{
                      marginLeft: 4,
                      marginRight: 4,
                      fontSize: "15px",
                      color: "rgba(0, 0, 0, 0.6)",
                    }}
                  />
                  <span
                    style={{ color: "rgba(0, 0, 0, 0.6)", fontWeight: 400 }}
                  >
                    {" "}
                    {dadosProcesso.deferida}
                  </span>
                </div>
              }
              style={{
                backgroundColor: "rgba(200, 161, 26, 0.2)",
                color: "rgba(0, 0, 0, 0.5)",
                fontWeight: 400,
                marginLeft: "8px",
                height: "auto",
              }}
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Última audiência:
          </Typography>
          <Typography component="span">
            {dadosProcesso.dataAudiencia}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Assunto:
          </Typography>
          <Typography component="span">{dadosProcesso.assunto}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Data fato gerador:
          </Typography>
          <Typography component="span">
            {dadosProcesso.dataFatoGerador}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Data de Distribuição:
          </Typography>
          <Typography component="span">
            {dadosProcesso.dataDistribuicao}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Ação:
          </Typography>
          <Typography component="span">{dadosProcesso.acao}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            UF:
          </Typography>
          <Typography component="span">{dadosProcesso.uf}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Comarca:
          </Typography>
          <Typography component="span">{dadosProcesso.comarca}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Órgão:
          </Typography>
          <Typography component="span">{dadosProcesso.orgao}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Instância:
          </Typography>
          <Typography component="span">{dadosProcesso.instancia}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Valor da Causa
          </Typography>
          <Typography component="span">{dadosProcesso.valorCausa}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Fase:
          </Typography>
          <Typography component="span">{dadosProcesso.fase}</Typography>
        </Grid>

        {dadosProcesso.partes.map((parte, index) => {
  const mostrarTipo = index === 0 || parte.tipoParteDescricao !== dadosProcesso.partes[index - 1].tipoParteDescricao;
  
  const poloDescricao = parte.polo === 1 ? "Passivo" : parte.polo === 2 ? "Ativo" : "";

  return (
    <React.Fragment key={index}>
      {mostrarTipo && (
        <Grid item xs={12}>
          <Typography
            color="#1C5297"
            sx={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px" }}
          >
            {parte.tipoParteDescricao}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12} sm={4}>
        <Box display="flex" alignItems="center">
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Nome:
          </Typography>
          <Tooltip title={parte.nome}>
            <Typography component="span">
              {parte.nome.length > 20
                ? `${parte.nome.toUpperCase().substring(0, 20)}...`
                : parte.nome.toUpperCase()}
            </Typography>
          </Tooltip>
        </Box>
      </Grid>

      {parte.tipoParteDescricao === "Advogado Adverso" ? (
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center">
            <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
              OAB:
            </Typography>
            <Typography component="span">{parte.oab}</Typography>
          </Box>
        </Grid>
      ) : (
        (parte.tipoParteDescricao === "Empresa/Cliente" || parte.tipoParteDescricao === "Parte Adversa") && (
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                Qualificação:
              </Typography>
              <Typography component="span">{parte.qualificacao}</Typography>
            </Box>
          </Grid>
        )
      )}

      {parte.tipoParteDescricao === "Advogado Adverso" ? (
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center">
            <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
              Parte Adversa:
            </Typography>
            <Typography component="span">{parte.advogado}</Typography>
          </Box>
        </Grid>
      ) : (
        (parte.tipoParteDescricao === "Empresa/Cliente" || parte.tipoParteDescricao === "Parte Adversa") && (
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                Polo:
              </Typography>
              <Typography component="span">{poloDescricao}</Typography>
            </Box>
          </Grid>
        )
      )}
    </React.Fragment>
  );
})}

        <Grid item xs={12}>
          <Typography
            color="#1C5297"
            sx={{
              fontWeight: "bold",
              fontSize: "14px",
              marginTop: "25px",
              marginBottom: "15px",
            }}
          >
            Resumos
          </Typography>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Inicial
          </Typography>
          <Typography sx={{ marginTop: "15px", marginBottom: "15px" }}>
            {dadosProcesso.resumoFatos}
          </Typography>
          <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
            Pedido
          </Typography>
          <Typography sx={{ marginTop: "15px" }}>
            {dadosProcesso.pedido}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const EditFolderModal = ({ open, handleClose, pastaData, onDataUpdated }) => {
  const [formData, setFormData] = useState({
    unidade: "",
    segmento: "",
    codigoReferencia: "",
    status: "",
    tags: [],
    resumo: "",
  });

  useEffect(() => {
    if (pastaData) {
      setFormData({
        unidade: pastaData.nomeUnidade || "",
        segmento: pastaData.segmentoId || "",
        codigoReferencia: pastaData.codigoReferenciaPasta || "",
        status: pastaData.ativo ? "true" : "false",
        resumo: pastaData.resumoPasta || "",
      });
    } else {
      setFormData({
        unidade: "",
        segmento: "",
        codigoReferencia: "",
        status: "",
        tags: [],
        resumo: "",
      });
    }
  }, [pastaData]);

  const [segmentos, setSegmentos] = useState([]);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};

  useEffect(() => {
    const fetchSegmentos = async () => {
      const response = await fetch(`${API_QUERY}/api/Segmento`);
      const data = await response.json();
      setSegmentos(data);
    };

    if (open) {
      fetchSegmentos();
    }
  }, [open]);

  const handleInputChange = (event, newValue) => {
    if (event && event.target && event.target.name) {
      const { name, value } = event.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (newValue !== null && newValue !== undefined) {
      setFormData((prevState) => ({
        ...prevState,
        segmento: newValue.id,
      }));
    }
  };

  const handleSave = async () => {
    const payload = {
      segmentoId: formData.segmento,
      codigoReferenciaPasta: formData.codigoReferencia,
      ativo: formData.status === "true" || formData.status === true,
      resumoPasta: formData.resumo,
      processoId: processoSelecionadoId,
    };

    try {
      const response = await fetch(`${API_COMMAND}/api/Pasta/Atualizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        try {
          const errorData = JSON.parse(errorBody);
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch {
          throw new Error(`Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`);
        }
      } else {
        onDataUpdated();
        handleClose();
        enqueueSnackbar("Pasta editada com sucesso.", {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (pastaData) {
      setFormData({
        unidade: pastaData.nomeUnidade || "",
        segmento: pastaData.segmentoId || "",
        codigoReferencia: pastaData.codigoReferenciaPasta || "",
        status: pastaData.ativo ? "true" : "false",
        resumo: pastaData.resumoPasta || "",
      });
    } else {
      setFormData({
        unidade: "",
        segmento: "",
        codigoReferencia: "",
        status: "",
        tags: [],
        resumo: "",
      });
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { width: "606px", height: "591px" },
      }}
    >
      <DialogTitle
        sx={{
          background: "rgba(28, 82, 151, 1)",
          width: "606px",
          height: "42px",
          borderRadius: "4px 4px 0px 0px",
          display: "flex",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <IconButton
          aria-label="edit"
          sx={{
            fontSize: "16px",
            marginRight: "8px",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </IconButton>
        <Typography
          variant="body1"
          sx={{
            fontFamily: '"Open Sans", Helvetica, sans-serif',
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "21px",
            letterSpacing: "0em",
            textAlign: "left",
            color: "rgba(255, 255, 255, 1)",
            flexGrow: 1,
            marginLeft: -1,
            marginTop: 0.2,
          }}
        >
          Editar pasta
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="h6"
          gutterBottom
          component="div"
          sx={{
            color: "rgba(28, 82, 151, 1)",
            fontFamily: "Open Sans, Helvetica",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            marginTop: 3.5,
            marginBottom: 3.5,
          }}
        >
          Informações da pasta
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <InputLabel>Unidade</InputLabel>
              <TextField
                disabled
                margin="normal"
                name="unidade"
                fullWidth
                value={formData.unidade}
                onChange={handleInputChange}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <InputLabel>Segmento</InputLabel>
              <Autocomplete
                options={segmentos}
                getOptionLabel={(option) => option.nome}
                value={
                  segmentos.find(
                    (segmento) => segmento.id === formData.segmento
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    segmento: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Escolha um segmento" />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <InputLabel>Cód. Referencia</InputLabel>
              <TextField
                margin="normal"
                name="codigoReferencia"
                fullWidth
                value={formData.codigoReferencia}
                onChange={handleInputChange}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <InputLabel>Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="true">Ativo</MenuItem>
                <MenuItem value="false">Inativo</MenuItem>
              </Select>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Resumo da pasta</InputLabel>
              <TextField
                margin="normal"
                name="resumo"
                fullWidth
                multiline
                rows={3}
                value={formData.resumo}
                onChange={handleInputChange}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          marginRight: 4,
          marginTop: 2,
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            border: "1px solid rgba(0, 0, 0, 0.4)",
            borderRadius: "4px",
            padding: "8px, 16px, 8px, 16px",
            gap: "8px",
            width: "91px",
            height: "32px",
            color: "rgba(0, 0, 0, 0.6)",
            fontWeight: 600,
            marginRight: 2,
            marginBottom: 2,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            border: "1px solid rgba(0, 0, 0, 0.4)",
            borderRadius: "4px",
            padding: "8px, 16px, 8px, 16px",
            gap: "8px",
            width: "91px",
            height: "32px",
            color: "rgba(255, 255, 255, 1)",
            fontWeight: 600,
            backgroundColor: "rgba(28, 82, 151, 1)",
            marginBottom: 2,
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessDetailsPage;
