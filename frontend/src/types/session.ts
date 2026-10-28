export interface RecordedEvent {
  id: string;
  type: string;
  timestamp: string;
  duration_ms: number;
  metric_value: number | null;
  details: string;
}

export interface SessionSummary {
  session_id: string;
  start_timestamp: string;
  end_timestamp: string | null;
  duration_seconds: number;
  drowsiness_event_count: number;
  possible_yawning_event_count: number;
  session_status: 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED';
  events: RecordedEvent[];
  userId?: string;
}
