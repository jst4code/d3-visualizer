import '@testing-library/jest-dom';

// Mock D3 transitions
jest.mock('d3', () => {
  const d3 = jest.requireActual('d3');
  const mockSelection = {
    transition: () => mockSelection,
    duration: () => mockSelection,
    attr: () => mockSelection,
    style: () => mockSelection,
    call: () => mockSelection,
  };
  
  return {
    ...d3,
    select: () => mockSelection,
    selectAll: () => mockSelection,
  };
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
