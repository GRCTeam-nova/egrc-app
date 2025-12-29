import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, IconButton, Typography, Select, MenuItem, Autocomplete, Switch, TextField, Button, ToggleButton, ToggleButtonGroup, Stack, InputLabel, Grid
} from '@mui/material';
import {  API_COMMAND } from '../../config';
import MainCard from '../../components/MainCard';
import InputMask from 'react-input-mask';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';
import { usePartesAdversas } from '../apps/processos/PartesAdversasContext';
import { enqueueSnackbar } from 'notistack';



function validaCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove tudo o que não é dígito
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
        return false;
    }

    var soma = 0;
    var resto;

    for (var i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    soma = 0;

    for (var i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
    }

    return true;
}

function validaEmail(email) {
    const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexEmail.test(String(email).toLowerCase());
}

function validaCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj === '' || cnpj.length !== 14)
        return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0)))
        return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1)))
        return false;

    return true;
}


function CustomDrawer({ isOpen, toggleDrawer, title }) {
    const [key, setKey] = useState(Date.now());
    const { atualizarPartesAdversas } = usePartesAdversas();

    // ...

    // Função que atualiza a chave para um novo valor baseado no tempo atual
    const resetDrawer = () => {
        setKey(Date.now());
    };
    const [personType, setPersonType] = useState('Física');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpfValido, setCpfValido] = useState(true);
    const [email, setEmail] = useState('');
    const [emailValido, setEmailValido] = useState(true);
    const [cepValido, setCepValido] = useState(true);
    const [cnpj, setCnpj] = useState('');
    const [cnpjValido, setCnpjValido] = useState(true);
    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [pais, setPais] = useState('');
    const [numero, setNumero] = useState('');
    const [cep, setCep] = useState('');
    const [nome, setNome] = useState('');
    const [ruaValida, setRuaValida] = useState(true);
    const [complemento, setComplemento] = useState('');
    const [idIdentificacao, setIdIdentificacao] = useState('');
    const [orgao, setOrgao] = useState('');
    const [observacoes, setObservacoes] = useState('');



    const [formData, setFormData] = useState({
        uf: [], orgao: [], dataInicio: null, dataFim: null, cliente: [], estado: [],
        area: [], segmento: [], status: [], tag: [], advogado: [], fase: [], evento: '', usuario: [],
        nomeFiltro: [], salvarFiltro: false, filtro: [],
    });
    const [ufs, setUfs] = useState([]);
    const [estados, setEstados] = useState([]);

    // Função para carregar os dados das APIs
    const fetchData = async (url, setState) => {
        try {
            const response = await axios.get(url);
            setState(response.data);
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchData('http://10.0.72.13:5020/api/Uf', setUfs);
        fetchData('http://10.0.72.13:5020/api/Estado', setEstados);
    }, []);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (field === 'uf') {
            setUfValida(value != null);
        }

    };

    const handlePersonType = (event, newPersonType) => {
        if (newPersonType !== null && newPersonType !== personType) {
            setPersonType(newPersonType);
            setSubmitted(false);
            setKey(prevKey => prevKey + 1); // Isso irá resetar o componente
            resetDrawer();
            setCpf('');
            setCep('');
            setTelefone('');
            setCnpj('');
            setOrgao('');
            setEmail('');
            setNumero('')
            setComplemento('')
            setPais('')
            setNome('')
            setIdIdentificacao('')
            setRazaoSocial('')
            setNomeFantasia('')
            formData.cidade = '';
            formData.rua = '';
            formData.estado = '';

            // Resetando a validação
            setCpfValido(true);
            setEmailValido(true);
            setCnpjValido(true);
        }
    };

    // Adicione esta função no manipulador de mudanças do CNPJ
    const handleCnpjChange = (event) => {
        const novoCNPJ = event.target.value;
        setCnpj(novoCNPJ);
        // Verifica se o campo CNPJ está vazio antes de validar
        setCnpjValido(novoCNPJ === '' || validaCNPJ(novoCNPJ));
    };

    const [ufValida, setUfValida] = useState(true);

    const handleCpfChange = (event) => {
        const novoCPF = event.target.value;
        setCpf(novoCPF);
        // Verifica se o campo CPF está vazio antes de validar
        setCpfValido(novoCPF === '' || validaCPF(novoCPF));
    };

    const handleEmailChange = (event) => {
        const novoEmail = event.target.value;
        setEmail(novoEmail);
        // Verifica se o campo email está vazio antes de validar
        setEmailValido(novoEmail === '' || validaEmail(novoEmail));

    };

    // Para lidar com as mudanças nos inputs
    const handleNomeChange = (event) => {
        setNome(event.target.value);
    };

    const handleComplementoChange = (event) => {
        setComplemento(event.target.value);
    };

    const handleIdIdentificacaoChange = (event) => {
        setIdIdentificacao(event.target.value);
    };

    const handleOrgaoChange = (event) => {
        setOrgao(event.target.value);
    };

    const handleObservacoesChange = (event) => {
        setObservacoes(event.target.value);
    };

    const handleNumeroChange = (event) => {
        // Apenas números serão mantidos no campo 'Número'
        const apenasNumeros = event.target.value.replace(/\D/g, '');
        setNumero(apenasNumeros);
    };

    const handlePais = (event) => {
        setPais(event.target.value);
    };

    useEffect(() => {
        if (!isOpen) {
            // Limpe os campos aqui
            setSubmitted(false);
            setKey(prevKey => prevKey + 1); // Isso irá resetar o componente
            resetDrawer();
            setCpf('');
            setCep('');
            setTelefone('');
            setCnpj('');
            setOrgao('');
            setEmail('');
            setNumero('')
            setComplemento('')
            setPais('')
            setNome('');
            setIdIdentificacao('')
            setRazaoSocial('')
            setNomeFantasia('')
            formData.cidade = '';
            formData.rua = '';
            formData.estado = '';

            // Resetando a validação
            setCpfValido(true);
            setEmailValido(true);
            setCnpjValido(true);
        }
    }, [isOpen]);


    const handleTelefoneChange = (event) => {
        let valor = event.target.value.replace(/\D/g, '');

        // Aplicando a máscara
        if (valor.length <= 10) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
        }

        setTelefone(valor);
    };

    function isCepValido(cep) {
        // CEP válido deve ter 9 caracteres (incluindo o hífen)
        return cep.length === 9;
    }

    function isTelefoneValido(telefone) {
        if (personType === 'Jurídica') {
            // Para pessoa jurídica, o telefone é obrigatório se começar a ser preenchido
            return telefone.length === 15 || telefone.length === 0;
        }
        return telefone.length === 15;
    }

    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitted(true);

        let formValid = true;
        const duration = 5;

        // Verificações para campos comuns a todos os tipos de pessoa
        if (!nome) {
            formValid = false;
            enqueueSnackbar('Nome é obrigatório.', { variant: 'error' });
        }


        if (!cep) {
            formValid = false;
            enqueueSnackbar('CEP é obrigatório.', { variant: 'error' });
        } else if (!cepValido) {
            formValid = false;
            enqueueSnackbar('CEP inválido.', { variant: 'error' });
        }
        if (!formData.rua) {
            formValid = false;
            enqueueSnackbar('Rua é obrigatória.', { variant: 'error' });
        }
        if (!pais) {
            formValid = false;
            enqueueSnackbar('País é obrigatório.', { variant: 'error' });
        }
        if (!formData.estado || !formData.estado.id) {
            formValid = false;
            enqueueSnackbar('Estado é obrigatório.', { variant: 'error' });
        }
        if (!formData.cidade) {
            formValid = false;
            enqueueSnackbar('Cidade é obrigatória.', { variant: 'error' });
        }

        // Verificações específicas para pessoa física e jurídica
        if (personType === 'Física') {
            if (!cpf) {
                formValid = false;
                enqueueSnackbar('CPF é obrigatório.', { variant: 'error' });
            } else if (!cpfValido) {
                formValid = false;
                enqueueSnackbar('CPF inválido.', { variant: 'error' });
            }
            if (!idIdentificacao) {
                formValid = false;
                enqueueSnackbar('ID de Identificação é obrigatório.', { variant: 'error' });
            }
            if (!telefone) {
                formValid = false;
                enqueueSnackbar('Telefone é obrigatório.', { variant: 'error' });
            }
            if (!orgao) {
                formValid = false;
                enqueueSnackbar('Órgão é obrigatório.', { variant: 'error' });
            }
            if (!email) {
                formValid = false;
                enqueueSnackbar('Email é obrigatório.', { variant: 'error' });
            } else if (!emailValido) {
                formValid = false;
                enqueueSnackbar('Email inválido.', { variant: 'error' });
            }
            if (!formData.uf) {
                formValid = false;
                enqueueSnackbar('UF é obrigatório.', { variant: 'error' });
            }
        } else if (personType === 'Jurídica') {
            if (!cnpj) {
                formValid = false;
                enqueueSnackbar('CNPJ é obrigatório.', { variant: 'error' });
            } else if (!cnpjValido) {
                formValid = false;
                enqueueSnackbar('CNPJ inválido.', { variant: 'error' });
            }
            if (!razaoSocial) {
                formValid = false;
                enqueueSnackbar('Razão Social é obrigatória.', { variant: 'error' });
            }
            if (!nomeFantasia) {
                formValid = false;
                enqueueSnackbar('Nome Fantasia é obrigatório.', { variant: 'error' });
            }
        }

        if (!formValid) {
            return;
        }

        // Verificar se a UF foi selecionada para pessoa física
        if (personType === 'Física' && (!formData.uf || formData.uf.length === 0)) {
            setUfValida(false);
            return; // Interrompe o envio do formulário
        }
        if (!formData.estado || !formData.estado.id) {
            // Se nenhum estado estiver selecionado, não continue com o envio
            return;
        }

        // Verificar se CEP e Telefone estão completamente preenchidos
        if (!isCepValido(cep)) {
            enqueueSnackbar('CEP não está completamente preenchido.', { variant: 'error' })
            return;
        }

        if (!cepValido) {
            enqueueSnackbar('CEP inválido. Por favor, verifique o número informado.', { variant: 'error' })
            return;
        }

        if (!isTelefoneValido(telefone)) {
            enqueueSnackbar('Telefone não está completamente preenchido.', { variant: 'error' });
            return;
        }


        if (personType === 'Física' && !cpfValido) {
            alert('CPF inválido. Por favor, verifique o número informado.');
            return;
        }

        if (!emailValido) {
            enqueueSnackbar('Email inválido. Por favor, verifique o endereço de email informado.', { variant: 'error' });
            return;
        }

        // Validação adicional para a rua
        const isRuaValida = formData.rua && formData.rua.trim() !== '';
        setRuaValida(isRuaValida);
        if (!isRuaValida) {
            return; // Interrompe o envio do formulário
        }

        // Preparando os dados para o envio
        const dataToSend = {
            tipoPessoaId: personType === 'Física' ? 0 : 1,
            nome: nome, // ok 
            cpf: cpf, // Usado apenas para pessoa física // ok
            email: email, // ok
            telefone: telefone, // ok
            idIdentificacao: idIdentificacao, // ok
            orgao: orgao, // ok
            estadoId: formData.estado ? formData.estado.id : null, // ok
            observacoes: observacoes, // ok
            endereco: {
                cep: cep, // ok
                rua: formData.rua, // ok
                numero: numero, // ok
                complemento: complemento, // ok
                cidade: formData.cidade, // ok
                estadoId: formData.estado ? formData.estado.id : null, // ok
                pais: pais // ok
            },
            empresa: personType === 'Jurídica' ? {
                cnpj: cnpj,
                razaoSocial: razaoSocial,
                nomeFantasia: nomeFantasia
            } : null
        };

        try {
            const response = await fetch(`${API_COMMAND}/api/Parte/Criar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });   
            if (!response.ok) {
                const errorBody = await response.text();
                console.log(errorBody)
            }
            toggleDrawer(false);
            await atualizarPartesAdversas();
            enqueueSnackbar('Cadastro efetuado com sucesso.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao realizar o cadastro. Tente novamente mais tarde.', { variant: 'error' });
        }
    };
    const buttonStyle1 = {
        width: '61px',
        height: '75px',
        borderRadius: '4px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        marginRight: '20px', // Adiciona margem para separar os botões
        '&.Mui-selected, &.Mui-selected:hover': {
            color: '#1C5297', // Cor da fonte para o botão selecionado
            backgroundColor: '#1C52971A', // Cor de fundo para o botão selecionado

        },
        // Cor da fonte e ícones para estado não selecionado
        color: '#1C5297',
        '& .MuiSvgIcon-root': {
            color: '#1C5297', // Cor dos ícones
        },
    };

    const buttonStyle2 = {
        width: '61px',
        height: '75px',
        borderRadius: '4px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: '#1C5297', // Cor da fonte para o botão selecionado
            backgroundColor: '#1C52971A', // Cor de fundo para o botão selecionado

        },
        // Cor da fonte e ícones para estado não selecionado
        color: '#1C5297',
        '& .MuiSvgIcon-root': {
            color: '#1C5297', // Cor dos ícones
        },
    };

    const formatarCep = (cep) => {
        if (cep.length === 8) {
            return `${cep.slice(0, 5)}-${cep.slice(5)}`;
        }
        return cep;
    };


    const handleCepChange = async (event) => {
        const cep = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        setCep(formatarCep(cep)); // Atualiza o estado com o CEP formatado

        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.data.erro) {
                    setCepValido(true); // CEP válido

                    const siglaParaNome = {
                        "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
                        "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
                        "GO": "Goiás", "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
                        "MG": "Minas Gerais", "PA": "Pará", "PB": "Paraíba", "PR": "Paraná",
                        "PE": "Pernambuco", "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
                        "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina",
                        "SP": "São Paulo", "SE": "Sergipe", "TO": "Tocantins"
                        // Certifique-se de que todas as siglas estão mapeadas
                    };

                    const nomeEstado = siglaParaNome[response.data.uf];
                    const estadoCorrespondente = estados.find(estado => estado.nome === nomeEstado);

                    setFormData({
                        ...formData,
                        rua: response.data.logradouro,
                        bairro: response.data.bairro,
                        cidade: response.data.localidade,
                        estado: estadoCorrespondente // aqui você atualiza o objeto de estado completo
                        // ... outros campos
                    });
                } else {
                    setCepValido(false); // CEP inválido
                }
            } catch (error) {
                setCepValido(false); // Erro ao buscar CEP
            }
        } else {
            setCepValido(cep.length <= 8); // CEP é válido se tiver até 8 dígitos
            // Limpeza dos campos relacionados ao CEP
            if (cep.length < 8) {
                setFormData({
                    ...formData,
                    rua: '',
                    bairro: '',
                    cidade: '',
                    estado: {},
                    // ... outros campos
                });
            }
        }
    };

    return (
        <>
            <Drawer key={key} anchor="right" open={isOpen} onClose={() => toggleDrawer(false)}>
                <MainCard
                    title="Cadastrar Parte"
                    sx={{
                        border: 'none',
                        borderRadius: 0,
                        height: '100vh',
                        '& .MuiCardHeader-root': { color: 'background.paper', bgcolor: 'primary.main', '& .MuiTypography-root': { fontSize: '1rem' } }
                    }}
                    secondary={
                        <IconButton onClick={() => toggleDrawer(false)} shape="rounded" size="small" sx={{ color: 'background.paper' }}>
                            <CloseIcon style={{ fontSize: '1.15rem' }} />
                        </IconButton>
                    }
                >

                    <Box
                        sx={{
                            display: 'flex', // Usa Flexbox
                            flexDirection: 'column', // Organiza os filhos em uma coluna
                            justifyContent: 'space-between', // Espaço entre os filhos
                            width: 700,
                            padding: 0,
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 100px)', // Ajuste conforme necessário
                            paddingRight: '10px',
                            boxSizing: 'border-box',
                        }}
                        role="presentation"
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                            component="div"
                            sx={{
                                color: '#1B1464CC',
                                fontSize: '18px',
                                fontStyle: 'normal',
                                fontWeight: 600,
                                lineHeight: 'normal',
                                marginTop: '10px', marginBottom: '20px'
                            }}
                        >
                            {title}
                        </Typography>

                        <Box sx={{ marginBottom: '16px' }}>
                            <ToggleButtonGroup
                                exclusive
                                value={personType}
                                onChange={handlePersonType}

                                aria-label="Tipo de pessoa"
                            >
                                <ToggleButton value="Física" aria-label="Física" sx={buttonStyle1}>
                                    <PersonIcon />
                                    Física
                                </ToggleButton>
                                <ToggleButton value="Jurídica" aria-label="Jurídica" sx={buttonStyle2}>
                                    <BusinessIcon />
                                    Jurídica
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Renderizar campos condicionalmente com base no tipo de pessoa */}
                        {personType === 'Jurídica' ? (
                            // Campos para pessoa jurídica
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cnpj">CNPJ *</InputLabel>
                                            <InputMask
                                                mask="99.999.999/9999-99"
                                                value={cnpj}
                                                onChange={handleCnpjChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    fullWidth
                                                    placeholder="00.000.000/0000-00"
                                                    error={(submitted && !cnpj) || !cnpjValido} // Combina as condições de erro
                                                    helperText={submitted && !cnpj ? "Este campo é obrigatório" : (!cnpjValido ? "CNPJ inválido." : "")} // Combina as mensagens de helperText
                                                    value={cnpj}
                                                    onChange={handleCnpjChange}
                                                />
                                                }
                                            </InputMask>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="razaosocial">Razão Social *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !razaoSocial}
                                                helperText={(submitted && !razaoSocial) ? "Este campo é obrigatório" : ""}
                                                placeholder="Social"
                                                value={razaoSocial}
                                                onChange={(event) => setRazaoSocial(event.target.value)}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={13}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="nomefantasia">Nome Fantasia *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !nomeFantasia}
                                                helperText={(submitted && !nomeFantasia) ? "Este campo é obrigatório" : ""}
                                                placeholder="Nome Fantasia"
                                                value={nomeFantasia}
                                                onChange={(event) => setNomeFantasia(event.target.value)}
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cepjuridico">CEP *</InputLabel>
                                            <InputMask
                                                mask="99999-999"
                                                value={formData.cep}
                                                onChange={handleCepChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    fullWidth
                                                    placeholder="00000-000"
                                                    required
                                                    error={(submitted && !cep) || !cepValido}
                                                    helperText={(submitted && !cep) ? "Este campo é obrigatório" : (!cepValido ? "CEP inválido." : "")}
                                                    value={formData.cep}
                                                    onChange={handleCepChange}
                                                />
                                                }
                                            </InputMask>

                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="ruajuridica">Rua *</InputLabel>
                                            <TextField
                                                fullWidth
                                                placeholder="Ex.: Rua Almirante Barbosa"
                                                required
                                                error={submitted && !formData.rua}
                                                helperText={(submitted && !formData.rua) ? "Este campo é obrigatório" : ""}
                                                value={formData.rua} // Usa o valor do estado
                                                onChange={(event) => handleInputChange('rua', event.target.value)} // Atualiza o estado
                                            />
                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="numerojuridico">Número</InputLabel>
                                            <TextField
                                                fullWidth
                                                placeholder="Número"
                                                value={numero}
                                                onChange={handleNumeroChange}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="complementojuridico">Complemento</InputLabel>
                                            <TextField fullWidth value={complemento} onChange={handleComplementoChange} placeholder="Complemento" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="paisjuridico">País *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !pais}
                                                helperText={(submitted && !pais) ? "Este campo é obrigatório" : ""}
                                                placeholder="País"
                                                value={pais}
                                                onChange={(event) => setPais(event.target.value)}
                                            />

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="estadojuridico">Estado *</InputLabel>
                                            <Select
                                                value={formData.estado?.id || ''}
                                                onChange={(event) => {
                                                    const selectedEstado = estados.find(estado => estado.id === event.target.value);
                                                    setFormData({ ...formData, estado: selectedEstado });
                                                }}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>
                                                    Selecione um estado
                                                </MenuItem>
                                                {estados.map((estado) => (
                                                    <MenuItem key={estado.id} value={estado.id}>
                                                        {estado.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {submitted && (!formData.estado || !formData.estado.id) && (
                                                <Typography color="error" variant="caption">
                                                    Este campo é obrigatório
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cidadejuridico">Cidade *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !formData.cidade}
                                                helperText={(submitted && !formData.cidade) ? "Este campo é obrigatório" : ""}
                                                placeholder="Cidade"
                                                value={formData.cidade} // Usa o valor do estado
                                                onChange={(event) => handleInputChange('cidade', event.target.value)} // Atualiza o estado
                                            />
                                        </Stack>
                                    </Grid>

                                    {/* Título "Campos extras" */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{
                                            color: 'rgba(27, 20, 100, 0.80)',
                                            marginTop: '20px',
                                            fontSize: '16px',
                                            fontStyle: 'normal',
                                            fontWeight: 400,
                                            lineHeight: 'normal'
                                        }} gutterBottom>
                                            Representante legal (opcional)
                                        </Typography>
                                    </Grid>


                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cpfjuridico">CPF</InputLabel>
                                            <InputMask
                                                mask="999.999.999-99"
                                                value={cpf}
                                                onChange={handleCpfChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    id="cpf"
                                                    placeholder="000.000.000-00"
                                                    fullWidth
                                                    error={!cpfValido}
                                                    helperText={!cpfValido && "CPF inválido."}
                                                />}
                                            </InputMask>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="nomejuridico">Nome</InputLabel>
                                            <TextField fullWidth onChange={handleNomeChange} placeholder="Nome" />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="emailjuridico">Email</InputLabel>
                                            <TextField
                                                fullWidth
                                                placeholder="Email"
                                                value={email}
                                                onChange={handleEmailChange}
                                                error={!emailValido}
                                                helperText={!emailValido && "Email inválido."}
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="telefonejuridico">Telefone</InputLabel>
                                            <InputMask
                                                mask={telefone.length <= 10 ? "(99) 9999-9999" : "(99) 99999-9999"}
                                                value={telefone}
                                                onChange={handleTelefoneChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    fullWidth
                                                    placeholder="Digite o telefone"
                                                    type="tel"
                                                />}
                                            </InputMask>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="id-identificacaojuridico">ID de Identificação</InputLabel>
                                            <TextField fullWidth value={idIdentificacao} onChange={handleIdIdentificacaoChange} placeholder="ID" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="orgaojuridico">Órgão</InputLabel>
                                            <TextField fullWidth onChange={handleOrgaoChange} placeholder="Órgão" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="ufjuridico">UF</InputLabel>
                                            <Autocomplete
                                                disableCloseOnSelect
                                                noOptionsText="Dados não encontrados"
                                                openText="Abrir"
                                                closeText="Fechar"
                                                options={ufs}
                                                getOptionLabel={(option) => option.nome}
                                                value={ufs.find(uf => uf.id === formData.uf)}
                                                onChange={(event, newValue) => {
                                                    handleInputChange('uf', newValue);
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
                                                                    onChange={(event) => {
                                                                        // Manipulação do Switch dentro do Autocomplete
                                                                        // Não se esqueça de gerenciar o estado aqui conforme necessário
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Selecione uma UF"
                                                    />
                                                )}
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="observacoesjuridico">Observações</InputLabel>
                                            <TextField id="observacoes" onChange={handleObservacoesChange} placeholder="Digite aqui..." fullWidth multiline rows={4} />
                                        </Stack>
                                    </Grid>


                                </Grid>
                            </>
                        ) : (
                            // Campos para pessoa física
                            <>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={7}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="nomefisica">Nome *</InputLabel>
                                            <TextField fullWidth required
                                                error={submitted && !nome}
                                                helperText={(submitted && !nome) ? "Este campo é obrigatório" : ""}
                                                onChange={handleNomeChange} placeholder="Nome" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cpffisica">CPF *</InputLabel>
                                            <InputMask
                                                mask="999.999.999-99"
                                                value={cpf}
                                                onChange={handleCpfChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    id="cpf"
                                                    placeholder="000.000.000-00"
                                                    fullWidth
                                                    error={(submitted && !cpf) || !cpfValido} // Combina as condições de erro
                                                    helperText={submitted && !cpf ? "Este campo é obrigatório" : (!cpfValido ? "CPF inválido." : "")} // Combina as mensagens de helperText
                                                    value={cpf}
                                                    onChange={handleCpfChange}
                                                />
                                                }
                                            </InputMask>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="emailfisica">Email *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={(submitted && !email) || !emailValido} // Combinar as condições de erro
                                                helperText={submitted && !email ? "Este campo é obrigatório" : (!emailValido ? "Email inválido." : "")} // Combinar as mensagens de helperText
                                                placeholder="Email"
                                                value={email}
                                                onChange={handleEmailChange}
                                            />

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={5}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="telefonefisica">Telefone *</InputLabel>
                                            <InputMask
                                                mask={telefone.length <= 10 ? "(99) 9999-9999" : "(99) 99999-9999"}
                                                value={telefone}
                                                onChange={handleTelefoneChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    required
                                                    error={submitted && !telefone}
                                                    helperText={(submitted && !telefone) ? "Este campo é obrigatório" : ""}
                                                    fullWidth
                                                    placeholder="Digite o telefone"
                                                    type="tel"
                                                />}
                                            </InputMask>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="id-identificacaofisica">ID de Identificação *</InputLabel>
                                            <TextField
                                                required
                                                error={submitted && !idIdentificacao}
                                                helperText={(submitted && !idIdentificacao) ? "Este campo é obrigatório" : ""}
                                                fullWidth
                                                onChange={handleIdIdentificacaoChange}
                                                placeholder="ID" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="orgaofisica">Órgão *</InputLabel>
                                            <TextField required
                                                error={submitted && !orgao}
                                                helperText={(submitted && !orgao) ? "Este campo é obrigatório" : ""} fullWidth onChange={handleOrgaoChange} placeholder="Órgão" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="uffisica">UF *</InputLabel>
                                            <Autocomplete
                                                disableCloseOnSelect
                                                noOptionsText="Dados não encontrados"
                                                openText="Abrir"
                                                closeText="Fechar"
                                                options={ufs}
                                                getOptionLabel={(option) => option.nome}
                                                value={ufs.find(uf => uf.id === formData.uf)}
                                                onChange={(event, newValue) => {
                                                    handleInputChange('uf', newValue);
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
                                                                    onChange={(event) => {
                                                                        // Manipulação do Switch dentro do Autocomplete
                                                                        // Não se esqueça de gerenciar o estado aqui conforme necessário
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={submitted && !ufValida}
                                                        helperText={submitted && !ufValida ? "Este campo é obrigatório" : ""}
                                                        placeholder="Selecione uma UF"
                                                    />
                                                )}
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cepfisica">CEP *</InputLabel>
                                            <InputMask
                                                mask="99999-999"
                                                value={formData.cep}
                                                onChange={handleCepChange}
                                                disabled={false}
                                            >
                                                {() => <TextField
                                                    fullWidth
                                                    placeholder="00000-000"
                                                    required
                                                    error={(submitted && !cep) || !cepValido}
                                                    helperText={(submitted && !cep) ? "Este campo é obrigatório" : (!cepValido ? "CEP inválido." : "")}
                                                    value={formData.cep}
                                                    onChange={handleCepChange}
                                                />
                                                }
                                            </InputMask>
                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="ruafisica">Rua *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !formData.rua}
                                                helperText={(submitted && !formData.rua) ? "Este campo é obrigatório" : ""}
                                                placeholder="Ex.: Rua Almirante Barbosa"
                                                value={formData.rua} // Usa o valor do estado
                                                onChange={(event) => handleInputChange('rua', event.target.value)} // Atualiza o estado
                                            />
                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="numerofisica">Número</InputLabel>
                                            <TextField
                                                fullWidth
                                                placeholder="Número"
                                                value={numero}
                                                onChange={handleNumeroChange}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="complementofisica">Complemento</InputLabel>
                                            <TextField fullWidth onChange={handleComplementoChange} placeholder="Complemento" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="paisfisica">País *</InputLabel>
                                            <TextField
                                                required
                                                error={submitted && !pais}
                                                helperText={(submitted && !pais) ? "Este campo é obrigatório" : ""}
                                                fullWidth onChange={handlePais} placeholder="País" />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={4.5}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="estadofisica">Estado *</InputLabel>
                                            <Select
                                                value={formData.estado?.id || ''}
                                                onChange={(event) => {
                                                    const selectedEstado = estados.find(estado => estado.id === event.target.value);
                                                    setFormData({ ...formData, estado: selectedEstado });
                                                }}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>
                                                    Selecione um estado
                                                </MenuItem>
                                                {estados.map((estado) => (
                                                    <MenuItem key={estado.id} value={estado.id}>
                                                        {estado.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {submitted && (!formData.estado || !formData.estado.id) && (
                                                <Typography color="error" variant="caption">
                                                    Este campo é obrigatório
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Grid>


                                    <Grid item xs={12} md={4.5}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="cidadefisica">Cidade *</InputLabel>
                                            <TextField
                                                fullWidth
                                                required
                                                error={submitted && !formData.cidade}
                                                helperText={(submitted && !formData.cidade) ? "Este campo é obrigatório" : ""}
                                                placeholder="Cidade"
                                                value={formData.cidade} // Usa o valor do estado
                                                onChange={(event) => handleInputChange('cidade', event.target.value)} // Atualiza o estado
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="observacoesfisica">Observações</InputLabel>
                                            <TextField id="observacoes" onChange={handleObservacoesChange} placeholder="Digite aqui..." fullWidth multiline rows={4} />
                                        </Stack>
                                    </Grid>
                                </Grid>

                            </>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, marginBottom: 4 }}>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => toggleDrawer(false)} // Fecha o Drawer ao clicar
                                >
                                    Cancelar
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleSubmit}>
                                    Cadastrar
                                </Button>
                            </Stack>
                        </Box>

                    </Box>
                </MainCard>
            </Drawer>
        </>
    );
}

export default CustomDrawer;
