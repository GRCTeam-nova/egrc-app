/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
  Button,
  Tooltip,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ColumnsLayoutsDrawer({ buttonSx, onDepartmentCreated }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nomeDepartamento, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (open) {
      setNome("");
      setCodigo("");
      setFormValidation({ nomeDepartamento: true, codigo: true });
      setHasChanges(false);
    }
  }, [open]);

  const [formValidation, setFormValidation] = useState({
    nomeDepartamento: true,
    codigo: true
  });

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeDepartamento.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeDepartamento: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingFields.join(" e ")} são obrigatórios!`,
        { variant: "error" }
      );
      return;
    }

    if (requisicao === "Criar") {
      url = `${API_URL}departments`;
      method = "POST";
      payload = {
        name: nomeDepartamento,
        code: codigo,
      };
    }

    try {
      setLoading(true);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível cadastrar o departamento.");
      }

      const data = await response.json();

      enqueueSnackbar(`Departamento ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      if (onDepartmentCreated) {
        const novoDepartamento = {
          id: data.data.idDepartment, 
          nome: nomeDepartamento,
        };
        onDepartmentCreated(novoDepartamento);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar o departamento.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre um departamento" arrow placement="top">
        <Button
  variant="contained"
  size="small"
  onClick={(event) => {
    event.stopPropagation();
    setOpen(true);
  }}
  sx={{ ...buttonSx }}
>
  <AddIcon sx={{ fontSize: "18px" }} />
</Button>


      </Tooltip>

      {/* Drawer substituindo Dialog */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
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
              Cadastrar departamento
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Código *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setCodigo(event.target.value)}
                    fullWidth
                    value={codigo}
                    error={!codigo && !formValidation.codigo}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Nome *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setNome(event.target.value)}
                    fullWidth
                    value={nomeDepartamento}
                    error={
                      !nomeDepartamento && !formValidation.nomeDepartamento
                    }
                  />
                </Stack>
              </Grid>

            </Grid>
          </LocalizationProvider>

          <Stack direction="row" spacing={2} mt={10} justifyContent="flex-end">
            <Button onClick={() => setOpen(false)} variant="outlined">
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

export default ColumnsLayoutsDrawer;
