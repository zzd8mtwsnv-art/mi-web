import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassBadge } from '../ui/GlassBadge';
import { formatMinutes } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  Square,
  FileText,
  Mic,
  Bell,
  Trash2,
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  onAddEvent: (dateStr: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  onAddEvent
}) => {
  const {
    subjects,
    tasks,
    exams,
    sessions,
    customEvents,
    toggleTaskComplete,
    deleteTask,
    deleteExam,
    deleteCustomEvent,
    deleteFocusSession
  } = useApp();

  if (!dateStr) return null;

  // Filter items for this date
  const dayExams = exams.filter((e) => e.date === dateStr);
  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const daySessions = sessions.filter((s) => s.date.startsWith(dateStr));
  const dayCustomEvents = customEvents.filter((ev) => ev.date === dateStr);

  const totalStudyMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Group study minutes by subject
  const studyBySubject: Record<string, number> = {};
  daySessions.forEach((s) => {
    const key = s.subjectId || 'general';
    studyBySubject[key] = (studyBySubject[key] || 0) + s.durationMinutes;
  });

  // Format date in Spanish
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const fullDateFormatted = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = fullDateFormatted.charAt(0).toUpperCase() + fullDateFormatted.slice(1);

  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const hasAnyContent =
    dayExams.length > 0 ||
    dayTasks.length > 0 ||
    daySessions.length > 0 ||
    dayCustomEvents.length > 0;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={capitalizedDate}
      subtitle={isToday ? 'Plan y actividad de hoy' : 'Detalle completo del día'}
      maxWidth="lg"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Action button header */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-500/20">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                {isToday ? '🌟 Día actual' : 'Fecha seleccionada'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {dateStr}
              </span>
            </div>
          </div>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onAddEvent(dateStr);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            + Añadir a este día
          </GlassButton>
        </div>

        {/* Empty state */}
        {!hasAnyContent && (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No hay actividades programadas
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Este día está libre. Puedes programar un examen, tarea, recordatorio o registrar estudio.
            </p>
            <div className="mt-4">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onAddEvent(dateStr);
                }}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Crear Evento o Tarea
              </GlassButton>
            </div>
          </div>
        )}

        {/* 1. SECCIÓN DE ESTUDIO AGRUPADO */}
        {daySessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Tiempo de Estudio ({formatMinutes(totalStudyMinutes)})
              </h4>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Total: {totalStudyMinutes} min
              </span>
            </div>

            {/* Desglose por Asignatura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(studyBySubject).map(([subId, mins]) => {
                const sub = subjects.find((s) => s.id === subId);
                return (
                  <div
                    key={subId}
                    className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || '#10B981' }}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sub?.name || 'Estudio General'}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                      {mins} min
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Lista de sesiones individuales */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Sesiones registradas ({daySessions.length}):
              </span>
              {daySessions.map((sess) => {
                const sub = subjects.find((s) => s.id === sess.subjectId);
                return (
                  <div
                    key={sess.id}
                    className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || '#10B981' }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {sess.notes || sub?.name || 'Sesión de estudio'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({sess.type === 'pomodoro' ? 'Pomodoro' : 'Normal'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {sess.durationMinutes} min
                      </span>
                      <button
                        onClick={() => deleteFocusSession(sess.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. EXÁMENES */}
        {dayExams.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Exámenes ({dayExams.length})
            </h4>
            <div className="space-y-2">
              {dayExams.map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {exam.title}
                        </span>
                        {sub && (
                          <GlassBadge size="sm" color={sub.color}>
                            {sub.name}
                          </GlassBadge>
                        )}
                        {exam.time && (
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md">
                            {exam.time}
                          </span>
                        )}
                      </div>
                      {exam.topics && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Temario: {exam.topics}
                        </p>
                      )}
                      {exam.classroom && (
                        <p className="text-[11px] text-slate-400">
                          Aula: {exam.classroom}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      title="Eliminar examen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TAREAS */}
        {dayTasks.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Tareas ({dayTasks.length})
            </h4>
            <div className="space-y-2">
              {dayTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                const isDone = task.status === 'completada';
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-white/5 opacity-70'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/10 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="truncate">
                        <span
                          className={`text-sm font-semibold block truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {sub && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: sub.color }}
                            >
                              {sub.shortName || sub.name}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="text-[10px] text-slate-400">
                              Hora: {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. EVENTOS PERSONALIZADOS (Exposiciones, Recordatorios, Eventos) */}
        {dayCustomEvents.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Eventos & Recordatorios ({dayCustomEvents.length})
            </h4>
            <div className="space-y-2">
              {dayCustomEvents.map((ev) => {
                const sub = subjects.find((s) => s.id === ev.subjectId);
                const typeColor =
                  ev.type === 'evento'
                    ? 'bg-purple-500 text-purple-500'
                    : ev.type === 'exposicion'
                    ? 'bg-amber-500 text-amber-500'
                    : 'bg-cyan-500 text-cyan-500';

                const Icon =
                  ev.type === 'evento' ? CalendarIcon : ev.type === 'exposicion' ? Mic : Bell;

                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl text-white ${typeColor.split(' ')[0]} shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {ev.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase ${typeColor.split(' ')[0]}`}>
                            {ev.type}
                          </span>
                          {ev.time && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {ev.time}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {ev.description}
                          </p>
                        )}
                        {sub && (
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Materia: {sub.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCustomEvent(ev.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      title="Eliminar evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
};
