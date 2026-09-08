import {
  Subject,
  Task,
  Exam,
  ScheduleItem,
  FocusSession,
  GradeItem,
  Goal,
  StudyPlan,
  NotificationItem,
  Settings,
  UserProfile,
  CustomEvent,
  AuthUser
} from '../types';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  PROFILES: 'studyflow_profiles_v1',
  CURRENT_USER_ID: 'studyflow_current_user_id_v1',
  AUTH_USER: 'studyflow_auth_user_v1',
  SUBJECTS: 'studyflow_subjects_v1',
  TASKS: 'studyflow_tasks_v1',
  EXAMS: 'studyflow_exams_v1',
  SCHEDULE: 'studyflow_schedule_v1',
  SESSIONS: 'studyflow_sessions_v1',
  GRADES: 'studyflow_grades_v1',
  GOALS: 'studyflow_goals_v1',
  PLANS: 'studyflow_plans_v1',
  NOTIFICATIONS: 'studyflow_notifications_v1',
  CUSTOM_EVENTS: 'studyflow_custom_events_v1',
  SETTINGS: 'studyflow_settings_v1',
  STREAK_RECORD: 'studyflow_streak_record_v1',
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-demo',
    name: 'Álex',
    gradeLevel: '2º Bachillerato Científico-Tecnológico',
    avatarColor: '#6366F1',
    createdAt: new Date().toISOString(),
    isDemo: true
  }
];

export const DEFAULT_CUSTOM_EVENTS: CustomEvent[] = [
  {
    id: 'ev-1',
    title: 'Exposición Oral: Cortes de Cádiz y Constitución de 1812',
    description: 'Presentación con diapositivas en grupo (10 minutos de exposición + preguntas).',
    type: 'exposicion',
    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    time: '10:30',
    subjectId: 'sub-his',
    color: '#F59E0B',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ev-2',
    title: 'Jornada Cultural y Festivo Escolar',
    description: 'Actividades en el centro y descanso lectivo.',
    type: 'evento',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    color: '#8B5CF6',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ev-3',
    title: 'Recordatorio: Llevar calculadora científica y regla al examen',
    description: 'Comprobar pilas de la calculadora no programable.',
    type: 'recordatorio',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '08:15',
    subjectId: 'sub-mat',
    color: '#06B6D4',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Realistic Spanish Bachillerato Sample Data
export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-mat',
    name: 'Matemáticas II',
    shortName: 'Mates',
    color: '#6366F1',
    icon: 'Calculator',
    teacher: 'D. Manuel García',
    classroom: 'Aula 204',
    currentAverage: 8.75,
    targetGrade: 9.0,
    notes: 'Temario: Matrices, Determinantes, Sistemas, Geometría en el espacio y Cálculo diferencial.'
  },
  {
    id: 'sub-fis',
    name: 'Física y Química',
    shortName: 'Física',
    color: '#EC4899',
    icon: 'Atom',
    teacher: 'Dña. Elena Vega',
    classroom: 'Lab 2',
    currentAverage: 8.20,
    targetGrade: 8.5,
    notes: 'Formulario disponible en el aula virtual. Prácticas de laboratorio cada 2 semanas.'
  },
  {
    id: 'sub-len',
    name: 'Lengua Castellana y Literatura',
    shortName: 'Lengua',
    color: '#F59E0B',
    icon: 'BookOpen',
    teacher: 'D. Carlos Rivas',
    classroom: 'Aula 204',
    currentAverage: 7.90,
    targetGrade: 8.0,
    notes: 'Lecturas obligatorias: Luces de Bohemia y Crónica de una muerte anunciada.'
  },
  {
    id: 'sub-his',
    name: 'Historia de España',
    shortName: 'Historia',
    color: '#10B981',
    icon: 'Landmark',
    teacher: 'Dña. María Santos',
    classroom: 'Aula 204',
    currentAverage: 9.10,
    targetGrade: 9.5,
    notes: 'Clave para la EvAU / Selectividad: esquemas cronológicos y fuentes históricas.'
  },
  {
    id: 'sub-ing',
    name: 'Inglés C1',
    shortName: 'Inglés',
    color: '#06B6D4',
    icon: 'Globe',
    teacher: 'Sarah Jenkins',
    classroom: 'Aula Idiomas',
    currentAverage: 9.40,
    targetGrade: 9.5,
    notes: 'Preparación C1 Advanced: Focus on essays, idioms and listening.'
  },
  {
    id: 'sub-eco',
    name: 'Economía de la Empresa',
    shortName: 'Economía',
    color: '#8B5CF6',
    icon: 'TrendingUp',
    teacher: 'D. Alberto Navarro',
    classroom: 'Aula 102',
    currentAverage: 8.50,
    targetGrade: 9.0,
    notes: 'Balance, cuenta de pérdidas y ganancias, análisis financiero.'
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Ejercicios de Matrices y Determinantes (Pág. 45: 12-18)',
    description: 'Resolver problemas de rango y discusión de sistemas con parámetro k.',
    subjectId: 'sub-mat',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '18:00',
    priority: 'alta',
    status: 'pendiente',
    estimatedMinutes: 60,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Comentario de texto: Fragmento de Luces de Bohemia',
    description: 'Analizar la deformación grotesca y el esperpento según Valle-Inclán.',
    subjectId: 'sub-len',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'media',
    status: 'en_progreso',
    estimatedMinutes: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Problemas de Campo Gravitatorio y Órbitas Satelitales',
    description: 'Calcular velocidad de escape y energía mecánica orbital.',
    subjectId: 'sub-fis',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'urgente',
    status: 'pendiente',
    estimatedMinutes: 75,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Essay: "Artificial Intelligence in Modern Education"',
    description: 'Write an opinion essay of 220-260 words using advanced linking words.',
    subjectId: 'sub-ing',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    priority: 'baja',
    status: 'pendiente',
    estimatedMinutes: 50,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-5',
    title: 'Esquema y resumen: La Guerra de la Independencia (1808-1814)',
    description: 'Causas, fases del conflicto y trascendencia de las Cortes de Cádiz.',
    subjectId: 'sub-his',
    dueDate: getTodayDateString(),
    priority: 'alta',
    status: 'completada',
    completedAt: new Date().toISOString(),
    estimatedMinutes: 40,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Examen Bloque I: Álgebra Lineal y Matrices',
    subjectId: 'sub-mat',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '09:30',
    classroom: 'Aula 204',
    topics: 'Tema 1: Matrices y Operaciones, Tema 2: Determinantes, Tema 3: Sistemas de Rouché-Frobenius',
    importance: 'crucial',
    weightPercentage: 40,
    notes: 'Entra discusión de sistemas con parámetro. Traer calculadora no programable.'
  },
  {
    id: 'exam-2',
    title: 'Control Parcial: Campo Gravitatorio y Fuerzas Centrales',
    subjectId: 'sub-fis',
    date: new Date(Date.now() + 86400000 * 11).toISOString().split('T')[0],
    time: '11:30',
    classroom: 'Lab 2',
    topics: 'Ley de Gravitación Universal, Potencial Gravitatorio, Movimiento Satelital',
    importance: 'alta',
    weightPercentage: 30,
    notes: 'Revisar fórmulas de velocidad orbital y conservación del momento angular.'
  },
  {
    id: 'exam-3',
    title: 'Examen Tema 1-3: Crisis del Antiguo Régimen y Revolución Liberal',
    subjectId: 'sub-his',
    date: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0],
    time: '10:30',
    classroom: 'Aula 204',
    topics: '1. Guerra de la Independencia, 2. Constitución de 1812, 3. Reinado de Fernando VII',
    importance: 'alta',
    weightPercentage: 35
  }
];

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  // Lunes (1)
  { id: 'sch-1', subjectId: 'sub-mat', dayOfWeek: 1, startTime: '08:30', endTime: '09:25', classroom: 'Aula 204', teacher: 'D. Manuel García' },
  { id: 'sch-2', subjectId: 'sub-fis', dayOfWeek: 1, startTime: '09:30', endTime: '10:25', classroom: 'Lab 2', teacher: 'Dña. Elena Vega' },
  { id: 'sch-3', subjectId: 'sub-len', dayOfWeek: 1, startTime: '10:30', endTime: '11:25', classroom: 'Aula 204', teacher: 'D. Carlos Rivas' },
  { id: 'sch-4', subjectId: 'sub-ing', dayOfWeek: 1, startTime: '11:55', endTime: '12:50', classroom: 'Aula Idiomas', teacher: 'Sarah Jenkins' },
  { id: 'sch-5', subjectId: 'sub-eco', dayOfWeek: 1, startTime: '12:55', endTime: '13:50', classroom: 'Aula 102', teacher: 'D. Alberto Navarro' },

  // Martes (2)
  { id: 'sch-6', subjectId: 'sub-his', dayOfWeek: 2, startTime: '08:30', endTime: '09:25', classroom: 'Aula 204', teacher: 'Dña. María Santos' },
  { id: 'sch-7', subjectId: 'sub-mat', dayOfWeek: 2, startTime: '09:30', endTime: '10:25', classroom: 'Aula 204', teacher: 'D. Manuel García' },
  { id: 'sch-8', subjectId: 'sub-fis', dayOfWeek: 2, startTime: '10:30', endTime: '11:25', classroom: 'Lab 2', teacher: 'Dña. Elena Vega' },
  { id: 'sch-9', subjectId: 'sub-len', dayOfWeek: 2, startTime: '11:55', endTime: '12:50', classroom: 'Aula 204', teacher: 'D. Carlos Rivas' },
  { id: 'sch-10', subjectId: 'sub-ing', dayOfWeek: 2, startTime: '12:55', endTime: '13:50', classroom: 'Aula Idiomas', teacher: 'Sarah Jenkins' },

  // Miércoles (3)
  { id: 'sch-11', subjectId: 'sub-mat', dayOfWeek: 3, startTime: '08:30', endTime: '09:25', classroom: 'Aula 204', teacher: 'D. Manuel García' },
  { id: 'sch-12', subjectId: 'sub-his', dayOfWeek: 3, startTime: '09:30', endTime: '10:25', classroom: 'Aula 204', teacher: 'Dña. María Santos' },
  { id: 'sch-13', subjectId: 'sub-len', dayOfWeek: 3, startTime: '10:30', endTime: '11:25', classroom: 'Aula 204', teacher: 'D. Carlos Rivas' },
  { id: 'sch-14', subjectId: 'sub-eco', dayOfWeek: 3, startTime: '11:55', endTime: '12:50', classroom: 'Aula 102', teacher: 'D. Alberto Navarro' },
  { id: 'sch-15', subjectId: 'sub-fis', dayOfWeek: 3, startTime: '12:55', endTime: '13:50', classroom: 'Lab 2', teacher: 'Dña. Elena Vega' },

  // Jueves (4)
  { id: 'sch-16', subjectId: 'sub-fis', dayOfWeek: 4, startTime: '08:30', endTime: '09:25', classroom: 'Lab 2', teacher: 'Dña. Elena Vega' },
  { id: 'sch-17', subjectId: 'sub-mat', dayOfWeek: 4, startTime: '09:30', endTime: '10:25', classroom: 'Aula 204', teacher: 'D. Manuel García' },
  { id: 'sch-18', subjectId: 'sub-his', dayOfWeek: 4, startTime: '10:30', endTime: '11:25', classroom: 'Aula 204', teacher: 'Dña. María Santos' },
  { id: 'sch-19', subjectId: 'sub-ing', dayOfWeek: 4, startTime: '11:55', endTime: '12:50', classroom: 'Aula Idiomas', teacher: 'Sarah Jenkins' },
  { id: 'sch-20', subjectId: 'sub-eco', dayOfWeek: 4, startTime: '12:55', endTime: '13:50', classroom: 'Aula 102', teacher: 'D. Alberto Navarro' },

  // Viernes (5)
  { id: 'sch-21', subjectId: 'sub-len', dayOfWeek: 5, startTime: '08:30', endTime: '09:25', classroom: 'Aula 204', teacher: 'D. Carlos Rivas' },
  { id: 'sch-22', subjectId: 'sub-mat', dayOfWeek: 5, startTime: '09:30', endTime: '10:25', classroom: 'Aula 204', teacher: 'D. Manuel García' },
  { id: 'sch-23', subjectId: 'sub-fis', dayOfWeek: 5, startTime: '10:30', endTime: '11:25', classroom: 'Lab 2', teacher: 'Dña. Elena Vega' },
  { id: 'sch-24', subjectId: 'sub-his', dayOfWeek: 5, startTime: '11:55', endTime: '12:50', classroom: 'Aula 204', teacher: 'Dña. María Santos' },
  { id: 'sch-25', subjectId: 'sub-ing', dayOfWeek: 5, startTime: '12:55', endTime: '13:50', classroom: 'Aula Idiomas', teacher: 'Sarah Jenkins' }
];

export const DEFAULT_GRADES: GradeItem[] = [
  { id: 'gr-1', subjectId: 'sub-mat', title: 'Prueba Inicial de Álgebra', category: 'examen', score: 8.5, maxScore: 10, weightPercentage: 15, date: '2026-09-15' },
  { id: 'gr-2', subjectId: 'sub-mat', title: 'Entrega de Problemas de Sistemas', category: 'trabajo', score: 9.0, maxScore: 10, weightPercentage: 10, date: '2026-09-24' },
  { id: 'gr-3', subjectId: 'sub-fis', title: 'Práctica de Laboratorio: Péndulo', category: 'proyecto', score: 8.0, maxScore: 10, weightPercentage: 15, date: '2026-09-18' },
  { id: 'gr-4', subjectId: 'sub-fis', title: 'Examen de Cinemática y Vectores', category: 'examen', score: 8.4, maxScore: 10, weightPercentage: 25, date: '2026-09-28' },
  { id: 'gr-5', subjectId: 'sub-len', title: 'Comentario de Sintaxis Compleja', category: 'trabajo', score: 7.5, maxScore: 10, weightPercentage: 20, date: '2026-09-20' },
  { id: 'gr-6', subjectId: 'sub-len', title: 'Control de Lectura Modernismo', category: 'examen', score: 8.3, maxScore: 10, weightPercentage: 20, date: '2026-09-29' },
  { id: 'gr-7', subjectId: 'sub-his', title: 'Ensayo Crisis Antiguo Régimen', category: 'trabajo', score: 9.2, maxScore: 10, weightPercentage: 20, date: '2026-09-22' },
  { id: 'gr-8', subjectId: 'sub-his', title: 'Participación y Debates', category: 'participacion', score: 9.0, maxScore: 10, weightPercentage: 10, date: '2026-09-30' },
  { id: 'gr-9', subjectId: 'sub-ing', title: 'Speaking Mock Interview C1', category: 'examen', score: 9.5, maxScore: 10, weightPercentage: 30, date: '2026-09-25' },
  { id: 'gr-10', subjectId: 'sub-eco', title: 'Análisis de Caso: Empresa Start-up', category: 'proyecto', score: 8.5, maxScore: 10, weightPercentage: 25, date: '2026-09-26' }
];

export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Estudiar 2h diarias',
    description: 'Mantener un hábito constante de estudio y repaso vespertino.',
    type: 'daily_time',
    targetValue: 120,
    currentValue: 85,
    unit: 'min',
    completed: false
  },
  {
    id: 'goal-2',
    title: 'Completar 5 tareas esta semana',
    description: 'Avanzar en las entregas antes del fin de semana.',
    type: 'weekly_tasks',
    targetValue: 5,
    currentValue: 4,
    unit: 'tareas',
    completed: false
  },
  {
    id: 'goal-3',
    title: 'Superar el 8.5 en Matemáticas II',
    description: 'Objetivo de media trimestral para la nota de acceso a la Universidad.',
    type: 'subject_grade',
    targetValue: 8.5,
    currentValue: 8.75,
    unit: 'pts',
    subjectId: 'sub-mat',
    completed: true
  }
];

export function generateDefaultSessions(): FocusSession[] {
  const sessions: FocusSession[] = [];
  const today = new Date();
  
  const sampleTimes = [
    { daysAgo: 6, mins: 110, sub: 'sub-mat' },
    { daysAgo: 5, mins: 90, sub: 'sub-fis' },
    { daysAgo: 4, mins: 135, sub: 'sub-his' },
    { daysAgo: 3, mins: 75, sub: 'sub-len' },
    { daysAgo: 2, mins: 120, sub: 'sub-mat' },
    { daysAgo: 1, mins: 150, sub: 'sub-fis' },
    { daysAgo: 0, mins: 85, sub: 'sub-mat' }
  ];

  sampleTimes.forEach((item, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.daysAgo);
    d.setHours(17, 30, 0, 0);

    sessions.push({
      id: `sess-${idx + 1}`,
      subjectId: item.sub,
      durationMinutes: item.mins,
      type: 'pomodoro',
      date: d.toISOString(),
      completed: true,
      notes: 'Sesión productiva de repaso y ejercicios.'
    });
  });

  return sessions;
}

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Examen de Álgebra Lineal en 4 días',
    message: 'Recuerda repasar los sistemas con parámetro para Matemáticas II.',
    type: 'exam',
    timestamp: new Date().toISOString(),
    read: false,
    actionView: 'exams'
  },
  {
    id: 'notif-2',
    title: '¡Racha de estudio activa! 🔥',
    message: 'Llevas 7 días consecutivos estudiando. ¡Gran constancia!',
    type: 'streak',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false,
    actionView: 'focus'
  },
  {
    id: 'notif-3',
    title: '3 tareas pendientes para esta semana',
    message: 'Consulta la sección de Tareas para organizar tus entregas.',
    type: 'task',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    read: true,
    actionView: 'tasks'
  }
];

export const DEFAULT_SETTINGS: Settings = {
  studentName: 'Álex',
  gradeLevel: '2º Bachillerato Científico-Tecnológico',
  theme: 'dark',
  dailyStudyGoalMinutes: 120,
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroLongBreakInterval: 4,
  firstDayOfWeek: 'monday',
  timeFormat: '24h',
  soundEnabled: true,
  streakGoalDays: 14
};

// Storage helper methods
export const storage = {
  getProfiles: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return data ? JSON.parse(data) : DEFAULT_PROFILES;
  },
  setProfiles: (data: UserProfile[]) => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data));
  },

  getCurrentUserId: (): string | null => {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (id === 'null' || id === 'guest_logout') return null;
    return id !== null ? id : 'user-demo';
  },
  setCurrentUserId: (id: string | null) => {
    if (id === null) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'guest_logout');
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    }
  },

  getAuthUser: (): AuthUser | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
  },
  setAuthUser: (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
  },
  setSubjects: (data: Subject[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data));
  },

  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  },
  setTasks: (data: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
  },

  getExams: (): Exam[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return data ? JSON.parse(data) : DEFAULT_EXAMS;
  },
  setExams: (data: Exam[]) => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data));
  },

  getSchedule: (): ScheduleItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return data ? JSON.parse(data) : DEFAULT_SCHEDULE;
  },
  setSchedule: (data: ScheduleItem[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(data));
  },

  getSessions: (): FocusSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : generateDefaultSessions();
  },
  setSessions: (data: FocusSession[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data));
  },

  getGrades: (): GradeItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GRADES);
    return data ? JSON.parse(data) : DEFAULT_GRADES;
  },
  setGrades: (data: GradeItem[]) => {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(data));
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : DEFAULT_GOALS;
  },
  setGoals: (data: Goal[]) => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data));
  },

  getPlans: (): StudyPlan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS);
    return data ? JSON.parse(data) : [];
  },
  setPlans: (data: StudyPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data));
  },

  getNotifications: (): NotificationItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
  },
  setNotifications: (data: NotificationItem[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
  },

  getCustomEvents: (): CustomEvent[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    return data ? JSON.parse(data) : DEFAULT_CUSTOM_EVENTS;
  },
  setCustomEvents: (data: CustomEvent[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(data));
  },

  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  setSettings: (data: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  },

  getStreakRecord: (): number => {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK_RECORD);
    return data ? parseInt(data, 10) : 12;
  },
  setStreakRecord: (val: number) => {
    localStorage.setItem(STORAGE_KEYS.STREAK_RECORD, val.toString());
  },

  clearCurrentProfileData: () => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STREAK_RECORD, '0');
  },

  resetAllToDemo: () => {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.GRADES);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STREAK_RECORD);
  },

  exportAllDataJSON: () => {
    const state = {
      profiles: storage.getProfiles(),
      currentUserId: storage.getCurrentUserId(),
      authUser: storage.getAuthUser(),
      subjects: storage.getSubjects(),
      tasks: storage.getTasks(),
      exams: storage.getExams(),
      schedule: storage.getSchedule(),
      sessions: storage.getSessions(),
      grades: storage.getGrades(),
      goals: storage.getGoals(),
      plans: storage.getPlans(),
      notifications: storage.getNotifications(),
      customEvents: storage.getCustomEvents(),
      settings: storage.getSettings(),
      streakRecord: storage.getStreakRecord(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(state, null, 2);
  },

  importDataJSON: (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profiles) storage.setProfiles(parsed.profiles);
      if (parsed.currentUserId !== undefined) storage.setCurrentUserId(parsed.currentUserId);
      if (parsed.subjects) storage.setSubjects(parsed.subjects);
      if (parsed.tasks) storage.setTasks(parsed.tasks);
      if (parsed.exams) storage.setExams(parsed.exams);
      if (parsed.schedule) storage.setSchedule(parsed.schedule);
      if (parsed.sessions) storage.setSessions(parsed.sessions);
      if (parsed.grades) storage.setGrades(parsed.grades);
      if (parsed.goals) storage.setGoals(parsed.goals);
      if (parsed.plans) storage.setPlans(parsed.plans);
      if (parsed.notifications) storage.setNotifications(parsed.notifications);
      if (parsed.customEvents) storage.setCustomEvents(parsed.customEvents);
      if (parsed.settings) storage.setSettings(parsed.settings);
      if (parsed.streakRecord) storage.setStreakRecord(parsed.streakRecord);
      return true;
    } catch {
      return false;
    }
  }
};