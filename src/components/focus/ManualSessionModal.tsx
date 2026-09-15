import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { Clock, BookOpen, Calendar as CalendarIcon, FileText, CheckCircle2 } from 'lucide-react';
import { FocusSession } from '../../types';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { subjects, addFocusSession } = useApp();
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);
  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = Math.max(1, Number(hours) * 60 + Number(minutes));

    const sessionData: Omit<FocusSession, 'id'> = {
      durationMinutes: totalMinutes,
      type: 'normal',
      date: new Date(`${date}T12:00:00`).toISOString(),
      completed: true,
      ...(subjectId ? { subjectId } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : { notes: 'Estudio registrado manualmente' })
    };

    addFocusSession(sessionData);
    onClose();
    // Reset form
    setHours(1);
    setMinutes(0);
    setNotes('');
  };

  const totalCalculatedMinutes = Math.max(1, Number(hours) * 60 + Number(minutes));

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Estudio Manualmente"
      subtitle="Añade tiempo de estudio realizado fuera de la app"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asignatura */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Asignatura
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
          >
            <option value="">Estudio General / Repaso</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duración (Horas y Minutos) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Tiempo Estudiado
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-center pr-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  horas
                </span>
              </div>
            </div>
            <div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-center pr-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  min
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 text-right">
            Total a registrar: <strong>{totalCalculatedMinutes} minutos</strong> ({Math.floor(totalCalculatedMinutes / 60)}h {totalCalculatedMinutes % 60}m)
          </p>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" /> Fecha del Estudio
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
          />
        </div>

        {/* Nota opcional */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Temas o notas del estudio (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Repaso examen tema 4, ejercicios de trigonometría..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Guardar Estudio
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
