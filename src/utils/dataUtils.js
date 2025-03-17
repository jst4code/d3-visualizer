/**
 * Utility functions for transforming job data for D3 visualizations
 */

/**
 * Transforms the flat node structure into a hierarchical structure for D3 hierarchical visualizations
 * @param {Object} data - The jobs data with nodes and links
 * @returns {Object} Hierarchical data structure suitable for D3
 */
export function transformToHierarchy(data) {
  if (!data || !data.nodes || !data.links) {
    return null;
  }
  
  // Find the root node
  const rootNode = data.nodes.find(node => node.parent === null);
  if (!rootNode) return null;
  
  // Create the hierarchical structure recursively
  const buildHierarchy = (nodeId) => {
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const children = data.nodes
      .filter(n => n.parent === nodeId)
      .map(childNode => buildHierarchy(childNode.id))
      .filter(Boolean);
    
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      level: node.level,
      children: children.length > 0 ? children : null
    };
  };
  
  return buildHierarchy(rootNode.id);
}

/**
 * Prepare data for D3 force-directed graphs
 * @param {Object} data - The jobs data with nodes and links
 * @returns {Object} Prepared data for force-directed visualization
 */
export function prepareForceGraphData(data) {
  if (!data || !data.nodes || !data.links) {
    return { nodes: [], links: [] };
  }
  
  // Create a map of node ids for quick lookup
  const nodeMap = {};
  data.nodes.forEach(node => {
    nodeMap[node.id] = { ...node };
  });
  
  // Transform links to use actual node references
  const links = data.links.map(link => ({
    source: nodeMap[link.source] || link.source,
    target: nodeMap[link.target] || link.target,
  }));
  
  return {
    nodes: Object.values(nodeMap),
    links: links
  };
}

/**
 * Filter the dataset by maximum depth
 * @param {Object} data - The jobs data with nodes and links
 * @param {Number} maxDepth - Maximum hierarchy depth to include
 * @returns {Object} Filtered data up to specified depth
 */
export function filterByMaxDepth(data, maxDepth) {
  if (!data || !data.nodes || !data.links || maxDepth < 0) {
    return { nodes: [], links: [] };
  }
  
  const filteredNodes = data.nodes.filter(node => node.level <= maxDepth);
  const nodeIds = new Set(filteredNodes.map(node => node.id));
  
  const filteredLinks = data.links.filter(link => 
    nodeIds.has(typeof link.source === 'object' ? link.source.id : link.source) && 
    nodeIds.has(typeof link.target === 'object' ? link.target.id : link.target)
  );
  
  return {
    nodes: filteredNodes,
    links: filteredLinks
  };
}
