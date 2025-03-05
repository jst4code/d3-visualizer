import { Job } from '../store/slices/jobsSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const fetchJobs = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const fetchJobDetails = async (jobId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const fetchTimelineData = async (filter?: any) => {
  const token = localStorage.getItem('token');
  let url = `${API_BASE_URL}/timeline`;
  
  if (filter) {
    const params = new URLSearchParams();
    Object.entries(filter)
      .filter(([_, value]) => value !== null && value !== undefined)
      .forEach(([key, value]) => params.append(key, String(value)));
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};
