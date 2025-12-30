import React, { useState } from "react";
import {
  Button,
  Tooltip,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import InputMask from "react-input-mask";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import AddIcon from "@mui/icons-material/Add";

function ColumnsLayoutsModal({ buttonSx }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrada");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [cnpjError, setCnpjError] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeEmpresa.trim()) {
      missingFields.push("Empresa");
    }
    if (!cnpjEmpresa.trim() || cnpjError) {
      setCnpjError(true);
      missingFields.push("CNPJ");
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
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
        throw new Error("O CNPJ informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }
    } catch (error) {
      console.error(error.message);
      setCnpjError(true);
      enqueueSnackbar("O CNPJ informado já foi cadastrado.", {
        variant: "error",
      });
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
          onClick={() => setOpen(true)}
          sx={{ ...buttonSx }}
        >
          <AddIcon />
        </Button>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{"Cadastrar Empresa"}</DialogTitle>
        <DialogContent>
          <LoadingOverlay isActive={loading} />
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Empresa *</InputLabel>
                  <TextField
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    value={nomeEmpresa}
                    fullWidth
                    placeholder="Digite o nome da empresa"
                  />
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>CNPJ *</InputLabel>
                  <TextField
                    value={cnpjEmpresa}
                    onChange={(e) => setCnpjEmpresa(e.target.value)}
                    fullWidth
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
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={tratarSubmit}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ColumnsLayoutsModal;
