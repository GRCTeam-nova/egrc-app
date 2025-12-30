/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
  Button,
  Tooltip,
  TextField,
  Grid,
  Stack,
  Autocomplete,
  InputLabel,
  Drawer,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
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
import axios from "axios";

function ColumnsLayoutsDrawer({ buttonSx, onIncidentCreated }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nomeIncidente, setNome] = useState("");
  const [tiposIncidentes, setTipoIncidentes] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    tipoIncidente: "",
    dataIndice: null,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (open) {
      setNome("");
      setCodigo("");
      setFormData({
        tipoIncidente: "",
        dataIndice: null,
      });
      setFormValidation({ nomeIncidente: true, codigo: true, dataIndice: true, tiposIncidentes: true });
      setHasChanges(false);
      fetchData(
        `${process.env.REACT_APP_API_URL}incidents/types`,
        setTipoIncidentes
      );
    }
  }, [open]);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const transformedData = response.data.map((item) => ({
        id: item.idIncidentType,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const [formValidation, setFormValidation] = useState({
    nomeIncidente: true,
    codigo: true,
    dataIndice: true,
    tiposIncidentes: true,
  });

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeIncidente.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeIncidente: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.dataIndice) {
      setFormValidation((prev) => ({ ...prev, dataIndice: false }));
      missingFields.push("Data");
    }
    if (!formData.tipoIncidente) {
      setFormValidation((prev) => ({ ...prev, tipoIncidente: false }));
      missingFields.push("Tipo do Incidente");
    }
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingFields.join(" e ")} são obrigatórios!`,
        { variant: "error" }
      );
      return;
    }

    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}incidents`;
      method = "POST";
      payload = {
        name: nomeIncidente,
        code: codigo,
        date: formData.dataIndice ? formData.dataIndice.toISOString() : null,
        idIncidentType:
          formData.tipoIncidente && formData.tipoIncidente !== ""
            ? formData.tipoIncidente
            : null,
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
        throw new Error("Não foi possível cadastrar o incidente.");
      }

      const data = await response.json();

      enqueueSnackbar(`Incidente ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      if (onIncidentCreated) {
        const novoIncidente = {
          id: data.data.idIncident,
          nome: nomeIncidente,
        };
        onIncidentCreated(novoIncidente);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar o incidente.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre um incidente" arrow placement="top">
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
              Cadastrar Incidente
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
                    value={nomeIncidente}
                    error={!nomeIncidente && !formValidation.nomeIncidente}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Data *
                  </InputLabel>
                  <DatePicker
                    value={formData.dataIndice || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataIndice: newValue,
                      }));
                    }}
                    slotProps={{
                      textField: {
                        placeholder: "00/00/0000",
                      },
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Tipo do Incidente *
                  </InputLabel>
                  <Autocomplete
                    options={tiposIncidentes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposIncidentes.find(
                        (tipoIncidente) =>
                          tipoIncidente.id === formData.tipoIncidente
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoIncidente: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoIncidente &&
                          formValidation.tipoIncidente === false
                        }
                      />
                    )}
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
