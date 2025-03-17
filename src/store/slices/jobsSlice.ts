import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobs, fetchJobDetails } from '../../services/api';

export interface Job {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'waiting';
  type: string;
  activitySet: string;
  maxWaitTime: number;
  runtime: number;
  dependencies: Dependency[];
  startTime?: string;
  endTime?: string;
}

interface Dependency {
  source: string;
  target: string;
  type: string;
}

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  error: null,
};

export const getJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await fetchJobs();
  return response;
});

export const getJobDetails = createAsyncThunk(
  'jobs/fetchJobDetails',
  async (jobId: string) => {
    const response = await fetchJobDetails(jobId);
    return response;
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSelectedJob: (state, action: PayloadAction<Job | null>) => {
      state.selectedJob = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(getJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(getJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch job details';
      });
  },
});

export const { setSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
