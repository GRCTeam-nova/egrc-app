/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from 'config';
import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Typography,
  Divider,
  Autocomplete,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const NovoOds = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { odsDados } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [formData, setFormData] = useState({
    id: "",
    sdgCode: "",
    sdgName: "",
    sdgDescription: "",
    themeIds: [],
    active: true
  });

  const [temasOptions, setTemasOptions] = useState([]);

  const [formValidation, setFormValidation] = useState({
    sdgCode: true,
    sdgName: true
  });

  useEffect(() => {
    const fetchTemas = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}Theme`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemasOptions(res.data || []);
      } catch (error) {
        console.error("Erro ao carregar temas:", error);
      }
    };

    const fetchOdsData = async () => {
      if (id && token) {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}SDG/Code/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const item = res.data;
          if (item) {
            setFormData({
              id: item.id || "",
              sdgCode: item.sdgCode,
              sdgName: item.sdgName || "",
              sdgDescription: item.sdgDescription || "",
              themeIds: item.themeIds || [],
              active: item.active !== undefined ? item.active : true
            });
            setRequisicao("Editar");
          } else {
            enqueueSnackbar("ODS não encontrado", { variant: "error" });
          }
        } catch (error) {
          enqueueSnackbar("Erro ao buscar dados do ODS", { variant: "error" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTemas();
    fetchOdsData();
  }, [id, odsDados, token]);

  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const validate = () => {
    const errors = {
      sdgCode: !!formData.sdgCode,
      sdgName: !!formData.sdgName
    };
    setFormValidation(errors);
    return Object.values(errors).every(v => v);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      enqueueSnackbar("Preencha todos os campos obrigatórios", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        sdgCode: Number(formData.sdgCode),
        sdgName: formData.sdgName,
        sdgDescription: formData.sdgDescription || null,
        themeIds: formData.themeIds || []
      };

      if (requisicao === "Editar") {
        await axios.put(`${API_URL}SDG`, {
          ...payload,
          id: formData.id,
          active: formData.active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar("ODS atualizado com sucesso!", { variant: "success" });
      } else {
        await axios.post(`${API_URL}SDG`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar("ODS criado com sucesso!", { variant: "success" });
      }
      navigate("/ods/lista");
    } catch (error) {
      enqueueSnackbar("Erro ao salvar ODS", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <LoadingOverlay isActive={loading} />
      <Typography variant="h4" mb={2} sx={{ color: "#1C5297", fontWeight: 600 }}>
        {requisicao === "Criar" ? "Novo ODS" : "Editar ODS"}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={1}>
            <InputLabel>Código ODS *</InputLabel>
            <TextField
              fullWidth
              type="number"
              value={formData.sdgCode}
              onChange={(e) => handleInputChange('sdgCode', e.target.value)}
              error={!formValidation.sdgCode}
              disabled={requisicao === "Editar"}
              placeholder="Ex: 1"
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={1}>
            <InputLabel>Nome do ODS *</InputLabel>
            <TextField
              fullWidth
              value={formData.sdgName}
              onChange={(e) => handleInputChange('sdgName', e.target.value)}
              error={!formValidation.sdgName}
              placeholder="Ex: Erradicação da Pobreza"
            />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel>Descrição</InputLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.sdgDescription}
              onChange={(e) => handleInputChange('sdgDescription', e.target.value)}
            />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel>Temas Relacionados</InputLabel>
            <Autocomplete
              multiple
              filterSelectedOptions
              options={temasOptions}
              getOptionLabel={(option) => option.themeName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={temasOptions.filter(t => formData.themeIds.includes(t.id))}
              onChange={(event, newValue) => {
                handleInputChange('themeIds', newValue.map(v => v.id));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Selecione os temas"
                />
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-start">
            <Button
              variant="contained"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleSubmit}
              disabled={loading || (requisicao === "Editar" ? !hasChanges : !(formData.sdgCode && formData.sdgName?.trim()))}
            >
              {requisicao === "Criar" ? "Cadastrar ODS" : "Salvar Alterações"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/ods/lista")}>
              Cancelar
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NovoOds;
