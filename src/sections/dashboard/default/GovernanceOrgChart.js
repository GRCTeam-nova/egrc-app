import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import ApexTree from 'apextree';

import { API_URL } from 'config';
import MainCard from '../../../components/MainCard';
import { useGovernanceStructure } from './useGovernanceStructure';

const API_ENDPOINT = `${API_URL}companies/reports/governance-structure`;

const GovernanceOrgChartAdvanced = () => {
  const containerRef = useRef(null);
  const treeRef = useRef(null);

  const { treeData, hasMeaningfulStructure, isLoading, error } = useGovernanceStructure(API_ENDPOINT);

  const apexData = useMemo(() => {
    if (!hasMeaningfulStructure || !treeData || treeData.length === 0) {
      return null;
    }

    const palette = ['#e3f2fd', '#fce4ec', '#e8f5e9', '#fffde7', '#f3e5f5'];
    let idCounter = 0;

    const convertNode = (node, depth = 0) => {
      if (!node || node.active === false) {
        return null;
      }

      const children = (node.children || [])
        .map((child) => convertNode(child, depth + 1))
        .filter(Boolean);

      const color = palette[Math.min(depth, palette.length - 1)];

      return {
        id: `node-${idCounter++}`,
        data: {
          name: node.name || '',
          attributes: node.attributes || {},
        },
        options: {
          nodeBGColor: color,
          nodeBGColorHover: color,
        },
        ...(children.length > 0 ? { children } : {}),
      };
    };

    if (Array.isArray(treeData) && treeData.length > 1) {
      const children = treeData.map((node) => convertNode(node, 1)).filter(Boolean);

      return {
        id: 'root',
        data: { name: 'Estrutura Societaria', attributes: {} },
        options: {
          nodeBGColor: palette[0],
          nodeBGColorHover: palette[0],
        },
        ...(children.length > 0 ? { children } : {}),
      };
    }

    const singleRoot = Array.isArray(treeData) ? treeData[0] : treeData;
    return convertNode(singleRoot, 0);
  }, [hasMeaningfulStructure, treeData]);

  const nodeTemplate = useCallback((content) => {
    if (!content) {
      return '';
    }

    const { name, attributes } = content;
    let html = '<div style="display:flex;flex-direction:column;align-items:flex-start;padding:4px;">';
    html += `<div style="font-weight:bold;margin-bottom:2px;">${name}</div>`;

    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        html += `<div style="font-size:10px;white-space:nowrap;"><strong>${key}:</strong> ${attributes[key]}</div>`;
      });
    }

    html += '</div>';
    return html;
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !apexData) {
      return undefined;
    }

    const options = {
      contentKey: 'data',
      width: '100%',
      height: '600px',
      nodeWidth: 220,
      nodeHeight: 90,
      childrenSpacing: 60,
      siblingSpacing: 30,
      direction: 'top',
      enableToolbar: true,
      enableExpandCollapse: true,
      nodeTemplate,
      canvasStyle: 'background: #fdfdfd;',
    };

    if (!treeRef.current) {
      treeRef.current = new ApexTree(container, options);
    } else {
      treeRef.current.options = { ...treeRef.current.options, ...options };
    }

    treeRef.current.render(apexData);

    return () => {
      container.innerHTML = '';
    };
  }, [apexData, nodeTemplate]);

  if (isLoading) {
    return (
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Carregando estrutura societaria...
          </Typography>
        </Box>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item xs={12}>
        <Alert severity="error" sx={{ minHeight: '120px', display: 'flex', alignItems: 'center' }}>
          Erro ao carregar a estrutura societaria: {error}
        </Alert>
      </Grid>
    );
  }

  if (!hasMeaningfulStructure || !apexData) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h5">Estrutura de Governanca</Typography>
      <MainCard sx={{ mt: 1.5 }} content={false}>
        <Box sx={{ p: 2 }}>
          <Box ref={containerRef} sx={{ width: '100%', height: '600px' }} />
        </Box>
      </MainCard>
    </Grid>
  );
};

export default GovernanceOrgChartAdvanced;
