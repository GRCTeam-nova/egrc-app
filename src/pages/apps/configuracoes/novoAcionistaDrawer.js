
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
  Tooltip,
  Select,
  MenuItem,
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

const normalizeActionTypeId = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return value;
};

const getActionTypesList = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData?.data?.actionTypes)) {
    return responseData.data.actionTypes;
  }
  if (Array.isArray(responseData?.actionTypes)) return responseData.actionTypes;
  if (Array.isArray(responseData?.items)) return responseData.items;
  return [];
};

const normalizeActionTypes = (responseData) =>
  getActionTypesList(responseData)
    .map((item) => {
      const id = normalizeActionTypeId(
        item?.idActionType ?? item?.id ?? item?.actionTypeId ?? item?.value,
      );
      const label =
        item?.name ?? item?.nome ?? item?.description ?? item?.label ?? `${id}`;

      if (id === "") {
        return null;
      }

      return { id, label };
    })
    .filter(Boolean);

const getAuthorizationToken = (token) =>
  token || localStorage.getItem("access_token") || "";

const parseQuantidade = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  let normalizedValue = String(value).trim().replace(/\s/g, "");

  if (normalizedValue === "") {
    return null;
  }

  const hasComma = normalizedValue.includes(",");
  const hasDot = normalizedValue.includes(".");

  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(normalizedValue)) {
    normalizedValue = normalizedValue.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(normalizedValue)) {
    normalizedValue = normalizedValue.replace(/,/g, "");
  } else if (hasComma && hasDot) {
    if (normalizedValue.lastIndexOf(",") > normalizedValue.lastIndexOf(".")) {
      normalizedValue = normalizedValue.replace(/\./g, "").replace(",", ".");
    } else {
      normalizedValue = normalizedValue.replace(/,/g, "");
    }
  } else if (hasComma) {
    normalizedValue = normalizedValue.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(normalizedValue)) {
    normalizedValue = normalizedValue.replace(/\./g, "");
  }

  const parsedValue = Number(normalizedValue);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const extractSharedholderId = (responseData) =>
  responseData?.idSharedholder ??
  responseData?.data?.idSharedholder ??
  responseData?.data?.data?.idSharedholder ??
  responseData?.result?.idSharedholder ??
  responseData?.result?.data?.idSharedholder ??
  null;

const extractSharedholderData = (responseData) =>
  responseData?.data?.data ??
  responseData?.data ??
  responseData?.result?.data ??
  responseData?.result ??
  responseData ??
  null;


function DrawerAcionista({ acionista, hideButton = false, onClose }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const companyId = dadosApi?.idCompany || localStorage.getItem("idCompany");

  const [nome, setNome] = useState("");
  
  const [quantidade, setQuantidade] = useState("");
  const [documento, setDocumento] = useState("");
  const [idActionType, setIdActionType] = useState("");
  const [actionTypes, setActionTypes] = useState([]);
  const [loadingActionTypes, setLoadingActionTypes] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentAcionista, setCurrentAcionista] = useState(null);

  const applyAcionistaData = (data) => {
    setCurrentAcionista(data || null);
    setNome(data?.name || "");
    setDocumento(data?.document || "");
    setIdActionType(normalizeActionTypeId(data?.idActionType));
    setQuantidade(
      data?.percentage !== undefined && data?.percentage !== null
        ? String(data.percentage)
        : "",
    );
  };

  
  useEffect(() => {
    if (!acionista) {
      return undefined;
    }

    let isMounted = true;
    const authToken = getAuthorizationToken(token);

    applyAcionistaData(acionista);
    setOpen(true);

    if (!acionista.idSharedholder || !authToken) {
      return undefined;
    }

    const fetchSharedholderDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}companies/shared-holders/${acionista.idSharedholder}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar os dados do participante.");
        }

        const responseData = await response.json();
        const sharedholderData = extractSharedholderData(responseData);

        if (isMounted && sharedholderData) {
          applyAcionistaData(sharedholderData);
        }
      } catch (error) {
        if (isMounted) {
          enqueueSnackbar(error.message, { variant: "error" });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSharedholderDetails();

    return () => {
      isMounted = false;
    };
  }, [acionista, token]);

  
  useEffect(() => {
    if (open && !acionista) {
      setCurrentAcionista(null);
      setNome("");
      setDocumento("");
      setQuantidade("");
      setIdActionType("");
    }
  }, [open, acionista]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchActionTypes = async () => {
      try {
        setLoadingActionTypes(true);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}companies/shared-holders/action-types`,
          {
            headers: {
              Authorization: `Bearer ${getAuthorizationToken(token)}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar os tipos de participacao.");
        }

        const responseData = await response.json();
        setActionTypes(normalizeActionTypes(responseData));
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoadingActionTypes(false);
      }
    };

    fetchActionTypes();
  }, [open, token]);

  const handleDocumentoChange = (event) => {
    const value = event.target.value;
    setDocumento(value);
  };

  
  const handleQuantidadeChange = (event) => {
    const value = event.target.value;
    setQuantidade(value);
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};
    const authToken = getAuthorizationToken(token);
    const quantidadeValue = String(quantidade || "").trim() || null;
    const normalizedActionTypeId = idActionType || null;

    if (!nome.trim() || !documento.trim()) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }

    if (!authToken) {
      enqueueSnackbar("Token de autenticacao nao encontrado.", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      if (acionista) {
        
        url = `${process.env.REACT_APP_API_URL}companies/shared-holders`;
        method = "PUT";
        payload = {
          idSharedholder:
            currentAcionista?.idSharedholder || acionista.idSharedholder,
          name: nome,
          document: documento,
          percentage: quantidadeValue,
          idActionType: normalizedActionTypeId,
          active: currentAcionista?.active ?? acionista.active ?? true,
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar os dados do acionista.");
        }
      } else {
        if (!companyId) {
          throw new Error("Empresa não identificada para cadastrar o participante.");
        }

        url = `${process.env.REACT_APP_API_URL}companies/shared-holders`;
        method = "POST";
        payload = {
          name: nome,
          document: documento,
          idCompany: companyId,
        };

        const postResponse = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!postResponse.ok) {
          throw new Error("Erro ao enviar os dados do acionista.");
        }

        
        const shouldSyncAdditionalFields =
          quantidadeValue !== null || normalizedActionTypeId !== null;

        if (shouldSyncAdditionalFields) {
          const createdData = await postResponse.json().catch(() => null);
          const idSharedholder = extractSharedholderId(createdData);

          if (!idSharedholder) {
            throw new Error(
              "Participante cadastrado, mas a API nao retornou o identificador necessario para salvar tipo e quantidade.",
            );
          }

          const editUrl = `${process.env.REACT_APP_API_URL}companies/shared-holders`;
          const editPayload = {
            idSharedholder,
            name: nome,
            document: documento,
            percentage: quantidadeValue,
            active: true,
            idActionType: normalizedActionTypeId,
          };

          const editResponse = await fetch(editUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(editPayload),
          });

          if (!editResponse.ok) {
            throw new Error("Erro ao atualizar a quantidade do acionista.");
          }
        }
      }

      enqueueSnackbar(
        acionista
          ? "Acionista atualizado com sucesso!"
          : "Acionista cadastrado com sucesso!",
        { variant: "success" },
      );

      if (window.refreshOrgaos) {
        window.refreshOrgaos();
      }
      setCurrentAcionista(null);
      setOpen(false);
      onClose?.();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setCurrentAcionista(null);
    setOpen(false);
    onClose?.();
  };

  const selectedActionTypeValue =
    idActionType === "" ||
    actionTypes.some((actionType) => actionType.id === idActionType)
      ? idActionType
      : "";

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
              {acionista ? "Editar participante" : "Cadastrar participante"}
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
                    Documento *
                  </InputLabel>
                  <TextField
                    fullWidth
                    value={documento}
                    onChange={handleDocumentoChange}
                    inputProps={{ inputMode: "text" }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Tipo de participação
                  </InputLabel>
                  <Select
                    value={selectedActionTypeValue}
                    onChange={(e) =>
                      setIdActionType(normalizeActionTypeId(e.target.value))
                    }
                    displayEmpty
                    fullWidth
                    disabled={loadingActionTypes || actionTypes.length === 0}
                  >
                    <MenuItem value="" disabled>
                      {loadingActionTypes
                        ? "Carregando tipos..."
                        : actionTypes.length === 0
                          ? "Nenhum tipo encontrado"
                          : "Selecione..."}
                    </MenuItem>
                    {actionTypes.map((actionType) => (
                      <MenuItem key={actionType.id} value={actionType.id}>
                        {actionType.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Grid>

              {/* CAMPO ALTERADO: Quantidade */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Quantidade
                  </InputLabel>
                  <TextField
                    onChange={handleQuantidadeChange}
                    fullWidth
                    value={quantidade}
                    
                    inputProps={{
                      inputMode: "text",
                      step: "any",
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
