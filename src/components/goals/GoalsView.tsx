import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { GoalModal } from './GoalModal';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  Sparkles,
  CheckCircle,
  Target,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    todayStudyMinutes,
    tasks
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar este objetivo?')) {
      deleteGoal(id);
    }
  };

  const handleSave = (data: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
  };

  // Toggle complete or increment value
  const handleIncrement = (goal: Goal) => {
    const nextVal = goal.currentValue + (goal.unit === 'min' ? 15 : 1);
    const completed = nextVal >= goal.targetValue;
    if (completed && !goal.completed) {
      confetti({ particleCount: 60, spread: 60 });
      soundManager.playCompletionChime();
    }
    updateGoal(goal.id, { currentValue: nextVal, completed });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Metas & Objetivos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hábitos diarios, metas de tareas y notas objetivo para Bachillerato
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Objetivo
        </GlassButton>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          // Dynamic calculation for daily time or weekly tasks
          let currentVal = goal.currentValue;
          if (goal.type === 'daily_time') {
            currentVal = todayStudyMinutes;
          }

          const percent = Math.min(100, Math.round((currentVal / goal.targetValue) * 100));
          const isDone = percent >= 100 || goal.completed;

          return (
            <GlassCard
              key={goal.id}
              padding="lg"
              className={`flex flex-col justify-between group relative overflow-hidden transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Target className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar & Numerical Metrics */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {currentVal} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDone
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isDone ? '🎉 ¡Objetivo completado!' : 'En progreso'}
                </span>

                <GlassButton
                  variant={isDone ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleIncrement(goal)}
                  icon={isDone ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {isDone ? 'Logrado' : `+1 ${goal.unit}`}
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingGoal}
      />
    </div>
  );
};
