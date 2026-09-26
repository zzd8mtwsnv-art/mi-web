export type Priority = 'baja' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type GradeCategory = 'examen' | 'trabajo' | 'proyecto' | 'participacion' | 'otro';
export type GoalType = 'daily_time' | 'weekly_tasks' | 'subject_grade' | 'custom';
export type FocusType = 'normal' | 'pomodoro' | 'short_break' | 'long_break';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
export type CustomEventType = 'evento' | 'exposicion' | 'recordatorio';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string; // 'google.com' | 'apple.com' | 'demo'
  isAnonymous?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  gradeLevel: string; // e.g. "2º Bachillerato Científico-Tecnológico"
  avatarColor: string;
  email?: string;
  photoURL?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface CustomEvent {
  id: string;
  title: string;
  description?: string;
  type: CustomEventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  subjectId?: string;
  color?: string;
  completed?: boolean;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  shortName?: string;
  color: string; // Hex color code
  icon: string; // Lucide icon name
  teacher?: string;
  classroom?: string;
  notes?: string;
  currentAverage?: number;
  targetGrade?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  classroom?: string;
  topics?: string;
  importance: 'normal' | 'alta' | 'crucial';
  grade?: number;
  maxGrade?: number;
  weightPercentage?: number;
  notes?: string;
}

export interface ScheduleItem {
  id: string;
  subjectId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5; // 1 = Lunes, 5 = Viernes
  startTime: string; // "08:30"
  endTime: string; // "09:25"
  classroom?: string;
  teacher?: string;
}

export interface FocusSession {
  id: string;
  subjectId?: string;
  durationMinutes: number;
  type: FocusType;
  date: string; // ISO date string
  completed: boolean;
  notes?: string;
}

export interface GradeItem {
  id: string;
  subjectId: string;
  title: string;
  category: GradeCategory;
  score: number;
  maxScore: number;
  weightPercentage?: number;
  date: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  completed: boolean;
  subjectId?: string;
}

export type PlanType = 'examen' | 'periodo_global' | 'manual';
export type DayPart = 'mañana' | 'tarde' | 'noche' | 'sin_hora';

export interface PlannedStudySession {
  id: string;
  planId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (opcional)
  dayPart?: DayPart; // 'mañana' | 'tarde' | 'noche' | 'sin_hora'
  subjectId?: string;
  title: string;
  content: string;
  durationMinutes: number;
  completed?: boolean;
  notes?: string;
}

export interface StudyPlanMilestone {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  topics: string;
  type: 'estudio' | 'resumen' | 'ejercicios' | 'repaso';
  durationMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  type?: PlanType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt: string;
  examId?: string;
  examDate?: string;
  subjectId?: string;
  subjectIds?: string[];
  difficulty?: 'facil' | 'medio' | 'dificil';
  dailyStudyMinutes?: number;
  topics?: string[];
  instructions?: string;
  sessions?: PlannedStudySession[];
  milestones?: StudyPlanMilestone[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'exam' | 'task' | 'streak' | 'goal' | 'system' | 'custom_event';
  timestamp: string;
  read: boolean;
  actionView?: string;
}

export interface Settings {
  studentName: string;
  gradeLevel: string; // e.g. "2º Bachillerato Científico-Tecnológico"
  theme: ThemeMode;
  dailyStudyGoalMinutes: number;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroLongBreakInterval: number;
  firstDayOfWeek: 'monday' | 'sunday';
  timeFormat: '24h' | '12h';
  soundEnabled: boolean;
  streakGoalDays: number;
}