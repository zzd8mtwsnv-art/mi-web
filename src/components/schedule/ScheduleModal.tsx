import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ScheduleItem, 'id'>) => void;
  initialData?: ScheduleItem | null;
  initialDay?: 1 | 2 | 3 | 4 | 5;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialDay = 1
}) => {
  const { subjects } = useApp();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<1 | 2 | 3 | 4 | 5>(initialDay);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:25');
  const [classroom, setClassroom] = useState('');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId);
      setDayOfWeek(initialData.dayOfWeek);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setClassroom(initialData.classroom || '');
      setTeacher(initialData.teacher || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setDayOfWeek(initialDay);
      setStartTime('08:30');
      setEndTime('09:25');
      setClassroom('');
      setTeacher('');
    }
  }, [initialData, initialDay, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    onSubmit({
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      classroom: classroom.trim() || undefined,
      teacher: teacher.trim() || undefined
    });
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Clase' : 'Añadir Clase al Horario'}
      subtitle="Configura tus asignaturas en la cuadrícula semanal"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Asignatura *
          </label>
          <select
            required
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              const sub = subjects.find((s) => s.id === e.target.value);
              if (sub) {
                if (sub.classroom) setClassroom(sub.classroom);
                if (sub.teacher) setTeacher(sub.teacher);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Día de la Semana
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 1, label: 'Lun' },
              { id: 2, label: 'Mar' },
              { id: 3, label: 'Mié' },
              { id: 4, label: 'Jue' },
              { id: 5, label: 'Vie' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDayOfWeek(d.id as 1 | 2 | 3 | 4 | 5)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  dayOfWeek === d.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hora Inicio *
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hora Fin *
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aula / Espacio
            </label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Ej. Aula 204"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Profesor
            </label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Ej. D. Manuel García"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            {initialData ? 'Guardar Cambios' : 'Añadir al Horario'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
