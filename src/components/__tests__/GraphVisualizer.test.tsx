import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GraphVisualizer from '../GraphVisualizer';

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
  },
] as const;

describe('GraphVisualizer', () => {
  it('renders svg element', () => {
    render(
      <BrowserRouter>
        <GraphVisualizer jobs={mockJobs} />
      </BrowserRouter>
    );
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <BrowserRouter>
        <GraphVisualizer jobs={mockJobs} width={1000} height={800} />
      </BrowserRouter>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '1000');
    expect(svg).toHaveAttribute('height', '800');
  });

  it('renders nothing when jobs array is empty', () => {
    const { container } = render(
      <BrowserRouter>
        <GraphVisualizer jobs={[]} />
      </BrowserRouter>
    );
    const svg = container.querySelector('svg');
    expect(svg?.children.length).toBe(0);
  });
});
