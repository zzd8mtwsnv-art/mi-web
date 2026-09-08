import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
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
  CustomEvent,
  AuthUser
} from '../types';

export interface CloudStudyData {
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
}

/**
 * Reads user data from Firestore `users/{userId}/data/main`
 */
export const fetchCloudData = async (userId: string): Promise<CloudStudyData | null> => {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const docRef = doc(db, 'users', userId, 'data', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CloudStudyData;
    }
    return null;
  } catch (error) {
    console.warn('Error al recuperar datos de Firestore:', error);
    return null;
  }
};

/**
 * Saves study data to Firestore `users/{userId}/data/main`
 */
export const saveCloudData = async (
  userId: string,
  data: CloudStudyData,
  userMeta?: AuthUser
): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) return false;
  try {
    // 1. Update user document
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        uid: userId,
        email: userMeta?.email || null,
        displayName: userMeta?.displayName || null,
        photoURL: userMeta?.photoURL || null,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // 2. Update main study data document
    const dataRef = doc(db, 'users', userId, 'data', 'main');
    await setDoc(dataRef, {
      ...data,
      lastSync: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.warn('Error al guardar datos en Firestore:', error);
    return false;
  }
};

/**
 * Safe First-time Data Migration Protocol:
 * If the user signs in and their cloud account is empty,
 * it safely copies their current local data to their Firebase cloud document.
 * It NEVER deletes local data before verifying.
 */
export const migrateOrLoadUserData = async (
  user: AuthUser,
  localData: CloudStudyData
): Promise<{ data: CloudStudyData; isMigrated: boolean; fromCloud: boolean }> => {
  if (!db || !isFirebaseConfigured()) {
    return { data: localData, isMigrated: false, fromCloud: false };
  }

  try {
    const existingCloudData = await fetchCloudData(user.uid);

    if (existingCloudData && existingCloudData.subjects && existingCloudData.subjects.length > 0) {
      // User already had cloud data (e.g. logging in from another device)
      return { data: existingCloudData, isMigrated: false, fromCloud: true };
    }

    // Cloud is empty for this user -> Check if local data has content to migrate
    const hasLocalContent = (localData.subjects && localData.subjects.length > 0) ||
                            (localData.tasks && localData.tasks.length > 0);

    if (hasLocalContent) {
      // Save a local safety snapshot before migration
      try {
        localStorage.setItem(
          'studyflow_backup_pre_migration',
          JSON.stringify({ ...localData, backupDate: new Date().toISOString() })
        );
      } catch {}

      // Upload local data to the new cloud account
      await saveCloudData(user.uid, localData, user);
      return { data: localData, isMigrated: true, fromCloud: false };
    }

    return { data: localData, isMigrated: false, fromCloud: false };
  } catch (err) {
    console.warn('Error en protocolo de migración:', err);
    return { data: localData, isMigrated: false, fromCloud: false };
  }
};