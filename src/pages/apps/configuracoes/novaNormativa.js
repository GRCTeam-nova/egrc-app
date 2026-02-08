/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Switch,
  Typography,
  Autocomplete,
  Grid,
  Stack,
  Checkbox,
  InputLabel,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import DrawerEmpresa from "./novaEmpresaDrawerNormativos";
import DrawerDepartamento from "./novoDepartamentoDrawerNormativas";
import DrawerProcesso from "./novoProcessoDrawerNormativa";
import FileUploader from "./FileUploader";
import DrawerPlanos from "./novoPlanoDrawerNormativa";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListagemTrecho from "./listaTrecho";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const idNormativoAtual = dadosApi?.idNormative;
  const [normaDestinos, setNormaDestino] = useState([]);
  const [empresas, setEmpresa] = useState([]);
  const [reload, setReload] = useState(false);
  const [normaOrigens, setNormaOrigem] = useState([]);
  const [hasStartedByTester, setHasStartedByTester] = useState(false);
  const [planosAcoes, setPlanoAcao] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  // ... seus outros estados
const [descricao, setDescricao] = useState(""); // Mantém o histórico vindo do banco
const [novoComentario, setNovoComentario] = useState(""); // Novo estado para o input atual
// ...
  const [conclusaoRevisao, setConclusaoRevisao] = useState("");
  const idUser = localStorage.getItem("id_user");
  const userName = localStorage.getItem("username");
  const [motivoRevogacao, setMotivoRevogacao] = useState("");
  const [diasDaRevisao, setDiasDaRevisao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [aprovadores, setAprovador] = useState([]);
  // logo após seus useState existentes:
  const [tempRevDate, setTempRevDate] = useState(null);
  const [confirmRevogOpen, setConfirmRevogOpen] = useState(false);
  const [showJustificativaField, setShowJustificativaField] = useState(false);

  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [normativaDados, setNormativaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [statusNormas] = useState([
    { id: 1, nome: "Elaboração" },
    { id: 3, nome: "Versão Final" },
    { id: 4, nome: "Em Revisão" },
    { id: 6, nome: "Revogado" },
  ]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [ambientes] = useState([
    { id: 1, nome: "Interno" },
    { id: 2, nome: "Externo" },
  ]);
  const [reguladores, setReguladores] = useState([]);
  const [tipoNormas, setTipoNormas] = useState([]);
  const [riscoNormas] = useState([
    { id: 1, nome: "Alto" },
    { id: 2, nome: "Médio" },
    { id: 3, nome: "Baixo" },
    { id: 4, nome: "Não aplicado" },
  ]);
  const [statusRevisao] = useState([
    { id: 1, nome: "Revisada" },
    { id: 2, nome: "Próxima da revisão" },
    { id: 3, nome: "Em atraso" },
  ]);
  const [periodicidadeRevisoes] = useState([
    { id: 1, nome: "Semestral" },
    { id: 2, nome: "Anual" },
    { id: 3, nome: "Bienal" },
  ]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [confirmRevisorOpen, setConfirmRevisorOpen] = useState(false);
const [tempResponsavelId, setTempResponsavelId] = useState(null);

  const [formData, setFormData] = useState({
    statusNorma: "",
    tipoNorma: "",
    riscoNorma: "",
    statuRevisao: "",
    periodicidadeRevisao: "",
    empresaInferior: [],
    normaDestino: [],
    empresa: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    planoAcao: [],
    files: [],
    departamento: [],
    regulador: "",
    processo: [],
    normaOrigem: [],
    conta: [],
    responsavel: "",
    revisor: "",
    aprovador: [],
    dataPublicacao: null,
    dataCadastro: new Date(),
    vigenciaInicial: null,
    ultimaRevisao: null,
    dataLimiteRevisao: null,
    dataRevogacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idRisk, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idRisk ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idRisk ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idActionPlan ||
          item.idCompany ||
          item.idDepartment ||
          item.idCollaborator ||
          item.idNormativeType ||
          item.idKri ||
          item.idRegulatory ||
          item.idControl ||
          item.idThreat,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/departments`,
      setDepartamentos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives/types`,
      setTipoNormas
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives/regulatories`,
      setReguladores
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives`,
      setNormaOrigem
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/normatives`,
      setNormaDestino
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/companies`,
      setEmpresa
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/action-plans`,
      setPlanoAcao
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setResponsavel
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/collaborators/responsibles`,
      setAprovador
    );
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/normatives/${dadosApi.idNormative}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados da normativa");
          }

          const data = await response.json();
          setReload(false);

          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setNormativaDados(data);

          // Atualiza os campos simples
          setNome(data.name);
          setCodigo(data.code);
          setDescricao(data.description);
          // Observe que o endpoint retorna "conclusion" e não "treatmentDescription"
          setConclusaoRevisao(data.conclusion);
          setDiasDaRevisao(data.daysRevision);
          setMotivoRevogacao(data.revocationReason);
          setAtivo(data.active);

          const risco = data.normativeRisk;
          let periodicidade = null;
          if (risco === 1 || risco === 2 || risco === 3) {
            periodicidade = risco;
          }

          // Atualiza os campos de data e outros campos do formData
          setFormData((prev) => ({
            ...prev,
            dataCadastro: data.registerDate
              ? new Date(data.registerDate)
              : prev.dataCadastro,
            dataPublicacao: data.publishDate
              ? new Date(data.publishDate)
              : null,
            vigenciaInicial: data.initialVigency
              ? new Date(data.initialVigency)
              : null,
            ultimaRevisao: data.lastRevision
              ? new Date(data.lastRevision)
              : null,
            dataLimiteRevisao: data.limitDateRevision
              ? new Date(data.limitDateRevision)
              : null,
            dataRevogacao: data.revocationDate
              ? new Date(data.revocationDate)
              : null,
            periodicidadeRevisao: periodicidade,
            statusNorma: data.normativeStatus ?? 1,
            riscoNorma: risco,
            tipoNorma: data.idNormativeType,
            regulador: data.idRegulatory,
            responsavel: data.idResponsible,
            revisor: data.idReviewer,
            normaOrigem: data.idOrigins,
            normaDestino: data.idDestinies,
            planoAcao: data.idActionPlans,
            aprovador: data.idApprovers,
            empresa: data.idCompanies,
            departamento: data.idDepartments,
            processo: data.idProcess,
            files: data.files || [],
          }));
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idNormative) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, token, reload]);

// Função para gerar a string final do comentário
   const getDescricaoAtualizada = () => {
    // Se não escreveu nada novo, retorna a descrição original
    if (!novoComentario || !novoComentario.trim()) {
      return descricao;
    }

    const dataHora = new Date().toLocaleString("pt-BR");
    // Formato: [Usuario]: Comentario - dd/mm/aaaa hh:mm:ss
    const entradaLog = `[${userName}]: ${novoComentario} - ${dataHora}`;

    // Se já existia descrição, pula duas linhas e adiciona a nova. Se não, é a primeira.
    return descricao ? `${descricao}\n\n${entradaLog}` : entradaLog;
  };

  // 1) Sempre que mudar últimaRevisão ou periodicidade, recalcula diasDaRevisao e dataLimiteRevisao
  useEffect(() => {
    const { ultimaRevisao, periodicidadeRevisao } = formData;

    if (!ultimaRevisao || !periodicidadeRevisao) {
      setFormData((prev) => ({
        ...prev,
        dataLimiteRevisao: null,
      }));
      setDiasDaRevisao("");
      return;
    }

    

    // Mapeia periodicidade para dias
    const diasMap = { 1: 180, 2: 360, 3: 720 };
    const periodoEmDias = diasMap[periodicidadeRevisao] || 0;

    // Calcula data limite
    const limite = new Date(ultimaRevisao);
    limite.setDate(limite.getDate() + periodoEmDias);
    setFormData((prev) => ({
      ...prev,
      dataLimiteRevisao: limite,
    }));

    // Calcula diferença em dias
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    const diffMs = limite.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    setDiasDaRevisao(diffDias);
  }, [formData.ultimaRevisao, formData.periodicidadeRevisao]);

  // Guarda a data nova e abre o diálogo
  const handleOpenConfirmRevog = (newDate) => {
    if (newDate) {
      setTempRevDate(newDate);
      // Verifica se a justificativa está vazia para decidir se mostra o campo
      setShowJustificativaField(!motivoRevogacao || motivoRevogacao.trim() === "");
      setConfirmRevogOpen(true);
    } else {
      // Se usuário limpar a data, só atualiza sem confirmação
      setFormData((prev) => ({ ...prev, dataRevogacao: null }));
    }
  };

  useEffect(() => {
  // Só no modo Criar
  if (requisicao !== "Criar") return;

  // Precisa ter id do usuário
  if (!idUser) return;

  // Não sobrescreve se já tiver algo selecionado
  if (formData.revisor) return;

  // Espera carregar as opções
  if (!Array.isArray(responsaveis) || responsaveis.length === 0) return;

  // Só seta se o usuário existir na lista de responsáveis
  const exists = responsaveis.some((r) => String(r.id) === String(idUser));
  if (!exists) return;

  setFormData((prev) => ({
    ...prev,
    revisor: idUser,
  }));
}, [requisicao, idUser, responsaveis, formData.revisor]);


  // Função para salvar APENAS o comentário, ignorando outras alterações na tela
  const handleSalvarComentarioRapido = async () => {
    if (!novoComentario || !novoComentario.trim()) {
      enqueueSnackbar("Escreva um comentário antes de salvar.", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Gera o texto final (Histórico + Novo Comentário)
      const novaDescricaoCompleta = getDescricaoAtualizada();

      // 2. Prepara o Payload usando 'normativaDados' (dados do banco)
      // e NÃO o 'formData' (dados da tela), para não salvar alterações pendentes acidentalmente.
      const payload = {
        idNormative: normativaDados.idNormative,
        code: normativaDados.code,
        name: normativaDados.name,
        description: novaDescricaoCompleta, // <-- Único campo alterado
        registerDate: normativaDados.registerDate,
        publishDate: normativaDados.publishDate,
        initialVigency: normativaDados.initialVigency,
        lastRevision: normativaDados.lastRevision,
        idReviewer: normativaDados.idReviewer,
        conclusion: normativaDados.conclusion,
        frequencyRevision: normativaDados.frequencyRevision,
        limitDateRevision: normativaDados.limitDateRevision,
        // daysRevision: normativaDados.daysRevision,
        revocationDate: normativaDados.revocationDate,
        revocationReason: normativaDados.revocationReason,
        normativeStatus: normativaDados.normativeStatus,
        normativeRisk: normativaDados.normativeRisk,
        active: normativaDados.active,
        idNormativeType: normativaDados.idNormativeType,
        idRegulatory: normativaDados.idRegulatory,
        idResponsible: normativaDados.idResponsible,
        idOrigins: normativaDados.idOrigins,
        idDestinies: normativaDados.idDestinies,
        idActionPlans: normativaDados.idActionPlans,
        idApprovers: normativaDados.idApprovers,
        idCompanies: normativaDados.idCompanies,
        idDepartments: normativaDados.idDepartments,
        idProcesses: normativaDados.idProcess, // Note: confirme se a API retorna idProcess ou idProcesses no GET
        
        // Tratamento simples de arquivos para manter o que já existe sem upload novo
        files: normativaDados.files ? normativaDados.files.map(f => typeof f === 'string' ? f : f.path) : [],
      };

      const url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar comentário.");
      }

      // 3. Atualiza os estados locais para refletir o salvamento
      setDescricao(novaDescricaoCompleta); // Atualiza o histórico visual
      setNovoComentario(""); // Limpa o campo de novo comentário
      
      // Atualiza o objeto de referência para o novo estado do banco
      setNormativaDados((prev) => ({
        ...prev,
        description: novaDescricaoCompleta
      }));

      enqueueSnackbar("Comentário adicionado com sucesso!", {
        variant: "success",
      });

    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível salvar o comentário.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Usuário confirma a revogação
  const handleConfirmRevog = async () => {
    // Verifica se a justificativa está preenchida
    if (!motivoRevogacao || motivoRevogacao.trim() === "") {
      enqueueSnackbar("A justificativa de revogação é obrigatória!", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.aprovador) {
      setFormValidation((prev) => ({ ...prev, aprovador: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
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
        formDataUpload.append("ContainerFolder", 4);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? normativaDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
        method = "PUT";
        payload = {
          idNormative: normativaDados.idNormative,
          code: codigo,
          name: nome,
          description: getDescricaoAtualizada(),
          registerDate: formData.dataCadastro,
          //normativeInternType: formData.tipoNorma,
          publishDate: formData.dataPublicacao,
          initialVigency: formData.vigenciaInicial,
          lastRevision: formData.ultimaRevisao,
          idReviewer: formData.revisor || null,
          conclusion: conclusaoRevisao,
          frequencyRevision:
            formData.periodicidadeRevisao === undefined ||
            formData.periodicidadeRevisao === null ||
            (typeof formData.periodicidadeRevisao === "string" &&
              formData.periodicidadeRevisao.trim() === "")
              ? null
              : formData.periodicidadeRevisao,
          limitDateRevision: formData.dataLimiteRevisao,
          daysRevision:
            diasDaRevisao === undefined ||
            diasDaRevisao === null ||
            (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
              ? null
              : typeof diasDaRevisao === "number"
                ? String(diasDaRevisao)
                : String(diasDaRevisao).trim(),

          revocationDate: tempRevDate,
          revocationReason: `[${userName}]: ${motivoRevogacao}`, // <-- ALTERADO PARA INCLUIR O NOME DO USUÁRIO
          normativeStatus: 6,
          normativeRisk:
            formData.riscoNorma === undefined ||
            formData.riscoNorma === null ||
            (typeof formData.riscoNorma === "string" &&
              formData.riscoNorma.trim() === "")
              ? null
              : formData.riscoNorma,
          active: ativo,
          idNormativeType:
            formData.tipoNorma === undefined ||
            formData.tipoNorma === null ||
            (typeof formData.tipoNorma === "string" &&
              formData.tipoNorma.trim() === "") ||
            (Array.isArray(formData.tipoNorma) &&
              formData.tipoNorma.length === 0)
              ? null
              : formData.tipoNorma,
          idRegulatory:
            formData.regulador === undefined ||
            formData.regulador === null ||
            (typeof formData.regulador === "string" &&
              formData.regulador.trim() === "") ||
            (Array.isArray(formData.regulador) &&
              formData.regulador.length === 0)
              ? null
              : formData.regulador,
          idResponsible:
            formData.responsavel === undefined ||
            formData.responsavel === null ||
            (typeof formData.responsavel === "string" &&
              formData.responsavel.trim() === "") ||
            (Array.isArray(formData.responsavel) &&
              formData.responsavel.length === 0)
              ? null
              : formData.responsavel,
          idOrigins: formData.normaOrigem,
          idDestinies: formData.normaDestino,
          idActionPlans: formData.planoAcao,
          idApprovers: formData.aprovador,
          idCompanies: formData.empresa,
          idDepartments: formData.departamento,
          idProcesses: formData.processo,
          files: finalFilesPayload,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // Para edição, mesmo sem retorno, redirecionamos para a listagem
      setFormData((prev) => ({ ...prev, dataRevogacao: tempRevDate, normativeStatus: 6 }));
      setNormativaDados((prev) => ({ ...prev, normativeStatus: 6 }));
      handleCancelRevog();
      setHasStartedByTester(true);
      enqueueSnackbar("Norma revogada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setReload(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível revogar essa norma.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  // Usuário cancela a alteração
  const handleCancelRevog = () => {
    setConfirmRevogOpen(false);
    setTempRevDate(null);
    setShowJustificativaField(false);
  };

  // 2) Sempre que diasDaRevisao mudar, atribui statuRevisao
  useEffect(() => {
    // Se está vazio, limpa
    if (diasDaRevisao === "") {
      setFormData((prev) => ({
        ...prev,
        statuRevisao: "",
      }));
      return;
    }

    let novoStatus;
    if (diasDaRevisao > 30) {
      novoStatus = 1; // Revisada
    } else if (diasDaRevisao >= 0) {
      novoStatus = 2; // Próxima da revisão
    } else {
      novoStatus = 3; // Em atraso
    }

    setFormData((prev) => ({
      ...prev,
      statuRevisao: novoStatus,
    }));
  }, [diasDaRevisao]);

  const handleCompanyCreated = (newEmpresa) => {
    setEmpresa((prevEmpresas) => [...prevEmpresas, newEmpresa]);
    setFormData((prev) => ({
      ...prev,
      empresa: [...prev.empresa, newEmpresa.id],
    }));
  };

  // Função chamada quando o usuário seleciona um Responsável no Autocomplete
const handleResponsavelChange = (event, newValue) => {
  const newId = newValue ? newValue.id : "";
  
  // Atualiza o Responsável imediatamente
  setFormData((prev) => ({
    ...prev,
    responsavel: newId,
  }));

  // Se houve uma seleção válida, pergunta se quer replicar para o Revisor
  if (newId) {
    setTempResponsavelId(newId);
    setConfirmRevisorOpen(true);
  }
};

// Usuário clicou em "Sim"
const handleConfirmReplication = () => {
  setFormData((prev) => ({
    ...prev,
    revisor: tempResponsavelId, // Copia o ID para o campo revisor
  }));
  setConfirmRevisorOpen(false);
  setTempResponsavelId(null);
};

// Usuário clicou em "Não"
const handleDenyReplication = () => {
  setConfirmRevisorOpen(false);
  setTempResponsavelId(null);
  // Não faz nada com o campo revisor, ele permanece como estava
};

  const handleDepartmentCreated = (newDepartamento) => {
    setDepartamentos((prevDepartamentos) => [
      ...prevDepartamentos,
      newDepartamento,
    ]);
    setFormData((prev) => ({
      ...prev,
      departamento: [...prev.departamento, newDepartamento.id],
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
    if (field === "regulador") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normaOrigem.length === normaOrigens.length) {
        // Deselect all
        setFormData({ ...formData, normaOrigem: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          normaOrigem: normaOrigens.map((normaOrigem) => normaOrigem.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "normaOrigem",
        newValue.map((item) => item.id)
      );
    }
  };

  const handlePlanCreated = (newPlan) => {
    setPlanoAcao((prevPlans) => [...prevPlans, newPlan]);
    setFormData((prev) => ({
      ...prev,
      planoAcao: [...prev.planoAcao, newPlan.id],
    }));
  };

  const handleSelectAllDepartamentos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.departamento.length === departamentos.length) {
        // Deselect all
        setFormData({ ...formData, departamento: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          departamento: departamentos.map((departamento) => departamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "departamento",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllPlanoAcao = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.planoAcao.length === planosAcoes.length) {
        // Deselect all
        setFormData({ ...formData, planoAcao: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          planoAcao: planosAcoes.map((planoAcao) => planoAcao.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "planoAcao",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllAprovadores = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.aprovador.length === aprovadores.length) {
        // Deselect all
        setFormData({ ...formData, aprovador: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          aprovador: aprovadores.map((aprovador) => aprovador.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "aprovador",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllNormaDestinos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.normaDestino.length === normaDestinos.length) {
        // Deselect all
        setFormData({ ...formData, normaDestino: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          normaDestino: normaDestinos.map((normaDestino) => normaDestino.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "normaDestino",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllEmpresas = (event, newValue) => {
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
    codigo: true,
    nome: true,
    revisor: true
  });

  const allSelected =
    formData.normaOrigem.length === normaOrigens.length &&
    normaOrigens.length > 0;
  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;
  const allSelectedDiretrizes =
    formData.normaDestino.length === normaDestinos.length &&
    normaDestinos.length > 0;
  const allSelectedEmpresas =
    formData.empresa.length === empresas.length && empresas.length > 0;
  const allSelectedPlanoAcao =
    formData.planoAcao.length === planosAcoes.length && planosAcoes.length > 0;
  const allSelectedAprovadores =
    formData.aprovador.length === aprovadores.length && aprovadores.length > 0;

  const allSelectedDepartamentos =
    formData.departamento.length === departamentos.length &&
    departamentos.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { buttonTitle } = useMemo(() => {
    const currentStatus = formData.statusNorma;
    const tester = idUser === formData.responsavel;
    let title = "";
    if (currentStatus === 1 && tester) title = "ELABORADA";
    else if (currentStatus === 2 && tester) title = "TESTE REALIZADO";
    else if (currentStatus === 4 && formData.aprovador.includes(idUser))
      title = "APROVADA / RETORNAR";
    else if (currentStatus === 5 && formData.aprovador.includes(idUser))
      title = "RETORNAR";
    else if (currentStatus === 3 && formData.aprovador.includes(idUser))
      title = "REVISADA";
    return { buttonTitle: title, isTester: tester };
  }, [idUser, formData, normativaDados]);

  const handleStart = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.aprovador) {
      setFormValidation((prev) => ({ ...prev, aprovador: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
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
        formDataUpload.append("ContainerFolder", 4);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? normativaDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      const statusToSend =
        formData.statusNorma === 1
          ? Array.isArray(formData.aprovador) && formData.aprovador.length > 0
            ? 4
            : 3
          : formData.statusNorma;

      if (requisicao === "Editar") {
        url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
        method = "PUT";
        payload = {
          idNormative: normativaDados.idNormative,
          code: codigo,
          name: nome,
          description: getDescricaoAtualizada(),
          idReviewer: formData.revisor || null,
          registerDate: formData.dataCadastro,
          //normativeInternType: formData.tipoNorma,
          publishDate: formData.dataPublicacao,
          initialVigency: formData.vigenciaInicial,
          lastRevision:
            statusToSend === 3
              ? new Date().toISOString()
              : formData.ultimaRevisao,
          conclusion: conclusaoRevisao,
          frequencyRevision:
            formData.periodicidadeRevisao === undefined ||
            formData.periodicidadeRevisao === null ||
            (typeof formData.periodicidadeRevisao === "string" &&
              formData.periodicidadeRevisao.trim() === "")
              ? null
              : formData.periodicidadeRevisao,
          limitDateRevision: formData.dataLimiteRevisao,
          daysRevision:
            diasDaRevisao === undefined ||
            diasDaRevisao === null ||
            (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
              ? null
              : typeof diasDaRevisao === "number"
                ? String(diasDaRevisao)
                : String(diasDaRevisao).trim(),

          revocationDate: formData.dataRevogacao,
          revocationReason: `[${userName}]: ${motivoRevogacao}`, // <-- ALTERADO PARA INCLUIR O NOME DO USUÁRIO
          normativeStatus: statusToSend,
          normativeRisk:
            formData.riscoNorma === undefined ||
            formData.riscoNorma === null ||
            (typeof formData.riscoNorma === "string" &&
              formData.riscoNorma.trim() === "")
              ? null
              : formData.riscoNorma,
          active: ativo,
          idNormativeType:
            formData.tipoNorma === undefined ||
            formData.tipoNorma === null ||
            (typeof formData.tipoNorma === "string" &&
              formData.tipoNorma.trim() === "") ||
            (Array.isArray(formData.tipoNorma) &&
              formData.tipoNorma.length === 0)
              ? null
              : formData.tipoNorma,
          idRegulatory:
            formData.regulador === undefined ||
            formData.regulador === null ||
            (typeof formData.regulador === "string" &&
              formData.regulador.trim() === "") ||
            (Array.isArray(formData.regulador) &&
              formData.regulador.length === 0)
              ? null
              : formData.regulador,
          idResponsible:
            formData.responsavel === undefined ||
            formData.responsavel === null ||
            (typeof formData.responsavel === "string" &&
              formData.responsavel.trim() === "") ||
            (Array.isArray(formData.responsavel) &&
              formData.responsavel.length === 0)
              ? null
              : formData.responsavel,
          idOrigins: formData.normaOrigem,
          idDestinies: formData.normaDestino,
          idActionPlans: formData.planoAcao,
          idApprovers: formData.aprovador,
          idCompanies: formData.empresa,
          idDepartments: formData.departamento,
          idProcesses: formData.processo,
          files: finalFilesPayload,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // Para edição, mesmo sem retorno, redirecionamos para a listagem
      setFormData((prev) => ({ ...prev, normativeStatus: statusToSend }));
      setNormativaDados((prev) => ({ ...prev, normativeStatus: statusToSend }));
      setHasStartedByTester(true);
      enqueueSnackbar("Status alterado com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setReload(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTesteRealizado = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.aprovador) {
      setFormValidation((prev) => ({ ...prev, aprovador: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
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
        formDataUpload.append("ContainerFolder", 4);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? normativaDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
        method = "PUT";
        payload = {
          idNormative: normativaDados.idNormative,
          code: codigo,
          name: nome,
          description: getDescricaoAtualizada(),
          idReviewer: formData.revisor || null,
          registerDate: formData.dataCadastro,
          //normativeInternType: formData.tipoNorma,
          publishDate: formData.dataPublicacao,
          initialVigency: formData.vigenciaInicial,
          lastRevision: formData.ultimaRevisao,
          conclusion: conclusaoRevisao,
          frequencyRevision:
            formData.periodicidadeRevisao === undefined ||
            formData.periodicidadeRevisao === null ||
            (typeof formData.periodicidadeRevisao === "string" &&
              formData.periodicidadeRevisao.trim() === "")
              ? null
              : formData.periodicidadeRevisao,
          limitDateRevision: formData.dataLimiteRevisao,
          daysRevision:
            diasDaRevisao === undefined ||
            diasDaRevisao === null ||
            (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
              ? null
              : typeof diasDaRevisao === "number"
                ? String(diasDaRevisao)
                : String(diasDaRevisao).trim(),

          revocationDate: formData.dataRevogacao,
          revocationReason: `[${userName}]: ${motivoRevogacao}`, // <-- ALTERADO PARA INCLUIR O NOME DO USUÁRIO
          normativeStatus: formData.statusNorma,
          normativeRisk:
            formData.riscoNorma === undefined ||
            formData.riscoNorma === null ||
            (typeof formData.riscoNorma === "string" &&
              formData.riscoNorma.trim() === "")
              ? null
              : formData.riscoNorma,
          active: ativo,
          idNormativeType:
            formData.tipoNorma === undefined ||
            formData.tipoNorma === null ||
            (typeof formData.tipoNorma === "string" &&
              formData.tipoNorma.trim() === "") ||
            (Array.isArray(formData.tipoNorma) &&
              formData.tipoNorma.length === 0)
              ? null
              : formData.tipoNorma,
          idRegulatory:
            formData.regulador === undefined ||
            formData.regulador === null ||
            (typeof formData.regulador === "string" &&
              formData.regulador.trim() === "") ||
            (Array.isArray(formData.regulador) &&
              formData.regulador.length === 0)
              ? null
              : formData.regulador,
          idResponsible:
            formData.responsavel === undefined ||
            formData.responsavel === null ||
            (typeof formData.responsavel === "string" &&
              formData.responsavel.trim() === "") ||
            (Array.isArray(formData.responsavel) &&
              formData.responsavel.length === 0)
              ? null
              : formData.responsavel,
          idOrigins: formData.normaOrigem,
          idDestinies: formData.normaDestino,
          idActionPlans: formData.planoAcao,
          idApprovers: formData.aprovador,
          idCompanies: formData.empresa,
          idDepartments: formData.departamento,
          idProcesses: formData.processo,
          files: finalFilesPayload,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // No caso de criação, podemos esperar que a resposta traga os dados (por exemplo, idTestPhase)
      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setNormativaDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        // Para edição, mesmo sem retorno, redirecionamos para a listagem
        setFormData((prev) => ({ ...prev, status: 3 }));
        setNormativaDados((prev) => ({ ...prev, normativeStatus: 3 }));
        setHasStartedByTester(true);
        enqueueSnackbar("Teste realizado com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirTeste = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.aprovador) {
      setFormValidation((prev) => ({ ...prev, aprovador: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
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
        formDataUpload.append("ContainerFolder", 4);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? normativaDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
        method = "PUT";
        payload = {
          idNormative: normativaDados.idNormative,
          code: codigo,
          name: nome,
          description: getDescricaoAtualizada(),
          idReviewer: formData.revisor || null,
          registerDate: formData.dataCadastro,
          //normativeInternType: formData.tipoNorma,
          publishDate: formData.dataPublicacao,
          initialVigency: formData.vigenciaInicial,
          lastRevision: new Date().toISOString(),
          conclusion: conclusaoRevisao,
          frequencyRevision:
            formData.periodicidadeRevisao === undefined ||
            formData.periodicidadeRevisao === null ||
            (typeof formData.periodicidadeRevisao === "string" &&
              formData.periodicidadeRevisao.trim() === "")
              ? null
              : formData.periodicidadeRevisao,
          limitDateRevision: formData.dataLimiteRevisao,
          daysRevision:
            diasDaRevisao === undefined ||
            diasDaRevisao === null ||
            (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
              ? null
              : typeof diasDaRevisao === "number"
                ? String(diasDaRevisao)
                : String(diasDaRevisao).trim(),

          revocationDate: formData.dataRevogacao,
          revocationReason: `[${userName}]: ${motivoRevogacao}`, // <-- ALTERADO PARA INCLUIR O NOME DO USUÁRIO
          normativeStatus: 3,
          normativeRisk:
            formData.riscoNorma === undefined ||
            formData.riscoNorma === null ||
            (typeof formData.riscoNorma === "string" &&
              formData.riscoNorma.trim() === "")
              ? null
              : formData.riscoNorma,
          active: ativo,
          idNormativeType:
            formData.tipoNorma === undefined ||
            formData.tipoNorma === null ||
            (typeof formData.tipoNorma === "string" &&
              formData.tipoNorma.trim() === "") ||
            (Array.isArray(formData.tipoNorma) &&
              formData.tipoNorma.length === 0)
              ? null
              : formData.tipoNorma,
          idRegulatory:
            formData.regulador === undefined ||
            formData.regulador === null ||
            (typeof formData.regulador === "string" &&
              formData.regulador.trim() === "") ||
            (Array.isArray(formData.regulador) &&
              formData.regulador.length === 0)
              ? null
              : formData.regulador,
          idResponsible:
            formData.responsavel === undefined ||
            formData.responsavel === null ||
            (typeof formData.responsavel === "string" &&
              formData.responsavel.trim() === "") ||
            (Array.isArray(formData.responsavel) &&
              formData.responsavel.length === 0)
              ? null
              : formData.responsavel,
          idOrigins: formData.normaOrigem,
          idDestinies: formData.normaDestino,
          idActionPlans: formData.planoAcao,
          idApprovers: formData.aprovador,
          idCompanies: formData.empresa,
          idDepartments: formData.departamento,
          idProcesses: formData.processo,
          files: finalFilesPayload,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // Para edição, mesmo sem retorno, redirecionamos para a listagem
      setFormData((prev) => ({ ...prev, normativeStatus: 3 }));
      setNormativaDados((prev) => ({ ...prev, normativeStatus: 3 }));
      setHasStartedByTester(true);
      enqueueSnackbar("Normativa aprovada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setReload(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetornar = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.aprovador) {
      setFormValidation((prev) => ({ ...prev, aprovador: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
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
        formDataUpload.append("ContainerFolder", 4);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? normativaDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
        method = "PUT";
        payload = {
          idNormative: normativaDados.idNormative,
          code: codigo,
          name: nome,
          idReviewer: formData.revisor || null,
          description: getDescricaoAtualizada(),
          registerDate: formData.dataCadastro,
          //normativeInternType: formData.tipoNorma,
          publishDate: formData.dataPublicacao,
          initialVigency: formData.vigenciaInicial,
          lastRevision: formData.ultimaRevisao,
          conclusion: conclusaoRevisao,
          frequencyRevision:
            formData.periodicidadeRevisao === undefined ||
            formData.periodicidadeRevisao === null ||
            (typeof formData.periodicidadeRevisao === "string" &&
              formData.periodicidadeRevisao.trim() === "")
              ? null
              : formData.periodicidadeRevisao,
          limitDateRevision: formData.dataLimiteRevisao,
          daysRevision:
            diasDaRevisao === undefined ||
            diasDaRevisao === null ||
            (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
              ? null
              : typeof diasDaRevisao === "number"
                ? String(diasDaRevisao)
                : String(diasDaRevisao).trim(),

          revocationDate: formData.dataRevogacao,
          revocationReason: `[${userName}]: ${motivoRevogacao}`, // <-- ALTERADO PARA INCLUIR O NOME DO USUÁRIO
          normativeStatus: 1,
          normativeRisk:
            formData.riscoNorma === undefined ||
            formData.riscoNorma === null ||
            (typeof formData.riscoNorma === "string" &&
              formData.riscoNorma.trim() === "")
              ? null
              : formData.riscoNorma,
          active: ativo,
          idNormativeType:
            formData.tipoNorma === undefined ||
            formData.tipoNorma === null ||
            (typeof formData.tipoNorma === "string" &&
              formData.tipoNorma.trim() === "") ||
            (Array.isArray(formData.tipoNorma) &&
              formData.tipoNorma.length === 0)
              ? null
              : formData.tipoNorma,
          idRegulatory:
            formData.regulador === undefined ||
            formData.regulador === null ||
            (typeof formData.regulador === "string" &&
              formData.regulador.trim() === "") ||
            (Array.isArray(formData.regulador) &&
              formData.regulador.length === 0)
              ? null
              : formData.regulador,
          idResponsible:
            formData.responsavel === undefined ||
            formData.responsavel === null ||
            (typeof formData.responsavel === "string" &&
              formData.responsavel.trim() === "") ||
            (Array.isArray(formData.responsavel) &&
              formData.responsavel.length === 0)
              ? null
              : formData.responsavel,
          idOrigins: formData.normaOrigem,
          idDestinies: formData.normaDestino,
          idActionPlans: formData.planoAcao,
          idApprovers: formData.aprovador,
          idCompanies: formData.empresa,
          idDepartments: formData.departamento,
          idProcesses: formData.processo,
          files: finalFilesPayload,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // Para edição, mesmo sem retorno, redirecionamos para a listagem
      setFormData((prev) => ({ ...prev, normativeStatus: 1 }));
      setNormativaDados((prev) => ({ ...prev, normativeStatus: 1 }));
      setHasStartedByTester(true);
      enqueueSnackbar("Normativa retornada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setReload(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.revisor || String(formData.revisor).trim() === "") {
      setFormValidation((prev) => ({ ...prev, revisor: false }));
      missingFields.push("Revisor");
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

    if (deletedFiles.length > 0) {
      const deletedFilesPayload = deletedFiles.map((file) => file.name);

      await axios.delete("https://api.egrc.homologacao.com.br/api/v1/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          containerFolder: 6,
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
      formDataUpload.append("ContainerFolder", 6);

      formDataUpload.append(
        "IdContainer",
        requisicao === "Editar" ? dadosApi?.idNormative : ""
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

    // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
    const finalFiles = [...existingFiles, ...uploadFilesResult.files];

    // Transforma cada item para que o payload contenha somente a URL (string)
    const finalFilesPayload = finalFiles.map((file) => {
      if (typeof file === "string") return file;
      if (file.path) return file.path;
      return file;
    });

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/normatives";
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        idReviewer: formData.revisor || null,
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/normatives`;
      method = "PUT";
      payload = {
        idNormative: normativaDados.idNormative,
        code: codigo,
        name: nome,
        description: getDescricaoAtualizada(),
        registerDate: formData.dataCadastro,
        //normativeInternType: formData.tipoNorma,
        publishDate: formData.dataPublicacao,
        initialVigency: formData.vigenciaInicial,
        idReviwer: formData.revisor || null,
        lastRevision: formData.ultimaRevisao,
        conclusion: conclusaoRevisao,
        frequencyRevision:
          formData.periodicidadeRevisao === undefined ||
          formData.periodicidadeRevisao === null ||
          (typeof formData.periodicidadeRevisao === "string" &&
            formData.periodicidadeRevisao.trim() === "")
            ? null
            : formData.periodicidadeRevisao,
        limitDateRevision: formData.dataLimiteRevisao,
        daysRevision:
          diasDaRevisao === undefined ||
          diasDaRevisao === null ||
          (typeof diasDaRevisao === "string" && diasDaRevisao.trim() === "")
            ? null
            : typeof diasDaRevisao === "number"
              ? String(diasDaRevisao)
              : String(diasDaRevisao).trim(),

        revocationDate: formData.dataRevogacao,
        revocationReason: motivoRevogacao,
        normativeStatus: formData.statusNorma,
        normativeRisk:
          formData.riscoNorma === undefined ||
          formData.riscoNorma === null ||
          (typeof formData.riscoNorma === "string" &&
            formData.riscoNorma.trim() === "")
            ? null
            : formData.riscoNorma,
        active: ativo,
        idNormativeType:
          formData.tipoNorma === undefined ||
          formData.tipoNorma === null ||
          (typeof formData.tipoNorma === "string" &&
            formData.tipoNorma.trim() === "") ||
          (Array.isArray(formData.tipoNorma) && formData.tipoNorma.length === 0)
            ? null
            : formData.tipoNorma,
        idRegulatory:
          formData.regulador === undefined ||
          formData.regulador === null ||
          (typeof formData.regulador === "string" &&
            formData.regulador.trim() === "") ||
          (Array.isArray(formData.regulador) && formData.regulador.length === 0)
            ? null
            : formData.regulador,
        idResponsible:
          formData.responsavel === undefined ||
          formData.responsavel === null ||
          (typeof formData.responsavel === "string" &&
            formData.responsavel.trim() === "") ||
          (Array.isArray(formData.responsavel) &&
            formData.responsavel.length === 0)
            ? null
            : formData.responsavel,
        idOrigins: formData.normaOrigem,
        idDestinies: formData.normaDestino,
        idActionPlans: formData.planoAcao,
        idApprovers: formData.aprovador,
        idCompanies: formData.empresa,
        idDepartments: formData.departamento,
        idProcesses: formData.processo,
        files: finalFilesPayload,
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

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      let companyId;
      if (requisicao === "Editar" && response.status === 204) {
        companyId = normativaDados?.idNormative;
        enqueueSnackbar(`Normativa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      } else {
        const data = await response.json();
        companyId = data.data.idNormative;
        enqueueSnackbar(`Normativa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar") {
        setNormativaDados((prev) => ({ ...prev, idNormative: companyId }));
        setSuccessDialogOpen(true);
        navigate(location.pathname, {
          replace: true,
          state: { dadosApi: companyId },
        });
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa normativa.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isTester = idUser === formData.responsavel;
  const isReviewer = !isTester && formData.aprovador.includes(idUser);
  const status = normativaDados?.normativeStatus || formData.statusNorma;
  const canEditListagem = true;
  const creating = requisicao === "Criar";
  const editing = !creating; // originalRequisicao === "Editar"
  const started = hasStartedByTester;

  const fieldPermissions = useMemo(() => {
    // Se for criação, libera tudo
    if (creating) {
      return {
        nomeFaseTeste: true,
        status: true,
        populacao: true,
        tipoTeste: true,
        amostra: true,
        metodologia: true,
        responsavel: true, // agora também liberado em "Criar"
        revisores: true,
        descricao: true,
        dataInicioCobertura: true,
        dataFimCobertura: true,
        dataInicioTeste: true,
        dataFimTeste: true,
        dataConclusaoEfetiva: true,
        conclusaoTeste: true,
        descricaoTestador: true,
        descricaoRevisor: true,
      };
    }

    if (status === 4) {
      return {
        nomeFaseTeste: false,
        status: false,
        populacao: false,
        tipoTeste: false,
        amostra: false,
        metodologia: false,
        responsavel: false,
        revisores: false,
        descricao: false,
        dataInicioCobertura: false,
        dataFimCobertura: false,
        dataInicioTeste: false,
        dataFimTeste: false,
        dataConclusaoEfetiva: false,
        conclusaoTeste: false,
        descricaoTestador: false,
        descricaoRevisor: false,
      };
    }

    // Caso contrário, aplica as regras de edição
    return {
      nomeFaseTeste: editing && isTester && started && status < 3,
      status: editing && isTester && started && status < 3,
      populacao: editing && isTester && started && status < 3,
      tipoTeste: editing && isTester && started && status < 3,
      amostra: editing && isTester && started && status < 3,
      metodologia: editing && isTester && started && status < 3,

      // nunca liberar a edição do responsavel no modo de edição
      responsavel: false,

      revisores: editing && isTester && started && status < 3,
      descricao: editing && isTester && started && status < 3,
      dataInicioCobertura: editing && isTester && started && status < 3,
      dataFimCobertura: editing && isTester && started && status < 3,
      dataInicioTeste: true,
      dataFimTeste: editing && isTester && started && status < 3,
      dataConclusaoEfetiva: true,
      conclusaoTeste: editing && isTester && started && status < 3,
      descricaoTestador: editing && isTester && started && status < 3,

      // só o aprovador pode editar o próprio comentário quando em revisão
      descricaoRevisor: editing && isReviewer && status === 3,
    };
  }, [creating, editing, isTester, isReviewer, started, status]);

  const canEditAttributes = !(isTester && status === 1);

  // ==================================================================
  //           BLOCO DE CÓDIGO ADICIONADO PARA AJUSTES
  // ==================================================================
  const isRevogado = normativaDados?.normativeStatus === 6;
  const isResponsavel = formData.responsavel === idUser;
  const isAprovador = formData.aprovador.includes(idUser);
  const canRevogar = (isResponsavel || isReviewer) && !isRevogado;
  const isFormLocked = isRevogado;
  // ==================================================================


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
          value={codigo}
          error={!codigo && formValidation.codigo === false}
          disabled={isFormLocked}
        />
            </Stack>
          </Grid>
          {requisicao === "Editar" && (
            <Grid item xs={3} mt={4} ml={5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {buttonTitle === "ELABORADA" ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleStart}
                  >
                    ELABORADA
                  </Button>
                ) : buttonTitle === "TESTE REALIZADO" ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleTesteRealizado}
                  >
                    TESTE REALIZADO
                  </Button>
                ) : buttonTitle === "APROVADA / RETORNAR" ? (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleConcluirTeste}
                    >
                      APROVADA
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRetornar}
                    >
                      RETORNAR
                    </Button>
                  </>
                ) : (
                  buttonTitle && (
                    <Button
                      sx={{ display: "none" }}
                      variant="contained"
                      size="small"
                      onClick={tratarSubmit}
                    >
                      {buttonTitle}
                    </Button>
                  )
                )}
              </Stack>
            </Grid>
          )}

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
          value={nome}
          error={!nome && formValidation.nome === false}
          disabled={isFormLocked}
        />
            </Stack>
          </Grid>

           {/* Localize o Grid do Revisor (aprox. linha 1418) */}
<Grid item xs={6} sx={{ paddingBottom: 5 }}>
  <Stack spacing={1}>
    <InputLabel>Revisor *</InputLabel>
    <Autocomplete
      options={responsaveis} // Assumindo que a lista de pessoas é a mesma
      getOptionLabel={(option) => option.nome}
      // AGORA vinculado ao formData.revisor
      value={
        responsaveis.find(
          (r) => r.id === formData.revisor
        ) || null
      }
      onChange={(event, newValue) => {
        setFormData((prev) => ({
          ...prev,
          revisor: newValue ? newValue.id : "",
        }));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          // Adicione validação aqui se o campo Revisor for obrigatório
        />
      )}
      disabled={isFormLocked}
    />
  </Stack>
</Grid>

          <Grid item xs={6}>
            <Stack spacing={1}>
              <InputLabel>Status da norma</InputLabel>
              <Autocomplete
                options={statusNormas}
                getOptionLabel={(option) => option.nome}
                value={
                  statusNormas.find(
                    (item) => item.id === formData.statusNorma
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    statusNorma: newValue ? newValue.id : "",
                  }));
                  // Exemplo de uso da mask:
                  // console.log("Máscara de Probabilidade:", newValue?.mask);
                }}
                renderInput={(params) => <TextField {...params} />}
                disabled={isFormLocked}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
          {/* ... (dentro do return) ... */}

<Grid item xs={12} sx={{ paddingBottom: 5 }}>
  <Stack spacing={2}>
    
    {/* 1. CAMPO DE HISTÓRICO (Visual Melhorado) */}
    {descricao && (
      <>
        {/* 2. CAMPO DE NOVA ENTRADA COM BOTÃO AO LADO */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={2}
          sx={{ mb: 1, mt: 2 }} // Margem para espaçamento
        >
          <InputLabel sx={{ m: 0 }}>
            {descricao ? "Adicionar novo comentário" : "Comentário"}
          </InputLabel>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleSalvarComentarioRapido}
            disabled={isFormLocked || loading}
            sx={{ 
              fontWeight: 600,
              textTransform: "none",
              height: "30px"
            }}
          >
            Salvar Comentário
          </Button>
        </Stack>

        <TextField
          onChange={(event) => setNovoComentario(event.target.value)}
          fullWidth
          multiline
          rows={4}
          value={novoComentario}
          placeholder="Digite aqui seu comentário ou observação..."
          disabled={isFormLocked}
          sx={{
            backgroundColor: "#fff",
            marginBottom: 2 // Espaço antes do histórico
          }}
        />
    
        <InputLabel sx={{ fontWeight: "bold", color: "#333" }}>
          Histórico de Comentários
        </InputLabel>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={8} // Permite crescer um pouco mais se tiver muito texto
          value={descricao}
          // Usamos readOnly ao invés de disabled para controlar melhor as cores
          InputProps={{
            readOnly: true,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f0f7ff", // Um azul bem clarinho (mais agradável que cinza)
              "& fieldset": {
                borderColor: "#b3d9ff", // Borda suave
              },
              "&:hover fieldset": {
                borderColor: "#b3d9ff", // Mantém a borda ao passar o mouse
              },
              "&.Mui-focused fieldset": {
                borderColor: "#b3d9ff", // Mantém a borda ao focar (clicar)
              },
            },
            "& .MuiInputBase-input": {
              color: "#0d0d0d !important", // Força a cor PRETA (quase preta)
              WebkitTextFillColor: "#0d0d0d !important", // Garante contraste no Chrome/Safari
              fontSize: "0.95rem",
              fontWeight: 500, // Um pouco mais de peso na fonte
            },
          }}
        />
      </>
    )}


  </Stack>
</Grid>
              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de cadastro</InputLabel>
                  <DatePicker
                    disabled
                    value={formData.dataCadastro || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataCadastro: newValue,
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

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data de publicação</InputLabel>
                  <DatePicker
                    value={formData.dataPublicacao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataPublicacao: newValue,
                      }));
                    }}
                    slotProps={{
                      textField: {
                        placeholder: "00/00/0000",
                      },
                    }}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Vigência inicial</InputLabel>
                  <DatePicker
                    value={formData.vigenciaInicial || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        vigenciaInicial: newValue,
                      }));
                    }}
                    slotProps={{
                      textField: {
                        placeholder: "00/00/0000",
                      },
                    }}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Ambiente</InputLabel>
                  <Autocomplete
                    options={ambientes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      ambientes.find((a) => a.id === formData.ambiente) || null
                    }
                    onChange={(event, newValue) => {
                      const ambienteId = newValue ? newValue.id : "";
                      setFormData((prev) => ({
                        ...prev,
                        ambiente: ambienteId,
                        // se for Externo (2) → Versão Final (3); se for Interno (1) → Elaboração (1)
                        statusNorma:
                          ambienteId === 2
                            ? 3
                            : ambienteId === 1
                              ? 1
                              : prev.statusNorma,
                        // quando Externo, grava a data de hoje em ultimaRevisao
                        ultimaRevisao:
                          ambienteId === 2 ? new Date() : prev.ultimaRevisao,
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Regulador</InputLabel>
                  <Autocomplete
                    options={reguladores}
                    getOptionLabel={(option) => option.nome}
                    value={
                      reguladores.find(
                        (regulador) => regulador.id === formData.regulador
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        regulador: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.regulador &&
                          formValidation.regulador === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da norma</InputLabel>
                  <Autocomplete
                    options={tipoNormas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tipoNormas.find(
                        (item) => item.id === formData.tipoNorma
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoNorma: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Norma de origem</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...normaOrigens.filter(
                        (norma) => norma.id !== idNormativoAtual
                      ),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.normaOrigem.map(
                      (id) =>
                        normaOrigens.find(
                          (normaOrigem) => normaOrigem.id === id
                        ) || id
                    )}
                    onChange={(event, newValue) => {
                      const selectedIds = newValue.map((item) => item.id);
                      setFormData((prev) => ({
                        ...prev,
                        normaOrigem: selectedIds,
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionDisabled={(option) =>
                      option.id !== "all" &&
                      formData.normaDestino.includes(option.id)
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
                          (formData.normaOrigem.length === 0 ||
                            formData.normaOrigem.every((val) => val === 0)) &&
                          formValidation.normaOrigem === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={4} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Norma de destino</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...normaDestinos.filter(
                        (norma) => norma.id !== idNormativoAtual
                      ),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.normaDestino.map(
                      (id) =>
                        normaDestinos.find(
                          (normaDestino) => normaDestino.id === id
                        ) || id
                    )}
                    onChange={(event, newValue) => {
                      const selectedIds = newValue.map((item) => item.id);
                      setFormData((prev) => ({
                        ...prev,
                        normaDestino: selectedIds,
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionDisabled={(option) =>
                      option.id !== "all" &&
                      formData.normaOrigem.includes(option.id)
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedDiretrizes
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
                          (formData.normaDestino.length === 0 ||
                            formData.normaDestino.every((val) => val === 0)) &&
                          formValidation.normaDestino === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Empresas{" "}
                    <DrawerEmpresa
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
                      { id: "all", nome: "Selecionar todos" },
                      ...empresas,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.empresa.map(
                      (id) =>
                        empresas.find((empresa) => empresa.id === id) || id
                    )}
                    onChange={handleSelectAllEmpresas}
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
                                  ? allSelectedEmpresas
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
                          (formData.empresa.length === 0 ||
                            formData.empresa.every((val) => val === 0)) &&
                          formValidation.empresa === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Departamentos{" "}
                    <DrawerDepartamento
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onDepartmentCreated={handleDepartmentCreated}
                    />
                  </InputLabel>                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...departamentos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamento.map(
                      (id) =>
                        departamentos.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllDepartamentos}
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
                                  ? allSelectedDepartamentos
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
                          (formData.departamento.length === 0 ||
                            formData.departamento.every((val) => val === 0)) &&
                          formValidation.departamento === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
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
                  </InputLabel>                  <Autocomplete
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
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Plano de ação{" "}
                    <DrawerPlanos
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onPlansCreated={handlePlanCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...planosAcoes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.planoAcao.map(
                      (id) =>
                        planosAcoes.find((planoAcao) => planoAcao.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllPlanoAcao}
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
                                  ? allSelectedPlanoAcao
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
                          (formData.planoAcao.length === 0 ||
                            formData.planoAcao.every((val) => val === 0)) &&
                          formValidation.planoAcao === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={5}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      Campos de revisão
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      <Grid
                        item
                        xs={6}
                        sx={{ paddingBottom: 5, paddingTop: 5 }}
                      >
                        <Stack spacing={1}>
                          <InputLabel>Última revisão</InputLabel>
                          <DatePicker
                            disabled
                            value={formData.ultimaRevisao || null}
                            onChange={(newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                ultimaRevisao: newValue,
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
                      {requisicao === "Editar" && (
                        <Grid item xs={3} mt={4} ml={5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {buttonTitle === "REVISADA" ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={handleStart}
                              >
                                REVISADA
                              </Button>
                            ) : (
                              buttonTitle && (
                                <Button
                                  hidden
                                  variant="contained"
                                  size="small"
                                  onClick={tratarSubmit}
                                ></Button>
                              )
                            )}
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Risco da norma</InputLabel>
                          <Autocomplete
                            options={riscoNormas}
                            getOptionLabel={(option) => option.nome}
                            value={
                              riscoNormas.find(
                                (item) => item.id === formData.riscoNorma
                              ) || null
                            }
                            onChange={(_, newValue) => {
                              const risco = newValue?.id ?? null; // pega o id numérico ou null
                              let periodicidade = null; // default: limpar

                              switch (risco) {
                                case 1:
                                case 2:
                                case 3:
                                  periodicidade = risco; // para 1,2,3 => mesmo valor
                                  break;
                                default:
                                  periodicidade = null; // para 4 ou vazio, limpa
                              }

                              setFormData((prev) => ({
                                ...prev,
                                riscoNorma: risco,
                                periodicidadeRevisao: periodicidade,
                              }));
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            disabled={isFormLocked}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Status da revisão</InputLabel>
                          <Autocomplete
                            disabled={isFormLocked}
                            options={statusRevisao}
                            getOptionLabel={(option) => option.nome}
                            value={
                              statusRevisao.find(
                                (item) => item.id === formData.statuRevisao
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                statuRevisao: newValue ? newValue.id : "",
                              }));
                              // Exemplo de uso da mask:
                              // console.log("Máscara de Probabilidade:", newValue?.mask);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Periodicidade da revisão</InputLabel>
                          <Autocomplete
                            disabled={isFormLocked}
                            options={periodicidadeRevisoes}
                            getOptionLabel={(option) => option.nome}
                            value={
                              periodicidadeRevisoes.find(
                                (item) =>
                                  item.id === formData.periodicidadeRevisao
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                periodicidadeRevisao: newValue
                                  ? newValue.id
                                  : "",
                              }));
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Data limite da revisão</InputLabel>
                          <DatePicker
                            disabled={isFormLocked}
                            value={formData.dataLimiteRevisao || null}
                            onChange={(newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                dataLimiteRevisao: newValue,
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

                      <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Dias da revisão</InputLabel>
                          <TextField
                            disabled={isFormLocked}
                            onChange={(event) =>
                              setDiasDaRevisao(event.target.value)
                            }
                            fullWidth
                            value={diasDaRevisao}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                        <Stack spacing={1}>
                          <InputLabel>Conclusão da revisão</InputLabel>
                          <TextField
                            onChange={(event) =>
                              setConclusaoRevisao(event.target.value)
                            }
                            fullWidth
                            multiline
                            rows={4}
                            value={conclusaoRevisao}
                            disabled={isFormLocked}
                          />
                        </Stack>
                      </Grid>

                      {/* Continue pasting publication dates, ambiente, regulador, normas origem/destino, empresas, departamentos, processos, planos, datas, periodicidade, riscos, conclusão, revisão, switch, file uploader, etc. */}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={3} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data da revogação</InputLabel>
                  <DatePicker
                    value={formData.dataRevogacao || null}
                    onChange={handleOpenConfirmRevog}
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                    disabled={!canRevogar || isFormLocked}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Motivo da revogação</InputLabel>
                  <TextField
                    onChange={(event) => setMotivoRevogacao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={motivoRevogacao}
                    disabled={!canRevogar || isFormLocked}
                  />
                </Stack>
              </Grid>

<Grid item xs={6} sx={{ paddingBottom: 5 }}>
  <Stack spacing={1}>
    <InputLabel>Responsável</InputLabel>
    <Autocomplete
      options={responsaveis}
      getOptionLabel={(option) => option.nome}
      // Valor vinculado ao formData.responsavel
      value={
        responsaveis.find(
          (r) => r.id === formData.responsavel
        ) || null
      }
      // Chama a função customizada
      onChange={handleResponsavelChange}
      renderInput={(params) => (
        <TextField
          {...params}
          error={!formData.responsavel && formValidation.responsavel === false}
        />
      )}
      disabled={isFormLocked}
    />
  </Stack>
</Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Aprovadores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...aprovadores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.aprovador.map(
                      (id) =>
                        aprovadores.find((aprovador) => aprovador.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllAprovadores}
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
                                  ? allSelectedAprovadores
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
                          (formData.aprovador.length === 0 ||
                            formData.aprovador.every((val) => val === 0)) &&
                          formValidation.aprovador === false
                        }
                      />
                    )}
                    disabled={isFormLocked}
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
                      checked={ativo}
                      onChange={(event) => setAtivo(event.target.checked)}
                    />
                    <Typography>{ativo ? "Ativo" : "Inativo"}</Typography>
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
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Trecho</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemTrecho />
                  </AccordionDetails>
                </Accordion>
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
              Normativa Criada com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A normativa foi cadastrada com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a essa normativa.
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
          <Dialog
  open={confirmRevisorOpen}
  onClose={handleDenyReplication}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">
    {"Definir Revisor?"}
  </DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      Deseja que o responsável selecionado também seja atribuído como revisor desta normativa?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleDenyReplication}>Não</Button>
    <Button onClick={handleConfirmReplication} autoFocus variant="contained">
      Sim
    </Button>
  </DialogActions>
</Dialog>
          <Dialog
            open={confirmRevogOpen}
            onClose={handleCancelRevog}
            aria-labelledby="confirm-revog-dialog-title"
          >
            <DialogTitle id="confirm-revog-dialog-title">
              Confirmar Revogação
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja revogar esta norma em{" "}
                {tempRevDate?.toLocaleDateString("pt-BR")}?<br />
                Isso definirá o status como "Revogado" e essa norma não poderá
                mais ser editada.
              </DialogContentText>
              {showJustificativaField && (
                <TextField
                  autoFocus
                  margin="dense"
                  id="justificativa-revogacao"
                  label="Justificativa de Revogação"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={motivoRevogacao}
                  onChange={(e) => setMotivoRevogacao(e.target.value)}
                  placeholder="Informe a justificativa para a revogação desta norma..."
                  sx={{ mt: 2 }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelRevog}>Cancelar</Button>
              <Button onClick={handleConfirmRevog} autoFocus>
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
