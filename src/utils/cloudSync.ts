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
  lastSync?: string;
}

/**
 * Reads user data from Firestore `users/{userId}/data/main`
 */
export const fetchCloudData = async (userId: string): Promise<CloudStudyData | null> => {
  if (!db || !isFirebaseConfigured()) {
    console.warn('[StudyFlow CloudSync] Firebase no configurado, omitiendo fetch.');
    return null;
  }
  try {
    console.log(`[StudyFlow CloudSync] 🔍 Leyendo Firestore para UID: ${userId}...`);
    const docRef = doc(db, 'users', userId, 'data', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CloudStudyData;
      console.log(`[StudyFlow CloudSync] 📥 Datos recuperados con éxito de Firestore:`, {
        asignaturas: data.subjects?.length ?? 0,
        tareas: data.tasks?.length ?? 0,
        examenes: data.exams?.length ?? 0,
        horario: data.schedule?.length ?? 0,
        eventos: data.customEvents?.length ?? 0,
        notas: data.grades?.length ?? 0,
        objetivos: data.goals?.length ?? 0,
        planes: data.plans?.length ?? 0,
        sesiones: data.sessions?.length ?? 0
      });
      return data;
    }
    console.log(`[StudyFlow CloudSync] ℹ️ Documento users/${userId}/data/main no existe todavía en Firestore.`);
    return null;
  } catch (error) {
    console.error('[StudyFlow CloudSync] ❌ Error al recuperar datos de Firestore:', error);
    return null;
  }
};

/**
 * Recursively removes all `undefined` fields from objects and arrays.
 * Preserves `false`, `0`, `""`, `null`, `Date`, and special objects.
 * Accurately tracks removed undefined properties for logging.
 */
export function removeUndefinedDeep<T>(value: T, stats = { removedCount: 0 }): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    const cleanedArray: any[] = [];
    for (const item of value) {
      if (item === undefined) {
        stats.removedCount++;
      } else {
        cleanedArray.push(removeUndefinedDeep(item, stats));
      }
    }
    return cleanedArray as unknown as T;
  }

  if (typeof value === 'object') {
    // Check if it is a plain object or custom prototype (e.g. Firebase Timestamp / FieldValue)
    const proto = Object.getPrototypeOf(value);
    if (proto !== null && proto !== Object.prototype) {
      return value;
    }

    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      if (val === undefined) {
        stats.removedCount++;
      } else {
        const cleanedVal = removeUndefinedDeep(val, stats);
        if (cleanedVal === undefined) {
          stats.removedCount++;
        } else {
          cleaned[key] = cleanedVal;
        }
      }
    }
    return cleaned as T;
  }

  return value;
}

/**
 * Saves study data to Firestore `users/{userId}/data/main`
 */
export const saveCloudData = async (
  userId: string,
  data: CloudStudyData,
  userMeta?: AuthUser
): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) {
    console.warn('[StudyFlow CloudSync] Firebase no configurado, no se puede guardar en la nube.');
    return false;
  }
  try {
    console.log(`[StudyFlow CloudSync] 🚀 Enviando escritura a Firestore para UID [${userId}]:`, {
      asignaturas: data.subjects?.length ?? 0,
      tareas: data.tasks?.length ?? 0,
      examenes: data.exams?.length ?? 0,
      horario: data.schedule?.length ?? 0,
      eventos: data.customEvents?.length ?? 0,
      notas: data.grades?.length ?? 0,
      objetivos: data.goals?.length ?? 0,
      timestamp: new Date().toISOString()
    });

    // 1. Update user metadata document
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        uid: userId,
        email: userMeta?.email ?? null,
        displayName: userMeta?.displayName ?? null,
        photoURL: userMeta?.photoURL ?? null,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // 2. Prepare and sanitize payload for users/{userId}/data/main
    const rawPayload = {
      subjects: data.subjects ?? [],
      tasks: data.tasks ?? [],
      exams: data.exams ?? [],
      schedule: data.schedule ?? [],
      sessions: data.sessions ?? [],
      grades: data.grades ?? [],
      goals: data.goals ?? [],
      plans: data.plans ?? [],
      notifications: data.notifications ?? [],
      customEvents: data.customEvents ?? [],
      settings: data.settings,
      streakRecord: data.streakRecord ?? 0,
      lastSync: new Date().toISOString()
    };

    const stats = { removedCount: 0 };
    const sanitizedPayload = removeUndefinedDeep(rawPayload, stats);

    if (stats.removedCount > 0) {
      console.warn(`[StudyFlow CloudSync] 🧹 removeUndefinedDeep eliminó ${stats.removedCount} propiedad(es) con valor 'undefined' antes de guardar en Firestore.`);
    } else {
      console.log(`[StudyFlow CloudSync] ✨ removeUndefinedDeep: payload 100% limpio (0 valores undefined detectados).`);
    }

    const dataRef = doc(db, 'users', userId, 'data', 'main');
    await setDoc(dataRef, sanitizedPayload);

    console.log(`[StudyFlow CloudSync] ✅ Firestore confirmó la escritura exitosa para UID: ${userId}`);
    return true;
  } catch (error) {
    console.error('[StudyFlow CloudSync] ❌ Error escribiendo en Firestore:', error);
    return false;
  }
};

/**
 * Safe First-time Data Migration Protocol:
 * - If Firestore document exists: ALWAYS return cloud data. CLOUD HAS ABSOLUTE PRIORITY.
 * - If Firestore is totally empty: create the initial cloud document from local data safely.
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

    // IF CLOUD DOCUMENT EXISTS (regardless of subjects count), FIRESTORE IS THE SOLE TRUTH
    if (existingCloudData !== null) {
      console.log('[StudyFlow CloudSync] 🎯 Firestore tiene prioridad absoluta. Cargando datos existentes de la nube.');
      return { data: existingCloudData, isMigrated: false, fromCloud: true };
    }

    // Cloud document does NOT exist yet (First time user registers with this account)
    console.log('[StudyFlow CloudSync] 🆕 Primer inicio de sesión detectado para esta cuenta. Creando documento inicial en Firestore...');

    // Save a local safety snapshot before migration
    try {
      localStorage.setItem(
        'studyflow_backup_pre_migration',
        JSON.stringify({ ...localData, backupDate: new Date().toISOString() })
      );
    } catch {}

    // Upload initial data to the new cloud account
    await saveCloudData(user.uid, localData, user);
    return { data: localData, isMigrated: true, fromCloud: false };
  } catch (err) {
    console.error('[StudyFlow CloudSync] ❌ Error en protocolo de migración:', err);
    return { data: localData, isMigrated: false, fromCloud: false };
  }
};