import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  componentType: string | null;
  activitySet: string | null;
  status: string | null;
  showFailed: boolean;
  timeRange: {
    start: string | null;
    end: string | null;
  };
}

const initialState: FilterState = {
  componentType: null,
  activitySet: null,
  status: null,
  showFailed: false,
  timeRange: {
    start: null,
    end: null,
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setComponentTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.componentType = action.payload;
    },
    setActivitySetFilter: (state, action: PayloadAction<string | null>) => {
      state.activitySet = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setShowFailedOnly: (state, action: PayloadAction<boolean>) => {
      state.showFailed = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.timeRange = action.payload;
    },
    resetFilters: (state) => {
      return initialState;
    },
  },
});

export const {
  setComponentTypeFilter,
  setActivitySetFilter,
  setStatusFilter,
  setShowFailedOnly,
  setTimeRange,
  resetFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
