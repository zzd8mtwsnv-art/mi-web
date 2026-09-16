import React, { useState, useEffect } from 'react';
import { Exam } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { Clock } from 'lucide-react';

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
  const [hasTime, setHasTime] = useState<boolean>(false);
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
      if (initialData.time) {
        setHasTime(true);
        setTime(initialData.time);
      } else {
        setHasTime(false);
        setTime('09:30');
      }
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
      setHasTime(false);
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

    const examData: Omit<Exam, 'id'> = {
      title: title.trim(),
      subjectId,
      date,
      importance,
      maxGrade: Number(maxGrade),
      weightPercentage: Number(weightPercentage),
      ...(hasTime && time ? { time: time.trim() } : {}),
      ...(classroom.trim() ? { classroom: classroom.trim() } : {}),
      ...(topics.trim() ? { topics: topics.trim() } : {}),
      ...(grade !== '' ? { grade: Number(grade) } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {})
    };

    onSubmit(examData);
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

        {/* Optional Time Toggle & Input */}
        <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
              <Clock className="w-3.5 h-3.5 text-rose-500" /> ¿Añadir hora del examen?
            </label>
            <input
              type="checkbox"
              checked={hasTime}
              onChange={(e) => setHasTime(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          {hasTime && (
            <div className="pt-1">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm font-semibold"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Aula o Laboratorio (opcional)
          </label>
          <input
            type="text"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            placeholder="Ej. Aula 204, Laboratorio de Física..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
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
              { id: 'crucial', label: 'Crucial (Global)' }
            ].map((imp) => (
              <button
                key={imp.id}
                type="button"
                onClick={() => setImportance(imp.id as any)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  importance === imp.id
                    ? 'bg-rose-500 text-white border-transparent shadow-md'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                }`}
              >
                {imp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics / Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Temario o Contenidos a Evaluar
          </label>
          <textarea
            rows={2}
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Ej. Temas 3 y 4: Matrices, determinantes y sistemas..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm resize-none"
          />
        </div>

        {/* Weights & Grades */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ponderación (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={weightPercentage}
              onChange={(e) => setWeightPercentage(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota Obtenida
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={maxGrade}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Pendiente"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota Máxima
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxGrade}
              onChange={(e) => setMaxGrade(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notas / Descripción adicional
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Material permitido (calculadora, tablas), formato del examen..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" size="sm">
            {initialData ? 'Guardar Cambios' : 'Crear Examen'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
