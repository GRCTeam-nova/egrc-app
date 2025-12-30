import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
// ApexTree is a vanilla JavaScript library (from ApexCharts) for drawing
// hierarchical diagrams. We import it directly and instantiate it inside
// a useEffect hook. See https://github.com/apexcharts/apextree for more details.
import ApexTree from 'apextree';
import { useGovernanceStructure } from './useGovernanceStructure';

// API endpoint used by the governance structure hook. Move this to a config file
// if you need to reuse it elsewhere.
const API_ENDPOINT = `${API_URL}companies/reports/governance-structure`;

const GovernanceOrgChartAdvanced = () => {
  // Reference to the container element where ApexTree will render the SVG
  const containerRef = useRef(null);
  // Store the ApexTree instance so we can reuse it when data changes
  const treeRef = useRef(null);
  // Track the most recently rendered graph instance (returned by tree.render)
  const graphRef = useRef(null);

  // Fetch the governance structure via the custom hook. It returns an array of
  // root nodes with `name`, `attributes` and `children` fields.
  const { treeData, isLoading, error } = useGovernanceStructure(API_ENDPOINT);

  /**
   * Recursively convert our business data structure into the format expected by
   * ApexTree. Nodes with `attributes.Ativa === 'Não'` are filtered out along
   * with all their descendants. Each node is assigned a unique id so that
   * ApexTree can collapse/expand them. We also attach per‑node colour options
   * based on depth to aid visual separation.
   */
  const apexData = useMemo(() => {
    if (!treeData || treeData.length === 0) {
      return null;
    }
    // Colour palette for different depths. Additional depths reuse the last colour.
    const palette = [
      '#e3f2fd', // level 0: light blue
      '#fce4ec', // level 1: light pink
      '#e8f5e9', // level 2: light green
      '#fffde7', // level 3: light yellow
      '#f3e5f5', // level 4: light purple
    ];
    let idCounter = 0;
    const convertNode = (node, depth = 0) => {
      // Skip inactive companies entirely
      const activeFlag = node?.attributes?.Ativa;
      if (typeof activeFlag === 'string' && activeFlag.trim().toLowerCase() === 'não') {
        return null;
      }
      const currentId = `node-${idCounter++}`;
      const children = (node.children || [])
        .map((child) => convertNode(child, depth + 1))
        .filter(Boolean);
      // Determine a background colour based on depth
      const colour = palette[Math.min(depth, palette.length - 1)];
      return {
        id: currentId,
        data: {
          name: node.name || '',
          attributes: node.attributes || {},
        },
        options: {
          nodeBGColor: colour,
          nodeBGColorHover: colour,
        },
        // Only include children property if there are descendants. ApexTree
        // treats undefined children gracefully.
        ...(children.length > 0 ? { children } : {}),
      };
    };
    // If there are multiple root entities, wrap them in a pseudo root node
    if (Array.isArray(treeData) && treeData.length > 1) {
      const children = treeData.map((n) => convertNode(n, 1)).filter(Boolean);
      return {
        id: 'root',
        data: { name: 'Estrutura Societária', attributes: {} },
        options: {
          nodeBGColor: palette[0],
          nodeBGColorHover: palette[0],
        },
        ...(children.length > 0 ? { children } : {}),
      };
    }
    // Single root
    const single = Array.isArray(treeData) ? treeData[0] : treeData;
    return convertNode(single, 0);
  }, [treeData]);

  /**
   * Define a custom HTML template for each node. The `content` argument is
   * whatever is stored under the `data` key for that node. We display the
   * company name prominently and list its attributes below. We use inline
   * styles because ApexTree expects a string of HTML for its template.
   */
  const nodeTemplate = useCallback((content) => {
    if (!content) return '';
    const { name, attributes } = content;
    let html = `<div style="display:flex;flex-direction:column;align-items:flex-start;padding:4px;">`;
    html += `<div style="font-weight:bold;margin-bottom:2px;">${name}</div>`;
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        const value = attributes[key];
        html += `<div style="font-size:10px;white-space:nowrap;"><strong>${key}:</strong> ${value}</div>`;
      });
    }
    html += `</div>`;
    return html;
  }, []);

  /**
   * Initialise or update the ApexTree instance whenever the underlying data
   * changes. ApexTree renders into an HTML element (containerRef.current).
   * The options configure the overall layout and appearance. We enable the
   * built‑in toolbar for zoom and pan interactions and expand/collapse icons.
   */
  useEffect(() => {
    if (!containerRef.current || !apexData) return;
    const options = {
      // Use 'data' as the content key so nodeTemplate receives our custom data
      contentKey: 'data',
      // Make the tree responsive; ApexTree accepts percentage strings
      width: '100%',
      height: '600px',
      nodeWidth: 220,
      nodeHeight: 90,
      childrenSpacing: 60,
      siblingSpacing: 30,
      direction: 'top',
      enableToolbar: true,
      enableExpandCollapse: true,
      // Provide our custom HTML template
      nodeTemplate: nodeTemplate,
      // Basic canvas styling. You can customise border/background here.
      canvasStyle: 'background: #fdfdfd;',
    };
    // If we haven't created a tree yet, do it now
    if (!treeRef.current) {
      treeRef.current = new ApexTree(containerRef.current, options);
    } else {
      // Update options on the existing instance to reflect any changes
      treeRef.current.options = { ...treeRef.current.options, ...options };
    }
    // Render or re-render the tree with new data
    graphRef.current = treeRef.current.render(apexData);
  }, [apexData, nodeTemplate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando Estrutura Societária...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ height: '600px', display: 'flex', alignItems: 'center' }}>
        Erro ao carregar a estrutura societária: {error}
      </Alert>
    );
  }

  if (!apexData) {
    return (
      <Alert severity="info" sx={{ height: '600px', display: 'flex', alignItems: 'center' }}>
        Nenhuma estrutura societária encontrada para exibição.
      </Alert>
    );
  }

  return (
    // The container element receives the ApexTree rendering. It must have an
    // explicit height for SVG sizing.
    <Box ref={containerRef} sx={{ width: '100%', height: '600px' }} />
  );
};


GovernanceOrgChartAdvanced.propTypes = {};

export default GovernanceOrgChartAdvanced;
