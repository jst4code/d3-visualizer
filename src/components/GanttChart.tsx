import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Job } from '../store/slices/jobsSlice';

interface GanttChartProps {
  jobs: Job[];
  width?: number;
  height?: number;
}

const GanttChart: React.FC<GanttChartProps> = ({
  jobs,
  width = 800,
  height = 200
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || jobs.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter jobs with start and end times
    const validJobs = jobs.filter(job => job.startTime && job.endTime);
    
    if (validJobs.length === 0) return;

    // Create scales
    const timeExtent = d3.extent([
      ...validJobs.map(d => new Date(d.startTime!)),
      ...validJobs.map(d => new Date(d.endTime!))
    ]);

    const xScale = d3.scaleTime()
      .domain(timeExtent as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(validJobs.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.2);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add bars
    svg.selectAll(".bar")
      .data(validJobs)
      .enter()
      .append("rect")
      .attr("class", d => `gantt-chart-bar ${d.status === 'failed' ? 'failed' : ''}`)
      .attr("x", d => xScale(new Date(d.startTime!)))
      .attr("y", d => yScale(d.name)!)
      .attr("height", yScale.bandwidth())
      .attr("width", d => {
        const start = new Date(d.startTime!).getTime();
        const end = new Date(d.endTime!).getTime();
        return xScale(new Date(end)) - xScale(new Date(start));
      })
      .append("title")
      .text(d => `${d.name}
Start: ${new Date(d.startTime!).toLocaleString()}
End: ${new Date(d.endTime!).toLocaleString()}
Status: ${d.status}`);

  }, [jobs, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default GanttChart;
