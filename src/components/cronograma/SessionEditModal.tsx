import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PlannedStudySession, DayPart } from '../../types';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { BookOpen, Calendar, Clock, Sun, Sunset, Moon, FileText, CheckCircle2 } from 'lucide-react';

interface SessionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PlannedStudySession | null;
  planId: string;
  defaultDate?: string;
  onSave: (sessionData: Omit<PlannedStudySession, 'id' | 'planId'>) => void;
}

export const SessionEditModal: React.FC<SessionEditModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultDate,
  onSave
}) => {
  const { subjects } = useApp();

  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || getTodayDateString());
  const [dayPart, setDayPart] = useState<DayPart>('tarde');
  const [hasTime, setHasTime] = useState<boolean>(false);
  const [time, setTime] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId || '');
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setDate(initialData.date || defaultDate || getTodayDateString());
      setDayPart(initialData.dayPart || 'tarde');
      setHasTime(Boolean(initialData.time));
      setTime(initialData.time || '');
      setDurationMinutes(initialData.durationMinutes || 45);
      setNotes(initialData.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setContent('');
      setDate(defaultDate || getTodayDateString());
      setDayPart('tarde');
      setHasTime(false);
      setTime('');
      setDurationMinutes(45);
      setNotes('');
    }
  }, [initialData, defaultDate, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
      date,
      dayPart,
      durationMinutes: Math.max(1, durationMinutes),
      ...(subjectId ? { subjectId } : {}),
      ...(hasTime && time.trim() ? { time: time.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {})
    });

    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Sesión Planificada' : 'Nueva Sesión de Estudio'}
      subtitle="Ajusta el contenido, horario y duración de esta sesión"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asignatura */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Asignatura
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
          >
            <option value="">General / Varias</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Título de la sesión */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título de la Sesión *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudio: Cinemática y MRU"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold"
          />
        </div>

        {/* Contenido / Temas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contenido o Temario a tratar
          </label>
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Apartados 1 a 3, fórmulas clave y problemas..."
            className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Fecha y Franja Horaria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Franja del Día
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'mañana', label: 'Mañana', icon: Sun },
                { id: 'tarde', label: 'Tarde', icon: Sunset },
                { id: 'noche', label: 'Noche', icon: Moon },
                { id: 'sin_hora', label: 'Libre', icon: Clock }
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDayPart(p.id as DayPart)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                      dayPart === p.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Duración y Hora Opcional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Duración (minutos) *
            </label>
            <input
              type="number"
              min="1"
              max="360"
              step="1"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-center"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hora Exacta
              </label>
              <label className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={(e) => setHasTime(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                ¿Añadir hora?
              </label>
            </div>
            <input
              type="time"
              disabled={!hasTime}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm disabled:opacity-40"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Notas adicionales (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Traer calculadora, repasar ejercicios 12 a 15..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {initialData ? 'Guardar Cambios' : 'Añadir Sesión'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
