import React, { useState, useEffect } from 'react';
import { Exam } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Exam, 'id'>) => void;
  initialData?: Exam | null;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { subjects } = useApp();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:30');
  const [classroom, setClassroom] = useState('');
  const [topics, setTopics] = useState('');
  const [importance, setImportance] = useState<'normal' | 'alta' | 'crucial'>('alta');
  const [grade, setGrade] = useState<string>('');
  const [maxGrade, setMaxGrade] = useState<number>(10);
  const [weightPercentage, setWeightPercentage] = useState<number>(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSubjectId(initialData.subjectId);
      setDate(initialData.date);
      setTime(initialData.time || '09:30');
      setClassroom(initialData.classroom || '');
      setTopics(initialData.topics || '');
      setImportance(initialData.importance);
      setGrade(initialData.grade !== undefined ? String(initialData.grade) : '');
      setMaxGrade(initialData.maxGrade || 10);
      setWeightPercentage(initialData.weightPercentage || 30);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setDate(getTodayDateString());
      setTime('09:30');
      setClassroom('');
      setTopics('');
      setImportance('alta');
      setGrade('');
      setMaxGrade(10);
      setWeightPercentage(30);
      setNotes('');
    }
  }, [initialData, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    onSubmit({
      title: title.trim(),
      subjectId,
      date,
      time: time || undefined,
      classroom: classroom.trim() || undefined,
      topics: topics.trim() || undefined,
      importance,
      grade: grade !== '' ? Number(grade) : undefined,
      maxGrade: Number(maxGrade),
      weightPercentage: Number(weightPercentage),
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Examen' : 'Nuevo Examen o Control'}
      subtitle="Registra la fecha, temario, ponderación y aula del examen"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nombre del Examen / Evaluación *
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Examen Evaluación Bloque I..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asignatura *
            </label>
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
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
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aula / Lab
            </label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Ej. Aula 204"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Importance Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Importancia
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'alta', label: 'Alta' },
              { id: 'crucial', label: 'Crucial (Evaluación)' }
            ].map((imp) => (
              <button
                key={imp.id}
                type="button"
                onClick={() => setImportance(imp.id as 'normal' | 'alta' | 'crucial')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  importance === imp.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10'
                }`}
              >
                {imp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Temas que entran
          </label>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Ej. Tema 1: Matrices, Tema 2: Determinantes..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        {/* Grade obtained (optional) & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota obtenida (si ya se realizó)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Ej. 8.75"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ponderación (% nota evaluación)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={weightPercentage}
              onChange={(e) => setWeightPercentage(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            {initialData ? 'Guardar Cambios' : 'Crear Examen'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
