import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Box, Typography, Paper, Chip } from '@mui/material';

// Configuração do Layout Automático (Dagre)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Ajuste fino para centralizar
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // Movemos os nós baseados no cálculo do Dagre
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const ProcessFlowMap = ({ data }) => {
  // 1. Transformação dos Dados da API para Nós e Arestas do React Flow
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const addedNodeIds = new Set();

    if (!data) return { initialNodes: [], initialEdges: [] };

    data.forEach((proc) => {
      // Cria o Nó Principal se não existir
      if (!addedNodeIds.has(proc.idProcess)) {
        // Tenta pegar o departamento principal se houver
        const deptName = proc.departaments && proc.departaments.length > 0 
          ? proc.departaments[0].name 
          : 'Sem Depto';

        // Define cor baseada no Nível (processType). Fallback para 1 se null
        const level = proc.processType || 1; 
        const colors = ['#e3f2fd', '#fff3e0', '#e8f5e9', '#f3e5f5', '#ffebee'];
        const bgColor = colors[(level - 1) % colors.length];

        nodes.push({
          id: proc.idProcess,
          data: { 
            label: (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>{proc.code}</Typography>
                <Typography variant="caption" display="block">{proc.name}</Typography>
                <Chip label={deptName} size="small" sx={{mt: 0.5, fontSize: '10px', height: 20}} />
              </Box>
            ) 
          },
          style: { 
            background: bgColor, 
            border: '1px solid #777', 
            borderRadius: 8, 
            width: nodeWidth, 
            padding: 10 
          },
          position: { x: 0, y: 0 }, // Será calculado pelo Dagre
        });
        addedNodeIds.add(proc.idProcess);
      }

      // Lógica de Conexões (Arestas)
      
      // 1. Superior -> Atual
      if (proc.processSuperior) {
         edges.push({
           id: `e-${proc.processSuperior.idProcess}-${proc.idProcess}`,
           source: proc.processSuperior.idProcess,
           target: proc.idProcess,
           type: 'smoothstep',
           animated: true,
           label: 'Superior'
         });
         // Nota: Deveríamos garantir que o nó Superior também esteja na lista de nodes
         // mas no JSON atual ele vem completo, então o loop principal vai pegá-lo eventualmente
         // ou precisamos adicionar nós "fantasmas" se o superior não estiver na lista raiz.
      }

      // 2. Anterior -> Atual
      if (proc.processPrevious) {
        edges.push({
          id: `e-prev-${proc.processPrevious.idProcess}-${proc.idProcess}`,
          source: proc.processPrevious.idProcess,
          target: proc.idProcess,
          type: 'smoothstep',
          style: { stroke: '#ff9800' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' },
          label: 'Anterior'
        });
      }

      // 3. Atual -> Próximo
      if (proc.processNext) {
        edges.push({
          id: `e-next-${proc.idProcess}-${proc.processNext.idProcess}`,
          source: proc.idProcess,
          target: proc.processNext.idProcess,
          type: 'smoothstep',
          style: { stroke: '#2196f3' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' },
          label: 'Próximo'
        });
      }

      // 4. Atual -> Inferiores (Bottoms)
      if (proc.processBottoms && proc.processBottoms.length > 0) {
        proc.processBottoms.forEach(bottom => {
            edges.push({
                id: `e-bot-${proc.idProcess}-${bottom.idProcess}`,
                source: proc.idProcess,
                target: bottom.idProcess,
                type: 'smoothstep',
                label: 'Inferior'
            });
        });
      }
    });

    // Filtra Edges duplicados se necessário e roda o layout
    return getLayoutedElements(nodes, edges, 'TB'); // TB = Top to Bottom
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Recalcula layout se os dados mudarem
  React.useEffect(() => {
     setNodes(initialNodes);
     setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <Paper sx={{ height: 600, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-right"
        >
          <Panel position="top-right" style={{ background: 'rgba(255,255,255,0.8)', padding: 10, borderRadius: 5 }}>
            <Typography variant="caption">Legenda: Azul (Hierarquia), Laranja (Sequência)</Typography>
          </Panel>
        </ReactFlow>
    </Paper>
  );
};

export default ProcessFlowMap;