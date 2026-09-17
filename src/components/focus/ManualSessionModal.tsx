import React, { useState, useEffect } from 'react';
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
  initialData?: FocusSession | null;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialData
}) => {
  const { subjects, addFocusSession, updateFocusSession } = useApp();
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [hours, setHours] = useState<number | string>(1);
  const [minutes, setMinutes] = useState<number | string>(0);
  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId || '');
      const h = Math.floor(initialData.durationMinutes / 60);
      const m = initialData.durationMinutes % 60;
      setHours(h);
      setMinutes(m);
      setDate(initialData.date.split('T')[0] || getTodayDateString());
      setNotes(initialData.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setHours(1);
      setMinutes(0);
      setDate(initialDate || getTodayDateString());
      setNotes('');
    }
  }, [initialData, initialDate, isOpen, subjects]);

  const numHours = typeof hours === 'number' ? hours : parseInt(hours, 10) || 0;
  const numMinutes = typeof minutes === 'number' ? minutes : parseInt(minutes, 10) || 0;
  const totalCalculatedMinutes = Math.max(1, numHours * 60 + numMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHours = typeof hours === 'number' ? hours : parseInt(hours, 10) || 0;
    const finalMinutes = typeof minutes === 'number' ? minutes : parseInt(minutes, 10) || 0;
    const totalMinutes = Math.max(1, finalHours * 60 + finalMinutes);

    if (initialData) {
      const updatePayload: Partial<FocusSession> = {
        durationMinutes: totalMinutes,
        date: new Date(`${date}T12:00:00`).toISOString(),
        ...(subjectId ? { subjectId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : { notes: 'Estudio registrado manualmente' })
      };
      if (!subjectId) {
        delete updatePayload.subjectId;
      }
      updateFocusSession(initialData.id, updatePayload);
    } else {
      const sessionData: Omit<FocusSession, 'id'> = {
        durationMinutes: totalMinutes,
        type: 'normal',
        date: new Date(`${date}T12:00:00`).toISOString(),
        completed: true,
        ...(subjectId ? { subjectId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : { notes: 'Estudio registrado manualmente' })
      };
      addFocusSession(sessionData);
    }

    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Sesión de Estudio' : 'Registrar Estudio Manualmente'}
      subtitle={initialData ? 'Modifica la duración, materia o notas de la sesión' : 'Añade tiempo de estudio realizado fuera de la app'}
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
                  step="1"
                  value={hours}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setHours('');
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setHours(Math.max(0, Math.min(24, parsed)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (hours === '' || isNaN(Number(hours))) {
                      setHours(0);
                    }
                  }}
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
                  step="1"
                  value={minutes}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setMinutes('');
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setMinutes(Math.max(0, Math.min(59, parsed)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (minutes === '' || isNaN(Number(minutes))) {
                      setMinutes(0);
                    }
                  }}
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
            {initialData ? 'Guardar Cambios' : 'Guardar Estudio'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
