import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import jobsDataService from '../services/jobsDataService';
import { transformToHierarchy, prepareForceGraphData, filterByMaxDepth } from '../utils/dataUtils';

const JobsVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maxDepth, setMaxDepth] = useState(2); // Default to show only top 2 levels
  const svgRef = useRef();
  const wrapperRef = useRef();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await jobsDataService.fetchJobsData();
        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (loading || error || !jobsDataService.data) return;
    
    // Filter data based on max depth
    const filteredData = filterByMaxDepth(jobsDataService.data, maxDepth);
    
    // Prepare data for force directed graph
    const graphData = prepareForceGraphData(filteredData);
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Get dimensions
    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight || 600;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
      
    // Define forces
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);
    
    // Create color scale for node types
    const colorScale = d3.scaleOrdinal()
      .domain(['box', 'command'])
      .range(['#4682b4', '#ff7f0e']);
    
    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('r', d => d.level === 0 ? 15 : 10 - d.level)
      .attr('fill', d => colorScale(d.type))
      .call(drag(simulation));
    
    // Add node labels
    const labels = svg.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter().append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .style('pointer-events', 'none');
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
        
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
        
      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    // Define drag behavior
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [loading, error, maxDepth]);
  
  return (
    <div className="visualization-container" ref={wrapperRef} style={{ width: '100%', height: '80vh' }}>
      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error">{error}</div>}
      <div className="controls">
        <label>
          Max depth:
          <input 
            type="range" 
            min="1" 
            max="6" 
            value={maxDepth} 
            onChange={e => setMaxDepth(Number(e.target.value))} 
          />
          <span>{maxDepth}</span>
        </label>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default JobsVisualization;
