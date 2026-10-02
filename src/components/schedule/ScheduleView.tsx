import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleItem } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { ScheduleModal } from './ScheduleModal';
import { getSubjectIcon } from '../../utils/icons';
import { getDayOfWeekIndex } from '../../utils/dateUtils';
import { Plus, Edit2, Trash2, Clock, MapPin, User, Sparkles } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { schedule, subjects, addScheduleItem, updateScheduleItem, deleteScheduleItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3 | 4 | 5>(1);

  const currentDayIndex = getDayOfWeekIndex(new Date()) as 1 | 2 | 3 | 4 | 5;

  const initialDay = (currentDayIndex >= 1 && currentDayIndex <= 5 ? currentDayIndex : 1) as 1 | 2 | 3 | 4 | 5;
  const [selectedMobileDay, setSelectedMobileDay] = useState<1 | 2 | 3 | 4 | 5>(initialDay);

  const days: { id: 1 | 2 | 3 | 4 | 5; name: string; short: string }[] = [
    { id: 1, name: 'Lunes', short: 'Lun' },
    { id: 2, name: 'Martes', short: 'Mar' },
    { id: 3, name: 'Miércoles', short: 'Mié' },
    { id: 4, name: 'Jueves', short: 'Jue' },
    { id: 5, name: 'Viernes', short: 'Vie' }
  ];

  const handleOpenAdd = (day: 1 | 2 | 3 | 4 | 5 = selectedMobileDay) => {
    setSelectedDay(day);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta clase del horario?')) {
      deleteScheduleItem(id);
    }
  };

  const handleSave = (data: Omit<ScheduleItem, 'id'>) => {
    if (editingItem) {
      updateScheduleItem(editingItem.id, data);
    } else {
      addScheduleItem(data);
    }
  };

  const selectedDayItems = schedule
    .filter((s) => s.dayOfWeek === selectedMobileDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const selectedDayObj = days.find((d) => d.id === selectedMobileDay);
  const isSelectedDayToday = currentDayIndex === selectedMobileDay;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Horario Escolar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Distribución semanal de clases de Bachillerato (Lunes a Viernes)
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={() => handleOpenAdd(selectedMobileDay)}
          icon={<Plus className="w-4 h-4" />}
        >
          Añadir Clase
        </GlassButton>
      </div>

      {/* MOBILE VIEW: Interactive Day Tabs + Chronological Class Cards */}
      <div className="md:hidden space-y-4">
        {/* Day Tab Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-white/60 dark:border-white/10 overflow-x-auto scrollbar-none">
          {days.map((day) => {
            const isSelected = selectedMobileDay === day.id;
            const isToday = currentDayIndex === day.id;
            const dayCount = schedule.filter((s) => s.dayOfWeek === day.id).length;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedMobileDay(day.id)}
                className={`flex-1 min-w-[62px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{day.short}</span>
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-indigo-500'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-medium opacity-80 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {dayCount} {dayCount === 1 ? 'clase' : 'clases'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Action Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-white/60 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {selectedDayObj?.name}
            </span>
            {isSelectedDayToday && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-500/25">
                HOY
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              • {selectedDayItems.length} {selectedDayItems.length === 1 ? 'clase' : 'clases'}
            </span>
          </div>

          <button
            onClick={() => handleOpenAdd(selectedMobileDay)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>

        {/* Mobile Classes Vertical List */}
        <div className="space-y-3">
          {selectedDayItems.length === 0 ? (
            <GlassCard padding="lg" className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center mb-3 text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No hay clases programadas para el {selectedDayObj?.name.toLowerCase()}
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Puedes añadir tu primera clase con las horas, aula y profesor
              </p>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => handleOpenAdd(selectedMobileDay)}
                icon={<Plus className="w-4 h-4" />}
              >
                Añadir Clase
              </GlassButton>
            </GlassCard>
          ) : (
            selectedDayItems.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);

              return (
                <GlassCard
                  key={item.id}
                  padding="md"
                  className="space-y-3 relative hover:border-indigo-400/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {item.startTime} - {item.endTime}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Editar clase"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                        title="Eliminar clase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: sub?.color || '#6366f1' }}
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {sub?.name || 'Asignatura'}
                    </span>
                  </div>

                  {(item.classroom || item.teacher) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-white/5">
                      {item.classroom && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Aula {item.classroom}</span>
                        </div>
                      )}
                      {item.teacher && (
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.teacher}</span>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* DESKTOP / TABLET GRID (5 Columns for Mon-Fri) */}
      <div className="hidden md:grid md:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayItems = schedule
            .filter((s) => s.dayOfWeek === day.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const isToday = currentDayIndex === day.id;

          return (
            <div key={day.id} className="space-y-3">
              {/* Day Column Header */}
              <div
                className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                  isToday
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-indigo-500'
                    : 'glass-panel border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{day.name}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-white/20 rounded-md">
                      HOY
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenAdd(day.id)}
                  className={`p-1 rounded-lg transition-colors ${
                    isToday
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500'
                  }`}
                  title="Añadir clase a este día"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Class Blocks */}
              <div className="space-y-2.5 min-h-[300px]">
                {dayItems.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 py-8">
                    Sin clases
                  </div>
                ) : (
                  dayItems.map((item) => {
                    const sub = subjects.find((s) => s.id === item.subjectId);

                    return (
                      <GlassCard
                        key={item.id}
                        padding="sm"
                        className="group relative hover:border-indigo-400/40 transition-all"
                      >
                        {/* Time Slot Pill */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300">
                            {item.startTime} - {item.endTime}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subject info */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sub?.name || 'Asignatura'}
                          </span>
                        </div>

                        {/* Classroom and Teacher */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          {item.classroom && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{item.classroom}</span>
                            </div>
                          )}
                          {item.teacher && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{item.teacher}</span>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingItem}
        initialDay={selectedDay}
      />
    </div>
  );
};
