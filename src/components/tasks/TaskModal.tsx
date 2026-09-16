import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { Clock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  initialData?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { subjects } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [hasTime, setHasTime] = useState<boolean>(false);
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState<Priority>('media');
  const [status, setStatus] = useState<TaskStatus>('pendiente');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setSubjectId(initialData.subjectId || '');
      setDueDate(initialData.dueDate);
      if (initialData.dueTime) {
        setHasTime(true);
        setDueTime(initialData.dueTime);
      } else {
        setHasTime(false);
        setDueTime('18:00');
      }
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setEstimatedMinutes(initialData.estimatedMinutes || 45);
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects[0]?.id || '');
      setDueDate(getTodayDateString());
      setHasTime(false);
      setDueTime('18:00');
      setPriority('media');
      setStatus('pendiente');
      setEstimatedMinutes(45);
    }
  }, [initialData, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      title: title.trim(),
      dueDate,
      priority,
      status,
      estimatedMinutes: Number(estimatedMinutes),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(hasTime && dueTime ? { dueTime: dueTime.trim() } : {})
    };

    onSubmit(taskData);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Tarea' : 'Nueva Tarea'}
      subtitle="Organiza tus deberes, entregas y proyectos de Bachillerato"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título de la Tarea *
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Problemas de Matemáticas Pág. 82..."
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
              <option value="">General / Otra</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha Límite *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Optional Time Toggle & Input */}
        <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> ¿Añadir hora límite?
            </label>
            <input
              type="checkbox"
              checked={hasTime}
              onChange={(e) => setHasTime(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {hasTime && (
            <div className="pt-1">
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm font-semibold"
              />
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Prioridad
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['baja', 'media', 'alta', 'urgente'] as Priority[]).map((p) => {
              const colors: Record<Priority, string> = {
                baja: 'bg-slate-500',
                media: 'bg-indigo-500',
                alta: 'bg-amber-500',
                urgente: 'bg-rose-500'
              };
              const isSelected = priority === p;

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                    isSelected
                      ? `${colors[p]} text-white border-transparent shadow-md`
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Estado
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['pendiente', 'en_progreso', 'completada'] as TaskStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                  status === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Descripción o Detalles
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Instrucciones del profesor, páginas del libro, enlaces de entrega..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" size="sm">
            {initialData ? 'Guardar Cambios' : 'Crear Tarea'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
