import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  AuthUser,
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
  CustomEvent,
  SyncStatus,
  TaskStatus
} from '../types';
import {
  storage,
  DEFAULT_PROFILES,
  DEFAULT_SUBJECTS,
  DEFAULT_TASKS,
  DEFAULT_EXAMS,
  DEFAULT_SCHEDULE,
  DEFAULT_GRADES,
  DEFAULT_GOALS,
  DEFAULT_SETTINGS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_CUSTOM_EVENTS,
  generateDefaultSessions
} from '../utils/storage';
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signInWithApple,
  logOutFirebase,
  onAuthChange
} from '../utils/firebase';
import {
  saveCloudData,
  migrateOrLoadUserData,
  CloudStudyData
} from '../utils/cloudSync';
import { soundManager } from '../utils/sound';
import { getTodayDateString } from '../utils/dateUtils';

interface AppContextType {
  // Auth & Cloud State
  authUser: AuthUser | null;
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  isAuthLoading: boolean;
  syncStatus: SyncStatus;
  isFirebaseReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;

  // Profiles
  login: (profileId: string) => void;
  createProfile: (data: { name: string; gradeLevel: string; avatarColor: string; startBlank?: boolean }) => void;
  updateProfile: (id: string, data: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  clearCurrentUserData: () => void;

  // Navigation & UI State
  activeView: string;
  setActiveView: (view: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Data
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  schedule: ScheduleItem[];
  sessions: FocusSession[];
  grades: GradeItem[];
  goals: Goal[];
  plans: StudyPlan[];
  notifications: NotificationItem[];
  customEvents: CustomEvent[];
  settings: Settings;
  streakRecord: number;

  // Actions - Subjects
  addSubject: (sub: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, sub: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Actions - Exams
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Actions - Schedule
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Actions - Focus & Sessions
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  deleteFocusSession: (id: string) => void;

  // Actions - Grades
  addGradeItem: (grade: Omit<GradeItem, 'id'>) => void;
  updateGradeItem: (id: string, grade: Partial<GradeItem>) => void;
  deleteGradeItem: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Actions - Study Planner
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => StudyPlan;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  togglePlanMilestone: (planId: string, milestoneId: string) => void;

  // Actions - Custom Events (Evento, Exposición, Recordatorio)
  addCustomEvent: (event: Omit<CustomEvent, 'id' | 'createdAt'>) => CustomEvent;
  updateCustomEvent: (id: string, data: Partial<CustomEvent>) => void;
  deleteCustomEvent: (id: string) => void;
  toggleCustomEventComplete: (id: string) => void;

  // Actions - Notifications & Settings
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetDemoData: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;

  // Calculated Metrics
  currentStreak: number;
  todayStudyMinutes: number;
  weeklyStudyMinutes: number;
  globalAverageGrade: number;
  pendingTasksCount: number;
  urgentTasksCount: number;
  upcomingExamsCount: number;
  getSubjectAverage: (subjectId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => storage.getAuthUser());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const isFirebaseReady = isFirebaseConfigured();

  // Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => storage.getProfiles());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => storage.getCurrentUserId());

  // UI Modals
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Core study data
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => storage.getSchedule());
  const [sessions, setSessions] = useState<FocusSession[]>(() => storage.getSessions());
  const [grades, setGrades] = useState<GradeItem[]>(() => storage.getGrades());
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals());
  const [plans, setPlans] = useState<StudyPlan[]>(() => storage.getPlans());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() => storage.getCustomEvents());
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [streakRecord, setStreakRecord] = useState<number>(() => storage.getStreakRecord());

  // Sync to Local Storage
  useEffect(() => { storage.setProfiles(profiles); }, [profiles]);
  useEffect(() => { storage.setCurrentUserId(currentUserId); }, [currentUserId]);
  useEffect(() => { storage.setAuthUser(authUser); }, [authUser]);
  useEffect(() => { storage.setSubjects(subjects); }, [subjects]);
  useEffect(() => { storage.setTasks(tasks); }, [tasks]);
  useEffect(() => { storage.setExams(exams); }, [exams]);
  useEffect(() => { storage.setSchedule(schedule); }, [schedule]);
  useEffect(() => { storage.setSessions(sessions); }, [sessions]);
  useEffect(() => { storage.setGrades(grades); }, [grades]);
  useEffect(() => { storage.setGoals(goals); }, [goals]);
  useEffect(() => { storage.setPlans(plans); }, [plans]);
  useEffect(() => { storage.setNotifications(notifications); }, [notifications]);
  useEffect(() => { storage.setCustomEvents(customEvents); }, [customEvents]);
  useEffect(() => { storage.setSettings(settings); }, [settings]);
  useEffect(() => { storage.setStreakRecord(streakRecord); }, [streakRecord]);

  // Handle active current user profile
  const currentUser: UserProfile | null = authUser
    ? {
        id: authUser.uid,
        name: authUser.displayName || authUser.email?.split('@')[0] || 'Estudiante',
        gradeLevel: settings.gradeLevel || '2º Bachillerato',
        avatarColor: '#6366F1',
        email: authUser.email || undefined,
        photoURL: authUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        isDemo: authUser.providerId === 'demo'
      }
    : profiles.find((p) => p.id === currentUserId) || null;

  // Cloud Sync Handler (Debounced)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncToCloud = useCallback(async (dataToSync: CloudStudyData) => {
    if (!authUser || authUser.providerId === 'demo' || !isFirebaseReady) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    const success = await saveCloudData(authUser.uid, dataToSync, authUser);
    setSyncStatus(success ? 'synced' : 'error');
  }, [authUser, isFirebaseReady]);

  // Trigger sync on state changes when logged in
  useEffect(() => {
    if (authUser && authUser.providerId !== 'demo' && isFirebaseReady) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToCloud({
          subjects,
          tasks,
          exams,
          schedule,
          sessions,
          grades,
          goals,
          plans,
          notifications,
          customEvents,
          settings,
          streakRecord
        });
      }, 1500);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    subjects,
    tasks,
    exams,
    schedule,
    sessions,
    grades,
    goals,
    plans,
    notifications,
    customEvents,
    settings,
    streakRecord,
    authUser,
    isFirebaseReady,
    syncToCloud
  ]);

  // Firebase Auth State Listener & First-time Migration
  useEffect(() => {
    if (!isFirebaseReady) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userMeta: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerId: firebaseUser.providerData[0]?.providerId || 'google.com'
        };
        setAuthUser(userMeta);
        setCurrentUserId(firebaseUser.uid);

        // Run Safe Migration Protocol
        const currentLocalData: CloudStudyData = {
          subjects,
          tasks,
          exams,
          schedule,
          sessions,
          grades,
          goals,
          plans,
          notifications,
          customEvents,
          settings,
          streakRecord
        };

        const { data } = await migrateOrLoadUserData(userMeta, currentLocalData);
        if (data) {
          if (data.subjects) setSubjects(data.subjects);
          if (data.tasks) setTasks(data.tasks);
          if (data.exams) setExams(data.exams);
          if (data.schedule) setSchedule(data.schedule);
          if (data.sessions) setSessions(data.sessions);
          if (data.grades) setGrades(data.grades);
          if (data.goals) setGoals(data.goals);
          if (data.plans) setPlans(data.plans);
          if (data.notifications) setNotifications(data.notifications);
          if (data.customEvents) setCustomEvents(data.customEvents);
          if (data.settings) setSettings(data.settings);
          if (data.streakRecord !== undefined) setStreakRecord(data.streakRecord);
        }
        setSyncStatus('synced');
      } else {
        // If not authenticated via Firebase, check if local demo user was active
        const storedAuth = storage.getAuthUser();
        if (!storedAuth || storedAuth.providerId !== 'demo') {
          setAuthUser(null);
        }
        setSyncStatus('offline');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  // Handle Theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- AUTH METHODS ---
  const loginWithGoogle = async () => {
    try {
      const fbUser = await signInWithGoogle();
      const userMeta: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        providerId: 'google.com'
      };
      setAuthUser(userMeta);
      setCurrentUserId(fbUser.uid);
      soundManager.playCompletionChime();
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('popup-closed-by-user')) return;
      throw err;
    }
  };

  const loginWithApple = async () => {
    try {
      const fbUser = await signInWithApple();
      const userMeta: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        providerId: 'apple.com'
      };
      setAuthUser(userMeta);
      setCurrentUserId(fbUser.uid);
      soundManager.playCompletionChime();
    } catch (err: unknown) {
      console.error('Apple sign-in error:', err);
      throw err;
    }
  };

  const loginAsDemo = () => {
    const demoUser: AuthUser = {
      uid: 'user-demo',
      email: 'estudiante@demo.studyflow.app',
      displayName: 'Álex (Demo)',
      photoURL: null,
      providerId: 'demo'
    };
    setAuthUser(demoUser);
    setCurrentUserId('user-demo');
    setSyncStatus('offline');
    soundManager.playCompletionChime();
  };

  const logout = async () => {
    if (isFirebaseReady) {
      await logOutFirebase();
    }
    setAuthUser(null);
    setCurrentUserId(null);
    storage.setCurrentUserId(null);
    storage.setAuthUser(null);
    setSyncStatus('offline');
  };

  const login = (profileId: string) => {
    const found = profiles.find((p) => p.id === profileId);
    if (found) {
      setCurrentUserId(found.id);
      setSettings((prev) => ({
        ...prev,
        studentName: found.name,
        gradeLevel: found.gradeLevel
      }));
    }
  };

  const createProfile = (data: {
    name: string;
    gradeLevel: string;
    avatarColor: string;
    startBlank?: boolean;
  }) => {
    const newId = `user-${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      name: data.name,
      gradeLevel: data.gradeLevel,
      avatarColor: data.avatarColor,
      createdAt: new Date().toISOString(),
      isDemo: false
    };

    setProfiles((prev) => [...prev, newProfile]);
    setCurrentUserId(newId);
    setSettings((prev) => ({
      ...prev,
      studentName: data.name,
      gradeLevel: data.gradeLevel
    }));

    if (data.startBlank) {
      setSubjects([]);
      setTasks([]);
      setExams([]);
      setSchedule([]);
      setSessions([]);
      setGrades([]);
      setGoals([]);
      setPlans([]);
      setNotifications([]);
      setCustomEvents([]);
      setStreakRecord(0);
      storage.clearCurrentProfileData();
    }
  };

  const updateProfile = (id: string, data: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    if (currentUser && currentUser.id === id) {
      setSettings((prev) => ({
        ...prev,
        studentName: data.name || prev.studentName,
        gradeLevel: data.gradeLevel || prev.gradeLevel
      }));
    }
  };

  const deleteProfile = (id: string) => {
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (currentUserId === id) {
      if (remaining.length > 0) {
        login(remaining[0].id);
      } else {
        setCurrentUserId(null);
      }
    }
  };

  const clearCurrentUserData = () => {
    setSubjects([]);
    setTasks([]);
    setExams([]);
    setSchedule([]);
    setSessions([]);
    setGrades([]);
    setGoals([]);
    setPlans([]);
    setNotifications([]);
    setCustomEvents([]);
    setStreakRecord(0);
    storage.clearCurrentProfileData();
  };

  // --- CALCULATED METRICS ---
  const todayStr = getTodayDateString();

  const todayStudyMinutes = sessions
    .filter((s) => s.date.startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyStudyMinutes = sessions
    .filter((s) => new Date(s.date) >= sevenDaysAgo)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const calculateStreak = () => {
    const uniqueDates = Array.from(
      new Set(
        sessions
          .filter((s) => s.completed && s.durationMinutes > 0)
          .map((s) => s.date.split('T')[0])
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();
    const todayFormatted = checkDate.toISOString().split('T')[0];

    let hasToday = uniqueDates.includes(todayFormatted);
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const targetStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(targetStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = currentUser?.isDemo ? Math.max(calculateStreak(), 7) : calculateStreak();

  const getSubjectAverage = (subjectId: string): number => {
    const subGrades = grades.filter((g) => g.subjectId === subjectId);
    if (subGrades.length === 0) {
      const sub = subjects.find((s) => s.id === subjectId);
      return sub?.currentAverage || 0;
    }
    const totalWeight = subGrades.reduce((acc, g) => acc + g.weightPercentage, 0);
    if (totalWeight === 0) {
      const sum = subGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 10, 0);
      return Number((sum / subGrades.length).toFixed(2));
    }
    const weightedSum = subGrades.reduce(
      (acc, g) => acc + ((g.score / g.maxScore) * 10 * g.weightPercentage),
      0
    );
    return Number((weightedSum / totalWeight).toFixed(2));
  };

  const globalAverageGrade = (() => {
    if (subjects.length === 0) return 0;
    const averages = subjects.map((s) => getSubjectAverage(s.id));
    const total = averages.reduce((acc, curr) => acc + curr, 0);
    return Number((total / subjects.length).toFixed(2));
  })();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completada').length;
  const urgentTasksCount = tasks.filter(
    (t) => t.status !== 'completada' && (t.priority === 'urgente' || t.priority === 'alta')
  ).length;

  const upcomingExamsCount = exams.filter((e) => {
    const examDate = new Date(e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examDate >= today;
  }).length;

  // --- ACTIONS ---
  const addSubject = (sub: Omit<Subject, 'id'>): Subject => {
    const newSubject: Subject = {
      ...sub,
      id: `sub-${Date.now()}`
    };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  const updateSubject = (id: string, sub: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...sub } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
    setExams((prev) => prev.filter((e) => e.subjectId !== id));
    setGrades((prev) => prev.filter((g) => g.subjectId !== id));
    setSchedule((prev) => prev.filter((sc) => sc.subjectId !== id));
    setCustomEvents((prev) => prev.filter((ev) => ev.subjectId !== id));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleted = t.status === 'completada';
          const newStatus: TaskStatus = isCompleted ? 'pendiente' : 'completada';
          if (!isCompleted) {
            confetti({
              particleCount: 55,
              spread: 60,
              origin: { y: 0.75 },
              colors: ['#6366F1', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']
            });
            soundManager.playCompletionChime();
          } else {
            soundManager.playClick();
          }
          return {
            ...t,
            status: newStatus,
            completedAt: !isCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  const addExam = (exam: Omit<Exam, 'id'>): Exam => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`
    };
    setExams((prev) => [...prev, newExam]);
    return newExam;
  };

  const updateExam = (id: string, examData: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...examData } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`
    };
    setSchedule((prev) => [...prev, newItem]);
  };

  const updateScheduleItem = (id: string, itemData: Partial<ScheduleItem>) => {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, ...itemData } : s)));
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const addFocusSession = (session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: `sess-${Date.now()}`
    };
    setSessions((prev) => [newSession, ...prev]);

    setGoals((prev) =>
      prev.map((g) => {
        if (g.type === 'daily_time') {
          const updated = g.currentValue + session.durationMinutes;
          return {
            ...g,
            currentValue: updated,
            completed: updated >= g.targetValue
          };
        }
        return g;
      })
    );

    const streak = currentStreak + 1;
    if (streak > streakRecord) {
      setStreakRecord(streak);
    }
  };

  const deleteFocusSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const addGradeItem = (grade: Omit<GradeItem, 'id'>) => {
    const newGrade: GradeItem = {
      ...grade,
      id: `gr-${Date.now()}`
    };
    setGrades((prev) => [...prev, newGrade]);
  };

  const updateGradeItem = (id: string, gradeData: Partial<GradeItem>) => {
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...gradeData } : g)));
  };

  const deleteGradeItem = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, goalData: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goalData } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((s) => s.id !== id));
  };

  const addStudyPlan = (plan: Omit<StudyPlan, 'id' | 'createdAt'>): StudyPlan => {
    const newPlan: StudyPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updateStudyPlan = (id: string, planData: Partial<StudyPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...planData } : p)));
  };

  const deleteStudyPlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlanMilestone = (planId: string, milestoneId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const updatedMilestones = plan.milestones.map((m) => {
            if (m.id === milestoneId) {
              const nextState = !m.completed;
              if (nextState) soundManager.playCompletionChime();
              return { ...m, completed: nextState };
            }
            return m;
          });
          return { ...plan, milestones: updatedMilestones };
        }
        return plan;
      })
    );
  };

  // --- ACTIONS - CUSTOM EVENTS (Evento, Exposición, Recordatorio) ---
  const addCustomEvent = (event: Omit<CustomEvent, 'id' | 'createdAt'>): CustomEvent => {
    const newEvent: CustomEvent = {
      ...event,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateCustomEvent = (id: string, data: Partial<CustomEvent>) => {
    setCustomEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...data } : ev)));
  };

  const deleteCustomEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const toggleCustomEventComplete = (id: string) => {
    setCustomEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const next = !ev.completed;
          if (next) soundManager.playCompletionChime();
          return { ...ev, completed: next };
        }
        return ev;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    storage.resetAllToDemo();
    setProfiles(DEFAULT_PROFILES);
    setCurrentUserId('user-demo');
    setSubjects(DEFAULT_SUBJECTS);
    setTasks(DEFAULT_TASKS);
    setExams(DEFAULT_EXAMS);
    setSchedule(DEFAULT_SCHEDULE);
    setSessions(generateDefaultSessions());
    setGrades(DEFAULT_GRADES);
    setGoals(DEFAULT_GOALS);
    setPlans([]);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setCustomEvents(DEFAULT_CUSTOM_EVENTS);
    setSettings(DEFAULT_SETTINGS);
    setStreakRecord(12);
  };

  const exportData = () => storage.exportAllDataJSON();

  const importData = (jsonStr: string) => {
    const ok = storage.importDataJSON(jsonStr);
    if (ok) {
      setProfiles(storage.getProfiles());
      setCurrentUserId(storage.getCurrentUserId());
      setAuthUser(storage.getAuthUser());
      setSubjects(storage.getSubjects());
      setTasks(storage.getTasks());
      setExams(storage.getExams());
      setSchedule(storage.getSchedule());
      setSessions(storage.getSessions());
      setGrades(storage.getGrades());
      setGoals(storage.getGoals());
      setPlans(storage.getPlans());
      setNotifications(storage.getNotifications());
      setCustomEvents(storage.getCustomEvents());
      setSettings(storage.getSettings());
      setStreakRecord(storage.getStreakRecord());
    }
    return ok;
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        currentUser,
        profiles,
        isAuthLoading,
        syncStatus,
        isFirebaseReady,
        loginWithGoogle,
        loginWithApple,
        loginAsDemo,
        logout,

        login,
        createProfile,
        updateProfile,
        deleteProfile,
        clearCurrentUserData,

        activeView,
        setActiveView,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,

        subjects,
        tasks,
        exams,
        schedule,
        sessions,
        grades,
        goals,
        plans,
        notifications,
        customEvents,
        settings,
        streakRecord,

        addSubject,
        updateSubject,
        deleteSubject,

        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,

        addExam,
        updateExam,
        deleteExam,

        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,

        addFocusSession,
        deleteFocusSession,

        addGradeItem,
        updateGradeItem,
        deleteGradeItem,

        addGoal,
        updateGoal,
        deleteGoal,

        addStudyPlan,
        updateStudyPlan,
        deleteStudyPlan,
        togglePlanMilestone,

        addCustomEvent,
        updateCustomEvent,
        deleteCustomEvent,
        toggleCustomEventComplete,

        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        updateSettings,
        resetDemoData,
        exportData,
        importData,

        currentStreak,
        todayStudyMinutes,
        weeklyStudyMinutes,
        globalAverageGrade,
        pendingTasksCount,
        urgentTasksCount,
        upcomingExamsCount,
        getSubjectAverage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};