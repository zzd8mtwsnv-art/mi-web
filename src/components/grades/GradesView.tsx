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
  HelpCircle,
  Scale,
  AlertCircle,
  CheckCircle2,
  Info
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

  // Helper for computing granular stats of a subject
  const getSubjectStats = (subjectId: string) => {
    const subGrades = grades.filter((g) => g.subjectId === subjectId);
    const weighted = subGrades.filter(
      (g) =>
        g.weightPercentage !== undefined &&
        g.weightPercentage !== null &&
        Number(g.weightPercentage) > 0
    );
    const unweighted = subGrades.filter(
      (g) =>
        g.weightPercentage === undefined ||
        g.weightPercentage === null ||
        Number(g.weightPercentage) <= 0
    );

    const totalWeight = weighted.reduce(
      (acc, g) => acc + Number(g.weightPercentage || 0),
      0
    );
    const weightedSum = weighted.reduce(
      (acc, g) =>
        acc + (g.score / g.maxScore) * 10 * Number(g.weightPercentage || 0),
      0
    );
    const weightedAverage =
      totalWeight > 0
        ? Number((weightedSum / totalWeight).toFixed(2))
        : null;

    const arithmeticSum = subGrades.reduce(
      (acc, g) => acc + (g.score / g.maxScore) * 10,
      0
    );
    const arithmeticAverage =
      subGrades.length > 0
        ? Number((arithmeticSum / subGrades.length).toFixed(2))
        : null;

    return {
      subjectId,
      totalCount: subGrades.length,
      weightedCount: weighted.length,
      unweightedCount: unweighted.length,
      totalWeight,
      weightedAverage,
      arithmeticAverage,
      hasBoth: weighted.length > 0 && unweighted.length > 0,
      isPartial: totalWeight > 0 && totalWeight < 100
    };
  };

  // Filtered grades list
  const filteredGrades =
    selectedSubjectFilter === 'all'
      ? grades
      : grades.filter((g) => g.subjectId === selectedSubjectFilter);

  // Selected subject stats (when a single subject filter is active)
  const activeSubjectStats =
    selectedSubjectFilter !== 'all'
      ? getSubjectStats(selectedSubjectFilter)
      : null;
  const activeSubject =
    selectedSubjectFilter !== 'all'
      ? subjects.find((s) => s.id === selectedSubjectFilter)
      : null;

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

  // Calculate Required Exam Grade in Simulator
  const simStats = getSubjectStats(simSubjectId);
  const currentWeightSum = simStats.totalWeight;
  const currentWeightedScores = grades
    .filter(
      (g) =>
        g.subjectId === simSubjectId &&
        g.weightPercentage !== undefined &&
        g.weightPercentage !== null &&
        Number(g.weightPercentage) > 0
    )
    .reduce(
      (acc, g) =>
        acc + (g.score / g.maxScore) * 10 * Number(g.weightPercentage || 0),
      0
    );

  let neededScore = 0;
  if (simUpcomingWeight > 0) {
    if (currentWeightSum > 0) {
      const targetTotalWeight = currentWeightSum + simUpcomingWeight;
      neededScore =
        (simDesiredAverage * targetTotalWeight - currentWeightedScores) /
        simUpcomingWeight;
    } else {
      const baseAvg = simStats.arithmeticAverage ?? 0;
      neededScore =
        (simDesiredAverage * 100 - baseAvg * (100 - simUpcomingWeight)) /
        simUpcomingWeight;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calificaciones & Expediente
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cálculo ponderado y aritmético de notas medias con soporte de ponderación opcional
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
              Media de las {subjects.length} materias de Bachillerato (respetando ponderaciones cuando existen o medias aritméticas en materias sin peso).
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Materia más alta:</span>
              <span className="font-bold text-emerald-500">
                {subjects.reduce(
                  (prev, curr) =>
                    getSubjectAverage(curr.id) > getSubjectAverage(prev.id)
                      ? curr
                      : prev,
                  subjects[0]
                )?.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total calificaciones:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {grades.length} registradas ({grades.filter((g) => g.weightPercentage && g.weightPercentage > 0).length} con peso • {grades.filter((g) => !g.weightPercentage || g.weightPercentage <= 0).length} sin peso)
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
            <span className="text-xs text-slate-400">Escala 0 - 10</span>
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
            className="px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm max-w-xs font-medium"
          >
            <option value="all">Todas las Asignaturas</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* DETAILED SUBJECT STATS BANNER (WHEN FILTERING BY A SINGLE SUBJECT) */}
        {activeSubjectStats && activeSubject && (
          <GlassCard padding="md" className="border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: activeSubject.color }}
                />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Resumen de Calificaciones: {activeSubject.name}
                </h3>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-2">
                {activeSubjectStats.weightedCount > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                      activeSubjectStats.totalWeight === 100
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : activeSubjectStats.totalWeight > 100
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {activeSubjectStats.totalWeight === 100 ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {activeSubjectStats.totalWeight === 100
                      ? 'Ponderación completa (100%)'
                      : activeSubjectStats.totalWeight > 100
                      ? `Ponderación excede 100% (${activeSubjectStats.totalWeight}%)`
                      : `Ponderación parcial (${activeSubjectStats.totalWeight}% acumulado)`}
                  </span>
                )}
                {activeSubjectStats.unweightedCount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {activeSubjectStats.unweightedCount} nota(s) sin ponderación
                  </span>
                )}
              </div>
            </div>

            {/* KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {/* Media Ponderada */}
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Media Ponderada (con peso)
                </span>
                {activeSubjectStats.weightedAverage !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {activeSubjectStats.weightedAverage.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / 10 ({activeSubjectStats.totalWeight}% asignado)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-400">
                    Sin notas con ponderación
                  </span>
                )}
              </div>

              {/* Media Aritmética Simple */}
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Media Aritmética (todas)
                </span>
                {activeSubjectStats.arithmeticAverage !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {activeSubjectStats.arithmeticAverage.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / 10 ({activeSubjectStats.totalCount} notas totales)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-400">
                    Sin notas registradas
                  </span>
                )}
              </div>

              {/* Composición de notas */}
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Distribución de Calificaciones
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-0.5">
                  <div>• {activeSubjectStats.weightedCount} nota(s) con peso ({activeSubjectStats.totalWeight}%)</div>
                  <div>• {activeSubjectStats.unweightedCount} nota(s) sin ponderación</div>
                </div>
              </div>
            </div>

            {/* Explanatory footer notice */}
            {activeSubjectStats.hasBoth && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Esta materia combina notas ponderadas y notas sin peso. Se muestra por separado la media aritmética de todas las notas y el resultado ponderado de las que tienen porcentaje asignado.
                </span>
              </div>
            )}
            {activeSubjectStats.weightedCount === 0 && activeSubjectStats.unweightedCount > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Todas las notas de esta materia son sin ponderación. Su nota media oficial se calcula mediante la media aritmética normal.
                </span>
              </div>
            )}
          </GlassCard>
        )}

        {/* Empty state */}
        {filteredGrades.length === 0 && (
          <GlassCard padding="lg" className="text-center py-12">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No hay calificaciones registradas
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Añade notas de exámenes, trabajos o proyectos con o sin ponderación porcentual.
            </p>
            <div className="mt-4">
              <GlassButton variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
                Añadir Primera Calificación
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Grid of Grades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredGrades.map((grade) => {
            const sub = subjects.find((s) => s.id === grade.subjectId);
            const hasWeight =
              grade.weightPercentage !== undefined &&
              grade.weightPercentage !== null &&
              Number(grade.weightPercentage) > 0;

            return (
              <GlassCard
                key={grade.id}
                padding="md"
                className="flex items-center justify-between gap-3 group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {sub && (
                      <span
                        style={{ color: sub.color }}
                        className="text-xs font-bold truncate"
                      >
                        {sub.name}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 capitalize">
                      • {grade.category}
                    </span>
                    {hasWeight ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/40 font-mono">
                        <Scale className="w-2.5 h-2.5" />
                        {grade.weightPercentage}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Sin ponderación
                      </span>
                    )}
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
                    <span className="text-xs text-slate-400 font-mono"> / {grade.maxScore}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(grade)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      title="Editar calificación"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Eliminar calificación"
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
