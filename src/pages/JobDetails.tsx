import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getJobDetails } from '../store/slices/jobsSlice';
import { ArrowLeft, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedJob, loading, error } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (jobId) {
      dispatch(getJobDetails(jobId));
    }
  }, [dispatch, jobId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'completed': return <Check className="h-5 w-5 text-success" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-danger" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Job not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="flex items-center">
          {getStatusIcon(selectedJob.status)}
          <span className="ml-2 capitalize">{selectedJob.status}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">{selectedJob.name}</h1>
        </div>

        <div className="px-6 py-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Component Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedJob.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Activity Set</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedJob.activitySet}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Maximum Wait Time</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedJob.maxWaitTime}s</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Runtime</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedJob.runtime}s</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {selectedJob.startTime ? new Date(selectedJob.startTime).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {selectedJob.endTime ? new Date(selectedJob.endTime).toLocaleString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
