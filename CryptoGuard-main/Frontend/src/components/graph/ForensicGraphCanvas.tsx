import React, { useEffect, useRef, useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '../../types/forensics';
import { SEVERITY_CONFIG } from '../../utils/riskCalculators';

export interface ForensicGraphCanvasProps {
  data: GraphData;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode | null) => void;
  highlightPath?: boolean;
  filterMinRisk?: number;
  showNetworkLayer?: boolean;
}

interface CanvasNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const ForensicGraphCanvas: React.FC<ForensicGraphCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  highlightPath = false,
  filterMinRisk = 0,
  showNetworkLayer = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<CanvasNode | null>(null);

  // Initialize node positions in an organic layout
  useEffect(() => {
    let filteredNodes = data.nodes.filter((n) => n.riskScore >= filterMinRisk);
    if (!showNetworkLayer) {
      filteredNodes = filteredNodes.filter((n) => n.type !== 'IP');
    }

    const width = 950;
    const height = 580;
    const cx = width / 2;
    const cy = height / 2;

    const initialNodes: CanvasNode[] = filteredNodes.map((n, i) => {
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      const radiusDist = n.type === 'CLUSTER' ? 220 : n.type === 'IP' ? 210 : 130 + (i % 3) * 35;
      return {
        ...n,
        x: cx + Math.cos(angle) * radiusDist + (Math.random() - 0.5) * 30,
        y: cy + Math.sin(angle) * radiusDist + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
        radius: n.type === 'CLUSTER' ? 30 : n.type === 'TRANSACTION' ? 24 : 20,
      };
    });

    setNodes(initialNodes);
  }, [data, filterMinRisk, showNetworkLayer]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply zoom & pan
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      // Identify connected nodes if a node is selected
      const connectedNodeIds = new Set<string>();
      if (selectedNodeId) {
        connectedNodeIds.add(selectedNodeId);
        data.edges.forEach((e) => {
          if (e.source === selectedNodeId) connectedNodeIds.add(e.target);
          if (e.target === selectedNodeId) connectedNodeIds.add(e.source);
        });
      }

      // 1. Draw Edges
      data.edges.forEach((edge) => {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) return;

        const isHighlighted = highlightPath && edge.isSuspicious;
        const isConnected =
          selectedNodeId &&
          (edge.source === selectedNodeId || edge.target === selectedNodeId);
        const isDimmed = selectedNodeId && !isConnected && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isHighlighted || isConnected) {
          ctx.strokeStyle = isHighlighted ? '#f43f5e' : '#06b6d4';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.shadowColor = isHighlighted ? '#f43f5e' : '#06b6d4';
          ctx.shadowBlur = 12;
        } else if (isDimmed) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        } else if (edge.label === 'RELAYED_BY') {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Edge Direction Label
        if (!isDimmed) {
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          ctx.font = '9px JetBrains Mono';
          ctx.fillStyle = isHighlighted ? '#f43f5e' : isConnected ? '#22d3ee' : '#64748b';
          ctx.textAlign = 'center';
          ctx.fillText(edge.label, midX, midY - 4);
        }
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNodeId === node.id;
        const isConnected = connectedNodeIds.has(node.id);
        const isDimmed = selectedNodeId && !isSelected && !isConnected;
        const color = SEVERITY_CONFIG[node.severity]?.barColor || '#38bdf8';

        ctx.save();
        ctx.translate(node.x, node.y);

        if (isDimmed) {
          ctx.globalAlpha = 0.25;
        }

        // Selection Glowing Halo Ring
        if (isSelected || (highlightPath && node.severity === 'CRITICAL')) {
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#06b6d4' : '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = isSelected ? '#06b6d4' : '#f43f5e';
          ctx.shadowBlur = 18;
          ctx.stroke();
        }

        // Node Geometry
        ctx.beginPath();
        if (node.type === 'IP') {
          // Hexagon for IP
          const r = node.radius;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const px = r * Math.cos(a);
            const py = r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = '#0a1e2f';
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else if (node.type === 'TRANSACTION') {
          // Diamond for Transaction
          const r = node.radius;
          ctx.moveTo(0, -r);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          ctx.fillStyle = '#1e1428';
          ctx.fill();
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else if (node.type === 'CLUSTER') {
          // Rounded Polygon for Cluster
          ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139, 92, 246, 0.18)';
          ctx.fill();
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
        } else {
          // Circle for Wallet
          ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#0b1120';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Text Labels
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, 0, node.radius + 15);

        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = node.type === 'IP' ? '#22d3ee' : '#94a3b8';
        ctx.fillText(`${node.type} (${node.riskScore.toFixed(0)})`, 0, node.radius + 26);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, data.edges, transform, selectedNodeId, highlightPath]);

  // Handle Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;

    const clicked = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 10;
    });

    if (clicked) {
      setDraggedNode(clicked);
      onSelectNode(clicked);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggedNode) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNode.id ? { ...n, x: mouseX, y: mouseY } : n))
      );
    } else if (isDraggingCanvas) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.4, Math.min(3, prev.scale * zoomFactor)),
    }));
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden glass-panel border border-white/10 bg-background-darker">
      <canvas
        ref={canvasRef}
        width={950}
        height={580}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
};
