import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, Divider, Grid, IconButton 
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Ícone de Processo
import DomainIcon from '@mui/icons-material/Domain'; // Ícone de Depto
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import ApexTree from 'apextree';
import { useProcessStructure } from './useProcessStructure';

// Endpoint centralizado para processos
const API_ENDPOINT = `${process.env.REACT_APP_API_URL}processes/reports/types`;

const ProcessFlowChart = () => {
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { treeData, isLoading, error } = useProcessStructure(API_ENDPOINT);
  const nodeLookup = useRef(new Map());

  // Transforma a árvore de dados para o formato visual do ApexTree
  const apexData = useMemo(() => {
    if (!treeData || treeData.length === 0) return null;
    
    const rootNode = treeData[0]; // Assume que o hook já agrupou
    nodeLookup.current.clear();
    
    // Paleta de cores para processos (Tons de Roxo/Indigo)
    const palette = ['#e8eaf6', '#c5cae9', '#9fa8da', '#7986cb', '#5c6bc0'];
    
    const convertNode = (node, depth = 0) => {
      if (!node) return null;
      const id = node.idProcess || `node-${Math.random()}`;
      
      // Salva referência para o clique
      nodeLookup.current.set(id, node);

      const children = (node.children || [])
        .map(child => convertNode(child, depth + 1))
        .filter(Boolean);

      const color = palette[Math.min(depth, palette.length - 1)];

      return {
        id: id,
        data: {
          id: id,
          name: node.name,
          code: node.code,
          depts: node.departaments || [],
          risksCount: (node.risks || []).length
        },
        options: {
          nodeBGColor: color,
          nodeBGColorHover: '#ede7f6',
        },
        ...(children.length > 0 ? { children } : {})
      };
    };

    return convertNode(rootNode, 0);
  }, [treeData]);

  // Template HTML do Nó (Card do Processo)
  const nodeTemplate = useCallback((content) => {
    if (!content) return '';
    const { id, name, code, depts, risksCount } = content;
    
    // Formata departamentos (Ex: "TI, RH + 2")
    let deptLabel = "Sem Depto";
    if (depts && depts.length > 0) {
        const firstNames = depts.slice(0, 2).map(d => d.name).join(', ');
        const remaining = depts.length - 2;
        deptLabel = firstNames + (remaining > 0 ? ` +${remaining}` : '');
    }

    let html = `<div 
      class="process-card-trigger"
      data-id="${id}"
      style="
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
        cursor: pointer;
        justify-content: space-between;
    ">`;
    
    // Cabeçalho: Código
    html += `<div style="font-size: 10px; color: #555; font-weight: bold; letter-spacing: 0.5px;">${code || 'N/A'}</div>`;
    
    // Nome do Processo
    html += `<div style="font-size: 13px; font-weight: 700; color: #1a237e; line-height: 1.2; margin: 4px 0;">
      ${name.length > 40 ? name.substring(0, 40) + '...' : name}
    </div>`;

    // Rodapé: Departamentos e Indicador de Risco
    html += `<div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 6px;">
      <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #666;">
         <span>🏢</span> <span>${deptLabel}</span>
      </div>
      ${risksCount > 0 ? 
        `<div style="background: #ffebee; color: #c62828; font-size: 9px; padding: 2px 6px; border-radius: 10px; font-weight: bold;">
           ⚠ ${risksCount}
         </div>` : ''
      }
    </div>`;

    html += `</div>`;
    return html;
  }, []);

  // Gerencia Cliques (Event Delegation)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = (e) => {
      const card = e.target.closest('.process-card-trigger');
      if (card) {
        const id = card.getAttribute('data-id');
        const nodeData = nodeLookup.current.get(id);
        if (nodeData) {
            setSelectedProcess(nodeData);
            setIsModalOpen(true);
        }
        e.stopPropagation();
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [apexData]);

  // Renderiza Gráfico
  useEffect(() => {
    if (!containerRef.current || !apexData) return;
    const options = {
      contentKey: 'data',
      width: '100%',
      height: '600px',
      nodeWidth: 200,
      nodeHeight: 110,
      childrenSpacing: 50,
      siblingSpacing: 20,
      direction: 'top',
      enableToolbar: true,
      enableExpandCollapse: true,
      nodeTemplate: nodeTemplate,
      canvasStyle: 'background: #f8f9fa; border: 1px solid #c5cae9; border-radius: 12px;',
    };

    if (!treeRef.current) {
      treeRef.current = new ApexTree(containerRef.current, options);
    } else {
      treeRef.current.options = { ...treeRef.current.options, ...options };
    }
    treeRef.current.render(apexData);
  }, [apexData, nodeTemplate]);

  const handleClose = () => setIsModalOpen(false);

  if (isLoading) return <Box sx={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Carregando Fluxo...</Typography></Box>;
  if (error) return <Alert severity="error">Erro: {error}</Alert>;

  return (
    <Box sx={{ position: 'relative' }}>
       {/* Container do Gráfico */}
       <Box ref={containerRef} sx={{ width: '100%', height: '600px', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 2 }} />

       {/* Modal de Detalhes do Processo */}
       <Dialog open={isModalOpen} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          {selectedProcess && (
            <>
              <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2, display: 'flex', justifyContent: 'space-between' }}>
                 <Box>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: 'text.secondary' }}>
                        {selectedProcess.code}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        {selectedProcess.name}
                    </Typography>
                 </Box>
                 <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                 <Grid container spacing={2}>
                    {/* Departamentos */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555', mb: 1 }}>
                            <DomainIcon fontSize="small"/> Departamentos Responsáveis
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedProcess.departaments && selectedProcess.departaments.length > 0 ? 
                                selectedProcess.departaments.map(d => (
                                    <Chip key={d.idDepartment} label={d.name} size="small" variant="outlined" />
                                )) : 
                                <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#999' }}>Nenhum vinculado</Typography>
                            }
                        </Box>
                    </Grid>
                    <Grid item xs={12}><Divider /></Grid>
                    {/* Riscos */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', mb: 1 }}>
                            <WarningAmberIcon fontSize="small"/> Riscos Associados ({selectedProcess.risks.length})
                        </Typography>
                        <List dense sx={{ bgcolor: '#fff5f5', borderRadius: 2 }}>
                            {selectedProcess.risks.length > 0 ? 
                                selectedProcess.risks.map(r => (
                                    <ListItem key={r.idRisk}>
                                        <ListItemText primary={r.code} secondary={r.name} />
                                    </ListItem>
                                )) :
                                <ListItem><ListItemText secondary="Nenhum risco mapeado neste processo." /></ListItem>
                            }
                        </List>
                    </Grid>
                 </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                 <Button onClick={handleClose} variant="contained" color="primary">Fechar</Button>
              </DialogActions>
            </>
          )}
       </Dialog>
    </Box>
  );
};

export default ProcessFlowChart;