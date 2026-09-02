import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeItem } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { GradeModal } from './GradeModal';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  Sparkles,
  TrendingUp,
  Calculator,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const GradesView: React.FC = () => {
  const {
    grades,
    subjects,
    addGradeItem,
    updateGradeItem,
    deleteGradeItem,
    globalAverageGrade,
    getSubjectAverage
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Target Grade Simulator State
  const [simSubjectId, setSimSubjectId] = useState(subjects[0]?.id || '');
  const [simDesiredAverage, setSimDesiredAverage] = useState<number>(9.0);
  const [simUpcomingWeight, setSimUpcomingWeight] = useState<number>(40);

  const handleOpenAdd = () => {
    setEditingGrade(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeItem) => {
    setEditingGrade(grade);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta calificación?')) {
      deleteGradeItem(id);
    }
  };

  const handleSave = (data: Omit<GradeItem, 'id'>) => {
    if (editingGrade) {
      updateGradeItem(editingGrade.id, data);
    } else {
      addGradeItem(data);
    }
  };

  // Filtered grades list
  const filteredGrades = selectedSubjectFilter === 'all'
    ? grades
    : grades.filter((g) => g.subjectId === selectedSubjectFilter);

  // Chart data: Average grade per subject
  const chartData = subjects.map((sub) => {
    const avg = getSubjectAverage(sub.id);
    return {
      name: sub.shortName || sub.name.substring(0, 10),
      fullName: sub.name,
      nota: avg,
      color: sub.color
    };
  });

  // Calculate Required Exam Grade in Simulator:
  // CurrentWeightedSum + NeededScore * UpcomingWeight = DesiredAverage * (TotalWeight + UpcomingWeight)
  const currentSubGrades = grades.filter((g) => g.subjectId === simSubjectId);
  const currentWeightSum = currentSubGrades.reduce((acc, g) => acc + g.weightPercentage, 0);
  const currentWeightedScores = currentSubGrades.reduce(
    (acc, g) => acc + (g.score / g.maxScore) * 10 * g.weightPercentage,
    0
  );

  const targetTotalWeight = currentWeightSum + simUpcomingWeight;
  const neededScore =
    simUpcomingWeight > 0
      ? (simDesiredAverage * targetTotalWeight - currentWeightedScores) / simUpcomingWeight
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calificaciones & Expediente
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cálculo ponderado de notas medias y simulador de objetivos
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Añadir Calificación
        </GlassButton>
      </div>

      {/* Global Average Card & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global GPA KPI - 4 cols */}
        <GlassCard padding="lg" className="lg:col-span-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Nota Media Global
              </span>
              <Award className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 font-mono my-3">
              {globalAverageGrade.toFixed(2)}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Media aritmética ponderada de las {subjects.length} materias de Bachillerato (Escala 0-10).
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Materia más alta:</span>
              <span className="font-bold text-emerald-500">
                {subjects.reduce((prev, curr) =>
                  getSubjectAverage(curr.id) > getSubjectAverage(prev.id) ? curr : prev
                , subjects[0])?.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total calificaciones:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {grades.length} registradas
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Visual Bar Chart per Subject - 8 cols */}
        <GlassCard padding="md" className="lg:col-span-8 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Evolución de Notas por Asignatura
            </h3>
            <span className="text-xs text-slate-400">Objetivo: &gt; 8.5</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md border border-white/10 shadow-xl">
                          <p className="font-bold">{d.fullName}</p>
                          <p className="text-indigo-300 font-mono mt-0.5">Nota media: {d.nota} / 10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="nota" radius={[8, 8, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* TARGET GRADE SIMULATOR */}
      <GlassCard padding="md" className="bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 border-indigo-500/20 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Simulador de Nota Deseada
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Calcula qué nota necesitas sacar en tu próximo examen o entrega para alcanzar tu objetivo trimestral.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asignatura
            </label>
            <select
              value={simSubjectId}
              onChange={(e) => setSimSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm"
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
              Nota que deseas ({simDesiredAverage})
            </label>
            <input
              type="number"
              step="0.1"
              min="5"
              max="10"
              value={simDesiredAverage}
              onChange={(e) => setSimDesiredAverage(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Peso próximo examen ({simUpcomingWeight}%)
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={simUpcomingWeight}
              onChange={(e) => setSimUpcomingWeight(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm font-mono"
            />
          </div>

          <div className="p-3 rounded-2xl bg-indigo-600 text-white text-center shadow-md">
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              Necesitas sacar
            </span>
            <span className="text-xl font-extrabold font-mono">
              {neededScore <= 0 ? 'Aprobado garantizado' : neededScore > 10 ? '+10 (Inalcanzable)' : neededScore.toFixed(2)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* GRADES LIST & FILTER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Registro de Calificaciones ({filteredGrades.length})
          </h2>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm max-w-xs"
          >
            <option value="all">Todas las Asignaturas</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredGrades.map((grade) => {
            const sub = subjects.find((s) => s.id === grade.subjectId);

            return (
              <GlassCard
                key={grade.id}
                padding="md"
                className="flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {sub && (
                      <span
                        style={{ color: sub.color }}
                        className="text-xs font-bold truncate"
                      >
                        {sub.name}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 capitalize">
                      • {grade.category} ({grade.weightPercentage}%)
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {grade.title}
                  </h4>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    {grade.date}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {grade.score}
                    </span>
                    <span className="text-xs text-slate-400"> / {grade.maxScore}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(grade)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <GradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingGrade}
      />
    </div>
  );
};
