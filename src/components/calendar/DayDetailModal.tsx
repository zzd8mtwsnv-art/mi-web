import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassBadge } from '../ui/GlassBadge';
import { formatMinutes } from '../../utils/dateUtils';
import { ItemDetailModal, DetailItemType } from '../common/ItemDetailModal';
import { TaskModal } from '../tasks/TaskModal';
import { ExamModal } from '../exams/ExamModal';
import { EventModal } from './EventModal';
import { ManualSessionModal } from '../focus/ManualSessionModal';
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
  Sparkles,
  Edit2
} from 'lucide-react';
import { Task, Exam, CustomEvent, FocusSession } from '../../types';

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
    deleteFocusSession,
    updateTask,
    updateExam
  } = useApp();

  // Item Detail Modal state
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<DetailItemType | null>(null);

  // Edit Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingCustomEvent, setEditingCustomEvent] = useState<CustomEvent | null>(null);
  const [editingSession, setEditingSession] = useState<FocusSession | null>(null);

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

  // Categorize into Timed vs Untimed items
  interface NormalizedDayItem {
    id: string;
    type: DetailItemType;
    rawItem: Task | Exam | CustomEvent;
    title: string;
    time?: string;
    subjectId?: string;
    description?: string;
    icon: any;
    colorClass: string;
    badgeLabel: string;
    isCompleted?: boolean;
  }

  const allItems: NormalizedDayItem[] = [
    ...dayExams.map((e) => ({
      id: e.id,
      type: 'exam' as DetailItemType,
      rawItem: e,
      title: e.title,
      time: e.time,
      subjectId: e.subjectId,
      description: e.notes || e.topics,
      icon: FileText,
      colorClass: 'bg-rose-500',
      badgeLabel: 'Examen'
    })),
    ...dayTasks.map((t) => ({
      id: t.id,
      type: 'task' as DetailItemType,
      rawItem: t,
      title: t.title,
      time: t.dueTime,
      subjectId: t.subjectId,
      description: t.description,
      icon: CheckSquare,
      colorClass: 'bg-indigo-600',
      badgeLabel: 'Tarea',
      isCompleted: t.status === 'completada'
    })),
    ...dayCustomEvents.map((ev) => ({
      id: ev.id,
      type: 'customEvent' as DetailItemType,
      rawItem: ev,
      title: ev.title,
      time: ev.time,
      subjectId: ev.subjectId,
      description: ev.description,
      icon: ev.type === 'evento' ? CalendarIcon : ev.type === 'exposicion' ? Mic : Bell,
      colorClass: ev.type === 'evento' ? 'bg-purple-600' : ev.type === 'exposicion' ? 'bg-amber-500' : 'bg-cyan-500',
      badgeLabel: ev.type === 'evento' ? 'Evento' : ev.type === 'exposicion' ? 'Exposición' : 'Recordatorio'
    }))
  ];

  // Partition into Timed and Untimed
  const timedItems = allItems
    .filter((i) => Boolean(i.time))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const untimedItems = allItems.filter((i) => !i.time);

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
  const hasAnyContent = allItems.length > 0 || daySessions.length > 0;

  const handleOpenItemDetail = (item: any, type: DetailItemType) => {
    setSelectedDetailItem(item);
    setSelectedDetailType(type);
  };

  const handleEditFromDetail = (item: any, type: DetailItemType) => {
    if (type === 'task') setEditingTask(item);
    else if (type === 'exam') setEditingExam(item);
    else if (type === 'customEvent') setEditingCustomEvent(item);
    else if (type === 'session') setEditingSession(item);
  };

  return (
    <>
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

          {/* 1. ELEMENTOS CON HORA (ORDENADOS CRONOLÓGICAMENTE) */}
          {timedItems.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Agenda con Hora ({timedItems.length})
              </h4>
              <div className="space-y-2">
                {timedItems.map((item) => {
                  const sub = subjects.find((s) => s.id === item.subjectId);
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenItemDetail(item.rawItem, item.type)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer hover:border-indigo-400 flex items-center justify-between gap-3 shadow-sm ${
                        item.isCompleted
                          ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-white/5 opacity-70'
                          : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        {/* Time pill */}
                        <span className="px-2 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 shrink-0 font-mono">
                          {item.time}
                        </span>

                        <div className={`p-2 rounded-xl text-white ${item.colorClass} shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold truncate ${
                                item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold text-white uppercase ${item.colorClass}`}>
                              {item.badgeLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {sub && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                style={{ backgroundColor: sub.color }}
                              >
                                {sub.shortName || sub.name}
                              </span>
                            )}
                            {item.description && (
                              <span className="text-xs text-slate-400 truncate max-w-xs">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.type === 'task' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(item.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500"
                            title="Completar"
                          >
                            {item.isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <span className="text-xs text-indigo-500 font-semibold hover:underline px-2 py-1">
                          Ver ficha
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. ELEMENTOS SIN HORA */}
          {untimedItems.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> Todo el día / Sin hora asignada ({untimedItems.length})
              </h4>
              <div className="space-y-2">
                {untimedItems.map((item) => {
                  const sub = subjects.find((s) => s.id === item.subjectId);
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenItemDetail(item.rawItem, item.type)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer hover:border-indigo-400 flex items-center justify-between gap-3 shadow-sm ${
                        item.isCompleted
                          ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-white/5 opacity-70'
                          : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-2 rounded-xl text-white ${item.colorClass} shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold truncate ${
                                item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold text-white uppercase ${item.colorClass}`}>
                              {item.badgeLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {sub && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                style={{ backgroundColor: sub.color }}
                              >
                                {sub.shortName || sub.name}
                              </span>
                            )}
                            {item.description && (
                              <span className="text-xs text-slate-400 truncate max-w-xs">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.type === 'task' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(item.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500"
                            title="Completar"
                          >
                            {item.isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <span className="text-xs text-indigo-500 font-semibold hover:underline px-2 py-1">
                          Ver ficha
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SECCIÓN DE ESTUDIO AGRUPADO */}
          {daySessions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-white/10">
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
                      onClick={() => handleOpenItemDetail(sess, 'session')}
                      className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-emerald-400 transition-all"
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
                        <span className="text-xs text-indigo-500 font-semibold hover:underline">
                          Ver ficha
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </GlassModal>

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => {
          setSelectedDetailItem(null);
          setSelectedDetailType(null);
        }}
        item={selectedDetailItem}
        itemType={selectedDetailType}
        onEdit={handleEditFromDetail}
      />

      {/* Edit Modals */}
      {editingTask && (
        <TaskModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          initialData={editingTask}
          onSubmit={(data) => {
            updateTask(editingTask.id, data);
            setEditingTask(null);
          }}
        />
      )}

      {editingExam && (
        <ExamModal
          isOpen={Boolean(editingExam)}
          onClose={() => setEditingExam(null)}
          initialData={editingExam}
          onSubmit={(data) => {
            updateExam(editingExam.id, data);
            setEditingExam(null);
          }}
        />
      )}

      {editingCustomEvent && (
        <EventModal
          isOpen={Boolean(editingCustomEvent)}
          onClose={() => setEditingCustomEvent(null)}
          initialCustomEvent={editingCustomEvent}
        />
      )}

      {editingSession && (
        <ManualSessionModal
          isOpen={Boolean(editingSession)}
          onClose={() => setEditingSession(null)}
          initialData={editingSession}
        />
      )}
    </>
  );
};
