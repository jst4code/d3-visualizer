/**
 * Service for fetching and processing jobs data
 */
class JobsDataService {
  constructor() {
    this.data = null;
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Fetch jobs data from the JSON file
   * @returns {Promise} Promise resolving to the jobs data
   */
  async fetchJobsData() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await fetch('/data/large_jobs.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs data: ${response.status}`);
      }
      
      this.data = await response.json();
      this.isLoading = false;
      return this.data;
    } catch (error) {
      this.error = error.message;
      this.isLoading = false;
      console.error('Error fetching jobs data:', error);
      throw error;
    }
  }

  /**
   * Get all nodes from the dataset
   * @returns {Array} Array of node objects
   */
  getNodes() {
    return this.data?.nodes || [];
  }

  /**
   * Get all links from the dataset
   * @returns {Array} Array of link objects
   */
  getLinks() {
    return this.data?.links || [];
  }

  /**
   * Get nodes filtered by level
   * @param {Number} level - The hierarchy level to filter by
   * @returns {Array} Filtered array of nodes
   */
  getNodesByLevel(level) {
    return this.getNodes().filter(node => node.level === level);
  }

  /**
   * Get nodes filtered by type
   * @param {String} type - The node type to filter by ("box" or "command")
   * @returns {Array} Filtered array of nodes
   */
  getNodesByType(type) {
    return this.getNodes().filter(node => node.type === type);
  }

  /**
   * Get child nodes for a specific parent
   * @param {String} parentId - ID of the parent node
   * @returns {Array} Array of child nodes
   */
  getChildNodes(parentId) {
    return this.getNodes().filter(node => node.parent === parentId);
  }

  /**
   * Get the full path from root to the specified node
   * @param {String} nodeId - ID of the target node
   * @returns {Array} Array of nodes representing the path
   */
  getNodePath(nodeId) {
    const path = [];
    let currentNode = this.getNodes().find(node => node.id === nodeId);
    
    while (currentNode) {
      path.unshift(currentNode);
      if (currentNode.parent === null) break;
      currentNode = this.getNodes().find(node => node.id === currentNode.parent);
    }
    
    return path;
  }
}

// Create and export a singleton instance
const jobsDataService = new JobsDataService();
export default jobsDataService;
