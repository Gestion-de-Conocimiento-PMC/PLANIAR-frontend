export interface TaskActivity {
  id: number | string;
  title: string;
  type: string;
  subject: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  status: string;
  description: string;
  suggestedStartTime: string;
}

export interface ClassItem {
  id: string;
  title: string;
  days: string[];
  dateFrom: string;
  dateTo: string;
  dayTimes: Record<string, { start: string; end: string }>;
  room: string;
  professor: string;
  color: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  classes: ClassItem[];
  activities: TaskActivity[];
}