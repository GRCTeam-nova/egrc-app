/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Button,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
  Tooltip,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useLocation } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import emitter from "./eventEmitter";

function DrawerAtributo({ teste, hideButton = false }) {
  // Estado interno para controlar se o drawer está aberto
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [descricaoConclusao, setDescricaoConclusao] = useState("");
  const [loading, setLoading] = useState(false);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);

  const [formData, setFormData] = useState({
    status: "",
    controle: "",
  });

  // Quando o prop "teste" mudar (modo edição), abre o drawer e preenche os campos
  useEffect(() => {
    if (teste) {
      const fetchTestData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${API_URL}projects/tests/phases/attributes/${teste.idAttribute}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          // Supondo que os dados retornados possuam as propriedades utilizadas abaixo
          const data = response.data;
          setDescricao(data.description || "");
          setDescricaoConclusao(data.descriptionTestCompletion || "");
          setExpectedCompletionDate(
            data.expectedCompletionDate
              ? new Date(data.expectedCompletionDate)
              : null
          );
          setCompletionDate(
            data.completionDate ? new Date(data.completionDate) : null
          );
          setFormData((prev) => ({
            ...prev,
            controle: data.idControl || null,
            status: data.testConclusion || "",
          }));
          setOpen(true);
        } catch (error) {
          console.error("Erro ao buscar dados do teste:", error);
          enqueueSnackbar("Erro ao buscar dados do teste.", {
            variant: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchTestData();
    }
  }, [teste, token]);

  // Se o drawer for aberto sem edição (novo cadastro), limpa os campos
  useEffect(() => {
    if (open && !teste) {
      setNome("");
      setCodigo("");
      setDescricao("");
      setDescricaoConclusao("");
      setExpectedCompletionDate(null);
      setCompletionDate(null);
    }
  }, [open, teste]);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    if (!descricao.trim()) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      if (teste) {
        // Modo edição: Atualiza o teste incluindo os novos campos de data
        url =
          `${API_URL}projects/tests/phases/attributes`;
        method = "PUT";
        payload = {
          idControl:
            formData.controle === null || formData.controle === ""
              ? null
              : formData.controle,
          description: descricao,
          descriptionTestCompletion: descricaoConclusao,
          idTest: teste.idTest,
          expectedCompletionDate: expectedCompletionDate
            ? expectedCompletionDate.toISOString()
            : null,
          completionDate: completionDate ? completionDate.toISOString() : null,
          testConclusion: formData.status,
          active: true,
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
          throw new Error("Erro ao enviar os dados do teste.");
        }
      } else {
        // Modo cadastro: Inclui os campos de data no payload do POST
        url =
          `${API_URL}projects/tests/phases/attributes`;
        method = "POST";
        payload = {
          code: codigo,
          name: nome,
          description: descricao,
          idTestPhase: dadosApi.idTestPhase,
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
          throw new Error("Erro ao enviar os dados do teste.");
        }

        // Se o usuário informou uma descrição de conclusão, atualize o teste chamando o endpoint de PUT.
        if (descricaoConclusao.trim() !== "") {
          const createdData = await postResponse.json();
          const idTest = createdData.data.idTest;

          const editUrl =
            `${API_URL}projects/tests/phases/attributes`;
          const editPayload = {
            idTest,
            description: descricao,
            descriptionTestCompletion: descricaoConclusao,
            expectedCompletionDate: expectedCompletionDate
              ? expectedCompletionDate.toISOString()
              : null,
            completionDate: completionDate
              ? completionDate.toISOString()
              : null,
            testConclusion: formData.status,
            active: true,
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
            throw new Error("Erro ao atualizar o atributo.");
          }
        }
      }

      enqueueSnackbar(
        teste
          ? "Atributo atualizado com sucesso!"
          : "Atributo cadastrado com sucesso!",
        { variant: "success" }
      );

      if (window.refreshOrgaos) {
        window.refreshOrgaos();
      }
      emitter.emit("refreshCustomers");
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
              {teste ? "Editar atributo" : "Cadastrar atributo"}
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
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

export default DrawerAtributo;
