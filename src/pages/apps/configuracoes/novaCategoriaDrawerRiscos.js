/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
  Autocomplete,
  Button,
  Tooltip,
  Checkbox,
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
import axios from "axios";

function ColumnsLayoutsDrawer({ buttonSx, onCategoryCreated }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const [departamentosInferiores, setDepartamentosInferiores] = useState([]);
  const [empresas, setDepartamentosLaterais] = useState([]);
  const { dadosApi } = location.state || {};
  const [nome, setNome] = useState("");
  const [descricao, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    empresa: [],
    tipoResponsabilidade: [],
    planoAcao: [],
    dado: [],
    deficiencia: [],
    formatoUnidade: "",
    processoSuperior: "",
    processoInferior: [],
    risco: [],
    incidente: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}departments`,
      setDepartamentosInferiores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setDepartamentosLaterais
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

      // Transformando os dados para alterar idCompany, idLedgerAccount e idCategory -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idCompany ||
          item.idLedgerAccount ||
          item.idCategory ||
          item.id_responsible ||
          item.idDepartment ||
          item.idRisk ||
          item.idIncident ||
          item.idUnitFormat ||
          item.idResponsabilityType ||
          item.idLgpd ||
          item.idDeficiency ||
          item.idProcessType,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "processoSuperior") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectEmpresa = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.empresa.length === empresas.length) {
        // Deselect all
        setFormData({ ...formData, empresa: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          empresa: empresas.map((empresa) => empresa.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "empresa",
        newValue.map((item) => item.id)
      );
    }
  };

  useEffect(() => {
    if (open) {
      setNome("");
      setCodigo("");
      setFormValidation({
        nome: true,
        descricao: true,
        empresa: true,
      });
      setHasChanges(false);
    }
  }, [open]);

  const [formValidation, setFormValidation] = useState({
    nome: true,
    descricao: true,
  });

  const allSelected =
    formData.departamentoInferior.length === departamentosInferiores.length &&
    departamentosInferiores.length > 0;

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!descricao.trim()) {
      setFormValidation((prev) => ({ ...prev, descricao: false }));
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
      url = `${process.env.REACT_APP_API_URL}categories`;
      method = "POST";
      payload = {
        name: nome,
        description: descricao,
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
        throw new Error("Não foi possível cadastrar a categoria.");
      }

      const data = await response.json();

      enqueueSnackbar(`Categoria ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      setFormData({ ...formData, empresa: [] });

      if (onCategoryCreated) {
        const novaCategoria = {
          id: data.data.idCategory,
          nome: nome,
        };
        onCategoryCreated(novaCategoria);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar a categoria.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre uma categoria" arrow placement="top">
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
              Cadastrar categoria
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
                    value={nome}
                    error={!nome && !formValidation.nome}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Descrição *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setCodigo(event.target.value)}
                    fullWidth
                    value={descricao}
                    error={!descricao && !formValidation.descricao}
                  />
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Stack direction="row" spacing={2} mt={10} justifyContent="flex-end">
            <Button
              onClick={() => {
                setOpen(false);
                setFormData({ ...formData, empresa: [] });
              }}
              variant="outlined"
            >
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
