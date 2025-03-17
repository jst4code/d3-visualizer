import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getJobs, Job } from "../store/slices/jobsSlice";
import GraphVisualizer from "../components/GraphVisualizer";
import { toast } from "sonner";
import RadialTreeVisualizer from "../components/RadialTreeVisualizer";
import { JobNode, TreeNode } from "../types/job";
import { generateLargeJobDataset } from "../utils/sampleDataGenerator";
import React from "react";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector(
    (state: RootState) => state.jobs
  );
  const filters = useSelector((state: RootState) => state.filter);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [visualizer, setVisualizer] = useState<"tree" | "graph">("tree");
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
      children: [],
    };

    // Create level 2 nodes (direct children of root)
    for (let i = 0; i < level2Nodes; i++) {
      const level2Node: TreeNode = {
        id: `category-${i}`,
        name: `Category ${i}`,
        status: ["completed", "failed", "running", "pending"][
          Math.floor(Math.random() * 4)
        ],
        componentType: ["processor", "connector", "transformer"][
          Math.floor(Math.random() * 3)
        ],
        children: [],
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
          name: `Job ${nodeId.split("-").slice(-2).join("-")}`,
          status: ["completed", "failed", "running", "pending"][
            Math.floor(Math.random() * 4)
          ],
          componentType: ["processor", "connector", "transformer"][
            Math.floor(Math.random() * 3)
          ],
          children: [],
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
      const nodesToCreate =
        nodesPerLevel2 + (idx < remainingNodes % level2Nodes ? 1 : 0);
      createNodes(category, 1, nodesToCreate, category.id);
    });

    return root;
  };

  // Use either real data or mock data based on toggle
  const treeData = useMockData
    ? generateMockTreeData()
    : prepareTreeData(jobs);


  return (
    <div className="w-full h-[calc(75vh)]">
      <div>
        <button onClick={() => setVisualizer("tree")}>Tree Visualizer</button>
        <button onClick={() => setVisualizer("graph")}>
          {" "}
          Graph Visualizer
        </button>
      </div>
      {visualizer === "tree" ? (
        <RadialTreeVisualizer data={treeData} />
      ) : (
        <GraphVisualizer data={graphData} />
      )}
    </div>
  );
};

export default Dashboard;
