import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Chip, List, ListItem, ListItemText, Divider, Grid, Paper 
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import ApexTree from 'apextree';
import { useDepartmentStructure } from './useDepartmentStructure'; 

// Import dos Gráficos
import DepartmentActionPlanChart from './DepartmentActionPlanChart';
import DepartmentRiskChart from './DepartmentRiskChart';
import DepartmentNormativeChart from './DepartmentNormativeChart';

const API_ENDPOINT = "https://api.egrc.homologacao.com.br/api/v1/departments/reports/types";

const DepartmentOrgChartAdvanced = () => {
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const graphRef = useRef(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { treeData, isLoading, error } = useDepartmentStructure(API_ENDPOINT);
  const nodeLookup = useRef(new Map());

  const apexData = useMemo(() => {
    if (!treeData || (Array.isArray(treeData) && treeData.length === 0)) return null;
    const rootNode = Array.isArray(treeData) ? treeData[0] : treeData;
    if (!rootNode) return null;
    
    nodeLookup.current.clear();
    const palette = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#fce4ec'];
    const visited = new Set();

    const convertToApexNode = (node, depth = 0) => {
      if (!node || !node.id) return null;

      // --- ALTERAÇÃO: Filtra itens inativos da árvore principal ---
      // Verifica se a propriedade active é explicitamente false ou se o atributo Ativa é 'Não'
      const isInactive = node.active === false || node.attributes?.Ativa === 'Não';
      if (isInactive) return null;
      // -----------------------------------------------------------

      if (visited.has(node.id)) return null; 
      visited.add(node.id);

      // --- ALTERAÇÃO: Filtra relacionamentos laterais inativos ---
      // Isso garante que o contador e a lista do modal mostrem apenas ativos
      const activeSides = (node.sides || []).filter(side => side.active !== false);
      // -----------------------------------------------------------

      nodeLookup.current.set(node.id, {
        name: node.name, 
        sides: activeSides, 
        attributes: node.attributes, 
        active: node.active
      });

      const color = palette[Math.min(depth, palette.length - 1)];
      
      // Processa os filhos recursivamente (filhos inativos retornarão null e serão filtrados pelo Boolean)
      const children = (node.children || [])
        .map(child => convertToApexNode(child, depth + 1))
        .filter(Boolean);

      return {
        id: node.id,
        data: { 
          id: node.id, 
          name: node.name, 
          sides: activeSides, 
          attributes: node.attributes 
        },
        options: { nodeBGColor: color, nodeBGColorHover: color },
        ...(children.length > 0 ? { children } : {})
      };
    };

    return convertToApexNode(rootNode, 0);
  }, [treeData]);

  const nodeTemplate = useCallback((content) => {
    if (!content) return '';
    const { id, name, sides, attributes } = content;
    const sideCount = sides ? sides.length : 0;
    // Ajuste visual para sempre mostrar Ativo, já que filtramos os inativos, 
    // mas mantive a lógica caso queira mudar de ideia futuramente.
    const tipo = attributes?.Tipo || (attributes?.Ativa === 'Sim' ? 'Ativo' : 'Ativo'); 

    let html = `<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; width: 100%; padding: 12px; box-sizing: border-box; font-family: 'Roboto', sans-serif; position: relative;">`;
    html += `<div style="font-weight: 600; font-size: 14px; color: #1a202c; margin-bottom: 8px; line-height: 1.2; flex-grow: 1; display: flex; align-items: center;">${name}</div>`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">`;
    html += `<span style="font-size: 10px; color: #718096; background: rgba(255,255,255,0.6); padding: 2px 6px; border-radius: 4px;">${tipo}</span>`;
    
    if (sideCount > 0) {
      html += `<div class="related-btn" data-id="${id}" style="cursor: pointer; font-size: 11px; color: #fff; background-color: #1976d2; padding: 3px 8px; border-radius: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;">Relacionados: ${sideCount}</div>`;
    }
    
    html += `</div></div>`;
    return html;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = (e) => {
      const btn = e.target.closest('.related-btn');
      if (btn) {
        const deptId = btn.getAttribute('data-id');
        const deptData = nodeLookup.current.get(deptId);
        if (deptData) { setSelectedDept(deptData); setIsModalOpen(true); }
        e.stopPropagation(); 
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [apexData]);

  useEffect(() => {
    if (!containerRef.current || !apexData) return;
    const options = {
      contentKey: 'data', width: '100%', height: '700px',
      nodeWidth: 220, nodeHeight: 110, childrenSpacing: 60, siblingSpacing: 30,
      direction: 'top', enableToolbar: true, enableExpandCollapse: true,
      nodeTemplate: nodeTemplate,
      canvasStyle: 'background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 12px;',
    };
    if (treeRef.current) { treeRef.current.options = { ...treeRef.current.options, ...options }; }
    else { treeRef.current = new ApexTree(containerRef.current, options); }
    
    // Limpa o canvas antes de renderizar para evitar duplicações visuais em HMR
    if(graphRef.current) { /* Lógica opcional de cleanup se necessário */ }
    
    graphRef.current = treeRef.current.render(apexData);
  }, [apexData, nodeTemplate]);

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedDept(null); };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Carregando Organograma...</Typography></Box>;
  if (error) return <Alert severity="error">Erro: {error}</Alert>;
  if (!apexData) return <Alert severity="info">Nenhum dado encontrado ou todos os departamentos estão inativos.</Alert>;

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Grid container spacing={3}>
        
        {/* 1. Organograma (Topo) */}
        <Grid item xs={12}>
          <Box ref={containerRef} sx={{ width: '100%', height: '700px', boxShadow: 3, borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }} />
        </Grid>

        {/* 2. Gráficos de Operação (Planos e Riscos) */}
        <Grid item xs={12}>
          <DepartmentActionPlanChart />
        </Grid>
        
        <Grid item xs={12}>
           <DepartmentRiskChart />
        </Grid>

        {/* 3. Gráfico de Normas e Espaço Livre */}
        <Grid item xs={12}>
           <DepartmentNormativeChart />
        </Grid>
        <Grid item xs={12} md={6}>
           {/* Espaço Reservado para Futuro Gráfico/Logo */}
           <Paper elevation={0} sx={{ height: '100%', minHeight: '350px', border: '2px dashed #e0e0e0', borderRadius: 3, bgcolor: 'transparent' }} />
        </Grid>

      </Grid>

      {/* Modal de Detalhes do Organograma */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, padding: 1 } }}>
        {selectedDept && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #eee', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>{selectedDept.name}</Typography>
              <Typography variant="caption" color="text.secondary">Detalhes e Relacionamentos</Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbfbfb' }}>
                    <Typography variant="subtitle2" gutterBottom>Informações:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(selectedDept.attributes || {}).map(([key, value]) => (
                         <Chip key={key} label={`${key}: ${value}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                   <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, display: 'flex', alignItems: 'center' }}>
                     <AppsIcon sx={{ mr: 1, fontSize: 20, color: '#555' }} />
                     Departamentos Relacionados ({selectedDept.sides.length})
                   </Typography>
                   {selectedDept.sides.length > 0 ? (
                     <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                       {selectedDept.sides.map((side, index) => (
                         <React.Fragment key={side.idDepartment || index}>
                           <ListItem>
                             {/* Como filtramos antes, todos aqui serão Ativos */}
                             <ListItemText primary={side.name} secondary="Ativo" />
                           </ListItem>
                           {index < selectedDept.sides.length - 1 && <Divider component="li" />}
                         </React.Fragment>
                       ))}
                     </List>
                   ) : (
                     <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>Nenhum departamento lateral vinculado.</Typography>
                   )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} variant="contained" color="primary" sx={{ borderRadius: 2 }}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DepartmentOrgChartAdvanced;