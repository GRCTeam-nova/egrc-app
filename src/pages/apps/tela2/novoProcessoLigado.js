// material-ui
import {
  Divider,
  FormControlLabel,
  Dialog,
  Grid,
  Switch,
  InputAdornment,
  InputLabel,
  RadioGroup,
  Radio,
  Stack,
  TextField,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Tooltip,
  IconButton,
  Collapse,
} from "@mui/material";
import { API_QUERY, API_COMMAND } from '../../../config';
import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";
import { Box, Paper } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import ptBR from "date-fns/locale/pt-BR";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";

// project imports
import MainCard from "../../../components/MainCard";
import axios from "axios";
import { usePartesAdversas } from "./PartesAdversasContext";

// assets
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import CustomDrawer from "../../extra-pages/customDrawer";
import DeleteIcon from "@mui/icons-material/Delete";
import { enqueueSnackbar } from "notistack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";

import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
// Importe os ícones FontAwesome que você usará
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// ==============================|| LAYOUTS -  COLUMNS ||============================== //
function ColumnsLayouts() {
  // Hook para acessar os dados de partes e a função de atualização caso o usuário cadastre uma parte no passo 3
  const { partesAdversas: partesAdversasContext } =
    usePartesAdversas();
  const { partes: partesContext } = usePartesAdversas();
  const { responsaveis: responsaveisContext } =
    usePartesAdversas();

  // Modal Alerta
  const [showChangesNotSavedModal, setShowChangesNotSavedModal] =
    useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setShowChangesNotSavedModal(true);
  };

  const handleCloseModal = () => {
    setShowChangesNotSavedModal(false);
  };

  const voltarParaResumoProcesso = () => {
    navigate(-1);
    //navigation(`/apps/processos/editar-cadastro`, { state: { pastaId } });
  };

  const cancelRemoveUser = () => {
    // Implemente a lógica para cancelar a ação de remover o usuário
    handleCloseModal();
  };

  // Pegar número de processo pai caso exista
  const location = useLocation();
  const navigation = useNavigate();
  const { processoPaiDados } = location.state || {};
  const { processoPaiId } = location.state || {};
  const { processoSelecionadoId, numeroProcessoSelecionado, segmentoId } =
    location.state || {};
  const { pastaId, pastaNumero } = location.state || {};

  // Variáveis usadas na tela
  const [erroDataDistribuicao, setErroDataDistribuicao] = useState(false);
  const [erroDataFatorGerador, setErroDataFatorGerador] = useState(false);
  const [erroDataAudiencia, setErroDataAudiencia] = useState(false);
  const [cnj, setCnj] = useState("");
  const [isCnjValid, setIsCnjValid] = useState(false);
  const [magistrado, setMagistrado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [outroNumero, setOutroNumero] = useState("");
  const [resumoFatos, setResumoFatos] = useState("");
  const [pedidos, setPedidos] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfFileBase64, setPdfFileBase64] = useState(null);
  const [ufs, setUfs] = useState([]);
  const [comarcas, setComarcas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tags, setTags] = useState([]);
  const [posicaoProcessual, setPosicaoProcessual] = useState("");
  const [orgaos, setOrgaos] = useState([]);
  const [tribunais, setTribunais] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [instancias, setInstancias] = useState([]);
  const [dataDistribuicao] = useState(null);
  const [dataFatorGerador] = useState(null);
  const [dataAudiencia] = useState(null);
  const [acoes, setAcoes] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [fases, setFases] = useState([]);
  const [tipoAudiencias, setTipoAudiencias] = useState([]);
  const [qualificacoes, setQualificacoes] = useState([]);
  const [polos, setPolos] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [valorCausa, setValorCausa] = useState("");
  const [cnjExists, setCnjExists] = useState(false);
  const [formEnviado, setFormEnviado] = useState(false);
  const [foiDeferida] = useState([
    { id: 1, nome: "Deferida" },
    { id: 2, nome: "Não Deferida" },
  ]);

  const [empresasClientes, setEmpresasClientes] = useState([
    {
      id: 0,
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    },
  ]);

  const [partesAdversasSelect, setPartesAdversasSelect] = useState([
    {
      id: 0,
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    },
  ]);

  const [advogadoAdversoSelect, setAdvogadoAdversoSelect] = useState([
    {
      id: 0,
      nome: "",
      qualificacao: "",
      polo: "",
      oab: "",
      principal: false,
    },
  ]);

  const [responsavelSelect, setResponsavelSelect] = useState([
    {
      id: 0,
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    },
  ]);

  // Funções que são ativadas antes da montagem do componente (antes da tela carregar)
  useEffect(() => {
    window.scrollTo(0, 0); // Iniciar a tela sempre no topo
  }, []);

  // Funções para lidar com mudança de estado de cada campo visando validações e salvar seus dados para montagem do payload

  const tratarMudancaEmpresaCliente = (id, campo, valor) => {
    setEmpresasClientes((empresasAnteriores) =>
      empresasAnteriores.map((empresa) => {
        if (empresa.id === id) {
          // Checa explicitamente por null ou undefined
          const novoValor = valor === null || valor === undefined ? "" : valor;
          return { ...empresa, [campo]: novoValor };
        }
        return empresa;
      })
    );
  };

  const tratarMudancaObservacao = (event) => {
    setObservacao(event.target.value);
  };

  const tratarMudancaOutroNumero = (event) => {
    setOutroNumero(event.target.value);
  };

  const tratarMudancaMagistrado = (event) => {
    setMagistrado(event.target.value);
  };

  const tratarMudancaResumoFatos = (event) => {
    setResumoFatos(event.target.value);
  };

  const tratarMudancaPedidos = (event) => {
    setPedidos(event.target.value);
  };

  const tratarMudancaParteAdversa = (id, campo, valor) => {
    setPartesAdversasSelect((partesAnteriores) =>
      partesAnteriores.map((parte) => {
        if (parte.id === id) {
          // Checa explicitamente por null ou undefined
          const novoValor = valor === null || valor === undefined ? "" : valor;
          return { ...parte, [campo]: novoValor };
        }
        return parte;
      })
    );
  };

  const tratarMudancaAdvogado = (id, campo, valor) => {
    setAdvogadoAdversoSelect((advogadosAnteriores) =>
      advogadosAnteriores.map((advogado) => {
        if (advogado.id === id) {
          // Checa explicitamente por null ou undefined
          const novoValor = valor === null || valor === undefined ? "" : valor;
          return { ...advogado, [campo]: novoValor };
        }
        return advogado;
      })
    );
  };

  const tratarMudancaResponsavel = (id, campo, valor) => {
    setResponsavelSelect((responsaveisAnteriores) =>
      responsaveisAnteriores.map((responsavel) => {
        if (responsavel.id === id) {
          // Checa explicitamente por null ou undefined
          const novoValor = valor === null || valor === undefined ? "" : valor;
          return { ...responsavel, [campo]: novoValor };
        }
        return responsavel;
      })
    );
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "uf") {
      setFormData({ ...formData, [field]: value ? value.id : null });
      if (value) {
        fetchComarcas(value.id);
        fetchTribunais(value, formData.orgao); // Atualizar os tribunais quando a UF muda
      } else {
        setComarcas([]);
        setTribunais([]); // Limpar os tribunais se nenhuma UF estiver selecionada
      }
    }
    // Se a área for alterada, busque os órgãos relacionados
    if (field === "area") {
      setFormData({ ...formData, area: value ? value.id : null });
      if (value) {
        fetchOrgaos(value.id);
      } else {
        setOrgaos([]); // Limpar os órgãos se nenhuma área estiver selecionada
      }
    }
    if (field === "orgao") {
      setFormData({ ...formData, orgao: value ? value.id : null });
      if (value && formData.uf) {
        fetchTribunais(formData.uf, value.id);
      } else {
        setTribunais([]); // Limpar os tribunais se nenhum órgão estiver selecionado
      }
    }
    if (field === "tribunal") {
      setFormData({ ...formData, tribunal: value ? value.id : null });
      if (value) {
        fetchCompetencias(value.id);
      } else {
        setCompetencias([]); // Limpar as competências se nenhum tribunal estiver selecionado
      }
    }
    if (field === "parteAdversa") {
      setFormData({ ...formData, parteAdversa: value ? value.id : null });
    }
    if (field === "dataDistribuicao") {
      setErroDataDistribuicao(false);
    }
    if (field === "dataFatorGerador") {
      setErroDataFatorGerador(false);
    }
    if (field === "dataAudiencia") {
      setErroDataAudiencia(false);
    }

    // Checagem geral
    if (
      field === "comarca" ||
      field === "competencia" ||
      field === "instancia" ||
      field === "acao" ||
      field === "uf" ||
      field === "prioridade" ||
      field === "fase" ||
      field === "tipoAudiencia" ||
      field === "orgao" ||
      field === "assunto" ||
      field === "tribunal" ||
      field === "area" ||
      field === "deferida"
    ) {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  // FormData para armazenamento e futura montagem de payload (dados para o endpoint)
  const [formData, setFormData] = useState({
    uf: null,
    comarca: null,
    area: null,
    orgao: null,
    tribunal: null,
    deferida: null,
    competencia: null,
    parteEmpresa: null,
    instancia: null,
    acao: null,
    prioridade: null,
    fase: null,
    tipoAudiencia: null,
    qualificacao: null,
    polo: null,
    assunto: null,
    parteAdversa: null,
    segmento: null,
    status: [],
    tag: [],
    advogado: [],
    responsavel: [],
  });

  // Função para carregar os dados das APIs
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url);
      setState(response.data);
    } catch (error) {
    }
  };

  // Preencher Autocompletes com opções vindas da API
  useEffect(() => {
    fetchData(`${API_QUERY}/api/Uf`, setUfs);
    fetchData(`${API_QUERY}/api/Area?ativo=true`, setAreas);
    fetchData(
      `${API_QUERY}/api/Assunto?ativo=true`,
      setAssuntos
    );
    fetchData(`${API_QUERY}/api/Tag`, setTags);
    fetchData(`${API_QUERY}/api/Instancia`, setInstancias);
    fetchData(`${API_QUERY}/api/Acao?ativo=true`, setAcoes);
    fetchData(`${API_QUERY}/api/Prioridade`, setPrioridades);
    fetchData(`${API_QUERY}/api/Fase`, setFases);
    fetchData(`${API_QUERY}/api/TipoAudiencia/ListarCombo`, setTipoAudiencias);
    fetchData(`${API_QUERY}/api/Polo`, setPolos);
    fetchData(`${API_QUERY}/api/Qualificacao`, setQualificacoes);
  }, []);

  // Buscar dados da API para campos especificos
  const fetchComarcas = async (ufId) => {
    try {
      setFormData({ ...formData, comarca: null });
      const response = await axios.get(
        `${API_QUERY}/api/Comarca/ListarComboPorUF/${ufId}`
      );
      setComarcas(response.data);
    } catch (error) {
    }
  };

  // Função para buscar órgãos baseada na área selecionada
  const fetchOrgaos = async (areaId) => {
    try {
      setFormData({ ...formData, orgao: null });
      const response = await axios.get(
        `http://10.0.70.3:5020/api/Orgao/ListarComboPorArea/${areaId}`
      );
      setOrgaos(response.data);
    } catch (error) {
    }
  };

  const fetchTribunais = async (ufId, orgaoId) => {
    if (ufId && orgaoId) {
      try {
        setFormData({ ...formData, tribunal: null });
        const response = await axios.get(
          `${API_QUERY}/api/Tribunal/ListarComboPorUFEOrgao/${ufId}/${orgaoId}`
        );
        setTribunais(response.data);
      } catch (error) {
      }
    }
  };

  const fetchCompetencias = async (tribunalId) => {
    try {
      setFormData({ ...formData, competencia: null });
      const response = await axios.get(
        `http://10.0.70.3:5020/api/Competencia/ListarComboPorTribunal/${tribunalId}`
      );
      setCompetencias(response.data);
    } catch (error) {
    }
  };

  const tratarMudancaValorCausa = (event) => {
    const valorFormatado = formatarValor(event.target.value);
    setValorCausa(valorFormatado); // Supondo que você esteja usando um hook de estado para gerenciar o valor
  };

  const tratarMudancaCnj = (event) => {
    let originalValue = event.target.value.replace(/\D/g, "");

    // Limitar o comprimento da string a 20 caracteres
    originalValue = originalValue.slice(0, 20);

    let formattedValue = "";

    // Aplicar a formatação
    if (originalValue.length <= 7) {
      formattedValue = originalValue;
    } else if (originalValue.length <= 9) {
      formattedValue = `${originalValue.slice(0, 7)}-${originalValue.slice(7)}`;
    } else if (originalValue.length <= 13) {
      formattedValue = `${originalValue.slice(0, 7)}-${originalValue.slice(
        7,
        9
      )}.${originalValue.slice(9)}`;
    } else if (originalValue.length <= 14) {
      formattedValue = `${originalValue.slice(0, 7)}-${originalValue.slice(
        7,
        9
      )}.${originalValue.slice(9, 13)}.${originalValue.slice(13)}`;
    } else if (originalValue.length <= 16) {
      formattedValue = `${originalValue.slice(0, 7)}-${originalValue.slice(
        7,
        9
      )}.${originalValue.slice(9, 13)}.${originalValue.slice(
        13,
        14
      )}.${originalValue.slice(14)}`;
    } else {
      formattedValue = `${originalValue.slice(0, 7)}-${originalValue.slice(
        7,
        9
      )}.${originalValue.slice(9, 13)}.${originalValue.slice(
        13,
        14
      )}.${originalValue.slice(14, 16)}.${originalValue.slice(16)}`;
    }

    setCnj(formattedValue);
    validateCnj(formattedValue);
  };

  const verificarCnj = async (cnj) => {
    try {
      const response = await axios.get(`${API_QUERY}/api/Processo/ExisteNumero/${cnj}`);
      if (response.data >= 1) {
        setCnjExists(true);
      }
    } catch (error) {
      console.error('Erro ao verificar o CNJ:', error);
    }
  };

  const formatarValor = (valor) => {
    // Remover tudo que não é número
    let valorNumerico = valor.replace(/\D/g, "").slice(0, 15);

    if (!valorNumerico) {
      return "0,00";
    }

    // Converter para número e formatar como moeda
    valorNumerico = (parseInt(valorNumerico) / 100).toFixed(2) + "";
    valorNumerico = valorNumerico.replace(".", ",");
    valorNumerico = valorNumerico.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    return valorNumerico;
  };

  const onDrop = useCallback((acceptedFiles) => {
    setIsFileInvalid(false);
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      convertFileToBase64(file, (base64Result) => {
        // Aqui você tem o arquivo em base64
        setPdfFileBase64(base64Result); // Supondo que você tenha um estado chamado `setPdfFileBase64`
      });
      setUploadedFile(file);
    } else {
      setIsFileInvalid(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "application/pdf",
  });
  // Função para fechar a visualização do PDF
  const handleClosePdf = () => {
    setPdfFile(null);
  };

  const handleViewDocument = () => {
    if (pdfFile) {
      window.open(pdfFile, "_blank");
    }
  };

  const handleDownloadFile = () => {
    const link = document.createElement("a");
    link.href = pdfFile;
    link.setAttribute("download", uploadedFile.name); // Definir o nome do arquivo para download
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleLoadPdf = () => {
    if (uploadedFile) {
      setPdfFile(URL.createObjectURL(uploadedFile));
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setUploadedFile(null); // Remover o arquivo do estado
    URL.revokeObjectURL(pdfFile); // Descarregar o PDF
  };

  const convertFileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.log("Error: ", error);
  };

  const [possuiTutela, setPossuiTutela] = React.useState(false);

  const tratarMudancaSwitch = (event) => {
    setPossuiTutela(event.target.checked);
  };

  const [collapsedEmpresa, setCollapsedEmpresa] = useState(false);
  const [collapsedParteAdversa, setCollapsedParteAdversa] = useState(false);
  const [collapsedAdvogadoAdverso] =
    useState(false);
  const [collapsedResponsavel, setCollapsedResponsavel] = useState(false);

  const tratarMudancaEsconderParteAdversa = () => {
    setCollapsedParteAdversa(!collapsedParteAdversa);
  };

  const tratarMudancaEsconderResponsavel = () => {
    setCollapsedResponsavel(!collapsedResponsavel);
  };

  const tratarMudancaEsconderEmpresa = () => {
    setCollapsedEmpresa(!collapsedEmpresa);
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  // Essa função agora apenas alterna o estado do drawer
  const toggleDrawer = (title = "") => {
    setIsDrawerOpen(!isDrawerOpen);
    setDrawerTitle(title);
  };

  const adicionarEmpresaCliente = () => {
    const novaEmpresa = {
      id: uuidv4(),
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    };
    setEmpresasClientes((empresasAnteriores) => [
      ...empresasAnteriores,
      novaEmpresa,
    ]);
  };

  const [empresaPrincipalId, setEmpresaPrincipalId] = useState("");
  const [partePrincipalId, setPartePrincipalId] = useState("");
  const [advogadoPrincipalId, setAdvogadoPrincipalId] = useState("");
  const [responsavelPrincipalId, setResponsavelPrincipalId] = useState("");

  const removerEmpresaCliente = (id) => {
    setEmpresasClientes((empresasAnteriores) =>
      empresasAnteriores.filter((empresa) => empresa.id !== id)
    );
  };

  const adicionarParteAdversaSelect = () => {
    const novaParteAdversa = {
      id: uuidv4(),
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    };
    setPartesAdversasSelect((partesAnteriores) => [
      ...partesAnteriores,
      novaParteAdversa,
    ]);
  };

  const removerParteAdversaSelect = (id) => {
    setPartesAdversasSelect((partesAnteriores) =>
      partesAnteriores.filter((parte) => parte.id !== id)
    );
  };

  const adicionarAdvogadoAdverso = () => {
    const novoAdvogadoAdverso = {
      id: uuidv4(),
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    };
    setAdvogadoAdversoSelect((advogadosAnteriores) => [
      ...advogadosAnteriores,
      novoAdvogadoAdverso,
    ]);
  };

  const removerAdvogadoAdverso = (id) => {
    setAdvogadoAdversoSelect((advogadosAnteriores) =>
      advogadosAnteriores.filter((advogado) => advogado.id !== id)
    );
  };

  const adicionarNovoResponsavel = () => {
    const novoResponsavel = {
      id: uuidv4(),
      nome: "",
      qualificacao: "",
      polo: "",
      principal: false,
    };
    setResponsavelSelect((responsaveisAnteriores) => [
      ...responsaveisAnteriores,
      novoResponsavel,
    ]);
  };

  const removerResponsavel = (id) => {
    setResponsavelSelect((responsaveisAnteriores) =>
      responsaveisAnteriores.filter((responsavel) => responsavel.id !== id)
    );
  };

  const [formValidation, setFormValidation] = useState({
    cnj: true,
    uf: true,
    comarca: true,
    area: true,
    orgao: true,
    tribunal: true,
    instancia: true,
    valorCausa: true,
    competencia: true,
    acao: true,
    deferida: true,
    // Inclua outros campos obrigatórios conforme necessário...
  });

  const validateCnj = (cnj) => {
    // Example validation logic (you might need a more complex validation depending on the requirements)
    const isValid = cnj.length === 25; // Simplified check, replace with actual validation logic
    setIsCnjValid(isValid);
  };

  const validateEmpresasClientes = (empresasClientes) => {
    let hasPrincipal = false;
    let allFieldsValid = true;
    let missingFields = []; // Adicionado para rastrear campos faltantes

    empresasClientes.forEach((empresaCliente) => {
      let empresaMissingFields = {
        id: empresaCliente.id,
        missing: [],
      };

      if (!empresaCliente.nome) {
        allFieldsValid = false;
        empresaMissingFields.missing.push("nome");
      }
      if (!empresaCliente.qualificacao) {
        allFieldsValid = false;
        empresaMissingFields.missing.push("qualificacao");
      }
      if (empresaCliente.polo === "") {
        allFieldsValid = false;
        empresaMissingFields.missing.push("polo");
      }
      if (empresaMissingFields.missing.length > 0) {
        missingFields.push(empresaMissingFields);
      }
      if (empresaCliente.principal) {
        hasPrincipal = true;
      }
    });

    return {
      foiValidado: hasPrincipal && allFieldsValid,
      missingFields,
    };
  };

  const validatePartesAdversas = (partesAdversasSelect) => {
    let hasPrincipal = false;
    let allFieldsValid = true;
    let missingFields = []; 

    partesAdversasSelect.forEach((partesAdversas) => {
      let parteMissingFields = {
        id: partesAdversas.id,
        missing: [],
      };

      if (!partesAdversas.nome) {
        allFieldsValid = false;
        parteMissingFields.missing.push("nome");
      }
      if (!partesAdversas.qualificacao) {
        allFieldsValid = false;
        parteMissingFields.missing.push("qualificacao");
      }
      if (partesAdversas.polo === "") {
        allFieldsValid = false;
        parteMissingFields.missing.push("polo");
      }
      if (parteMissingFields.missing.length > 0) {
        missingFields.push(parteMissingFields);
      }
      if (partesAdversas.principal) {
        hasPrincipal = true;
      }
    });

    return {
      foiValidado: hasPrincipal && allFieldsValid,
      missingFields,
    };
  };

  const validateAdvogadosAdversos = (advogadoAdversoSelect) => {
    let allFieldsValid = true;
    let missingFields = [];

    advogadoAdversoSelect.forEach((advogado) => {
      let advogadoMissingFields = {
        id: advogado.id,
        missing: [],
      };

      const isAnyFieldFilled =
        advogado.nome || advogado.oab || advogado.qualificacao;

      if (isAnyFieldFilled) {
        if (!advogado.nome) {
          allFieldsValid = false;
          advogadoMissingFields.missing.push("nome");
        }
        if (!advogado.oab) {
          allFieldsValid = false;
          advogadoMissingFields.missing.push("oab");
        }
        if (!advogado.qualificacao) {
          allFieldsValid = false;
          advogadoMissingFields.missing.push("qualificacao");
        }
      }

      if (advogadoMissingFields.missing.length > 0) {
        missingFields.push(advogadoMissingFields);
      }
    });

    return {
      foiValidado: allFieldsValid,
      missingFields,
    };
  };

  const validateResponsaveis = (responsavelSelect) => {
    let hasPrincipal = false;
    let allFieldsValid = true;
    let missingFields = [];

    responsavelSelect.forEach((responsaveis) => {
      let responsaveisMissingFields = {
        id: responsaveis.id,
        missing: [],
      };

      if (!responsaveis.nome) {
        allFieldsValid = false;
        responsaveisMissingFields.missing.push("nome");
      }
      if (!responsaveis.qualificacao) {
        allFieldsValid = false;
        responsaveisMissingFields.missing.push("qualificacao");
      }
      if (responsaveisMissingFields.missing.length > 0) {
        missingFields.push(responsaveisMissingFields);
      }
      if (responsaveis.principal) {
        hasPrincipal = true;
      }
    });

    return {
      foiValidado: hasPrincipal && allFieldsValid,
      missingFields,
    };
  };

  const validarCampoFoiDeferida = () => {
    if (
      possuiTutela &&
      (formData.deferida === undefined || formData.deferida === null)
    ) {
      return false;
    }
    return true;
  };

  const fieldNamesMap = {
    cnj: "CNJ",
    uf: "UF",
    comarca: "Comarca",
    orgao: "Órgão",
    area: "Área",
    tribunal: "Tribunal",
    instancia: "Instância",
    valorCausa: "Valor da Causa",
  };

  const validarForm = () => {
    let foiValidado = true;
    let invalidFields = [];
    const cnjPreenchido = !!cnj.trim();
    const cnjCompleto = cnj.replace(/\D/g, "").length === 20;

    // Atualizar o estado de validação do CNJ
    setIsCnjValid(cnjPreenchido && cnjCompleto);

    if (!cnjPreenchido || !cnjCompleto) {
      foiValidado = false;
      invalidFields.push("CNJ");
    }
    const newValidationState = {
      cnj: cnjPreenchido && cnjCompleto,
      uf: !!formData.uf,
      comarca: !!formData.comarca,
      orgao: !!formData.orgao,
      area: !!formData.area,
      tribunal: !!formData.tribunal,
      instancia: !!formData.instancia,
      competencia: true, 
      acao: true, 
      valorCausa: !!valorCausa.trim(),
      deferida: !!formData.deferida,
    };

    Object.entries(newValidationState).forEach(([key, value]) => {
      if (!["competencia", "acao", "deferida"].includes(key) && !value) {
        foiValidado = false;
        invalidFields.push(fieldNamesMap[key] || key); 
      }
    });

    setFormValidation(newValidationState);

    if (!foiValidado) {
      // Removendo duplicatas
      const uniqueInvalidFields = [...new Set(invalidFields)];
      const fieldsMessage = uniqueInvalidFields
        .map((field) => fieldNamesMap[field] || field)
        .join(", ");
      enqueueSnackbar(`Campos inválidos: ${fieldsMessage}`, {
        variant: "error",
      });
    }

    if (!validarCampoFoiDeferida()) {
      foiValidado = false;
      enqueueSnackbar(`O campo 'Foi Deferida' está vázio`, {
        variant: "error",
      });
    }

    const isPosicaoProcessualValida =
      posicaoProcessual === "pro" || posicaoProcessual === "contra";

    if (!isPosicaoProcessualValida) {
      enqueueSnackbar("Selecione uma posição processual.", {
        variant: "error",
      });
      return false;
    }

    return foiValidado;
  };

  const tratarSubmit = async () => {
    let temErros = false;

    // Primeira validação
    if (!validarForm()) {
      temErros = true; // Marca que há erros, mas não retorna imediatamente
    }

    // Segunda validação
    const validationEmpresasClientes =
      validateEmpresasClientes(empresasClientes);
    if (!validationEmpresasClientes.foiValidado) {
      enqueueSnackbar(
        "Verifique se todos os campos obrigatórios em Empresas/Clientes estão preenchidos e se pelo menos uma empresa é marcada como principal.",
        { variant: "error" },
        { autoHideDuration: 10000 }
      );
      temErros = true; // Marca que há erros, mas não retorna imediatamente
      setFormEnviado(true);
    }

    // Terceira validação
    const validacaoPartesAdversas =
      validatePartesAdversas(partesAdversasSelect);
    if (!validacaoPartesAdversas.foiValidado) {
      enqueueSnackbar(
        "Verifique se todos os campos obrigatórios em Partes Adversas estão preenchidos e se pelo menos uma parte é marcada como principal.",
        { variant: "error" },
        { autoHideDuration: 10000 }
      );
      temErros = true; // Marca que há erros, mas não retorna imediatamente
      setFormEnviado(true);
    }

    // Quarta validação
    const validacaoResponsaveis = validateResponsaveis(responsavelSelect);
    if (!validacaoResponsaveis.foiValidado) {
      enqueueSnackbar(
        "Verifique se todos os campos obrigatórios em Responsáveis estão preenchidos e se pelo menos um responsável é marcada como principal.",
        { variant: "error" },
        { autoHideDuration: 10000 }
      );
      temErros = true; // Marca que há erros, mas não retorna imediatamente
      setFormEnviado(true);
    }

    // Quinta validação: Advogados Adversos
    const validacaoAdvogadosAdversos = validateAdvogadosAdversos(
      advogadoAdversoSelect
    );
    if (!validacaoAdvogadosAdversos.foiValidado) {
      enqueueSnackbar(
        "Verifique se todos os campos obrigatórios para Advogado Adverso estão preenchidos, caso algum campo tenha sido preenchido.",
        { variant: "error" },
        { autoHideDuration: 10000 }
      );
      temErros = true;
      setFormEnviado(true);
    }

    // Sexta validação: Ano de data não pode ser inferior a 1000
    if (formData.dataDistribuicao) {
      // Convertendo a string de data para um objeto Date
      const dataDistribuicaoObj = new Date(formData.dataDistribuicao);

      // Extraindo o ano do objeto Date
      const anoDataDistribuicao = dataDistribuicaoObj.getFullYear();

      // Verifica se o ano é NaN ou menor que 1000
      if (isNaN(anoDataDistribuicao) || anoDataDistribuicao < 1000) {
        enqueueSnackbar(`O campo 'Data da Distribuição' está inválido`, {
          variant: "error",
        });
        setErroDataDistribuicao(true);
        temErros = true;
      }
    }

    if (formData.dataFatorGerador) {
      // Convertendo a string de data para um objeto Date
      const dataFatorGeradorObj = new Date(formData.dataFatorGerador);

      // Extraindo o ano do objeto Date
      const anoDataFator = dataFatorGeradorObj.getFullYear();

      // Verifica se o ano é NaN ou menor que 1000
      if (isNaN(anoDataFator) || anoDataFator < 1000) {
        enqueueSnackbar(`O campo 'Data do Fator Gerador' está inválido`, {
          variant: "error",
        });
        setErroDataFatorGerador(true);
        temErros = true;
      }
    }

    if (formData.dataAudiencia) {
      // Convertendo a string de data para um objeto Date
      const dataAudienciaObj = new Date(formData.dataAudiencia);

      // Extraindo o ano do objeto Date
      const anoDataAudiencia = dataAudienciaObj.getFullYear();

      // Verifica se o ano é NaN ou menor que 1000
      if (isNaN(anoDataAudiencia) || anoDataAudiencia < 1000) {
        enqueueSnackbar(`O campo 'Data da Audiência' está inválido`, {
          variant: "error",
        });
        setErroDataAudiencia(true);
        temErros = true;
      }
    }

    // Setima Validação: Remover advogados adversos com dados nulos ou incompletos
    const advogadoAdversoValidos = advogadoAdversoSelect.filter(
      (advogadoAdverso) => advogadoAdverso.nome && advogadoAdverso.oab
    );

    // Oitava Validação:

    // Resetar a validação do CNJ
    setIsCnjValid(true);

    // Verificar se o CNJ está preenchido e se tem todos os dígitos
    if (cnj.replace(/\D/g, "").length !== 20) {
      setIsCnjValid(false); // CNJ inválido
      temErros = true;
    }

    // Nona Validação: Documento

    // Verifique se existe documentos e se estão validos
    const documentos = uploadedFile
      ? [
          {
            nome: uploadedFile.name,
            base64: pdfFileBase64,
          },
        ]
      : null; // ou [] para uma lista vazia, se preferir

    // Decima validação: Formatação de Tags

    const TagsFormatadas = formData.tag.map((tagId) => ({ tagId: tagId }));

    // Verifica se houve algum erro
    if (temErros) {
      return; // Impede o envio do formulário apenas se houve erros
    }

    // Se passar por todas as validações, prossegue com a criação do objeto JSON e o envio
    const empresaClienteJSON = empresasClientes.map((empresaCliente) => ({
      parteId: empresaCliente.nome,
      qualificacaoId: empresaCliente.qualificacao,
      tipoParte: 1,
      polo:
        empresaCliente.polo || empresaCliente.polo === 0
          ? empresaCliente.polo
          : 0,
      principal: empresaCliente.principal,
    }));
    const parteAdversaJSON = partesAdversasSelect.map((parteAdversa) => ({
      parteId: parteAdversa.nome,
      qualificacaoId: parteAdversa.qualificacao,
      tipoParte: 2,
      polo:
        parteAdversa.polo || parteAdversa.polo === 0 ? parteAdversa.polo : 0,
      principal: parteAdversa.principal,
    }));
    const advogadoAdversoJSON = advogadoAdversoValidos.map(
      (advogadoAdverso) => ({
        parteId: advogadoAdverso.nome,
        parteAdversaId: advogadoAdverso.qualificacao,
        oab: advogadoAdverso.oab,
        tipoParte: 3,
        principal: advogadoAdverso.principal,
      })
    );
    const responsaveisJSON = responsavelSelect.map((responsaveis) => ({
      usuarioId: responsaveis.nome,
      qualificacaoId: responsaveis.qualificacao,
      principal: responsaveis.principal,
    }));

    // Transforma as partes e os responsáveis de volta para a estrutura esperada pelo backend
    const partes = [
      ...empresaClienteJSON,
      ...parteAdversaJSON,
      ...advogadoAdversoJSON,
    ];

    const responsaveis = responsaveisJSON.map((responsavel) => ({
      usuarioId: responsavel.usuarioId,
      principal: responsavel.principal,
      cargoId: responsavel.cargoId,
      oab: responsavel.oab,
    }));

    // Substitui todos os pontos por uma string vazia e todas as vírgulas por pontos
    const valorCausaAlterado = valorCausa.replace(/\./g, "").replace(/,/g, ".");

    const payload = {
      partes,
      responsaveis,
      segmentoId: segmentoId,
      posicaoProcessual: posicaoProcessual,
      codigoReferencia: formData.codigoReferencia, // ok
      pastaId: pastaId ? pastaId : null,
      processoPaiId: processoPaiId ? processoPaiId : null,
      servicoTags: TagsFormatadas,
      documentos: documentos,
      numeroProcesso: cnj, // ok
      outroNumero: outroNumero, // ok
      dataDistribuicao: formData.dataDistribuicao, // ok
      ufId: formData.uf, // ok
      comarcaId: formData.comarca, // ok
      orgaoId: formData.orgao, // ok
      tribunalId: formData.tribunal, // ok
      competenciaId: formData.competencia, // ok
      areaId: formData.area, // ok
      acaoId: formData.acao, // ok
      assuntoId: formData.assunto, // ok
      instanciaId: formData.instancia, // ok
      valorCausa: valorCausaAlterado,
      magistrado: magistrado,
      observacoes: observacao,
      prioridadeId: formData.prioridade, // ok
      dataFatoGerador: formData.dataFatorGerador, // ok
      dataAudiencia: formData.dataAudiencia, // ok
      resumoFatos: resumoFatos,
      pedido: pedidos,
      possuiTutela: possuiTutela,
      deferida: formData.deferida, // ok
      faseId: formData.fase, // ok
    };

    // Se possuiTutela for false, deferida deve ser null
    if (!possuiTutela) {
      payload.deferida = null;
    }

    // Realiza a requisição POST
    try {
      const response = await fetch(
        `${API_COMMAND}/api/Processo/Criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text(); 
        try {
          const errorData = JSON.parse(errorBody); 
          throw new Error(
            `Falha ao enviar o formulário: ${response.status} ${
              response.statusText
            } - ${JSON.stringify(errorData)}`
          );
        } catch {
          throw new Error(
            `Falha ao enviar o formulário: ${response.status} ${response.statusText} - ${errorBody}`
          );
        }
      } else {
        navigation(`/apps/processos/editar-cadastro`, {
          state: {
            pastaId,
            processoSelecionadoId,
            numeroProcessoSelecionado,
            vindoDe: "EdicaoCadastro",
            indoPara: "EditarCadastro",
          },
        });
      }
    } catch (error) {
    }
  };

  const isAnyAdvogadoFieldFilled = (advogadoAdverso) => {
    return (
      advogadoAdverso.nome ||
      advogadoAdverso.oab ||
      advogadoAdverso.qualificacao
    );
  };

  return (
    <Grid container spacing={3}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid item xs={12} lg={pdfFile ? 7 : 9}>
          <Box
            sx={{
              fontFamily: "Open Sans, sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: "24.51px",
              textAlign: "left",
              color: "#1C5297",
              marginBottom: "36px",
              marginTop: "5px",
            }}
          >
            {processoPaiDados ? (
              <>Cadastrar Apenso ao Processo - {processoPaiDados}</>
            ) : (
              <>Cadastrar Apensa a Pasta - {pastaNumero}</>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <Chip
              label="1"
              color="primary"
              sx={{
                borderRadius: "47%",
              }}
            />
            <Box>
              <Typography
                variant="body1"
                component="span"
                sx={{
                  color: "rgba(0, 0, 0, 0.60)", // Cor do texto
                  fontSize: "12px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 300, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Passo 1
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: "rgba(27, 20, 100, 0.80)", // Cor do texto
                  fontSize: "18px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 400, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Dados Iniciais
              </Typography>
            </Box>
          </Box>

          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Documento de petição inicial</InputLabel>
                    <Box
                      {...getRootProps()}
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        border: "2px dashed gray",
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        cursor: "pointer",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 344,
                        height: 66,
                        flexShrink: 0,
                        "&:hover": {
                          bgcolor: "background.default",
                        },
                      }}
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <Typography>Drop the files here ...</Typography>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <CloudUploadIcon sx={{ fontSize: 40 }} />{" "}
                          {/* Tamanho do ícone reduzido */}
                          <Typography
                            sx={{
                              color: "#848484", // Cor alterada
                              fontFamily: "Open Sans, Helvetica", // Família da fonte
                              fontSize: "12px", // Tamanho da fonte
                              fontStyle: "normal", // Estilo da fonte
                              fontWeight: 400, // Peso da fonte
                              lineHeight: "150%", // Altura da linha
                            }}
                          >
                            Arraste e solte aqui seu arquivo ou clique para
                            buscar no seu computador
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    {isFileInvalid && (
                      <Typography color="error" sx={{ mt: 2 }}>
                        Apenas arquivos PDF são permitidos.
                      </Typography>
                    )}
                    {uploadedFile && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: 344,
                          mt: 2,
                          p: 1,
                          border: "0.4px solid rgba(0, 0, 0, 0.30)",
                          background: "rgba(0, 0, 0, 0.02)",
                        }}
                      >
                        <PictureAsPdfIcon sx={{ mr: 1, color: "#00000080" }} />
                        <Typography variant="subtitle2" noWrap>
                          {uploadedFile.name}
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={handleLoadPdf}>
                            <VisibilityIcon fontSize="small" color="inherit" />
                          </IconButton>
                          <IconButton size="small" onClick={handleDownloadFile}>
                            <DownloadIcon fontSize="small" color="inherit" />
                          </IconButton>
                          <IconButton size="small" onClick={handleRemoveFile}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Posição Processual *</InputLabel>
                    <RadioGroup
                      row
                      aria-label="position"
                      name="position"
                      value={posicaoProcessual}
                      onChange={(e) => setPosicaoProcessual(e.target.value)}
                    >
                      <FormControlLabel
                        value="pro"
                        control={<Radio />}
                        id="proButton"
                        label="Pró"
                      />
                      <FormControlLabel
                        value="contra"
                        control={<Radio />}
                        label="Contra"
                      />
                    </RadioGroup>
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Stack spacing={1}>
                    <InputLabel>Número de Processo - CNJ *</InputLabel>
                    <TextField
                      fullWidth
                      placeholder="0000000-00.0000.0.00.0000"
                      value={cnj}
                      onChange={tratarMudancaCnj}
                      onBlur={() => verificarCnj(cnj)}
                      error={!isCnjValid && formEnviado}
                      InputProps={{
                        endAdornment: (
                          <>
                            {!isCnjValid && formEnviado && (
                              <InputAdornment position="end">
                                <Tooltip title="CNJ inválido ou incompleto. O CNJ deve conter todos os 25 dígitos.">
                                  <ErrorIcon color="error" />
                                </Tooltip>
                              </InputAdornment>
                            )}
                          </>
                        ),
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Stack spacing={1}>
                    <InputLabel>Outro Número</InputLabel>
                    <TextField
                      onChange={tratarMudancaOutroNumero}
                      value={outroNumero}
                      fullWidth
                      placeholder=""
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Stack spacing={1}>
                    <InputLabel>Data da Distribuição</InputLabel>
                    <DatePicker
                      value={dataDistribuicao}
                      disabledKeyboardNavigation={true}
                      onChange={(newValue) => {
                        tratarMudancaInputGeral("dataDistribuicao", newValue);
                      }}
                      slotProps={{
                        textField: {
                          error: erroDataDistribuicao,
                        },
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>UF *</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={ufs}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={ufs.find((uf) => uf.id === formData.uf) || null}
                      onChange={(event, newValue) => {
                        tratarMudancaInputGeral("uf", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Escreva ou selecione uma UF"
                          error={!formData.uf && formValidation.uf === false}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {!formData.uf &&
                                  formValidation.uf === false && (
                                    <InputAdornment position="end">
                                      <Tooltip title="Campo obrigatório">
                                        <ErrorIcon color="error" />
                                      </Tooltip>
                                    </InputAdornment>
                                  )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Comarca *</InputLabel>
                    <Tooltip
                      title={!formData.uf ? "Preencha o campo UF" : ""}
                      placement="bottom"
                      disableHoverListener={!!formData.uf}
                    >
                      <Autocomplete
                        noOptionsText="Dados não encontrados"
                        openText="Abrir"
                        closeText="Fechar"
                        options={comarcas}
                        getOptionLabel={(option) => option.nome}
                        value={
                          comarcas.find(
                            (comarca) => comarca.id === formData.comarca
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          tratarMudancaInputGeral("comarca", newValue);
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item xs>
                                {option.nome}
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            disabled={!formData.uf}
                            placeholder={
                              formData.comarca
                                ? "Escreva ou selecione uma comarca"
                                : "Escreva ou selecione uma comarca"
                            }
                            error={
                              !formData.comarca &&
                              formValidation.comarca === false
                            }
                            // Adiciona estilos condicionalmente
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {!formData.comarca &&
                                    formValidation.comarca === false && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-error": {
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "error.main", // Aplica a borda vermelha para campos em estado de erro
                                  },
                                },
                                "&.Mui-disabled": {
                                  ".MuiOutlinedInput-notchedOutline": {
                                    borderColor: !formValidation.comarca
                                      ? "error.main"
                                      : "action.disabled", // Borda vermelha se em erro, mesmo desabilitado
                                  },
                                  color: "text.primary", // Manter a cor do texto primária para o ícone e o texto
                                },
                              },
                            }}
                          />
                        )}
                        disabled={!formData.uf} // Desabilita o Autocomplete quando nenhuma uf estiver selecionada
                      />
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Área *</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={areas}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        areas.find((area) => area.id === formData.area) || null
                      } // Encontra o objeto UF correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da UF selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("area", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
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
                            formData.area ? "" : "Escreva ou selecione uma área"
                          }
                          error={
                            !formData.area && formValidation.area === false
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {!formData.area &&
                                  formValidation.area === false && (
                                    <InputAdornment position="end">
                                      <Tooltip title="Campo obrigatório">
                                        <ErrorIcon color="error" />
                                      </Tooltip>
                                    </InputAdornment>
                                  )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Orgão *</InputLabel>
                    <Tooltip
                      title={!formData.area ? "Preencha o campo Área" : ""}
                      placement="bottom"
                      disableHoverListener={!!formData.area}
                    >
                      <Autocomplete
                        options={orgaos}
                        noOptionsText="Dados não encontrados"
                        openText="Abrir"
                        closeText="Fechar"
                        getOptionLabel={(option) => option.nome} // Exibe o nome
                        value={
                          orgaos.find((orgao) => orgao.id === formData.orgao) ||
                          null
                        } // Encontra o objeto correspondente
                        onChange={(event, newValue) => {
                          // Atualize com o ID do órgão selecionado ou null se nada for selecionado
                          tratarMudancaInputGeral("orgao", newValue);
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item xs>
                                {option.nome}
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            disabled={!formData.area} // Desabilita se nenhuma área estiver selecionada
                            placeholder={
                              formData.orgao
                                ? "Escreva ou selecione um órgão"
                                : "Escreva ou selecione um órgão"
                            }
                            error={
                              !formData.orgao && formValidation.orgao === false
                            }
                            // Adiciona estilos condicionalmente
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {!formData.orgao &&
                                    formValidation.orgao === false && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-error": {
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "error.main", // Aplica a borda vermelha para campos em estado de erro
                                  },
                                },
                                "&.Mui-disabled": {
                                  ".MuiOutlinedInput-notchedOutline": {
                                    borderColor: !formValidation.orgao
                                      ? "error.main"
                                      : "action.disabled", // Borda vermelha se em erro, mesmo desabilitado
                                  },
                                  color: "text.primary", // Manter a cor do texto primária para o ícone e o texto
                                },
                              },
                            }}
                          />
                        )}
                        disabled={!formData.area} // Desabilita o Autocomplete quando nenhuma área estiver selecionada
                      />
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Tribunal *</InputLabel>
                    <Tooltip
                      title={
                        !formData.orgao || !formData.uf
                          ? "Preencha os campos Orgão e UF"
                          : ""
                      }
                      placement="bottom"
                      disableHoverListener={!!(formData.orgao && formData.uf)}
                    >
                      <Autocomplete
                        noOptionsText="Dados não encontrados"
                        openText="Abrir"
                        closeText="Fechar"
                        options={tribunais}
                        getOptionLabel={(option) => option.nome} // Exibe o nome
                        value={
                          tribunais.find(
                            (tribunal) => tribunal.id === formData.tribunal
                          ) || null
                        } // Encontra o objeto correspondente
                        onChange={(event, newValue) => {
                          // Atualize com o ID do tribunal selecionado ou null se nada for selecionado
                          tratarMudancaInputGeral("tribunal", newValue);
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item xs>
                                {option.nome}
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Escreva ou selecione um tribunal"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {!formData.tribunal &&
                                    formValidation.tribunal === false && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            error={
                              !formData.tribunal &&
                              formValidation.tribunal === false
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-error": {
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "error.main",
                                  },
                                },
                                "&.Mui-disabled": {
                                  ".MuiOutlinedInput-notchedOutline": {
                                    borderColor: !formValidation.tribunal
                                      ? "error.main"
                                      : "action.disabled",
                                  },
                                  color: "text.primary",
                                },
                              },
                            }}
                          />
                        )}
                        disabled={!formData.orgao || !formData.uf} // Desabilita o Autocomplete quando nenhuma área ou UF estiver selecionada
                      />
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Competência</InputLabel>
                    <Tooltip
                      title={
                        !formData.tribunal
                          ? "Por favor, preencha o campo Tribunal primeiro"
                          : ""
                      }
                      placement="bottom"
                      disableHoverListener={!!formData.tribunal}
                    >
                      <Autocomplete
                        noOptionsText="Dados não encontrados"
                        openText="Abrir"
                        closeText="Fechar"
                        options={competencias}
                        getOptionLabel={(option) => option.nome}
                        value={
                          competencias.find(
                            (competencia) =>
                              competencia.id === formData.competencia
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          tratarMudancaInputGeral("competencia", newValue);
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
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
                              formData.competencia
                                ? "Escreva ou selecione uma Competência"
                                : "Escreva ou selecione uma Competência"
                            }
                            error={!formValidation.competencia}
                            helperText={
                              !formValidation.competencia
                                ? "Campo obrigatório"
                                : ""
                            }
                            disabled={!formData.tribunal}
                            // Aplica o estilo condicionalmente
                            sx={{
                              // Corrige a borda para campos em erro, mesmo quando desabilitados
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-error": {
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "error.main", // Mantém a borda vermelha
                                  },
                                },
                                "&.Mui-disabled": {
                                  ".MuiOutlinedInput-notchedOutline": {
                                    borderColor: !formValidation.competencia
                                      ? "error.main"
                                      : "action.disabled", // Aplica borda vermelha se em erro, mesmo desabilitado
                                  },
                                },
                              },
                            }}
                          />
                        )}
                        disabled={!formData.tribunal}
                      />
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Instância *</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={instancias}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        instancias.find(
                          (instancia) => instancia.id === formData.instancia
                        ) || null
                      } // Encontra o objeto correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da instância selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("instancia", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Escreva ou selecione uma instância"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {!formData.instancia &&
                                  formValidation.instancia === false && (
                                    <InputAdornment position="end">
                                      <Tooltip title="Campo obrigatório">
                                        <ErrorIcon color="error" />
                                      </Tooltip>
                                    </InputAdornment>
                                  )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          error={
                            !formData.instancia &&
                            formValidation.instancia === false
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&.Mui-error": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "error.main",
                                },
                              },
                              "&.Mui-disabled": {
                                ".MuiOutlinedInput-notchedOutline": {
                                  borderColor: !formValidation.instancia
                                    ? "error.main"
                                    : "action.disabled",
                                },
                                color: "text.primary",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Ação</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={acoes}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        acoes.find((acao) => acao.id === formData.acao) || null
                      } // Encontra o objeto UF correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da UF selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("acao", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
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
                            formData.acao ? "" : "Escreva ou selecione uma ação"
                          }
                          error={!formValidation.acao}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Valor Causa *</InputLabel>
                    <TextField
                      fullWidth
                      placeholder="00,00"
                      value={valorCausa}
                      onChange={tratarMudancaValorCausa}
                      error={
                        valorCausa === "" && formValidation.valorCausa === false
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">R$</InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {valorCausa === "" &&
                              formValidation.valorCausa === false && (
                                <InputAdornment position="end">
                                  <Tooltip title="Campo obrigatório">
                                    <ErrorIcon color="error" />
                                  </Tooltip>
                                </InputAdornment>
                              )}
                          </>
                        ),
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Magistrado</InputLabel>
                    <TextField
                      fullWidth
                      placeholder="Nome"
                      value={magistrado}
                      onChange={tratarMudancaMagistrado}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Assunto</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={assuntos}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        assuntos.find(
                          (assunto) => assunto.id === formData.assunto
                        ) || null
                      } // Encontra o objeto UF correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da UF selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("assunto", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Escreva ou selecione um assunto"
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Observações</InputLabel>
                    <TextField
                      fullWidth
                      value={observacao}
                      onChange={tratarMudancaObservacao}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          {/* Grid para a Visualização do PDF, se existir */}
          {pdfFile && (
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={3}
                sx={{
                  position: "fixed",
                  top: 60, // ajuste conforme necessário
                  right: 0, // ou use 'left' se preferir que apareça no lado esquerdo
                  height: "calc(100vh - 80px)", // ajuste a altura conforme necessário
                  width: "40%", // ajuste a largura conforme necessário
                  overflow: "auto",
                }}
              >
                <AppBar position="static">
                  <Toolbar>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="view document"
                      onClick={handleViewDocument}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1, cursor: "pointer" }}
                      onClick={handleViewDocument}
                    >
                      Visualizar Documento
                    </Typography>

                    <IconButton
                      color="inherit"
                      aria-label="close"
                      onClick={handleClosePdf}
                      sx={{ position: "absolute", right: 16 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Toolbar>
                </AppBar>
                <iframe
                  title="PDF Preview"
                  src={pdfFile}
                  width="100%"
                  height="87%"
                  style={{ border: "none" }}
                />
              </Paper>
            </Grid>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <Chip
              label="2"
              color="primary"
              sx={{
                borderRadius: "47%",
              }}
            />
            <Box>
              <Typography
                variant="body1"
                component="span"
                sx={{
                  color: "rgba(0, 0, 0, 0.60)", // Cor do texto
                  fontSize: "12px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 300, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Passo 2
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: "rgba(27, 20, 100, 0.80)", // Cor do texto
                  fontSize: "18px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 400, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Dados Complementares
              </Typography>
            </Box>
          </Box>

          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Prioridade</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={prioridades}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        prioridades.find(
                          (prioridade) => prioridade.id === formData.prioridade
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        tratarMudancaInputGeral("prioridade", newValue); // Aqui você passa o objeto newValue diretamente
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={formData.prioridade ? "" : "Selecionar"}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Tag</InputLabel>
                    <Autocomplete
                      multiple
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      disableCloseOnSelect
                      options={tags}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={formData.tag.map(
                        (id) => tags.find((tag) => tag.id === id) || id
                      )}
                      onChange={(event, newValue) => {
                        // Atualize com os IDs das Orgaos selecionadas
                        tratarMudancaInputGeral(
                          "tag",
                          newValue.map((item) => item.id)
                        );
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                            <Grid item>
                              <Switch
                                checked={selected}
                                onChange={(event) => {}}
                              />
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={
                            formData.tag.length > 0 ? "" : "Selecionar"
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Fase</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={fases}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={
                        fases.find((fase) => fase.id === formData.fase) || null
                      } // Encontra o objeto UF correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da UF selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("fase", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={formData.fase ? "" : "Escolha a fase"}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Data do fato gerador</InputLabel>
                    <DateTimePicker
                      value={dataFatorGerador}
                      slotProps={{
                        textField: { placeholder: "00/00/0000 - 00:00", error: erroDataFatorGerador, },
                      }}
                      onChange={(newValue) => {
                        tratarMudancaInputGeral("dataFatorGerador", newValue);
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Tipo de audiência</InputLabel>
                    <Autocomplete
                      noOptionsText="Dados não encontrados"
                      openText="Abrir"
                      closeText="Fechar"
                      options={tipoAudiencias}
                      getOptionLabel={(option) => option.nome} // Exibe o nome
                      value={tipoAudiencias.find(
                        (tipoAudiencia) =>
                          tipoAudiencia.id === formData.tipoAudiencia
                      )} // Encontra o objeto UF correspondente
                      onChange={(event, newValue) => {
                        // Atualize com o ID da UF selecionada ou null se nada for selecionado
                        tratarMudancaInputGeral("tipoAudiencia", newValue);
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Grid container alignItems="center">
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
                            formData.tipoAudiencia ? "" : "Selecionar tipo"
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Audiência</InputLabel>
                    <DateTimePicker
                      value={dataAudiencia}
                      onChange={(newValue) => {
                        tratarMudancaInputGeral("dataAudiencia", newValue);
                      }}
                      slotProps={{
                        textField: { placeholder: "00/00/0000 - 00:00", error: erroDataAudiencia },
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    {/* Campo Possui Tutela */}
                    <InputLabel>Possui tutela?</InputLabel>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch
                        checked={possuiTutela}
                        onChange={tratarMudancaSwitch}
                        color="primary"
                      />
                      <Typography>{possuiTutela ? "Sim" : "Não"}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                {possuiTutela && ( // Adiciona esta linha para renderizar condicionalmente
                  <Grid item xs={12} lg={6}>
                    <Stack spacing={1}>
                      <InputLabel>Foi Deferida?</InputLabel>
                      <Autocomplete
                        noOptionsText="Dados não encontrados"
                        openText="Abrir"
                        closeText="Fechar"
                        options={foiDeferida}
                        getOptionLabel={(option) => option.nome} // Exibe o nome
                        value={
                          foiDeferida.find(
                            (deferida) => deferida.id === formData.deferida
                          ) || null
                        } // Encontra o objeto UF correspondente
                        onChange={(event, newValue) => {
                          // Atualize com o ID da UF selecionada ou null se nada for selecionado
                          tratarMudancaInputGeral("deferida", newValue);
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Grid container alignItems="center">
                              <Grid item xs>
                                {option.nome}
                              </Grid>
                            </Grid>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Selecione uma opção"
                            error={
                              !formData.deferida &&
                              formValidation.deferida === false
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {!formData.deferida &&
                                    formValidation.deferida === false && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Resumo dos fatos</InputLabel>
                    <TextField
                      fullWidth
                      multiline
                      value={resumoFatos}
                      onChange={tratarMudancaResumoFatos} // Adicione esta linha
                      placeholder="Digite aqui..."
                      rows={2} // Ajuste esse valor conforme necessário
                      // Caso precise de um número máximo de linhas, use a propriedade `rowsMax`
                      helperText=" " // Se necessário, adicione um texto de ajuda aqui
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Pedido</InputLabel>
                    <TextField
                      fullWidth
                      multiline
                      value={pedidos}
                      onChange={tratarMudancaPedidos} // Adicione esta linha
                      placeholder="Digite aqui..."
                      rows={4} // Ajuste esse valor conforme necessário
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>

        {/* Drawer cadastro de partes */}
        <CustomDrawer
          isOpen={isDrawerOpen}
          toggleDrawer={toggleDrawer}
          title={drawerTitle}
        />

        <Grid
          item
          xs={12}
          lg={pdfFile ? 7 : 20}
          sx={{ border: "6.6px", borderRadius: "4px", borderColor: "red" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: "20px",
            }}
          >
            <Chip
              label="3"
              color="primary"
              sx={{
                borderRadius: "47%",
              }}
            />
            <Box>
              <Typography
                variant="body1"
                component="span"
                sx={{
                  color: "rgba(0, 0, 0, 0.60)",
                  fontSize: "12px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 300, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Passo 3
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: "rgba(27, 20, 100, 0.80)", // Cor do texto
                  fontSize: "18px", // Tamanho da fonte
                  fontStyle: "normal", // Estilo da fonte
                  fontWeight: 400, // Peso da fonte
                  lineHeight: "normal", // Altura da linha
                }}
              >
                Partes Envolvidas
              </Typography>
            </Box>
          </Box>
          <Grid item xs={12}>
            <MainCard
              sx={{
                backgroundColor: "#1C52970D",
                marginBottom: "40px",
                height: collapsedEmpresa ? "57px" : null,
              }}
            >
              <Box sx={{ margin: 2 }}>
                {/* Container para o título e o ícone com espaçamento adicional abaixo */}

                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ marginBottom: collapsedEmpresa ? "0px" : "20px" }}
                >
                  <Grid item>
                    <Typography
                      variant="h6"
                      gutterBottom
                      component="div"
                      sx={{
                        color: "#1C5297",
                        fontFamily: "Open Sans, Helvetica",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        marginTop: collapsedEmpresa ? "-18px" : "-18px",
                      }}
                    >
                      Empresa/Cliente
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    sx={{ marginTop: collapsedEmpresa ? "-30px" : "-30px" }}
                  >
                    <IconButton onClick={tratarMudancaEsconderEmpresa}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Collapse
                  in={!collapsedEmpresa}
                  timeout={{ enter: 500, exit: 0 }}
                >
                  {empresasClientes.map((empresaCliente) => (
                    <Grid
                      container
                      spacing={3}
                      key={empresaCliente.id}
                      alignItems="center"
                    >
                      <Grid item xs={12} sm={3.5} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="nome"
                          sx={{ marginBottom: "12px" }}
                        >
                          Nome *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !empresaCliente.nome && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          onChange={(event, newValue) => {
                            tratarMudancaEmpresaCliente(
                              empresaCliente.id,
                              "nome",
                              newValue?.id || ""
                            );
                          }}
                          noOptionsText={
                            <Box
                              sx={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography component="span">
                                Parte não encontrada.&nbsp;
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  color: "#1C5297",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleDrawer("Nova Empresa/Cliente")
                                }
                              >
                                Deseja cadastrar?
                              </Typography>
                            </Box>
                          }
                          openText="Abrir"
                          closeText="Fechar"
                          options={partesContext}
                          getOptionLabel={(option) => option.nome}
                          value={partesContext.find(
                            (parteAdversa) =>
                              parteAdversa.id === formData.parteAdversa
                          )}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Nome"
                              // Não é necessário definir error e helperText aqui
                              onChange={(event) => {
                                tratarMudancaEmpresaCliente(
                                  empresaCliente.id,
                                  "nome",
                                  event.target.value
                                );
                              }}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchIcon
                                      sx={{
                                        marginLeft: "3px",
                                        width: "15px",
                                        height: "17px",
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <>
                                    {!empresaCliente.nome && formEnviado && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="qualificacao"
                          sx={{ marginBottom: "12px" }}
                        >
                          Qualificação *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !empresaCliente.qualificacao && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={qualificacoes}
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={qualificacoes.find(
                            (qualificacao) =>
                              qualificacao.id === formData.qualificacao
                          )} // Encontra o objeto UF correspondente
                          onChange={(event, newValue) => {
                            tratarMudancaEmpresaCliente(
                              empresaCliente.id,
                              "qualificacao",
                              newValue?.id || ""
                            ); // Assumindo que o valor desejado é o ID da qualificação
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Qualificação"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {!empresaCliente.qualificacao &&
                                      formEnviado && (
                                        <InputAdornment position="end">
                                          <Tooltip title="Campo obrigatório">
                                            <ErrorIcon color="error" />
                                          </Tooltip>
                                        </InputAdornment>
                                      )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.3} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="polo"
                          sx={{ marginBottom: "12px" }}
                        >
                          Polo *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !empresaCliente.polo && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          onChange={(event, newValue) => {
                            tratarMudancaEmpresaCliente(
                              empresaCliente.id,
                              "polo",
                              newValue?.id || ""
                            );
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={polos}
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={polos.find(
                            (polo) => polo.id === formData.polo
                          )} // Encontra o objeto UF correspondente
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Polo"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {!empresaCliente.polo && formEnviado && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item lg={pdfFile ? 2 : 0}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={empresaPrincipalId === empresaCliente.id}
                              onChange={() => {
                                // Atualizar todos os 'principal' para false, exceto o que está sendo mudado
                                setEmpresasClientes((empresasAnteriores) =>
                                  empresasAnteriores.map((empresa) => ({
                                    ...empresa,
                                    principal:
                                      empresa.id === empresaCliente.id
                                        ? true
                                        : false,
                                  }))
                                );
                                setEmpresaPrincipalId(empresaCliente.id); // Opcional, dependendo de como você gerencia o ID principal no seu estado
                              }}
                            />
                          }
                          label="Principal"
                          sx={{ marginTop: "27px" }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        {empresaCliente.id !== 0 && (
                          <Button
                            onClick={() =>
                              removerEmpresaCliente(empresaCliente.id)
                            }
                            variant="outlined"
                            color="error"
                            sx={{ marginTop: "27px" }}
                            startIcon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={12}></Grid>
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={2}>
                    <Button
                      variant="contained"
                      onClick={adicionarEmpresaCliente}
                      fullWidth
                      sx={{ width: "92px", height: "32px" }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </Collapse>
              </Box>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard
              sx={{
                backgroundColor: "#1C52970D",
                marginBottom: collapsedParteAdversa ? "40px" : null,
                height: collapsedParteAdversa ? "57px" : null,
              }}
            >
              <Box sx={{ margin: 2 }}>
                {/* Container para o título e o ícone com espaçamento adicional abaixo */}
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ marginBottom: "20px" }}
                >
                  <Grid item>
                    <Typography
                      variant="h6"
                      gutterBottom
                      component="div"
                      sx={{
                        color: "#1C5297",
                        fontFamily: "Open Sans, Helvetica",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        marginTop: collapsedParteAdversa ? "-24px" : "-18px",
                      }}
                    >
                      Parte Adversa
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={tratarMudancaEsconderParteAdversa}
                      sx={{
                        marginTop: collapsedParteAdversa ? "-34px" : "-30px",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Collapse in={!collapsedParteAdversa}>
                  {partesAdversasSelect.map((parteAdversa) => (
                    <Grid
                      container
                      spacing={3}
                      alignItems="center"
                      key={parteAdversa.id}
                    >
                      <Grid item xs={12} sm={3.5} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="nome"
                          sx={{ marginBottom: "12px" }}
                        >
                          Nome *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !parteAdversa.nome && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText={
                            <Box
                              sx={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography component="span">
                                Parte não encontrada.&nbsp;
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  color: "#1C5297",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleDrawer("Nova Parte Adversa")
                                }
                              >
                                Deseja cadastrar?
                              </Typography>
                            </Box>
                          }
                          openText="Abrir"
                          closeText="Fechar"
                          options={partesAdversasContext} // Utiliza a variável do contexto
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={partesAdversasContext.find(
                            (parteAdversa) =>
                              parteAdversa.id === formData.parteAdversa
                          )} // Encontra o objeto no contexto
                          onChange={(event, newValue) => {
                            tratarMudancaParteAdversa(
                              parteAdversa.id,
                              "nome",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Nome"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchIcon
                                      sx={{
                                        marginLeft: "3px",
                                        width: "15px",
                                        height: "17px",
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <>
                                    {!parteAdversa.nome && formEnviado && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="qualificacao"
                          sx={{ marginBottom: "12px" }}
                        >
                          Qualificação *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border: "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={qualificacoes}
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={qualificacoes.find(
                            (qualificacao) =>
                              qualificacao.id === formData.qualificacao
                          )} // Encontra o objeto UF correspondente
                          onChange={(event, newValue) => {
                            tratarMudancaParteAdversa(
                              parteAdversa.id,
                              "qualificacao",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Qualificação"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {!parteAdversa.qualificacao &&
                                      formEnviado && (
                                        <InputAdornment position="end">
                                          <Tooltip title="Campo obrigatório">
                                            <ErrorIcon color="error" />
                                          </Tooltip>
                                        </InputAdornment>
                                      )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.3} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="polo"
                          sx={{ marginBottom: "12px" }}
                        >
                          Polo *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border: "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={polos}
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={polos.find(
                            (polo) => polo.id === formData.polo
                          )} // Encontra o objeto UF correspondente
                          onChange={(event, newValue) => {
                            tratarMudancaParteAdversa(
                              parteAdversa.id,
                              "polo",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Polo"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {!parteAdversa.polo && formEnviado && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item lg={pdfFile ? 2 : 0}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={partePrincipalId === parteAdversa.id}
                              onChange={() => {
                                // Atualizar todos os 'principal' para false, exceto o que está sendo mudado
                                setPartesAdversasSelect((partesAnteriores) =>
                                  partesAnteriores.map((parte) => ({
                                    ...parte,
                                    principal:
                                      parte.id === parteAdversa.id
                                        ? true
                                        : false,
                                  }))
                                );
                                setPartePrincipalId(parteAdversa.id); // Opcional, dependendo de como você gerencia o ID principal no seu estado
                              }}
                            />
                          }
                          label="Principal"
                          sx={{ marginTop: "27px" }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        {parteAdversa.id !== 0 && (
                          <Button
                            onClick={() =>
                              removerParteAdversaSelect(parteAdversa.id)
                            }
                            variant="outlined"
                            color="error"
                            sx={{ marginTop: "27px" }}
                            startIcon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={12}></Grid>
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={2}>
                    <Button
                      variant="contained"
                      onClick={adicionarParteAdversaSelect}
                      fullWidth
                      sx={{ width: "92px", height: "32px" }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </Collapse>
              </Box>
            </MainCard>
          </Grid>
          <Grid
            item
            xs={12}
            style={{
              display: collapsedParteAdversa ? "none" : "flex",
              justifyContent: "center",
            }}
          >
            <Divider
              style={{
                width: "100%",
                height: "1.5px",
                backgroundColor: "#00000040",
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            style={{ display: collapsedParteAdversa ? "none" : null }}
          >
            <MainCard
              sx={{ backgroundColor: "#1C52970D", marginBottom: "40px" }}
            >
              <Box sx={{ margin: 2 }}>
                {/* Container para o título e o ícone com espaçamento adicional abaixo */}
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ marginBottom: "20px" }}
                >
                  <Grid item>
                    <Typography
                      variant="h6"
                      gutterBottom
                      component="div"
                      sx={{
                        color: "#32465D",
                        fontFamily: "Open Sans, Helvetica",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "normal",
                      }}
                    >
                      Advogado Adverso
                    </Typography>
                  </Grid>
                </Grid>

                <Collapse in={!collapsedAdvogadoAdverso}>
                  {advogadoAdversoSelect.map((advogadoAdverso) => (
                    <Grid
                      container
                      spacing={3}
                      key={advogadoAdverso.id}
                      alignItems="center"
                    >
                      <Grid
                        item
                        xs={12}
                        sm={3.5}
                        lg={pdfFile ? 6 : 0}
                        sx={{ paddingTop: "23px !important" }}
                      >
                        <InputLabel
                          htmlFor="nome"
                          sx={{ marginBottom: "13px" }}
                        >
                          Nome
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border: "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText={
                            <Box
                              sx={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography component="span">
                                Parte não encontrada.&nbsp;
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  color: "#1C5297",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleDrawer("Novo Advogado Adverso")
                                }
                              >
                                Deseja cadastrar?
                              </Typography>
                            </Box>
                          }
                          openText="Abrir"
                          closeText="Fechar"
                          options={partesContext} // Utiliza a variável do contexto
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={partesContext.find(
                            (parteAdversa) =>
                              parteAdversa.id === formData.parteAdversa
                          )} // Encontra o objeto no contexto
                          onChange={(event, newValue) => {
                            tratarMudancaAdvogado(
                              advogadoAdverso.id,
                              "nome",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
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
                                formEnviado &&
                                isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                                !advogadoAdverso.nome
                              }
                              placeholder="Nome"
                              // Adiciona o estilo da borda vermelha condicionalmente
                              style={
                                formEnviado &&
                                isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                                !advogadoAdverso.nome
                                  ? {
                                      borderRadius: "4px",
                                      border: "1px solid red",
                                      background: "#FFF",
                                    }
                                  : {}
                              }
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {formEnviado &&
                                      isAnyAdvogadoFieldFilled(
                                        advogadoAdverso
                                      ) &&
                                      !advogadoAdverso.nome && (
                                        <InputAdornment position="end">
                                          <Tooltip title="Campo obrigatório">
                                            <ErrorIcon color="error" />
                                          </Tooltip>
                                        </InputAdornment>
                                      )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={6}
                        sm={2}
                        lg={pdfFile ? 6 : 0}
                        sx={{ paddingTop: "23px !important" }}
                      >
                        <InputLabel
                          htmlFor="qualificacao"
                          sx={{ marginBottom: "13px" }}
                        >
                          OAB
                        </InputLabel>
                        <TextField
                          fullWidth
                          placeholder="OAB"
                          error={
                            formEnviado &&
                            isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                            !advogadoAdverso.oab
                          }
                          onChange={(event) =>
                            tratarMudancaAdvogado(
                              advogadoAdverso.id,
                              "oab",
                              event.target.value
                            )
                          }
                          // Mantém o background branco e altera apenas a cor da borda se estiver em estado de erro
                          style={{
                            borderRadius: "4px",
                            border:
                              formEnviado &&
                              isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                              !advogadoAdverso.oab
                                ? "1px solid red"
                                : "1px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          InputProps={{
                            endAdornment: (
                              <>
                                {formEnviado &&
                                  isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                                  !advogadoAdverso.oab && (
                                    <InputAdornment position="end">
                                      <Tooltip title="Campo obrigatório">
                                        <ErrorIcon color="error" />
                                      </Tooltip>
                                    </InputAdornment>
                                  )}
                              </>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        sm={2.3}
                        lg={pdfFile ? 6 : 0}
                        sx={{ paddingTop: "23px !important" }}
                      >
                        <InputLabel
                          htmlFor="polo"
                          sx={{ marginBottom: "13px" }}
                        >
                          Parte Adversa
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border: "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={partesAdversasContext} // Utiliza a variável do contexto
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={partesAdversasContext.find(
                            (parteAdversa) =>
                              parteAdversa.id === formData.parteAdversa
                          )} // Encontra o objeto no contexto
                          onChange={(event, newValue) => {
                            tratarMudancaAdvogado(
                              advogadoAdverso.id,
                              "qualificacao",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              placeholder="Selecionar parte"
                              {...params}
                              error={
                                formEnviado &&
                                isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                                !advogadoAdverso.qualificacao
                              }
                              // Adiciona o estilo da borda vermelha condicionalmente
                              style={
                                formEnviado &&
                                isAnyAdvogadoFieldFilled(advogadoAdverso) &&
                                !advogadoAdverso.qualificacao
                                  ? {
                                      borderRadius: "4px",
                                      border: "1px solid red",
                                      background: "#FFF",
                                    }
                                  : {}
                              }
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {formEnviado &&
                                      isAnyAdvogadoFieldFilled(
                                        advogadoAdverso
                                      ) &&
                                      !advogadoAdverso.qualificacao && (
                                        <InputAdornment position="end">
                                          <Tooltip title="Campo obrigatório">
                                            <ErrorIcon color="error" />
                                          </Tooltip>
                                        </InputAdornment>
                                      )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item lg={pdfFile ? 2 : 0}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={
                                advogadoPrincipalId === advogadoAdverso.id
                              }
                              onChange={() => {
                                // Atualizar todos os 'principal' para false, exceto o que está sendo mudado
                                setAdvogadoAdversoSelect(
                                  (advogadosAnteriores) =>
                                    advogadosAnteriores.map((advogado) => ({
                                      ...advogado,
                                      principal:
                                        advogado.id === advogadoAdverso.id
                                          ? true
                                          : false,
                                    }))
                                );
                                setAdvogadoPrincipalId(advogadoAdverso.id); // Opcional, dependendo de como você gerencia o ID principal no seu estado
                              }}
                            />
                          }
                          label="Principal"
                          sx={{ marginTop: "27px" }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        {advogadoAdverso.id !== 0 && (
                          <Button
                            onClick={() =>
                              removerAdvogadoAdverso(advogadoAdverso.id)
                            }
                            variant="outlined"
                            color="error"
                            sx={{ marginTop: "27px" }}
                            startIcon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={12}></Grid>
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={2}>
                    <Button
                      variant="contained"
                      onClick={adicionarAdvogadoAdverso}
                      fullWidth
                      sx={{ width: "92px", height: "32px" }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </Collapse>
              </Box>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard
              sx={{
                backgroundColor: "#1C52970D",
                height: collapsedResponsavel ? "57px" : null,
              }}
            >
              <Box sx={{ margin: 2 }}>
                {/* Container para o título e o ícone com espaçamento adicional abaixo */}
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ marginBottom: "20px" }}
                >
                  <Grid item>
                    <Typography
                      variant="h6"
                      gutterBottom
                      component="div"
                      sx={{
                        color: "#1C5297",
                        fontFamily: "Open Sans, Helvetica",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        display: "flex", // Definido como flex para incluir elementos inline
                        alignItems: "center", // Centraliza os itens verticalmente
                        marginTop: collapsedResponsavel ? "-24px" : "-18px",
                      }}
                    >
                      Responsáveis *
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={tratarMudancaEsconderResponsavel}
                      sx={{
                        marginTop: collapsedResponsavel ? "-34px" : "-30px",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Collapse in={!collapsedResponsavel}>
                  {responsavelSelect.map((responsaveis) => (
                    <Grid
                      container
                      spacing={3}
                      key={responsaveis.id}
                      alignItems="center"
                    >
                      <Grid item xs={12} sm={3.5} lg={pdfFile ? 6 : 0}>
                        <InputLabel
                          htmlFor="nome"
                          sx={{ marginBottom: "12px" }}
                        >
                          Nome *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !responsaveis.nome && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText={
                            <Box
                              sx={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography component="span">
                                Parte não encontrada.&nbsp;
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  color: "#1C5297",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleDrawer("Novo Responsável")}
                              >
                                Deseja cadastrar?
                              </Typography>
                            </Box>
                          }
                          openText="Abrir"
                          closeText="Fechar"
                          options={responsaveisContext} // Utiliza a variável do contexto
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={responsaveisContext.find(
                            (parteAdversa) =>
                              parteAdversa.id === formData.parteAdversa
                          )} // Encontra o objeto no contexto
                          onChange={(event, newValue) => {
                            tratarMudancaResponsavel(
                              responsaveis.id,
                              "nome",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Nome"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchIcon
                                      sx={{
                                        marginLeft: "3px",
                                        width: "15px",
                                        height: "17px",
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <>
                                    {!responsaveis.nome && formEnviado && (
                                      <InputAdornment position="end">
                                        <Tooltip title="Campo obrigatório">
                                          <ErrorIcon color="error" />
                                        </Tooltip>
                                      </InputAdornment>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2} lg={pdfFile ? 7 : 0}>
                        <InputLabel
                          htmlFor="qualificacao"
                          sx={{ marginBottom: "12px" }}
                        >
                          Qualificação *
                        </InputLabel>
                        <Autocomplete
                          style={{
                            borderRadius: "4px",
                            border:
                              !responsaveis.nome && formEnviado
                                ? "0.7px solid red"
                                : "0.7px solid rgba(0, 0, 0, 0.30)",
                            background: "#FFF",
                          }}
                          noOptionsText="Dados não encontrados"
                          openText="Abrir"
                          closeText="Fechar"
                          options={qualificacoes}
                          getOptionLabel={(option) => option.nome} // Exibe o nome
                          value={qualificacoes.find(
                            (qualificacao) =>
                              qualificacao.id === formData.qualificacao
                          )} // Encontra o objeto UF correspondente
                          onChange={(event, newValue) => {
                            tratarMudancaResponsavel(
                              responsaveis.id,
                              "qualificacao",
                              newValue?.id || ""
                            );
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Grid container alignItems="center">
                                <Grid item xs>
                                  {option.nome}
                                </Grid>
                              </Grid>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Qualificação"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {!responsaveis.qualificacao &&
                                      formEnviado && (
                                        <InputAdornment position="end">
                                          <Tooltip title="Campo obrigatório">
                                            <ErrorIcon color="error" />
                                          </Tooltip>
                                        </InputAdornment>
                                      )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item lg={pdfFile ? 2 : 0}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={
                                responsavelPrincipalId === responsaveis.id
                              }
                              onChange={() => {
                                // Atualizar todos os 'principal' para false, exceto o que está sendo mudado
                                setResponsavelSelect((responsaveisAnteriores) =>
                                  responsaveisAnteriores.map((responsavel) => ({
                                    ...responsavel,
                                    principal:
                                      responsavel.id === responsaveis.id
                                        ? true
                                        : false,
                                  }))
                                );
                                setResponsavelPrincipalId(responsaveis.id); // Opcional, dependendo de como você gerencia o ID principal no seu estado
                              }}
                            />
                          }
                          label="Principal"
                          sx={{ marginTop: "27px" }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2} lg={pdfFile ? 6 : 0}>
                        {responsaveis.id !== 0 && (
                          <Button
                            onClick={() => removerResponsavel(responsaveis.id)}
                            variant="outlined"
                            color="error"
                            sx={{ marginTop: "27px" }}
                            startIcon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={12}></Grid>
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={2}>
                    <Button
                      variant="contained"
                      onClick={adicionarNovoResponsavel}
                      fullWidth
                      sx={{ width: "92px", height: "32px" }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </Collapse>
              </Box>
            </MainCard>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginRight: "20px",
            }}
          >
            <Button
              variant="outlined"
              style={{
                width: "91px",
                height: "32px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: 600,
                color: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={handleOpenModal}
            >
              Cancelar
            </Button>
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
              Salvar
            </Button>
          </Box>
        </Grid>
      </LocalizationProvider>
      <Dialog
        open={showChangesNotSavedModal}
        onClose={() => setShowChangesNotSavedModal(false)}
        sx={{
          "& .MuiPaper-root": {
            // Este seletor atinge o Paper component que Dialog usa internamente para seu layout
            width: "547px",
            height: "240px",
            maxWidth: "none", // Isso garante que o Dialog não tente se ajustar além do width especificado
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#FAAD14CC",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between", // Ajustado para distribuir o espaço entre os elementos
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            {/* Agrupa o ícone de lixeira e o texto */}
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Alerta
            </Typography>
          </div>
          {/* Botão para fechar o modal */}
          <IconButton
            aria-label="close"
            onClick={cancelRemoveUser} // Supondo que cancelRemoveUser seja a função para fechar o modal
            sx={{
              color: "rgba(255, 255, 255, 1)", // Define a cor do ícone de fechamento
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Tem certeza que deseja sair sem salvar as alterações?
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
            Ao realizar essa ação, todas as alterações serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              voltarParaResumoProcesso();
            }}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#FBBD43",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, tenho certeza
          </Button>

          <Button
            onClick={() => {
              // Ação para "Cancelar" (manter o modal de edição aberto)
              setShowChangesNotSavedModal(false);
            }}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={cnjExists}
        onClose={() => setCnjExists(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "240px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#FAAD14CC",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="alert"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Alerta
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={() => setCnjExists(false)}
            sx={{
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            O número de processo informado já existe.
          </Typography>
          <Typography component="div" style={{ marginTop: "20px" }}>
          Você ainda pode prosseguir com o cadastro, mas recomendamos verificar o número informado.
          
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCnjExists(false)}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              background: "#FBBD43",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff"
            }}
          >
            Ciente
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default ColumnsLayouts;
