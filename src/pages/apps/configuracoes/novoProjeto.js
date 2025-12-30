/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Switch,
  Stack,
  Typography,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileUploader from "./FileUploader";
import ListagemTestes from "./listaTeste";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [descricao, setDescricao] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [faixa1, setFaixa1] = useState("");
  const [faixa2, setFaixa2] = useState("");
  const [faixa3, setFaixa3] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [tiposProjetos, setTiposProjetos] = useState([]);
  const [projetosAnteriores, setProjetosAnteriores] = useState([]);
  const [projetosPosteriores, setProjetosPosteriores] = useState([]);
  const [status, setStatus] = useState(true);
  const [arquivado, setArquivado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [projetoDados, setProjetoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState([]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    files: [],
    responsavel: "",
    tipoProjeto: "",
    projetoAnterior: "",
    projetoPosterior: "",
    dataBase: null,
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${API_URL}projects/${dadosApi.idProject}`,
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
          setMensagemFeedback("editada");
          setNomeProjeto(data.name);
          setStatus(data.active);
          setFaixa1(data.trackSelectionOne);
          setFaixa2(data.trackSelectionTwo);
          setFaixa3(data.trackSelectionThree);
          setBenchmark(data.benchmark);
          setStatus(data.active);
          setArquivado(data.archived);
          setDescricao(data.description);
          setFormData((prev) => ({
            ...prev,
            tipoProjeto: data.idProjectType || null,
            responsavel: data.idResponsible || null,
            projetoAnterior: data.idPreviousProject || null,
            projetoPosterior: data.idNextProject || null,
            processo: data.idProcesses || null,
            files: data.files || [],
          }));

          setFormData((prev) => ({
            ...prev,
            dataBase: new Date(data.date),
          }));

          setProjetoDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idProject) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  useEffect(() => {
    fetchData(
      `${API_URL}collaborators/responsibles`,
      setResponsavel
    );
    fetchData(
      `${API_URL}projects/types`,
      setTiposProjetos
    );
    fetchData(
      `${API_URL}projects`,
      setProjetosAnteriores
    );
    fetchData(
      `${API_URL}projects`,
      setProjetosPosteriores
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
        id:
          item.idCompany ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.idProject ||
          item.idProjectType ||
          item.idCollaborator,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeProjeto);

    // Verifica e remove o projeto superior se necessário
    const projetoAnteriorSelecionada = projetosAnteriores.find(
      (projeto) => projeto.id === formData.projetoAnterior
    );
    if (
      projetoAnteriorSelecionada &&
      formatarNome(projetoAnteriorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        projetoAnterior: null,
      }));
    }

    const projetoPosteriorSelecionado = projetosPosteriores.find(
      (projeto) => projeto.id === formData.projetoPosterior
    );
    if (
      projetoPosteriorSelecionado &&
      formatarNome(projetoPosteriorSelecionado.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        projetoPosterior: null,
      }));
    }
  }, [
    nomeProjeto,
    projetosPosteriores,
    projetosAnteriores,
    formData.projetoAnterior,
    formData.projetoPosterior,
  ]);

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const [formValidation, setFormValidation] = useState({
    nomeProjeto: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeProjeto.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeProjeto: false }));
      missingFields.push("Nome");
    }

    if (formData.tipoProjeto.length === 0) {
      setFormValidation((prev) => ({ ...prev, tipoProjeto: false }));
      missingFields.push("Tipo de projeto");
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

    if (deletedFiles.length > 0) {
      // Supondo que deletedFilesPayload deva conter dados relevantes e não apenas o resultado de file instanceof File
      const deletedFilesPayload = deletedFiles.map((file) => file.name); // ajuste conforme a necessidade

      await axios.delete(`${API_URL}files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          containerFolder: 5,
          files: deletedFilesPayload,
        },
      });
    }

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File)
    );

    let uploadFilesResult = { files: [] };
    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", 5);

      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? dadosApi?.idProject : ""
      );
      newFiles.forEach((file) => {
        formDataUpload.append("Files", file, file.name);
      });

      const uploadResponse = await axios.post(
        `${API_URL}files/uploads`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      uploadFilesResult = uploadResponse.data;
    }

    // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
    const finalFiles = [...existingFiles, ...uploadFilesResult.files];

    // Transforma cada item para que o payload contenha somente a URL (string)
    const finalFilesPayload = finalFiles.map((file) => {
      if (typeof file === "string") return file;
      if (file.path) return file.path;
      return file;
    });

    if (requisicao === "Criar") {
      url = `${API_URL}projects`;
      method = "POST";
      payload = {
        name: nomeProjeto,
        idProjectType: formData.tipoProjeto,
      };
    } else if (requisicao === "Editar") {
      url = `${API_URL}projects`;
      method = "PUT";
      payload = {
        idProject: projetoDados?.idProject,
        name: nomeProjeto,
        description: descricao,
        date: formData.dataBase ? formData.dataBase.toISOString() : null,
        benchmark: benchmark,
        trackSelectionOne: faixa1 === null || faixa1 === "" ? null : faixa1,
        trackSelectionTwo: faixa2 === null || faixa2 === "" ? null : faixa2,
        trackSelectionThree: faixa3 === null || faixa3 === "" ? null : faixa3,
        idPreviousProject:
          formData.projetoAnterior === null || formData.projetoAnterior === ""
            ? null
            : formData.projetoAnterior,
        idNextProject:
          formData.projetoPosterior === null || formData.projetoPosterior === ""
            ? null
            : formData.projetoPosterior,
        archived: arquivado,
        active: status,
        idProjectType: formData.tipoProjeto,
        idResponsible:
          formData.responsavel === null || formData.responsavel === ""
            ? null
            : formData.responsavel,
        files: finalFilesPayload,
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

      // Se for criação, processamos o JSON da resposta
      let data;
      if (requisicao === "Criar") {
        data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Erro ao cadastrar o projeto.");
        }
      } else {
        // Para edição, se houver erro podemos ler o texto da resposta ou simplesmente lançar um erro padrão
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao cadastrar o projeto.");
        }
      }

      enqueueSnackbar(`Projeto ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        // Processa a resposta somente para criação
        if (data.data && data.data.idProject) {
          localStorage.setItem("idCompany", data.data.idProject);
          setProjetoDados(data.data);
          setSuccessDialogOpen(true);
        }
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar o projeto.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          {/* Nome e Status lado a lado */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNomeProjeto(event.target.value)}
                fullWidth
                value={nomeProjeto}
                error={!nomeProjeto && formValidation.nomeProjeto === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tipo de projeto *</InputLabel>
              <Autocomplete
                options={tiposProjetos}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposProjetos.find(
                    (tipoProjeto) => tipoProjeto.id === formData.tipoProjeto
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoProjeto: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoProjeto &&
                      formValidation.tipoProjeto === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
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
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data base</InputLabel>
                  <DatePicker
                    value={formData.dataBase || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataBase: newValue,
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
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Benchmark</InputLabel>
                  <TextField
                    onChange={(event) => setBenchmark(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={benchmark}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Faixa de seleção 1</InputLabel>
                  <TextField
                    type="number"
                    onChange={(event) => setFaixa1(event.target.value)}
                    fullWidth
                    value={faixa1}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Faixa de seleção 2</InputLabel>
                  <TextField
                    type="number"
                    onChange={(event) => setFaixa2(event.target.value)}
                    fullWidth
                    value={faixa2}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Faixa de seleção 3</InputLabel>
                  <TextField
                    type="number"
                    onChange={(event) => setFaixa3(event.target.value)}
                    fullWidth
                    value={faixa3}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Projeto anterior</InputLabel>
                  <Autocomplete
                    options={projetosAnteriores.filter((projeto) => {
                      // Permite exibir a opção se for a selecionada atualmente
                      if (formData.projetoAnterior === projeto.id) return true;
                      // Exclui se o projeto já estiver selecionado como posterior ou se o nome for igual ao nome do projeto atual
                      return (
                        formData.projetoPosterior !== projeto.id &&
                        formatarNome(projeto.nome) !== formatarNome(nomeProjeto)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      projetosAnteriores.find(
                        (projeto) => projeto.id === formData.projetoAnterior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        projetoAnterior: newValue ? newValue.id : "",
                        // Se o projeto posterior selecionado for o mesmo do novo valor, zera-o
                        projetoPosterior:
                          prev.projetoPosterior ===
                          (newValue ? newValue.id : "")
                            ? ""
                            : prev.projetoPosterior,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.projetoAnterior &&
                          formValidation.projetoAnterior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Projeto posterior</InputLabel>
                  <Autocomplete
                    options={projetosPosteriores.filter((projeto) => {
                      if (formData.projetoPosterior === projeto.id) return true;
                      return (
                        formData.projetoAnterior !== projeto.id &&
                        formatarNome(projeto.nome) !== formatarNome(nomeProjeto)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      projetosPosteriores.find(
                        (projeto) => projeto.id === formData.projetoPosterior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        projetoPosterior: newValue ? newValue.id : "",
                        // Se o projeto anterior selecionado for o mesmo do novo valor, zera-o
                        projetoAnterior:
                          prev.projetoAnterior === (newValue ? newValue.id : "")
                            ? ""
                            : prev.projetoAnterior,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.projetoPosterior &&
                          formValidation.projetoPosterior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveis.find(
                        (responsavel) => responsavel.id === formData.responsavel
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        responsavel: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.responsavel &&
                          formValidation.responsavel === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 0.5 }}
                  >
                    <Switch
                      checked={arquivado}
                      onChange={(event) => setArquivado(event.target.checked)}
                    />
                    <Typography>Arquivado</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={2} sx={{ paddingBottom: 5 }}>
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
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={1}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
                    onFileDelete={(file) =>
                      setDeletedFiles((prev) => [...prev, file])
                    }
                  />
                </Stack>
              </Grid>
              {/* <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Testes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemTestes />
                  </AccordionDetails>
                </Accordion>
              </Grid> */}
            </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "8px",
                marginRight: "20px",
                marginTop: 5,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: "91px",
                  height: "32px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
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
              Projeto criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O projeto foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse projeto.
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
