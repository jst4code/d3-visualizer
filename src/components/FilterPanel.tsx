import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setComponentType,
  setActivitySet,
  setStatus,
  setShowFailed,
  setTimeRange,
  resetFilters
} from '../store/slices/filterSlice';

const FilterPanel: React.FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filter);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={() => dispatch(resetFilters())}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Component Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={filters.componentType || ''}
            onChange={(e) => dispatch(setComponentType(e.target.value || null))}
          >
            <option value="">All Components</option>
            <option value="input">Input</option>
            <option value="process">Process</option>
            <option value="output">Output</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Set</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={filters.activitySet || ''}
            onChange={(e) => dispatch(setActivitySet(e.target.value || null))}
          >
            <option value="">All Activities</option>
            <option value="etl">ETL</option>
            <option value="analytics">Analytics</option>
            <option value="reporting">Reporting</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={filters.status || ''}
            onChange={(e) => dispatch(setStatus(e.target.value || null))}
          >
            <option value="">All Statuses</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.showFailed}
              onChange={(e) => dispatch(setShowFailed(e.target.checked))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Show Failed Only</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Time Range</label>
          <div className="space-y-2 mt-1">
            <input
              type="datetime-local"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={filters.timeRange.start || ''}
              onChange={(e) => dispatch(setTimeRange({
                ...filters.timeRange,
                start: e.target.value || null
              }))}
            />
            <input
              type="datetime-local"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={filters.timeRange.end || ''}
              onChange={(e) => dispatch(setTimeRange({
                ...filters.timeRange,
                end: e.target.value || null
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
