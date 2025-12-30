/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Autocomplete,
  Checkbox,
  Stack,
  InputLabel,
  Drawer,
  Box,
  Tooltip,
} from "@mui/material";
import axios from "axios";
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
  const normativeId = dadosApi?.idNormative || dadosApi;
  const [nome, setNome] = useState("");
  const [riscos, setRiscoAssociados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [descricao, setDescricao] = useState("");

  const [formData, setFormData] = useState({
    risco: [],
  });

  useEffect(() => {
    fetchData(
      `${API_URL}risks`,
      setRiscoAssociados
    );
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idControl, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id: item.idRisk,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    if (acionista) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/parts/${acionista.idNormativePart}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados da normativa");
          }

          const data = await response.json();
          setNome(data.code);
          setDescricao(data.description);
          setFormData((prev) => ({
            ...prev,
            risco: data.idRisks,
          }));
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (acionista) {
        fetchEmpresaDados();
      }
      setOpen(true);
    }
  }, [acionista]);

  // Se o drawer for aberto sem edição (novo cadastro), limpa os campos
  useEffect(() => {
    if (open && !acionista) {
      setNome("");
      setDescricao("");
    }
  }, [open, acionista]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const allSelected =
    formData.risco.length === riscos.length && riscos.length > 0;

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.risco.length === riscos.length) {
        // Deselect all
        setFormData({ ...formData, risco: [] });
      } else {
        // Select all
        setFormData({ ...formData, risco: riscos.map((risco) => risco.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "risco",
        newValue.map((item) => item.id)
      );
    }
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    if (!nome.trim() || !descricao.trim()) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      if (acionista) {
        // Modo edição: Atualiza o acionista incluindo o campo porcentagem (caso informado)
        url = `${API_URL}normatives/${acionista.idNormativePart}/parts`;
        method = "PUT";
        payload = {
          idNormativePart: acionista.idNormativePart,
          code: nome,
          description: descricao,
          idRisks: formData.risco,
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
          throw new Error("Erro ao enviar os dados do acionista.");
        }
      } else {
        // Modo cadastro: O payload do POST não inclui o campo porcentagem.
        url = `${API_URL}normatives/${normativeId}/parts`;
        method = "POST";
        payload = {
          code: nome,
          description: descricao,
          idNormative: normativeId,
          idRisks: formData.risco,
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
      }

      enqueueSnackbar(
        acionista
          ? "Trecho atualizado com sucesso!"
          : "Trecho cadastrado com sucesso!",
        { variant: "success" }
      );

      if (formData.risco.length > 0 && normativeId) {
        await updateRisksWithNormative(formData.risco, normativeId);
      }

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

  const updateRisksWithNormative = async (riskIds, normativeId) => {
    for (const riskId of riskIds) {
      try {
        // 1. Consultar o endpoint de risco para pegar o conteúdo atual
        const response = await axios.get(`${API_URL}risks/${riskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let riskData = response.data;

        // 2. Adicionar a normativa pai do trecho ao array idNormatives
        if (!riskData.idNormatives) {
          riskData.idNormatives = [];
        }
        if (!riskData.idNormatives.includes(normativeId)) {
          riskData.idNormatives.push(normativeId);
        }

        // 3. Fazer um PUT no risco informando essa normativa
        // Criar um novo objeto de payload com apenas os campos necessários para o PUT
        const putPayload = {
          idRisk: riskData.idRisk,
          code: riskData.code,
          name: riskData.name,
          description: riskData.description,
          date: riskData.date,
          treatmentDescription: riskData.treatmentDescription,
          idResponsible: riskData.idResponsible,
          active: riskData.active,
          idCategory: riskData.idCategory,
          idTreatment: riskData.idTreatment,
          idControlCause: riskData.idControlCause,
          idCause: riskData.idCause,
          idControlImpact: riskData.idControlImpact,
          idImpact: riskData.idImpact,
          idRiskAssociates: riskData.idRiskAssociates,
          idStrategicGuidelines: riskData.idStrategicGuidelines,
          idFactors: riskData.idFactors,
          idIncidents: riskData.idIncidents,
          idCauses: riskData.idCauses,
          idImpacts: riskData.idImpacts,
          idNormatives: Array.from(new Set([...(riskData.normatives || []).map(n => n.idNormative), normativeId])), // Extrai os IDs existentes, adiciona o novo e remove duplicatas
        };

        await axios.put(`${API_URL}risks`, putPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        enqueueSnackbar(`Risco ${riskData.name} atualizado com sucesso!`, { variant: "success" });
      } catch (error) {
        console.error(`Erro ao atualizar o risco ${riskId}:`, error);
        enqueueSnackbar(`Erro ao atualizar o risco ${riskId}.`, { variant: "error" });
      }
    }
  };

  const handleOpen = () => {
    setNome("");
    setDescricao("");
    setFormData({ risco: [] });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {!hideButton && (
        <Tooltip title="Cadastre um trecho" arrow placement="top">
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
              {acionista ? "Editar trecho" : "Cadastrar trecho"}
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
                    rows={3}
                    fullWidth
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Riscos
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...riscos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.risco.map(
                      (id) => riscos.find((risco) => risco.id === id) || id
                    )}
                    onChange={handleSelectAll}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
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
