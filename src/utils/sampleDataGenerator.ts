import { Job } from '../store/slices/jobsSlice';

// Status options for jobs
const statuses = ['completed', 'running', 'failed', 'waiting'] as const;
type JobStatus = typeof statuses[number]; // Union type of all allowed statuses

// Generate a sample job with given id and optional parent id
const getRandomStatus = (): JobStatus => statuses[Math.floor(Math.random() * statuses.length)];

type Dependency = { source: string; target: string; type: string };

const createJob = (id: string, name: string, dependencies: Dependency[] = []): Job => ({
  id,
  name,
  status: getRandomStatus(),
  dependencies,
  type: 'Box',
  activitySet: 'defaultActivitySet',
  maxWaitTime: 0,
  runtime: 0,
});

/**
 * Creates a hierarchical job structure with the specified number of nodes
 * @param count The number of nodes to generate
 * @returns Array of Job objects with dependencies
 */
export const generateLargeJobDataset = (count: number = 1000): Job[] => {
  const jobs: Job[] = [];
  const maxChildrenPerNode = 15;
  
  // Create root node
  jobs.push(createJob('job-0', 'Root Task'));
  
  // Keep track of potential parent nodes
  let parentIndex = 0;

  // Generate the rest of the jobs with balanced tree structure
  for (let i = 1; i < count; i++) {
    const jobId = `job-${i}`;
    const jobName = `Task ${i}`;
    
    // Determine parent (create a balanced tree structure)
    const parentId = `job-${parentIndex}`;
    jobs.push(createJob(jobId, jobName, [{ source: parentId, target: jobId, type: 'parent' }]));
    
    // Advance parent index when we've added enough children to current parent
    if (i % maxChildrenPerNode === 0) {
      parentIndex++;
    }
  }

  // Add some cross-dependencies for more complex graph (about 10% of nodes)
  for (let i = Math.floor(count * 0.1); i < count; i += 10) {
    if (i > 10) {
      const additionalDependency = `job-${Math.floor(i / 2)}`;
      jobs[i].dependencies.push({ source:jobs[i].id, target: additionalDependency, type: 'cross' });
    }
  }

  return jobs;
};

/**
 * Creates a dataset with specified width and depth
 * @param width Maximum children per node
 * @param depth Maximum depth of the tree
 * @returns Array of Job objects organized in a tree structure
 */
export const generateStructuredJobDataset = (width: number = 4, depth: number = 5): Job[] => {
  const jobs: Job[] = [];
  let currentId = 0;
  
  // Create root
  jobs.push(createJob(`job-${currentId}`, 'Root Task'));
  currentId++;
  
  // For each level of depth
  let currentLevel = [`job-0`];
  let nextLevel: string[] = [];
  
  for (let level = 1; level <= depth; level++) {
    // For each node in current level
    for (const parentId of currentLevel) {
      // Create between 1 and width children
      const childrenCount = Math.max(1, Math.floor(Math.random() * width + 1));
      
      for (let child = 0; child < childrenCount; child++) {
        const jobId = `job-${currentId}`;
        jobs.push(createJob(jobId, `Level ${level} Task ${currentId}`, [{ source: parentId, target: jobId,  type: 'parent' }]));
        nextLevel.push(jobId);
        currentId++;
        
        if (jobs.length >= 1000) break;
      }
      if (jobs.length >= 1000) break;
    }
    
    currentLevel = nextLevel;
    nextLevel = [];
    if (jobs.length >= 1000) break;
  }
  
  // Ensure we have exactly 1000 nodes if needed
  while (jobs.length < 1000) {
    const randomParentIndex = Math.floor(Math.random() * (jobs.length - 1));
    const parentId = jobs[randomParentIndex].id;
    const jobId = `job-${currentId}`;
    jobs.push(createJob(jobId, `Extra Task ${currentId}`, [{ source: parentId, target: jobId, type: 'parent' }]));
    currentId++;
  }
  
  return jobs.slice(0, 1000); // Ensure exactly 1000 jobs
};