import React from 'react';

interface LoadingSkeletonProps {
  type?: 'graph' | 'gantt' | 'details';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'graph' }) => {
  if (type === 'graph') {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (type === 'gantt') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // details type
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
