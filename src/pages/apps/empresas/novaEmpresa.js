/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
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
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import FileUploader from "../configuracoes/FileUploader";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerEmpresa";
import DrawerConta from "../configuracoes/novaContaDrawer";
import ListagemAcionistas from "../configuracoes/listaAcionistas";
import axios from "axios";
import InputMask from "react-input-mask";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [empresasInferiores, setEmprasasInferiores] = useState([]);
  const [empresasSuperiores, setEmpresasSuperiores] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [updateProcessos] = useState(false);
  const [contas, setContas] = useState([]);
  const [updateContas] = useState(false);
  const [nomeEmpresa, setNomeOrgao] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [cnpjEmpresa, setCnpjParte] = useState("");
  const [empresaDados, setEmpresaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [cnpjError, setCnpjError] = useState(false);
  const [cnpjTouched, setCnpjTouched] = useState(false);
  
  // Novos estados para os campos adicionados
  const [linhasNegocio, setLinhasNegocio] = useState([]);
  const [orgaosReguladores, setOrgaosReguladores] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [naturezasJuridicas, setNaturezasJuridicas] = useState([]);
  const [regimesTributacao, setRegimesTributacao] = useState([]);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    files: [],
    empresaSuperior: "",
    processo: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
    linhaNegocio: "",
    orgaoRegulador: [],
    classificacao: "",
    naturezaJuridica: "",
    regimeTributacao: "",
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}companies/${dadosApi.idCompany}`,
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
          setNomeOrgao(data.name);
          setStatus(data.active);
          setCnpjParte(data.document);
          localStorage.setItem("idCompany", dadosApi.idCompany);

          // Atualiza os demais campos, incluindo os arquivos já cadastrados (se houver)
          setFormData((prev) => ({
            ...prev,
            empresaInferior: Array.isArray(data.companyBottoms)
              ? data.companyBottoms.map((u) => u.idCompanyBottom)
              : [],
            empresaSuperior: data.idCompanySuperior || null,
            responsavel: data.idResponsible || null,
            conta: data.idLedgerAccounts || null,
            processo: data.idProcesses || null,
            files: data.files || [],
            dataInicioOperacao: data.startDate
              ? new Date(data.startDate)
              : null,
            // Novos campos - assumindo que virão na resposta da API
            linhaNegocio: data.idBusinessLine || "",
            orgaoRegulador: data.idRegulatories || [],
            classificacao: data.idClassification || "",
            naturezaJuridica: data.idLegalNature || "",
            regimeTributacao: data.idTaxRegime || "",
          }));

          setEmpresaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idCompany) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, token]);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setEmprasasInferiores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setEmpresasSuperiores
    );

    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsavel
    );
    
    // Buscar dados dos novos campos
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/business-lines`,
      setLinhasNegocio
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/regulatories`,
      setOrgaosReguladores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/classifications`,
      setClassificacoes
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/legal-nature`,
      setNaturezasJuridicas
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/tax-regime`,
      setRegimesTributacao
    );
    
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
  }, [updateProcessos]);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts`,
      setContas
    );
  }, [updateContas]);

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id], // Seleciona o novo processo automaticamente
    }));
  };

  const handleAccountCreated = (newConta) => {
    setContas((prevConta) => [...prevConta, newConta]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      conta: [...prev.conta, newConta.id], // Seleciona o novo processo automaticamente
    }));
  };

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
          item.idCollaborator ||
          item.idBusinessLine ||
          item.idRegulatory ||
          item.idClassification ||
          item.idLegalNature ||
          item.idTaxRegime ||
          item.id,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  // Função para validar o CNPJ
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

  // Função utilitária para normalizar o nome removendo espaços e convertendo para minúsculo
  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeEmpresa);

    // Verifica se a empresa superior selecionada conflita com o nome digitado (ignorando espaços)
    const superiorSelecionada = empresasSuperiores.find(
      (empresa) => empresa.id === formData.empresaSuperior
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        empresaSuperior: null,
      }));
    }

    // Atualiza a lista de empresas inferiores removendo aquelas cujo nome conflita
    const inferioresAtualizadas = formData.empresaInferior.filter((id) => {
      const empresaInferior = empresasInferiores.find(
        (empresa) => empresa.id === id
      );
      if (!empresaInferior) return false;
      return formatarNome(empresaInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.empresaInferior.length) {
      setFormData((prev) => ({
        ...prev,
        empresaInferior: inferioresAtualizadas,
      }));
    }
  }, [
    nomeEmpresa,
    empresasSuperiores,
    empresasInferiores,
    formData.empresaSuperior,
    formData.empresaInferior,
  ]);

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

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "empresaSuperior" || field === "linhaNegocio" || field === "classificacao" || field === "naturezaJuridica" || field === "regimeTributacao") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Usa o mesmo filtro aplicado nas opções do Autocomplete
      const filteredInferiores = empresasInferiores.filter(
        (empresa) =>
          empresa.id !== formData.empresaSuperior &&
          formatarNome(empresa.nome) !== formatarNome(nomeEmpresa)
      );
      if (formData.empresaInferior.length === filteredInferiores.length) {
        // Deselect all
        setFormData({ ...formData, empresaInferior: [] });
      } else {
        // Select only the filtered options
        setFormData({
          ...formData,
          empresaInferior: filteredInferiores.map(
            (empresaInferior) => empresaInferior.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "empresaInferior",
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
      if (formData.conta.length === contas.length) {
        // Deselect all
        setFormData({ ...formData, conta: [] });
      } else {
        // Select all
        setFormData({ ...formData, conta: contas.map((conta) => conta.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "conta",
        newValue.map((item) => item.id)
      );
    }
  };

  // Função para lidar com seleção múltipla de órgãos reguladores
  const handleSelectAllOrgaoRegulador = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.orgaoRegulador.length === orgaosReguladores.length) {
        // Deselect all
        setFormData({ ...formData, orgaoRegulador: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          orgaoRegulador: orgaosReguladores.map((orgao) => orgao.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "orgaoRegulador",
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const [formValidation, setFormValidation] = useState({
    empresaInferior: true,
    nomeEmpresa: true,
  });

  const allSelected =
    formData.empresaInferior.length === empresasInferiores.length &&
    empresasInferiores.length > 0;
  const allSelectedContas =
    formData.conta.length === contas.length && contas.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedOrgaoRegulador =
    formData.orgaoRegulador.length === orgaosReguladores.length &&
    orgaosReguladores.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nomeEmpresa.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeEmpresa: false }));
      missingFields.push("Empresa");
    }
    if (!cnpjEmpresa.trim() || cnpjError) {
      setCnpjError(true);
      setCnpjTouched(true);
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

    try {
      setLoading(true);

      // Separe os arquivos novos dos já existentes:
      const newFiles = formData.files.filter((file) => file instanceof File);
      const existingFiles = formData.files.filter(
        (file) => !(file instanceof File)
      );

      // Realiza upload dos novos arquivos, se houver
      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 1); // 1 para empresa
        // Em edição, já temos o id da empresa; em criação, envia string vazia
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? empresaDados?.idCompany : ""
        );
        newFiles.forEach((file) => {
          formDataUpload.append("Files", file, file.name);
        });

        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}files/uploads`,
          formDataUpload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadFilesResult = uploadResponse.data; // Supõe-se que seja um objeto do tipo { files: [...] }
      }

      // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];

      // Transforma cada item para que o payload contenha somente a URL (string)
      const finalFilesPayload = finalFiles.map((file) => {
        // Se for uma string já, retorna-a; se for objeto e tiver a propriedade "path", retorna o valor dela.
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // Configuração da URL, método e payload conforme a operação
      if (requisicao === "Criar") {
        url = `${process.env.REACT_APP_API_URL}companies`;
        method = "POST";
        payload = {
          name: nomeEmpresa,
          document: cnpjEmpresa,
          files: finalFilesPayload,
          startDate: formData.dataInicioOperacao
            ? formData.dataInicioOperacao.toISOString()
            : null,
          active: status,
          idCompanySuperior:
            formData.empresaSuperior === "" ? null : formData.empresaSuperior,
          idResponsible:
            formData.responsavel === "" ? null : formData.responsavel,
          idCompanyBottoms: formData.empresaInferior,
          idProcess: formData.processo,
          idLedgerAccounts: formData.conta,
          // Novos campos
          idBusinessLine: formData.linhaNegocio === "" ? null : formData.linhaNegocio,
          idRegulatories: formData.orgaoRegulador,
          idClassification: formData.classificacao === "" ? null : formData.classificacao,
          idLegalNature: formData.naturezaJuridica === "" ? null : formData.naturezaJuridica,
          idTaxRegime: formData.regimeTributacao === "" ? null : formData.regimeTributacao,
        };
      } else if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}companies`;
        method = "PUT";
        payload = {
          idCompany: empresaDados?.idCompany,
          name: nomeEmpresa,
          document: cnpjEmpresa,
          startDate: formData.dataInicioOperacao
            ? formData.dataInicioOperacao.toISOString()
            : null,
          active: status,
          idCompanySuperior:
            formData.empresaSuperior === "" ? null : formData.empresaSuperior,
          idResponsible:
            formData.responsavel === "" ? null : formData.responsavel,
          idCompanyBottoms: formData.empresaInferior,
          idProcess: formData.processo,
          idLedgerAccounts: formData.conta,
          files: finalFilesPayload,
          // Novos campos
          idBusinessLine: formData.linhaNegocio === "" ? null : formData.linhaNegocio,
          idRegulatories: formData.orgaoRegulador,
          idClassification: formData.classificacao === "" ? null : formData.classificacao,
          idLegalNature: formData.naturezaJuridica === "" ? null : formData.naturezaJuridica,
          idTaxRegime: formData.regimeTributacao === "" ? null : formData.regimeTributacao,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta não for ok, tenta extrair a mensagem de erro
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignora se não houver corpo na resposta
        }
        throw new Error(errorData.message || "Erro ao cadastrar a empresa.");
      }

      // Determina o id da empresa a partir da resposta
      let companyId;
      if (requisicao === "Editar" && response.status === 204) {
        companyId = empresaDados?.idCompany;
        enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      } else {
        const data = await response.json();
        companyId = data.data.idCompany;
        localStorage.setItem("idCompany", companyId);
        enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      // Se for criação, atualiza o estado e exibe o diálogo de sucesso;
      // Se for edição, volta para a listagem.
      if (requisicao === "Criar") {
        setEmpresaDados((prev) => ({ ...prev, idCompany: companyId }));
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("O CNPJ informado já foi cadastrado.", {
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

  // Função para voltar para a listagem
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
              <InputLabel>Empresa *</InputLabel>
              <TextField
                onChange={(event) => setNomeOrgao(event.target.value)}
                fullWidth
                placeholder="Digite o nome da empresa"
                value={nomeEmpresa}
                error={!nomeEmpresa && formValidation.nomeEmpresa === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={requisicao !== 'Editar' ? 6 : 3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>CNPJ *</InputLabel>
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

          {requisicao === "Editar" && (
            <>
              <Grid item xs={3}>
                <Stack spacing={1}>
                  <InputLabel>Início da operação</InputLabel>
                  <DatePicker
                    value={formData.dataInicioOperacao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataInicioOperacao: newValue,
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

              {/* Linha de Negócio */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Linha de Negócio</InputLabel>
              <Autocomplete
                options={linhasNegocio}
                getOptionLabel={(option) => option.nome}
                value={
                  linhasNegocio.find(
                    (linha) => linha.id === formData.linhaNegocio
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("linhaNegocio", newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} />
                )}
              />
            </Stack>
          </Grid>

              {/* Órgão Regulador */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Órgão Regulador</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...orgaosReguladores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.orgaoRegulador.map(
                      (id) =>
                        orgaosReguladores.find((orgao) => orgao.id === id) || id
                    )}
                    onChange={handleSelectAllOrgaoRegulador}
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
                                  ? allSelectedOrgaoRegulador
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
                      <TextField {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Classificação */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Classificação</InputLabel>
                  <Autocomplete
                    options={classificacoes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      classificacoes.find(
                        (classificacao) => classificacao.id === formData.classificacao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("classificacao", newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Natureza Jurídica */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Natureza Jurídica</InputLabel>
                  <Autocomplete
                    options={naturezasJuridicas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      naturezasJuridicas.find(
                        (natureza) => natureza.id === formData.naturezaJuridica
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("naturezaJuridica", newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Regime de Tributação */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Regime de Tributação</InputLabel>
                  <Autocomplete
                    options={regimesTributacao}
                    getOptionLabel={(option) => option.nome}
                    value={
                      regimesTributacao.find(
                        (regime) => regime.id === formData.regimeTributacao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("regimeTributacao", newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Empresa superior</InputLabel>
                  <Autocomplete
                    options={empresasSuperiores.filter(
                      (empresa) =>
                        !formData.empresaInferior.includes(empresa.id) &&
                        formatarNome(empresa.nome) !== formatarNome(nomeEmpresa)
                    )}
                    getOptionLabel={(option) => option.nome}
                    value={
                      empresasSuperiores.find(
                        (empresa) => empresa.id === formData.empresaSuperior
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => {
                        // Remove a empresa selecionada dos inferiores, caso exista
                        const inferiorAtualizado = prev.empresaInferior.filter(
                          (id) => (newValue ? id !== newValue.id : true)
                        );
                        return {
                          ...prev,
                          empresaSuperior: newValue ? newValue.id : "",
                          empresaInferior: inferiorAtualizado,
                        };
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.empresaSuperior &&
                          formValidation.empresaSuperior === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Empresas Inferiores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...empresasInferiores.filter(
                        (empresa) =>
                          empresa.id !== formData.empresaSuperior &&
                          formatarNome(empresa.nome) !==
                            formatarNome(nomeEmpresa)
                      ),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.empresaInferior.map(
                      (id) =>
                        empresasInferiores.find(
                          (empresa) => empresa.id === id
                        ) || id
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.empresaInferior.length === 0 ||
                            formData.empresaInferior.every(
                              (val) => val === 0
                            )) &&
                          formValidation.empresaInferior === false
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
                    <DrawerProcesso
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
                  <InputLabel>
                    Conta{" "}
                    <DrawerConta
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onAccountCreated={handleAccountCreated}
                    />{" "}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...contas,
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
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={1}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
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

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Participantes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemAcionistas />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: 120 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={tratarSubmit}
                sx={{ minWidth: 120 }}
              >
                {requisicao === 'Editar' ? 'Atualizar' : requisicao}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Dialog de sucesso */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "12px",
              padding: "16px",
            },
          }}
        >
          {/* Ícone de sucesso */}
          <DialogTitle
            sx={{
              textAlign: "center",
              paddingBottom: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 60, color: "#4caf50", marginBottom: 1 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#333", marginTop: 1 }}
            >
              Empresa cadastrada com sucesso!
            </Typography>
          </DialogTitle>

          {/* Conteúdo */}
          <DialogContent sx={{ textAlign: "center", paddingTop: 0 }}>
            <DialogContentText
              sx={{ fontSize: "16px", color: "#555", px: 2 }}
            >
              A empresa foi cadastrada com sucesso. Você pode voltar para a
              listagem ou adicionar mais informações a essa empresa.
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
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;

