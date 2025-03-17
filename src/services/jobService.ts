import axios from 'axios';
import { JobsResponse } from '../types/job';

const API_BASE_URL = process.env.REACT_APP_API_URL// || 'http://localhost:3000';

export const jobService = {
  async getJobs(): Promise<JobsResponse> {
    try {
      const response = await axios.get<JobsResponse>(`${API_BASE_URL}/jobs.json`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  async getJobById(id: string) {
    try {
      id = '1';
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  }
};
