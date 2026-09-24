import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { EventModal } from './EventModal';
import { DayDetailModal } from './DayDetailModal';
import { SPANISH_MONTHS, formatMinutes } from '../../utils/dateUtils';
import { StudyPlan, PlannedStudySession } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
  Clock,
  Mic,
  Bell,
  Trash2,
  Sparkles,
  CalendarRange
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, exams, schedule, sessions, customEvents, plans, subjects, deleteCustomEvent, toggleCustomEventComplete } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>('');
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateForDetail(dateStr);
    setIsDetailModalOpen(true);
  };

  const handleOpenAddEventForDate = (dateStr: string) => {
    setSelectedDateForNewEvent(dateStr);
    setIsEventModalOpen(true);
  };

  // Build Month Days Grid
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr });
  }

  // Normalizer for backward compatibility with plans
  const getPlanSessions = (plan: StudyPlan): PlannedStudySession[] => {
    if (plan.sessions && Array.isArray(plan.sessions)) {
      return plan.sessions;
    }
    if (plan.milestones && Array.isArray(plan.milestones)) {
      const ms = plan.milestones;
      return ms.map((m, idx) => ({
        id: m.id || `legacy-${plan.id}-${idx}`,
        planId: plan.id,
        date: m.date || plan.startDate || new Date().toISOString().split('T')[0],
        dayPart: 'tarde',
        subjectId: plan.subjectId,
        durationMinutes: m.durationMinutes || 60,
        title: m.title || `Sesión ${idx + 1}`,
        content: m.topics || m.title || '',
        completed: m.completed ?? false
      }));
    }
    return [];
  };

  // Get and structure items for a given date (with visual aggregation for study)
  const getDayItems = (dateStr: string) => {
    const dayExams = exams.filter((e) => e.date === dateStr);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const daySessions = sessions.filter((s) => s.date.startsWith(dateStr));
    const dayCustomEvents = customEvents.filter((ev) => ev.date === dateStr);

    // Extract planned sessions for this date across all plans
    const dayPlannedSessions: PlannedStudySession[] = [];
    plans.forEach((p) => {
      const pSessions = getPlanSessions(p);
      pSessions.forEach((ps) => {
        if (ps.date === dateStr) {
          dayPlannedSessions.push(ps);
        }
      });
    });

    const totalStudyMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const allVisualItems: Array<{
      id: string;
      type: 'exam' | 'exposicion' | 'evento' | 'recordatorio' | 'task' | 'study' | 'planned';
      title: string;
      icon: any;
      className: string;
    }> = [];

    // 1. Exams
    dayExams.forEach((e) => {
      allVisualItems.push({
        id: `exam-${e.id}`,
        type: 'exam',
        title: e.title,
        icon: FileText,
        className: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold'
      });
    });

    // 2. Exposiciones
    dayCustomEvents
      .filter((ev) => ev.type === 'exposicion')
      .forEach((ev) => {
        allVisualItems.push({
          id: `expo-${ev.id}`,
          type: 'exposicion',
          title: ev.title,
          icon: Mic,
          className: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
        });
      });

    // 3. Eventos
    dayCustomEvents
      .filter((ev) => ev.type === 'evento')
      .forEach((ev) => {
        allVisualItems.push({
          id: `event-${ev.id}`,
          type: 'evento',
          title: ev.title,
          icon: CalendarIcon,
          className: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold'
        });
      });

    // 4. Recordatorios
    dayCustomEvents
      .filter((ev) => ev.type === 'recordatorio')
      .forEach((ev) => {
        allVisualItems.push({
          id: `rec-${ev.id}`,
          type: 'recordatorio',
          title: ev.title,
          icon: Bell,
          className: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-semibold'
        });
      });

    // 5. Tasks
    dayTasks.forEach((t) => {
      const isDone = t.status === 'completada';
      allVisualItems.push({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        icon: CheckSquare,
        className: isDone
          ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 line-through'
          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold'
      });
    });

    // 6. Planned Study Sessions (Cronograma)
    dayPlannedSessions.forEach((ps) => {
      const sub = subjects.find((s) => s.id === ps.subjectId);
      allVisualItems.push({
        id: `planned-${ps.id}`,
        type: 'planned',
        title: `🗓️ ${sub ? `[${sub.shortName || sub.name}] ` : ''}${ps.title} (${ps.durationMinutes}m)`,
        icon: CalendarRange,
        className: ps.completed
          ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400 line-through opacity-75'
          : 'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400 font-semibold'
      });
    });

    // 7. Aggregated Study (ONE item for all real sessions of this day)
    if (totalStudyMinutes > 0) {
      allVisualItems.push({
        id: `study-total-${dateStr}`,
        type: 'study',
        title: `📚 Estudio · ${totalStudyMinutes} min`,
        icon: Clock,
        className: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
      });
    }

    return {
      allVisualItems,
      totalCount: allVisualItems.length,
      visibleItems: allVisualItems.slice(0, 3),
      extraCount: Math.max(0, allVisualItems.length - 3)
    };
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Vista integral de exámenes, tareas, eventos, exposiciones, recordatorios y estudio planificado
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-white/10">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddEventForDate(todayStr)}
            icon={<Plus className="w-4 h-4" />}
          >
            Nuevo Evento
          </GlassButton>
        </div>
      </div>

      {/* Month Navigation Row & Categories Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-200/50 dark:border-indigo-500/20"
          >
            Hoy
          </button>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white ml-2">
            {SPANISH_MONTHS[month]} {year}
          </h2>
        </div>

        {/* Categories Legend (7 types) */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-500">Examen</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-slate-500">Tarea</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-slate-500">Planificado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Estudio Realizado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-500">Evento</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-500">Exposición</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-slate-500">Recordatorio</span>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <GlassCard padding="none" className="overflow-hidden shadow-xl">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200/60 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/50 text-center py-2.5 text-xs font-bold text-slate-500">
            <span className="hidden sm:inline">Lun</span>
            <span className="sm:hidden">L</span>
            <span className="hidden sm:inline">Mar</span>
            <span className="sm:hidden">M</span>
            <span className="hidden sm:inline">Mié</span>
            <span className="sm:hidden">X</span>
            <span className="hidden sm:inline">Jue</span>
            <span className="sm:hidden">J</span>
            <span className="hidden sm:inline">Vie</span>
            <span className="sm:hidden">V</span>
            <span className="text-rose-500/80 hidden sm:inline">Sáb</span>
            <span className="text-rose-500/80 sm:hidden">S</span>
            <span className="text-rose-500/80 hidden sm:inline">Dom</span>
            <span className="text-rose-500/80 sm:hidden">D</span>
          </div>

          {/* Grid Cells (Uniform Height & Clean Layout) */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/40 dark:divide-white/5">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[100px] sm:min-h-[120px] bg-slate-100/20 dark:bg-slate-900/20"
                  />
                );
              }

              const { visibleItems, extraCount } = getDayItems(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleDayClick(cell.dateStr)}
                  className={`
                    min-h-[100px] sm:min-h-[120px] max-h-[145px] p-1.5 sm:p-2 transition-all cursor-pointer group hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 flex flex-col justify-between overflow-hidden
                    ${isToday ? 'bg-indigo-500/5' : ''}
                  `}
                >
                  <div>
                    {/* Day number & hover Add icon */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${
                            isToday
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                              : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600'
                          }
                        `}
                      >
                        {cell.dayNumber}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddEventForDate(cell.dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-indigo-500 p-0.5 rounded hover:bg-indigo-100/50 transition-opacity"
                        title="Añadir evento a este día"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Max 3 visible items */}
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className={`px-1.5 py-0.5 rounded-md border text-[10px] truncate flex items-center gap-1 ${item.className}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* "+X más" Badge if more than 3 items */}
                  {extraCount > 0 && (
                    <div className="mt-1 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors">
                        +{extraCount} más
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* WEEK & DAY VIEWS (Detailed List with Event Types) */}
      {viewMode !== 'month' && (
        <GlassCard padding="md" className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Agenda Detallada para {SPANISH_MONTHS[month]} {year}
          </h3>
          <div className="space-y-3">
            {/* Custom Events */}
            {customEvents.map((ev) => {
              const typeColor =
                ev.type === 'evento'
                  ? 'bg-purple-500'
                  : ev.type === 'exposicion'
                  ? 'bg-amber-500'
                  : 'bg-cyan-500';
              const Icon = ev.type === 'evento' ? CalendarIcon : ev.type === 'exposicion' ? Mic : Bell;

              return (
                <div
                  key={ev.id}
                  onClick={() => handleDayClick(ev.date)}
                  className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white ${typeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {ev.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase ${typeColor}`}>
                          {ev.type}
                        </span>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {ev.date} {ev.time && `• ${ev.time}`}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomEvent(ev.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Exams */}
            {exams.map((e) => (
              <div
                key={e.id}
                onClick={() => handleDayClick(e.date)}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500 text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {e.title}
                    </span>
                    <p className="text-xs text-slate-500">{e.topics || 'Examen programado'}</p>
                  </div>
                </div>
                <GlassBadge size="sm" color="#EF4444">
                  {e.date}
                </GlassBadge>
              </div>
            ))}

            {/* Tasks */}
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleDayClick(t.dueDate)}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500 text-white">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{t.dueDate}</span>
              </div>
            ))}

            {/* Planned Study Sessions */}
            {plans.flatMap((p) => getPlanSessions(p)).map((ps) => {
              const sub = subjects.find((s) => s.id === ps.subjectId);
              return (
                <div
                  key={ps.id}
                  onClick={() => handleDayClick(ps.date)}
                  className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500 text-white">
                      <CalendarRange className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${ps.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {ps.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase bg-teal-500">
                          {ps.dayPart}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {sub?.name ? `Materia: ${sub.name} • ` : ''}{ps.durationMinutes} min de estudio planificado
                      </p>
                    </div>
                  </div>
                  <GlassBadge size="sm" color="#14B8A6">
                    {ps.date}
                  </GlassBadge>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Creation Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        initialDate={selectedDateForNewEvent}
      />

      {/* Day Detailed View Modal */}
      <DayDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        dateStr={selectedDateForDetail}
        onAddEvent={(d) => handleOpenAddEventForDate(d)}
      />
    </div>
  );
};