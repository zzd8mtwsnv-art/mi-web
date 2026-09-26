import React, { useState, useEffect } from 'react';
import { GradeItem, GradeCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString } from '../../utils/dateUtils';
import { Percent, Scale } from 'lucide-react';

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
  const [hasWeight, setHasWeight] = useState<boolean>(false);
  const [weightPercentage, setWeightPercentage] = useState<number | string>(20);
  const [date, setDate] = useState(getTodayDateString());

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId);
      setTitle(initialData.title);
      setCategory(initialData.category);
      setScore(initialData.score);
      setMaxScore(initialData.maxScore);
      const withWeight =
        initialData.weightPercentage !== undefined &&
        initialData.weightPercentage !== null &&
        Number(initialData.weightPercentage) > 0;
      setHasWeight(withWeight);
      setWeightPercentage(withWeight ? initialData.weightPercentage! : 20);
      setDate(initialData.date);
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setCategory('examen');
      setScore(8.5);
      setMaxScore(10);
      setHasWeight(false);
      setWeightPercentage(20);
      setDate(getTodayDateString());
    }
  }, [initialData, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const numWeight =
      typeof weightPercentage === 'number'
        ? weightPercentage
        : parseFloat(weightPercentage as string);
    const isWeightValid = hasWeight && !isNaN(numWeight) && numWeight > 0;

    const payload: Omit<GradeItem, 'id'> = {
      subjectId,
      title: title.trim(),
      category,
      score: Number(score),
      maxScore: Number(maxScore),
      date,
      ...(isWeightValid ? { weightPercentage: numWeight } : {})
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Calificación' : 'Nueva Calificación'}
      subtitle="Registra notas con ponderación porcentual opcional"
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

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Optional Weight Section */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl text-white ${hasWeight ? 'bg-indigo-600 shadow-md shadow-indigo-500/25' : 'bg-slate-400 dark:bg-slate-700'}`}>
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <label
                  htmlFor="has-weight-toggle"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 block cursor-pointer select-none"
                >
                  ¿Tiene peso en la nota final?
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {hasWeight
                    ? 'Esta calificación ponderará con un porcentaje específico'
                    : 'Calificación sin ponderación (cuenta para media aritmética)'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="has-weight-toggle"
                type="checkbox"
                checked={hasWeight}
                onChange={(e) => setHasWeight(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 transition-colors"></div>
            </label>
          </div>

          {hasWeight && (
            <div className="pt-3 border-t border-indigo-100 dark:border-white/10 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Porcentaje de Ponderación (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  required={hasWeight}
                  value={weightPercentage}
                  onChange={(e) =>
                    setWeightPercentage(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  placeholder="Ej. 20, 30, 40..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono pr-8"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>
          )}
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
