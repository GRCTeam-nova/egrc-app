import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { PlusOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { useLocation } from "react-router-dom";

import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import emitter from "./eventEmitter";

function DrawerAtributo({
  teste,
  hideButton = false,
  open: openProp,
  onClose,
}) {
  const isControlled = typeof openProp === "boolean";
  const [openInternal, setOpenInternal] = useState(false);
  const open = isControlled ? openProp : openInternal;

  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = useMemo(() => Boolean(teste?.idAttribute), [teste]);

  const setOpenSafe = (value) => {
    if (isControlled) {
      if (!value && typeof onClose === "function") onClose();
      return;
    }
    setOpenInternal(value);
  };

  useEffect(() => {
    if (!open) return;

    if (isEditMode) {
      setCodigo(teste?.code ?? "");
      setNome(teste?.name ?? "");
      setDescricao(teste?.description ?? "");
      return;
    }

    setNome("");
    setCodigo("");
    setDescricao("");
  }, [open, isEditMode, teste]);

  const tratarSubmit = async () => {
    const codeTrim = String(codigo ?? "").trim();
    const nameTrim = String(nome ?? "").trim();
    const descTrim = String(descricao ?? "").trim();

    if (!codeTrim || !nameTrim || !descTrim) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const url = `${process.env.REACT_APP_API_URL}projects/tests/phases/attributes`;
        const payload = {
          idAttribute: teste.idAttribute,
          code: codeTrim,
          name: nameTrim,
          description: descTrim,
        };

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData?.notifications?.[0]?.message ||
            "Erro ao atualizar o atributo.";
          throw new Error(errorMessage);
        }
      } else {
        const url = `${process.env.REACT_APP_API_URL}projects/tests/phases/attributes`;
        const payload = {
          code: codeTrim,
          name: nameTrim,
          description: descTrim,
          idTestPhase: dadosApi?.idTestPhase ?? null,
        };

        const postResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!postResponse.ok) {
          const errorData = await postResponse.json().catch(() => ({}));
          const errorMessage =
            errorData?.notifications?.[0]?.message ||
            "Erro ao cadastrar o atributo.";
          throw new Error(errorMessage);
        }
      }

      enqueueSnackbar(
        isEditMode
          ? "Atributo atualizado com sucesso!"
          : "Atributo cadastrado com sucesso!",
        { variant: "success" },
      );

      if (window.refreshOrgaos) {
        window.refreshOrgaos();
      }
      emitter.emit("refreshCustomers");

      setOpenSafe(false);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpenSafe(true);
  const handleClose = () => setOpenSafe(false);

  return (
    <>
      {!hideButton && (
        <Tooltip title="Cadastre um atributo" arrow placement="top">
          <Button
            variant="contained"
            onClick={handleOpen}
            startIcon={<PlusOutlined />}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Novo
          </Button>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: 670 } }}
      >
        <Box sx={{ width: 650, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box
              component="h2"
              sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}
            >
              {isEditMode ? "Editar atributo" : "Cadastrar atributo"}
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={12} mb={1.5}>
              <Stack spacing={1}>
                <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Código *
                </InputLabel>
                <TextField
                  onChange={(event) => setCodigo(event.target.value)}
                  fullWidth
                  value={codigo}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} mb={1.5}>
              <Stack spacing={1}>
                <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Nome *
                </InputLabel>
                <TextField
                  onChange={(event) => setNome(event.target.value)}
                  fullWidth
                  value={nome}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} mb={1.5}>
              <Stack spacing={1}>
                <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Descrição *
                </InputLabel>
                <TextField
                  multiline
                  rows={2}
                  onChange={(event) => setDescricao(event.target.value)}
                  fullWidth
                  value={descricao}
                />
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} mt={5} justifyContent="flex-end">
            <Button onClick={handleClose} variant="outlined">
              Cancelar
            </Button>
            <Button variant="contained" onClick={tratarSubmit}>
              Salvar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default DrawerAtributo;
