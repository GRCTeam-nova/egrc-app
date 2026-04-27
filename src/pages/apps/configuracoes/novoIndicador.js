/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    Box,
    TextField,
    Autocomplete,
    Grid,
    Stack,
    InputLabel,
    Dialog,
    DialogActions,
    DialogContent,
    Typography,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Divider,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { API_URL } from "config";

const eixosESG = [
    { id: 1, nome: "Ambiental" },
    { id: 2, nome: "Social" },
    { id: 3, nome: "Governança" },
];

const tiposMeta = [
    { id: 1, nome: "Absoluta (ou total)", tipoCampo: "numérico" },
    { id: 2, nome: "Intensiva (ou relativa)", tipoCampo: "percentual" },
    { id: 3, nome: "Percentual", tipoCampo: "percentual" },
    { id: 4, nome: "Qualitativa", tipoCampo: "alpha" },
    { id: 5, nome: "Neutra / Compensada", tipoCampo: "alpha" },
];

const periodicidades = [
    { id: 1, nome: "Anual" },
    { id: 2, nome: "Semestral" },
    { id: 3, nome: "Trimestral" },
    { id: 4, nome: "Mensal" },
    { id: 5, nome: "Quinzenal" },
    { id: 6, nome: "Semanal" },
    { id: 7, nome: "Diária" },
];

const metricas = [
    { id: 1, nome: "Consumo de água" },
    { id: 2, nome: "Consumo de combustível" },
    { id: 3, nome: "Resíduos" },
    { id: 4, nome: "Emissões de GEE" },
    { id: 5, nome: "Horas de treinamento" },
    { id: 6, nome: "Número de acidentes" },
];

const temas = [
];

const gruposTema = [
    { id: 1, nome: "Meio Ambiente" },
    { id: 2, nome: "Social" },
    { id: 3, nome: "Governança" },
    { id: 4, nome: "Econômico" },
];

// ==============================|| NOVO INDICADOR ||============================== //
function NovoIndicador() {
    const { token } = useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [indicadorDados, setIndicadorDados] = useState(location.state?.indicadorDados || null);

    const [loading, setLoading] = useState(false);
    const [requisicao, setRequisicao] = useState("Criar");
    const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch data if accessed directly by ID
    useEffect(() => {
        const fetchIndicatorData = async () => {
            if (id && !indicadorDados && token) {
                try {
                    setLoading(true);
                    const res = await axios.get(`${API_URL}Indicator/by-code/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (res.data) {
                        setIndicadorDados(res.data);
                    } else {
                        enqueueSnackbar("Indicador não encontrado", { variant: "error" });
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do indicador:", error);
                    enqueueSnackbar("Não foi possível carregar os dados do indicador", { variant: "error" });
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchIndicatorData();
    }, [id, token]);

    // Dynamic select options
    const [unidadesMedida, setUnidadesMedida] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [processos, setProcessos] = useState([]);
    const [riscos, setRiscos] = useState([]);
    const [padroesFrameworks, setPadroesFrameworks] = useState([]);
    const [planosAcao, setPlanosAcao] = useState([]);
    const [temasOptions, setTemasOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!token) return;
            try {
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch for different endpoints in parallel
                const endpoints = [
                    { key: 'units', url: `${API_URL}Measure/enums`, setter: (data) => setUnidadesMedida(data.units || []) },
                    { key: 'collaborators', url: `${API_URL}collaborators`, setter: setColaboradores },
                    { key: 'departments', url: `${API_URL}departments`, setter: setDepartamentos },
                    { key: 'companies', url: `${API_URL}companies`, setter: setEmpresas },
                    { key: 'processes', url: `${API_URL}processes`, setter: setProcessos },
                    { key: 'risks', url: `${API_URL}risks`, setter: setRiscos },
                    { key: 'normatives', url: `${API_URL}normatives`, setter: setPadroesFrameworks },
                    { key: 'action-plans', url: `${API_URL}action-plans`, setter: setPlanosAcao },
                    { key: 'themes', url: `${API_URL}Theme`, setter: setTemasOptions }
                ];

                await Promise.all(endpoints.map(async (ep) => {
                    try {
                        const res = await axios.get(ep.url, { headers });
                        ep.setter(res.data || []);
                    } catch (e) {
                        console.error(`Error fetching ${ep.key}:`, e);
                    }
                }));
            } catch (error) {
                console.error("Error fetching indicator form options:", error);
            }
        };
        fetchOptions();
    }, [token]);

    window.hasChanges = hasChanges;
    window.setHasChanges = setHasChanges;

    const [formData, setFormData] = useState({
        // Campos obrigatórios
        codigoIndicador: "",
        nomeIndicador: "",
        eixoEsg: null,

        // Campos opcionais
        metrica: [],
        tipoMeta: null,
        valorMeta: "",
        planoAcaoMitigacao: [],
        tema: [],
        grupoTema: [],
        unidadeMedida: null,
        formulaCalculo: "",
        fonteDados: "",
        periodicidade: null,
        responsavelInterno: null,
        referenciasPadrao: [],
        meta: "",
        prazoMeta: null,

        // Relacionamentos
        empresaIndicador: [],
        processoIndicador: [],
        departamentoIndicador: [],
        riscoIndicador: [],

        // Campos descritivos
        observacoes: "",
        requisitosObrigatorios: "",
        requisitosSugeridos: "",

        // Radio buttons
        conexao: "offline", // online / offline
        coleta: "manual", // automatico / manual
        natureza: "quantitativo", // quantitativo / qualitativo
        tempoImpacto: "lagging", // leading / lagging
    });

    // Em caso de edição
    useEffect(() => {
        if (indicadorDados) {
            setRequisicao("Editar");
            setMensagemFeedback("editado");

            // Mapper de indicadorDados para formData
            const safeParse = (str) => {
                if (!str) return [];
                try {
                    return str.split(',').map(s => ({ id: isNaN(s) ? s : parseInt(s), nome: s }));
                } catch (e) { return [] }
            };

            const findItem = (list, id, idField) => {
                if (!id) return null;
                return list.find(item => item[idField] === id) || { [idField]: id, name: `ID: ${id}`, active: true }; // active true by default for selected items to avoid filtering
            };

            const mapItems = (list, ids, idField) => {
                if (!ids) return [];
                return ids.map(id => findItem(list, id, idField)).filter(Boolean);
            };

            setFormData({
                codigoIndicador: indicadorDados.indicatorCode || "",
                nomeIndicador: indicadorDados.indicatorName || "",
                eixoEsg: eixosESG.find(e => e.id === indicadorDados.esgAxis) || null,
                metrica: metricas.find(m => m.id === Number(indicadorDados.metric)) ? [metricas.find(m => m.id === Number(indicadorDados.metric))] : safeParse(indicadorDados.metric),
                tipoMeta: tiposMeta.find(t => t.id === Number(indicadorDados.goalType)) || null,
                valorMeta: indicadorDados.goalValue || "",
                planoAcaoMitigacao: mapItems(planosAcao, indicadorDados.actionPlanIds, 'idActionPlan'),
                tema: indicadorDados.theme ? safeParse(indicadorDados.theme) : [],
                grupoTema: [],
                unidadeMedida: findItem(unidadesMedida, indicadorDados.measureUnitId, 'id'),
                formulaCalculo: indicadorDados.calculationFormulaDescription || "",
                fonteDados: indicadorDados.dataSourceDescription || "",
                periodicidade: periodicidades.find(p => p.id === Number(indicadorDados.periodicity)) || null,
                responsavelInterno: findItem(colaboradores, indicadorDados.responsibleId, 'idCollaborator'),
                referenciasPadrao: mapItems(padroesFrameworks, indicadorDados.frameworkIds, 'idNormative'),
                meta: indicadorDados.goalName || "",
                prazoMeta: indicadorDados.goalDeadline ? new Date(indicadorDados.goalDeadline) : null,
                empresaIndicador: mapItems(empresas, indicadorDados.companyIds, 'idCompany'),
                processoIndicador: mapItems(processos, indicadorDados.processIds, 'idProcess'),
                departamentoIndicador: mapItems(departamentos, indicadorDados.departmentIds, 'idDepartment'),
                riscoIndicador: mapItems(riscos, indicadorDados.riskIds, 'idRisk'),
                observacoes: "",
                requisitosObrigatorios: indicadorDados.mandatoryRequirementsDescription || "",
                requisitosSugeridos: indicadorDados.suggestedRequirementsDescription || "",
                conexao: "online",
                coleta: "automatico",
                natureza: "quantitativo",
                tempoImpacto: "lagging",
            });
        }
    }, [indicadorDados, unidadesMedida, colaboradores, departamentos, empresas, processos, riscos, padroesFrameworks, planosAcao, temasOptions]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleRadioChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setHasChanges(true);
    };

    const handleMultiSelectChange = (field) => (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            [field]: newValue
        }));
        setHasChanges(true);
    };

    // Atualizar grupos de tema automaticamente quando temas são selecionados
    useEffect(() => {
        if (formData.tema.length > 0) {
            const gruposUnicos = [...new Set(
                formData.tema.map(tema =>
                    // A API original de Theme pode não ter grupoTema facilmente pareado, mock base para não quebrar:
                    temas.find(t => t.id === tema.id)?.grupoTema || tema.themeGroup || "Econômico"
                ).filter(Boolean)
            )];

            const gruposObj = gruposUnicos.map(nomeGrupo =>
                gruposTema.find(g => g.nome === nomeGrupo)
            ).filter(Boolean);

            setFormData(prev => ({
                ...prev,
                grupoTema: gruposObj
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                grupoTema: []
            }));
        }
    }, [formData.tema]);

    // Lógica para desabilitar valorMeta se tipoMeta for Qualitativa ou Neutra/Compensada
    useEffect(() => {
        if (formData.tipoMeta?.nome === "Qualitativa" || formData.tipoMeta?.nome === "Neutra / Compensada") {
            setFormData(prev => ({
                ...prev,
                valorMeta: ""
            }));
        }
    }, [formData.tipoMeta]);

    // Desabilitar coleta manual quando conexão for online
    useEffect(() => {
        if (formData.conexao === "online") {
            setFormData(prev => ({
                ...prev,
                coleta: "automatico"
            }));
        }
    }, [formData.conexao]);

    const [formValidation, setFormValidation] = useState({
        codigoIndicador: true,
        nomeIndicador: true,
        eixoEsg: true,
    });

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const voltarParaCadastroMenu = () => {
        navigate(-1);
        window.scrollTo(0, 0);
    };

    const continuarEdicao = () => {
        setRequisicao("Editar");
        setSuccessDialogOpen(false);
    };

    const voltarParaListagem = () => {
        setSuccessDialogOpen(false);
        voltarParaCadastroMenu();
    };

    const tratarSubmit = async () => {
        const missingFields = [];

        if (!formData.codigoIndicador.trim()) {
            setFormValidation(prev => ({ ...prev, codigoIndicador: false }));
            missingFields.push("Código do Indicador");
        } else if (formData.codigoIndicador.length > 10) {
            setFormValidation(prev => ({ ...prev, codigoIndicador: false }));
            enqueueSnackbar("O código do indicador deve ter no máximo 10 caracteres!", {
                variant: "error",
            });
            return;
        }

        if (!formData.nomeIndicador.trim()) {
            setFormValidation(prev => ({ ...prev, nomeIndicador: false }));
            missingFields.push("Nome do Indicador");
        }

        if (!formData.eixoEsg) {
            setFormValidation(prev => ({ ...prev, eixoEsg: false }));
            missingFields.push("Eixo ESG");
        }

        if (missingFields.length > 0) {
            const fieldsMessage = missingFields.join(" e ");
            const singularOrPlural = missingFields.length > 1
                ? "são obrigatórios e devem estar válidos!"
                : "é obrigatório e deve estar válido!";
            enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
                variant: "error",
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                indicatorCode: formData.codigoIndicador || null,
                indicatorName: formData.nomeIndicador || null,
                measureUnitId: formData.unidadeMedida ? formData.unidadeMedida.id : null,
                esgAxis: formData.eixoEsg ? formData.eixoEsg.id : 1,
                metric: typeof formData.metrica === "string" ? formData.metrica : (formData.metrica.length > 0 ? formData.metrica.map(x => x.id || x).join(',') : null),
                theme: typeof formData.tema === "string" ? formData.tema : (formData.tema.length > 0 ? formData.tema.map(x => x.id || x).join(',') : null),
                periodicity: formData.periodicidade ? (formData.periodicidade.id ? String(formData.periodicidade.id) : formData.periodicidade) : null,
                responsibleId: formData.responsavelInterno ? String(formData.responsavelInterno.idCollaborator || formData.responsavelInterno.id) : null,
                indicatorType: 1, // DEFAULT type 1 per spec
                calculationFormulaDescription: formData.formulaCalculo || null,
                dataSourceDescription: formData.fonteDados || null,
                mandatoryRequirementsDescription: formData.requisitosObrigatorios || null,
                suggestedRequirementsDescription: formData.requisitosSugeridos || null,
                goalName: formData.meta || null,
                goalType: formData.tipoMeta ? String(formData.tipoMeta.id) : null,
                goalValue: formData.valorMeta || null,
                goalDeadline: formData.prazoMeta ? formData.prazoMeta.toISOString() : null,
                frameworkIds: formData.referenciasPadrao.map(x => String(x.idNormative || x.id || x)),
                companyIds: formData.empresaIndicador.map(x => String(x.idCompany || x.id || x)),
                processIds: formData.processoIndicador.map(x => String(x.idProcess || x.id || x)),
                departmentIds: formData.departamentoIndicador.map(x => String(x.idDepartment || x.id || x)),
                riskIds: formData.riscoIndicador.map(x => String(x.idRisk || x.id || x)),
                actionPlanIds: formData.planoAcaoMitigacao.map(x => String(x.idActionPlan || x.id || x))
            };

            let response;
            if (requisicao === "Criar") {
                response = await fetch(`${API_URL}Indicator`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                payload.id = indicadorDados.id;
                payload.active = indicadorDados.active !== undefined ? indicadorDados.active : true;
                response = await fetch(`${API_URL}Indicator`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            enqueueSnackbar(`Indicador ${mensagemFeedback} com sucesso!`, {
                variant: "success",
            });

            if (requisicao === "Criar") {
                setSuccessDialogOpen(true);
            } else {
                voltarParaCadastroMenu();
            }
        } catch (error) {
            console.error(error.message);
            enqueueSnackbar(`Não foi possível salvar o indicador: ${error.message}`, {
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
                <Grid container spacing={3} marginTop={1}>

                    {/* Seção: Informações Básicas */}
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Informações Básicas do Indicador
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    {/* Riscos do Indicador */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Código do Indicador *</InputLabel>
                            <TextField
                                fullWidth
                                value={formData.codigoIndicador}
                                onChange={(e) => handleInputChange('codigoIndicador', e.target.value)}
                                error={!formData.codigoIndicador && formValidation.codigoIndicador === false}
                                disabled={requisicao === "Editar"}
                                placeholder="Digite o código do indicador (máx. 10 caracteres)"
                                inputProps={{ maxLength: 10 }}
                                helperText="Máximo de 10 caracteres alfanuméricos"
                            />
                        </Stack>
                    </Grid>

                    {/* Nome do Indicador */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Nome do Indicador *</InputLabel>
                            <TextField
                                fullWidth
                                value={formData.nomeIndicador}
                                onChange={(e) => handleInputChange('nomeIndicador', e.target.value)}
                                error={!formData.nomeIndicador && formValidation.nomeIndicador === false}
                                placeholder="Digite o nome do indicador"
                            />
                        </Stack>
                    </Grid>

                    {/* Eixo ESG */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Eixo ESG *</InputLabel>
                            <Autocomplete
                                options={eixosESG}
                                getOptionLabel={(option) => option.nome}
                                value={formData.eixoEsg}
                                onChange={(event, newValue) => handleInputChange('eixoEsg', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={!formData.eixoEsg && formValidation.eixoEsg === false}
                                        placeholder="Selecione o eixo ESG"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Stack>
                    </Grid>

                    {/* Unidade de Medida */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Unidade de Medida</InputLabel>
                            <Autocomplete
                                options={unidadesMedida.filter(u => u.active !== false || (formData.unidadeMedida && u.id === formData.unidadeMedida.id))}
                                getOptionLabel={(option) => option.name || ""}
                                value={unidadesMedida.find(u => u.id === formData.unidadeMedida?.id) || formData.unidadeMedida}
                                onChange={(event, newValue) => handleInputChange('unidadeMedida', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione a unidade de medida" />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Stack>
                    </Grid>

                    {/* Métricas */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Métrica</InputLabel>
                            <Autocomplete
                                multiple
                                options={metricas}
                                getOptionLabel={(option) => option.nome || ""}
                                value={formData.metrica}
                                onChange={handleMultiSelectChange('metrica')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione as métricas relacionadas" />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Box
                                            key={option.id}
                                            component="span"
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '4px 8px',
                                                margin: '2px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                            {...getTagProps({ index })}
                                        >
                                            {option.nome}
                                        </Box>
                                    ))
                                }
                            />
                        </Stack>
                    </Grid>

                    {/* Temas */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Temas</InputLabel>
                            <Autocomplete
                                multiple
                                options={temasOptions}
                                getOptionLabel={(option) => option.themeName || option.nomeTema || option.nome || option.id || "Sem nome"}
                                value={formData.tema.map(t => temasOptions.find(opt => opt.id === (t.id || t)) || { id: t.id || t, themeName: t.themeName || t.nome || t })}
                                onChange={handleMultiSelectChange('tema')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Pesquise e selecione os temas relacionados" />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === (value.id || value)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Box
                                            key={option.id}
                                            component="span"
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '4px 8px',
                                                margin: '2px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                            {...getTagProps({ index })}
                                        >
                                            {option.themeName || option.nomeTema || option.nome || option.id}
                                        </Box>
                                    ))
                                }
                            />
                        </Stack>
                    </Grid>

                    {/* Grupos de Tema (automático) */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Grupos de Tema (Automático)</InputLabel>
                            <TextField
                                fullWidth
                                value={formData.grupoTema.map(g => g.nome).join(', ')}
                                InputProps={{ readOnly: true }}
                                placeholder="Grupos são definidos automaticamente pelos temas selecionados"
                                helperText="Este campo é preenchido automaticamente com base nos temas selecionados"
                            />
                        </Stack>
                    </Grid>

                    {/* Periodicidade */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Periodicidade</InputLabel>
                            <Autocomplete
                                options={periodicidades}
                                getOptionLabel={(option) => option.nome || ""}
                                value={formData.periodicidade}
                                onChange={(event, newValue) => handleInputChange('periodicidade', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione a periodicidade de coleta" />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Stack>
                    </Grid>

                    {/* Responsável Interno */}
                    <Grid item xs={12} md={12}>
                        <Stack spacing={1}>
                            <InputLabel>Responsável Interno</InputLabel>
                            <Autocomplete
                                options={colaboradores.filter(c => c.active !== false || (formData.responsavelInterno && c.idCollaborator === formData.responsavelInterno.idCollaborator))}
                                getOptionLabel={(option) => option.name || ""}
                                value={colaboradores.find(c => c.idCollaborator === formData.responsavelInterno?.idCollaborator) || formData.responsavelInterno}
                                onChange={(event, newValue) => handleInputChange('responsavelInterno', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione o responsável interno" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idCollaborator === value.idCollaborator}
                            />
                        </Stack>
                    </Grid>

                    {/* Conexão */}
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Tipo do indicador</FormLabel>
                            <RadioGroup
                                row
                                value={formData.conexao}
                                onChange={handleRadioChange('conexao')}
                            >
                                <FormControlLabel value="online" control={<Radio />} label="Padrão" />
                                <FormControlLabel value="offline" control={<Radio />} label="Próprio" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {/* Coleta */}
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Habilitado</FormLabel>
                            <RadioGroup
                                row
                                value={formData.coleta}
                                onChange={handleRadioChange('coleta')}
                            >
                                <FormControlLabel
                                    value="automatico"
                                    control={<Radio />}
                                    label="Sim"
                                />
                                <FormControlLabel
                                    value="manual"
                                    control={<Radio />}
                                    label="Não"
                                    disabled={formData.conexao === "online"}
                                />
                            </RadioGroup>
                            {formData.conexao === "online" && (
                                <Typography variant="caption" color="textSecondary">
                                    Coleta manual desabilitada para conexão online
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Seção: Descrições e Fórmulas */}
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Descrições e Fórmulas
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    {/* Fórmula de Cálculo */}
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <InputLabel>Fórmula de Cálculo</InputLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.formulaCalculo}
                                onChange={(e) => handleInputChange('formulaCalculo', e.target.value)}
                                placeholder="Descreva a fórmula de cálculo do indicador (máx. 500 caracteres)"
                                inputProps={{ maxLength: 500 }}
                                helperText={`${formData.formulaCalculo.length}/500 caracteres`}
                            />
                        </Stack>
                    </Grid>

                    {/* Fonte de Dados */}
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <InputLabel>Fonte de Dados</InputLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.fonteDados}
                                onChange={(e) => handleInputChange('fonteDados', e.target.value)}
                                placeholder="Descreva a fonte de dados do indicador (máx. 500 caracteres)"
                                inputProps={{ maxLength: 500 }}
                                helperText={`${formData.fonteDados.length}/500 caracteres`}
                            />
                        </Stack>
                    </Grid>

                    {/* Observações */}
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <InputLabel>Requisitos obrigatórios</InputLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={formData.requisitosObrigatorios}
                                onChange={(e) => handleInputChange('requisitosObrigatorios', e.target.value)}
                                inputProps={{ maxLength: 500 }}
                                helperText={`${formData.requisitosObrigatorios.length}/500 caracteres`}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <InputLabel>Requisitos sugeridos</InputLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={formData.requisitosSugeridos}
                                onChange={(e) => handleInputChange('requisitosSugeridos', e.target.value)}
                                inputProps={{ maxLength: 500 }}
                                helperText={`${formData.requisitosSugeridos.length}/500 caracteres`}
                            />
                        </Stack>
                    </Grid>

                    {/* Seção: Metas e Prazos */}
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Metas e Prazos
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    {/* Nome da Meta */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Nome da Meta</InputLabel>
                            <TextField
                                fullWidth
                                value={formData.meta}
                                onChange={(e) => handleInputChange('meta', e.target.value)}
                                placeholder="Digite o nome da meta (máx. 200 caracteres)"
                                inputProps={{ maxLength: 200 }}
                                helperText={`${formData.meta.length}/200 caracteres`}
                            />
                        </Stack>
                    </Grid>

                    {/* Tipo de Meta */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Tipo de Meta</InputLabel>
                            <Autocomplete
                                options={tiposMeta}
                                getOptionLabel={(option) => option.nome}
                                value={formData.tipoMeta}
                                onChange={(event, newValue) => handleInputChange('tipoMeta', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione o tipo de meta" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Valor da Meta */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Valor da Meta</InputLabel>
                            <TextField
                                fullWidth
                                value={formData.valorMeta}
                                onChange={(e) => handleInputChange('valorMeta', e.target.value)}
                                placeholder="Digite o valor da meta (ou deixe em branco para metas qualitativas)"
                                disabled={formData.tipoMeta?.nome === "Qualitativa" || formData.tipoMeta?.nome === "Neutra / Compensada"}
                                helperText={
                                    formData.tipoMeta?.nome === "Qualitativa" || formData.tipoMeta?.nome === "Neutra / Compensada"
                                        ? "Campo desabilitado para metas qualitativas ou neutras/compensadas"
                                        : `Tipo de campo esperado: ${formData.tipoMeta?.tipoCampo || 'Alfanumérico'}`
                                }
                            />
                        </Stack>
                    </Grid>

                    {/* Prazo da Meta */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Prazo da Meta</InputLabel>
                            <DatePicker
                                value={formData.prazoMeta}
                                onChange={(newValue) => handleInputChange('prazoMeta', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione o prazo para atendimento da meta" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Seção: Padrões e Frameworks */}
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Padrões e Frameworks
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    {/* Referências de Padrão */}
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <InputLabel>Referências de Padrão/Framework</InputLabel>
                            <Autocomplete
                                multiple
                                options={padroesFrameworks.filter(p => p.active !== false || formData.referenciasPadrao.some(sel => sel.idNormative === p.idNormative))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.referenciasPadrao}
                                onChange={handleMultiSelectChange('referenciasPadrao')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os padrões/frameworks relacionados" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idNormative === value.idNormative}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Box
                                            key={option.id}
                                            component="span"
                                            sx={{
                                                backgroundColor: '#f3e5f5',
                                                color: '#7b1fa2',
                                                padding: '4px 8px',
                                                margin: '2px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                            {...getTagProps({ index })}
                                        >
                                            {option.name || option.nome}
                                        </Box>
                                    ))
                                }
                            />
                        </Stack>
                    </Grid>

                    {/* Seção: Relacionamentos */}
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Relacionamentos
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    {/* Empresas */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Empresas Relacionadas</InputLabel>
                            <Autocomplete
                                multiple
                                options={empresas.filter(e => e.active !== false || formData.empresaIndicador.some(sel => sel.idCompany === e.idCompany))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.empresaIndicador}
                                onChange={handleMultiSelectChange('empresaIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione as empresas relacionadas" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idCompany === value.idCompany}
                            />
                        </Stack>
                    </Grid>

                    {/* Processos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Processos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={processos.filter(p => p.active !== false || formData.processoIndicador.some(sel => sel.idProcess === p.idProcess))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.processoIndicador}
                                onChange={handleMultiSelectChange('processoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os processos relacionados" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idProcess === value.idProcess}
                            />
                        </Stack>
                    </Grid>

                    {/* Departamentos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Departamentos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={departamentos.filter(d => d.active !== false || formData.departamentoIndicador.some(sel => sel.idDepartment === d.idDepartment))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.departamentoIndicador}
                                onChange={handleMultiSelectChange('departamentoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os departamentos relacionados" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idDepartment === value.idDepartment}
                            />
                        </Stack>
                    </Grid>

                    {/* Riscos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Riscos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={riscos.filter(r => r.active !== false || formData.riscoIndicador.some(sel => sel.idRisk === r.idRisk))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.riscoIndicador}
                                onChange={handleMultiSelectChange('riscoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os riscos relacionados" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idRisk === value.idRisk}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Plano de Ação/Mitigação</InputLabel>
                            <Autocomplete
                                multiple
                                options={planosAcao.filter(p => p.active !== false || formData.planoAcaoMitigacao.some(sel => sel.idActionPlan === p.idActionPlan))}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.planoAcaoMitigacao}
                                onChange={handleMultiSelectChange('planoAcaoMitigacao')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione ou crie planos de ação/mitigacao" />
                                )}
                                isOptionEqualToValue={(option, value) => option.idActionPlan === value.idActionPlan}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Box
                                            key={option.idActionPlan}
                                            component="span"
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '4px 8px',
                                                margin: '2px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                            {...getTagProps({ index })}
                                        >
                                            {option.name || option.nome}
                                        </Box>
                                    ))
                                }
                            />
                        </Stack>
                    </Grid>

                    {/* Botões de Ação */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={voltarParaCadastroMenu}
                                size="large"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={tratarSubmit}
                                size="large"
                                disabled={loading || (requisicao === "Editar" ? !hasChanges : !(formData.codigoIndicador?.trim() && formData.nomeIndicador?.trim() && formData.unidadeMedida && formData.responsavel))}
                            >
                                {requisicao === "Criar" ? "Cadastrar Indicador" : "Salvar Alterações"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Dialog de Sucesso */}
                <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
                    <DialogTitle>
                        <Box display="flex" alignItems="center">
                            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                            Indicador Cadastrado com Sucesso!
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            O indicador foi cadastrado com sucesso. Deseja continuar editando ou voltar para a listagem?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={continuarEdicao} color="primary">
                            Continuar Editando
                        </Button>
                        <Button onClick={voltarParaListagem} color="primary" variant="contained">
                            Voltar para Listagem
                        </Button>
                    </DialogActions>
                </Dialog>
            </LocalizationProvider>
        </>
    );
}

export default NovoIndicador;

