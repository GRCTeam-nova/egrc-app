import * as React from "react";
import {
  DialogTitle,
  Dialog,
  List,
  ListItem,
  MenuList,
  MenuItem,
  Popover,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Radio,
  TextField,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  IconButton,
  DialogActions,
  DialogContent,
  Button,
  Box,
  Grid,
  Typography,
  InputLabel,
} from "@mui/material";
import { API_QUERY, API_COMMAND } from "../../../config";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
  faPenToSquare,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { useLocation } from "react-router-dom";
import AndamentoHistoricoDrawer from "../../extra-pages/AndamentoHistoricoDrawer";
import semRegistro from "../../../assets/images/SemRegistros.png";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open6, setOpen6] = useState(false);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const { statusDadosEditar } = location.state || {};
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Editar");
  const [titulo, setTitulo] = useState("Tipos de Andamento");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [motivos, setMotivos] = useState([]);
  const [novoMotivo, setNovoMotivo] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMotivo, setEditMotivo] = useState("");
  const [statusRegistros, setStatusRegistros] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [formData, setFormData] = useState({
    unidade: [],
    tipoDocumento: [],
    responsavel: null,
    fase: "",
    exigeDocumento: "Não",
  });

  // Preencher os campos automaticamente em caso de edição
  useEffect(() => {
    if (statusDadosEditar) {
      setFormData((prev) => ({
        ...prev,
        tipoDocumento:
          statusDadosEditar.tipoDocumentoStatus?.map(
            (u) => u.tipoDocumentoId
          ) || [],
        exigeDocumento:
          statusDadosEditar.tipoDocumentoStatus?.length > 0 ? "Sim" : "Não",
      }));

      const motivosAtivos =
        statusDadosEditar.motivoStatus?.map((motivo) =>
          motivo.ativo ? "Ativo" : "Inativo"
        ) || [];
      setMotivos(statusDadosEditar.motivoStatus || []);
      setStatusRegistros(motivosAtivos);
    }
  }, [statusDadosEditar]);

  // Função para abrir o diálogo de exclusão
  const handleOpenDeleteDialog = (index) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
    handleClosePopover();
  };

  // Função para confirmar a exclusão
  const handleConfirmDelete = () => {
    handleExcluirRegistro(deleteIndex);
    setShowDeleteDialog(false);
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (motivos && motivos.length > 0) {
      const novosStatus = motivos.map((motivo, index) => {
        // Mantém o status existente ou define "Ativo/Inativo" com base no campo `ativo` do motivo
        return statusRegistros[index] || (motivo.ativo ? "Ativo" : "Inativo");
      });
      setStatusRegistros(novosStatus);
    } else {
      setStatusRegistros([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motivos]);

  const handleToggleStatus = (index) => {
    if (statusRegistros[index] === "Ativo") {
      setShowConfirmDialog(true);
      setCurrentIndex(index);
      handleClosePopover();
    } else {
      toggleStatus(index);
      handleClosePopover();
    }
  };

  const toggleStatus = (index) => {
    setStatusRegistros((prevStatus) =>
      prevStatus.map((status, i) =>
        i === index ? (status === "Ativo" ? "Inativo" : "Ativo") : status
      )
    );
    setShowConfirmDialog(false); // Fecha o dialog caso tenha sido exibido
  };

  const handleConfirmInactivation = () => {
    toggleStatus(currentIndex);
  };

  const handleCancelInactivation = () => {
    setShowConfirmDialog(false);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentIndex(null);
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "fase") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll6 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.tipoDocumento.length === tiposDocumentos.length) {
        // Deselect all
        setFormData({ ...formData, tipoDocumento: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          tipoDocumento: tiposDocumentos.map(
            (tipoDocumento) => tipoDocumento.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "tipoDocumento",
        newValue.map((item) => item.id)
      );
    }
  };

  // Em caso de edição
  useEffect(() => {
    if (statusDadosEditar) {
      setRequisicao("Editar");
      setTitulo(`Editar Status do Processo: ${statusDadosEditar.nome}`);
      setFormData((prev) => ({
        ...prev,
        unidade: statusDadosEditar.unidadeId || [],
      }));
      setFormData((prev) => ({
        ...prev,
        fase: statusDadosEditar.faseId || [],
      }));
    }
  }, [statusDadosEditar]);

  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(
      `${API_QUERY}/api/TipoDocumento/ListarCombo?ativo=true`,
      setTiposDocumentos
    );
    window.scrollTo(0, 0);
  }, []);

  const handleOpenModal = () => {
    setShowChangesNotSavedModal(true);
  };

  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleRadioChange = (event) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      exigeDocumento: value,
      // Limpa os tipos de documentos se "Não" for selecionado
      ...(value === "Não" ? { tipoDocumento: [] } : {})
    }));
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditMotivo(motivos[index].nome); // Certifique-se de que apenas o nome seja atribuído
    setEditModalOpen(true);
    handleClosePopover();
  };

  const allSelected6 =
    formData.tipoDocumento.length === tiposDocumentos.length &&
    tiposDocumentos.length > 0;

  const voltarParaCadastroMenu = () => {
    //navigate(-1);
    window.scrollTo(0, 0);
    navigate("/apps/processos/configuracoes-menu", {
      state: { tab: "Tipos de Andamento" },
    });
  };

  // Função para carregar os dados das APIs
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) { }
  };

  const [formValidation, setFormValidation] = useState({
    unidade: true,
    nomeAndamento: true,
  });

  const tratarSubmit = async () => {
    setLoading(true);

    // Validação: Exige tipo de documento
    if (
      formData.exigeDocumento === "Sim" &&
      formData.tipoDocumento.length === 0
    ) {
      enqueueSnackbar(
        "Você precisa selecionar pelo menos um tipo de documento.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        }
      );
      setLoading(false);
      return;
    }

    // Validação: Exige pelo menos um motivo
    if (motivos.length === 0) {
      enqueueSnackbar("Você precisa adicionar pelo menos um motivo.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      setLoading(false);
      return;
    }

    const motivoStatus = motivos.map((motivo, index) => ({
      id: motivo.id || 0,
      nome: motivo.nome,
      ativo: statusRegistros[index] === "Ativo",
    }));

    const tipoDocumentoStatus = formData.tipoDocumento.map(
      (tipoDocumentoId) => ({
        id: 0,
        tipoDocumentoId,
      })
    );

    const payload = {
      id: statusDadosEditar?.id || 0,
      nome: statusDadosEditar?.nome || "",
      ativo: statusDadosEditar?.ativo || true,
      exigeTarefa: statusDadosEditar?.exigeTarefa || false,
      exigePagamento: statusDadosEditar?.exigePagamento || false,
      exigeDeposito: statusDadosEditar?.exigeDeposito || false,
      exigeProvisionamento: statusDadosEditar?.exigeProvisionamento || false,
      permiteAnexoDocumento: statusDadosEditar?.permiteAnexoDocumento || false,
      motivoStatus,
      tipoDocumentoStatus,
    };

    try {
      const response = await fetch(`${API_COMMAND}/api/Status/Editar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro ao enviar: ${response.status} ${errorBody}`);
      }

      enqueueSnackbar(`Status de Processo (Ativo) editado com sucesso.`, {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });

      navigate("/apps/processos/configuracoes-parametros");
    } catch (error) {
      enqueueSnackbar(`Erro: ${error.message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirRegistro = (index) => {
    const motivo = motivos[index];
  
    if (motivo.existeProcesso) {
      enqueueSnackbar(
        "Este motivo não pode ser excluído porque possui processos vinculados.",
        { variant: "error" }
      );
      return;
    }
  
    setMotivos((prevMotivos) => prevMotivos.filter((_, i) => i !== index));
    setStatusRegistros((prevStatus) =>
      prevStatus.filter((_, i) => i !== index)
    );
    handleClose(); // Fecha o popover
  };  
  
  const isNomeDuplicado = (nome) => {
    return motivos.some(
      (motivo) => motivo.nome.toLowerCase() === nome.toLowerCase()
    );
  };

  const handleAdicionarMotivo = () => {
    if (!novoMotivo.trim()) {
      enqueueSnackbar("O motivo não pode estar vazio.", { variant: "error" });
      return;
    }

    if (isNomeDuplicado(novoMotivo)) {
      enqueueSnackbar("Já existe um motivo com esse nome.", {
        variant: "error",
      });
      return;
    }

    if (editIndex !== null) {
      // Atualizar um motivo existente
      const updatedMotivos = [...motivos];
      updatedMotivos[editIndex] = {
        ...updatedMotivos[editIndex],
        nome: novoMotivo,
      };
      setMotivos(updatedMotivos);
      setEditIndex(null); // Finalizar edição
    } else {
      // Adicionar novo motivo
      setMotivos([...motivos, { id: 0, nome: novoMotivo, ativo: true }]);
    }

    setNovoMotivo(""); // Limpar campo de entrada
  };

  const handleSaveEdit = () => {
    if (!editMotivo.trim()) {
      enqueueSnackbar("O motivo não pode estar vazio.", { variant: "error" });
      return;
    }

    if (isNomeDuplicado(editMotivo)) {
      enqueueSnackbar("Já existe um motivo com esse nome.", {
        variant: "error",
      });
      return;
    }

    if (editIndex !== null) {
      const updatedMotivos = [...motivos];
      updatedMotivos[editIndex] = {
        ...updatedMotivos[editIndex], // Preserva as outras propriedades do motivo
        nome: editMotivo, // Atualiza apenas o campo `nome`
      };
      setMotivos(updatedMotivos);
      setEditIndex(null);
      setEditModalOpen(false);
      setEditMotivo("");
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setEditMotivo(""); // Limpar o campo ao fechar o modal
    setEditIndex(null); // Limpar o índice de edição
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <Box
        mb={4}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#1C5297",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}
        >
          {titulo}
        </span>
      </Box>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body1" fontWeight={500} gutterBottom>
            Exige documento comprobatório?
          </Typography>
          <RadioGroup
            row
            value={formData.exigeDocumento}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
            <FormControlLabel value="Não" control={<Radio />} label="Não" />
          </RadioGroup>
        </Grid>

        {formData.exigeDocumento === "Sim" && (
          <Grid item xs={12}>
            <Box
              sx={{
                width: "856px",
                height: "154px",
                border: "0.6px solid rgba(171, 190, 209, 1)",
                borderRadius: "8px",
                backgroundColor: "rgba(238, 245, 252, 1)",
                padding: "16px",
              }}
            >
              <Typography
                marginTop={1}
                marginBottom={2}
                variant="body1"
                color="rgba(28, 82, 151, 1)"
                fontSize="12px"
                fontWeight={600}
              >
                Selecione os tipos de documentos que poderão ser anexados ao
                encerramento do processo
              </Typography>

              <InputLabel
                style={{ fontSize: "12px", fontWeight: 400, marginBottom: 8 }}
              >
                Tipo de documento *
              </InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...tiposDocumentos,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.tipoDocumento.map(
                  (id) =>
                    tiposDocumentos.find(
                      (tipoDocumento) => tipoDocumento.id === id
                    ) || id
                )}
                onChange={handleSelectAll6}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                limitTags={2}
                open={open6}
                onOpen={() => setOpen6(true)}
                onClose={() => setOpen6(false)}
                renderOption={(props, option, { selected }) => (
                  <li
                    {...props}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          checked={
                            option.id === "all" ? allSelected6 : selected
                          }
                        />
                      </Grid>
                      <Grid item xs>
                        {option.nome}
                      </Grid>
                    </Grid>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      formData.tipoDocumento.length > 0
                        ? ""
                        : "Digite ou selecione um tipo de documento"
                    }
                    error={
                      (formData.tipoDocumento.length === 0 ||
                        formData.tipoDocumento.every((val) => val === 0)) &&
                      formValidation.tipoDocumento === false
                    }
                    onClick={() => setOpen6(true)}
                  />
                )}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    p: 1,
                  },
                  "& .MuiAutocomplete-tag": {
                    bgcolor: "primary.lighter",
                    border: "1px solid",
                    borderRadius: 1,
                    height: 32,
                    pl: 1.5,
                    pr: 1.5,
                    lineHeight: "32px",
                    borderColor: "primary.light",
                    "& .MuiChip-label": {
                      paddingLeft: 0,
                      paddingRight: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "primary.main",
                      ml: 1,
                      mr: -0.75,
                      "&:hover": {
                        color: "primary.dark",
                      },
                    },
                  },
                }}
              />
            </Box>
          </Grid>
        )}
        {/* Grid para Motivo */}
        <Grid item xs={9} mt={5}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: 1,
              position: "relative",
              padding: 2,
              pt: 4, // Padding top adicional para evitar sobreposição do Typography
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                position: "absolute",
                top: "-12px",
                left: "16px",
                background: "#fff",
                padding: "0 8px",
                color: "rgba(28, 82, 151, 1)",
              }}
            >
              Motivos
            </Typography>
            <Typography
              variant="body1"
              color="rgba(77, 77, 77, 1)"
              fontWeight={600}
              gutterBottom
              marginBottom={5}
            >
              Adicione motivos para justificar o porque você está ativando o
              processo.
            </Typography>
            <InputLabel sx={{ mb: 1 }}>Nome</InputLabel>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={novoMotivo}
                onChange={(e) => setNovoMotivo(e.target.value)}
                placeholder="Digite o motivo"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdicionarMotivo}
              >
                {editIndex !== null ? "Atualizar" : "Adicionar"}
              </Button>
            </Box>
            {motivos.length === 0 ? (
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 4,
                }}
              >
                <img
                  src={semRegistro}
                  alt="Sem registros"
                  style={{ maxWidth: "300px", height: "auto" }}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(244, 244, 244, 1)",
                      padding: 2,
                      height: "42px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ marginTop: -0.5 }}
                      gutterBottom
                    >
                      Motivos
                    </Typography>
                  </Box>
                  <List>
                    {motivos.map((motivo, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {/* Nome do motivo */}
                        <ListItemText primary={motivo.nome} />

                        {/* Status dinâmico com texto e cor */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mr: 5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              backgroundColor:
                                statusRegistros[index] === "Ativo"
                                  ? "green"
                                  : "red",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {statusRegistros[index]}
                          </Typography>
                        </Box>

                        {/* Botão de ação */}
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClick(event, index)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Popover
                            open={open && currentIndex === index}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <MenuList>
                              <MenuItem
                                onClick={() => handleEditClick(currentIndex)}
                              >
                                <ListItemIcon>
                                  <EditIcon
                                    sx={{
                                      color: "rgba(77, 77, 77, 1)",
                                      fontWeight: 400,
                                      fontSize: "20px",
                                    }}
                                  />
                                </ListItemIcon>
                                Editar
                              </MenuItem>
                              {motivos[currentIndex]?.id !== 0 && (
                                <MenuItem
                                  onClick={() =>
                                    handleToggleStatus(currentIndex)
                                  }
                                >
                                  <ListItemIcon>
                                    {statusRegistros[currentIndex] ===
                                      "Ativo" ? (
                                      <BlockIcon
                                        sx={{
                                          color: "rgba(77, 77, 77, 1)",
                                          fontWeight: 400,
                                          fontSize: "20px",
                                        }}
                                      />
                                    ) : (
                                      <CheckCircleIcon
                                        sx={{
                                          color: "rgba(77, 77, 77, 1)",
                                          fontWeight: 400,
                                          fontSize: "20px",
                                        }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  {statusRegistros[currentIndex] === "Ativo"
                                    ? "Inativar"
                                    : "Ativar"}
                                </MenuItem>
                              )}
                              <MenuItem
                                onClick={() =>
                                  handleOpenDeleteDialog(currentIndex)
                                }
                              >
                                <ListItemIcon>
                                  <DeleteIcon
                                    sx={{
                                      color: "rgba(170, 5, 5, 1)",
                                      fontWeight: 400,
                                      fontSize: "20px",
                                    }}
                                  />
                                </ListItemIcon>
                                <span style={{ color: "rgba(170, 5, 5, 1)" }}>
                                  Excluir
                                </span>
                              </MenuItem>
                            </MenuList>
                          </Popover>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} mt={5}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginRight: "20px",
            }}
          >
            <Button
              variant="outlined"
              style={{
                width: "91px",
                height: "32px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: 600,
                color: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={handleOpenModal}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{
                width: "91px",
                height: "32px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: 600,
              }}
              onClick={tratarSubmit}
            >
              Salvar
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Dialog
        open={editModalOpen}
        onClose={handleModalClose}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root": {
            // Este seletor atinge o Paper component que Dialog usa internamente para seu layout
            width: "547px",
            height: "240px",
            maxWidth: "none", // Isso garante que o Dialog não tente se ajustar além do width especificado
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "rgba(28, 82, 151, 1)",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between", // Ajustado para distribuir o espaço entre os elementos
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            {/* Agrupa o ícone de lixeira e o texto */}
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
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
              }}
            >
              Editar Motivo
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            <InputLabel sx={{ mb: 1 }}>Nome do motivo</InputLabel>
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              variant="outlined"
              value={editMotivo}
              onChange={(e) => setEditMotivo(e.target.value)}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelInactivation}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root": {
            // Este seletor atinge o Paper component que Dialog usa internamente para seu layout
            width: "547px",
            height: "240px",
            maxWidth: "none", // Isso garante que o Dialog não tente se ajustar além do width especificado
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "rgba(255, 224, 161, 1)",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between", // Ajustado para distribuir o espaço entre os elementos
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            {/* Agrupa o ícone de lixeira e o texto */}
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(97, 52, 0, 1)",
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
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
                color: "rgba(97, 52, 0, 1)",
                flexGrow: 1,
              }}
            >
              Alerta
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCancelInactivation}
            sx={{
              color: "rgba(97, 52, 0, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Inativar motivo
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Se este motivo ficar inativo, não será mais possível cadastrar novos
            processos nele. Tem certeza de que deseja inativar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelInactivation} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmInactivation}
            color="primary"
            variant="contained"
          >
            Sim, inativar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "240px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "rgba(170, 5, 5, 1)",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Excluir motivo
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCancelDelete}
            sx={{
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Esta ação é irreversível
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Caso precise deste motivo no futuro, será necessário criar um novo.
            Tem certeza de que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            variant="contained"
            style={{ background: "rgba(170, 5, 5, 1)", color: "#fff" }}
          >
            Sim, excluir
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showChangesNotSavedModal}
        onClose={() => setShowChangesNotSavedModal(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "240px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#FAAD14CC",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            {/* Agrupa o ícone de lixeira e o texto */}
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
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
              }}
            >
              Alerta
            </Typography>
          </div>
          {/* Botão para fechar o modal */}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Tem certeza que deseja sair sem salvar as alterações?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Ao realizar essa ação, todas as alterações serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              voltarParaCadastroMenu();
            }}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#FBBD43",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, tenho certeza
          </Button>

          <Button
            onClick={() => {
              // Ação para "Cancelar" (manter o modal de edição aberto)
              setShowChangesNotSavedModal(false);
            }}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      {requisicao === "Editar" && (
        <AndamentoHistoricoDrawer
          row={statusDadosEditar}
          open={drawerOpen}
          onClose={handleDrawerClose}
          vindoDe={"Tipo de Andamentos"}
        />
      )}
    </>
  );
}

export default ColumnsLayouts;
