import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { JobNode } from '../types/job';

interface Node {
  id: string;
  name: string;
  children?: Node[];
  [key: string]: any; // For any other properties
}

interface RadialTreeVisualizerProps {
  data: Node;
  width?: number;
  height?: number;
}

const RadialTreeVisualizer: React.FC<RadialTreeVisualizerProps> = ({
  data,
  width = 960,
  height = 800,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    console.log("Data in RadialTreeVisualizer: ", data);
    
    // Create the root hierarchy with proper typing
    const root = d3.hierarchy(data as JobNode);
    
    // Define the tree layout
    const radius = Math.min(width, height) / 2 - 100;
    const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    
    // Apply the layout
    const treeData = tree(root as d3.HierarchyNode<unknown>);
    
    // Group to center the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Add links
    g.selectAll(".link")
      .data(treeData.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("d", d => {
        // Safer approach with null checks
        if (!d || !d.source || !d.target || 
            typeof d.source.x === 'undefined' || 
            typeof d.source.y === 'undefined' ||
            typeof d.target.x === 'undefined' || 
            typeof d.target.y === 'undefined') {
          return null;
        }
        
        // Create a custom path using d3.linkRadial
        const startAngle = d.source.x;
        const startRadius = d.source.y;
        const endAngle = d.target.x;
        const endRadius = d.target.y;
        
        // Create a custom path manually using SVG path commands
        const start = polarToCartesian(startAngle, startRadius);
        const end = polarToCartesian(endAngle, endRadius);
        
        // Control points for the curve
        const controlRadius = startRadius + (endRadius - startRadius) * 0.5;
        const controlAngle1 = startAngle;
        const controlAngle2 = endAngle;
        
        const control1 = polarToCartesian(controlAngle1, controlRadius);
        const control2 = polarToCartesian(controlAngle2, controlRadius);
        
        // Create the SVG path
        return `M${start[0]},${start[1]} C${control1[0]},${control1[1]} ${control2[0]},${control2[1]} ${end[0]},${end[1]}`;
      });
    
    // Helper function to convert from polar to Cartesian coordinates
    function polarToCartesian(angle: number, radius: number): [number, number] {
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }
    
    // Add nodes
    const node = g.selectAll(".node")
      .data(treeData.descendants())
      .join("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => {
        if (typeof d.x === 'undefined' || typeof d.y === 'undefined') {
          return "translate(0,0)"; // Default position if coordinates are undefined
        }
        return `translate(${polarToCartesian(d.x, d.y)})`;
      });
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => {
        // Color nodes based on status if available
        // if (d.status === 'failed') return "#e53e3e"; // Red for failed
        // if (d.status === 'completed') return "#38a169"; // Green for completed
        // if (d.status === 'pending') return "#d69e2e"; // Yellow for pending
        return d.children ? "#555" : "#999"; // Default colors
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);
    
    // Add text labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => (d.x !== undefined && d.x < Math.PI) ? 8 : -8)
      .attr("text-anchor", d => (d.x !== undefined && d.x < Math.PI) ? "start" : "end")
      .attr("transform", d => (d.x !== undefined && d.x >= Math.PI) ? "rotate(180)" : null)
      .text(d => d.name)
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} className="w-full h-full">
      <defs>
        <filter id="drop-shadow" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export default RadialTreeVisualizer;
