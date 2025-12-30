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
import InputMask from "react-input-mask";

function ColumnsLayoutsDrawer({ buttonSx, onCompanyCreated }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nomeEmpresa, setNome] = useState("");
  const [cnpjEmpresa, setCnpjParte] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);
  const [cnpjError, setCnpjError] = useState(false);
    const [cnpjTouched, setCnpjTouched] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const validarCnpj = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (
      cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999"
    ) {
      return false;
    }

    // Validação dos dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  const handleCnpjChange = (event) => {
    const value = event.target.value;
    setCnpjParte(value);

    // Valida o CNPJ somente quando o comprimento está completo
    if (value.length === 18) {
      setCnpjError(!validarCnpj(value));
    } else {
      setCnpjError(false); // Remove o erro se o campo não estiver completo
    }
  };

  const handleCnpjBlur = () => {
    setCnpjTouched(true);

    // Revalida no blur se o campo estiver completo
    if (cnpjEmpresa.length === 18) {
      setCnpjError(!validarCnpj(cnpjEmpresa));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (open) {
      setNome("");
      setCnpjParte("");
      setFormValidation({ nomeEmpresa: true, cnpjEmpresa: true });
      setHasChanges(false);
    }
  }, [open]);

  const [formValidation, setFormValidation] = useState({
    nomeEmpresa: true,
    cnpjEmpresa: true
  });

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeEmpresa.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeEmpresa: false }));
      missingFields.push("Nome");
    }
    if (!cnpjEmpresa.trim() || cnpjError) {
      setCnpjError(true);
      setCnpjTouched(true);
      missingFields.push("CNPJ");
    }
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingFields.join(" e ")} são obrigatórios!`,
        { variant: "error" }
      );
      return;
    }

    if (requisicao === "Criar") {
      url = `${API_URL}companies`;
      method = "POST";
      payload = {
        name: nomeEmpresa,
        document: cnpjEmpresa,
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
        throw new Error("Não foi possível cadastrar a empresa.");
      }

      const data = await response.json();

      enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      if (onCompanyCreated) {
        const novaEmpresa = {
          id: data.data.idCompany, 
          nome: nomeEmpresa,
        };
        onCompanyCreated(novaEmpresa);
      }
    } catch (error) {
      console.error(error.message);
      setCnpjTouched(true);
      setCnpjError(true);
      enqueueSnackbar("Erro ao cadastrar a empresa.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre uma empresa" arrow placement="top">
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
              Cadastrar empresa
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
                    Nome *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setNome(event.target.value)}
                    fullWidth
                    value={nomeEmpresa}
                    error={
                      !nomeEmpresa && !formValidation.nomeEmpresa
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    CNPJ *
                  </InputLabel>
                  <TextField
                                  fullWidth
                                  value={cnpjEmpresa}
                                  onChange={handleCnpjChange}
                                  onBlur={handleCnpjBlur}
                                  error={cnpjTouched && cnpjError}
                                  helperText={
                                    cnpjTouched && cnpjError && cnpjEmpresa.length === 18
                                      ? "CNPJ inválido"
                                      : ""
                                  }
                                  InputProps={{
                                    inputComponent: InputMask,
                                    inputProps: {
                                      mask: "99.999.999/9999-99",
                                      maskPlaceholder: null,
                                    },
                                  }}
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
