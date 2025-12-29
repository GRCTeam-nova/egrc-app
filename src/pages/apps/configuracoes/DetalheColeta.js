import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Autocomplete,
  InputLabel,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ptBR from "date-fns/locale/pt-BR";
import { enqueueSnackbar } from "notistack";

// ====================================================================================
// DADOS MOCK PARA DETALHES DA COLETA (Simulação de chamada de API)
// ====================================================================================

const coletasDetalhesMock = {
  101: {
    id: 101,
    ciclo_coleta: "ESG 2024",
    codigo_metrica: "AMB001",
    nome_metrica: "Consumo de Água",
    indicador: "Volume de água consumido pela unidade X",
    frequencia_coleta: "Mensal",
    periodo_referencia_coleta: "MEN202401 (Jan/2024)",
    versao_coleta: 1,
    status_coleta_periodo: "coleta em andamento",
    data_inicio_coleta: new Date(2024, 0, 1), // 01/01/2024
    data_limite_coleta: new Date(2024, 1, 15), // 15/02/2024
    data_conclusao_efetiva: null,
    instrucao_coleta:
      "Coletar o dado de consumo total de água do hidrômetro principal. O dado deve ser inserido em Litros (L).",
    dimensoes: [
      {
        tipo_da_dimensao: "Local",
        nome_da_dimensao: "SP",
        descricao_do_valor: "Consumo total da unidade de São Paulo",
        valor: 15000, // Valor mockado
        unidade_medida: { id: 6, nome: "Litros (L)" },
        valor_convertido: null,
        unidade_medida_convertida: null,
        justificativa: "",
      },
      {
        tipo_da_dimensao: "Fonte de energia",
        nome_da_dimensao: "Hídrica",
        descricao_do_valor: "Consumo de água proveniente de fonte hídrica",
        valor: 100,
        unidade_medida: { id: 1, nome: "Percentual (%)" },
        valor_convertido: null,
        unidade_medida_convertida: null,
        justificativa: "",
      },
    ],
    descricao_qualitativo: "Nenhuma observação qualitativa.",
    anexos_resposta: [],
    links: ["https://link-para-relatorio.com"],
    provedor_responsavel: {
      id: 2,
      nome: "Carlos Santos",
      cargo: "Coordenador Ambiental",
    },
    revisores: [
      { id: 1, nome: "Ana Silva", cargo: "Analista de Sustentabilidade" },
    ],
  },
  // Outros mocks de coleta podem ser adicionados aqui
  102: {
    id: 102,
    ciclo_coleta: "ESG 2024",
    codigo_metrica: "SOC005",
    nome_metrica: "Treinamento de Colaboradores",
    indicador: "Número total de horas de treinamento por colaborador.",
    frequencia_coleta: "Trimestral",
    periodo_referencia_coleta: "TRI202401 (Jan-Mar/2024)",
    versao_coleta: 1,
    status_coleta_periodo: "coleta não iniciada",
    data_inicio_coleta: new Date(2024, 0, 1), // 01/01/2024
    data_limite_coleta: new Date(2024, 3, 30), // 30/04/2024
    data_conclusao_efetiva: null,
    instrucao_coleta:
      "Coletar o total de horas de treinamento obrigatório e opcional realizado por todos os colaboradores no trimestre.",
    dimensoes: [
      {
        tipo_da_dimensao: "Departamento",
        nome_da_dimensao: "Vendas",
        descricao_do_valor:
          "Horas de treinamento para o departamento de Vendas",
        valor: 500, // Valor mockado
        unidade_medida: { id: 8, nome: "Número absoluto" },
        valor_convertido: null,
        unidade_medida_convertida: null,
        justificativa: "",
      },
      {
        tipo_da_dimensao: "Departamento",
        nome_da_dimensao: "TI",
        descricao_do_valor: "Horas de treinamento para o departamento de TI",
        valor: 350,
        unidade_medida: { id: 8, nome: "Número absoluto" },
        valor_convertido: null,
        unidade_medida_convertida: null,
        justificativa: "",
      },
    ],
    descricao_qualitativo:
      "Foco em treinamentos de compliance e segurança da informação.",
    anexos_resposta: [],
    links: [],
    provedor_responsavel: {
      id: 3,
      nome: "Maria Oliveira",
      cargo: "Gerente de RH",
    },
    revisores: [
      { id: 1, nome: "Ana Silva", cargo: "Analista de Sustentabilidade" },
      { id: 2, nome: "Carlos Santos", cargo: "Coordenador Ambiental" },
    ],
  },
  103: {
    id: 103,
    ciclo_coleta: "ESG 2023",
    codigo_metrica: "GOV002",
    nome_metrica: "Reunião do Conselho",
    indicador:
      "Registro de presença e pautas das reuniões do Conselho de Administração.",
    frequencia_coleta: "Anual",
    periodo_referencia_coleta: "ANU2023 (Ano 2023)",
    versao_coleta: 1,
    status_coleta_periodo: "concluída",
    data_inicio_coleta: new Date(2023, 0, 1), // 01/01/2023
    data_limite_coleta: new Date(2023, 11, 31), // 31/12/2023
    data_conclusao_efetiva: new Date(2024, 0, 15),
    instrucao_coleta:
      "Anexar a ata da reunião do Conselho de Administração de 2023 e a lista de presença.",
    dimensoes: [
      {
        tipo_da_dimensao: "Reunião",
        nome_da_dimensao: "Conselho 2023",
        descricao_do_valor: "Ata e presença da reunião anual",
        valor: 1, // Valor mockado (1 reunião)
        unidade_medida: { id: 8, nome: "Número absoluto" },
        valor_convertido: null,
        unidade_medida_convertida: null,
        justificativa: "Coleta concluída e aprovada em 15/01/2024.",
      },
    ],
    descricao_qualitativo: "Documentação completa e aprovada.",
    anexos_resposta: ["ata_conselho_2023.pdf"],
    links: ["https://intranet/governanca/atas/2023"],
    provedor_responsavel: {
      id: 1,
      nome: "Ana Silva",
      cargo: "Analista de Sustentabilidade",
    },
    revisores: [
      { id: 2, nome: "Carlos Santos", cargo: "Coordenador Ambiental" },
    ],
    auditores: [
      { id: 2, nome: "Carlos Santos", cargo: "Coordenador Ambiental" },
    ],
  },
};

// Mocks para Selects e Autocompletes
const colaboradoresMock = [
  { id: 1, nome: "Ana Silva", cargo: "Analista de Sustentabilidade" },
  { id: 2, nome: "Carlos Santos", cargo: "Coordenador Ambiental" },
  { id: 3, nome: "Maria Oliveira", cargo: "Gerente de RH" },
];

const unidadesMedidaMock = [
  { id: 1, nome: "Percentual (%)" },
  { id: 6, nome: "Litros (L)" },
  { id: 8, nome: "Número absoluto" },
];

// ====================================================================================

function DetalheColeta() {
  const location = useLocation();
  const coletaId = location.state?.coletaId; // Obtém o ID da coleta do state
  const [coleta, setColeta] = useState(null);
  const [dimensoes, setDimensoes] = useState([]);

  // Estrutura inicial para um novo item de dimensão/valor
  const initialDimensaoState = {
    id: Date.now(), // ID temporário para chave React
    tipo_da_dimensao: "",
    nome_da_dimensao: "",
    descricao_do_valor: "",
    valor: "",
    unidade_medida: unidadesMedidaMock[0], // Mock: assume o primeiro como padrão
    valor_convertido: "",
    unidade_medida_convertida: "",
    justificativa: "",
    // Simulação de campo obrigatório para a justificativa
    isObrigatorio: false,
  };

  const handleAddDimensao = () => {
    setDimensoes((prev) => [...prev, { ...initialDimensaoState, id: Date.now() + Math.random() }]);
  };

  const handleRemoveDimensao = (id) => {
    setDimensoes((prev) => prev.filter((dim) => dim.id !== id));
  };

  const handleDimensaoChange = (id, field, value) => {
    setDimensoes((prev) =>
      prev.map((dim) => (dim.id === id ? { ...dim, [field]: value } : dim))
    );
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula o carregamento dos dados da coleta
    setTimeout(() => {
      const dados = coletasDetalhesMock[coletaId];
      if (dados) {
        // Clonar para que as alterações no estado local não afetem o mock original
        const parsedData = JSON.parse(JSON.stringify(dados));
        // Inicializa o estado de dimensoes com os dados mockados, adicionando um ID temporário
        setDimensoes(parsedData.dimensoes.map(d => ({...d, id: Date.now() + Math.random()})));
        // Recriar objetos Date a partir das strings para evitar 'Invalid time value'
        if (parsedData.data_limite_coleta) {
          parsedData.data_limite_coleta = new Date(
            parsedData.data_limite_coleta
          );
        }
        if (parsedData.data_inicio_coleta) {
          parsedData.data_inicio_coleta = new Date(
            parsedData.data_inicio_coleta
          );
        }
        if (parsedData.data_conclusao_efetiva) {
          parsedData.data_conclusao_efetiva = new Date(
            parsedData.data_conclusao_efetiva
          );
        }
        setColeta(parsedData);
      }
      setLoading(false);
    }, 500);
  }, [coletaId]);

  const handleSalvar = () => {
    // Simula a lógica de salvar (sem API)
    enqueueSnackbar("Detalhes da coleta salvos (simulação).", {
      variant: "success",
    });
    console.log("Dados a serem salvos:", { ...coleta, dimensoes });
  };

  const handleAcaoBotao = (acao) => {
    // Simula a lógica do botão de ação
    enqueueSnackbar(
      `Ação '${acao}' executada para a coleta ${coletaId} (simulação).`,
      {
        variant: "info",
      }
    );
    // Lógica para atualizar o status (mock)
    let novoStatus = coleta.status_coleta_periodo;
    if (acao === "INICIAR COLETA") {
      novoStatus = "coleta em andamento";
    } else if (acao === "ENVIAR PARA REVISÃO") {
      novoStatus = "em revisão";
    } else if (acao === "CONCLUÍDO E APROVADO") {
      novoStatus = "concluída";
    }
    setColeta((prev) => ({ ...prev, status_coleta_periodo: novoStatus }));
  };

  if (loading) {
    return <Typography>Carregando detalhes da coleta...</Typography>;
  }

  if (!coleta) {
    return <Typography>Coleta não encontrada.</Typography>;
  }

  // Determinar o texto do botão de ação
  let botaoAcaoTexto = "";
  let botaoAcaoCor = "primary";
  switch (coleta.status_coleta_periodo) {
    case "coleta não iniciada":
      botaoAcaoTexto = "INICIAR COLETA";
      botaoAcaoCor = "primary";
      break;
    case "coleta em andamento":
      botaoAcaoTexto = "ENVIAR PARA REVISÃO";
      botaoAcaoCor = "warning";
      break;
    case "em revisão":
      botaoAcaoTexto = "CONCLUÍDO E APROVADO"; // Assumindo que o revisor fará essa ação
      botaoAcaoCor = "success";
      break;
    case "concluída":
      botaoAcaoTexto = "COLETA CONCLUÍDA";
      botaoAcaoCor = "success";
      break;
    default:
      botaoAcaoTexto = "AÇÃO INDEFINIDA";
      botaoAcaoCor = "inherit";
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Coleta: {coleta.nome_metrica}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {coleta.ciclo_coleta} - {coleta.periodo_referencia_coleta} - Versão{" "}
          {coleta.versao_coleta}
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status e Ações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Status da Coleta</InputLabel>
                  <TextField
                    fullWidth
                    value={coleta.status_coleta_periodo.toUpperCase()}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontWeight: "bold",
                        color:
                          coleta.status_coleta_periodo === "coleta em andamento"
                            ? "warning.dark"
                            : coleta.status_coleta_periodo === "concluída"
                              ? "success.dark"
                              : "error.dark",
                      },
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Data Limite</InputLabel>
                  <DatePicker
                    readOnly
                    value={coleta.data_limite_coleta}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1} mt={3}>
                  <Button
                    variant="contained"
                    color={botaoAcaoCor}
                    fullWidth
                    disabled={coleta.status_coleta_periodo === "concluída"}
                    onClick={() => handleAcaoBotao(botaoAcaoTexto)}
                  >
                    {botaoAcaoTexto}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informações da Métrica
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Código da Métrica</InputLabel>
                  <TextField
                    fullWidth
                    value={coleta.codigo_metrica}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Frequência da Coleta</InputLabel>
                  <TextField
                    fullWidth
                    value={coleta.frequencia_coleta}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Indicador</InputLabel>
                  <TextField
                    fullWidth
                    value={coleta.indicador}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Data de Início da Coleta</InputLabel>
                  <DatePicker
                    readOnly
                    value={coleta.data_inicio_coleta}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Stack>
              </Grid>
	              <Grid item xs={12}>
	                <Stack spacing={1}>
	                  <InputLabel>Instruções para Coleta</InputLabel>
	                  <TextField
	                    fullWidth
	                    multiline
	                    rows={3}
	                    value={coleta.instrucao_coleta}
	                    InputProps={{ readOnly: true }}
	                  />
	                </Stack>
	              </Grid>
	              {/* Início da Seção de Dimensões e Valores */}
	              <Grid item xs={12}>
	                <Divider sx={{ my: 2 }} />
	                <Typography variant="h6" gutterBottom>
	                  Dimensões e Valores da Coleta
	                </Typography>
	                <Stack spacing={3}>
	                  {dimensoes.map((dimensao, index) => (
	                    <Card key={dimensao.id} variant="outlined">
	                      <CardContent>
	                        <Stack
	                          direction="row"
	                          justifyContent="space-between"
	                          alignItems="center"
	                          mb={2}
	                        >
	                          <Typography variant="subtitle1">
	                            Item de Coleta #{index + 1}
	                          </Typography>
	                        </Stack>
	                        <Grid container spacing={2}>
	                          {/* 1. tipo da dimensão */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Tipo da Dimensão</InputLabel>
	                              <TextField
	                                fullWidth
	                                value={dimensao.tipo_da_dimensao}
	                                InputProps={{ readOnly: true }}
	                                placeholder="Automático (Configuração da Coleta)"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 2. nome da dimensão */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Nome da Dimensão</InputLabel>
	                              <TextField
	                                fullWidth
	                                value={dimensao.nome_da_dimensao}
	                                InputProps={{ readOnly: true }}
	                                placeholder="Automático (Configuração da Coleta)"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 3. descrição do valor */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Descrição do Valor</InputLabel>
	                              <TextField
	                                fullWidth
	                                value={dimensao.descricao_do_valor}
	                                InputProps={{ readOnly: true }}
	                                placeholder="Automático (Configuração da Coleta)"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 4. valor */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Valor</InputLabel>
	                              <TextField
	                                fullWidth
	                                type="number"
	                                value={dimensao.valor}
	                                onChange={(e) =>
	                                  handleDimensaoChange(
	                                    dimensao.id,
	                                    "valor",
	                                    e.target.value
	                                  )
	                                }
	                                placeholder="Insira o valor numérico"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 5. unidade_medida */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Unidade de Medida</InputLabel>
	                              <Autocomplete
	                                fullWidth
	                                options={unidadesMedidaMock}
	                                getOptionLabel={(option) => option.nome}
	                                value={dimensao.unidade_medida}
	                                isOptionEqualToValue={(option, value) =>
	                                  option.id === value.id
	                                }
	                                onChange={(event, newValue) =>
	                                  handleDimensaoChange(
	                                    dimensao.id,
	                                    "unidade_medida",
	                                    newValue
	                                  )
	                                }
	                                renderInput={(params) => (
	                                  <TextField
	                                    {...params}
	                                    placeholder="Automático (Configuração da Coleta)"
	                                  />
	                                )}
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 6. valor_convertido */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>Valor Convertido</InputLabel>
	                              <TextField
	                                fullWidth
	                                type="number"
	                                value={dimensao.valor_convertido}
	                                InputProps={{ readOnly: true }}
	                                placeholder="Automático (Conversão)"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* 7. unidade_medida_convertida */}
	                          <Grid item xs={12} sm={4}>
	                            <Stack spacing={1}>
	                              <InputLabel>
	                                Unidade de Medida Convertida
	                              </InputLabel>
	                              <TextField
	                                fullWidth
	                                value={dimensao.unidade_medida_convertida}
	                                InputProps={{ readOnly: true }}
	                                placeholder="Automático (Conversão)"
	                              />
	                            </Stack>
	                          </Grid>
	                          {/* Botão para Justificativa (Simulação de campo obrigatório) */}
	                          <Grid item xs={12}>
	                              <Stack spacing={1}>
	                                <InputLabel>Justificativa</InputLabel>
	                                <TextField
	                                  fullWidth
	                                  multiline
	                                  rows={2}
	                                  value={dimensao.justificativa}
	                                  onChange={(e) =>
	                                    handleDimensaoChange(
	                                      dimensao.id,
	                                      "justificativa",
	                                      e.target.value
	                                    )
	                                  }
	                                  placeholder="Descreva a justificativa para o campo obrigatório estar em branco/zero."
	                                />
	                              </Stack>
	                            </Grid>
	                          {/* 8. justificativa (Aparece se isObrigatorio for true E valor for vazio/zero) */}
	                          {(dimensao.isObrigatorio &&
	                            (dimensao.valor === "" ||
	                              parseFloat(dimensao.valor) === 0)) && (
	                            <Grid item xs={12}>
	                              <Stack spacing={1}>
	                                <InputLabel>Justificativa</InputLabel>
	                                <TextField
	                                  fullWidth
	                                  multiline
	                                  rows={2}
	                                  value={dimensao.justificativa}
	                                  onChange={(e) =>
	                                    handleDimensaoChange(
	                                      dimensao.id,
	                                      "justificativa",
	                                      e.target.value
	                                    )
	                                  }
	                                  placeholder="Descreva a justificativa para o campo obrigatório estar em branco/zero."
	                                />
	                              </Stack>
	                            </Grid>
	                          )}
	                        </Grid>
	                      </CardContent>
	                    </Card>
	                  ))}
	                </Stack>
	              </Grid>
	              {/* Fim da Seção de Dimensões e Valores */}
	              <Grid item xs={12}>
	                {/* Este bloco foi movido para a seção de Dimensões e Valores */}
	              </Grid>
	              <Grid item xs={12} md={6}>
	                <Stack spacing={1}>
	                  <InputLabel>Provedor Responsável</InputLabel>
                  <Autocomplete
                    fullWidth
                    options={colaboradoresMock}
                    getOptionLabel={(option) =>
                      `${option.nome} (${option.cargo})`
                    }
                    value={coleta.provedor_responsavel}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(event, newValue) =>
                      setColeta((prev) => ({
                        ...prev,
                        provedor_responsavel: newValue,
                      }))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Revisor(es)</InputLabel>
                  <Autocomplete
                    fullWidth
                    multiple
                    options={colaboradoresMock}
                    getOptionLabel={(option) =>
                      `${option.nome} (${option.cargo})`
                    }
                    value={coleta.revisores}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(event, newValue) =>
                      setColeta((prev) => ({ ...prev, revisores: newValue }))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel>Auditor</InputLabel>
                  <Autocomplete
                    fullWidth
                    options={colaboradoresMock}
                    getOptionLabel={(option) =>
                      `${option.nome} (${option.cargo})`
                    }
                    value={coleta.auditor}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(event, newValue) =>
                      setColeta((prev) => ({ ...prev, auditor: newValue }))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informações Adicionais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Descrição Qualitativa</InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={coleta.descricao_qualitativo}
                    onChange={(e) =>
                      setColeta((prev) => ({
                        ...prev,
                        descricao_qualitativo: e.target.value,
                      }))
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Links de Referência</InputLabel>
                  <TextField
                    fullWidth
                    value={coleta.links.join(", ")} // Simplesmente exibe como string separada por vírgula
                    onChange={(e) =>
                      setColeta((prev) => ({
                        ...prev,
                        links: e.target.value.split(",").map((l) => l.trim()),
                      }))
                    }
                    placeholder="Separe os links por vírgula"
                  />
                </Stack>
              </Grid>
              {/* Anexos (Não implementado o upload, apenas um placeholder) */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Anexos de Resposta</InputLabel>
                  <Typography variant="body2" color="textSecondary">
                    Funcionalidade de upload de arquivos (anexos_resposta) não
                    implementada neste mock.
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleSalvar}>
            Salvar Alterações
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default DetalheColeta;
