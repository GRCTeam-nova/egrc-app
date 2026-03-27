/* eslint-disable react-hooks/exhaustive-deps */
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
  Alert
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
    sdgCode: "",
    sdgName: "",
    sdgDescription: "",
    active: true
  });

  const [formValidation, setFormValidation] = useState({
    sdgCode: true,
    sdgName: true
  });

  useEffect(() => {
    const fetchOdsData = async () => {
      if (id && !odsDados && token) {
        try {
          setLoading(true);
          const res = await axios.get("https://api.egrc.homologacao.com.br/api/v1/SDG", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const allOds = Array.isArray(res.data) ? res.data : [];
          const item = allOds.find(o => o.id === id || o.sdgCode.toString() === id);
          if (item) {
            setFormData({
              id: item.id,
              sdgCode: item.sdgCode,
              sdgName: item.sdgName,
              sdgDescription: item.sdgDescription || "",
              active: item.active
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
      } else if (odsDados) {
        setFormData({
          id: odsDados.id,
          sdgCode: odsDados.sdgCode,
          sdgName: odsDados.sdgName,
          sdgDescription: odsDados.sdgDescription || "",
          active: odsDados.active
        });
        setRequisicao("Editar");
      }
    };
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
        sdgDescription: formData.sdgDescription || null
      };

      if (requisicao === "Editar") {
        await axios.put("https://api.egrc.homologacao.com.br/api/v1/SDG", {
          ...payload,
          id: formData.id,
          active: formData.active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar("ODS atualizado com sucesso!", { variant: "success" });
      } else {
        await axios.post("https://api.egrc.homologacao.com.br/api/v1/SDG", payload, {
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
      <Typography variant="h4" mb={3} sx={{ color: '#1C5297', fontWeight: 600 }}>
        {requisicao === "Criar" ? "Novo ODS" : "Editar ODS"}
      </Typography>

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
            <InputLabel>Temas Conectados ao ODS</InputLabel>
            <Alert severity="info" sx={{ backgroundColor: 'rgba(28, 82, 151, 0.05)', color: '#1C5297' }}>
              Funcionalidade de vinculação de temas disponível em breve.
            </Alert>
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
