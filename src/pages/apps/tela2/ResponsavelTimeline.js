import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Typography,
  Grid,
  FormControlLabel,
  List,
  ListItem,
  InputAdornment,
  ListItemText,
  Radio,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  InputLabel,
  TextField,
  Autocomplete,
} from "@mui/material";
import { API_QUERY, API_COMMAND } from '../../../config';
import FlipMove from "react-flip-move";
import eventEmitter from "./eventEmitter";
import { useGetAndamentos } from "../../../api/andamentos";
import GroupIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LensIcon from "@mui/icons-material/Lens";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { enqueueSnackbar } from "notistack";
import { useLocation } from "react-router-dom";

const EditUsersModal = ({
  open,
  users,
  handleClose,
  handleAddUser,
  handleRemoveUser,
  handleSave,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [principalUserId, setPrincipalUserId] = useState(null);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] =
    useState(false);
  const [userToBeRemoved, setUserToBeRemoved] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastPrincipalUserId, setLastPrincipalUserId] = useState(null);
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};

  const fetchResponsaveis = async () => {
    try {
      const response = await fetch(
        `${API_QUERY}/api/Usuario`
      );
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setOptions(data);
      } else {
        setOptions([]); 
      }
    } catch (error) {
      setOptions([]); 
    }
  };

  useEffect(() => {
    fetchResponsaveis();
  }, []); // Buscar os responsáveis quando o componente for montado

  const handleInputChange = (event, newValue) => {
    setSelectedUser(newValue); // Agora armazena o objeto do usuário selecionado
  };

  const handleAddClick = () => {
    // Verifica se o selectedUser está definido (não é null nem undefined)
    if (!selectedUser) {
      // Aciona o snackbar avisando que o campo está vazio
      enqueueSnackbar("Campo vazio. Por favor, selecione um responsável.", {
        variant: "info",
      });
      return; // Encerra a execução da função para não prosseguir
    }

    // Verifica se o usuário selecionado já está na lista de usuários
    const userAlreadyExists = users.some(
      (user) => user.nome === selectedUser.nome
    );

    if (!userAlreadyExists) {
      handleAddUser(selectedUser); // Adiciona o usuário se ele não existir na lista
      setSelectedUser(null); // Limpa a seleção após adicionar
      setInputValue(""); // Limpa o valor do input
      setHasChanges(true);
    } else {
      enqueueSnackbar("Responsável já vinculado. Por favor, selecione outro.", {
        variant: "error",
      });
    }
  };

  const handleInputValueChange = (event, newInputValue) => {
    setInputValue(newInputValue); // Atualiza o valor do input
  };

  const textStyle = {
    fontFamily: '"Open Sans", Helvetica, sans-serif',
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "16px",
    letterSpacing: "0em",
    textAlign: "left",
    color: "rgba(0, 0, 0, 0.6)",
  };

  const deleteTextStyle = {
    fontFamily: '"Open Sans", Helvetica, sans-serif',
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: "15px",
    letterSpacing: "0em",
    textAlign: "left",
    color: "rgba(237, 85, 101, 1)",
  };

  useEffect(() => {
    if (
      lastPrincipalUserId !== null &&
      users.some((user) => user.id === lastPrincipalUserId)
    ) {
      setPrincipalUserId(lastPrincipalUserId);
    } else if (users.find((user) => user.isPrincipal)) {
      setPrincipalUserId(users.find((user) => user.isPrincipal).id);
    } else if (users.length > 0) {
      setPrincipalUserId(users[0].id); // ou users[users.length - 1].id para o último usuário da lista se preferir
    }
  }, [users, lastPrincipalUserId]);

  const reorderUsersWithPrincipalFirst = (users, principalUserId) => {
    if (!principalUserId) return users; // Retorna a lista inalterada se não houver um principalUserId definido

    // Encontra o índice do usuário principal na lista original
    const principalUserIndex = users.findIndex(
      (user) => user.id === principalUserId
    );

    if (principalUserIndex === -1) return users; // Retorna a lista inalterada se não encontrar o usuário principal

    // Cria uma cópia da lista com o usuário principal removido
    let reorderedUsers = [...users];
    const [principalUser] = reorderedUsers.splice(principalUserIndex, 1);

    // Insere o usuário principal no início da lista
    reorderedUsers.unshift(principalUser);

    return reorderedUsers;
  };

  const handleRadioChange = (userId) => {
    setPrincipalUserId(userId);
    setLastPrincipalUserId(userId); // Atualiza o último ID de usuário principal selecionado
    setHasChanges(true);
  };

  const handleSave1 = async () => {
    if (!hasChanges) {
      setSelectedUser(null); // Limpa a seleção após adicionar
      setInputValue(""); // Limpa o valor do input
      // Não há mudanças, exibir snackbar informando o usuário
      enqueueSnackbar("Nenhuma alteração detectada.", { variant: "info" });
      return; // Encerra a função para não continuar com o salvamento
    }

    const usersToSave = users.map((user) => ({
      id: user.usuarioId == null ? 0 : user.id,
      usuarioId: user.usuarioId == null ? user.id : user.usuarioId,
      principal: principalUserId === user.id,
    }));

    try {
      const response = await fetch(
        `http://10.0.72.13:5000/gateway/processo/editar/${processoSelecionadoId}/responsavel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(usersToSave),
        }
      );

      if (response.ok) {
        enqueueSnackbar("Responsável alterado com sucesso.", {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      }
    } catch (error) {
    }

    handleSave();
    fetchResponsaveis();
    setHasChanges(false);
  };

  const handleRemoveUserModal = (userId) => {
    const isPrincipal = userId === principalUserId; // Verifica se o usuário é o principal
    if (isPrincipal) {
      setShowAlertModal(true); // Mostra a modal de confirmação
    } else {
      setUserToBeRemoved(userId); // Armazena o ID do usuário a ser removido
      setShowConfirmModal(true); // Mostra a modal de confirmação
    }
  };

  const confirmRemoveUser = () => {
    handleRemoveUser(userToBeRemoved);
    setShowConfirmModal(false); // Fecha a modal de confirmação
    setUserToBeRemoved(null); // Limpa o usuário a ser removido
    setHasChanges(true);
  };

  // Função para cancelar a exclusão
  const cancelRemoveUser = () => {
    setShowConfirmModal(false); // Fecha a modal de confirmação
    setShowAlertModal(false); // Fecha a modal de confirmação
    setShowChangesNotSavedModal(false); // Fecha a modal de confirmação
    setUserToBeRemoved(null); // Limpa o usuário a ser removido
    setInputValue("");
  };

  // Modifique o handleClose para incluir a verificação de mudanças
  const handleCloseWithConfirmation = () => {
    if (hasChanges) {
      setShowChangesNotSavedModal(true);
      setSelectedUser(null); // Limpa a seleção após adicionar
      setInputValue(""); // Limpa o valor do input
    } else {
      setSelectedUser(null); // Limpa a seleção após adicionar
      setInputValue(""); // Limpa o valor do input
      fetchResponsaveis();
      handleClose(); // Se não houver mudanças, simplesmente feche o modal
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseWithConfirmation}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { width: "844px", height: "571px" },
      }}
    >
      <DialogTitle
        sx={{
          background: "rgba(28, 82, 151, 1)",
          width: "844px",
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
          Editar responsáveis
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleCloseWithConfirmation}
          sx={{
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ marginBottom: 2, marginTop: 3 }}
        >
          <Grid item xs={5.7}>
            <InputLabel sx={{ marginBottom: 2 }}>Nome</InputLabel>
            <Autocomplete
              noOptionsText="Dados não encontrados"
              closeText="Fechar"
              clearText="Limpar"
              openText="Abrir"
              options={options}
              getOptionLabel={(option) => option.nome || ""}
              value={selectedUser}
              inputValue={inputValue}
              onInputChange={handleInputValueChange}
              onChange={handleInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  placeholder="Busque por nome, cpf ou cnpj"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ marginRight: "-2px", marginTop: "-5px" }}
                      >
                        <SearchIcon
                          sx={{
                            fontSize: "14px",
                            fontWeight: "900",
                            lineHeight: "12px",
                            letterSpacing: "0em",
                            textAlign: "center",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: "353px",
                    height: "32px",
                    borderRadius: "4px",
                    border: "0.7px solid rgba(0, 0, 0, 0.3)",
                    gap: "10px",
                    "& .MuiInputBase-root": {
                      height: "32px",
                    },
                    "& .MuiOutlinedInput-input": {
                      marginTop: "-5px",
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={4} sx={{ marginTop: 4 }}>
            <Button
              sx={{
                width: "190px",
                height: "32px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              variant="contained"
              startIcon={
                <AddIcon style={{ fontSize: "17px", fontWeight: 900 }} />
              } // Ajustando o tamanho do ícone
              onClick={handleAddClick}
            >
              Adicionar Responsável
            </Button>
          </Grid>
        </Grid>

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
            marginTop: 5,
          }}
        >
          Responsáveis
        </Typography>
        <List>
          <FlipMove duration={150} easing="ease-out">
            {reorderUsersWithPrincipalFirst(users, principalUserId).map(
              (user, index) => (
                <ListItem
                  key={user.id}
                  sx={{
                    height: "55px",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    mb: 1,
                    borderRadius: "4px",
                    p: 1,
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={4}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: '"Open Sans", Helvetica, sans-serif',
                          fontSize: "14px",
                          fontWeight: 400,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          textAlign: "left",
                          color: "rgba(0, 0, 0, 0.6)",
                          marginLeft: 1,
                        }}
                      >
                        {user.nome}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" sx={textStyle}>
                        MG61191
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Open Sans", Helvetica, sans-serif',
                          fontSize: "14px",
                          fontWeight: 400,
                          lineHeight: "16px",
                          letterSpacing: "0em",
                          textAlign: "left",
                          color: "rgba(0, 0, 0, 0.6)",
                          marginLeft: -1,
                        }}
                      >
                        Advogado
                      </Typography>
                    </Grid>
                    <Grid item xs={2} container alignItems="center">
                      <FormControlLabel
                        value="success"
                        control={
                          <Radio
                            checked={principalUserId === user.id}
                            onChange={() => handleRadioChange(user.id)}
                            color="success"
                          />
                        }
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Open Sans", Helvetica, sans-serif',
                          fontSize: "12px",
                          fontWeight: 600,
                          lineHeight: "17.7px",
                          letterSpacing: "0em",
                          textAlign: "left",
                          color: "rgba(103, 106, 108, 1)",
                          marginLeft: -2,
                        }}
                        component="span"
                      >
                        Principal
                      </Typography>
                    </Grid>
                    <Grid item xs={2} container alignItems="center">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveUserModal(user.id)}
                        sx={{
                          color: "rgba(237, 85, 101, 1)",
                          marginLeft: 3,
                          "&:hover": {
                            backgroundColor: "transparent", // Remove o efeito de fundo no hover
                          },
                        }}
                      >
                        <DeleteIcon
                          sx={{ fontSize: "14px", marginRight: 0.5 }}
                        />
                        <Typography
                          variant="body2"
                          sx={deleteTextStyle}
                          component="span"
                        >
                          Excluir
                        </Typography>
                      </IconButton>
                    </Grid>
                  </Grid>
                </ListItem>
              )
            )}
          </FlipMove>
        </List>
      </DialogContent>
      <DialogActions
        sx={{
          marginRight: 4,
          marginTop: 2,
        }}
      >
        <Button
          onClick={handleCloseWithConfirmation}
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
          onClick={handleSave1}
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

      <Dialog
        open={showConfirmModal}
        onClose={cancelRemoveUser}
        sx={{
          "& .MuiPaper-root": {
            // Este seletor atinge o Paper component que Dialog usa internamente para seu layout
            width: "547px",
            height: "292px",
            maxWidth: "none", // Isso garante que o Dialog não tente se ajustar além do width especificado
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#ED5565",
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
              <FontAwesomeIcon icon={faTrash} />
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
              Excluir
            </Typography>
          </div>
          {/* Botão para fechar o modal */}
          <IconButton
            aria-label="close"
            onClick={cancelRemoveUser} // Supondo que cancelRemoveUser seja a função para fechar o modal
            sx={{
              color: "rgba(255, 255, 255, 1)", // Define a cor do ícone de fechamento
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "50px" }}
          >
            Tem certeza que deseja excluir esse responsável do processo?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Ao realizar essa ação, o responsável em questão não terá mais acesso
            ao processo e não receberá mais notificações relacionadas a ele.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={confirmRemoveUser}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "110px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#ED5565",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, excluir
          </Button>
          <Button
            onClick={cancelRemoveUser}
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
      <Dialog
        open={showAlertModal}
        onClose={cancelRemoveUser}
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
            background: "#FAAD14CC",
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
            onClick={cancelRemoveUser} // Supondo que cancelRemoveUser seja a função para fechar o modal
            sx={{
              color: "rgba(255, 255, 255, 1)", // Define a cor do ícone de fechamento
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography
            component="div"
            style={{ marginTop: "40px" }}
            sx={{
              color: "rgba(113, 113, 113, 0.80)",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
            }}
          >
            Este responsável é o principal. Para excluí-lo, selecione outro
            responsável para assumir o papel principal.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={cancelRemoveUser}
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
          <Button
            onClick={cancelRemoveUser}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "42px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#FBBD43",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showChangesNotSavedModal}
        onClose={() => setShowChangesNotSavedModal(false)}
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
            background: "#FAAD14CC",
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
            onClick={cancelRemoveUser} // Supondo que cancelRemoveUser seja a função para fechar o modal
            sx={{
              color: "rgba(255, 255, 255, 1)", // Define a cor do ícone de fechamento
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
              // Ação para "Sair" (fechar o modal de edição e descartar mudanças)
              setShowChangesNotSavedModal(false);
              handleClose(); // Chama a função de fechamento original
              setHasChanges(false); // Reseta o estado de mudança
              setLastPrincipalUserId(null);
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
    </Dialog>
  );
};

const ResponsibleCard = () => {
  const location = useLocation();
  const { processoSelecionadoId, numeroProcesso } = location.state || {};
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const { andamentos: lists, isLoading } = useGetAndamentos(
    formData,
    processoSelecionadoId
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [orderDirection, setOrderDirection] = useState("none"); // 'none', 'asc', ou 'desc'

  const handleOrderClick = () => {
    setOrderDirection((prevDirection) => {
      if (prevDirection === "none") return "asc";
      if (prevDirection === "asc") return "desc";
      return "none";
    });
  };

  const marcoTrueLists = useMemo(() => {
    if (lists && lists.length) {
      return lists.filter((item) => item.marco === true);
    }
    return [];
  }, [lists]);

  const formatDate = (dateStr) => {
    const parts = dateStr.split("/");
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
  };

  const timelineItems = useMemo(() => {
    const sortedList = [...marcoTrueLists];
    if (orderDirection !== "none") {
      sortedList.sort((a, b) => {
        const dateA = new Date(formatDate(a.dataCriacao));
        const dateB = new Date(formatDate(b.dataCriacao));
        return orderDirection === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    return sortedList.map((item) => ({
      id: item.id,
      date: new Date(formatDate(item.dataCriacao)).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      title: item.nomeTipoAndamento,
    }));
  }, [marcoTrueLists, orderDirection]);

  const maxPage = Math.ceil(timelineItems.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return timelineItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, timelineItems]);

  const nextPage = () => {
    setCurrentPage((current) => Math.min(current + 1, maxPage));
  };

  const prevPage = () => {
    setCurrentPage((current) => Math.max(current - 1, 1));
  };

  const [items, setItems] = useState([
    { id: 1, name: "Wagner Augusto de Oliveira", checked: true },
    { id: 2, name: "Rosangela da Silva", checked: false },
    { id: 3, name: "Eduardo", checked: false },
    { id: 4, name: "Lucas", checked: false },
    { id: 5, name: "German", checked: false },
    // Adicione mais itens aqui se necessário
  ]);

  // Movendo fetchData para fora do useEffect para reutilização
  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://10.0.72.13:5000/gateway/processo/resumo/${processoSelecionadoId}/responsaveis`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const sortedData = data.sort((a, b) => b.principal - a.principal);
      setItems(sortedData);
      const principalItem = sortedData.find((item) => item.principal);
      if (principalItem) setSelected(principalItem.id);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selected, setSelected] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [responsibleCardHeight, setResponsibleCardHeight] = useState(0);
  const responsibleCardRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen1, setModalOpen1] = useState(false);

  const handleOpenModal = () => {
    // Se "showAll" estiver verdadeiro, altera para falso, simulando um clique em "Ver Menos"
    if (showAll) {
      setShowAll(false);
    }
    fetchData();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCloseModal1 = () => {
    setModalOpen1(false);
    setTempSelectedId(null);
  };

  const handleRefresh = () => {
    fetchData(); // Chama fetchData para atualizar os itens
  };

  const handleAddUser = (novoResponsavel) => {
    // Lógica para adicionar um novo responsável na listagem já existente
    const newUser = { id: novoResponsavel.id, nome: novoResponsavel.nome };
    setItems([...items, newUser]);
    setShowAll(true);
    setShowAll(false);
  };

  const handleRemoveUser = (userId) => {
    const updatedItems = items.filter((item) => item.id !== userId);
    setItems(updatedItems);
    setShowAll(false);
  };

  const handleSave = () => {
    handleCloseModal();
    setShowAll(true);
  };

  const updateTimelineMargin = () => {
    if (responsibleCardRef.current) {
      setResponsibleCardHeight(responsibleCardRef.current.clientHeight);
    }
  };

  useEffect(() => {
    updateTimelineMargin();
  }, [showAll]);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const [tempSelectedId, setTempSelectedId] = useState(null);
  const [tempSelectedName, setTempSelectedName] = useState("");

  const handleCheck = async (id) => {
    const selectedItem = items.find((item) => item.id === id);
    if (selectedItem) {
      setTempSelectedId(id);
      setTempSelectedName(selectedItem.nome);
      setModalOpen1(true);
    }
  };

  const confirmCheck = async (id) => {
    handleCloseModal1();
    setSelected(id);

    // Marca o novo responsável principal e prepara a lista de items
    const updatedItems = items.map((item) => ({
      ...item,
      principal: item.id === id,
    }));

    // Move o responsável principal para o topo da lista
    const principalItem = updatedItems.find((item) => item.principal);
    const otherItems = updatedItems.filter((item) => !item.principal);
    const reorderedItems = [principalItem, ...otherItems];

    setItems(reorderedItems);

    setTimeout(() => {}, 300);

    // Prepara os dados para salvar conforme a nova estrutura necessária
    const usersToSave = reorderedItems.map((user) => ({
      id: user.id,
      usuarioId: user.usuarioId ?? user.id,
      principal: user.principal,
    }));

    try {
      const response = await fetch(
        `http://10.0.72.13:5000/gateway/processo/editar/${processoSelecionadoId}/responsavel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(usersToSave),
        }
      );

      if (response.ok) {
      }
    } catch (error) {
    }
  };

  const handleViewDetails = (id) => {
    eventEmitter.emit("navigateToAndamentos", id);
  };

  return (
    <Box sx={{ position: "absolute", top: 0, right: 0 }}>
      <Card
        ref={responsibleCardRef}
        sx={{
          minWidth: 275,
          minHeight: 163,
          backgroundColor: "#FAAD1426",
          overflow: "hidden",
          position: "absolute",
          top: 0,
          right: 0,
          mb: 2,
        }}
      >
        <CardHeader
          avatar={<GroupIcon sx={{ color: "#1C5297" }} />}
          action={
            <Tooltip title="Editar Responsáveis">
              <IconButton aria-label="edit" onClick={handleOpenModal}>
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  style={{ color: "#1C5297" }}
                />
              </IconButton>
            </Tooltip>
          }
          title="Responsáveis"
          titleTypographyProps={{
            color: "#1C5297",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
          sx={{
            paddingBottom: "0px",
            "& .MuiCardHeader-action": {
              marginTop: "0px",
            },
          }}
        />
        <List dense sx={{ color: "#1C5297" }}>
          {items.slice(0, showAll ? items.length : 2).map((item) => (
            <ListItem key={item.id} onClick={() => handleCheck(item.id)} dense>
              <Tooltip title="Tornar Responsável Principal" placement="top">
                <Box
                  sx={{
                    position: "relative",
                    left: "3px",
                    paddingRight: "4px",
                  }}
                >
                  <Radio
                    edge="start"
                    checked={selected === item.id}
                    tabIndex={-1}
                    disableRipple
                    color="success"
                  />
                </Box>
              </Tooltip>
              <ListItemText
                primary={item.nome}
                primaryTypographyProps={{ noWrap: true, fontWeight: "medium" }}
              />
            </ListItem>
          ))}
        </List>

        <CardContent sx={{ paddingTop: "0px", paddingBottom: "16px" }}>
          <Typography
            variant="body2"
            onClick={handleShowAll}
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "text.secondary",
            }}
          >
            {showAll ? "Ver Menos" : "Ver Todos"}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: `${26 + responsibleCardHeight}px` }}>
        <Card
          sx={{
            minWidth: 275,
            backgroundColor: "#F5F5F5",
            border: "none",
            overflow: "hidden",
          }}
        >
          <CardHeader
            title={
              <Box
                sx={{ display: "flex", alignItems: "center", marginTop: -2 }}
              >
                <Typography
                  sx={{
                    color: "#1C5297",
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginBottom: "-10px",
                  }}
                >
                  Linha do Tempo
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    ml: 1,
                    marginTop: 1.5,
                  }}
                >
                  <IconButton
                    onClick={handleOrderClick}
                    size="small"
                    sx={{
                      mb: -1.4,
                      opacity:
                        orderDirection === "asc" || orderDirection === "none"
                          ? 1
                          : 0.5,
                      "&:hover": { backgroundColor: "transparent" },
                      padding: 0,
                    }}
                  >
                    <ArrowDropUpIcon sx={{ color: "#1C447C" }} />
                  </IconButton>
                  <IconButton
                    onClick={handleOrderClick}
                    size="small"
                    sx={{
                      mt: -1.4,
                      opacity:
                        orderDirection === "desc" || orderDirection === "none"
                          ? 1
                          : 0.5,
                      "&:hover": { backgroundColor: "transparent" },
                      padding: 0,
                    }}
                  >
                    <ArrowDropDownIcon sx={{ color: "#1C447C" }} />
                  </IconButton>
                </Box>
              </Box>
            }
          />
          {timelineItems.length > 0 ? (
            <>
              <List dense sx={{ color: "#1C5297", position: "relative" }}>
                {currentItems.map((item, index) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        pr: 2,
                      }}
                    >
                      {index < timelineItems.length - 0 ? (
                        <CheckCircleIcon
                          sx={{ color: "#4CAF50", fontSize: "0.875rem" }}
                        />
                      ) : (
                        <LensIcon
                          sx={{ color: "#1C5297", fontSize: "0.875rem" }}
                        />
                      )}
                      {index < timelineItems.length - 1 && (
                        <Box
                          sx={{
                            width: "0.5px",
                            bgcolor: "#4CAF50",
                            height: "70px",
                            mt: "0.4rem",
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTimeIcon
                              sx={{
                                fontSize: "0.875rem",
                                mr: 1,
                                color: "inherit",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "inherit" }}
                            >
                              {item.date}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{
                          fontWeight: "medium",
                          color: "#4ECC8F",
                          marginTop: "-9px",
                          marginBottom: "5px",
                          fontSize: "14px",
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <VisibilityIcon
                          sx={{ fontSize: "0.875rem", mr: 1, color: "#8c8c8c" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", cursor: "pointer" }}
                          onClick={() => handleViewDetails(item.id)}
                        >
                          Ver detalhes
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
              {maxPage > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <Button disabled={currentPage === 1} onClick={prevPage}>
                    Anterior
                  </Button>
                  <Button disabled={currentPage === maxPage} onClick={nextPage}>
                    Próximo
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography sx={{ p: 2 }}>Sem marcos disponíveis.</Typography>
          )}
        </Card>
      </Box>

      <Dialog
        open={modalOpen1}
        onClose={handleCloseModal1}
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
            background: "#FAAD14CC",
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
            onClick={handleCloseModal1} // Supondo que cancelRemoveUser seja a função para fechar o modal
            sx={{
              color: "rgba(255, 255, 255, 1)", // Define a cor do ícone de fechamento
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
            Está prestes a ser realizada a designação de {tempSelectedName} como
            responsável principal.
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Tem certeza que deseja proceder com esta mudança?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // Ação para "Cancelar" (manter o modal de edição aberto)
              handleCloseModal1();
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
          <Button
            onClick={() => confirmCheck(tempSelectedId)}
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
        </DialogActions>
      </Dialog>

      <EditUsersModal
        open={modalOpen}
        users={items}
        handleClose={() => {
          handleCloseModal();
          fetchData();
        }}
        handleAddUser={handleAddUser}
        handleRemoveUser={handleRemoveUser}
        handleSave={() => {
          handleSave();
          handleRefresh(); // Chame handleRefresh aqui para atualizar após salvar
        }}
      />
    </Box>
  );
};

export default ResponsibleCard;
