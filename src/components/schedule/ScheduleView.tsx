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

  const days: { id: 1 | 2 | 3 | 4 | 5; name: string }[] = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' }
  ];

  const handleOpenAdd = (day: 1 | 2 | 3 | 4 | 5 = 1) => {
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
          onClick={() => handleOpenAdd(1)}
          icon={<Plus className="w-4 h-4" />}
        >
          Añadir Clase
        </GlassButton>
      </div>

      {/* Weekly Grid (Columns for Mon-Fri) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
