/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
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
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DrawerEmpresas from "../configuracoes/novaEmpresaDrawerContas";
import DrawerProcessos from "../configuracoes/novoProcessoDrawerContas";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [responsaveis, setResponsavel] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [contas, setContas] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [contasSuperiores, setContasSuperiores] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState([]);
  const [nomeConta, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [relevante, setRelevante] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [empresaDados, setContasDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    departamentoLateral: [],
    empresa: [],
    tipoConta: "",
    planoAcao: [],
    formatoUnidade: [],
    contaSuperior: "",
    assertion: [],
    responsavel: "",
    departamentoSuperior: "",
    processo: [],
    risco: [],
    conta: [],
    incidente: [],
    dataInicioOperacao: null,
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchDepartamentosDados = async () => {
        setLoading(true)
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}ledger-accounts/${dadosApi.id}`,
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
          setNome(data.name);
          setCodigo(data.code);
          setDescricao(data.description);
          setRelevante(data.relevant);
          // Garante que os valores estão definidos
          setFormData((prev) => ({
            ...prev,
            tipoConta: data.idLedgerAccountType || null,
            responsavel: data.idResponsible || null,
            contaSuperior: data.idLedgerAccountSuperior || null,
            empresa: Array.isArray(data.companies)
              ? data.companies.map((u) => u.idCompany)
              : [],
            processo: data.idProcesses || null,
            assertion: Array.isArray(data.assertions)
              ? data.assertions.map((u) => u.idAssertion)
              : [],
            conta: Array.isArray(data.ledgerAccountBottoms)
              ? data.ledgerAccountBottoms.map((u) => u.idLedgerAccountBottom)
              : [],
          }));

          setContasDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
          setLoading(false)
        }
      };

      if (dadosApi.id) {
        fetchDepartamentosDados();
      }
    }
  }, [dadosApi]);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setEmpresas
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts/types`,
      setTiposResponsabilidades
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts`,
      setContas
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts/assertions`,
      setAssertions
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts`,
      setContasSuperiores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsavel
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
          item.id_responsible ||
          item.idDepartment ||
          item.idRisk ||
          item.idIncident ||
          item.id_responsible ||
          item.idCollaborator ||
          item.idUnitFormat ||
          item.idResponsabilityType ||
          item.idAssertion ||
          item.idLedgerAccountType,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const handleCompanyCreated = (newEmpresa) => {
    setEmpresas((prevEmpresas) => [...prevEmpresas, newEmpresa]);
    setFormData((prev) => ({
      ...prev,
      empresa: [...prev.empresa, newEmpresa.id],
    }));
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "departamentoSuperior") {
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

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) {
        // Deselect all
        setFormData({ ...formData, processo: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          processo: processos.map((processo) => processo.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "processo",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllConta = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Aplica o filtro usado nas opções do Autocomplete para Contas Inferiores
      const filteredContas = contas.filter((conta) => {
        const superiorId = formData.contaSuperior;
        // Se a conta já estiver selecionada, mantém-a
        if (formData.conta.includes(conta.id)) return true;
        return (
          conta.id !== superiorId &&
          formatarNome(conta.nome) !== formatarNome(nomeConta)
        );
      });
      if (formData.conta.length === filteredContas.length) {
        // Deselect all se todos os itens filtrados já estiverem selecionados
        setFormData({ ...formData, conta: [] });
      } else {
        // Seleciona apenas os itens filtrados
        setFormData({
          ...formData,
          conta: filteredContas.map((conta) => conta.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "conta",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllAssertion = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.assertion.length === assertions.length) {
        // Deselect all
        setFormData({ ...formData, assertion: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          assertion: assertions.map((assertion) => assertion.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "assertion",
        newValue.map((item) => item.id)
      );
    }
  };

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeConta);

    // Verifica e remove o departamento superior se necessário
    const superiorSelecionada = contasSuperiores.find(
      (conta) => conta.id === formData.contaSuperior
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        contaSuperior: null,
      }));
    }

    // Atualiza os departamentos inferiores removendo os que conflitam
    const inferioresAtualizadas = formData.conta.filter((id) => {
      const contaInferior = contas.find((conta) => conta.id === id);
      if (!contaInferior) return false;
      return formatarNome(contaInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.conta.length) {
      setFormData((prev) => ({
        ...prev,
        conta: inferioresAtualizadas,
      }));
    }
  }, [
    nomeConta,
    contasSuperiores,
    contas,
    formData.contaSuperior,
    formData.conta,
  ]);

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
    nomeConta: true,
    codigo: true,
  });

  const allSelected =
    formData.empresa.length === empresas.length && empresas.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedContas =
    formData.conta.length === contas.length && contas.length > 0;
  const allSelectedAssertions =
    formData.assertion.length === assertions.length && assertions.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeConta.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeConta: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (formData.tipoConta === "") {
      setFormValidation((prev) => ({ ...prev, tipoConta: false }));
      missingFields.push("Tipo de conta");
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
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}ledger-accounts`;
      method = "POST";
      payload = {
        name: nomeConta,
        code: codigo,
        idLedgerAccountType: formData.tipoConta,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}ledger-accounts`;
      method = "PUT";
      payload = {
        idLedgerAccount: empresaDados?.idLedgerAccount,
        active: true,
        name: nomeConta,
        code: codigo,
        relevant: relevante,
        idResponsible:
          formData.responsavel === "" ? null : formData.responsavel,
        description: descricao,
        idLedgerAccountType: formData.tipoConta,
        idLedgerAccountSuperior:
          formData.contaSuperior === "" ? null : formData.contaSuperior,
        idLedgeAccountBottoms: formData.conta,
        idCompanies: formData.empresa,
        idAssertions: formData.assertion,
        idProcesses: formData.processo,
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
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
        throw new Error("Não foi possível cadastrar a conta.");
      } else {
        enqueueSnackbar(`Conta ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idLedgerAccount) {
        // Atualiza o estado para modo de edição
        setContasDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa conta.", {
        variant: "error",
      });
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
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
                placeholder="Código da conta contábil"
                value={codigo}
                error={!codigo && formValidation.codigo === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nomeConta}
                error={!nomeConta && formValidation.nomeConta === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tipos de Conta *</InputLabel>
              <Autocomplete
                options={tiposResponsabilidades}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposResponsabilidades.find(
                    (tipoConta) => tipoConta.id === formData.tipoConta
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoConta: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoConta && formValidation.tipoConta === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Empresas{" "}
                    <DrawerEmpresas
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onCompanyCreated={handleCompanyCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...empresas,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.empresa.map(
                      (id) =>
                        empresas.find((empresa) => empresa.id === id) || id
                    )}
                    onChange={handleSelectEmpresa}
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.empresa.length === 0 ||
                            formData.empresa.every((val) => val === 0)) &&
                          formValidation.empresa === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Conta superior</InputLabel>
                  <Autocomplete
                    options={contasSuperiores.filter((conta) => {
                      // IDs dos departamentos já selecionados nos outros campos:
                      const selectedInferior = formData.conta || [];
                      const selectedIds = [...selectedInferior];

                      // Se for o valor atual selecionado, não filtra
                      if (formData.contaSuperior === conta.id) return true;

                      // Exclui se já estiver selecionado em outro campo ou se o nome for igual ao nome do departamento atual
                      return (
                        !selectedIds.includes(conta.id) &&
                        formatarNome(conta.nome) !== formatarNome(nomeConta)
                      );
                    })}
                    getOptionLabel={(option) => option.nome}
                    value={
                      contasSuperiores.find(
                        (contaSuperior) =>
                          contaSuperior.id === formData.contaSuperior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        contaSuperior: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.contaSuperior &&
                          formValidation.contaSuperior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Contas Inferiores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...contas.filter((conta) => {
                        // IDs já selecionados em outros autocompletes:
                        const superiorId = formData.contaSuperior || [];

                        // Se o departamento estiver selecionado neste campo, mantenha-o
                        if (formData.conta.includes(conta.id)) return true;

                        return (
                          conta.id !== superiorId &&
                          formatarNome(conta.nome) !== formatarNome(nomeConta)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.conta.map(
                      (id) => contas.find((conta) => conta.id === id) || id
                    )}
                    onChange={handleSelectAllConta}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedContas
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formData.conta.length > 0
                            ? ""
                            : "Escreva ou selecione uma ou mais contas"
                        }
                        error={
                          (formData.conta.length === 0 ||
                            formData.conta.every((val) => val === 0)) &&
                          formValidation.conta === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Assertion</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...assertions,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.assertion.map(
                      (id) =>
                        assertions.find((assertion) => assertion.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllAssertion}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedAssertions
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.assertion.length === 0 ||
                            formData.assertion.every((val) => val === 0)) &&
                          formValidation.assertion === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Processos{" "}
                    <DrawerProcessos
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onProcessCreated={handleProcessCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...processos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.processo.map(
                      (id) =>
                        processos.find((processo) => processo.id === id) || id
                    )}
                    onChange={handleSelectAll2}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected2 : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.processo.length === 0 ||
                            formData.processo.every((val) => val === 0)) &&
                          formValidation.processo === false
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
              <Grid item xs={2} mb={2}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 0.5 }}
                  >
                    <Switch
                      checked={relevante}
                      onChange={(event) => setRelevante(event.target.checked)}
                    />
                    <Typography>{"Relevante"}</Typography>
                  </Stack>
                </Stack>
              </Grid>
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
              Conta criada com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A conta foi cadastrada com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a essa conta.
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
