import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Job } from '../store/slices/jobsSlice';
import { useNavigate } from 'react-router-dom';

interface GraphVisualizerProps {
  jobs: Job[];
  width?: number;
  height?: number;
}

interface D3Node {
  id: string;
  name: string;
  status: string;
  children?: D3Node[];
  _children?: D3Node[];
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  jobs,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  const createHierarchy = (jobs: Job[]): D3Node => {
    const jobMap: { [key: string]: D3Node } = {};
    jobs.forEach((job) => {
      jobMap[job.id] = {
        id: job.id,
        name: job.name,
        status: job.status,
        children: [],
      };
    });
    
    const rootNodes: D3Node[] = [];
    jobs.forEach((job) => {
      if (job.dependencies.length === 0) {
        rootNodes.push(jobMap[job.id]);
      } else {
        job.dependencies.forEach((parentId) => {
          if (jobMap[parentId]) {
            jobMap[parentId].children = jobMap[parentId].children || [];
            jobMap[parentId].children?.push(jobMap[job.id]);
          }
        });
      }
    });
    
    return rootNodes.length === 1 
      ? rootNodes[0] 
      : { id: 'root', name: 'All Jobs', status: 'completed', children: rootNodes };
  };

  useEffect(() => {
    if (!svgRef.current || jobs.length === 0) return;

    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(createHierarchy(jobs));
    const treeLayout = d3.tree<D3Node>().size([innerHeight, innerWidth]);
    treeLayout(root);

    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      );

    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", (d: any) => `node ${d.data.status === 'failed' ? 'failed' : ''}`)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .on("click", (_event: any, d: any) => {
        if (d.data.id !== 'root') {
          navigate(`/jobs/${d.data.id}`);
        }
      });

    node.append("circle")
      .attr("r", 10);

    node.append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name);

  }, [jobs, width, height, navigate]);

  return <svg ref={svgRef}></svg>;
};

export default GraphVisualizer;
