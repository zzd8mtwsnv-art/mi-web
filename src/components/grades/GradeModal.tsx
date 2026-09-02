import React, { useState, useEffect } from 'react';
import { GradeItem, GradeCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<GradeItem, 'id'>) => void;
  initialData?: GradeItem | null;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { subjects } = useApp();
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GradeCategory>('examen');
  const [score, setScore] = useState<number>(8.5);
  const [maxScore, setMaxScore] = useState<number>(10);
  const [weightPercentage, setWeightPercentage] = useState<number>(20);
  const [date, setDate] = useState(getTodayDateString());

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId);
      setTitle(initialData.title);
      setCategory(initialData.category);
      setScore(initialData.score);
      setMaxScore(initialData.maxScore);
      setWeightPercentage(initialData.weightPercentage);
      setDate(initialData.date);
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setCategory('examen');
      setScore(8.5);
      setMaxScore(10);
      setWeightPercentage(20);
      setDate(getTodayDateString());
    }
  }, [initialData, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    onSubmit({
      subjectId,
      title: title.trim(),
      category,
      score: Number(score),
      maxScore: Number(maxScore),
      weightPercentage: Number(weightPercentage),
      date
    });
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Calificación' : 'Nueva Calificación'}
      subtitle="Introduce notas de exámenes, trabajos o proyectos con ponderación"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nombre de la Calificación *
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Control Tema 2 / Trabajo de Sintaxis..."
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
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GradeCategory)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm capitalize"
            >
              <option value="examen">Examen</option>
              <option value="trabajo">Trabajo / Deberes</option>
              <option value="proyecto">Proyecto / Lab</option>
              <option value="participacion">Participación</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Scores & Weights */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota Obtenida *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={maxScore}
              required
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl glass-input text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sobre (Máx)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              required
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl glass-input text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Peso (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={weightPercentage}
              onChange={(e) => setWeightPercentage(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl glass-input text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Fecha
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            {initialData ? 'Guardar Cambios' : 'Añadir Calificación'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
