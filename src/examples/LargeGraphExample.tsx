import React, { useState, useEffect } from 'react';
import GraphVisualizer from '../components/GraphVisualizer';
import { generateLargeJobDataset, generateStructuredJobDataset } from '../utils/sampleDataGenerator';
import { Job } from '../store/slices/jobsSlice';

const LargeGraphExample: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataType, setDataType] = useState<'balanced' | 'structured'>('balanced');
  
  useEffect(() => {
    // Generate sample data based on selected type
    const data = dataType === 'balanced' 
      ? generateLargeJobDataset(1000)
      : generateStructuredJobDataset(4, 6);
    
    setJobs(data);
  }, [dataType]);
  
  return (
    <div className="large-graph-container">
      <div className="controls">
        <h2>Large Graph Visualization (1000 nodes)</h2>
        <div className="data-type-selector">
          <label>
            <input 
              type="radio" 
              value="balanced" 
              checked={dataType === 'balanced'} 
              onChange={() => setDataType('balanced')}
            />
            Balanced Tree
          </label>
          <label>
            <input 
              type="radio" 
              value="structured" 
              checked={dataType === 'structured'} 
              onChange={() => setDataType('structured')}
            />
            More Complex Structure
          </label>
        </div>
      </div>
      
      <div className="visualization-wrapper" style={{ height: '800px', width: '100%' }}>
        {jobs.length > 0 && (
          <GraphVisualizer 
            data={jobs} 
            width={1200} 
            height={800}
          />
        )}
      </div>
    </div>
  );
};

export default LargeGraphExample;
