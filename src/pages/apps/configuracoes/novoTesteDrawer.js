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

function DrawerTeste({ teste, hideButton = false }) {
  // Estado interno para controlar se o drawer está aberto
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [descricao, setDescricao] = useState("");
  const [descricaoConclusao, setDescricaoConclusao] = useState("");
  const [controles, setControle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [statuss] = useState([
    { id: 1, nome: "Não Iniciado" },
    { id: 2, nome: "Em Teste" },
    { id: 3, nome: "Em Revisão" },
    { id: 4, nome: "Concluído" },
    { id: 5, nome: "Revisado" },
  ]);

  const [formData, setFormData] = useState({
    status: "",
    controle: "",
  });

  useEffect(() => {
    fetchData(
      `${API_URL}controls`,
      setControle
    );
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCompany, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id: item.idControl,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  // Quando o prop "teste" mudar (modo edição), abre o drawer e preenche os campos
  useEffect(() => {
    if (teste) {
      const fetchTestData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${API_URL}projects/tests/${teste.idTest}`,
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
            data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : null
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
          enqueueSnackbar("Erro ao buscar dados do teste.", { variant: "error" });
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
        url = `${API_URL}projects/tests`;
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
        url = `${API_URL}projects/tests`;
        method = "POST";
        payload = {
          idControl:
            formData.controle === null || formData.controle === ""
              ? null
              : formData.controle,
          description: descricao,
          expectedCompletionDate: expectedCompletionDate
            ? expectedCompletionDate.toISOString()
            : null,
          idProject: dadosApi.idProject,
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
            `${API_URL}projects/tests`;
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
            throw new Error("Erro ao atualizar a porcentagem do teste.");
          }
        }
      }

      enqueueSnackbar(
        teste
          ? "Teste atualizado com sucesso!"
          : "Teste cadastrado com sucesso!",
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
        <Tooltip title="Cadastre um teste" arrow placement="top">
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
              {teste ? "Editar teste" : "Cadastrar teste"}
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
                    Controle
                  </InputLabel>
                  <Autocomplete
                    options={controles}
                    getOptionLabel={(option) => option.nome}
                    value={
                      controles.find(
                        (controle) => controle.id === formData.controle
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        controle: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Descrição do teste *
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
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Data Prevista de Conclusão
                  </InputLabel>
                  <DatePicker
                    value={expectedCompletionDate}
                    onChange={(newValue) => setExpectedCompletionDate(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Data de Conclusão
                  </InputLabel>
                  <DatePicker
                    value={completionDate}
                    onChange={(newValue) => setCompletionDate(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Status
                  </InputLabel>
                  <Autocomplete
                    options={statuss}
                    getOptionLabel={(option) => option.nome}
                    value={
                      statuss.find((status) => status.id === formData.status) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        status: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Descrição da conclusão
                  </InputLabel>
                  <TextField
                    multiline
                    rows={2}
                    onChange={(event) =>
                      setDescricaoConclusao(event.target.value)
                    }
                    fullWidth
                    value={descricaoConclusao}
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

export default DrawerTeste;
