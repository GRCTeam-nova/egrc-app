import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Ícone de Risco
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // Ícone de Controle
import BuildIcon from '@mui/icons-material/Build'; // Ícone de Deficiência/Issue
import AssignmentIcon from '@mui/icons-material/Assignment'; // Ícone de Teste
import FactCheckIcon from '@mui/icons-material/FactCheck'; // Ícone CVAR
import RefreshIcon from '@mui/icons-material/Refresh';

// 1. Importação do hook de token
import { useToken } from "../../../api/TokenContext";

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/controls/reports";

// 2. Hook de Dados
const useControlReports = (url, token) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!token) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Token inválido ou expirado");
        throw new Error(`Erro: ${response.status}`);
      }
      const json = await response.json();
      setData(json.reportControls || []); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, token]);

  return { data, isLoading, error, refetch: fetchData };
};

const RiskControlMatrix = () => {
  const { token } = useToken(); 
  const { data, isLoading, error, refetch } = useControlReports(API_ENDPOINT, token);

  // 3. Processamento dos Dados: Agrupar por Processo
  const groupedControls = useMemo(() => {
    if (!data) return {};

    const groups = {};
    
    data.forEach(control => {
      // Normaliza o nome do processo ou usa "Sem Processo Definido"
      const procName = control.process || "Processos Gerais / Não Classificados";
      
      if (!groups[procName]) {
        groups[procName] = [];
      }
      groups[procName].push(control);
    });

    return groups;
  }, [data]);

  if (isLoading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Erro ao carregar matriz: {error}</Alert>;

  const processKeys = Object.keys(groupedControls).sort();

  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 2 }}>
      {/* Cabeçalho do Componente */}
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h6" component="div" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
            Matriz de Riscos e Controles
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Visão consolidada por Processo
            </Typography>
        </Box>
        <Tooltip title="Atualizar Dados">
            <IconButton onClick={refetch} size="small">
                <RefreshIcon />
            </IconButton>
        </Tooltip>
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small" aria-label="risk control matrix">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '20%' }}>Risco Vinculado</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '25%' }}>Controle & Descrição</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '10%' }}>Classificação</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '15%' }}>CVAR & Asserções</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '10%' }}>Testes</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '10%' }}>Issues (Deficiências)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', color: '#1a237e', width: '10%' }}>Planos de Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processKeys.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        Nenhum controle encontrado.
                    </TableCell>
                 </TableRow>
            ) : (
                processKeys.map((procName) => (
                <React.Fragment key={procName}>
                    {/* Linha de Cabeçalho do Grupo (Processo) */}
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell colSpan={7} sx={{ py: 1.5, borderBottom: '2px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 20, bgcolor: '#1a237e', borderRadius: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                                PROCESSO: {procName}
                            </Typography>
                            <Chip label={`${groupedControls[procName].length} controles`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                    </TableCell>
                    </TableRow>

                    {/* Linhas dos Controles */}
                    {groupedControls[procName].map((control) => (
                    <TableRow key={control.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        
                        {/* 1. Riscos */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                            {control.risks && control.risks.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {control.risks.map((risk, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <WarningAmberIcon sx={{ fontSize: 14, color: '#f57c00' }} />
                                            <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                                                {risk}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Não mapeado
                                </Typography>
                            )}
                        </TableCell>

                        {/* 2. Controle (Código + Nome) */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <VerifiedUserIcon sx={{ fontSize: 16, color: control.active ? 'success.main' : 'text.disabled', mt: 0.3 }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                        {control.code} - {control.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Resp: {control.responsible || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </TableCell>

                         {/* 3. Classificação (Preventivo/Manual/Etc) */}
                         <TableCell sx={{ verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Chip 
                                    label={control.preventiveDetective ? "Preventivo" : "Detetivo"} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                    sx={{ height: 20, fontSize: '0.65rem' }} 
                                />
                                {control.execution && (
                                    <Chip 
                                        label={control.execution} 
                                        size="small" 
                                        variant="outlined" 
                                        sx={{ height: 20, fontSize: '0.65rem' }} 
                                        color={control.execution === 'Automático' ? 'info' : 'default'}
                                    />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                   Freq: {control.frequency > 0 ? control.frequency : 'Evt'}
                                </Typography>
                            </Box>
                        </TableCell>

                        {/* 4. CVAR / Asserções */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {control.cvars && control.cvars.length > 0 ? (
                                    control.cvars.map((cvar, i) => (
                                        <Chip 
                                            key={i} 
                                            icon={<FactCheckIcon style={{ fontSize: 12 }} />}
                                            label={cvar} 
                                            size="small" 
                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e3f2fd', color: '#0d47a1' }} 
                                        />
                                    ))
                                ) : (
                                    <Typography variant="caption">-</Typography>
                                )}
                            </Box>
                        </TableCell>

                        {/* 5. Testes (Placeholder - Dado não disponível no JSON) */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
                                <AssignmentIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">N/A</Typography>
                            </Box>
                        </TableCell>

                        {/* 6. Issues / Deficiências */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                            {control.deficiencies && control.deficiencies.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {control.deficiencies.map((def, idx) => (
                                        <Chip 
                                            key={idx}
                                            icon={<BuildIcon style={{ fontSize: 10 }} />}
                                            label={def} 
                                            size="small" 
                                            color="error"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.65rem', maxWidth: '100%' }} 
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="success.main">OK</Typography>
                            )}
                        </TableCell>

                        {/* 7. Planos de Ação (Placeholder - Dado não disponível no JSON) */}
                        <TableCell sx={{ verticalAlign: 'top' }}>
                             <Typography variant="caption" color="text.secondary">-</Typography>
                        </TableCell>

                    </TableRow>
                    ))}
                </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RiskControlMatrix;