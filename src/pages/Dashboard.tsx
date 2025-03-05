import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getJobs } from '../store/slices/jobsSlice';
import GraphVisualizer from '../components/GraphVisualizer';
import GanttChart from '../components/GanttChart';
import FilterPanel from '../components/FilterPanel';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);
  const filters = useSelector((state: RootState) => state.filter);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredJobs = jobs.filter(job => {
    if (filters.componentType && job.componentType !== filters.componentType) return false;
    if (filters.activitySet && job.activitySet !== filters.activitySet) return false;
    if (filters.status && job.status !== filters.status) return false;
    if (filters.showFailed && job.status !== 'failed') return false;
    if (filters.timeRange.start && job.startTime && new Date(job.startTime) < new Date(filters.timeRange.start)) return false;
    if (filters.timeRange.end && job.endTime && new Date(job.endTime) > new Date(filters.timeRange.end)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <FilterPanel />
        </div>
        
        <div className="col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Job Dependencies</h2>
            <GraphVisualizer jobs={filteredJobs} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Job Timeline</h2>
            <GanttChart jobs={filteredJobs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
