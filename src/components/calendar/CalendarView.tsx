import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { EventModal } from './EventModal';
import { SPANISH_MONTHS } from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
  Clock
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, exams, schedule, sessions, subjects } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>('');

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
    setSelectedDateForNewEvent(dateStr);
    setIsEventModalOpen(true);
  };

  // Build Month Days Grid
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Blank padding cells for start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr });
  }

  // Get items for a given date
  const getItemsForDate = (dateStr: string) => {
    const dayExams = exams.filter((e) => e.date === dateStr);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const daySessions = sessions.filter((s) => s.date.startsWith(dateStr));
    return { dayExams, dayTasks, daySessions };
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
            Vista unificada de exámenes, entregas, clases y sesiones
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
            onClick={() => {
              setSelectedDateForNewEvent(todayStr);
              setIsEventModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Nuevo Evento
          </GlassButton>
        </div>
      </div>

      {/* Month Navigation Row */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-white/60 dark:border-white/10 shadow-sm">
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
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {SPANISH_MONTHS[month]} {year}
        </h2>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-500">Examen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-500">Tarea</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Estudio</span>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <GlassCard padding="none" className="overflow-hidden shadow-xl">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200/60 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/50 text-center py-2.5 text-xs font-bold text-slate-500">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span className="text-rose-500/80">Sáb</span>
            <span className="text-rose-500/80">Dom</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200/40 dark:divide-white/5">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[95px] sm:min-h-[120px] bg-slate-100/20 dark:bg-slate-900/20"
                  />
                );
              }

              const { dayExams, dayTasks, daySessions } = getItemsForDate(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleDayClick(cell.dateStr)}
                  className={`
                    min-h-[95px] sm:min-h-[120px] p-2 transition-all cursor-pointer group hover:bg-indigo-50/40 dark:hover:bg-slate-800/40
                    ${isToday ? 'bg-indigo-500/5' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1.5">
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

                    <button className="opacity-0 group-hover:opacity-100 text-indigo-500 p-0.5 rounded hover:bg-indigo-100/50">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badges / Events inside cell */}
                  <div className="space-y-1 overflow-hidden">
                    {/* Exams */}
                    {dayExams.map((e) => (
                      <div
                        key={e.id}
                        className="px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold truncate flex items-center gap-1"
                      >
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}

                    {/* Tasks */}
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1 ${
                          t.status === 'completada'
                            ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 line-through'
                            : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                        }`}
                      >
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {/* Focus Sessions */}
                    {daySessions.map((s) => (
                      <div
                        key={s.id}
                        className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium truncate flex items-center gap-1"
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span>{s.durationMinutes}m estudio</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* WEEK & DAY VIEWS */}
      {viewMode !== 'month' && (
        <GlassCard padding="md" className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Agenda Detallada para {SPANISH_MONTHS[month]} {year}
          </h3>
          <div className="space-y-3">
            {exams.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {e.title}
                    </span>
                    <p className="text-xs text-slate-500">{e.topics}</p>
                  </div>
                </div>
                <GlassBadge size="sm" color="#EF4444">
                  {e.date}
                </GlassBadge>
              </div>
            ))}

            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{t.dueDate}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        initialDate={selectedDateForNewEvent}
      />
    </div>
  );
};
