import React from 'react';
import { render, screen } from '@testing-library/react';
import GanttChart from '../GanttChart';

const mockJobs = [
  {
    id: '1',
    name: 'Job 1',
    status: 'completed',
    componentType: 'Extract',
    activitySet: 'Daily',
    maxWaitTime: 120,
    runtime: 300,
    dependencies: [],
    startTime: '2023-09-15T01:00:00',
    endTime: '2023-09-15T01:05:00',
  },
  {
    id: '2',
    name: 'Job 2',
    status: 'failed',
    componentType: 'Transform',
    activitySet: 'Daily',
    maxWaitTime: 60,
    runtime: 240,
    dependencies: ['1'],
    startTime: '2023-09-15T01:05:00',
    endTime: '2023-09-15T01:09:00',
  },
] as const;

describe('GanttChart', () => {
  it('renders svg element', () => {
    render(<GanttChart jobs={mockJobs} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <GanttChart jobs={mockJobs} width={1000} height={400} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '1000');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('renders nothing when jobs array is empty', () => {
    const { container } = render(<GanttChart jobs={[]} />);
    const svg = container.querySelector('svg');
    expect(svg?.children.length).toBe(0);
  });
});
