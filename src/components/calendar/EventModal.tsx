import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { CheckSquare, FileText, Clock, Sparkles, Mic, Bell, Calendar as CalendarIcon } from 'lucide-react';

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
  const { subjects, addTask, addExam, addFocusSession, addCustomEvent } = useApp();
  const [eventType, setEventType] = useState<'task' | 'exam' | 'session' | 'evento' | 'exposicion' | 'recordatorio'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [time, setTime] = useState('10:00');
  const [minutes, setMinutes] = useState(45);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (eventType === 'task') {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
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
        topics: description.trim() || undefined,
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
    } else if (eventType === 'evento' || eventType === 'exposicion' || eventType === 'recordatorio') {
      addCustomEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        type: eventType,
        date,
        time: time || undefined,
        subjectId: subjectId || undefined,
        color: eventType === 'evento' ? '#8B5CF6' : eventType === 'exposicion' ? '#F59E0B' : '#06B6D4',
        completed: false
      });
    }

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Evento en Calendario"
      subtitle="Programa exámenes, tareas, eventos, exposiciones o recordatorios"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Type Grid (6 types) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tipo de Entrada
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'task', label: 'Tarea / Entrega', icon: CheckSquare, color: 'text-indigo-600 dark:text-indigo-400' },
              { id: 'exam', label: 'Examen / Control', icon: FileText, color: 'text-rose-500' },
              { id: 'session', label: 'Sesión Estudio', icon: Clock, color: 'text-emerald-500' },
              { id: 'evento', label: 'Evento / Vacaciones', icon: CalendarIcon, color: 'text-purple-500' },
              { id: 'exposicion', label: 'Exposición Oral', icon: Mic, color: 'text-amber-500' },
              { id: 'recordatorio', label: 'Recordatorio', icon: Bell, color: 'text-cyan-500' }
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = eventType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEventType(t.id as any)}
                  className={`py-2 px-2.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-indigo-500/50 shadow-md scale-[1.02]'
                      : 'bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-white/10 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? t.color : 'text-slate-400'}`} />
                  <span className={isSelected ? 'text-slate-900 dark:text-white' : ''}>{t.label}</span>
                </button>
              );
            })}
          </div>
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
            placeholder={
              eventType === 'evento'
                ? 'Ej. Vacaciones de Navidad, Excursión al Museo...'
                : eventType === 'exposicion'
                ? 'Ej. Exposición de Historia: Las Cortes de Cádiz...'
                : eventType === 'recordatorio'
                ? 'Ej. Llevar calculadora científica, Entregar autorización...'
                : 'Título del evento...'
            }
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asignatura {eventType === 'evento' ? '(opcional)' : ''}
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
            >
              <option value="">General / Ninguna</option>
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Descripción o notas (opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Anotaciones, requisitos de la exposición, material necesario..."
            className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            Guardar en Calendario
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};