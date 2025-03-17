export interface TimeRange {
  start: string | null;
  end: string | null;
}

export interface FilterState {
  componentType: string | null;
  activitySet: string | null;
  status: string | null;
  showFailed: boolean;
  timeRange: TimeRange;
}
