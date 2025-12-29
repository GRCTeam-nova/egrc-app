/* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  Typography,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import InputMask from "react-input-mask";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function NovoColaborador() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  
  // Estados para dados de seleção
  // const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);
  const [certificacoes, setCertificacoes] = useState([]);
  const [especializacoes, setEspecializacoes] = useState([]);
  const [perfis, setPerfis] = useState([]); // [NOVO] Estado para perfis
  
  // Estados principais
  const [nomeColaborador, setNomeColaborador] = useState("");
  const [codigoColaborador, setCodigoColaborador] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [emailColaborador, setEmailColaborador] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [colaboradorDados, setColaboradorDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para validação
  const [cpfError, setCpfError] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    tipoDocumento: "",
    cargo: "",
    empresa: "",
    departamento: "",
    idioma: "",
    grupos: [],
    validadeAcesso: null,
    funcao: "",
    graduacao: "",
    certificacoes: [],
    especializacoes: [],
    files: [],
    perfil: "", // [NOVO] Campo no formData
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchColaboradorDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/collaborators/${dadosApi.idCollaborator}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados do colaborador");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNomeColaborador(data.name);
          setCodigoColaborador(data.code || "");
          setNumeroDocumento(data.document);
          setEmailColaborador(data.email);
          setAtivo(data.active);
          localStorage.setItem("idCollaborator", dadosApi.idCollaborator);

          setFormData((prev) => ({
            ...prev,
            tipoDocumento: data.idDocumentType || "",
            cargo: data.idPosition || "",
            empresa: data.idCompany || "",
            departamento: data.idDepartment || "",
            idioma: data.idLanguage || "",
            grupos: data.idGroups || [],
            validadeAcesso: data.accessExpiry ? new Date(data.accessExpiry) : null,
            funcao: data.idFunction || "",
            graduacao: data.idEducation || "",
            certificacoes: data.idCertifications || [],
            especializacoes: data.idSpecializations || [],
            files: data.files || [],
            perfil: data.idRole || "", // [NOVO] Popula o perfil na edição
          }));

          setColaboradorDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idCollaborator) {
        fetchColaboradorDados();
      }
    }
  }, [dadosApi, token]);

  useEffect(() => {
    // Buscar dados para os campos de seleção
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/positions`,
      setCargos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/companies`,
      setEmpresas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/departments`,
      setDepartamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/languages`,
      setIdiomas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/groups`,
      setGrupos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/functions`,
      setFuncoes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/graduations`,
      setGraduacoes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/certifications`,
      setCertificacoes
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/specializations`,
      setEspecializacoes
    );
    // [NOVO] Busca de Perfis
    fetchData(
        `https://api.egrc.homologacao.com.br/api/v1/access`,
        setPerfis
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

      // Transformando os dados para padronizar o formato
      const transformedData = response.data.map((item) => ({
        id:
          item.idDocumentType ||
          item.idPosition ||
          item.idCompany ||
          item.idDepartment ||
          item.idLanguage ||
          item.idGroup ||
          item.idFunction ||
          item.idEducation ||
          item.idGraduation ||
          item.idCertification ||
          item.idSpecialization ||
          item.idRole || // [NOVO] Mapeamento do idRole para id
          item.id,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  // Função para validar o CPF
  const validarCpf = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

    if (cpf.length !== 11) return false;

    // Elimina CPFs inválidos conhecidos
    if (
      cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999"
    ) {
      return false;
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  // Função para validar email
  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCpfChange = (event) => {
    const value = event.target.value;
    setNumeroDocumento(value);

    // Valida o CPF somente quando o comprimento está completo
    if (value.length === 14) {
      setCpfError(!validarCpf(value));
    } else {
      setCpfError(false);
    }
  };

  const handleCpfBlur = () => {
    setCpfTouched(true);

    // Revalida no blur se o campo estiver completo
    if (numeroDocumento.length === 14) {
      setCpfError(!validarCpf(numeroDocumento));
    }
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmailColaborador(value);

    if (value.trim()) {
      setEmailError(!validarEmail(value));
    } else {
      setEmailError(false);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);

    if (emailColaborador.trim()) {
      setEmailError(!validarEmail(emailColaborador));
    }
  };

  const tratarMudancaInputGeral = (field, value) => {
    // [NOVO] Adicionado "perfil" na lista de validação
    if (["tipoDocumento", "cargo", "empresa", "departamento", "idioma", "funcao", "graduacao", "perfil"].includes(field)) {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : "" });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAllGrupos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.grupos.length === grupos.length) {
        // Deselect all
        setFormData({ ...formData, grupos: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          grupos: grupos.map((grupo) => grupo.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "grupos",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllCertificacoes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.certificacoes.length === certificacoes.length) {
        // Deselect all
        setFormData({ ...formData, certificacoes: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          certificacoes: certificacoes.map((cert) => cert.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "certificacoes",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllEspecializacoes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.especializacoes.length === especializacoes.length) {
        // Deselect all
        setFormData({ ...formData, especializacoes: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          especializacoes: especializacoes.map((esp) => esp.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "especializacoes",
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const [formValidation, setFormValidation] = useState({
    nomeColaborador: true,
    tipoDocumento: true,
    numeroDocumento: true,
    cargo: true,
    emailColaborador: true,
    empresa: true,
    departamento: true,
    idioma: true,
    grupos: true,
    validadeAcesso: true,
    perfil: true, // [NOVO] Validação do perfil
  });

  const allSelectedGrupos =
    formData.grupos.length === grupos.length && grupos.length > 0;
  const allSelectedCertificacoes =
    formData.certificacoes.length === certificacoes.length && certificacoes.length > 0;
  const allSelectedEspecializacoes =
    formData.especializacoes.length === especializacoes.length && especializacoes.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nomeColaborador.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeColaborador: false }));
      missingFields.push("Nome do colaborador");
    }
    // if (!formData.tipoDocumento) {
    //   setFormValidation((prev) => ({ ...prev, tipoDocumento: false }));
    //   missingFields.push("Tipo de documento");
    // }
    if (!numeroDocumento.trim() || cpfError) {
      setCpfError(true);
      setCpfTouched(true);
      missingFields.push("Número do documento");
    }
    if (!emailColaborador.trim() || emailError) {
      setEmailError(true);
      setEmailTouched(true);
      missingFields.push("Email");
    }
    // [NOVO] Validação do Perfil
    if (!formData.perfil) {
        setFormValidation((prev) => ({ ...prev, perfil: false }));
        missingFields.push("Perfil do Colaborador");
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(", ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`Os campos ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    if (requisicao === "Editar" && formData.validadeAcesso) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const validadeAcesso = new Date(formData.validadeAcesso);
        validadeAcesso.setHours(0, 0, 0, 0);

        if (validadeAcesso <= hoje) {
        enqueueSnackbar("A data de validade de acesso deve ser uma data futura!", {
            variant: "error",
        });
        return;
        }
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
        formDataUpload.append("ContainerFolder", 2); // 2 para colaborador
        // Em edição, já temos o id do colaborador; em criação, envia string vazia
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? colaboradorDados?.idCollaborator : ""
        );
        newFiles.forEach((file) => {
          formDataUpload.append("Files", file, file.name);
        });

        const uploadResponse = await axios.post(
          "https://api.egrc.homologacao.com.br/api/v1/files/uploads",
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

      // Combina os arquivos já existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];

      // Transforma cada item para que o payload contenha somente a URL (string)
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // Configuração da URL, método e payload conforme a operação
      if (requisicao === "Criar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/collaborators";
        method = "POST";
        payload = {
          name: nomeColaborador,
          code: codigoColaborador || null,
          document: numeroDocumento,
          email: emailColaborador,
          idRole: formData.perfil, // [NOVO] Envio do idRole
          isUser: true
        };
      } else if (requisicao === "Editar") {
        url = "https://api.egrc.homologacao.com.br/api/v1/collaborators";
        method = "PUT";
        payload = {
          idCollaborator: colaboradorDados?.idCollaborator,
          name: nomeColaborador,
          code: codigoColaborador || null,
          document: numeroDocumento,
          email: emailColaborador,
          idRole: formData.perfil, // [NOVO] Envio do idRole
          active: ativo,
          idDocumentType: formData.tipoDocumento,
          idPosition: formData.cargo,
          idCompany: formData.empresa,
          idDepartment: formData.departamento,
          idLanguage: formData.idioma,
          idGroups: formData.grupos,
          accessExpiry: formData.validadeAcesso
            ? formData.validadeAcesso.toISOString()
            : null,
          idFunction: formData.funcao || null,
          idEducation: formData.graduacao || null,
          idCertifications: formData.certificacoes,
          idSpecializations: formData.especializacoes,
          files: finalFilesPayload,
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
        throw new Error(errorData.message || "Erro ao cadastrar o colaborador.");
      }

      // Determina o id do colaborador a partir da resposta
      let collaboratorId;
      if (requisicao === "Editar" && response.status === 204) {
        collaboratorId = colaboradorDados?.idCollaborator;
        enqueueSnackbar(`Colaborador ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      } else {
        const data = await response.json();
        collaboratorId = data.data.idCollaborator;
        localStorage.setItem("idCollaborator", collaboratorId);
        enqueueSnackbar(`Colaborador ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      // Se for criação, atualiza o estado e exibe o diálogo de sucesso;
      // Se for edição, volta para a listagem.
      if (requisicao === "Criar") {
        setColaboradorDados((prev) => ({ ...prev, idCollaborator: collaboratorId }));
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao processar a solicitação. Verifique os dados informados.", {
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
          {/* Nome e Código lado a lado */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome do Colaborador *</InputLabel>
              <TextField
                onChange={(event) => setNomeColaborador(event.target.value)}
                fullWidth
                placeholder="Digite o nome do colaborador"
                value={nomeColaborador}
                error={!nomeColaborador && formValidation.nomeColaborador === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Código do Colaborador *</InputLabel>
              <TextField
                onChange={(event) => setCodigoColaborador(event.target.value)}
                fullWidth
                placeholder="Digite o código interno"
                value={codigoColaborador}
                type="number"
              />
            </Stack>
          </Grid>

          {/* Tipo de Documento e Número do Documento */}
          {/* <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tipo de Documento *</InputLabel>
              <Autocomplete
                options={tiposDocumento}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposDocumento.find(
                    (tipo) => tipo.id === formData.tipoDocumento
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("tipoDocumento", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoDocumento &&
                      formValidation.tipoDocumento === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid> */}

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Número do Documento *</InputLabel>
              <TextField
                fullWidth
                value={numeroDocumento}
                onChange={handleCpfChange}
                onBlur={handleCpfBlur}
                error={cpfTouched && cpfError}
                helperText={
                  cpfTouched && cpfError && numeroDocumento.length === 14
                    ? "CPF inválido"
                    : ""
                }
                InputProps={{
                  inputComponent: InputMask,
                  inputProps: {
                    mask: "999.999.999-99",
                    maskPlaceholder: null,
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Email *</InputLabel>
              <TextField
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                fullWidth
                placeholder="Digite o email do colaborador"
                value={emailColaborador}
                error={emailTouched && emailError}
                helperText={
                  emailTouched && emailError
                    ? "Email inválido"
                    : ""
                }
                type="email"
              />
            </Stack>
          </Grid>

          {/* [NOVO] Campo Perfil do Colaborador */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Perfil do Colaborador *</InputLabel>
              <Autocomplete
                options={perfis}
                getOptionLabel={(option) => option.nome}
                value={
                  perfis.find(
                    (perfil) => perfil.id === formData.perfil
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("perfil", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o perfil"
                    error={
                      !formData.perfil &&
                      formValidation.perfil === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>

            <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Cargo *</InputLabel>
              <Autocomplete
                options={cargos}
                getOptionLabel={(option) => option.nome}
                value={
                  cargos.find(
                    (cargo) => cargo.id === formData.cargo
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("cargo", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.cargo &&
                      formValidation.cargo === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Empresa e Departamento */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Empresa *</InputLabel>
              <Autocomplete
                options={empresas}
                getOptionLabel={(option) => option.nome}
                value={
                  empresas.find(
                    (empresa) => empresa.id === formData.empresa
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("empresa", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.empresa &&
                      formValidation.empresa === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Departamento *</InputLabel>
              <Autocomplete
                options={departamentos}
                getOptionLabel={(option) => option.nome}
                value={
                  departamentos.find(
                    (dept) => dept.id === formData.departamento
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("departamento", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.departamento &&
                      formValidation.departamento === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Idioma e Grupos */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Idioma *</InputLabel>
              <Autocomplete
                options={idiomas}
                getOptionLabel={(option) => option.nome}
                value={
                  idiomas.find(
                    (idioma) => idioma.id === formData.idioma
                  ) || null
                }
                onChange={(event, newValue) => {
                  tratarMudancaInputGeral("idioma", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.idioma &&
                      formValidation.idioma === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Grupos *</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...grupos,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.grupos.map(
                  (id) =>
                    grupos.find((grupo) => grupo.id === id) || id
                )}
                onChange={handleSelectAllGrupos}
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
                              ? allSelectedGrupos
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
                      formData.grupos.length === 0 &&
                      formValidation.grupos === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Validade de Acesso e Status */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Validade de Acesso *</InputLabel>
              <DatePicker
                value={formData.validadeAcesso || null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    validadeAcesso: newValue,
                  }));
                }}
                slotProps={{
                  textField: {
                    placeholder: "00/00/0000",
                    error: !formData.validadeAcesso && formValidation.validadeAcesso === false,
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Status</InputLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={ativo}
                  onChange={(event) => setAtivo(event.target.value === "true")}
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio />}
                    label="Ativo"
                  />
                  <FormControlLabel
                    value={false}
                    control={<Radio />}
                    label="Inativo"
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
          </Grid>

          {/* Seção de Detalhamento */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Detalhamento</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Função */}
                  <Grid item xs={6} sx={{ paddingBottom: 3 }}>
                    <Stack spacing={1}>
                      <InputLabel>Função</InputLabel>
                      <Autocomplete
                        options={funcoes}
                        getOptionLabel={(option) => option.nome}
                        value={
                          funcoes.find(
                            (funcao) => funcao.id === formData.funcao
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          tratarMudancaInputGeral("funcao", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Graduação */}
                  <Grid item xs={6} sx={{ paddingBottom: 3 }}>
                    <Stack spacing={1}>
                      <InputLabel>Graduação</InputLabel>
                      <Autocomplete
                        options={graduacoes}
                        getOptionLabel={(option) => option.nome}
                        value={
                          graduacoes.find(
                            (grad) => grad.id === formData.graduacao
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          tratarMudancaInputGeral("graduacao", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Certificações */}
                  <Grid item xs={6} sx={{ paddingBottom: 3 }}>
                    <Stack spacing={1}>
                      <InputLabel>Certificações</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[
                          { id: "all", nome: "Selecionar todos" },
                          ...certificacoes,
                        ]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.certificacoes.map(
                          (id) =>
                            certificacoes.find((cert) => cert.id === id) || id
                        )}
                        onChange={handleSelectAllCertificacoes}
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
                                      ? allSelectedCertificacoes
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

                  {/* Especializações */}
                  <Grid item xs={6} sx={{ paddingBottom: 3 }}>
                    <Stack spacing={1}>
                      <InputLabel>Especializações</InputLabel>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={[
                          { id: "all", nome: "Selecionar todos" },
                          ...especializacoes,
                        ]}
                        getOptionLabel={(option) => option.nome}
                        value={formData.especializacoes.map(
                          (id) =>
                            especializacoes.find((esp) => esp.id === id) || id
                        )}
                        onChange={handleSelectAllEspecializacoes}
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
                                      ? allSelectedEspecializacoes
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
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          </>
          )}

          {/* Botões de Ação */}
          <Grid item xs={12} sx={{ paddingTop: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={tratarSubmit}
                disabled={loading}
              >
                {requisicao === "Criar" ? "Cadastrar" : "Salvar"}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Dialog de Sucesso */}
        <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
          <DialogTitle>
            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
            Colaborador cadastrado com sucesso!
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              O colaborador foi cadastrado com sucesso. Deseja continuar editando ou voltar para a listagem?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={voltarParaListagem} color="primary">
              Voltar para listagem
            </Button>
            <Button onClick={continuarEdicao} color="primary" variant="contained">
              Continuar editando
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default NovoColaborador;