import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Job } from '../store/slices/jobsSlice';
import { useNavigate } from 'react-router-dom';

// Add run history data interface
interface RunHistoryEntry {
  nodeId: string;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'failed' | 'aborted';
}

interface GraphVisualizerProps {
  data: Job[];
  width?: number;
  height?: number;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: string;
  type: string;
  children?: D3Node[];
  _children?: D3Node[];
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node;
  target: D3Node;
  type: string;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  data,
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  // Existing refs
  const mainSvgRef = useRef<SVGSVGElement | null>(null);
  const detailSvgRef = useRef<SVGSVGElement | null>(null);
  const historyCanvasRef = useRef<SVGSVGElement | null>(null);
  // New ref for overlay canvas
  const drawCanvasRef = useRef<SVGSVGElement | null>(null);
  
  const navigate = useNavigate();
  
  // Add state for overlay display
  const [detailTab, setDetailTab] = useState<'info' | 'history'>('info');
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayNode, setOverlayNode] = useState<D3Node | null>(null);
  
  const linksRef = useRef<D3Link[]>([]);
  const nodesRef = useRef<D3Node[]>([]);
  
  // Function to generate more realistic synthetic run history data
  const generateRunHistory = (nodeId: string): RunHistoryEntry[] => {
    const history: RunHistoryEntry[] = [];
    const now = new Date();
    
    // Define typical patterns
    const typicalStartHour = 9; // 9 AM typical start time
    const typicalDurationHours = 2; // 2 hours typical run time
    
    // Generate one run for each day going back 90 days
    for (let i = 0; i < 90; i++) {
      const runDate = new Date(now);
      runDate.setDate(runDate.getDate() - i);
      
      // Set typical start time (with small variation)
      const startTime = new Date(runDate);
      const hourVariation = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0; // Occasional small variation
      startTime.setHours(typicalStartHour + hourVariation, Math.floor(Math.random() * 30)); // Add some minute variation
      
      // Determine if this is a delayed run (about 15% of runs)
      const isDelayedRun = Math.random() > 0.85;
      
      // Calculate run duration - mostly consistent with occasional longer runs
      let durationHours = typicalDurationHours;
      if (isDelayedRun) {
        durationHours = typicalDurationHours + Math.floor(Math.random() * 10) + 3; // 3-12 hours longer
      } else {
        // Small variation in normal runs
        durationHours = typicalDurationHours + (Math.random() > 0.5 ? 0.5 : -0.5) * Math.random();
      }
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + durationHours);
      endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 30)); // Add some minute variation
      
      // Status is usually success, but delayed runs have higher failure rate
      const status: 'success' | 'failed' | 'aborted' = 
        isDelayedRun && Math.random() > 0.6 ? (Math.random() > 0.5 ? 'failed' : 'aborted') : 'success';
      
      history.push({
        nodeId,
        startTime,
        endTime,
        status
      });
    }
    
    // Sort by startTime ascending
    return history.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const createHierarchy = (jobs: Job[]): { nodes: D3Node[], links: D3Link[] } => {
    const jobMap: { [key: string]: D3Node } = {};
    const links: D3Link[] = [];

    jobs.forEach((job) => {
      jobMap[job.id] = {
        id: job.id,
        name: job.name,
        status: job.status,
        type: job.type,
        children: [],
      };
    });

    jobs.forEach((job) => {
      job.dependencies.forEach((dependency) => {
        links.push({
          source: jobMap[dependency.source],
          target: jobMap[dependency.target],
          type: dependency.type,
        });
      });
    });

    return { nodes: Object.values(jobMap), links };
  };

  // Function to render run history timeline chart
  const renderRunHistory = (node: D3Node) => {
    if (!historyCanvasRef.current) return;
    
    // Clear previous content
    const historySvg = d3.select(historyCanvasRef.current);
    historySvg.selectAll("*").remove();
    
    // Generate run history data
    const runHistory = generateRunHistory(node.id);
    
    // Set dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width * 0.28 - margin.left - margin.right;
    const chartHeight = height * 0.6 - margin.top - margin.bottom;
    
    historySvg
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom);
    
    const chart = historySvg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Get date range for x-axis (dates)
    const dates = runHistory.map(d => {
      const date = new Date(d.startTime);
      date.setHours(0, 0, 0, 0);
      return date;
    });
    
    // Remove duplicates and get unique dates
    const uniqueDates = Array.from(new Set(dates.map(d => d.getTime())))
      .map(time => new Date(time));
    
    // Create x scale (dates)
    const xScale = d3.scaleBand()
      .domain(uniqueDates.map(d => d.toISOString().split('T')[0]))
      .range([0, chartWidth])
      .padding(0.2);
    
    // Create y scale (36 hours window with 1 hour timesteps)
    const yScale = d3.scaleTime()
      .domain([
        new Date(0, 0, 0, 0, 0), // 12 AM
        new Date(0, 0, 1, 12, 0)  // Next day 12 PM (36 hour window)
      ])
      .range([0, chartHeight]);
    
    // Add x-axis (dates)
    chart.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter((d, i) => !(i % 7))) // Show every 7th day
        .tickFormat(d => {
          const date = new Date(d);
          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    // Add y-axis (hours)
    chart.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(d3.timeHour.every(2))
        .tickFormat(d => {
          const hours = (d as Date).getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const adjustedHours = hours % 12 || 12;
          return `${adjustedHours}${ampm}`;
        }));
    
    // Add axis labels
    chart.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 5)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Date");
    
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Time of Day");
    
    // Add title
    chart.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -15)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Run History for ${node.name}`);
    
    // Helper function to get time-of-day (for y-axis)
    const getTimeOfDay = (date: Date) => {
      const result = new Date(0, 0, 0);
      result.setHours(date.getHours(), date.getMinutes(), 0, 0);
      
      // Handle overflow into next day
      if (date.getHours() < 12) {
        result.setDate(1);
      }
      
      return result;
    };
    
    // Group run data by date
    const runsByDate = new Map<string, RunHistoryEntry[]>();
    runHistory.forEach(run => {
      const dateStr = run.startTime.toISOString().split('T')[0];
      if (!runsByDate.has(dateStr)) {
        runsByDate.set(dateStr, []);
      }
      runsByDate.get(dateStr)?.push(run);
    });
    
    // Calculate moving average of end times
    const movingAverageWindow = 7; // 7-day moving average
    const movingAverages: { date: Date, avgTime: Date }[] = [];
    
    // Get all dates in order
    const allDates = Array.from(runsByDate.keys()).sort();
    
    // Calculate moving average for each date
    allDates.forEach((dateStr, index) => {
      // Determine window start (clamped at beginning of data)
      const windowStart = Math.max(0, index - Math.floor(movingAverageWindow / 2));
      // Determine window end (clamped at end of data)
      const windowEnd = Math.min(allDates.length - 1, index + Math.floor(movingAverageWindow / 2));
      
      // Collect all end times in the window
      const windowEndTimes: Date[] = [];
      for (let i = windowStart; i <= windowEnd; i++) {
        const windowDateStr = allDates[i];
        const runsOnDate = runsByDate.get(windowDateStr) || [];
        runsOnDate.forEach(run => {
          windowEndTimes.push(getTimeOfDay(run.endTime));
        });
      }
      
      // Calculate average end time for this window
      if (windowEndTimes.length > 0) {
        const totalMs = windowEndTimes.reduce((acc, time) => acc + time.getTime(), 0);
        const avgTime = new Date(totalMs / windowEndTimes.length);
        
        movingAverages.push({
          date: new Date(dateStr),
          avgTime: avgTime
        });
      }
    });
    
    // Draw moving average line
    if (movingAverages.length > 1) {
      // Create line generator for moving average
      const lineGenerator = d3.line<{ date: Date, avgTime: Date }>()
        .x(d => {
          const dateStr = d.date.toISOString().split('T')[0];
          return (xScale(dateStr) || 0) + xScale.bandwidth() / 2;
        })
        .y(d => yScale(d.avgTime))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Use a smooth curve
      
      // Add the moving average line
      chart.append("path")
        .datum(movingAverages)
        .attr("fill", "none")
        .attr("stroke", "#2196F3")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);
      
      // Add dots at each average point for visibility
      chart.selectAll(".avg-point")
        .data(movingAverages)
        .enter()
        .append("circle")
        .attr("class", "avg-point")
        .attr("cx", d => {
          const dateStr = d.date.toISOString().split('T')[0];
          return (xScale(dateStr) || 0) + xScale.bandwidth() / 2;
        })
        .attr("cy", d => yScale(d.avgTime))
        .attr("r", 3)
        .attr("fill", "#2196F3")
        .append("title")
        .text(d => {
          const avgHour = d.avgTime.getHours();
          const avgMin = d.avgTime.getMinutes();
          return `Date: ${d.date.toLocaleDateString()}\nAverage completion: ${avgHour}:${String(avgMin).padStart(2, '0')}`;
        });
    }
    
    // Draw only end points for each run (no start points, no connecting lines)
    runHistory.forEach(run => {
      const dateStr = run.startTime.toISOString().split('T')[0];
      const x = (xScale(dateStr) || 0) + xScale.bandwidth() / 2;
      
      // End point only
      const endY = yScale(getTimeOfDay(run.endTime));
      chart.append("circle")
        .attr("cx", x)
        .attr("cy", endY)
        .attr("r", 6)
        .attr("fill", run.status === 'success' ? "#4CAF50" : run.status === 'failed' ? "#F44336" : "#FF9800")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .append("title")
        .text(() => {
          const dateFormat = new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit'
          });
          return `Date: ${run.startTime.toLocaleDateString()}\n` +
                 `End: ${dateFormat.format(run.endTime)}\n` +
                 `Status: ${run.status}\n` +
                 `Duration: ${((run.endTime.getTime() - run.startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)}h`;
        });
    });
    
    // Add legend
    const legendData = [
      { status: 'success', color: '#4CAF50', label: 'Success' },
      { status: 'failed', color: '#F44336', label: 'Failed' },
      { status: 'aborted', color: '#FF9800', label: 'Aborted' },
      { status: 'average', color: '#2196F3', label: `${movingAverageWindow}-Day Moving Average`, dashed: false }
    ];
    
    const legend = chart.append("g")
      .attr("transform", `translate(${chartWidth - 120}, 10)`);
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      if (item.status === 'average') {
        // For average line, draw a line instead of rectangle
        legendRow.append("line")
          .attr("x1", 0)
          .attr("y1", 7.5)
          .attr("x2", 15)
          .attr("y2", 7.5)
          .attr("stroke", item.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      } else {
        legendRow.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", item.color);
      }
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(item.label);
    });
  };

  // Function to update detail canvas with node information - moved outside useEffect
  const updateDetailCanvas = (node: D3Node) => {
    if (!detailSvgRef.current) return;
    
    // Clear previous content
    const detailSvg = d3.select(detailSvgRef.current);
    detailSvg.selectAll("*").remove();
    
    // Set dimensions
    detailSvg
      .attr("width", width * 0.28) // Detail canvas takes 28% of width
      .attr("height", height * 0.4) // Adjust height to accommodate tabs
      .style("overflow", "hidden");
    
    // Add node details
    const detailG = detailSvg.append("g")
      .attr("transform", "translate(20, 30)");
    
    // Node title
    detailG.append("text")
      .attr("y", 20)
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text(node.name);
    
    // Node ID
    detailG.append("text")
      .attr("y", 50)
      .text(`ID: ${node.id}`);
    
    // Node Status
    detailG.append("text")
      .attr("y", 80)
      .text(`Status: ${node.status}`);
    
    // Node Type
    detailG.append("text")
      .attr("y", 110)
      .text(`Type: ${node.type}`);
    
    // Draw connected nodes in detail view
    const connectedLinks = linksRef.current.filter((l: any) => 
      (l.source.id === node.id || l.target.id === node.id));
    
    const connectedNodeIds = new Set<string>();
    connectedLinks.forEach((l: any) => {
      if (l.source.id === node.id) connectedNodeIds.add(l.target.id);
      else if (l.target.id === node.id) connectedNodeIds.add(l.source.id);
    });
    
    // Display connected nodes list
    detailG.append("text")
      .attr("y", 150)
      .attr("font-weight", "bold")
      .text(`Connected Nodes (${connectedNodeIds.size}):`);
    
    let yPos = 180;
    connectedNodeIds.forEach((nodeId) => {
      const connectedNode = nodesRef.current.find(n => n.id === nodeId);
      if (connectedNode) {
        detailG.append("text")
          .attr("y", yPos)
          .text(`• ${connectedNode.name} (${connectedNode.type})`);
        yPos += 25;
      }
    });
  };

  // Function to render the detailed node graph in overlay
  const renderDetailedNodeGraph = useCallback((node: D3Node) => {
    if (!drawCanvasRef.current) return;
    
    // Clear existing content
    const drawSvg = d3.select(drawCanvasRef.current);
    drawSvg.selectAll("*").remove();
    
    // Set dimensions and styles
    drawSvg
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");
    
    const detailContainer = drawSvg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Add semi-transparent background to catch clicks for closing
    drawSvg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("click", () => {
        setShowOverlay(false);
      });
    
    // Add close button
    const closeButton = drawSvg.append("g")
      .attr("class", "close-button")
      .attr("cursor", "pointer")
      .attr("transform", `translate(${width - 50}, 30)`)
      .on("click", () => {
        setShowOverlay(false);
      });
    
    closeButton.append("circle")
      .attr("r", 15)
      .attr("fill", "rgba(245, 245, 245, 0.9)")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);
    
    closeButton.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("×");
    
    // Create a foreground panel for the detailed view with semi-transparent background
    const panel = detailContainer.append("rect")
      .attr("x", -width / 3)
      .attr("y", -height / 3)
      .attr("width", width * 2/3)
      .attr("height", height * 2/3)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "rgba(240, 240, 240, 0.85)") // Semi-transparent background
      .attr("stroke", "#555")
      .attr("stroke-width", 1);
    
    // Find connected nodes (children of the selected node)
    const connectedLinks = linksRef.current.filter(
      (l: any) => l.source.id === node.id || l.target.id === node.id
    );
    
    const connectedNodeIds = new Set<string>();
    connectedLinks.forEach((l: any) => {
      if (l.source.id === node.id) connectedNodeIds.add(l.target.id);
      else if (l.target.id === node.id) connectedNodeIds.add(l.source.id);
    });
    
    // Create a subgraph with the selected node and its connections
    const subgraphNodes = [
      node,
      ...nodesRef.current.filter(n => connectedNodeIds.has(n.id))
    ];
    
    const subgraphLinks = linksRef.current.filter(
      (l: any) => l.source.id === node.id || l.target.id === node.id
    );
    
    // Create a new force simulation for the subgraph
    const detailSimulation = d3.forceSimulation(subgraphNodes)
      .force("link", d3.forceLink(subgraphLinks).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(0, 0));
    
    // Title for the detail view
    detailContainer.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -height / 3 + 30)
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Node Detail: ${node.name}`);
    
    // Add links
    const detailLink = detailContainer.append("g")
      .selectAll("line")
      .data(subgraphLinks)
      .enter()
      .append("line")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d: any) => d.type === 'condition' ? "4 2" : "0")
      .attr("stroke", "#555");
    
    // Add nodes
    const detailNodeGroup = detailContainer.append("g")
      .selectAll("g")
      .data(subgraphNodes)
      .enter()
      .append("g");
    
    const detailNode = detailNodeGroup.append("circle")
      .attr("r", (d: any) => d.id === node.id ? 20 : 15) // Make selected node larger
      .attr("fill", (d: any) => {
        if (d.id === node.id) {
          // Highlight selected node with a brighter version of its color
          return d.type === 'BOX' ? "#4a90e2" : d.type === 'CMD' ? "#4CAF50" : "#e74c3c";
        }
        return d.type === 'BOX' ? "blue" : d.type === 'CMD' ? "green" : "red";
      })
      .attr("stroke", (d: any) => d.id === node.id ? "#ffcc00" : "#fff")
      .attr("stroke-width", (d: any) => d.id === node.id ? 3 : 1);
    
    // Add node labels
    detailNodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 30)
      .attr("font-size", "12px")
      .text((d: any) => d.name);
    
    // Add tooltips
    detailNodeGroup.append("title")
      .text((d: any) => `${d.name}\nType: ${d.type}\nStatus: ${d.status}`);
    
    // Update positions on simulation tick
    detailSimulation.on("tick", () => {
      detailLink
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      detailNodeGroup
        .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });
    
    // Stop simulation after a certain number of ticks for better placement
    setTimeout(() => {
      detailSimulation.stop();
    }, 2000);
    
  }, [width, height]);

  useEffect(() => {
    if (!mainSvgRef.current || data.length === 0) return;

    const { nodes, links } = createHierarchy(data);
    
    // Store nodes and links in refs so they're accessible outside this effect
    nodesRef.current = nodes;
    linksRef.current = links;

    // Clean up old visualization if it exists
    d3.select(mainSvgRef.current).selectAll("*").remove();
    if (detailSvgRef.current) {
      d3.select(detailSvgRef.current).selectAll("*").remove();
    }
    
    // Use ref.current instead of selector for main canvas
    const svg = d3.select(mainSvgRef.current)
      .attr("width", width * 0.7)  // Main canvas takes 70% of width
      .attr("height", height)
      .style("overflow", "hidden");

    const container = svg.append("g");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("radial", d3.forceRadial(Math.min(width, height) / 2, width / 2, height / 2));

    const link = container
      .selectAll("line")
      .attr("class", "links")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d: any) => d.type === 'condition' ? "4 2" : "0")
      .attr("stroke", "#999");

    const nodeEnter = container
      .selectAll("circle")
      .attr("class", "nodes")
      .data(nodes)
      .enter();
    
    const handleNodeClick = function(event: MouseEvent, d: D3Node) {
      event.stopPropagation();
      
      // Reset all nodes and links to default style
      link.attr("stroke", "#999")
          .attr("stroke-width", 2);
      
      // Reset all node elements  
      const circles = container.selectAll("circle");
      circles.attr("fill", (d: any) => d.type === 'BOX' ? "blue" : d.type === 'CMD' ? "green" : "red")
          .attr("stroke", null)
          .attr("stroke-width", 0)
          .attr("opacity", 1);

      // Highlight selected node
      d3.select(this)
        .attr("fill", (d: any) => d.type === 'BOX' ? "#4a90e2" : d.type === 'CMD' ? "#4CAF50" : "#e74c3c")
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 3);

      // Find connected links and nodes
      const connectedLinks = links.filter((l: any) => 
        (l.source.id === d.id || l.target.id === d.id));
      
      // Highlight connected links
      link.filter((l: any) => 
        (l.source.id === d.id || l.target.id === d.id))
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 3);

      // Get connected node IDs
      const connectedNodeIds = new Set<string>();
      connectedLinks.forEach((l: any) => {
        if (l.source.id === d.id) connectedNodeIds.add(l.target.id);
        else if (l.target.id === d.id) connectedNodeIds.add(l.source.id);
      });

      // Highlight connected nodes and dim unconnected ones
      circles.filter((n: any) => connectedNodeIds.has(n.id))
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 2)
        .attr("opacity", 1);
      
      circles.filter((n: any) => !connectedNodeIds.has(n.id) && n.id !== d.id)
        .attr("opacity", 0.3);

      // Set the selected node
      setSelectedNode(d);
      
      // Update detail canvas with selected node information
      updateDetailCanvas(d);
      
      // If we're on history tab, render the history chart
      if (detailTab === 'history') {
        renderRunHistory(d);
      }
    };

    // Add right-click handler for nodes
    const handleNodeRightClick = function(event: MouseEvent, d: D3Node) {
      event.preventDefault(); // Prevent default context menu
      
      // Set the overlay node and show the overlay
      setOverlayNode(d);
      setShowOverlay(true);
      
      // Render the detailed node graph
      renderDetailedNodeGraph(d);
    };

    nodeEnter
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d: any) => d.type === 'BOX' ? "blue" : d.type === 'CMD' ? "green" : "red")
      .on("click", handleNodeClick)
      .on("contextmenu", handleNodeRightClick) // Add right-click handler
      .call(d3.drag()
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    nodeEnter.append("title")
      .text((d: any) => d.name);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      container.selectAll("circle")
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Cleanup function for React 19
    return () => {
      simulation.stop();
      if (mainSvgRef.current) {
        d3.select(mainSvgRef.current).selectAll("*").remove();
      }
      if (detailSvgRef.current) {
        d3.select(detailSvgRef.current).selectAll("*").remove();
      }
    };

  }, [data, width, height, navigate, renderDetailedNodeGraph]);

  // Effect to handle tab changes
  useEffect(() => {
    if (selectedNode) {
      if (detailTab === 'history') {
        renderRunHistory(selectedNode);
      } else if (detailTab === 'info') {
        // Also update detail canvas when switching back to info tab
        updateDetailCanvas(selectedNode);
      }
    }
  }, [detailTab]);

  // Effect to handle overlay node changes
  useEffect(() => {
    if (showOverlay && overlayNode) {
      renderDetailedNodeGraph(overlayNode);
    }
  }, [showOverlay, overlayNode, renderDetailedNodeGraph]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      <div className="mainCanvas" style={{ 
        width: '70%', 
        opacity: showOverlay ? 0.3 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <svg ref={mainSvgRef}></svg>
      </div>
      <div className="detailCanvas" style={{ width: '30%', borderLeft: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        {/* Tab navigation */}
        <div className="detail-tabs" style={{ display: 'flex', marginBottom: '15px', borderBottom: '1px solid #ddd' }}>
          <div 
            className={`tab ${detailTab === 'info' ? 'active' : ''}`}
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer', 
              backgroundColor: detailTab === 'info' ? '#f0f0f0' : 'transparent',
              borderBottom: detailTab === 'info' ? '2px solid #1976d2' : 'none'
            }}
            onClick={() => setDetailTab('info')}
          >
            Node Details
          </div>
          <div 
            className={`tab ${detailTab === 'history' ? 'active' : ''}`}
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer',
              backgroundColor: detailTab === 'history' ? '#f0f0f0' : 'transparent',
              borderBottom: detailTab === 'history' ? '2px solid #1976d2' : 'none'
            }}
            onClick={() => setDetailTab('history')}
          >
            Run History
          </div>
        </div>

        {/* Tab content */}
        {detailTab === 'info' ? (
          <>
            <svg ref={detailSvgRef}></svg>
            <div className="detail-info">
              {!selectedNode && <p>Select a node to see details</p>}
            </div>
          </>
        ) : (
          <div className="history-container" style={{ height: '100%' }}>
            {selectedNode ? (
              <svg ref={historyCanvasRef}></svg>
            ) : (
              <p>Select a node to view its run history</p>
            )}
          </div>
        )}
      </div>
      
      {/* Overlay canvas for detailed node view */}
      {showOverlay && (
        <div className="overlay-canvas" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}>
          <svg ref={drawCanvasRef}></svg>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;