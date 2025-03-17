import { DependencyList } from "react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
}

export interface JobNode {
  id: string;
  name?: string;
  type?: string;
  activitySet?: string;
  status?: string;
  runtime?: number;
  maxWaitTime?: number;
  startTime?: string;
  endTime?: string;
  children?: JobNode[];
}

export interface TreeNode {
  id: string;
  name: string;
  status?: string;
  componentType?: string;
  children: TreeNode[];
}
