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
import { useLocation } from "react-router-dom";
import { useToken } from "../../../api/TokenContext";

// Dados mock para os selects
const metricas = [
    { id: 1, nome: "Consumo de água" },
    { id: 2, nome: "Consumo de combustível" },
    { id: 3, nome: "Resíduos" },
    { id: 4, nome: "Emissões de GEE" },
    { id: 5, nome: "Horas de treinamento" },
    { id: 6, nome: "Número de acidentes" },
];

const tiposMeta = [
    { id: 1, nome: "Absoluta (ou total)", tipoCampo: "numérico" },
    { id: 2, nome: "Intensiva (ou relativa)", tipoCampo: "percentual" },
    { id: 3, nome: "Percentual", tipoCampo: "percentual" },
    { id: 4, nome: "Qualitativa", tipoCampo: "alpha" },
    { id: 5, nome: "Neutra / Compensada", tipoCampo: "alpha" },
];

const planosAcao = [
    { id: 1, nome: "Plano de Mitigação de Risco A" },
    { id: 2, nome: "Plano de Redução de Emissões B" },
    { id: 3, nome: "Plano de Treinamento C" },
    { id: 4, nome: "Plano de Compliance D" },
];

const eixosESG = [
    { id: 1, nome: "Ambiental" },
    { id: 2, nome: "Social" },
    { id: 3, nome: "Governança" },
];

const temas = [
    { id: 1, nome: "Mudanças Climáticas", grupoTema: "Meio Ambiente" },
    { id: 2, nome: "Biodiversidade", grupoTema: "Meio Ambiente" },
    { id: 3, nome: "Gestão de Resíduos", grupoTema: "Meio Ambiente" },
    { id: 4, nome: "Direitos Humanos", grupoTema: "Social" },
    { id: 5, nome: "Diversidade e Inclusão", grupoTema: "Social" },
    { id: 6, nome: "Saúde e Segurança", grupoTema: "Social" },
    { id: 7, nome: "Ética Empresarial", grupoTema: "Governança" },
    { id: 8, nome: "Transparência", grupoTema: "Governança" },
    { id: 9, nome: "Compliance", grupoTema: "Governança" },
];

const gruposTema = [
    { id: 1, nome: "Meio Ambiente" },
    { id: 2, nome: "Social" },
    { id: 3, nome: "Governança" },
    { id: 4, nome: "Econômico" },
];

const unidadesMedida = [
    { id: 1, nome: "Percentual (%)" },
    { id: 2, nome: "Toneladas (t)" },
    { id: 3, nome: "Quilogramas (kg)" },
    { id: 4, nome: "Litros (L)" },
    { id: 5, nome: "Metros cúbicos (m³)" },
    { id: 6, nome: "Quilowatt-hora (kWh)" },
    { id: 7, nome: "Número absoluto" },
    { id: 8, nome: "Reais (R$)" },
    { id: 9, nome: "Horas" },
    { id: 10, nome: "Dias" },
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

const colaboradores = [
    { id: 1, nome: "Ana Silva - Sustentabilidade" },
    { id: 2, nome: "Carlos Santos - Meio Ambiente" },
    { id: 3, nome: "Maria Oliveira - Recursos Humanos" },
    { id: 4, nome: "João Pereira - Compliance" },
    { id: 5, nome: "Fernanda Costa - Qualidade" },
    { id: 6, nome: "Roberto Lima - Operações" },
];

const padroesFrameworks = [
    { id: 1, nome: "GRI Standards" },
    { id: 2, nome: "SASB" },
    { id: 3, nome: "TCFD" },
    { id: 4, nome: "CDP" },
    { id: 5, nome: "UN Global Compact" },
    { id: 6, nome: "ISO 14001" },
    { id: 7, nome: "ISO 45001" },
    { id: 8, nome: "OHSAS 18001" },
];

const empresas = [
    { id: 1, nome: "Matriz - São Paulo" },
    { id: 2, nome: "Filial - Rio de Janeiro" },
    { id: 3, nome: "Filial - Belo Horizonte" },
    { id: 4, nome: "Subsidiária - Brasília" },
    { id: 5, nome: "Unidade - Salvador" },
];

const processos = [
    { id: 1, nome: "Gestão Ambiental" },
    { id: 2, nome: "Gestão de Pessoas" },
    { id: 3, nome: "Produção Industrial" },
    { id: 4, nome: "Logística e Distribuição" },
    { id: 5, nome: "Compras e Suprimentos" },
    { id: 6, nome: "Vendas e Marketing" },
    { id: 7, nome: "Financeiro e Controladoria" },
];

const departamentos = [
    { id: 1, nome: "Sustentabilidade" },
    { id: 2, nome: "Meio Ambiente" },
    { id: 3, nome: "Recursos Humanos" },
    { id: 4, nome: "Produção" },
    { id: 5, nome: "Qualidade" },
    { id: 6, nome: "Compliance" },
    { id: 7, nome: "Operações" },
    { id: 8, nome: "Financeiro" },
];

const riscos = [
    { id: 1, nome: "Mudanças Climáticas" },
    { id: 2, nome: "Escassez de Recursos Naturais" },
    { id: 3, nome: "Poluição Ambiental" },
    { id: 4, nome: "Acidentes de Trabalho" },
    { id: 5, nome: "Violação de Direitos Humanos" },
    { id: 6, nome: "Corrupção e Suborno" },
    { id: 7, nome: "Não Conformidade Regulatória" },
    { id: 8, nome: "Reputacional" },
];

// ==============================|| NOVO INDICADOR ||============================== //
function NovoIndicador() {
    const { token } = useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { indicadorDados } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [requisicao, setRequisicao] = useState("Criar");
    const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
    const [indicadorEsgDados, setIndicadorEsgDados] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

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
            // Aqui você carregaria os dados do indicador para edição
            // setFormData com os dados existentes
        }
    }, [indicadorDados]);

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
                    temas.find(t => t.id === tema.id)?.grupoTema
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

            // Simular requisição para API
            await new Promise(resolve => setTimeout(resolve, 1000));

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
            enqueueSnackbar("Não foi possível salvar o indicador.", {
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
                            />
                        </Stack>
                    </Grid>

                    {/* Unidade de Medida */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Unidade de Medida</InputLabel>
                            <Autocomplete
                                options={unidadesMedida}
                                getOptionLabel={(option) => option.nome}
                                value={formData.unidadeMedida}
                                onChange={(event, newValue) => handleInputChange('unidadeMedida', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione a unidade de medida" />
                                )}
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
                                getOptionLabel={(option) => option.nome}
                                value={formData.metrica}
                                onChange={handleMultiSelectChange('metrica')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione as métricas relacionadas" />
                                )}
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
                                options={temas}
                                getOptionLabel={(option) => option.nome}
                                value={formData.tema}
                                onChange={handleMultiSelectChange('tema')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os temas relacionados" />
                                )}
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
                                getOptionLabel={(option) => option.nome}
                                value={formData.periodicidade}
                                onChange={(event, newValue) => handleInputChange('periodicidade', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione a periodicidade de coleta" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Responsável Interno */}
                    <Grid item xs={12} md={12}>
                        <Stack spacing={1}>
                            <InputLabel>Responsável Interno</InputLabel>
                            <Autocomplete
                                options={colaboradores}
                                getOptionLabel={(option) => option.nome}
                                value={formData.responsavelInterno}
                                onChange={(event, newValue) => handleInputChange('responsavelInterno', newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione o responsável interno" />
                                )}
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
                                options={padroesFrameworks}
                                getOptionLabel={(option) => option.nome}
                                value={formData.referenciasPadrao}
                                onChange={handleMultiSelectChange('referenciasPadrao')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os padrões/frameworks relacionados" />
                                )}
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
                                            {option.nome}
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
                                options={empresas}
                                getOptionLabel={(option) => option.nome}
                                value={formData.empresaIndicador}
                                onChange={handleMultiSelectChange('empresaIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione as empresas relacionadas" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Processos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Processos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={processos}
                                getOptionLabel={(option) => option.nome}
                                value={formData.processoIndicador}
                                onChange={handleMultiSelectChange('processoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os processos relacionados" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Departamentos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Departamentos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={departamentos}
                                getOptionLabel={(option) => option.nome}
                                value={formData.departamentoIndicador}
                                onChange={handleMultiSelectChange('departamentoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os departamentos relacionados" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    {/* Riscos */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Riscos Relacionados</InputLabel>
                            <Autocomplete
                                multiple
                                options={riscos}
                                getOptionLabel={(option) => option.nome}
                                value={formData.riscoIndicador}
                                onChange={handleMultiSelectChange('riscoIndicador')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione os riscos relacionados" />
                                )}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <InputLabel>Plano de Ação/Mitigação</InputLabel>
                            <Autocomplete
                                multiple
                                options={planosAcao}
                                getOptionLabel={(option) => option.nome}
                                value={formData.planoAcaoMitigacao}
                                onChange={handleMultiSelectChange('planoAcaoMitigacao')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecione ou crie planos de ação/mitigação" />
                                )}
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
                                disabled={loading}
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

