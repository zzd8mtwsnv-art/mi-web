import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckSquare,
  FileText,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRelativeDayString } from '../../utils/dateUtils';

export const CommandPalette: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, tasks, exams, subjects, plans, setActiveView } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const normalized = query.trim().toLowerCase();

  const filteredTasks = normalized
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(normalized) ||
          t.description?.toLowerCase().includes(normalized)
      )
    : tasks.slice(0, 3);

  const filteredExams = normalized
    ? exams.filter(
        (e) =>
          e.title.toLowerCase().includes(normalized) ||
          e.topics?.toLowerCase().includes(normalized)
      )
    : exams.slice(0, 3);

  const filteredSubjects = normalized
    ? subjects.filter((s) => s.name.toLowerCase().includes(normalized))
    : subjects.slice(0, 4);

  const filteredPlans = normalized
    ? plans.filter((p) => p.title.toLowerCase().includes(normalized))
    : [];

  const handleSelect = (view: string) => {
    setActiveView(view);
    setIsSearchOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-md"
        />

        {/* Floating Spotlight Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl z-10 bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-3xl rounded-3xl border border-white/60 dark:border-white/15 shadow-2xl shadow-indigo-500/10 overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/60 dark:border-white/10">
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar asignaturas, tareas, exámenes..."
              className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Subjects Section */}
            {filteredSubjects.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-3 block mb-2">
                  Asignaturas
                </span>
                <div className="space-y-1">
                  {filteredSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleSelect('subjects')}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: sub.color }}
                          className="w-3 h-3 rounded-full shadow-sm"
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {sub.name}
                        </span>
                        {sub.classroom && (
                          <span className="text-xs text-slate-400 dark:text-slate-400">
                            • {sub.classroom}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {filteredTasks.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-3 block mb-2">
                  Tareas
                </span>
                <div className="space-y-1">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect('tasks')}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              t.status === 'completada'
                                ? 'line-through text-slate-400 dark:text-slate-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                          <div className="text-xs text-slate-400 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Vence: {getRelativeDayString(t.dueDate)}</span>
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-200/50 dark:bg-slate-700/50 text-[10px]">
                              {t.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exams Section */}
            {filteredExams.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-3 block mb-2">
                  Exámenes
                </span>
                <div className="space-y-1">
                  {filteredExams.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => handleSelect('exams')}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-rose-500">
                            {e.title}
                          </span>
                          <div className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                            Fecha: {getRelativeDayString(e.date)} • {e.time || 'Hora por definir'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {getRelativeDayString(e.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans / Cronogramas Section */}
            {filteredPlans.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-3 block mb-2">
                  Planes y Cronogramas
                </span>
                <div className="space-y-1">
                  {filteredPlans.map((p) => {
                    const sub = subjects.find((s) => s.id === p.subjectId);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('cronograma')}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-teal-50/70 dark:hover:bg-teal-950/40 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-500">
                              {p.title}
                            </span>
                            <div className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                              {sub ? `Materia: ${sub.name} • ` : ''}{(p.sessions?.length || p.milestones?.length || 0)} sesiones
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform group-hover:translate-x-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredSubjects.length === 0 && filteredTasks.length === 0 && filteredExams.length === 0 && filteredPlans.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No se encontraron resultados para &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Usa ↑ ↓ para navegar</span>
            <span>ESC para cerrar</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
