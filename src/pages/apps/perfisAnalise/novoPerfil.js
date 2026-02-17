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
  InputLabel,
  Paper,
  Popover,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import AndamentoHistoricoDrawer from "../../extra-pages/AndamentoHistoricoDrawer";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { NumericFormat } from "react-number-format";

// ====== IMPORTS PARA O HEATMAP ======
import ReactApexChart from "react-apexcharts";
// ColorPicker do react-color
import { SketchPicker } from "react-color";
// Ícones
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import DeleteForeverOutlined from "@mui/icons-material/DeleteForeverOutlined";

function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};

  // ====================================== ESTADOS GERAIS ======================================
  const [niveisAvaliacao, setNiveisAvaliacao] = useState([]);
  const [localColor, setLocalColor] = useState("#ffffff");

  const [metodologias, setMetodologias] = useState([]);
  const [indices, setIndices] = useState([]);
  const [quantidadeNiveisProbabiliade, setQuantidadeNiveisProbabiliade] = useState("3");
  const [quantidadeNiveisImpacto, setQuantidadeNiveisImpacto] = useState("3");
  const [nome, setNome] = useState("");
  const [quantitativo, setQuantitativo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [metricasProbabilidade] = useState([
    { id: 1, nome: "Percentual" },
    { id: 2, nome: "Moeda" },
    { id: 3, nome: "Quantidade" },
    { id: 4, nome: "Índice" },
    { id: 5, nome: "Percentual do Índice" },
  ]);

  const [metricasImpacto] = useState([
    { id: 1, nome: "Percentual" },
    { id: 2, nome: "Moeda" },
    { id: 3, nome: "Quantidade" },
    { id: 4, nome: "Índice" },
    { id: 5, nome: "Percentual do Índice" },
  ]);

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    metricaProbabilidade: "",
    metricaImpacto: "",
    departamento: [],
    nivelAvaliacao: "",
    metodologia: "",
    indice: "",
    metrica: "",
    processo: [],
    riscoAssociado: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  // ====================================== BUSCA DE DADOS ======================================
  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idIndex,
        nome: item.name,
        ...item,
      }));
      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}indexs`, setIndices);

    const niveisAvaliacaoLocal = [
      { id: 1, nome: "Inerente" },
      { id: 2, nome: "Inerente e residual" },
      { id: 3, nome: "Inerente, residual e planejado" },
    ];
    const metodologiasLocal = [
      { id: 1, nome: "Bowtie" },
      { id: 2, nome: "Não Bowtie" },
    ];
    setNiveisAvaliacao(niveisAvaliacaoLocal);
    setMetodologias(metodologiasLocal);
    window.scrollTo(0, 0);
  }, []);

  // ====================================== EDIÇÃO (caso dadosApi) ======================================
  useEffect(() => {
    if (dadosApi && dadosApi.idAnalysisProfile) {
      setLoading(true);
      const fetchPerfilDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}analisys-profile/${dadosApi.idAnalysisProfile}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados do perfil.");
          }
          const data = await response.json();

          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNome(data.name);
          setQuantidadeNiveisProbabiliade(
            String(data.quantityLevelsProbabilityMatrix)
          );
          setQuantidadeNiveisImpacto(String(data.quantityLevelsImpactMatrix));
          setFormData((prev) => ({
            ...prev,
            metricaProbabilidade: data.quantitativeMetricTypeProbability,
            metricaImpacto: data.quantitativeMetricTypeImpact,
            metodologia: data.methodology,
            nivelAvaliacao: data.assessmentLevel,
            indice: data.idIndex || "",
          }));
          setQuantitativo(data.hasQuantitative);

          const sortedRanges = [...data.heatMap.heatMapRanges].sort(
            (a, b) => a.start - b.start
          );

          setHeatmapOptions((prev) => ({
            ...prev,
            xaxis: {
              ...prev.xaxis,
              title: { ...prev.xaxis.title, text: data.axisX },
            },
            yaxis: {
              ...prev.yaxis,
              title: { ...prev.yaxis.title, text: data.axisY },
            },
            plotOptions: {
              ...prev.plotOptions,
              heatmap: {
                ...prev.plotOptions.heatmap,
                colorScale: {
                  ...prev.plotOptions.heatmap.colorScale,
                  ranges: sortedRanges.map((r) => ({
                    from: r.start,
                    to: r.end,
                    name: r.name,
                    color: r.color,
                  })),
                },
              },
            },
          }));

          // --- 1) mapeia quantitativos por nome
          const probQuantMap = data.heatMap.heatMapProbabilities.reduce(
            (acc, p) => ({ ...acc, [p.name]: p.quantitative }),
            {}
          );
          const impQuantMap = data.heatMap.heatMapImpacts.reduce(
            (acc, i) => ({ ...acc, [i.name]: i.quantitative }),
            {}
          );

          // --- 2) monta array de labels na ordem das colunas (row 0)
          const totalProb = Number(data.quantityLevelsProbabilityMatrix);
          const probLabelsOrdered = Array(totalProb).fill("");
          data.heatMap.heatMapQuadrants.forEach((q) => {
            const [r, c] = q.coordinate.split(":").map(Number);
            if (r === 0 && c < totalProb) probLabelsOrdered[c] = q.probability;
          });
          // fallback para caso algum não exista
          for (let i = 0; i < totalProb; i++) {
            probLabelsOrdered[i] =
              probLabelsOrdered[i] || `Probabilidade${i + 1}`;
          }
          const probNamesOrdered = probLabelsOrdered.map(
            (lbl) => probQuantMap[lbl] || ""
          );

          // --- 3) monta array de labels na ordem das linhas (col 0)
          const totalImpact = Number(data.quantityLevelsImpactMatrix);
          const impLabelsOrdered = Array(totalImpact).fill("");
          data.heatMap.heatMapQuadrants.forEach((q) => {
            const [r, c] = q.coordinate.split(":").map(Number);
            if (c === 0 && r < totalImpact) impLabelsOrdered[r] = q.impact;
          });
          for (let i = 0; i < totalImpact; i++) {
            impLabelsOrdered[i] = impLabelsOrdered[i] || `Impacto${i + 1}`;
          }
          const impNamesOrdered = impLabelsOrdered.map(
            (lbl) => impQuantMap[lbl] || ""
          );

          // --- 4) atualiza estado
          setProbLabels(probLabelsOrdered);
          setProbNames(probNamesOrdered);
          setImpactLabels(impLabelsOrdered);
          setImpactNames(impNamesOrdered);

          const newHeatmapData = [];

          for (let row = 0; row < totalImpact; row++) {
            const rowData = [];
            for (let col = 0; col < totalProb; col++) {
              // Procura o quadrante cujo coordinate seja "row:col"
              const quadrant = data.heatMap.heatMapQuadrants.find(
                (q) => q.coordinate === `${row}:${col}`
              );
              rowData.push({
                x: quadrant
                  ? quadrant.probability
                  : data.heatMap.heatMapProbabilities[col]?.name ||
                    `Probabilidade${col + 1}`,
                y: quadrant ? quadrant.value : 0,
                dataLabel: quadrant ? quadrant.label : "0",
              });
            }
            newHeatmapData.push({
              name:
                data.heatMap.heatMapImpacts[row]?.name || `Impacto${row + 1}`,
              data: rowData,
            });
          }
          setHeatmapData(newHeatmapData);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.error("Erro ao buscar dados do perfil:", err.message);
        }
      };

      fetchPerfilDados();
    }
  }, [dadosApi, token]);

  // ====================================== HANDLERS GERAIS ======================================
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const [formValidation, setFormValidation] = useState({
    nome: true,
    quantidadeNiveisProbabiliade: true,
    quantidadeNiveisImpacto: true,
    metodologia: true,
    nivelAvaliacao: true,
  });

  const tratarSubmit = async () => {
    // Validação dos campos obrigatórios
    const missingFields = [];
    const probNum = Number(quantidadeNiveisProbabiliade);
    const impactNum = Number(quantidadeNiveisImpacto);

    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!quantidadeNiveisProbabiliade || probNum < 2) {
      setFormValidation((prev) => ({ ...prev, quantidadeNiveisProbabiliade: false }));
      missingFields.push("Quantidade de níveis probabilidade (mínimo 2)");
    }
    if (!quantidadeNiveisImpacto || impactNum < 2) {
      setFormValidation((prev) => ({ ...prev, quantidadeNiveisImpacto: false }));
      missingFields.push("Quantidade de níveis impactos (mínimo 2)");
    }
    if (!formData.metodologia) {
      setFormValidation((prev) => ({ ...prev, metodologia: false }));
      missingFields.push("Metodologia");
    }
    if (!formData.nivelAvaliacao) {
      setFormValidation((prev) => ({ ...prev, nivelAvaliacao: false }));
      missingFields.push("Níveis de avaliação");
    }

    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Por favor, preencha os campos: ${missingFields.join(", ")}`,
        { variant: "warning" }
      );
      return;
    }

    // Construindo a payload conforme o endpoint exige
    const payload = {
      // Se for edição, inclui o idAnalisysProfile
      ...(requisicao === "Editar" && {
        idAnalisysProfile: dadosApi.idAnalysisProfile,
      }),
      name: nome,
      quantityLevelsProbabilityMatrix:
        Number(quantidadeNiveisProbabiliade) || 0,
      quantityLevelsImpactMatrix: Number(quantidadeNiveisImpacto) || 0,
      quantitativeMetricTypeProbability: formData.metricaProbabilidade || 1,
      quantitativeMetricTypeImpact: formData.metricaImpacto || 1,
      idIndex: formData.indice || null,
      methodology: formData.metodologia || 1,
      assessmentLevel: formData.nivelAvaliacao || 1,
      // Usa os títulos definidos na tela para os eixos
      axisX: heatmapOptions.xaxis.title.text,
      axisY: heatmapOptions.yaxis.title.text,
      hasQuantitative: quantitativo,
      heatMapRanges: heatmapOptions.plotOptions.heatmap.colorScale.ranges.map(
        (range) => ({
          start: Number(range.from) || 0,
          end: Number(range.to) || 0,
          name: range.name || "",
          color: range.color || "",
        })
      ),
      // Rótulos e nomes de probabilidade
      heatMapProbabilities: probLabels.map((label, index) => ({
        name: label,
        quantitative: probNames[index] || "",
      })),
      // Rótulos e nomes de impacto
      heatMapImpacts: impactLabels.map((label, index) => ({
        name: label,
        quantitative: impactNames[index] || "",
      })),
      heatMapQuadrants: heatmapData.flatMap((series, rowIndex) =>
        series.data.map((cell, colIndex) => ({
          coordinate: `${rowIndex}:${colIndex}`,
          impact: series.name,
          probability: cell.x,
          value: cell.y,
          label: cell.dataLabel,
        }))
      ),
    };

    let url = "";
    let method = "";
    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}analisys-profile`;
      method = "POST";
    } else if (requisicao === "Editar") {
      // Caso seja edição, ajuste a URL e método conforme necessário (exemplo com PUT)
      url = `${process.env.REACT_APP_API_URL}analisys-profile/${dadosApi.idAnalysisProfile}`;
      method = "PUT";
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

      if (!response.ok) {
        throw new Error("Erro ao enviar os dados.");
      } else {
        enqueueSnackbar(`Perfil ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }
      voltarParaCadastroMenu();
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse perfil.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const mergeHeatmapData = (
    prob,
    impact,
    oldData,
    probLabels,
    impactLabels
  ) => {
    const newData = [];

    for (let i = 0; i < impact; i++) {
      const oldRow = oldData[i];

      const rowName = impactLabels[i]
        ? impactLabels[i]
        : oldRow?.name || `Impacto${i + 1}`;

      const rowData = [];

      for (let j = 0; j < prob; j++) {
        const oldCell = oldRow?.data[j];
        const xValue = probLabels[j]
          ? probLabels[j]
          : oldCell?.x || `Probabilidade${j + 1}`;
        const yValue = oldCell ? oldCell.y : (i + 1) * (j + 1);
        const dataLabelValue = oldCell
          ? oldCell.dataLabel
          : String((i + 1) * (j + 1));

        rowData.push({
          x: xValue,
          y: yValue,
          dataLabel: dataLabelValue,
        });
      }

      newData.push({
        name: rowName,
        data: rowData,
      });
    }

    return newData;
  };

  // ====================================== CONFIGURAÇÃO DO HEATMAP ======================================
  const [heatmapData, setHeatmapData] = useState([]);

  // Diálogo de edição via clique no quadrante
  const [cellEditInfo, setCellEditInfo] = useState({
    open: false,
    rowIdx: -1,
    colIdx: -1,
    currentLabel: "",
  });

  const handleFaixaNomeChange = (index, value) => {
    setHeatmapOptions((prev) => {
      const newRanges = [...prev.plotOptions.heatmap.colorScale.ranges];
      newRanges[index] = {
        ...newRanges[index],
        name: value || "", // Garante que não fique NaN
      };
      return {
        ...prev,
        plotOptions: {
          ...prev.plotOptions,
          heatmap: {
            ...prev.plotOptions.heatmap,
            colorScale: {
              ...prev.plotOptions.heatmap.colorScale,
              ranges: newRanges,
            },
          },
        },
      };
    });
  };

  const handleDialogSave = () => {
    const { rowIdx, colIdx, currentLabel } = cellEditInfo;
    setHeatmapData((prev) => {
      const newData = [...prev];
      const rowData = [...newData[rowIdx].data];

      const numericVal = parseFloat(currentLabel);
      if (!isNaN(numericVal)) {
        rowData[colIdx] = {
          ...rowData[colIdx],
          y: numericVal,
          dataLabel: currentLabel,
        };
      } else {
        // texto puro
        rowData[colIdx] = {
          ...rowData[colIdx],
          dataLabel: currentLabel,
        };
      }

      newData[rowIdx] = { ...newData[rowIdx], data: rowData };
      return newData;
    });

    setCellEditInfo((prev) => ({ ...prev, open: false }));
  };

  const handleDialogClose = () => {
    setCellEditInfo((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Evento do ApexCharts para clique no quadrante
  const apexChartEvents = {
    dataPointSelection: (
      event,
      chartContext,
      { seriesIndex, dataPointIndex, w }
    ) => {
      const clickedCell = w.config.series[seriesIndex].data[dataPointIndex];
      // Se tiver dataLabel, mostra no Dialog; senão, mostra o y
      const currentValue = clickedCell.dataLabel || clickedCell.y.toString();
      setCellEditInfo({
        open: true,
        rowIdx: seriesIndex,
        colIdx: dataPointIndex,
        currentLabel: currentValue,
      });
    },
  };

  // Opções do gráfico
  const [heatmapOptions, setHeatmapOptions] = useState({
    chart: {
      type: "heatmap",
      toolbar: {
        show: true,
      },
      height: 400,
      events: apexChartEvents,
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 3, color: "#3dc223" },
            { from: 4, to: 7, color: "#ccc61b" },
            { from: 8, to: 50, color: "#cc1b1b" },
          ],
          defaultColor: "#F5F5F5", // Cinza branco
        },
      },
    },
    grid: {
      padding: {
        top: 10,
        right: 15,
        bottom: 10,
        left: 15,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, { seriesIndex, dataPointIndex, w }) {
        const currentSeries = w.config.series[seriesIndex];
        const label = currentSeries?.data[dataPointIndex]?.dataLabel;
        return label ? label : val;
      },
      style: {
        colors: ["#000000"],
        fontSize: "12px",
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          const label =
            w.config.series[seriesIndex].data[dataPointIndex].dataLabel;
          return label ? label : val;
        },
      },
    },
    xaxis: {
      title: {
        text: "Probabilidade",
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Impacto",
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
  });

  function enforceSequentialRanges(ranges) {
  return ranges.map((r, idx) => {
    const prevTo = idx > 0 ? ranges[idx - 1].to : null;
    const from = idx > 0
      // a partir da 2ª linha: prev.to + 1
      ? prevTo + 1
      // 1ª linha mantém o valor digitado
      : r.from;
    // garante to >= from
    const to = r.to < from ? from : r.to;
    return { ...r, from, to };
  });
}


  // Labels de probabilidade e impacto
  const [probLabels, setProbLabels] = useState([]);
  const [impactLabels, setImpactLabels] = useState([]);

  // Ao mudar quantidade de prob/impact, mergeamos com o oldData
  useEffect(() => {
    const prob = Number(quantidadeNiveisProbabiliade);
    const impact = Number(quantidadeNiveisImpacto);
    setHeatmapData((oldData) => {
      return mergeHeatmapData(prob, impact, oldData, probLabels, impactLabels);
    });
  }, [quantidadeNiveisProbabiliade, quantidadeNiveisImpacto]);

  // Ao mudar *apenas* os labels, também mergeamos, sem resetar
  useEffect(() => {
    const prob = Number(quantidadeNiveisProbabiliade);
    const impact = Number(quantidadeNiveisImpacto);

    if (prob > 0 && impact > 0) {
      setHeatmapData((oldData) => {
        return mergeHeatmapData(
          prob,
          impact,
          oldData,
          probLabels,
          impactLabels
        );
      });
    }
  }, [probLabels, impactLabels]);

  // Ajustamos o length do array probLabels e impactLabels sempre que a qtd for alterada
  useEffect(() => {
    const prob = Number(quantidadeNiveisProbabiliade);
    setProbLabels((current) => {
      const newArr = [...current];
      while (newArr.length < prob) {
        newArr.push(`Probabilidade${newArr.length + 1}`);
      }
      return newArr.slice(0, prob);
    });
  }, [quantidadeNiveisProbabiliade]);

  useEffect(() => {
    const impact = Number(quantidadeNiveisImpacto);
    setImpactLabels((current) => {
      const newArr = [...current];
      while (newArr.length < impact) {
        newArr.push(`Impacto${newArr.length + 1}`);
      }
      return newArr.slice(0, impact);
    });
  }, [quantidadeNiveisImpacto]);

  // ====================================== EDIÇÃO DOS RÓTULOS NAS TEXTFIELDS ======================================
  const handleProbLabelChange = (idx, value) => {
    setProbLabels((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleImpactLabelChange = (idx, value) => {
    setImpactLabels((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Edição dos títulos dos eixos
  const handleXAxisLabelChange = (event) => {
    const newLabel = event.target.value;
    setHeatmapOptions((prev) => ({
      ...prev,
      xaxis: {
        ...prev.xaxis,
        title: { ...prev.xaxis.title, text: newLabel },
      },
    }));
  };

  const handleYAxisLabelChange = (event) => {
    const newLabel = event.target.value;
    setHeatmapOptions((prev) => ({
      ...prev,
      yaxis: {
        ...prev.yaxis,
        title: { ...prev.yaxis.title, text: newLabel },
      },
    }));
  };

  // ====================================== FAIXAS DE COR DINÂMICAS ======================================
const handleColorRangeChange = (index, field, rawValue) => {
  setHeatmapOptions(prev => {
    // copia array de faixas
    let newRanges = [...prev.plotOptions.heatmap.colorScale.ranges];

    if (field === "from") {
      // primeira linha: permite qualquer valor
      if (index === 0) {
        newRanges[0].from = Number(rawValue) || 0;
      }
      // linhas seguintes ignoram edição manual em “from”
      // serão re-enforced pelo enforceSequentialRanges
    }
    else if (field === "to") {
      newRanges[index].to = Number(rawValue) || newRanges[index].from;
    }
    else if (field === "color") {
      newRanges[index].color = rawValue;
    }

    // aplica sequência e validação em todas as faixas
    newRanges = enforceSequentialRanges(newRanges);

    return {
      ...prev,
      plotOptions: {
        ...prev.plotOptions,
        heatmap: {
          ...prev.plotOptions.heatmap,
          colorScale: {
            ...prev.plotOptions.heatmap.colorScale,
            ranges: newRanges,
          },
        },
      },
    };
  });
};


const addColorRange = () => {
  setHeatmapOptions(prev => {
    const prevRanges = prev.plotOptions.heatmap.colorScale.ranges;
    const last = prevRanges[prevRanges.length - 1];
    const newRanges = [
      ...prevRanges,
      { from: last.to + 1, to: last.to + 25, color: "#aaaaaa", name: "" }
    ];
    return updateRanges(prev, enforceSequentialRanges(newRanges));
  });
};

const removeColorRange = (index) => {
  setHeatmapOptions(prev => {
    const newRanges = prev.plotOptions.heatmap.colorScale.ranges.filter((_, i) => i !== index);
    return updateRanges(prev, enforceSequentialRanges(newRanges));
  });
};

// helper para atualizar só ranges mantendo o restante de prev
function updateRanges(prev, ranges) {
  return {
    ...prev,
    plotOptions: {
      ...prev.plotOptions,
      heatmap: {
        ...prev.plotOptions.heatmap,
        colorScale: {
          ...prev.plotOptions.heatmap.colorScale,
          ranges: [...ranges], // Garante que um novo array de ranges seja criado
        },
      },
    },
  };
}


  // ====================================== POPUP DE COR ======================================
  const [colorPickerInfo, setColorPickerInfo] = useState({
    open: false,
    anchorEl: null,
    rangeIndex: -1,
  });

  const handleOpenColorPicker = (event, idx) => {
    setColorPickerInfo({
      open: true,
      anchorEl: event.currentTarget,
      rangeIndex: idx,
    });
  };

  const handleCloseColorPicker = () => {
    setColorPickerInfo({
      open: false,
      anchorEl: null,
      rangeIndex: -1,
    });
  };

  // Labels de probabilidade e impacto
  const [probNames, setProbNames] = useState([]);
  const [impactNames, setImpactNames] = useState([]);

  // Funções para editar os nomes sem afetar o heatmap
  const handleProbNameChange = (idx, value) => {
    setProbNames((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleImpactNameChange = (idx, value) => {
    setImpactNames((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Ajustamos o tamanho do array para os nomes conforme necessário
  useEffect(() => {
    setProbNames((current) => {
      const newArr = [...current];
      while (newArr.length < probLabels.length) {
        newArr.push("");
      }
      return newArr.slice(0, probLabels.length);
    });
  }, [probLabels]);

  useEffect(() => {
    setImpactNames((current) => {
      const newArr = [...current];
      while (newArr.length < impactLabels.length) {
        newArr.push("");
      }
      return newArr.slice(0, impactLabels.length);
    });
  }, [impactLabels]);

  // Função para obter as propriedades da máscara com base na métrica
  function getMaskProps(metrica) {
    // eslint-disable-next-line default-case
    switch (metrica) {
      case 1: // Percentual
        return {
          suffix: " %",
          allowNegative: false,
          decimalScale: 2,
          fixedDecimalScale: false,
          allowLeadingZeros: false,
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
      case 2: // Moeda
        return {
          prefix: "R$ ",
          allowNegative: false,
          decimalScale: 2,
          fixedDecimalScale: true, // Sempre mostra duas casas
          allowLeadingZeros: false,
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
      case 3: // Quantidade
        return {
          allowNegative: false,
          decimalScale: 2,
          fixedDecimalScale: false,
          allowLeadingZeros: false,
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
      case 4: // Índice
        return {
          allowNegative: false,
          decimalScale: 2,
          fixedDecimalScale: false,
          allowLeadingZeros: false,
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
      case 5: // Percentual do Índice
        return {
          suffix: " %",
          allowNegative: false,
          decimalScale: 2,
          fixedDecimalScale: false,
          allowLeadingZeros: false,
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
    }
  }

  // ====================================== RENDER ======================================
  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2} marginTop={2}>
          {/* ======== CAMPOS PRINCIPAIS (NOME, QUANTIDADES, ETC.) ======== */}
          <Grid item xs={6.01} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>
          <Grid item xs={12 - 6.01}></Grid>

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Quantidade de níveis probabilidade *</InputLabel>
              <TextField
                type="number"
                onChange={(event) => {
                  let numericValue = event.target.value.replace(/\D/g, "");
                  if (!numericValue) {
                    numericValue = "";
                  } else if (parseInt(numericValue, 10) > 9) {
                    numericValue = "9";
                  } else if (parseInt(numericValue, 10) < 2) {
                    numericValue = "2";
                  }
                  setQuantidadeNiveisProbabiliade(numericValue);
                }}
                fullWidth
                value={quantidadeNiveisProbabiliade}
                error={
                  (!quantidadeNiveisProbabiliade || Number(quantidadeNiveisProbabiliade) < 2) &&
                  formValidation.quantidadeNiveisProbabiliade === false
                }
                inputProps={{
                  min: 2,
                  max: 9,
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Quantidade de níveis impactos *</InputLabel>
              <TextField
                type="number"
                onChange={(event) => {
                  let numericValue = event.target.value.replace(/\D/g, "");
                  if (!numericValue) {
                    numericValue = "";
                  } else if (parseInt(numericValue, 10) > 9) {
                    numericValue = "9";
                  } else if (parseInt(numericValue, 10) < 2) {
                    numericValue = "2";
                  }
                  setQuantidadeNiveisImpacto(numericValue);
                }}
                fullWidth
                value={quantidadeNiveisImpacto}
                error={
                  (!quantidadeNiveisImpacto || Number(quantidadeNiveisImpacto) < 2) &&
                  formValidation.quantidadeNiveisImpacto === false
                }
                inputProps={{
                  min: 2,
                  max: 9,
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={3} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Metodologia *</InputLabel>
              <Autocomplete
                options={metodologias}
                getOptionLabel={(option) => option.nome}
                value={
                  metodologias.find(
                    (metodologia) => metodologia.id === formData.metodologia
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    metodologia: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.metodologia &&
                      formValidation.metodologia === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Níveis de avaliação *</InputLabel>
              <Autocomplete
                options={niveisAvaliacao}
                getOptionLabel={(option) => option.nome}
                value={
                  niveisAvaliacao.find(
                    (nivelAvaliacao) =>
                      nivelAvaliacao.id === formData.nivelAvaliacao
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    nivelAvaliacao: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.nivelAvaliacao &&
                      formValidation.nivelAvaliacao === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={4}>
            <Stack spacing={1}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                style={{ marginTop: 37.5, marginLeft: 37.5 }}
              >
                <Switch
                  checked={quantitativo}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    setQuantitativo(isChecked);

                    if (!isChecked) {
                      setFormData((prev) => ({
                        ...prev,
                        indice: "",
                        metrica: "",
                      }));
                    }
                  }}
                />
                <Typography>Quantitativo</Typography>
              </Stack>
            </Stack>
          </Grid>

          {quantitativo && (
            <>
              <Grid item xs={6.01} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Índices</InputLabel>
                  <Autocomplete
                    options={indices}
                    getOptionLabel={(option) => option.nome}
                    value={
                      indices.find((indice) => indice.id === formData.indice) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        indice: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.indice && formValidation.indice === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6.01} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Métrica de Probabilidade</InputLabel>
                  <Autocomplete
                    options={metricasProbabilidade}
                    getOptionLabel={(option) => option.nome}
                    value={
                      metricasProbabilidade.find(
                        (item) => item.id === formData.metricaProbabilidade
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        metricaProbabilidade: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Probabilidade:", newValue?.mask);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.metricaProbabilidade &&
                          formValidation.metrica === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6.01} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Métrica de Impacto</InputLabel>
                  <Autocomplete
                    options={metricasImpacto}
                    getOptionLabel={(option) => option.nome}
                    value={
                      metricasImpacto.find(
                        (item) => item.id === formData.metricaImpacto
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        metricaImpacto: newValue ? newValue.id : "",
                      }));
                      // Exemplo de uso da mask:
                      // console.log("Máscara de Impacto:", newValue?.mask);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.metricaImpacto &&
                          formValidation.metrica === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Exibe o Heatmap se houver dados */}
          {heatmapData.length > 0 && (
            <>
              {/* GRÁFICO EM PRIMEIRO */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Prévia do Heatmap
                  </Typography>
                  <ReactApexChart
                    key={JSON.stringify(heatmapOptions.plotOptions.heatmap.colorScale.ranges)}
                    options={heatmapOptions}
                    series={heatmapData}
                    type="heatmap"
                    height={350}
                  />
                </Paper>
              </Grid>

              {/* SEÇÃO DE PERSONALIZAÇÃO (faixas de cor, eixos, etc) */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Personalizar Heatmap
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InputLabel>Qtd. Níveis Prob.</InputLabel>
                          <Tooltip
                            placement="top"
                            arrow
                            title="Informe quantos níveis de probabilidade deverão ser exibidos no Heatmap. O valor máximo é 9."
                          >
                            <IconButton>
                              <InfoOutlined fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <TextField
                          type="number"
                          size="small"
                          value={quantidadeNiveisProbabiliade}
                          onChange={(e) => {
                            let numericValue = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            if (!numericValue) {
                              numericValue = "";
                            } else if (parseInt(numericValue, 10) > 9) {
                              numericValue = "9";
                            } else if (parseInt(numericValue, 10) < 2) {
                              numericValue = "2";
                            }
                            setQuantidadeNiveisProbabiliade(numericValue);
                          }}
                          inputProps={{
                            max: 9,
                          }}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InputLabel>Qtd. Níveis Impacto</InputLabel>
                          <Tooltip
                            placement="top"
                            arrow
                            title="Informe quantos níveis de impacto deverão ser exibidos no Heatmap. O valor máximo é 9."
                          >
                            <IconButton>
                              <InfoOutlined fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <TextField
                          type="number"
                          size="small"
                          value={quantidadeNiveisImpacto}
                          onChange={(e) => {
                            let numericValue = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            if (!numericValue) {
                              numericValue = "";
                            } else if (parseInt(numericValue, 10) > 9) {
                              numericValue = "9";
                            } else if (parseInt(numericValue, 10) < 2) {
                              numericValue = "2";
                            }
                            setQuantidadeNiveisImpacto(numericValue);
                          }}
                          inputProps={{
                            max: 9,
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* Campos para os títulos dos eixos */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InputLabel>Título Eixo X</InputLabel>
                          <Tooltip
                            placement="top"
                            arrow
                            title="Defina o texto que aparecerá como título do eixo horizontal (X) do Heatmap."
                          >
                            <IconButton>
                              <InfoOutlined fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <TextField
                          size="small"
                          value={heatmapOptions.xaxis.title.text}
                          onChange={handleXAxisLabelChange}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InputLabel>Título Eixo Y</InputLabel>
                          <Tooltip
                            placement="top"
                            arrow
                            title="Defina o texto que aparecerá como título do eixo vertical (Y) do Heatmap."
                          >
                            <IconButton>
                              <InfoOutlined fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <TextField
                          size="small"
                          value={heatmapOptions.yaxis.title.text}
                          onChange={handleYAxisLabelChange}
                        />
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Faixas de Cor */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Faixas de Cor:
                      </Typography>
                      <Tooltip
                        placement="top"
                        arrow
                        title="Configure as faixas de cor para cada intervalo de valores do Heatmap. É possível adicionar ou remover faixas conforme necessário."
                      >
                        <IconButton>
                          <InfoOutlined fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Box display="flex" gap={2} mb={2}>
                      <Button
                        variant="contained"
                        onClick={addColorRange}
                        style={{
                          textTransform: "none",
                        }}
                      >
                        Adicionar faixa do quadrante
                      </Button>
                    </Box>

                    {heatmapOptions.plotOptions.heatmap.colorScale.ranges.map(
                      (range, idx) => (
                        <Box
                          key={idx}
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          {/* Input "from" */}
                          <Box sx={{ mr: 1 }}>
                            <TextField
                              label="De"
                              type="number"
                              size="small"
                              value={range.from}
                              onChange={(e) =>
                                handleColorRangeChange(
                                  idx,
                                  "from",
                                  e.target.value
                                )
                              }
                              sx={{ width: "70px" }}
                            />
                          </Box>

                          {/* Input "to" */}
                          <Box sx={{ mr: 1 }}>
                            <TextField
                              label="Até"
                              type="number"
                              size="small"
                              value={range.to}
                              onChange={(e) =>
                                handleColorRangeChange(
                                  idx,
                                  "to",
                                  e.target.value
                                )
                              }
                              sx={{ width: "70px" }}
                            />
                          </Box>

                          {/* Quadradinho de cor (abre Popover) */}
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              backgroundColor: range.color,
                              cursor: "pointer",
                              border: "1px solid #ccc",
                              borderRadius: 1,
                              mr: 2,
                            }}
                            onClick={(e) => handleOpenColorPicker(e, idx)}
                          />

                          {/* Campo para nome da faixa */}
                          <TextField
                            label="Nome do quadrante"
                            size="small"
                            value={range.name ?? ""}
                            onChange={(e) =>
                              handleFaixaNomeChange(idx, e.target.value)
                            }
                            sx={{ width: "150px", mr: 2 }}
                            InputLabelProps={{ shrink: true }}
                          />

                          {/* Ícone de remover faixa */}
                          <IconButton
                            size="small"
                            onClick={() => removeColorRange(idx)}
                            disabled={
                              heatmapOptions.plotOptions.heatmap.colorScale
                                .ranges.length <= 1
                            }
                          >
                            <DeleteForeverOutlined color="error" />
                          </IconButton>
                        </Box>
                      )
                    )}
                  </Box>

                  {/* Rótulos de Probabilidade e Impacto */}
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Rótulos e Nomes de Probabilidade (Colunas)
                        </Typography>
                        {probLabels.map((label, idx) => (
                          <Grid container spacing={1} key={idx}>
                            <Grid item xs={6}>
                              <TextField
                                label={`Rótulo Prob. ${idx + 1}`}
                                
                                fullWidth
                                value={label}
                                onChange={(e) =>
                                  handleProbLabelChange(idx, e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            {quantitativo && (
                              <Grid item xs={6}>
                                <NumericFormat
                                  customInput={TextField}
                                  label={`Quantitativo Prob. ${idx + 1}`}
                                  
                                  fullWidth
                                  value={probNames[idx]}
                                  onValueChange={(values) =>
                                    handleProbNameChange(idx, values.value)
                                  }
                                  allowEmptyFormatting={false}
                                  {...getMaskProps(
                                    formData.metricaProbabilidade
                                  )}
                                  sx={{
                                    // esconde qualquer placeholder renderizado no input
                                    "& input::placeholder": {
                                      color: "transparent",
                                      opacity: 0,
                                    },
                                  }}
                                />
                              </Grid>
                            )}
                          </Grid>
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Rótulos e Nomes de Impacto (Linhas)
                        </Typography>
                        {impactLabels.map((label, idx) => (
                          <Grid container spacing={1} key={idx}>
                            <Grid item xs={6}>
                              <TextField
                                label={`Rótulo Impacto ${idx + 1}`}
                                
                                fullWidth
                                value={label}
                                onChange={(e) =>
                                  handleImpactLabelChange(idx, e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            {quantitativo && (
                              <Grid item xs={6}>
                                <NumericFormat
                                  customInput={TextField}
                                  label={`Quantitativo Impacto ${idx + 1}`}
                                  
                                  fullWidth
                                  value={impactNames[idx]}
                                  onValueChange={(values) =>
                                    handleImpactNameChange(idx, values.value)
                                  }
                                  allowEmptyFormatting={false}
                                  {...getMaskProps(formData.metricaImpacto)}
                                  sx={{
                                    "& input::placeholder": {
                                      color: "transparent",
                                      opacity: 0,
                                    },
                                  }}
                                />
                              </Grid>
                            )}
                          </Grid>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </>
          )}

          {/* Botão de ação (Salvar/Atualizar) */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            {requisicao === "Criar" ? (
              <Button
                variant="contained"
                color="primary"
                onClick={tratarSubmit}
                sx={{
                  width: "120px",
                  height: "36px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Atualizar
              </Button>
            ) : null}
            </Box>
          </Grid>
        </Grid>
      </LocalizationProvider>

      {/* DIALOG ABERTO AO CLICAR NO QUADRANTE (dataPointSelection) */}
      <Dialog open={cellEditInfo.open} onClose={handleDialogClose}>
        <DialogTitle>Editar Quadrante</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Digite um texto ou um número para alterar a cor:
          </Typography>
          <TextField
            fullWidth
            value={cellEditInfo.currentLabel}
            onChange={(e) =>
              setCellEditInfo((prev) => ({
                ...prev,
                currentLabel: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleDialogSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popover do ColorPicker */}
      <Popover
        open={colorPickerInfo.open}
        anchorEl={colorPickerInfo.anchorEl}
        onClose={handleCloseColorPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <SketchPicker
          color={localColor}
          onChange={(colorResult) => {
            setLocalColor(colorResult.rgb);
          }}
          onChangeComplete={(colorResult) => {
            handleColorRangeChange(
              colorPickerInfo.rangeIndex,
              "color",
              colorResult.hex
            );
          }}
          presetColors={[
            "#D0021B",
            "#F5A623",
            "#F8E71C",
            "#8B572A",
            "#7ED321",
            "#417505",
            "#BD10E0",
            "#9013FE",
            "#4A90E2",
            "#50E3C2",
            "#B8E986",
            "#000000",
            "#999999",
            "#ffffff",
          ]}
          disableAlpha={false}
        />
      </Popover>

      {requisicao === "Editar" && (
        <AndamentoHistoricoDrawer
          row={dadosApi}
          open={drawerOpen}
          onClose={handleDrawerClose}
          vindoDe={"Tipo de Andamentos"}
        />
      )}
    </>
  );
}

export default ColumnsLayouts;
