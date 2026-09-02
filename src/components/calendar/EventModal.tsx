import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { subjects, addTask, addExam, addFocusSession } = useApp();
  const [eventType, setEventType] = useState<'task' | 'exam' | 'session'>('task');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [time, setTime] = useState('10:00');
  const [minutes, setMinutes] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (eventType === 'task') {
      addTask({
        title: title.trim(),
        subjectId: subjectId || undefined,
        dueDate: date,
        dueTime: time,
        priority: 'media',
        status: 'pendiente'
      });
    } else if (eventType === 'exam') {
      addExam({
        title: title.trim(),
        subjectId,
        date,
        time,
        importance: 'alta'
      });
    } else if (eventType === 'session') {
      addFocusSession({
        subjectId: subjectId || undefined,
        durationMinutes: minutes,
        type: 'normal',
        date: new Date(`${date}T${time}:00`).toISOString(),
        completed: true,
        notes: title.trim()
      });
    }

    setTitle('');
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Evento en Calendario"
      subtitle="Programa una tarea, examen o sesión de estudio"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Type */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={() => setEventType('task')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              eventType === 'task'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Tarea / Entrega
          </button>
          <button
            type="button"
            onClick={() => setEventType('exam')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              eventType === 'exam'
                ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Examen
          </button>
          <button
            type="button"
            onClick={() => setEventType('session')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              eventType === 'session'
                ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Sesión Estudio
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título *
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del evento..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asignatura
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
            >
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          {eventType === 'session' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            Guardar Evento
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
