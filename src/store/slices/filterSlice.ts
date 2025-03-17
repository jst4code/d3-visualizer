import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState, TimeRange } from '../../types/filter';

const initialState: FilterState = {
  componentType: null,
  activitySet: null,
  status: null,
  showFailed: false,
  timeRange: {
    start: null,
    end: null
  }
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setComponentType: (state, action: PayloadAction<string | null>) => {
      state.componentType = action.payload;
    },
    setActivitySet: (state, action: PayloadAction<string | null>) => {
      state.activitySet = action.payload;
    },
    setStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setShowFailed: (state, action: PayloadAction<boolean>) => {
      state.showFailed = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload;
    },
    resetFilters: (state) => {
      return initialState;
    }
  }
});

export const {
  setComponentType,
  setActivitySet,
  setStatus,
  setShowFailed,
  setTimeRange,
  resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;
