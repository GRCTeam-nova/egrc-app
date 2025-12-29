/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import {
  Button, Box, TextField, Switch, Typography, Grid, Stack, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import LoadingOverlay from '../configuracoes/LoadingOverlay';
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from 'react-router-dom';
import { useToken } from "../../../api/TokenContext";
import { NumericFormat } from 'react-number-format';
// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState('Criar');
  const [mensagemFeedback, setMensagemFeedback] = useState('cadastrado');
  const [IndiceDados, setIndicesDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    categoria: '',
    processo: [],
    riscoAssociado: [],
    conta: [],
    responsavel: '',
    dataIndice: null,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/indexs/${dadosApi.idIndex}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de empresas");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNome(data.name);
          setCodigo(data.code)
          setDescricao(data.description)
          setStatus(data.active);
          setFormData((prev) => ({
            ...prev,
            causa: Array.isArray(data.causes)
              ? data.causes.map((u) => u.idCause)
              : [],
            departamento: Array.isArray(data.departments)
              ? data.departments.map((u) => u.idDepartment)
              : [],
            fator: Array.isArray(data.factors)
              ? data.factors.map((u) => u.idFactor)
              : [],
            impacto: Array.isArray(data.impacts)
              ? data.impacts.map((u) => u.idImpact)
              : [],
            incidente: Array.isArray(data.incidents)
              ? data.incidents.map((u) => u.idIncident)
              : [],
            kri: Array.isArray(data.krises)
              ? data.krises.map((u) => u.idKri)
              : [],
            normativa: Array.isArray(data.normatives)
              ? data.normatives.map((u) => u.idNormative)
              : [],
            riscoAssociado: Array.isArray(data.riskAssociates)
              ? data.riskAssociates.map((u) => u.idRiskAssociate)
              : [],
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            categoria: data.idCategory || null,
            controle: data.idControls || null,
            framework: data.idFramework || null,
            processo: data.idProcesses || null,
            responsavel: data.idResponsible || null,
            indice: data.idIndex || null,
            ameaca: data.idThreats || null,
            tratamento: data.idTreatment || null
          }));
          setValor(data.value)

          setFormData((prev) => ({
            ...prev,
            dataIndice: data.date
              ? new Date(data.date)
              : null,
          }));

          setIndicesDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idIndex) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  // Função para voltar para a listagem
  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation, setFormValidation] = useState({
    empresaInferior: true,
    nome: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = '';
    let method = '';
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (formData.dataIndice === null) {
      setFormValidation((prev) => ({ ...prev, dataIndice: false }));
      missingFields.push("Data");
    }
    if (valor === '') {
      setFormValidation((prev) => ({ ...prev, valor: false }));
      missingFields.push("Valor");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 ? "são obrigatórios e devem estar válidos!" : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, { variant: "error" });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === 'Criar') {
      url = 'https://api.egrc.homologacao.com.br/api/v1/indexs';
      method = 'POST';
      payload = {
        date: formData.dataIndice?.toISOString(),
        value: valor,
        name: nome
      };
    } else if (requisicao === 'Editar') {
      url = `https://api.egrc.homologacao.com.br/api/v1/indexs`;
      method = 'PUT';
      payload = {
        idIndex: IndiceDados?.idIndex,
        code: codigo,
        name: nome,
        description: descricao,
        date: formData.dataIndice?.toISOString(),
        value: valor,
        active: status
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error('O Código informado já foi cadastrado.');
      } else {
        enqueueSnackbar(`Indice ${mensagemFeedback} com sucesso!`, { variant: 'success' });
      }

      if (requisicao === "Criar" && data.data.idIndex) {
        // Atualiza o estado para modo de edição
        setIndicesDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar('Não foi possível cadastrar esse indice.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>
                Data *
              </InputLabel>
              <DatePicker
                error={!formData.dataIndice && formValidation.dataIndice === false}
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

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Valor *</InputLabel>
              <NumericFormat
                customInput={TextField}
                fullWidth
                value={
                  valor !== '' && !isNaN(Number(valor))
                    ? Number(valor).toFixed(2).replace('.', ',')
                    : ''
                }
                onValueChange={(values) => {
                  setValor(values.value);
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                allowNegative={false}
                error={!valor && formValidation.valor === false}
                inputProps={{ inputMode: 'decimal' }}
              />
            </Stack>
          </Grid>

          {requisicao === 'Editar' && (
            <>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Descrição</InputLabel>
              <TextField
                onChange={(event) => setDescricao(event.target.value)}
                fullWidth
                multiline
                rows={4}
                value={descricao}
              />
            </Stack>
          </Grid>

          <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 0.5 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>{status ? "Ativo" : "Inativo"}</Typography>
                  </Stack>
                </Stack>
              </Grid>

          

          </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginRight: '20px', marginTop: 5 }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: "91px", height: '32px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
          <Dialog
            open={successDialogOpen}
            onClose={voltarParaListagem}
            sx={{
              "& .MuiDialog-paper": {
                padding: "24px",
                borderRadius: "12px",
                width: "400px",
                textAlign: "center",
              },
            }}
          >
            {/* Ícone de Sucesso */}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {/* Título Centralizado */}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Índice Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O índice foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse índice.
              </DialogContentText>
            </DialogContent>

            {/* Botões */}
            <DialogActions
              sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
            >
              <Button
                onClick={voltarParaListagem}
                variant="outlined"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                  },
                }}
              >
                Voltar para a listagem
              </Button>
              <Button
                onClick={continuarEdicao}
                variant="contained"
                sx={{
                  backgroundColor: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0056b3",
                  },
                }}
                autoFocus
              >
                Adicionar mais informações
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
