/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useLocation } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

function DrawerAcionista({ acionista, hideButton = false }) {
  // Estado interno para controlar se o drawer está aberto
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nome, setNome] = useState("");
  const [porcentagem, setPorcentagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [documento, setDocumento] = useState("");

  // Quando o prop "acionista" mudar (modo edição), abre o drawer e preenche os campos
  useEffect(() => {
    if (acionista) {
      setNome(acionista.name || "");
      setDocumento(acionista.document || "");
      setPorcentagem(
        acionista.percentage !== undefined && acionista.percentage !== null
          ? String(acionista.percentage)
          : ""
      );
      setOpen(true);
    }
  }, [acionista]);

  // Se o drawer for aberto sem edição (novo cadastro), limpa os campos
  useEffect(() => {
    if (open && !acionista) {
      setNome("");
      setDocumento("");
      setPorcentagem("");
    }
  }, [open, acionista]);

  const handleDocumentoChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    setDocumento(value);
  };

  // Controla a entrada no campo porcentagem, limitando a 100%
  const handlePorcentagemChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value !== "" && Number(value) > 100) {
      value = "100";
    }
    setPorcentagem(value);
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};
  
    if (!nome.trim() || !documento.trim()) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }
  
    try {
      setLoading(true);
  
      if (acionista) {
        // Modo edição: Atualiza o acionista incluindo o campo porcentagem (caso informado)
        url = `${API_URL}companies/shared-holders`;
        method = "PUT";
        payload = {
          idSharedholder: acionista.idSharedholder,
          name: nome,
          document: documento,
          percentage: porcentagem.trim() !== "" ? Number(porcentagem) : null,
          idActionType: null,
        };
  
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          throw new Error("Erro ao enviar os dados do acionista.");
        }
      } else {
        // Modo cadastro: O payload do POST não inclui o campo porcentagem.
        url = `${API_URL}companies/shared-holders`;
        method = "POST";
        payload = {
          name: nome,
          document: documento,
          idCompany: dadosApi.idCompany,
        };
  
        const postResponse = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
  
        if (!postResponse.ok) {
          throw new Error("Erro ao enviar os dados do acionista.");
        }
  
        // Se o usuário informou uma porcentagem, atualize o acionista chamando o endpoint de PUT.
        if (porcentagem.trim() !== "") {
          const createdData = await postResponse.json();
          const idSharedholder = createdData.data.idSharedholder;
  
          const editUrl = `${API_URL}companies/shared-holders`;
          const editPayload = {
            idSharedholder,
            name: nome,
            document: documento,
            percentage: Number(porcentagem),
            active: true,
            idActionType: null,
          };
  
          const editResponse = await fetch(editUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editPayload),
          });
  
          if (!editResponse.ok) {
            throw new Error("Erro ao atualizar a porcentagem do acionista.");
          }
        }
      }
  
      enqueueSnackbar(
        acionista
          ? "Acionista atualizado com sucesso!"
          : "Acionista cadastrado com sucesso!",
        { variant: "success" }
      );
  
      if (window.refreshOrgaos) {
        window.refreshOrgaos();
      }
      setOpen(false);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };
  

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
    {!hideButton && (
      <Tooltip title="Cadastre um participante" arrow placement="top">
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box
              component="h2"
              sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}
            >
              {acionista ? "Editar participante" : "Cadastrar participante"}
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Grid container spacing={2} marginTop={2}>
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
                    Documento *
                  </InputLabel>
                  <TextField
                    fullWidth
                    value={documento}
                    onChange={handleDocumentoChange}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Porcentagem
                  </InputLabel>
                  <TextField
                    onChange={handlePorcentagemChange}
                    fullWidth
                    value={porcentagem}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100, type: "number" },
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>

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

export default DrawerAcionista;
