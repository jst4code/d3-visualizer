import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getJobs, Job } from "../store/slices/jobsSlice";
import GraphVisualizer from "../components/GraphVisualizer";
import GanttChart from "../components/GanttChart";
import FilterPanel from "../components/FilterPanel";
import { toast } from "sonner";
import RadialTreeVisualizer from "../components/RadialTreeVisualizer";
import { JobNode, TreeNode } from "../types/job";
import { generateLargeJobDataset } from "../utils/sampleDataGenerator";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector(
    (state: RootState) => state.jobs
  );
  const filters = useSelector((state: RootState) => state.filter);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [visualizer, setVisualizer] = useState<'tree' | 'graph'>('tree');
  const [graphData, setGraphData] = useState<Job[]>([]);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    // Generate data for GraphVisualizer
    const data = generateLargeJobDataset(1000);
    setGraphData(data);
  }, []);

  console.log("My jobs: ", jobs);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  let filteredJobs: JobNode[] = [];
  if (jobs["nodes"]) {
    filteredJobs = jobs["nodes"].filter((job: JobNode) => {
      if (filters.componentType && job.type !== filters.componentType)
        return false;
      if (filters.activitySet && job.activitySet !== filters.activitySet)
        return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.showFailed && job.status !== "failed") return false;
      if (
        filters.timeRange.start &&
        job.startTime &&
        new Date(job.startTime) < new Date(filters.timeRange.start)
      )
        return false;
      if (
        filters.timeRange.end &&
        job.endTime &&
        new Date(job.endTime) > new Date(filters.timeRange.end)
      )
        return false;
      return true;
    });
  } else {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">No job data available</p>
      </div>
    );
  }

  // Create hierarchical structure for RadialTreeVisualizer
  const prepareTreeData = (jobs: JobNode[]): TreeNode => {
    // Find root nodes (jobs with no parents or with parents outside the filtered set)
    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const childrenMap = new Map<string, string[]>();

    jobs.forEach((job) => {
      if (job.children && job.children.length > 0) {
        job.children.forEach((dep) => {
          if (jobMap.has(dep.id)) {
            if (!childrenMap.has(dep.id)) {
              childrenMap.set(dep.id, []);
            }
            childrenMap.get(dep.id)!.push(job.id);
          }
        });
      }
    });

    // Find root nodes (nodes that are not children of any other node)
    const allChildrenIds = new Set(Array.from(childrenMap.values()).flat());
    const rootNodeIds = jobs
      .filter((job) => !allChildrenIds.has(job.id))
      .map((job) => job.id);

    // Build tree structure recursively
    const buildTree = (nodeId: string): TreeNode => {
      const node = jobMap.get(nodeId)!;
      const children = childrenMap.get(nodeId) || [];

      return {
        id: node.id,
        name: node.name || node.id,
        status: node.status,
        componentType: node.type,
        children: children.map((childId) => buildTree(childId)),
      };
    };

    // If there are multiple roots, create a single virtual root
    if (rootNodeIds.length > 1) {
      return {
        id: "root",
        name: "All Jobs",
        children: rootNodeIds.map((id) => buildTree(id)),
      };
    } else if (rootNodeIds.length === 1) {
      return buildTree(rootNodeIds[0]);
    } else {
      // Fallback if no clear hierarchy is detected
      return {
        id: "root",
        name: "All Jobs",
        children: jobs.map((job) => ({
          id: job.id,
          name: job.name || job.id,
          status: job.status,
          componentType: job.type,
          children: [],
        })),
      };
    }
  };

  const generateMockTreeData = (): TreeNode => {
    // Create a large tree with 1000 nodes
    const totalNodes = 1000;
    const level2Nodes = 20;
    
    const root: TreeNode = {
      id: "root",
      name: "All Jobs",
      children: []
    };
    
    // Create level 2 nodes (direct children of root)
    for (let i = 0; i < level2Nodes; i++) {
      const level2Node: TreeNode = {
        id: `category-${i}`,
        name: `Category ${i}`,
        status: ["completed", "failed", "running", "pending"][Math.floor(Math.random() * 4)],
        componentType: ["processor", "connector", "transformer"][Math.floor(Math.random() * 3)],
        children: []
      };
      root.children.push(level2Node);
    }
    
    // Calculate remaining nodes to distribute
    const remainingNodes = totalNodes - level2Nodes - 1; // minus root
    const nodesPerLevel2 = Math.floor(remainingNodes / level2Nodes);
    
    // Helper function to create nodes recursively
    const createNodes = (
      parent: TreeNode, 
      depth: number, 
      count: number, 
      prefix: string
    ): number => {
      if (count <= 0 || depth > 10) return 0; // Limit depth
      
      let created = 0;
      const childrenCount = Math.min(
        Math.max(2, Math.floor(Math.random() * 6)), 
        count
      );
      
      for (let i = 0; i < childrenCount; i++) {
        if (created >= count) break;
        
        const nodeId = `${prefix}-${i}`;
        const node: TreeNode = {
          id: nodeId,
          name: `Job ${nodeId.split('-').slice(-2).join('-')}`,
          status: ["completed", "failed", "running", "pending"][Math.floor(Math.random() * 4)],
          componentType: ["processor", "connector", "transformer"][Math.floor(Math.random() * 3)],
          children: []
        };
        
        parent.children.push(node);
        created++;
        
        // Recursively create children with varying probability
        if (count - created > 0 && Math.random() > 0.2) {
          const childrenCreated = createNodes(
            node,
            depth + 1,
            Math.min(count - created, Math.floor(Math.random() * 8) + 1),
            nodeId
          );
          created += childrenCreated;
        }
      }
      
      return created;
    };
    
    // Distribute nodes among level 2 categories
    root.children.forEach((category, idx) => {
      const nodesToCreate = nodesPerLevel2 + (idx < remainingNodes % level2Nodes ? 1 : 0);
      createNodes(category, 1, nodesToCreate, category.id);
    });
    
    return root;
  };

  // Use either real data or mock data based on toggle
  const treeData = useMockData ? generateMockTreeData() : prepareTreeData(filteredJobs);
  console.log("Tree data nodes:", useMockData ? "~1000 mock nodes" : filteredJobs.length);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Collapsible Filter Panel */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 overflow-auto fixed top-0 left-0 h-full z-10 ${
          isFilterPanelOpen ? "w-64 px-4 py-6" : "w-0"
        }`}
      >
        {isFilterPanelOpen && <FilterPanel />}
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-full w-full pl-0">
        {/* Toggle for data source */}
        <div className="bg-white p-2 flex justify-between items-center">
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          >
            {isFilterPanelOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <div className="flex items-center space-x-2">
            <span>Use {useMockData ? "Mock" : "Real"} Data</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={useMockData} 
                onChange={() => setUseMockData(!useMockData)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-white shadow flex-grow">
          <h2 className="text-lg font-semibold p-4 border-b">
            Job Dependencies - {useMockData ? "~1000 Mock Nodes" : filteredJobs.length + " Real Nodes"}
          </h2>
          <div className="w-full h-[calc(75vh)]">
            <div>
              <button onClick={() => setVisualizer('tree')}>Tree Visualizer</button>
              <button onClick={() => setVisualizer('graph')}>Graph Visualizer</button>
            </div>
            {visualizer === 'tree' ? (
              <RadialTreeVisualizer data={treeData} />
            ) : (
              <GraphVisualizer data={graphData} />
            )}
          </div>
        </div>

        {/* <div className="bg-white shadow mt-4 p-4">
            <h2 className="text-lg font-semibold mb-4">Job Timeline</h2>
            <GanttChart jobs={filteredJobs} />
          </div> */}
      </div>
    </div>
  );
};

export default Dashboard;